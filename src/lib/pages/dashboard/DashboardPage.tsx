import { useDashboardData } from './useDashboardData';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStatsSection } from './DashboardStatsSection';
import { DashboardSearchBar } from './DashboardSearchBar';
import { ApplicantsTable } from './ApplicantsTable';

export function DashboardPage() {
  const token = localStorage.getItem('access_token');
  const {
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
  } = useDashboardData(token);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      <div className="flex-1 mx-auto w-full max-w-[96rem] px-3 sm:px-6 lg:px-8">
        <DashboardHeader onApplicantCreated={refreshListAndStats} />
        <main className="pb-8 space-y-4">
          <DashboardStatsSection stats={stats} />
          <DashboardSearchBar value={searchTerm} onChange={setSearchTerm} />
          <ApplicantsTable
            applicants={applicants}
            total={total}
            page={page}
            pageSize={pageSize}
            loading={loading}
            filters={filters}
            filterOptions={filterOptions}
            hasActiveFilters={hasActiveFilters}
            onFilterChange={handleFilterChange}
            onResetFilters={resetAllFilters}
            onListRefresh={() => void fetchApplicants()}
            onStatsRefresh={() => void fetchStats()}
            onPageChange={(next) => {
              if (next < 1) return;
              if (total && next > Math.ceil(total / pageSize)) return;
              setPage(next);
            }}
          />
        </main>
      </div>
    </div>
  );
}
