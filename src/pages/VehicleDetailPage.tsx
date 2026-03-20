import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Heart, Share2, Phone, Mail, MapPin,
  Calendar, Gauge, Zap, Fuel, Settings, Palette,
  Shield, Star, ChevronLeft, ChevronRight, Camera,
  Check, Info, Car, Globe, BookOpen, DoorOpen, Users,
  Wind, Leaf, Key,
} from 'lucide-react';
import type { Vehicle } from '../types';
import { getMockVehicle } from '../lib/mock-data';
import { EQUIPMENT } from '../lib/codebooks';
import {
  formatPrice, formatKm, formatPower, formatVolume,
  formatRegistration, getCodebookName,
  FUEL_TYPES, GEARBOX_TYPES, COLORS, CONDITIONS,
  DRIVE_TYPES, AIRCONDITION_TYPES, EURO_TYPES,
  DOOR_COUNTS, CAPACITY_TYPES, COUNTRIES, SERVICEBOOK_TYPES,
  BODY_TYPES, UPHOLSTERY_TYPES, OWNER_COUNTS, DEAL_TYPES,
} from '../lib/codebooks';
import { useFavoritesStore } from '../stores/favoritesStore';

const RATING_LABELS: Record<string, { label: string; className: string }> = {
  very_good: { label: 'Velmi dobrá cena', className: 'bg-emerald-600' },
  good: { label: 'Dobrá cena', className: 'bg-cyan-600' },
  fair: { label: 'Férová cena', className: 'bg-amber-600' },
  high: { label: 'Vyšší cena', className: 'bg-red-600' },
};

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  useEffect(() => {
    if (id) {
      const v = getMockVehicle(Number(id));
      if (v) {
        // Přidáme mock výbavu
        v.equipment = EQUIPMENT.slice(0, 15 + (Number(id) % 20));
      }
      setVehicle(v ?? null);
    }
    window.scrollTo(0, 0);
  }, [id]);

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Car className="w-12 h-12 text-surface-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Vozidlo nebylo nalezeno</h2>
        <Link to="/hledat" className="text-primary-400 hover:text-primary-300 text-sm">
          Zpět na vyhledávání
        </Link>
      </div>
    );
  }

  const fav = isFavorite(vehicle.id);
  const rating = vehicle.price_rating ? RATING_LABELS[vehicle.price_rating] : null;
  const images = vehicle.images.length > 0 ? vehicle.images : [{ url: vehicle.main_image_url ?? '', order: 0 }];

  const specs = [
    { label: 'Stav', value: getCodebookName(CONDITIONS, vehicle.condition_id), icon: Info },
    { label: 'Karoserie', value: getCodebookName(BODY_TYPES, vehicle.body_type_id), icon: Car },
    { label: 'První registrace', value: formatRegistration(vehicle.made_month, vehicle.made_year), icon: Calendar },
    { label: 'Najeté km', value: formatKm(vehicle.tachometer), icon: Gauge },
    { label: 'Výkon', value: vehicle.engine_power ? formatPower(vehicle.engine_power) : undefined, icon: Zap },
    { label: 'Objem motoru', value: vehicle.engine_volume ? formatVolume(vehicle.engine_volume) : undefined, icon: Settings },
    { label: 'Palivo', value: getCodebookName(FUEL_TYPES, vehicle.fuel_type_id), icon: Fuel },
    { label: 'Převodovka', value: getCodebookName(GEARBOX_TYPES, vehicle.gearbox_id), icon: Settings },
    { label: 'Pohon', value: getCodebookName(DRIVE_TYPES, vehicle.drive_id), icon: Car },
    { label: 'Barva', value: getCodebookName(COLORS, vehicle.color_id), icon: Palette },
    { label: 'Počet dveří', value: getCodebookName(DOOR_COUNTS, vehicle.door_count_id), icon: DoorOpen },
    { label: 'Počet míst', value: getCodebookName(CAPACITY_TYPES, vehicle.capacity_id), icon: Users },
    { label: 'Klimatizace', value: getCodebookName(AIRCONDITION_TYPES, vehicle.aircondition_id), icon: Wind },
    { label: 'Emisní norma', value: getCodebookName(EURO_TYPES, vehicle.euro_id), icon: Leaf },
    { label: 'Servisní knížka', value: getCodebookName(SERVICEBOOK_TYPES, vehicle.servicebook_id), icon: BookOpen },
    { label: 'Země původu', value: getCodebookName(COUNTRIES, vehicle.country_id), icon: Globe },
    { label: 'Potahy', value: getCodebookName(UPHOLSTERY_TYPES, vehicle.upholstery_id), icon: Settings },
    { label: 'Počet vlastníků', value: getCodebookName(OWNER_COUNTS, vehicle.owner_count_id), icon: Users },
    { label: 'Typ obchodu', value: getCodebookName(DEAL_TYPES, vehicle.deal_type_id), icon: Info },
    { label: 'VIN', value: vehicle.vin, icon: Key },
  ].filter((s) => s.value);

  // Group equipment by category
  const equipmentByCategory = (vehicle.equipment ?? []).reduce<Record<string, typeof EQUIPMENT>>((acc, eq) => {
    const cat = eq.category ?? 'Ostatní';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(eq);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Link
        to="/hledat"
        className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Zpět na výsledky hledání
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Levá strana - galerie + info */}
        <div className="flex-1 min-w-0">
          {/* Galerie */}
          <div className="relative bg-surface-900 rounded-xl overflow-hidden border border-surface-800">
            <div className="relative aspect-[16/10]">
              <img
                src={images[currentImage]?.url}
                alt={`${vehicle.title} - obrázek ${currentImage + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Navigace */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((p) => (p > 0 ? p - 1 : images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((p) => (p < images.length - 1 ? p + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <span className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-black/60 text-white text-sm rounded-lg">
                <Camera className="w-4 h-4" />
                {currentImage + 1}/{images.length}
              </span>
            </div>

            {/* Thumbnaily */}
            {images.length > 1 && (
              <div className="flex gap-1.5 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === currentImage ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Technické údaje */}
          <div className="mt-6 bg-surface-900 rounded-xl border border-surface-800 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Technické údaje</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {specs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={`flex items-center justify-between py-3 px-4 ${
                    i % 2 === 0 ? 'bg-surface-900' : 'bg-surface-800/30'
                  } ${i < specs.length - (specs.length % 2 === 0 ? 2 : 1) ? 'border-b border-surface-800' : ''}`}
                >
                  <span className="flex items-center gap-2 text-sm text-surface-400">
                    <spec.icon className="w-4 h-4" />
                    {spec.label}
                  </span>
                  <span className="text-sm font-medium text-white">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Výbava */}
          {Object.keys(equipmentByCategory).length > 0 && (
            <div className="mt-6 bg-surface-900 rounded-xl border border-surface-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Výbava</h2>
              <div className="space-y-5">
                {Object.entries(equipmentByCategory).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-surface-300 mb-2 uppercase tracking-wider">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {items.map((eq) => (
                        <span key={eq.id} className="flex items-center gap-2 text-sm text-surface-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {eq.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popis */}
          {vehicle.description && (
            <div className="mt-6 bg-surface-900 rounded-xl border border-surface-800 p-6">
              <h2 className="text-lg font-bold text-white mb-3">Popis</h2>
              <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">
                {vehicle.description}
              </p>
            </div>
          )}
        </div>

        {/* Pravá strana - cena a prodejce */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Cena box */}
            <div className="bg-surface-900 rounded-xl border border-surface-800 p-6">
              <h1 className="text-xl font-bold text-white">{vehicle.title}</h1>
              {vehicle.model_variant && (
                <p className="text-sm text-surface-400 mt-1">{vehicle.model_variant}</p>
              )}

              <div className="flex items-center gap-3 mt-4">
                <span className="text-3xl font-extrabold text-white">
                  {formatPrice(vehicle.price)}
                </span>
              </div>

              {rating && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-6 h-2 rounded-sm ${
                          i <= (vehicle.price_rating === 'very_good' ? 5 : vehicle.price_rating === 'good' ? 4 : vehicle.price_rating === 'fair' ? 3 : 2)
                            ? rating.className
                            : 'bg-surface-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-surface-300">{rating.label}</span>
                </div>
              )}

              {vehicle.vat_deductible && (
                <p className="text-xs text-surface-500 mt-2">Možnost odpočtu DPH</p>
              )}

              {/* Klíčové parametry */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="p-3 bg-surface-800 rounded-lg">
                  <Gauge className="w-5 h-5 text-surface-400 mb-1" />
                  <p className="text-xs text-surface-500">Kilometry</p>
                  <p className="text-sm font-semibold text-white">{formatKm(vehicle.tachometer)}</p>
                </div>
                <div className="p-3 bg-surface-800 rounded-lg">
                  <Zap className="w-5 h-5 text-surface-400 mb-1" />
                  <p className="text-xs text-surface-500">Výkon</p>
                  <p className="text-sm font-semibold text-white">
                    {vehicle.engine_power ? formatPower(vehicle.engine_power) : '–'}
                  </p>
                </div>
                <div className="p-3 bg-surface-800 rounded-lg">
                  <Fuel className="w-5 h-5 text-surface-400 mb-1" />
                  <p className="text-xs text-surface-500">Palivo</p>
                  <p className="text-sm font-semibold text-white">{vehicle.fuel_name}</p>
                </div>
                <div className="p-3 bg-surface-800 rounded-lg">
                  <Settings className="w-5 h-5 text-surface-400 mb-1" />
                  <p className="text-xs text-surface-500">Převodovka</p>
                  <p className="text-sm font-semibold text-white">{vehicle.gearbox_name}</p>
                </div>
              </div>

              {/* Akce */}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => toggleFavorite(vehicle.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    fav
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-600'
                      : 'bg-surface-800 text-surface-300 border border-surface-700 hover:border-surface-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${fav ? 'fill-primary-400' : ''}`} />
                  {fav ? 'Uloženo' : 'Uložit'}
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-300 hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                  Sdílet
                </button>
              </div>
            </div>

            {/* Prodejce */}
            <div className="bg-surface-900 rounded-xl border border-surface-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-surface-800 rounded-full flex items-center justify-center text-surface-400">
                  {vehicle.seller_type === 'dealer' ? <Shield className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{vehicle.seller_name}</h3>
                  {vehicle.seller_rating && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.round(vehicle.seller_rating!) ? 'fill-amber-400' : 'text-surface-600'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-surface-400">({vehicle.seller_review_count})</span>
                    </div>
                  )}
                </div>
              </div>

              {vehicle.region_name && (
                <p className="flex items-center gap-2 text-sm text-surface-400 mb-4">
                  <MapPin className="w-4 h-4" />
                  {vehicle.region_name}
                </p>
              )}

              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-semibold text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  Napsat e-mail
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-surface-800 border border-surface-700 rounded-lg text-sm font-medium text-white hover:bg-surface-700 transition-colors">
                  <Phone className="w-4 h-4" />
                  Zobrazit telefon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
