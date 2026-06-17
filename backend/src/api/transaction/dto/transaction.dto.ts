import { ProcessTransactionRequest, ProcessTransactionsBulkRequest } from "@olimp/contracts";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  NotEquals,
  ValidateNested,
} from "class-validator";

export class TransactionDto implements ProcessTransactionRequest {
  @IsInt()
  @Min(1)
  personId: number;

  @IsInt()
  @Min(1)
  bankId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @NotEquals(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  key: string;
}

export class ProcessTransactionsBulkDto implements ProcessTransactionsBulkRequest {
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => TransactionDto)
  transactions: TransactionDto[];
}
