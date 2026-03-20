import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X, Plus, Search, ArrowLeftRight, Check, Minus,
  Car, Gauge, Zap, Fuel, Settings, Calendar, Palette,
} from 'lucide-react';
import type { Vehicle } from '../types';
import { getMockVehicles } from '../lib/mock-data';
import {
  formatPrice, formatKm, formatPower, formatVolume, formatRegistration,
  getCodebookName, FUEL_TYPES, GEARBOX_TYPES, COLORS, CONDITIONS,
  DRIVE_TYPES, AIRCONDITION_TYPES, EURO_TYPES, DOOR_COUNTS,
  CAPACITY_TYPES, COUNTRIES, EQUIPMENT,
} from '../lib/codebooks';

const MAX_COMPARE = 3;

export default function ComparisonPage() {
  const [vehicles, setVehicles] = useState<(Vehicle | null)[]>([null, null]);
  const [searchOpen, setSearchOpen] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);

  const allVehicles = getMockVehicles(200);

  useEffect(() => {
    if (query.length >= 2) {
      const q = query.toLowerCase();
      setSearchResults(
        allVehicles
          .filter((v) => v.title.toLowerCase().includes(q) || v.manufacturer_name?.toLowerCase().includes(q))
          .slice(0, 8)
      );
    } else {
      setSearchResults(allVehicles.slice(0, 8));
    }
  }, [query]);

  const addVehicle = (slot: number, vehicle: Vehicle) => {
    const next = [...vehicles];
    next[slot] = vehicle;
    // Přidat výbavu
    next[slot]!.equipment = EQUIPMENT.slice(0, 10 + (vehicle.id % 25));
    setVehicles(next);
    setSearchOpen(null);
    setQuery('');
  };

  const removeVehicle = (slot: number) => {
    const next = [...vehicles];
    next[slot] = null;
    setVehicles(next);
  };

  const addSlot = () => {
    if (vehicles.length < MAX_COMPARE) {
      setVehicles([...vehicles, null]);
    }
  };

  const filled = vehicles.filter(Boolean) as Vehicle[];

  const specs: { label: string; getValue: (v: Vehicle) => string; highlight?: boolean }[] = [
    { label: 'Cena', getValue: (v) => formatPrice(v.price), highlight: true },
    { label: 'Stav', getValue: (v) => getCodebookName(CONDITIONS, v.condition_id) },
    { label: 'Rok výroby', getValue: (v) => formatRegistration(v.made_month, v.made_year) },
    { label: 'Najeté km', getValue: (v) => formatKm(v.tachometer), highlight: true },
    { label: 'Výkon', getValue: (v) => v.engine_power ? formatPower(v.engine_power) : '–' },
    { label: 'Objem motoru', getValue: (v) => v.engine_volume ? formatVolume(v.engine_volume) : '–' },
    { label: 'Palivo', getValue: (v) => getCodebookName(FUEL_TYPES, v.fuel_type_id) },
    { label: 'Převodovka', getValue: (v) => getCodebookName(GEARBOX_TYPES, v.gearbox_id) },
    { label: 'Pohon', getValue: (v) => getCodebookName(DRIVE_TYPES, v.drive_id) },
    { label: 'Barva', getValue: (v) => getCodebookName(COLORS, v.color_id) },
    { label: 'Dveře', getValue: (v) => getCodebookName(DOOR_COUNTS, v.door_count_id) },
    { label: 'Míst', getValue: (v) => getCodebookName(CAPACITY_TYPES, v.capacity_id) },
    { label: 'Klimatizace', getValue: (v) => getCodebookName(AIRCONDITION_TYPES, v.aircondition_id) },
    { label: 'Emisní norma', getValue: (v) => getCodebookName(EURO_TYPES, v.euro_id) },
    { label: 'Země původu', getValue: (v) => getCodebookName(COUNTRIES, v.country_id) },
    { label: 'DPH', getValue: (v) => v.vat_deductible ? 'Odpočet DPH' : 'Ne' },
  ];

  // Společná výbava a rozdílná
  const allEquipIds = filled.map((v) => new Set((v.equipment ?? []).map((e) => e.id)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ArrowLeftRight className="w-7 h-7 text-primary-500" />
          Porovnání vozidel
        </h1>
        <p className="text-surface-400 mt-2">Porovnejte až {MAX_COMPARE} vozidla vedle sebe</p>
      </div>

      {/* Vozidla nahoře */}
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: `repeat(${vehicles.length}, 1fr)` }}>
        {vehicles.map((v, i) => (
          <div key={i} className="bg-surface-900 rounded-xl border border-surface-800 overflow-hidden">
            {v ? (
              <>
                <div className="relative aspect-[4/3] bg-surface-800">
                  <img src={v.main_image_url} alt={v.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeVehicle(i)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <Link to={`/vozidlo/${v.id}`} className="text-sm font-semibold text-white hover:text-primary-400 transition-colors">
                    {v.title}
                  </Link>
                  <p className="text-lg font-bold text-white mt-1">{formatPrice(v.price)}</p>
                </div>
              </>
            ) : (
              <button
                onClick={() => { setSearchOpen(i); setQuery(''); }}
                className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-3 text-surface-500 hover:text-surface-300 hover:bg-surface-800/50 transition-colors p-4"
              >
                <Plus className="w-10 h-10" />
                <span className="text-sm font-medium">Přidat vozidlo</span>
              </button>
            )}
          </div>
        ))}
        {vehicles.length < MAX_COMPARE && (
          <button
            onClick={addSlot}
            className="bg-surface-900/50 rounded-xl border border-dashed border-surface-700 flex items-center justify-center gap-2 text-surface-500 hover:text-surface-300 hover:border-surface-500 transition-colors min-h-[200px]"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm">Přidat sloupec</span>
          </button>
        )}
      </div>

      {/* Search modal */}
      {searchOpen !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-900 rounded-xl border border-surface-800 w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-surface-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Vyberte vozidlo</h3>
                <button onClick={() => setSearchOpen(null)} className="text-surface-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Hledat podle značky nebo modelu..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-800 rounded-lg text-sm text-white placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-96 p-2">
              {searchResults.map((v) => (
                <button
                  key={v.id}
                  onClick={() => addVehicle(searchOpen, v)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-800 transition-colors text-left"
                >
                  <img src={v.main_thumbnail_url} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{v.title}</p>
                    <p className="text-xs text-surface-400">
                      {formatRegistration(v.made_month, v.made_year)} • {formatKm(v.tachometer)} • {v.fuel_name}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-white shrink-0">{formatPrice(v.price)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabulka porovnání */}
      {filled.length >= 2 && (
        <div className="bg-surface-900 rounded-xl border border-surface-800 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-800">
                <th className="py-3 px-4 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider w-40">Parametr</th>
                {vehicles.map((v, i) => (
                  <th key={i} className="py-3 px-4 text-center text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    {v?.title ?? '–'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specs.map((spec, si) => {
                const values = vehicles.map((v) => v ? spec.getValue(v) : '–');
                return (
                  <tr key={spec.label} className={si % 2 === 0 ? 'bg-surface-900' : 'bg-surface-800/20'}>
                    <td className="py-3 px-4 text-sm text-surface-400">{spec.label}</td>
                    {values.map((val, vi) => (
                      <td key={vi} className={`py-3 px-4 text-center text-sm ${spec.highlight ? 'font-semibold text-white' : 'text-surface-300'}`}>
                        {val || '–'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Výbava porovnání */}
          <div className="border-t border-surface-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Výbava</h3>
            <div className="space-y-1">
              {(() => {
                const allIds = new Set<number>();
                filled.forEach((v) => (v.equipment ?? []).forEach((e) => allIds.add(e.id)));
                const sorted = Array.from(allIds).sort((a, b) => {
                  const ea = EQUIPMENT.find((e) => e.id === a);
                  const eb = EQUIPMENT.find((e) => e.id === b);
                  return (ea?.name ?? '').localeCompare(eb?.name ?? '', 'cs');
                });
                return sorted.map((eqId) => {
                  const eq = EQUIPMENT.find((e) => e.id === eqId);
                  if (!eq) return null;
                  return (
                    <div key={eqId} className="flex items-center" style={{ display: 'grid', gridTemplateColumns: `10rem repeat(${vehicles.length}, 1fr)` }}>
                      <span className="text-xs text-surface-400 truncate pr-2">{eq.name}</span>
                      {vehicles.map((v, vi) => {
                        const has = v?.equipment?.some((e) => e.id === eqId);
                        return (
                          <span key={vi} className="flex justify-center">
                            {has ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : v ? (
                              <Minus className="w-4 h-4 text-surface-700" />
                            ) : null}
                          </span>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {filled.length < 2 && (
        <div className="text-center py-16">
          <ArrowLeftRight className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Vyberte alespoň 2 vozidla</h3>
          <p className="text-sm text-surface-400">Klikněte na „Přidat vozidlo" výše pro zahájení porovnání.</p>
        </div>
      )}
    </div>
  );
}
