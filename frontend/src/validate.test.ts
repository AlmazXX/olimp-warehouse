import { validate } from './validate';

describe('validate', () => {
  it('returns error when no person selected', () => {
    expect(validate('10', new Set())).toBe('Please select at least one person');
  });

  it('returns error when amount equals zero', () => {
    expect(validate('0', new Set([1]))).toBe('Amount must not equal 0');
  });

  it('returns error when amount is not finite', () => {
    expect(validate('Infinity', new Set([1]))).toBe('Invalid amount');
  });

  it('returns error when selected count is greater than 100', () => {
    const selected = new Set(Array.from({ length: 101 }, (_, i) => i + 1));
    expect(validate('10', selected)).toBe('Cannot send more than 100 transactions at once');
  });

  it('returns null for a valid payload', () => {
    expect(validate('-25.5', new Set([1, 2]))).toBeNull();
  });
});
