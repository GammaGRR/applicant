const isCountableDocument = (name: string): boolean => {
  const n = String(name ?? '').toLowerCase();
  if (n.includes('фото')) return true;
  if (!n.includes('копи')) return false;
  return (
    n.includes('аттест') ||
    n.includes('паспорт') ||
    n.includes('привив') ||
    n.includes('снилс')
  );
};

export const DocumentsWithCounts = ({
  options,
  value,
  onChange,
  readOnly,
}: {
  options: string[];
  value: unknown;
  onChange: (v: unknown) => void;
  readOnly: boolean;
}) => {
  const selected: string[] = Array.isArray(value)
    ? value
    : Array.isArray((value as { selected?: unknown })?.selected)
      ? ((value as { selected: string[] }).selected)
      : [];
  const counts: Record<string, unknown> =
    value &&
    typeof value === 'object' &&
    (value as { counts?: unknown }).counts &&
    typeof (value as { counts: unknown }).counts === 'object'
      ? ((value as { counts: Record<string, unknown> }).counts)
      : {};

  const toggle = (opt: string) => {
    if (readOnly) return;
    const nextSelected = selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt];
    const nextCounts = { ...counts };
    if (!nextSelected.includes(opt)) delete nextCounts[opt];
    onChange({ selected: nextSelected, counts: nextCounts });
  };

  const setCount = (opt: string, v: string) => {
    if (readOnly) return;
    onChange({ selected, counts: { ...counts, [opt]: v } });
  };

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const checked = selected.includes(opt);
        const countable = isCountableDocument(opt);
        return (
          <div key={opt} className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt)}
                className="accent-blue-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>

            {checked && countable && (
              <div className="pl-6">
                <input
                  inputMode="numeric"
                  placeholder="Кол-во"
                  value={String(counts[opt] ?? '')}
                  onChange={(e) => setCount(opt, e.target.value)}
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
