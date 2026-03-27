import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Warehouse, Share2, Phone, Mail, MapPin,
  Calendar, Gauge, Zap, Fuel, Settings, Palette,
  Shield, Star, ChevronLeft, ChevronRight, Camera,
  Check, Info, Car, Globe, BookOpen, DoorOpen, Users,
  Wind, Leaf, Key, Search, Loader2,
} from 'lucide-react';
import { decodeVin, type VinDecodeResult } from '../lib/vin-decoder';
import { EQUIPMENT } from '../lib/codebooks';
import { useVehicle } from '../hooks/useVehicles';
import {
  formatPrice, formatKm, formatPower, formatVolume,
  formatRegistration, getCodebookName,
  FUEL_TYPES, GEARBOX_TYPES, COLORS, CONDITIONS,
  DRIVE_TYPES, AIRCONDITION_TYPES, EURO_TYPES,
  DOOR_COUNTS, CAPACITY_TYPES, COUNTRIES, SERVICEBOOK_TYPES,
  BODY_TYPES, UPHOLSTERY_TYPES, OWNER_COUNTS, DEAL_TYPES,
  COLOR_TYPES, GEARBOX_LEVELS, CERTIFIED_PROGRAMS,
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
  const { data: rawVehicle, isLoading } = useVehicle(id ? Number(id) : undefined);
  const [currentImage, setCurrentImage] = useState(0);
  const [vinResult, setVinResult] = useState<VinDecodeResult | null>(null);
  const [vinLoading, setVinLoading] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  useState(() => { window.scrollTo(0, 0); });

  const vehicle = rawVehicle ? {
    ...rawVehicle,
    equipment: rawVehicle.equipment?.length ? rawVehicle.equipment : EQUIPMENT.slice(0, 15 + (Number(id) % 20)),
  } : null;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
        <p className="text-sm text-surface-400">Načítání vozidla...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Car className="w-12 h-12 text-surface-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-surface-100 mb-2">Vozidlo nebylo nalezeno</h2>
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
    { label: 'Typ laku', value: getCodebookName(COLOR_TYPES, vehicle.color_type_id), icon: Palette },
    { label: 'Počet stupňů', value: getCodebookName(GEARBOX_LEVELS, vehicle.gearbox_level_id), icon: Settings },
    { label: 'Ověřený program', value: getCodebookName(CERTIFIED_PROGRAMS, vehicle.certified_id), icon: Shield },
    { label: 'STK do', value: vehicle.stk_date, icon: Calendar },
    { label: 'Záruka do', value: vehicle.guarantee_date, icon: Calendar },
    { label: 'Spotřeba', value: vehicle.gas_mileage ? `${vehicle.gas_mileage} l/100km` : undefined, icon: Fuel },
    { label: 'Hmotnost', value: vehicle.weight ? `${vehicle.weight} kg` : undefined, icon: Info },
    { label: 'VIN', value: vehicle.vin, icon: Key },
  ].filter((s) => s.value);

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
        className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-100 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Zpět na výsledky
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Levá strana */}
        <div className="flex-1 min-w-0">
          {/* Galerie */}
          <div className="relative bg-surface-850 rounded-2xl overflow-hidden">
            <div className="relative aspect-[16/10]">
              <img
                src={images[currentImage]?.url}
                alt={`${vehicle.title} - obrázek ${currentImage + 1}`}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((p) => (p > 0 ? p - 1 : images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((p) => (p < images.length - 1 ? p + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <span className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full">
                <Camera className="w-4 h-4" />
                {currentImage + 1}/{images.length}
              </span>
            </div>

            {images.length > 1 && (
              <div className="flex gap-1.5 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      i === currentImage ? 'border-primary-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Technické údaje — tonal grid */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-surface-50 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Technické údaje
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-center justify-between py-3 px-4 bg-surface-900 rounded-lg"
                >
                  <span className="flex items-center gap-2.5 text-sm text-surface-400">
                    <spec.icon className="w-4 h-4 text-surface-500" />
                    {spec.label}
                  </span>
                  <span className="text-sm font-medium text-surface-100">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* VIN dekódování */}
          {vehicle.vin && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-surface-50 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Key className="w-5 h-5 text-primary-500" />
                  VIN: <span className="font-mono tracking-wider">{vehicle.vin}</span>
                </h2>
                {!vinResult && (
                  <button
                    onClick={async () => {
                      setVinLoading(true);
                      const result = await decodeVin(vehicle.vin!);
                      setVinResult(result);
                      setVinLoading(false);
                    }}
                    disabled={vinLoading}
                    className="px-4 py-2 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 disabled:from-surface-600 disabled:to-surface-700 rounded-lg text-sm font-medium text-white transition-all flex items-center gap-2"
                  >
                    {vinLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Dekóduji...</>
                    ) : (
                      <><Search className="w-4 h-4" /> Ověřit VIN</>
                    )}
                  </button>
                )}
              </div>

              {vinResult && vinResult.valid && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: 'Výrobce', value: vinResult.manufacturer },
                      { label: 'Model', value: vinResult.model },
                      { label: 'Varianta', value: vinResult.model_variant },
                      { label: 'Rok výroby', value: vinResult.year },
                      { label: 'Karoserie', value: vinResult.body_type },
                      { label: 'Palivo', value: vinResult.fuel_type },
                      { label: 'Objem motoru', value: vinResult.engine_volume ? `${vinResult.engine_volume} ccm` : undefined },
                      { label: 'Výkon', value: vinResult.engine_power ? `${vinResult.engine_power} kW` : undefined },
                      { label: 'Pohon', value: vinResult.drive_type },
                      { label: 'Převodovka', value: vinResult.gearbox },
                      { label: 'Barva', value: vinResult.color },
                      { label: 'Počet míst', value: vinResult.capacity },
                      { label: 'Hmotnost', value: vinResult.weight },
                      { label: 'Max. rychlost', value: vinResult.top_speed },
                      { label: '0-100 km/h', value: vinResult.acceleration },
                      { label: 'CO₂', value: vinResult.co2_emissions },
                      { label: 'Spotřeba', value: vinResult.fuel_consumption },
                      { label: 'Země výroby', value: vinResult.country },
                    ].filter((i) => i.value).map((item) => (
                      <div key={item.label} className="p-3 bg-surface-900 rounded-lg">
                        <p className="text-xs text-surface-500">{item.label}</p>
                        <p className="text-sm font-medium text-surface-100 mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {vinResult.equipment && vinResult.equipment.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-surface-100 mb-3">
                        Výbava dle VIN ({vinResult.equipment.length} položek)
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(
                          vinResult.equipment.reduce<Record<string, typeof vinResult.equipment>>((acc, eq) => {
                            const cat = eq.category || 'Ostatní';
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat]!.push(eq);
                            return acc;
                          }, {})
                        ).map(([category, items]) => (
                          <div key={category}>
                            <h4 className="text-xs font-semibold text-surface-400 mb-2 uppercase tracking-wider">{category}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {items!.map((eq, i) => (
                                <span key={i} className="flex items-center gap-2 text-sm text-surface-300">
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  {eq.name}
                                  {eq.code && <span className="text-xs text-surface-600">({eq.code})</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {vinResult.source && (
                    <p className="text-xs text-surface-600 mt-3">
                      Zdroj: {vinResult.source === 'vindecoder' ? 'vindecoder.eu' : vinResult.source === 'nhtsa' ? 'NHTSA vPIC' : 'offline WMI'}
                    </p>
                  )}
                </>
              )}

              {vinResult && !vinResult.valid && (
                <p className="text-sm text-red-400">{vinResult.error}</p>
              )}
            </div>
          )}

          {/* Výbava */}
          {Object.keys(equipmentByCategory).length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-surface-50 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Výbava
              </h2>
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
            <div className="mt-8">
              <h2 className="text-lg font-bold text-surface-50 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                Popis
              </h2>
              <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">
                {vehicle.description}
              </p>
            </div>
          )}
        </div>

        {/* Pravá strana — sticky sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Cena box */}
            <div className="bg-surface-950 rounded-2xl shadow-sm p-6">
              <h1 className="text-xl font-bold text-surface-50" style={{ fontFamily: 'var(--font-display)' }}>
                {vehicle.title}
              </h1>
              {vehicle.model_variant && (
                <p className="text-sm text-surface-400 mt-1">{vehicle.model_variant}</p>
              )}

              <div className="flex items-center gap-3 mt-4">
                <span className="text-3xl font-extrabold text-surface-50">
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
                            : 'bg-surface-800'
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
              <div className="grid grid-cols-2 gap-2 mt-5">
                {[
                  { icon: Gauge, label: 'Kilometry', value: formatKm(vehicle.tachometer) },
                  { icon: Zap, label: 'Výkon', value: vehicle.engine_power ? formatPower(vehicle.engine_power) : '–' },
                  { icon: Fuel, label: 'Palivo', value: vehicle.fuel_name },
                  { icon: Settings, label: 'Převodovka', value: vehicle.gearbox_name },
                ].map((p) => (
                  <div key={p.label} className="p-3 bg-surface-900 rounded-xl">
                    <p.icon className="w-4 h-4 text-surface-500 mb-1" />
                    <p className="text-[10px] text-surface-500 uppercase tracking-wide">{p.label}</p>
                    <p className="text-sm font-semibold text-surface-100 mt-0.5">{p.value}</p>
                  </div>
                ))}
              </div>

              {/* Akce */}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => toggleFavorite(vehicle.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    fav
                      ? 'bg-primary-500/15 text-primary-500'
                      : 'bg-surface-900 text-surface-300 hover:text-surface-100'
                  }`}
                >
                  <Warehouse className={`w-4 h-4 ${fav ? 'fill-primary-500' : ''}`} />
                  {fav ? 'V garáži' : 'Do garáže'}
                </button>
                <button
                  onClick={async () => {
                    const url = window.location.href;
                    if (navigator.share) {
                      try { await navigator.share({ title: vehicle.title, url }); } catch { /* cancelled */ }
                    } else {
                      await navigator.clipboard.writeText(url);
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-900 rounded-lg text-sm text-surface-300 hover:text-surface-100 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Sdílet
                </button>
              </div>
            </div>

            {/* Prodejce */}
            <div className="bg-surface-950 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-surface-850 rounded-full flex items-center justify-center text-surface-400">
                  {vehicle.seller_type === 'dealer' ? <Shield className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-surface-100">{vehicle.seller_name}</h3>
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
                <p className="flex items-center gap-2 text-sm text-surface-400 mb-5">
                  <MapPin className="w-4 h-4" />
                  {vehicle.region_name}
                </p>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (vehicle.seller_email) {
                      window.location.href = `mailto:${vehicle.seller_email}`;
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 rounded-xl text-sm font-semibold text-white transition-all shadow-sm hover:shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  Napsat e-mail
                </button>
                {phoneVisible && vehicle.seller_phone ? (
                  <a
                    href={`tel:${vehicle.seller_phone}`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-surface-900 rounded-xl text-sm font-medium text-surface-100 hover:bg-surface-800 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {vehicle.seller_phone}
                  </a>
                ) : (
                  <button
                    onClick={() => setPhoneVisible(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-surface-900 rounded-xl text-sm font-medium text-surface-100 hover:bg-surface-800 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Zobrazit telefon
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
