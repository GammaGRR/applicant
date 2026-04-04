import { parseBenefits } from './utils';

export function BenefitBadges({ value }: { value: string | string[] | null | undefined }) {
  if (!value) return <span className="text-gray-400">—</span>;
  const items = parseBenefits(value);
  if (items.length === 0) return <span className="text-gray-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center bg-amber-50 text-amber-800 border border-amber-200 rounded px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
