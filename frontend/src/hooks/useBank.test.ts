import { useQuery } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { useBank } from './useBank';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

describe('useBank', () => {
  it('configures polling every 2000ms', () => {
    useBank();

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['bank', 1],
        refetchInterval: 2000,
      }),
    );
  });
});
