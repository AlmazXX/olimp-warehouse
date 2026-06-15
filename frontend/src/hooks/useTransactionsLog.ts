import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../api/transactions';

export const useTransactionsLog = (limit = 20) =>
  useQuery({
    queryKey: ['transactions', limit],
    queryFn: () => getTransactions(1, limit),
    refetchInterval: 3000,
  });
