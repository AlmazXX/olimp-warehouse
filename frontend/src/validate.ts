export const validate = (amount: string, selected: Set<number>): string | null => {
  if (selected.size === 0) return 'Please select at least one person';

  const n = Number(amount);

  if (isNaN(n) || n === 0) return 'Amount must not equal 0';
  if (!Number.isFinite(n)) return 'Invalid amount';
  if (selected.size > 100) return 'Cannot send more than 100 transactions at once';

  return null;
};
