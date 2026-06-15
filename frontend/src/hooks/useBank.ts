import { useQuery } from '@tanstack/react-query';
import { getBank } from '../api/banks';

const BANK_ID = Number(import.meta.env.VITE_BANK_ID);

export const useBank = () =>
  useQuery({
    queryKey: ['bank', BANK_ID],
    queryFn: () => getBank(BANK_ID),
    refetchInterval: 2000,
  });
