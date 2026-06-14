import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { TransactionDto } from "src/api/transaction/dto/transaction.dto";
import { AppConfig } from "src/setup/config/config.schema";
import { QueryFailedError, Repository } from "typeorm";
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

  create(
    dto: Omit<TransactionDto, "personId" | "bankId"> & {
      status: TransactionStatus;
      personId?: number | null;
      bankId?: number | null;
      errorMessage?: string;
    },
  ) {
    const transaction = this.transactionRepo.create({
      personId: dto.personId ?? null,
      bankId: dto.bankId ?? null,
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

  async createFailedOrExisting(
    dto: Omit<TransactionDto, "personId" | "bankId"> & {
      personId?: number | null;
      bankId?: number | null;
      errorMessage: string;
    },
  ) {
    const existing = await this.findByKey(dto.key);
    if (existing) return existing;

    try {
      return await this.create({ ...dto, status: TransactionStatus.FAILED });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        const existing = await this.findByKey(dto.key);
        if (existing) return existing;
      }
      throw error;
    }
  }

  async updateStatus(id: number, status: TransactionStatus, errorMessage?: string) {
    await this.transactionRepo.update(id, {
      status,
      ...(errorMessage && { errorMessage }),
    });
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;

    const driverError: unknown = error.driverError;
    if (typeof driverError !== "object" || driverError === null || !("code" in driverError)) return false;

    return driverError.code === "23505";
  }
}
