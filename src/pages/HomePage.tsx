import { Link } from 'react-router-dom';
import { Car, Truck, Bike, Caravan, TrendingUp, Shield, Zap, BadgeCheck, ArrowRight, Calculator } from 'lucide-react';
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
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <div className="text-center mb-10">
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
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/hledat?kind_id=${cat.id}`}
              className="flex items-center gap-3 px-5 py-3 bg-surface-950 shadow-sm rounded-xl hover:shadow-md transition-all group"
            >
              <cat.icon className="w-6 h-6 text-surface-400 group-hover:text-primary-500 transition-colors" />
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

      {/* Nejnovější nabídky */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-surface-50" style={{ fontFamily: 'var(--font-display)' }}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topDeals.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} layout="grid" />
          ))}
        </div>
      </section>

      {/* Prodej + Ocenění — dva bannery */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Prodej své auto */}
          <Link
            to="/prodat"
            className="md:col-span-3 relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-100 to-surface-200 p-8 md:p-10 flex flex-col justify-end min-h-[260px] group"
          >
            <div className="absolute top-6 right-6 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl" />
            <Car className="w-12 h-12 text-primary-500/30 absolute top-6 right-8" />
            <div className="relative z-10">
              <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2">Prodáváte?</p>
              <h3 className="text-2xl md:text-3xl font-bold text-surface-950 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Prodejte rychleji za lepší cenu
              </h3>
              <p className="text-surface-400 max-w-md mb-6">
                Vložte inzerát zdarma a oslovte tisíce kupujících po celé ČR. Průměrný čas prodeje: 14 dní.
              </p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg text-white font-medium group-hover:shadow-lg group-hover:shadow-primary-600/30 transition-all">
                Inzerovat zdarma
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Ocenění vozu */}
          <Link
            to="/prodat"
            className="md:col-span-2 rounded-2xl bg-gradient-to-br from-accent-600 to-accent-800 p-8 flex flex-col text-white group"
          >
            <Calculator className="w-10 h-10 text-white/80 mb-4" />
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Kolik stojí vaše auto?
            </h3>
            <p className="text-sm text-white/70 mb-6 flex-1">
              AI ocenění na základě aktuálních tržních dat. Výsledek za 30 sekund.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white transition-colors">
              Zjistit tržní cenu
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>
      </section>

      {/* Certifikováno banner */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-2xl bg-surface-850 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-accent-100 flex items-center justify-center shrink-0">
            <BadgeCheck className="w-7 h-7 text-accent-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-surface-50 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Autovizor Certifikováno
            </h3>
            <p className="text-sm text-surface-400">
              Každé certifikované vozidlo prochází kontrolou technického stavu, historie a právní čistoty. Kupujte s jistotou.
            </p>
          </div>
          <Link
            to="/poradna"
            className="shrink-0 px-5 py-2.5 bg-surface-950 shadow-sm hover:shadow-md rounded-lg text-sm font-medium text-surface-100 transition-all"
          >
            Zjistit více
          </Link>
        </div>
      </section>

      {/* Populární značky */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-surface-50 mb-8" style={{ fontFamily: 'var(--font-display)' }}>
          Populární značky
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {popularBrands.map((brand) => (
            <Link
              key={brand.name}
              to={`/hledat?brand=${encodeURIComponent(brand.name)}`}
              className="flex items-center gap-3 p-4 bg-surface-950 rounded-xl shadow-sm hover:shadow-md transition-all group"
            >
              <img
                src={getManufacturerLogoUrl(brand.name)}
                alt={brand.name}
                className="w-8 h-8 object-contain shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-surface-100 group-hover:text-primary-500 transition-colors truncate">
                  {brand.name}
                </p>
                <p className="text-xs text-surface-500">{formatCount(brand.vehicle_count)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* USP sekce — bez borderů, s icon circles */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-surface-50 mb-8 text-center" style={{ fontFamily: 'var(--font-display)' }}>
          Proč Autovizor?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: TrendingUp, title: 'Hodnocení ceny', desc: 'U každého vozidla vidíte, zda je cena výhodná, férová, nebo vysoká. Nakupujte chytře.' },
            { icon: Shield, title: 'Ověření prodejci', desc: 'Spolupracujeme pouze s ověřenými prodejci. Hodnocení a recenze od skutečných zákazníků.' },
            { icon: Zap, title: 'Okamžitá upozornění', desc: 'Uložte si hledání a dostávejte upozornění, když se objeví nový inzerát.' },
          ].map((usp) => (
            <div key={usp.title} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <usp.icon className="w-7 h-7 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold text-surface-100 mb-2">{usp.title}</h3>
              <p className="text-sm text-surface-400 max-w-xs mx-auto">
                {usp.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
