import { Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import VehicleCard from '../components/VehicleCard';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useVehiclesByIds } from '../hooks/useVehicles';

export default function FavoritesPage() {
  const { favoriteIds } = useFavoritesStore();
  const { data: vehicles = [] } = useVehiclesByIds(favoriteIds);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Moje garáž</h1>
          <p className="text-sm text-surface-400 mt-1">
            {favoriteIds.length === 0
              ? 'Vaše garáž je zatím prázdná.'
              : `${favoriteIds.length} ${favoriteIds.length === 1 ? 'vozidlo v garáži' : favoriteIds.length < 5 ? 'vozidla v garáži' : 'vozidel v garáži'}`
            }
          </p>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-20">
          <Warehouse className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-100 mb-2">
            Garáž je prázdná
          </h3>
          <p className="text-sm text-surface-400 mb-6">
            Ukládejte si zajímavá vozidla do garáže tlačítkem na kartě inzerátu.
          </p>
          <Link
            to="/hledat"
            className="inline-flex px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            Hledat vozidla
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} layout="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
