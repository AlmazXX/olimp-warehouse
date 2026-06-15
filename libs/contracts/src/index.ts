export type HealthStatus = 'ok';

export interface HealthCheckResponse {
  status: HealthStatus;
}

export enum TransactionStatus {
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface ProcessTransactionRequest {
  personId: number;
  bankId: number;
  amount: number;
  key: string;
}

export interface ProcessTransactionsBulkRequest {
  transactions: ProcessTransactionRequest[];
}

export interface TransactionResult {
  transactionId: number | null;
  key: string;
  personId: number;
  amount: number;
  status: TransactionStatus;
  errorMessage: string | null;
}

export interface ProcessTransactionsBulkResponse {
  transactions: TransactionResult[];
  processingTimeMs: number;
}

export interface BankResponse {
  id: number;
  balance: number;
}

export interface PersonResponse {
  id: number;
  name: string;
}

export interface TransactionLogItem {
  id: number;
  personId: number | null;
  bankId: number | null;
  amount: number;
  status: TransactionStatus;
  errorMessage: string | null;
  createdAt: string;
}
