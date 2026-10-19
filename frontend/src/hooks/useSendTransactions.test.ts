import { useMutation, useQueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { useSendTransactions } from './useSendTransactions';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

describe('useSendTransactions', () => {
  it('invalidates bank and transactions queries on success', async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    (useQueryClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ invalidateQueries });

    const captured: { onSuccess?: () => void } = {};
    (useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((options) => {
      captured.onSuccess = options.onSuccess;
      return { mutate: vi.fn() };
    });

    useSendTransactions();
    await captured.onSuccess?.();

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['bank'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['transactions'], exact: false });
  });
});
