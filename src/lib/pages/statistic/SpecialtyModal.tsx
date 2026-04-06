import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Search,
  FileText,
  Star,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  AlertCircle,
} from 'lucide-react';
import type { SpecialtyStatRow, StatApplicant } from './types';
import { API_BASE } from './constants';

type Props = {
  specialty: SpecialtyStatRow;
  onClose: () => void;
};

type LookupResponse = {
  total: number;
  found: boolean;
  rank?: number;
  applicant?: StatApplicant;
};

export const SpecialtyModal = ({ specialty, onClose }: Props) => {
  const [totalInSpec, setTotalInSpec] = useState(0);
  const [lookupApplicant, setLookupApplicant] = useState<StatApplicant | null>(null);
  const [lookupRank, setLookupRank] = useState<number | null>(null);
  const [lookupFound, setLookupFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 180);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;

    const run = async (caseNumber: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('code', specialty.code ?? '');
        params.set('name', specialty.name ?? '');
        if (caseNumber) params.set('caseNumber', caseNumber);
        const res = await fetch(
          `${API_BASE}/specialities/stats/competition-lookup?${params.toString()}`,
          { cache: 'no-store', signal: ac.signal },
        );
        if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
        const data = (await res.json()) as LookupResponse;
        if (cancelled || ac.signal.aborted) return;
        setTotalInSpec(data.total ?? 0);
        if (!caseNumber) {
          setLookupFound(false);
          setLookupApplicant(null);
          setLookupRank(null);
        } else {
          setLookupFound(!!data.found);
          setLookupRank(data.found && data.rank != null ? data.rank : null);
          setLookupApplicant(data.found && data.applicant ? data.applicant : null);
        }
      } catch (e: unknown) {
        if ((e as Error).name === 'AbortError') return;
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Не удалось загрузить данные');
        }
      } finally {
        if (!cancelled && !ac.signal.aborted) setLoading(false);
      }
    };

    const trimmed = search.trim();
    if (!trimmed) {
      void run('');
      return () => {
        cancelled = true;
        ac.abort();
      };
    }

    const timer = window.setTimeout(() => void run(trimmed), 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      ac.abort();
    };
  }, [search, specialty.code, specialty.name]);

  const hasOriginal = (a: StatApplicant) =>
    a.documents?.some((d) => {
      const name = d.name.toLowerCase();
      const ok = !d.status || ['done', 'verified', 'approved', 'confirmed'].includes(d.status);
      return ok && name.includes('аттестат') && (name.includes('ориг') || name.includes('оригинал'));
    });

  const hasCopy = (a: StatApplicant) =>
    a.documents?.some((d) => {
      const name = d.name.toLowerCase();
      const ok = !d.status || ['done', 'verified', 'approved', 'confirmed'].includes(d.status);
      return ok && name.includes('аттестат') && (name.includes('копия') || name.includes('копи'));
    });

  const isSvo = (a: StatApplicant) => {
    const str = String(a.benefit || '')
      .toLowerCase()
      .trim();
    return str === 'сво' || str === 'сво.' || str.includes('специальная военная операция');
  };

  const docTag = (a: StatApplicant) => {
    if (hasOriginal(a))
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle2 size={10} /> Оригинал
        </span>
      );
    if (hasCopy(a))
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <Copy size={10} /> Копия
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
        <AlertTriangle size={10} /> Нет
      </span>
    );
  };

  const found = lookupFound && lookupApplicant ? lookupApplicant : null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={handleClose}>
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        style={{
          animation: closing ? 'fadeOut 0.18s ease forwards' : 'fadeIn 0.18s ease forwards',
        }}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[88vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          animation: closing ? 'scaleOut 0.18s ease forwards' : 'scaleIn 0.18s ease forwards',
        }}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 p-2.5 bg-blue-600 rounded-xl">
                <FileText size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate">{specialty.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {specialty.code} · Бюджетных мест: {specialty.plan}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: 'Подано', val: specialty.submitted, cls: 'bg-gray-900 text-white' },
              { label: 'Оригиналов', val: specialty.originals, cls: 'bg-green-100 text-green-700' },
              { label: 'Копий', val: specialty.copies, cls: 'bg-blue-100 text-blue-700' },
              { label: 'СВО', val: specialty.benefit, cls: 'bg-orange-100 text-orange-700' },
            ].map((b) => (
              <span
                key={b.label}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${b.cls}`}
              >
                {b.label}: {b.val}
              </span>
            ))}
            {specialty.avgScore !== null && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                <Star size={10} /> Ср. балл: {specialty.avgScore.toFixed(2)}
              </span>
            )}
          </div>

          <div className="relative mt-4">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Введите точный № дела..."
              className="w-full pl-8 pr-10 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100"
              >
                <X size={12} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col gap-3 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <div className="m-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && !search.trim() && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <Search size={32} className="opacity-20" />
              <p className="text-sm font-medium">Введите номер дела для поиска</p>
              <p className="text-xs text-gray-300">Поиск выполняется по точному совпадению</p>
            </div>
          )}

          {!loading && !error && search.trim() && !found && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <AlertTriangle size={32} className="opacity-20" />
              <p className="text-sm font-medium">Абитуриент не найден</p>
              <p className="text-xs text-gray-300 font-mono">«{search.trim()}»</p>
            </div>
          )}

          {!loading && !error && found && (
            <div className="p-6">
              <div className="rounded-2xl border border-blue-100 overflow-hidden">
                <div className="px-5 py-3 bg-blue-600 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-white opacity-90" />
                  <span className="text-xs font-semibold text-white tracking-wide uppercase">
                    Абитуриент найден
                  </span>
                </div>
                <div className="bg-blue-50/40 px-5 py-4 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-base">{found.fullName || '—'}</span>
                        {isSvo(found) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 uppercase tracking-wide">
                            СВО
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-mono mt-0.5 block">
                        № дела: <span className="text-gray-700 font-semibold">{found.caseNumber}</span>
                      </span>
                    </div>
                    <div className="shrink-0">{docTag(found)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                      <div className="text-xs text-gray-400 mb-1">Балл</div>
                      <div className="font-mono font-bold text-gray-800 text-lg">
                        {found.point !== null && found.point !== undefined
                          ? typeof found.point === 'number'
                            ? found.point.toFixed(2)
                            : found.point
                          : '—'}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                      <div className="text-xs text-gray-400 mb-1">Финансирование</div>
                      <div className="font-medium text-gray-800 text-sm">{found.finance || '—'}</div>
                    </div>
                  </div>
                  <div
                    className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                      lookupRank && lookupRank <= specialty.plan
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Место в конкурсе</div>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`font-bold text-2xl font-mono ${
                            lookupRank && lookupRank <= specialty.plan ? 'text-green-700' : 'text-red-600'
                          }`}
                        >
                          {lookupRank ?? '—'}
                        </span>
                        <span className="text-xs text-gray-400">из {totalInSpec}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Trophy
                        size={22}
                        className={lookupRank && lookupRank <= specialty.plan ? 'text-green-400' : 'text-red-300'}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          lookupRank && lookupRank <= specialty.plan ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {lookupRank && lookupRank <= specialty.plan
                          ? `Проходит (план: ${specialty.plan})`
                          : `Не проходит (план: ${specialty.plan})`}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                    <div className="text-xs text-gray-400 mb-1">Специальность</div>
                    <div className="font-medium text-gray-800 text-sm">{found.profession || specialty.name}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!loading && !error && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between text-xs text-gray-400">
            <span>Всего в специальности: {totalInSpec}</span>
            {specialty.minScoreOrig !== null && (
              <span>Мин. (ориг.): {specialty.minScoreOrig.toFixed(2)}</span>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeOut  { from { opacity: 1 } to { opacity: 0 } }
        @keyframes scaleIn  { from { opacity: 0; transform: scale(0.96) translateY(8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes scaleOut { from { opacity: 1; transform: scale(1) translateY(0) } to { opacity: 0; transform: scale(0.96) translateY(8px) } }
      `}</style>
    </div>,
    document.body,
  );
};
