import { TransactionStatus } from '@olimp/contracts';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { useBank } from './hooks/useBank';
import { usePersons } from './hooks/usePersons';
import { useSendTransactions } from './hooks/useSendTransactions';
import { useTransactionsLog } from './hooks/useTransactionsLog';

vi.mock('./hooks/useBank');
vi.mock('./hooks/usePersons');
vi.mock('./hooks/useTransactionsLog');
vi.mock('./hooks/useSendTransactions');

describe('App', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValue('uuid-1') });
    mutate.mockReset();

    (useBank as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { id: 1, balance: 100000 },
      isLoading: false,
    });
    (usePersons as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: 1, name: 'Alice Johnson' }],
      isLoading: false,
    });
    (useTransactionsLog as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useSendTransactions as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate,
      isPending: false,
    });
  });

  it('sends selected persons as a batch and shows result summary', async () => {
    mutate.mockImplementation((_payload, options) => {
      options.onSuccess({
        transactions: [
          {
            transactionId: 1,
            key: 'uuid-1',
            personId: 1,
            amount: 10,
            status: TransactionStatus.SUCCESS,
            errorMessage: null,
          },
        ],
        processingTimeMs: 7,
      });
    });

    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText('Alice Johnson'));
    await user.type(screen.getByRole('spinbutton'), '10');
    await user.click(screen.getByRole('button', { name: 'Send 1 transaction' }));

    expect(mutate).toHaveBeenCalledWith(
      {
        transactions: [{ personId: 1, bankId: 1, amount: 10, key: 'uuid-1' }],
      },
      expect.any(Object),
    );
    expect(screen.getByText('Last batch result')).toBeInTheDocument();
  });

  it('shows validation error for zero amount and does not send request', async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText('Alice Johnson'));
    await user.type(screen.getByRole('spinbutton'), '0');
    await user.click(screen.getByRole('button', { name: 'Send 1 transaction' }));

    expect(screen.getByText('Amount must not equal 0')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });
});
