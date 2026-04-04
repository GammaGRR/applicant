import type { StatColor } from './types';

const styles: Record<StatColor, { bg: string; label: string }> = {
  blue: { bg: 'bg-blue-50', label: 'text-blue-600' },
  green: { bg: 'bg-green-50', label: 'text-green-600' },
  violet: { bg: 'bg-purple-50', label: 'text-purple-600' },
  amber: { bg: 'bg-orange-50', label: 'text-orange-600' },
};

export const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: StatColor;
}) => {
  const s = styles[color];
  return (
    <div className={`${s.bg} rounded-xl p-5 flex flex-col gap-2 border border-gray-100`}>
      <div className={`text-sm font-medium ${s.label}`}>{label}</div>
      <div className="text-3xl font-bold text-gray-900">{value.toLocaleString('ru-RU')}</div>
    </div>
  );
};
