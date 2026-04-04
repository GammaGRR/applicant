import { X } from 'lucide-react';
import { ApplicantDocuments } from '../../components/ApplicantDocument';
import { ModalButton } from '../../components/ModalButton';
import { FilterDropdown } from '../../components/FilterDropDown';
import { AdminRoute } from '../../components/AdminRoute';
import { ClearDatabaseButton } from '../../components/ClearDatabaseButton';
import type { Applicant, FilterState } from './types';
import { BenefitBadges } from './BenefitBadges';
import { ExportDropdown } from './ExportDropdown';
import { cleanDisplayValue, computePointFromGpa } from './utils';

type Props = {
  applicants: Applicant[];
  total: number;
  loading: boolean;
  filters: FilterState;
  filterOptions: Record<string, string[]>;
  hasActiveFilters: boolean;
  onFilterChange: (key: keyof FilterState, values: string[]) => void;
  onResetFilters: () => void;
  onListRefresh: () => void;
  onStatsRefresh: () => void;
};

export function ApplicantsTable({
  applicants,
  total,
  loading,
  filters,
  filterOptions,
  hasActiveFilters,
  onFilterChange,
  onResetFilters,
  onListRefresh,
  onStatsRefresh,
}: Props) {
  const refreshAll = () => {
    onListRefresh();
    onStatsRefresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900 text-sm">Список абитуриентов</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Показано: {applicants.length}
            {applicants.length !== total && <span> · Всего в базе: {total}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportDropdown />
          <AdminRoute>
            <ClearDatabaseButton onCleared={refreshAll} />
          </AdminRoute>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
            >
              <X size={11} /> Сбросить фильтры
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm border-collapse" style={{ minWidth: 760 }}>
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-gray-500 text-center">
              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">№ дела</th>
              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                <div className="flex items-center justify-center gap-0.5">
                  Документы
                  <FilterDropdown
                    label="Список документов"
                    options={filterOptions.docStatus}
                    selected={filters.docStatus}
                    onChange={(vals) => onFilterChange('docStatus', vals)}
                  />
                </div>
              </th>
              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">ФИО</th>
              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                <div className="flex items-center justify-center gap-0.5">
                  Классы
                  <FilterDropdown
                    label="Классы"
                    options={filterOptions.classes}
                    selected={filters.classes}
                    onChange={(vals) => onFilterChange('classes', vals)}
                  />
                </div>
              </th>
              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                <div className="flex items-center justify-center gap-0.5">
                  Специальность
                  <FilterDropdown
                    label="Специальность"
                    options={filterOptions.profession}
                    selected={filters.profession}
                    onChange={(vals) => onFilterChange('profession', vals)}
                  />
                </div>
              </th>
              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                <div className="flex items-center justify-center gap-0.5">
                  Финансирование
                  <FilterDropdown
                    label="Финансирование"
                    options={filterOptions.finance}
                    selected={filters.finance}
                    onChange={(vals) => onFilterChange('finance', vals)}
                  />
                </div>
              </th>
              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                <div className="flex items-center justify-center gap-0.5">
                  Ср. балл
                  <FilterDropdown
                    label="Средний балл"
                    options={filterOptions.point}
                    selected={filters.point}
                    onChange={(vals) => onFilterChange('point', vals)}
                  />
                </div>
              </th>
              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                <div className="flex items-center justify-center gap-0.5">
                  Льготы
                  <FilterDropdown
                    label="Льготы"
                    options={filterOptions.benefit}
                    selected={filters.benefit}
                    onChange={(vals) => onFilterChange('benefit', vals)}
                  />
                </div>
              </th>
              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">Примечание</th>
              <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr>
                <td colSpan={10} className="text-center py-16 text-gray-400 text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Загрузка…
                  </div>
                </td>
              </tr>
            )}
            {!loading && applicants.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-16 text-gray-400 text-sm">
                  {hasActiveFilters ? 'Нет записей, соответствующих фильтрам' : 'Нет записей'}
                </td>
              </tr>
            )}
            {!loading &&
              applicants.map((applicant) => {
                const p = applicant.point ?? computePointFromGpa(applicant.formData);
                const pointStr = Number.isFinite(p as number) ? (p as number).toFixed(2) : '—';
                return (
                  <tr key={applicant.id} className="hover:bg-blue-50/30 transition-colors text-center group">
                    <td className="px-3 sm:px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">
                      {applicant.caseNumber || '—'}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 max-w-[160px] sm:max-w-[220px]">
                      <ApplicantDocuments applicantId={String(applicant.id)} documents={applicant.documents} />
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-left whitespace-nowrap text-gray-800">
                      {applicant.fullName || '—'}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap">{applicant.classes || '—'}</td>
                    <td className="px-3 sm:px-4 py-2.5 text-left max-w-[160px]">
                      <span className="block truncate" title={applicant.profession}>
                        {applicant.profession || '—'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap">
                      {applicant.finance ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            cleanDisplayValue(applicant.finance).toLowerCase().includes('бюджет')
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          {cleanDisplayValue(applicant.finance)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 font-medium">{pointStr}</td>
                    <td className="px-3 sm:px-4 py-2.5 max-w-[160px]">
                      <BenefitBadges value={applicant.benefit} />
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-gray-500 text-left max-w-[140px]">
                      <span className="block truncate" title={applicant.note}>
                        {applicant.note || '—'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5">
                      <ModalButton applicant={applicant} onDeleted={refreshAll} onUpdated={refreshAll} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
