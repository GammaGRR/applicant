import { statisticsConfig } from './constants';

type Props = {
  stats: Record<string, number>;
};

export function DashboardStatsSection({ stats }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h2 className="font-semibold text-gray-800 text-sm mb-4">Статистика</h2>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3">
        {statisticsConfig.map((item, index) => (
          <div key={index} className={`${item.colorBlock} rounded-xl px-4 py-4 sm:py-5`}>
            <p className={`text-xs sm:text-sm ${item.colorText} leading-snug`}>{item.lable}</p>
            <p className={`text-3xl sm:text-4xl font-bold mt-1 ${item.colorNum}`}>{stats[item.key] ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
