import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Truck, Bike, Caravan, Search, TrendingUp, Shield, Zap } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import VehicleCard from '../components/VehicleCard';
import { getTopVehicles } from '../lib/api';
import type { Vehicle } from '../types';

const VEHICLE_CATEGORIES = [
  { id: 1, name: 'Osobní', icon: Car, count: '1 245 832' },
  { id: 3, name: 'Motocykly', icon: Bike, count: '45 621' },
  { id: 4, name: 'Užitkové', icon: Truck, count: '67 234' },
  { id: 9, name: 'Obytné', icon: Caravan, count: '12 456' },
];

const POPULAR_BRANDS = [
  { name: 'Škoda', count: '234 567' },
  { name: 'Volkswagen', count: '198 432' },
  { name: 'BMW', count: '167 890' },
  { name: 'Mercedes-Benz', count: '145 678' },
  { name: 'Audi', count: '134 567' },
  { name: 'Ford', count: '112 345' },
  { name: 'Toyota', count: '98 765' },
  { name: 'Hyundai', count: '87 654' },
];

export default function HomePage() {
  const [topDeals, setTopDeals] = useState<Vehicle[]>([]);

  useEffect(() => {
    getTopVehicles(6).then(setTopDeals);
  }, []);

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
            {VEHICLE_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/hledat?kind_id=${cat.id}`}
                className="flex items-center gap-3 px-5 py-3 bg-surface-900/80 border border-surface-800 rounded-xl hover:border-surface-600 hover:bg-surface-800/80 transition-all group"
              >
                <cat.icon className="w-6 h-6 text-surface-400 group-hover:text-primary-400 transition-colors" />
                <div className="text-left">
                  <p className="text-sm font-medium text-surface-100">{cat.name}</p>
                  <p className="text-xs text-surface-500">{cat.count} nabídek</p>
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
          {POPULAR_BRANDS.map((brand) => (
            <Link
              key={brand.name}
              to={`/hledat?brand=${encodeURIComponent(brand.name)}`}
              className="flex items-center justify-between p-4 bg-surface-900 rounded-xl border border-surface-800 hover:border-surface-600 transition-all group"
            >
              <span className="text-sm font-medium text-surface-100 group-hover:text-primary-400 transition-colors">
                {brand.name}
              </span>
              <span className="text-xs text-surface-500">{brand.count}</span>
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
