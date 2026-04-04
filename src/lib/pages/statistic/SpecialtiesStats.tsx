import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BarChart2, RefreshCw, AlertCircle, MoreVertical, FileText } from 'lucide-react';
import type { SpecialtyStatRow, StatsResponse, SortKey } from './types';
import { API_BASE } from './constants';
import { Dash } from './Dash';
import { StatCard } from './StatCard';
import { SkeletonRow } from './SkeletonRow';
import { SpecialtyModal } from './SpecialtyModal';

export const SpecialtiesStats = () => {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('plan');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeSpecialty, setActiveSpecialty] = useState<SpecialtyStatRow | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const dropRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const fetchStats = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/specialities/stats`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
      const json: StatsResponse = await res.json();
      setData({ ...json, specialties: [...(json.specialties || [])] });
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const interval = setInterval(() => void fetchStats(), 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      if (
        dropRef.current &&
        !dropRef.current.contains(e.target as Node) &&
        !Object.values(btnRefs.current).some((b) => b?.contains(e.target as Node))
      )
        setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdown]);

  const openDropdownFor = (code: string) => {
    const btn = btnRefs.current[code];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    let left = rect.left - 140;
    let top = rect.bottom + 4;
    if (left < 8) left = 8;
    if (top + 60 > window.innerHeight - 8) top = rect.top - 64;
    setDropPos({ top, left });
    setOpenDropdown((prev) => (prev === code ? null : code));
  };

  const rows = data?.specialties
    ? [...data.specialties].sort((a, b) => {
        const aVal =
          typeof a[sortKey] === 'number' && isFinite(a[sortKey] as number) ? (a[sortKey] as number) : -1;
        const bVal =
          typeof b[sortKey] === 'number' && isFinite(b[sortKey] as number) ? (b[sortKey] as number) : -1;
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      })
    : [];

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className={`ml-1 text-xs ${sortKey === k ? 'text-gray-700' : 'text-gray-300'}`}>
      {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const Th = ({
    label,
    k,
    className = '',
  }: {
    label: string;
    k?: SortKey;
    className?: string;
  }) => (
    <th
      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap select-none ${k ? 'cursor-pointer hover:text-gray-700' : ''} ${className}`}
      onClick={() => k && handleSort(k)}
    >
      <span className="flex items-center gap-1">
        {label}
        {k && <SortIcon k={k} />}
      </span>
    </th>
  );

  const formatScore = (score: number | null) => {
    if (score !== null && isFinite(score)) return score.toFixed(2);
    return <span className="text-gray-300">—</span>;
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="bg-white sticky top-2 z-10 border border-gray-200 max-w-309 m-auto rounded-2xl shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-4 bg-blue-600 rounded-2xl">
              <BarChart2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Статистика по специальностям</h1>
              <p className="text-xs text-gray-400">Анализ поданных заявлений</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void fetchStats()}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Обновить</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => void fetchStats()}
              className="text-sm font-medium text-red-600 hover:text-red-800 underline"
            >
              Повторить
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Общая статистика</h2>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-5 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-7 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Всего мест" value={data?.totalSeats ?? 0} color="blue" />
              <StatCard label="Подано заявлений" value={data?.totalApplications ?? 0} color="green" />
              <StatCard label="С оригиналами" value={data?.withOriginals ?? 0} color="violet" />
              <StatCard label="СВО" value={data?.withBenefits ?? 0} color="amber" />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Детальная статистика</h2>
              <p className="text-xs text-gray-400 mt-0.5">План набора и поданные документы</p>
            </div>
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Обновлено: {lastUpdated.toLocaleTimeString('ru-RU')}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Специальность
                  </th>
                  <Th label="План" k="plan" className="text-right" />
                  <Th label="Подано" k="submitted" className="text-center" />
                  <Th label="Ориг." k="originals" className="text-center" />
                  <Th label="Копии" k="copies" className="text-center" />
                  <Th label="Ср. балл" k="avgScore" className="text-center" />
                  <Th label="СВО" k="benefit" className="text-center" />
                  <Th label="Мин. (ориг.)" k="minScoreOrig" className="text-center" />
                  <Th label="Мин. (копии)" k="minScoreCopy" className="text-center" />
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : rows.map((s, idx) => (
                      <tr
                        key={s.code}
                        className={`hover:bg-blue-50/30 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{s.name}</div>
                          <div className="text-xs text-gray-400">{s.code}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-700">{s.plan}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-900 text-white text-xs font-bold">
                            {s.submitted}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-green-600">{s.originals}</td>
                        <td className="px-4 py-3 text-center font-semibold text-blue-600">{s.copies}</td>
                        <td className="px-4 py-3 text-center font-mono text-gray-700">
                          {formatScore(s.avgScore)}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400">
                          {s.benefit > 0 ? (
                            <span className="font-medium text-gray-700">{s.benefit}</span>
                          ) : (
                            <Dash />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-gray-400">
                          {formatScore(s.minScoreOrig)}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-gray-400">
                          {formatScore(s.minScoreCopy)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            ref={(el) => {
                              btnRefs.current[s.code] = el;
                            }}
                            onClick={() => openDropdownFor(s.code)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Действия"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {!loading && data && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between text-xs text-gray-400">
              <span>{data.specialties.length} специальностей</span>
              <span>Всего абитуриентов: {data.totalApplications}</span>
            </div>
          )}
        </div>
      </div>

      {openDropdown &&
        createPortal(
          <div className="fixed z-[9998]" style={{ top: dropPos.top, left: dropPos.left }}>
            <div
              ref={dropRef}
              className="bg-white w-44 border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in"
            >
              <button
                type="button"
                onClick={() => {
                  const spec = rows.find((r) => r.code === openDropdown);
                  if (spec) {
                    setActiveSpecialty(spec);
                    setOpenDropdown(null);
                  }
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-blue-500" />
                  <span className="text-sm text-gray-700">Просмотр мест</span>
                </div>
              </button>
            </div>
          </div>,
          document.body,
        )}

      {activeSpecialty && (
        <SpecialtyModal specialty={activeSpecialty} onClose={() => setActiveSpecialty(null)} />
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fade-in 0.15s ease forwards; }
      `}</style>
    </div>
  );
};
