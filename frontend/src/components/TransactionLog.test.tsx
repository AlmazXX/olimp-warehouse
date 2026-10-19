import { TransactionStatus, type TransactionLogItem } from '@olimp/contracts';
import { render, screen } from '@testing-library/react';
import { TransactionLog } from './TransactionLog';

describe('TransactionLog', () => {
  it('shows empty state', () => {
    render(<TransactionLog transactions={[]} isLoading={false} />);
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
  });

  it('renders statuses and transaction rows', () => {
    const transactions: TransactionLogItem[] = [
      {
        id: 1,
        personId: 1,
        bankId: 1,
        amount: 10,
        status: TransactionStatus.SUCCESS,
        errorMessage: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        personId: 2,
        bankId: 1,
        amount: -20,
        status: TransactionStatus.FAILED,
        errorMessage: 'Insufficient bank funds',
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        personId: null,
        bankId: 1,
        amount: 3,
        status: TransactionStatus.PROCESSING,
        errorMessage: null,
        createdAt: new Date().toISOString(),
      },
    ];

    render(<TransactionLog transactions={transactions} isLoading={false} />);

    expect(screen.getByText(TransactionStatus.SUCCESS)).toBeInTheDocument();
    expect(screen.getByText(TransactionStatus.FAILED)).toBeInTheDocument();
    expect(screen.getByText(TransactionStatus.PROCESSING)).toBeInTheDocument();
    expect(screen.getByText('Person 1')).toBeInTheDocument();
    expect(screen.getByText('Person 2')).toBeInTheDocument();
  });
});
