interface Props {
  onClick: () => void;
  disabled?: boolean;
  isPending?: boolean;
  selectedCount: number;
}

export const SendButton = ({ onClick, disabled, isPending, selectedCount }: Props) => {
  const label =
    selectedCount > 0 ? `Send ${selectedCount} transaction${selectedCount === 1 ? '' : 's'}` : 'Send transactions';
  
    return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isPending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
      {isPending ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Sending...
        </>
      ) : (
        label
      )}
    </button>
  );
};
