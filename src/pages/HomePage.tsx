import { Link } from 'react-router-dom';
import { Car, Truck, Bike, Caravan, Search, TrendingUp, Shield, Zap } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import VehicleCard from '../components/VehicleCard';
import { getManufacturerLogoUrl } from '../lib/manufacturers';
import { useTopVehicles, useManufacturerCounts, useCategoryCounts } from '../hooks/useVehicles';

const CATEGORY_META: Record<number, { name: string; icon: typeof Car }> = {
  1: { name: 'Osobní', icon: Car },
  3: { name: 'Motocykly', icon: Bike },
  4: { name: 'Užitkové', icon: Truck },
  9: { name: 'Obytné', icon: Caravan },
};

const CATEGORY_ORDER = [1, 3, 4, 9];

function formatCount(n: number): string {
  return n.toLocaleString('cs-CZ');
}

export default function HomePage() {
  const { data: topDeals = [] } = useTopVehicles(6);
  const { data: manufacturerCounts = [] } = useManufacturerCounts();
  const { data: categoryCounts = [] } = useCategoryCounts();

  // Build category data from real counts
  const categories = CATEGORY_ORDER.map((kindId) => {
    const meta = CATEGORY_META[kindId];
    const found = categoryCounts.find((c) => c.kind_id === kindId);
    return {
      id: kindId,
      name: meta.name,
      icon: meta.icon,
      count: found?.count ?? 0,
    };
  });

  // Top 8 brands by vehicle count
  const popularBrands = [...manufacturerCounts]
    .sort((a, b) => b.vehicle_count - a.vehicle_count)
    .slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero sekce */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/30 via-surface-950 to-surface-950" />
        <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-surface-100 leading-tight">
              Najdi své
              <span className="text-primary-500"> vysněné auto</span>
            </h1>
            <p className="mt-4 text-lg text-surface-300 max-w-2xl mx-auto">
              Najděte to pravé – na největším českém vyhledávači vozidel.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <SearchBar variant="hero" />
          </div>

          {/* Kategorie */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/hledat?kind_id=${cat.id}`}
                className="flex items-center gap-3 px-5 py-3 bg-surface-900/80 border border-surface-800 rounded-xl hover:border-surface-600 hover:bg-surface-800/80 transition-all group"
              >
                <cat.icon className="w-6 h-6 text-surface-400 group-hover:text-primary-400 transition-colors" />
                <div className="text-left">
                  <p className="text-sm font-medium text-surface-100">{cat.name}</p>
                  <p className="text-xs text-surface-500">
                    {formatCount(cat.count)} nabídek
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top nabídky */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-surface-100">
              Top <span className="px-2 py-0.5 bg-primary-600 rounded text-sm">NABÍDKY</span> pro vás
            </h2>
            <p className="text-sm text-surface-400 mt-1">Nejzajímavější inzeráty vybrané pro vás</p>
          </div>
          <Link
            to="/hledat"
            className="hidden sm:flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Zobrazit vše
            <Search className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topDeals.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} layout="grid" />
          ))}
        </div>
      </section>

      {/* Populární značky */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-surface-100 mb-6">Populární značky</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {popularBrands.map((brand) => (
            <Link
              key={brand.name}
              to={`/hledat?brand=${encodeURIComponent(brand.name)}`}
              className="flex items-center gap-3 p-4 bg-surface-900 rounded-xl border border-surface-800 hover:border-surface-600 transition-all group"
            >
              <img
                src={getManufacturerLogoUrl(brand.name)}
                alt={brand.name}
                className="w-8 h-8 object-contain shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-surface-100 group-hover:text-primary-400 transition-colors truncate">
                  {brand.name}
                </p>
                <p className="text-xs text-surface-500">{formatCount(brand.vehicle_count)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* USP sekce */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface-900 rounded-xl border border-surface-800">
            <TrendingUp className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="text-lg font-semibold text-surface-100 mb-2">Hodnocení ceny</h3>
            <p className="text-sm text-surface-400">
              U každého vozidla vidíte, zda je cena výhodná, férová, nebo vysoká.
              Nakupujte chytře.
            </p>
          </div>
          <div className="p-6 bg-surface-900 rounded-xl border border-surface-800">
            <Shield className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="text-lg font-semibold text-surface-100 mb-2">Ověření prodejci</h3>
            <p className="text-sm text-surface-400">
              Spolupracujeme pouze s ověřenými prodejci. Hodnocení a recenze od skutečných zákazníků.
            </p>
          </div>
          <div className="p-6 bg-surface-900 rounded-xl border border-surface-800">
            <Zap className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="text-lg font-semibold text-surface-100 mb-2">Okamžitá upozornění</h3>
            <p className="text-sm text-surface-400">
              Uložte si hledání a dostávejte upozornění, když se objeví nový inzerát odpovídající vašim kritériím.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
