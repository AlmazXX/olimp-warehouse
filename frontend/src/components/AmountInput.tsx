interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export const AmountInput = ({ value, onChange, disabled, error }: Props) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">Amount per person</label>
    <div className="relative mt-1">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">$</span>
      <input
        type="number"
        min="0.01"
        step="0.01"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder="0.00"
        className={`block w-full rounded-lg border py-2 pl-7 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 ${error ? 'border-red-400' : 'border-gray-300'}`}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);
