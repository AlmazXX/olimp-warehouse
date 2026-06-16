import { ProcessTransactionsBulkResponse, TransactionStatus } from '@olipm/contracts';
import { useMemo } from 'react';

interface Props {
  result: ProcessTransactionsBulkResponse;
}

export const ResultSummary = ({ result }: Props) => {
  const { succeeded, failed, errors } = useMemo(() => {
    let succeeded = 0,
      failed = 0,
      errors = [];

    for (const t of result.transactions) {
      if (t.status === TransactionStatus.SUCCESS) succeeded++;
      else if (t.status === TransactionStatus.FAILED) failed++;
      if (t.errorMessage) errors.push(t);
    }

    return { succeeded, failed, errors };
  }, [result.transactions]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Last batch result</h3>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
          {result.processingTimeMs} ms
        </span>
      </div>
      <div className="mt-3 flex gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{succeeded}</p>
          <p className="text-xs text-gray-500">Success</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{failed}</p>
          <p className="text-xs text-gray-500">Failed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{result.transactions.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>
      {errors.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3">
          {errors.map((t, i) => (
            <li key={t.transactionId ?? i} className="truncate text-xs text-red-600">
              #{t.transactionId ?? '—'} {t.errorMessage}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
