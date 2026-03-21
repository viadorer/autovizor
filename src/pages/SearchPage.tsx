import { useEffect, useState } from 'react';
import { Grid3X3, List, Search, Star } from 'lucide-react';
import SearchFilters from '../components/SearchFilters';
import VehicleCard from '../components/VehicleCard';
import SearchBar from '../components/SearchBar';
import { useSearchStore } from '../stores/searchStore';
import { SORT_OPTIONS } from '../lib/codebooks';

export default function SearchPage() {
  const { results, totalCount, isLoading, page, perPage, filters, setPage, setSortBy, search } = useSearchStore();
  const [layout, setLayout] = useState<'list' | 'grid'>('grid');
  const totalPages = Math.ceil(totalCount / perPage);

  useEffect(() => {
    search();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Horní vyhledávání */}
      <div className="mb-6">
        <SearchBar variant="compact" />
      </div>

      <div className="lg:flex lg:items-start lg:gap-6">
        {/* Levý panel - filtry */}
        <SearchFilters />

        {/* Hlavní obsah */}
        <div className="flex-1 min-w-0">
          {/* Horní lišta */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-surface-100">
                {new Intl.NumberFormat('cs-CZ').format(totalCount)} nabídek
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Řazení */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-500 hidden sm:inline">Řadit podle</span>
                <select
                  value={filters.sort_by ?? 'created_at'}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Layout */}
              <div className="flex items-center border border-surface-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setLayout('list')}
                  className={`p-2 transition-colors ${layout === 'list' ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayout('grid')}
                  className={`p-2 transition-colors ${layout === 'grid' ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-100'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>

              {/* Uložit hledání */}
              <button className="flex items-center gap-2 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-300 hover:text-surface-100 hover:border-primary-600 transition-colors">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Uložit hledání</span>
              </button>
            </div>
          </div>

          {/* Výsledky */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-surface-900 rounded-xl border border-surface-800 p-4 animate-pulse flex gap-4">
                  <div className="w-72 h-40 bg-surface-800 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-5 bg-surface-800 rounded w-2/3" />
                    <div className="h-4 bg-surface-800 rounded w-1/3" />
                    <div className="flex gap-3 mt-4">
                      <div className="h-3 bg-surface-800 rounded w-20" />
                      <div className="h-3 bg-surface-800 rounded w-20" />
                      <div className="h-3 bg-surface-800 rounded w-16" />
                    </div>
                    <div className="h-3 bg-surface-800 rounded w-1/2 mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-surface-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-surface-100 mb-2">Žádné výsledky</h3>
              <p className="text-sm text-surface-400">
                Zkuste upravit filtry nebo vyhledávací dotaz.
              </p>
            </div>
          ) : (
            <div className={
              layout === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'space-y-4'
            }>
              {results.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} layout={layout} />
              ))}
            </div>
          )}

          {/* Stránkování */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-700 transition-colors"
              >
                Předchozí
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-800 border border-surface-700 text-surface-300 hover:text-surface-100 hover:bg-surface-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-700 transition-colors"
              >
                Další
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
