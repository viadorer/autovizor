import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import VehicleCard from '../components/VehicleCard';
import { useFavoritesStore } from '../stores/favoritesStore';
import { getMockVehicles } from '../lib/mock-data';
import type { Vehicle } from '../types';

export default function FavoritesPage() {
  const { favoriteIds } = useFavoritesStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const allVehicles = getMockVehicles(200);
    setVehicles(allVehicles.filter((v) => favoriteIds.includes(v.id)));
  }, [favoriteIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Oblíbené inzeráty</h1>
          <p className="text-sm text-surface-400 mt-1">
            {favoriteIds.length === 0
              ? 'Zatím nemáte žádné oblíbené inzeráty.'
              : `${favoriteIds.length} ${favoriteIds.length === 1 ? 'uložený inzerát' : favoriteIds.length < 5 ? 'uložené inzeráty' : 'uložených inzerátů'}`
            }
          </p>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Žádné oblíbené inzeráty
          </h3>
          <p className="text-sm text-surface-400 mb-6">
            Přidejte si vozidla do oblíbených kliknutím na srdíčko u inzerátu.
          </p>
          <Link
            to="/hledat"
            className="inline-flex px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            Hledat vozidla
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} layout="list" />
          ))}
        </div>
      )}
    </div>
  );
}
