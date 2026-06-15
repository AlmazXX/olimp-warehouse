import { BankResponse } from '@olipm/contracts';
import { useEffect, useRef, useState } from 'react';

interface Props {
  bank: BankResponse | undefined;
  isLoading: boolean;
}

export const BalanceCard = ({ bank, isLoading }: Props) => {
  const [flash, setFlash] = useState(false);
  const prevBalance = useRef<number | undefined>(undefined);
  const balance = bank?.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  useEffect(() => {
    if (bank && prevBalance.current !== undefined && prevBalance.current !== bank.balance) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 8000);
      return () => clearTimeout(t);
    }
    prevBalance.current = bank?.balance;
  }, [bank?.balance]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">Bank Balance</p>
      {isLoading && bank === undefined ? (
        <div className="mt-2 h-9 w-40 animate-pulse rounded bg-gray-100" />
      ) : (
        <p
          className={
            'mt-1 text-4xl font-bold tabular-nums transition-colors duration-300 ' +
            (flash ? 'text-green-600' : 'text-gray-900')
          }>
          {balance}
        </p>
      )}
    </div>
  );
};
