import { useQuery } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { useTransactionsLog } from './useTransactionsLog';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

describe('useTransactionsLog', () => {
  it('configures polling every 3000ms', () => {
    useTransactionsLog(20);

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['transactions', 20],
        refetchInterval: 3000,
      }),
    );
  });
});
