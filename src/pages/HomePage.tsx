import { Link } from 'react-router-dom';
import { Car, Truck, Bike, Caravan, TrendingUp, Shield, Zap, BadgeCheck, ArrowRight, Calculator, Sparkles } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import VehicleCard from '../components/VehicleCard';
import { getManufacturerLogoUrl } from '../lib/manufacturers';
import { useTopVehicles, useManufacturerCounts, useCategoryCounts } from '../hooks/useVehicles';

const CATEGORY_META: Record<number, { name: string; icon: typeof Car; color: string }> = {
  1: { name: 'Osobní', icon: Car, color: 'bg-primary-500 text-white' },
  3: { name: 'Motocykly', icon: Bike, color: 'bg-surface-50 text-surface-950' },
  4: { name: 'Užitkové', icon: Truck, color: 'bg-accent-600 text-white' },
  9: { name: 'Obytné', icon: Caravan, color: 'bg-surface-300 text-surface-950' },
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
    return { id: kindId, ...meta, count: found?.count ?? 0 };
  });

  const popularBrands = [...manufacturerCounts]
    .sort((a, b) => b.vehicle_count - a.vehicle_count)
    .slice(0, 8);

  // Use first vehicle image as hero background
  const heroImage = topDeals[0]?.main_image_url;

  return (
    <div className="min-h-screen">
      {/* === CINEMATIC HERO === */}
      <section className="relative overflow-hidden bg-surface-50 min-h-[560px] md:min-h-[620px] flex items-end">
        {/* Background image with cinematic overlay */}
        {heroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 animate-[pulse_20s_ease-in-out_infinite]"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}
        {/* Dark cinematic gradient — always visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        {/* Orange accent glow */}
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-primary-600/20 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12 pt-36 w-full">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-primary-400" />
              Autovizor.cz
            </p>
            <h1
              className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Najdi své<br />
              <span className="italic bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                vysněné auto.
              </span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-white/60 max-w-md leading-relaxed">
              Tisíce ověřených nabídek. AI vyhledávání.
              <br className="hidden md:block" />
              Jeden cíl — vaše příští auto.
            </p>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2.5 mt-10">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/hledat?kind_id=${cat.id}`}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 hover:shadow-lg ${cat.color}`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
                <span className="opacity-50 text-xs font-medium">{formatCount(cat.count)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === SEARCH BAR — floating over hero === */}
      <section className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
        <SearchBar variant="hero" />
      </section>

      {/* === LATEST INVENTORY === */}
      <section className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-primary-500 uppercase tracking-[0.15em] mb-1">Čerstvě přidané</p>
            <h2 className="text-3xl font-extrabold text-surface-50 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Nejnovější nabídky
            </h2>
          </div>
          <Link
            to="/hledat"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-surface-950 shadow-sm hover:shadow-md rounded-full text-sm font-medium text-surface-100 transition-all"
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

      {/* === PRODEJ + OCENĚNÍ BANNERY === */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Prodej své auto — tmavý cinematic */}
          <Link
            to="/prodat"
            className="md:col-span-3 relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-50 via-surface-100 to-surface-200 p-8 md:p-10 flex flex-col justify-end min-h-[280px] group"
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary-500/8 rounded-full blur-3xl" />
            <div className="absolute top-8 right-8 opacity-10">
              <Car className="w-32 h-32 text-primary-500" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-primary-500 uppercase tracking-[0.15em] mb-2">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Prodáváte?
              </p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-surface-950 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                Prodejte rychleji<br />za lepší cenu
              </h3>
              <p className="text-surface-400 max-w-sm mb-6 text-sm">
                Inzerát zdarma. Tisíce kupujících. Průměrný prodej za 14 dní.
              </p>
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl text-white font-semibold group-hover:shadow-xl group-hover:shadow-primary-500/25 group-hover:scale-[1.02] transition-all">
                Inzerovat zdarma
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {/* AI Ocenění */}
          <Link
            to="/prodat"
            className="md:col-span-2 rounded-2xl bg-gradient-to-br from-accent-600 to-accent-800 p-8 flex flex-col text-white group hover:shadow-xl hover:shadow-accent-600/20 transition-all"
          >
            <Calculator className="w-10 h-10 text-white/80 mb-4" />
            <h3 className="text-xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Kolik stojí vaše auto?
            </h3>
            <p className="text-sm text-white/60 mb-6 flex-1">
              AI ocenění z aktuálních tržních dat. Výsledek za 30 sekund.
            </p>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-xl text-sm font-semibold text-white group-hover:bg-white/25 transition-all">
              Zjistit tržní cenu
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>
      </section>

      {/* === CERTIFIKOVÁNO === */}
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
              Kontrola technického stavu, historie a právní čistoty. Kupujte s jistotou.
            </p>
          </div>
          <Link
            to="/poradna"
            className="shrink-0 px-5 py-2.5 bg-surface-950 shadow-sm hover:shadow-md rounded-xl text-sm font-medium text-surface-100 transition-all"
          >
            Zjistit více
          </Link>
        </div>
      </section>

      {/* === POPULÁRNÍ ZNAČKY === */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <p className="text-xs font-bold text-primary-500 uppercase tracking-[0.15em] mb-1">Značky</p>
        <h2 className="text-3xl font-extrabold text-surface-50 mb-8 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Populární značky
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {popularBrands.map((brand) => (
            <Link
              key={brand.name}
              to={`/hledat?brand=${encodeURIComponent(brand.name)}`}
              className="flex items-center gap-3 p-4 bg-surface-950 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group"
            >
              <img
                src={getManufacturerLogoUrl(brand.name)}
                alt={brand.name}
                className="w-8 h-8 object-contain shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-surface-100 group-hover:text-primary-500 transition-colors truncate">
                  {brand.name}
                </p>
                <p className="text-xs text-surface-500">{formatCount(brand.vehicle_count)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* === PROČ AUTOVIZOR === */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-surface-50 mb-10 text-center tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Proč Autovizor?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: TrendingUp, title: 'Hodnocení ceny', desc: 'U každého vozidla vidíte, zda je cena výhodná, férová, nebo vysoká.' },
            { icon: Shield, title: 'Ověření prodejci', desc: 'Hodnocení a recenze od skutečných zákazníků. Kupujte bezpečně.' },
            { icon: Zap, title: 'AI vyhledávání', desc: 'Popište auto co hledáte a my najdeme ty nejlepší nabídky.' },
          ].map((usp) => (
            <div key={usp.title} className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-100 transition-colors">
                <usp.icon className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-lg font-bold text-surface-100 mb-2">{usp.title}</h3>
              <p className="text-sm text-surface-400 max-w-xs mx-auto">{usp.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
