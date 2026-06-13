import { Injectable, Logger } from "@nestjs/common";
import { Bank } from "src/common/entities/bank.entity";
import { Transaction, TransactionStatus } from "src/common/entities/transaction.entity";
import { BankRepository } from "src/common/repositories/bank.repository";
import { PersonRepository } from "src/common/repositories/person.repository";
import { TransactionRepository } from "src/common/repositories/transaction.repository";
import { sleep } from "src/common/utils/sleep.util";
import { DataSource } from "typeorm";
import { ProcessTransactionsBulkDto, TransactionDto } from "./dto/create-transactions-bulk.dto";

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
  ) {}

  async processTransactionsBulk({ transactions }: ProcessTransactionsBulkDto) {
    const results = await Promise.allSettled(
      transactions.sort((a, b) => a.bankId - b.bankId).map((t) => this.processTransaction(t)),
    );

    return results.map((r, i) => {
      const dto = transactions[i];

      if (r.status === "fulfilled") {
        const transaction = r.value;

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
        errorMessage: r.reason instanceof Error ? r.reason.message : "Unknown error",
      };
    });
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

  async updateStatusWithRetries(id: number, status: TransactionStatus, errorMessage?: string, retries: number = 3) {
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
}
