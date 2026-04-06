import { useState, useEffect, useCallback } from 'react';
import type { Applicant, FilterState } from './types';
import { EMPTY_FILTERS } from './constants';

const defaultFilterOptions: Record<string, string[]> = {
  id: [],
  docStatus: ['Оригинал', 'Копия'],
  fullName: [],
  classes: [],
  profession: [],
  finance: [],
  point: [],
  benefit: [],
};

export function useDashboardData(token: string | null) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>(defaultFilterOptions);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    if (debouncedSearch) {
      p.set('search', debouncedSearch);
      p.set('query', debouncedSearch);
      p.set('exactSearch', 'true');
    }
    p.set('page', String(page));
    p.set('limit', String(pageSize));
    if (filters.docStatus?.length) p.set('docStatus', filters.docStatus.join(','));
    if (filters.classes?.length) p.set('classes', filters.classes.join(','));
    if (filters.profession?.length) p.set('profession', filters.profession.join(','));
    if (filters.finance?.length) p.set('finance', filters.finance.join(','));
    if (filters.point?.length) p.set('point', filters.point.join(','));
    if (filters.benefit?.length) p.set('benefit', filters.benefit.join(','));
    return p;
  }, [filters, debouncedSearch, page]);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildParams();
      const res = await fetch(`http://localhost:3000/applicants?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplicants(data.map((a: Applicant) => ({ ...a, documents: a.documents ?? [] })));
        setTotal(data.length);
      } else {
        setApplicants((data.items ?? []).map((a: Applicant) => ({ ...a, documents: a.documents ?? [] })));
        setTotal(data.total ?? data.items?.length ?? 0);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setApplicants([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, buildParams]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/applicants/filter-options', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setFilterOptions((prev) => ({ ...prev, ...data }));
    } catch {}
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/applicants/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setStats(data ?? {});
    } catch {}
  }, [token]);

  useEffect(() => {
    void fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    void fetchApplicants();
  }, [fetchApplicants]);

  const handleFilterChange = (key: keyof FilterState, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v.length > 0) || !!debouncedSearch;

  const resetAllFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchTerm('');
    setPage(1);
  };

  const refreshListAndStats = useCallback(() => {
    void fetchApplicants();
    void fetchStats();
  }, [fetchApplicants, fetchStats]);

  return {
    searchTerm,
    setSearchTerm,
    applicants,
    total,
    page,
    pageSize,
    loading,
    stats,
    filters,
    filterOptions,
    handleFilterChange,
    hasActiveFilters,
    resetAllFilters,
    fetchApplicants,
    fetchStats,
    refreshListAndStats,
    setPage,
  };
}
