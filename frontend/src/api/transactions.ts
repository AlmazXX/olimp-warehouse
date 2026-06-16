import type { ProcessTransactionsBulkRequest, ProcessTransactionsBulkResponse, TransactionLogItem } from '@olimp/contracts';
import { apiGet, apiPost } from './client';

export const getTransactions = (page = 1, limit = 20) =>
  apiGet<TransactionLogItem[]>(`/v1/transactions?page=${page}&limit=${limit}`);
export const postTransactions = (body: ProcessTransactionsBulkRequest) =>
  apiPost<ProcessTransactionsBulkRequest, ProcessTransactionsBulkResponse>('/v1/transactions', body);
