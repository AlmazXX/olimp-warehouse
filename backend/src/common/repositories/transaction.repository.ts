import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { TransactionDto } from "../../api/transaction/dto/create-transactions-bulk.dto";
import { AppConfig } from "../../setup/config/config.schema";
import { Transaction, TransactionStatus } from "../entities/transaction.entity";

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async findByKey(key: string): Promise<Transaction | null> {
    return this.transactionRepo.findOne({ where: { key } });
  }

  create(dto: TransactionDto & { status: TransactionStatus; errorMessage?: string }) {
    const transaction = this.transactionRepo.create({
      personId: dto.personId,
      bankId: dto.bankId,
      amount: dto.amount,
      status: dto.status,
      key: dto.key,
      errorMessage: dto.errorMessage,
    });
    return this.transactionRepo.save(transaction);
  }

  async findOrCreate(
    dto: TransactionDto & { status: TransactionStatus; errorMessage?: string },
  ): Promise<{ transaction: Transaction; isNew: boolean }> {
    const existing = await this.findByKey(dto.key);
    if (existing) {
      if (existing.status !== TransactionStatus.PROCESSING) return { transaction: existing, isNew: false };

      const isStuck =
        Date.now() - existing.createdAt.getTime() >
        this.config.get("transactions.processingTimeoutMs", { infer: true });

      if (!isStuck) return { transaction: existing, isNew: false };

      const { affected } = await this.transactionRepo.update(
        {
          id: existing.id,
          status: TransactionStatus.PROCESSING,
        },
        { createdAt: new Date() },
      );

      if (affected === 0) return { transaction: existing, isNew: false };
      return { transaction: existing, isNew: true };
    }

    try {
      const transaction = await this.create(dto);
      return { transaction, isNew: true };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        const existing = await this.findByKey(dto.key);
        if (existing) return { transaction: existing, isNew: false };
      }
      throw error;
    }
  }

  async updateStatus(id: number, status: TransactionStatus, errorMessage?: string) {
    const { affected } = await this.transactionRepo.update(id, {
      status,
      ...(errorMessage && { errorMessage }),
    });
    return (affected ?? 0) > 0;
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;

    const driverError: unknown = error.driverError;
    if (typeof driverError !== "object" || driverError === null || !("code" in driverError)) return false;

    return driverError.code === "23505";
  }
}
