export class TransactionDto {
  personId: number;
  bankId: number;
  amount: number;
  key: string;
}

export class ProcessTransactionsBulkDto {
  transactions: TransactionDto[];
}
