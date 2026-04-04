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

export const SpecialtyModal = ({ specialty, onClose }: Props) => {
  const [applicants, setApplicants] = useState<StatApplicant[]>([]);
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
    const fetchApplicants = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE}/applicants`, {
          cache: 'no-store',
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
        const raw: StatApplicant[] | { items: StatApplicant[]; total: number } = await res.json();
        const all: StatApplicant[] = Array.isArray(raw) ? raw : (raw as { items: StatApplicant[] }).items;

        const norm = (s?: string) => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
        const code = norm(specialty.code);
        const name = norm(specialty.name);
        const matched = all.filter((a) => {
          const prof = norm(a.profession ?? '');
          return (code && prof.includes(code)) || (name && prof.includes(name));
        });

        setApplicants(matched);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    void fetchApplicants();
  }, [specialty.name, specialty.code]);

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

  const found = search.trim()
    ? applicants.find(
        (a) =>
          String(a.caseNumber ?? '')
            .trim()
            .toLowerCase() === search.trim().toLowerCase(),
      ) ?? null
    : null;

  const ranked = [...applicants].sort((a, b) => {
    const ap = typeof a.point === 'number' && isFinite(a.point) ? a.point : -1;
    const bp = typeof b.point === 'number' && isFinite(b.point) ? b.point : -1;
    return bp - ap;
  });
  const foundRank = found ? ranked.findIndex((a) => a.id === found.id) + 1 : null;

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
                      foundRank && foundRank <= specialty.plan
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Место в конкурсе</div>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`font-bold text-2xl font-mono ${
                            foundRank && foundRank <= specialty.plan ? 'text-green-700' : 'text-red-600'
                          }`}
                        >
                          {foundRank ?? '—'}
                        </span>
                        <span className="text-xs text-gray-400">из {applicants.length}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Trophy
                        size={22}
                        className={foundRank && foundRank <= specialty.plan ? 'text-green-400' : 'text-red-300'}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          foundRank && foundRank <= specialty.plan ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {foundRank && foundRank <= specialty.plan
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
            <span>Всего в специальности: {applicants.length}</span>
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
