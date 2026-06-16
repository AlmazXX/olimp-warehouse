import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ProcessTransactionsBulkResponse, TransactionResult, TransactionStatus } from "@olimp/contracts";
import { performance } from "node:perf_hooks";
import { Bank } from "src/common/entities/bank.entity";
import { Transaction } from "src/common/entities/transaction.entity";
import { BankRepository } from "src/common/repositories/bank.repository";
import { PersonRepository } from "src/common/repositories/person.repository";
import { TransactionRepository } from "src/common/repositories/transaction.repository";
import { runWithConcurrency } from "src/common/utils/concurrency.util";
import { sleep } from "src/common/utils/sleep.util";
import { AppConfig } from "src/setup/config/config.schema";
import { DataSource } from "typeorm";
import { GetTransactionsDto, GetTransactionsResponseDto } from "./dto/get-transactions.dto";
import { ProcessTransactionsBulkDto, TransactionDto } from "./dto/transaction.dto";

const getTransactionErrorMessage = (transaction: Pick<Transaction, "errorMessage">): string | null => {
  const { errorMessage } = transaction;
  return errorMessage ?? null;
};

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly datasource: DataSource,
    private readonly transactionRepository: TransactionRepository,
    private readonly personRepository: PersonRepository,
    private readonly bankRepository: BankRepository,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async get(pagination: GetTransactionsDto) {
    return this.transactionRepository.find(pagination).then((res) => res.map((t) => new GetTransactionsResponseDto(t)));
  }

  async processTransactionsBulk({
    transactions,
  }: ProcessTransactionsBulkDto): Promise<ProcessTransactionsBulkResponse> {
    const start = performance.now();
    const concurrencyLimit = this.config.get("transactions.concurrencyLimit", { infer: true });
    const ordered = transactions
      .map((dto, originalIndex) => ({ dto, originalIndex }))
      .sort((a, b) => a.dto.bankId - b.dto.bankId);

    const settled = await runWithConcurrency(ordered, concurrencyLimit, ({ dto }) => this.processTransaction(dto));
    const response = new Array<TransactionResult>(transactions.length);

    settled.forEach((result, i) => {
      const { dto, originalIndex } = ordered[i];
      response[originalIndex] = this.toResult(result, dto);
    });

    return { transactions: response, processingTimeMs: Math.round(performance.now() - start) };
  }

  async processTransaction(dto: TransactionDto): Promise<Transaction> {
    const [person, bank] = await Promise.all([
      this.personRepository.findById(dto.personId),
      this.bankRepository.findById(dto.bankId),
    ]);

    if (!person && !bank) {
      return this.transactionRepository.createFailedOrExisting({
        ...dto,
        personId: null,
        bankId: null,
        errorMessage: `Person ${dto.personId} and bank ${dto.bankId} not found`,
      });
    }

    if (!person) {
      return this.transactionRepository.createFailedOrExisting({
        ...dto,
        personId: null,
        errorMessage: `Person ${dto.personId} not found`,
      });
    }

    if (!bank) {
      return this.transactionRepository.createFailedOrExisting({
        ...dto,
        bankId: null,
        errorMessage: `Bank ${dto.bankId} not found`,
      });
    }

    const { transaction, isNew } = await this.transactionRepository.findOrCreate({
      ...dto,
      status: TransactionStatus.PROCESSING,
    });

    if (!isNew) return transaction;

    try {
      await this.datasource.transaction(async (em) => {
        const result = await em
          .createQueryBuilder()
          .update(Bank)
          .set({ balance: () => "balance + :amount" })
          .setParameter("amount", transaction.amount)
          .where("id = :id", { id: dto.bankId })
          .andWhere("balance + :amount >= 0", { amount: transaction.amount })
          .execute();

        if (result.affected === 0) {
          const bankExists = await em.existsBy(Bank, { id: dto.bankId });
          if (bankExists) throw new Error(`Insufficient bank funds: balance for bank ${dto.bankId} cannot go below 0`);

          throw new Error(`Bank ${dto.bankId} not found`);
        }

        await em.update(Transaction, transaction.id, { status: TransactionStatus.SUCCESS });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await this.updateStatusWithRetries(transaction.id, TransactionStatus.FAILED, errorMessage);
      throw error;
    }

    transaction.status = TransactionStatus.SUCCESS;
    return transaction;
  }

  private async updateStatusWithRetries(
    id: number,
    status: TransactionStatus,
    errorMessage?: string,
    retries: number = 3,
  ) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.transactionRepository.updateStatus(id, status, errorMessage);
        return;
      } catch (error) {
        this.logger.error(`Failed to update transaction ${id}. Attempt ${attempt}/${retries}`, error);

        if (attempt === retries) {
          return this.logger.error(`Giving up on transaction ${id} - will be caught by PROCESSING timeout recovery`);
        }

        await sleep(100 * attempt);
      }
    }
  }

  private toResult(result: PromiseSettledResult<Transaction>, dto: TransactionDto): TransactionResult {
    if (result.status === "fulfilled") {
      const transaction = result.value;
      return {
        transactionId: transaction.id,
        key: dto.key,
        personId: dto.personId,
        amount: dto.amount,
        status: transaction.status,
        errorMessage: getTransactionErrorMessage(transaction),
      };
    }

    return {
      transactionId: null,
      key: dto.key,
      personId: dto.personId,
      amount: dto.amount,
      status: TransactionStatus.FAILED,
      errorMessage: result.reason instanceof Error ? result.reason.message : "Unknown error",
    };
  }
}
