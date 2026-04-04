import { X, Plus } from 'lucide-react';

export const OptionsEditor = ({
  options,
  onChange,
}: {
  options: string[];
  onChange: (opts: string[]) => void;
}) => {
  const addOption = () => onChange([...options, '']);
  const updateOption = (i: number, val: string) =>
    onChange(options.map((o, idx) => (idx === i ? val : o)));
  const removeOption = (i: number) => onChange(options.filter((_, idx) => idx !== i));

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">Варианты</p>
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Вариант ${i + 1}`}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
        >
          <Plus size={13} />
          Добавить вариант
        </button>
      </div>
    </div>
  );
};
