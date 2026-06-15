import { ProcessTransactionsBulkResponse } from '@olipm/contracts';
import { useState } from 'react';
import { AmountInput } from './components/AmountInput';
import { BalanceCard } from './components/BalanceCard';
import { PersonSelector } from './components/PersonSelector';
import { ResultSummary } from './components/ResultSummary';
import { SendButton } from './components/SendButton';
import { TransactionLog } from './components/TransactionLog';
import { useBank } from './hooks/useBank';
import { usePersons } from './hooks/usePersons';
import { useSendTransactions } from './hooks/useSendTransactions';
import { useTransactionsLog } from './hooks/useTransactionsLog';

const BANK_ID = Number(import.meta.env.VITE_BANK_ID);

const validate = (amount: string, selected: Set<number>): string | null => {
  if (selected.size === 0) return 'Please select at least one person';

  const n = Number(amount);

  if (isNaN(n) || n < 0) return 'Amount must be greater than 0';
  if (!Number.isFinite(n)) return 'Invalid amount';
  if (selected.size > 100) return 'Cannot send more than 100 transactions at once';

  return null;
};

export default () => {
  const [selected, setSelected] = useState(new Set<number>());
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ProcessTransactionsBulkResponse | null>(null);

  const { data: bank, isLoading: bankLoading } = useBank();
  const { data: persons = [], isLoading: personsLoading } = usePersons();
  const { data: transactions = [], isLoading: txLoading } = useTransactionsLog();
  const { mutate: sendTransactions, isPending } = useSendTransactions();

  const handleSend = () => {
    const error = validate(amount, selected);

    if (error) return setValidationError(error);
    setValidationError(null);

    const parsedAmount = Number(amount);
    const transactions = Array.from(selected, personId => ({
      personId,
      bankId: BANK_ID,
      amount: parsedAmount,
      key: crypto.randomUUID(),
    }));

    sendTransactions(
      { transactions },
      {
        onSuccess: data => {
          setLastResult(data);
          setSelected(new Set());
          setAmount('');
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">OLIPM Warehouse — Transactions</h1>
      </header>

      <main className="mx-auto max-w-5xl gap-6 p-6 lg:grid lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-5">
          <BalanceCard bank={bank} isLoading={bankLoading} />

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Send transactions</h2>

            {personsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-7 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : (
              <PersonSelector persons={persons} selected={selected} onChange={setSelected} disabled={isPending} />
            )}

            <div className="mt-4">
              <AmountInput
                value={amount}
                onChange={v => {
                  setAmount(v);
                  setValidationError(null);
                }}
                disabled={isPending}
                error={validationError ?? undefined}
              />
            </div>

            <div className="mt-4">
              <SendButton
                onClick={handleSend}
                isPending={isPending}
                disabled={selected.size === 0 || !amount}
                selectedCount={selected.size}
              />
            </div>
          </div>

          {lastResult && <ResultSummary result={lastResult} />}
        </div>

        <div className="mt-5 lg:mt-0">
          <TransactionLog transactions={transactions} isLoading={txLoading} />
        </div>
      </main>
    </div>
  );
};
