import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Bank } from "../../common/entities/bank.entity";
import { Transaction, TransactionStatus } from "../../common/entities/transaction.entity";
import { PersonRepository } from "../../common/repositories/person.repository";
import { TransactionRepository } from "../../common/repositories/transaction.repository";
import { sleep } from "../../common/utils/sleep.util";
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
    const person = await this.personRepository.findById(dto.personId);
    if (!person) {
      const { transaction } = await this.transactionRepository.findOrCreate({
        ...dto,
        status: TransactionStatus.FAILED,
        errorMessage: `Person ${dto.personId} not found`,
      });
      return transaction;
    }

    const { transaction, isNew } = await this.transactionRepository.findOrCreate({
      ...dto,
      status: TransactionStatus.PROCESSING,
    });

    if (!isNew) return transaction; // возможна транзакция в статусе processing

    await this.datasource
      .transaction(async (em) => {
        const result = await em
          .createQueryBuilder()
          .update(Bank)
          .set({ balance: () => "balance + :amount" })
          .setParameter("amount", transaction.amount)
          .where("id = :id", { id: dto.bankId })
          .execute();

        if (result.affected === 0) throw new NotFoundException(`Bank ${dto.bankId} not found`);

        await em.update(Transaction, transaction.id, { status: TransactionStatus.SUCCESS });
      })
      .catch(async (error) => {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await this.updateStatusWithRetries(transaction.id, TransactionStatus.FAILED, errorMessage);
        throw error;
      });

    transaction.status = TransactionStatus.SUCCESS;
    return transaction;
  }

  async updateStatusWithRetries(id: number, status: TransactionStatus, errorMessage?: string, retries: number = 3) {
    for (let attempt = 1; attempt < retries; attempt++) {
      try {
        await this.transactionRepository.updateStatus(id, status, errorMessage);
        return;
      } catch (error) {
        this.logger.error(`Failed to update transaction ${id}. Attempt ${attempt}/${retries}`, error);

        if (attempt === retries) {
          this.logger.error(`Giving up on transaction ${id} - will be caught by PROCESSING timeout recovery`);
          return;
        }

        await sleep(100 * attempt);
      }
    }
  }
}
