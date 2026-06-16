import { PersonResponse } from '@olimp/contracts';

interface Props {
  persons: PersonResponse[];
  selected: Set<number>;
  onChange: (selected: Set<number>) => void;
  disabled?: boolean;
}

export const PersonSelector = ({ persons, selected, onChange, disabled }: Props) => {
  const personIds = persons.map(p => p.id);
  const allSelected = personIds.length > 0 && personIds.every(id => selected.has(id));

  const toggleAll = () => {
    onChange(allSelected ? new Set() : new Set(personIds));
  };

  const toggle = (id: number) => {
    const next = new Set(selected);

    if (next.has(id)) next.delete(id);
    else next.add(id);

    onChange(next);
  };

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-50">
        <input
          type="checkbox"
          className="h-4 w-4 rounded accent-blue-600"
          checked={allSelected}
          onChange={toggleAll}
          disabled={disabled}
        />
        <span className="text-sm font-semibold text-gray-700">Select all</span>
      </label>
      <div className="border-t border-gray-100 pt-2">
        {persons.map(p => (
          <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-blue-600"
              checked={selected.has(p.id)}
              onChange={() => toggle(p.id)}
              disabled={disabled}
            />
            <span className="text-sm text-gray-800">{p.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
