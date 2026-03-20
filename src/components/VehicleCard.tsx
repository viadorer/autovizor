import { Link } from 'react-router-dom';
import { Heart, MapPin, Fuel, Settings, Calendar, Gauge, Zap, Camera } from 'lucide-react';
import type { Vehicle } from '../types';
import { formatPrice, formatKm, formatPower, formatRegistration } from '../lib/codebooks';
import { useFavoritesStore } from '../stores/favoritesStore';

interface VehicleCardProps {
  vehicle: Vehicle;
  layout?: 'grid' | 'list';
}

const RATING_LABELS: Record<string, { label: string; className: string }> = {
  very_good: { label: 'Velmi dobrá cena', className: 'bg-emerald-600' },
  good: { label: 'Dobrá cena', className: 'bg-cyan-600' },
  fair: { label: 'Férová cena', className: 'bg-amber-600' },
  high: { label: 'Vyšší cena', className: 'bg-red-600' },
};

export default function VehicleCard({ vehicle, layout = 'list' }: VehicleCardProps) {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const fav = isFavorite(vehicle.id);
  const rating = vehicle.price_rating ? RATING_LABELS[vehicle.price_rating] : null;

  if (layout === 'grid') {
    return (
      <Link
        to={`/vozidlo/${vehicle.id}`}
        className="group bg-surface-900 rounded-xl overflow-hidden border border-surface-800 hover:border-surface-600 transition-all hover:shadow-lg hover:shadow-black/20"
      >
        {/* Obrázek */}
        <div className="relative aspect-[4/3] bg-surface-800 overflow-hidden">
          {vehicle.main_image_url ? (
            <img
              src={vehicle.main_image_url}
              alt={vehicle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-600">
              <Fuel className="w-12 h-12" />
            </div>
          )}
          {vehicle.is_top && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded">
              TOP
            </span>
          )}
          {vehicle.image_count > 1 && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
              <Camera className="w-3 h-3" />
              {vehicle.image_count}
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(vehicle.id); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-primary-500 text-primary-500' : 'text-white'}`} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-white truncate">{vehicle.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-white">{formatPrice(vehicle.price)}</span>
            {rating && (
              <span className={`px-2 py-0.5 text-[10px] font-medium text-white rounded ${rating.className}`}>
                {rating.label}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-surface-400">
            {vehicle.first_registration && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatRegistration(vehicle.made_month, vehicle.made_year)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3" />
              {formatKm(vehicle.tachometer)}
            </span>
            {vehicle.engine_power && (
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {formatPower(vehicle.engine_power)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Fuel className="w-3 h-3" />
              {vehicle.fuel_name}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // List layout
  return (
    <Link
      to={`/vozidlo/${vehicle.id}`}
      className="group flex flex-col sm:flex-row bg-surface-900 rounded-xl overflow-hidden border border-surface-800 hover:border-surface-600 transition-all hover:shadow-lg hover:shadow-black/20"
    >
      {/* Obrázek */}
      <div className="relative w-full sm:w-72 lg:w-80 shrink-0 aspect-[4/3] sm:aspect-auto sm:h-auto bg-surface-800 overflow-hidden">
        {vehicle.main_image_url ? (
          <img
            src={vehicle.main_image_url}
            alt={vehicle.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-600">
            <Fuel className="w-12 h-12" />
          </div>
        )}
        {vehicle.is_top && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded">
            TOP
          </span>
        )}
        {vehicle.image_count > 1 && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
            <Camera className="w-3 h-3" />
            {vehicle.image_count}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleFavorite(vehicle.id); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-primary-500 text-primary-500' : 'text-white'}`} />
        </button>
      </div>

      {/* Obsah */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white group-hover:text-primary-400 transition-colors">
              {vehicle.title}
            </h3>
            {vehicle.model_variant && (
              <p className="text-sm text-surface-400 mt-0.5">{vehicle.model_variant}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-white">{formatPrice(vehicle.price)}</p>
            {rating && (
              <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-medium text-white rounded ${rating.className}`}>
                {rating.label}
              </span>
            )}
            {vehicle.vat_deductible && (
              <p className="text-[10px] text-surface-500 mt-1">Možnost odpočtu DPH</p>
            )}
          </div>
        </div>

        {/* Parametry */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-sm text-surface-300">
          {vehicle.first_registration && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-surface-500" />
              EZ {formatRegistration(vehicle.made_month, vehicle.made_year)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-surface-500" />
            {formatKm(vehicle.tachometer)}
          </span>
          {vehicle.engine_power && (
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-surface-500" />
              {formatPower(vehicle.engine_power)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-surface-500" />
            {vehicle.fuel_name}
          </span>
          <span className="flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-surface-500" />
            {vehicle.gearbox_name}
          </span>
        </div>

        {/* Stav */}
        <div className="flex items-center gap-2 mt-3 text-xs text-surface-400">
          {vehicle.condition_name && (
            <span>{vehicle.condition_name}</span>
          )}
          {vehicle.condition_name && vehicle.color_name && <span>•</span>}
          {vehicle.color_name && <span>{vehicle.color_name}</span>}
        </div>

        {/* Prodejce */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-surface-800">
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-300">{vehicle.seller_name}</span>
            {vehicle.seller_rating && (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                {'★'.repeat(Math.round(vehicle.seller_rating))}
                <span className="text-surface-500">({vehicle.seller_review_count})</span>
              </span>
            )}
          </div>
          {vehicle.region_name && (
            <span className="flex items-center gap-1 text-xs text-surface-500">
              <MapPin className="w-3 h-3" />
              {vehicle.region_name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
