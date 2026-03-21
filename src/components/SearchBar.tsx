import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useSearchStore } from '../stores/searchStore';
import { FUEL_TYPES, GEARBOX_TYPES, YEAR_OPTIONS, formatPrice } from '../lib/codebooks';
import { MANUFACTURERS } from '../lib/manufacturers';
import ManufacturerSelect from './ManufacturerSelect';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
}

export default function SearchBar({ variant = 'hero' }: SearchBarProps) {
  const navigate = useNavigate();
  const { filters, setFilter, setFilters, search } = useSearchStore();
  const [selectedMfr, setSelectedMfr] = useState<number | undefined>(filters.manufacturer_id);

  const currentModels = selectedMfr
    ? MANUFACTURERS.find((m) => m.id === selectedMfr)?.models ?? []
    : [];

  const handleManufacturer = (id: number | undefined) => {
    setSelectedMfr(id);
    setFilters({ manufacturer_id: id, model_id: undefined });
  };

  const handleSearch = () => {
    search();
    navigate('/hledat');
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 bg-surface-900 rounded-xl p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Popiš, jaké auto hledáš..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-800 rounded-lg text-sm text-surface-100 placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-600"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setFilter('query', (e.target as HTMLInputElement).value);
                handleSearch();
              }
            }}
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium text-white transition-colors"
        >
          Hledat
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-900/80 backdrop-blur-sm rounded-2xl p-6 border border-surface-800">
      <h2 className="text-xl font-bold text-surface-100 mb-5">
        Miliony aut. Jedno hledání.
      </h2>

      {/* AI vyhledávání */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input
          type="text"
          placeholder="Popiš, jaké auto hledáš..."
          className="w-full pl-12 pr-14 py-4 bg-surface-800 rounded-xl text-surface-100 placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-600 text-base"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setFilter('query', (e.target as HTMLInputElement).value);
              handleSearch();
            }
          }}
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-600 hover:bg-primary-700 rounded-lg flex items-center justify-center text-white transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Filtry */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Značka */}
        <ManufacturerSelect
          value={selectedMfr}
          onChange={handleManufacturer}
          placeholder="Značka"
        />

        {/* Model */}
        <select
          value={filters.model_id ?? ''}
          onChange={(e) => setFilter('model_id', e.target.value ? Number(e.target.value) : undefined)}
          className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
          disabled={!selectedMfr}
        >
          <option value="">Model</option>
          {currentModels.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {/* Registrace od */}
        <select
          value={filters.year_from ?? ''}
          onChange={(e) => setFilter('year_from', e.target.value ? Number(e.target.value) : undefined)}
          className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
        >
          <option value="">Rok od</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Km do */}
        <select
          value={filters.km_to ?? ''}
          onChange={(e) => setFilter('km_to', e.target.value ? Number(e.target.value) : undefined)}
          className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
        >
          <option value="">Km do</option>
          {[10000, 30000, 50000, 75000, 100000, 150000, 200000].map((km) => (
            <option key={km} value={km}>{new Intl.NumberFormat('cs-CZ').format(km)} km</option>
          ))}
        </select>

        {/* Cena do */}
        <select
          value={filters.price_to ?? ''}
          onChange={(e) => setFilter('price_to', e.target.value ? Number(e.target.value) : undefined)}
          className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
        >
          <option value="">Cena do</option>
          {[100000, 200000, 300000, 500000, 750000, 1000000, 1500000, 2000000].map((p) => (
            <option key={p} value={p}>{formatPrice(p)}</option>
          ))}
        </select>

        {/* Vyhledat */}
        <button
          onClick={handleSearch}
          className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Hledat
        </button>
      </div>

      {/* Další filtry */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="text-xs text-surface-500">Rychlé filtry:</span>
        {FUEL_TYPES.slice(0, 5).map((fuel) => (
          <button
            key={fuel.id}
            onClick={() => {
              setFilter('fuel_type_id', filters.fuel_type_id === fuel.id ? undefined : fuel.id);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filters.fuel_type_id === fuel.id
                ? 'bg-primary-600 text-white'
                : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
            }`}
          >
            {fuel.name}
          </button>
        ))}
        {GEARBOX_TYPES.map((gb) => (
          <button
            key={gb.id}
            onClick={() => {
              setFilter('gearbox_id', filters.gearbox_id === gb.id ? undefined : gb.id);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filters.gearbox_id === gb.id
                ? 'bg-primary-600 text-white'
                : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
            }`}
          >
            {gb.name}
          </button>
        ))}
      </div>
    </div>
  );
}
