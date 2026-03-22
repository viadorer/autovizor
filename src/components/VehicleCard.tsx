import { Link } from 'react-router-dom';
import { Warehouse, MapPin, Fuel, Settings, Calendar, Gauge, Zap, Camera, BadgeCheck, Sparkles } from 'lucide-react';
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

function isNew(vehicle: Vehicle): boolean {
  if (!vehicle.created_at) return false;
  const date = new Date(vehicle.created_at);
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  return date.getTime() > threeDaysAgo;
}

export default function VehicleCard({ vehicle, layout = 'list' }: VehicleCardProps) {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const inGarage = isFavorite(vehicle.id);
  const rating = vehicle.price_rating ? RATING_LABELS[vehicle.price_rating] : null;
  const isNewVehicle = isNew(vehicle);
  const isCertified = !!vehicle.certified_id;

  const garageButton = (
    <button
      onClick={(e) => { e.preventDefault(); toggleFavorite(vehicle.id); }}
      className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
        inGarage
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
          : 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70'
      }`}
      title={inGarage ? 'Odebrat z garáže' : 'Do garáže'}
    >
      <Warehouse className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{inGarage ? 'V garáži' : 'Do garáže'}</span>
    </button>
  );

  if (layout === 'grid') {
    return (
      <Link
        to={`/vozidlo/${vehicle.id}`}
        className="group bg-surface-900 rounded-xl overflow-hidden border border-surface-800 hover:border-surface-600 transition-all hover:shadow-lg hover:shadow-black/20 flex flex-col"
      >
        {/* Obrázek */}
        <div className="relative aspect-[4/3] bg-surface-800 overflow-hidden">
          {vehicle.main_image_url ? (
            <>
              <div
                className="absolute inset-0 scale-110 blur-xl opacity-60"
                style={{ backgroundImage: `url(${vehicle.main_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <img
                src={vehicle.main_image_url}
                alt={vehicle.title}
                className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-600">
              <Fuel className="w-12 h-12" />
            </div>
          )}

          {/* Badges top-left — stacked */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {vehicle.is_top && (
              <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded">
                TOP
              </span>
            )}
            {isNewVehicle && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded">
                <Sparkles className="w-3 h-3" />
                Novinka
              </span>
            )}
            {isCertified && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-600 text-white text-xs font-bold rounded">
                <BadgeCheck className="w-3 h-3" />
                Ověřeno
              </span>
            )}
          </div>

          {vehicle.image_count > 1 && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
              <Camera className="w-3 h-3" />
              {vehicle.image_count}
            </span>
          )}
          {garageButton}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-surface-100 truncate">{vehicle.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-surface-100">{formatPrice(vehicle.price)}</span>
            {rating && (
              <span className={`px-2 py-0.5 text-[10px] font-medium text-white rounded ${rating.className}`}>
                {rating.label}
              </span>
            )}
          </div>

          {/* Spec chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {vehicle.made_year && (
              <span className="px-2 py-0.5 border border-surface-700 rounded text-[10px] text-surface-300 uppercase tracking-wide">
                <span className="text-surface-500">Rok</span> {vehicle.made_year}
              </span>
            )}
            {vehicle.tachometer != null && (
              <span className="px-2 py-0.5 border border-surface-700 rounded text-[10px] text-surface-300 uppercase tracking-wide">
                <span className="text-surface-500">Km</span> {formatKm(vehicle.tachometer)}
              </span>
            )}
            {vehicle.engine_power && (
              <span className="px-2 py-0.5 border border-surface-700 rounded text-[10px] text-surface-300 uppercase tracking-wide">
                <span className="text-surface-500">Výkon</span> {formatPower(vehicle.engine_power)}
              </span>
            )}
            {vehicle.fuel_name && (
              <span className="px-2 py-0.5 border border-surface-700 rounded text-[10px] text-surface-300 uppercase tracking-wide">
                {vehicle.fuel_name}
              </span>
            )}
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
          <>
            <div
              className="absolute inset-0 scale-110 blur-xl opacity-60"
              style={{ backgroundImage: `url(${vehicle.main_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            <img
              src={vehicle.main_image_url}
              alt={vehicle.title}
              className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-600">
            <Fuel className="w-12 h-12" />
          </div>
        )}

        {/* Badges top-left — stacked */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {vehicle.is_top && (
            <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded">
              TOP
            </span>
          )}
          {isNewVehicle && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded">
              <Sparkles className="w-3 h-3" />
              Novinka
            </span>
          )}
          {isCertified && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-600 text-white text-xs font-bold rounded">
              <BadgeCheck className="w-3 h-3" />
              Ověřeno
            </span>
          )}
        </div>

        {vehicle.image_count > 1 && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
            <Camera className="w-3 h-3" />
            {vehicle.image_count}
          </span>
        )}
        {garageButton}
      </div>

      {/* Obsah */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-surface-100 group-hover:text-primary-400 transition-colors">
              {vehicle.title}
            </h3>
            {vehicle.model_variant && (
              <p className="text-sm text-surface-400 mt-0.5">{vehicle.model_variant}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-surface-100">{formatPrice(vehicle.price)}</p>
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
