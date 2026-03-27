import { Link } from 'react-router-dom';
import { Car, Truck, Bike, Caravan, TrendingUp, Shield, Zap, BadgeCheck, ArrowRight } from 'lucide-react';
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

  const popularBrands = [...manufacturerCounts]
    .sort((a, b) => b.vehicle_count - a.vehicle_count)
    .slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero — čistý, minimalistický */}
      <section className="max-w-7xl mx-auto px-4 pt-10 pb-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-surface-50 leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Najdi své{' '}
            <span className="text-primary-500">vysněné auto</span>
          </h1>
          <p className="mt-3 text-surface-400 max-w-xl mx-auto text-lg">
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
      </section>

      {/* Top nabídky */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-surface-100">
              Nejnovější nabídky
            </h2>
            <p className="text-sm text-surface-400 mt-1">Čerstvě přidané inzeráty</p>
          </div>
          <Link
            to="/hledat"
            className="hidden sm:flex items-center gap-1 text-sm text-primary-500 hover:text-primary-400 font-medium transition-colors"
          >
            Zobrazit vše
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topDeals.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} layout="grid" />
          ))}
        </div>
      </section>

      {/* Prodej + Certifikováno — 2 karty vedle sebe */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Prodej své auto — tmavá karta */}
          <Link
            to="/prodat"
            className="md:col-span-3 relative overflow-hidden rounded-2xl bg-surface-100 p-8 md:p-10 flex flex-col justify-end min-h-[240px] group"
          >
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-surface-900 mb-2">
                Prodejte své auto
              </h3>
              <p className="text-surface-500 max-w-md mb-6">
                Vložte inzerát zdarma a oslovte tisíce kupujících po celé ČR.
              </p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg text-white font-medium group-hover:shadow-lg group-hover:shadow-primary-600/30 transition-all">
                Vložit inzerát
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Autovizor Certifikováno — accent modrá karta */}
          <div className="md:col-span-2 rounded-2xl bg-accent-100 p-8 flex flex-col">
            <BadgeCheck className="w-10 h-10 text-accent-600 mb-4" />
            <h3 className="text-xl font-bold text-accent-900 mb-2">
              Autovizor Certifikováno
            </h3>
            <p className="text-sm text-accent-700 mb-6 flex-1">
              Každé vozidlo prochází důkladnou kontrolou technického stavu, historie a právní čistoty.
            </p>
            <Link
              to="/poradna"
              className="text-sm font-medium text-accent-600 hover:text-accent-700 underline underline-offset-4 transition-colors"
            >
              Zjistit více o procesu →
            </Link>
          </div>
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
