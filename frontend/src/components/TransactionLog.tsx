import { TransactionLogItem, TransactionStatus } from '@olipm/contracts';

interface Props {
  transactions: TransactionLogItem[];
  isLoading: boolean;
}

const statusStyles = {
  [TransactionStatus.SUCCESS]: 'bg-green-100 text-green-700',
  [TransactionStatus.FAILED]: 'bg-red-100 text-red-700',
  [TransactionStatus.PROCESSING]: 'bg-yellow-100 text-yellow-700',
};

export const TransactionLog = ({ transactions, isLoading }: Props) => (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="border-b border-gray-100 px-5 py-3">
      <h3 className="text-sm font-semibold text-gray-700">Recent transactions</h3>
    </div>
    <div className="divide-y divide-gray-50 overflow-y-auto max-h-[400px]">
      {isLoading && transactions.length === 0 ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="p-4 text-center text-sm text-gray-400">No transactions yet</p>
      ) : (
        transactions.map(t => (
          <div key={t.id} className="flex items-center gap-3 px-5 py-2.5">
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[t.status]}`}>
              {t.status}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-gray-600">Person {t.personId ?? '—'}</span>
            <span className="shrink-0 text-sm font-semibold text-gray-900">${Number(t.amount).toFixed(2)}</span>
            <span className="shrink-0 text-xs text-gray-400">{new Date(t.createdAt).toLocaleTimeString()}</span>
          </div>
        ))
      )}
    </div>
  </div>
);
