import { TransactionLogItem, TransactionStatus } from "@olipm/contracts";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Transaction } from "src/common/entities/transaction.entity";

export class GetTransactionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}

export class GetTransactionsResponseDto implements TransactionLogItem {
  id: number;
  personId: number | null;
  bankId: number | null;
  amount: number;
  status: TransactionStatus;
  errorMessage: string | null;
  createdAt: string;

  constructor(t: Transaction) {
    this.id = t.id;
    this.personId = t.personId;
    this.bankId = t.bankId;
    this.amount = t.amount;
    this.status = t.status;
    this.errorMessage = t.errorMessage;
    this.createdAt = t.createdAt.toISOString();
  }
}
