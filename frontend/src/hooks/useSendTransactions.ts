import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postTransactions } from '../api/transactions';

export const useSendTransactions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postTransactions,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bank'] });
      void queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false });
    },
  });
};
