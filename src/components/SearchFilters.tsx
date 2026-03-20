import { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useSearchStore } from '../stores/searchStore';
import {
  FUEL_TYPES, GEARBOX_TYPES, COLORS, CONDITIONS, DRIVE_TYPES,
  AIRCONDITION_TYPES, EURO_TYPES, DOOR_COUNTS, CAPACITY_TYPES,
  COUNTRIES, SERVICEBOOK_TYPES, VEHICLE_KINDS, REGIONS,
  EQUIPMENT, EQUIPMENT_CATEGORIES, YEAR_OPTIONS,
  BODY_TYPES, COLOR_TONES, COLOR_TYPES, AIRBAG_COUNTS, BED_COUNTS, AVAILABILITY_TYPES,
  UPHOLSTERY_TYPES, OWNER_COUNTS, DEAL_TYPES, SELLER_TYPES,
  MOTORCYCLE_TYPES, TRUCK_TYPES, BUS_TYPES, TRAILER_TYPES,
  GEARBOX_LEVELS, CERTIFIED_PROGRAMS, SEATPLACE_TYPES,
  formatPrice,
} from '../lib/codebooks';
import { MANUFACTURERS } from '../lib/manufacturers';

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: unknown;
  onChange: (val: unknown) => void;
  options: { id: number; name: string }[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-surface-400 mb-1">{label}</label>
      <select
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
      >
        <option value="">{placeholder ?? 'Libovolné'}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </div>
  );
}

export default function SearchFilters() {
  const { filters, setFilter, resetFilters, search } = useSearchStore();
  const [showMore, setShowMore] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedMfr = filters.manufacturer_id;
  const currentModels = selectedMfr
    ? MANUFACTURERS.find((m) => m.id === selectedMfr)?.models ?? []
    : [];

  const regionGroups = REGIONS.reduce<Record<string, typeof REGIONS>>((acc, r) => {
    const g = r.region_group ?? 'Ostatní';
    if (!acc[g]) acc[g] = [];
    acc[g].push(r);
    return acc;
  }, {});

  const filtersContent = (
    <div className="space-y-4">
      {/* Typ vozidla */}
      <Select
        label="Typ vozidla"
        value={filters.kind_id}
        onChange={(v) => { setFilter('kind_id', v); search(); }}
        options={VEHICLE_KINDS}
      />

      {/* Stav */}
      <Select
        label="Stav vozidla"
        value={filters.condition_id}
        onChange={(v) => { setFilter('condition_id', v); search(); }}
        options={CONDITIONS}
      />

      {/* Značka */}
      <div>
        <label className="block text-xs font-medium text-surface-400 mb-1">Značka</label>
        <select
          value={filters.manufacturer_id ?? ''}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : undefined;
            setFilter('manufacturer_id', val);
            setFilter('model_id', undefined);
            search();
          }}
          className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
        >
          <option value="">Libovolná značka</option>
          {MANUFACTURERS.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div>
        <label className="block text-xs font-medium text-surface-400 mb-1">Model</label>
        <select
          value={filters.model_id ?? ''}
          onChange={(e) => { setFilter('model_id', e.target.value ? Number(e.target.value) : undefined); search(); }}
          disabled={!selectedMfr}
          className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer disabled:opacity-50"
        >
          <option value="">Libovolný model</option>
          {currentModels.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Cena */}
      <div>
        <label className="block text-xs font-medium text-surface-400 mb-1">Cena</label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.price_from ?? ''}
            onChange={(e) => { setFilter('price_from', e.target.value ? Number(e.target.value) : undefined); search(); }}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
          >
            <option value="">od</option>
            {[0, 50000, 100000, 200000, 300000, 500000, 750000, 1000000].map((p) => (
              <option key={p} value={p}>{formatPrice(p)}</option>
            ))}
          </select>
          <select
            value={filters.price_to ?? ''}
            onChange={(e) => { setFilter('price_to', e.target.value ? Number(e.target.value) : undefined); search(); }}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
          >
            <option value="">do</option>
            {[100000, 200000, 300000, 500000, 750000, 1000000, 1500000, 2000000, 3000000].map((p) => (
              <option key={p} value={p}>{formatPrice(p)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rok výroby */}
      <div>
        <label className="block text-xs font-medium text-surface-400 mb-1">Rok první registrace</label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.year_from ?? ''}
            onChange={(e) => { setFilter('year_from', e.target.value ? Number(e.target.value) : undefined); search(); }}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
          >
            <option value="">od</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={filters.year_to ?? ''}
            onChange={(e) => { setFilter('year_to', e.target.value ? Number(e.target.value) : undefined); search(); }}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
          >
            <option value="">do</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kilometry */}
      <div>
        <label className="block text-xs font-medium text-surface-400 mb-1">Najeté kilometry</label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.km_from ?? ''}
            onChange={(e) => { setFilter('km_from', e.target.value ? Number(e.target.value) : undefined); search(); }}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
          >
            <option value="">od</option>
            {[0, 10000, 25000, 50000, 75000, 100000].map((k) => (
              <option key={k} value={k}>{new Intl.NumberFormat('cs-CZ').format(k)} km</option>
            ))}
          </select>
          <select
            value={filters.km_to ?? ''}
            onChange={(e) => { setFilter('km_to', e.target.value ? Number(e.target.value) : undefined); search(); }}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
          >
            <option value="">do</option>
            {[10000, 30000, 50000, 75000, 100000, 150000, 200000, 300000].map((k) => (
              <option key={k} value={k}>{new Intl.NumberFormat('cs-CZ').format(k)} km</option>
            ))}
          </select>
        </div>
      </div>

      {/* Palivo */}
      <Select
        label="Palivo"
        value={filters.fuel_type_id}
        onChange={(v) => { setFilter('fuel_type_id', v); search(); }}
        options={FUEL_TYPES}
      />

      {/* Převodovka */}
      <Select
        label="Převodovka"
        value={filters.gearbox_id}
        onChange={(v) => { setFilter('gearbox_id', v); search(); }}
        options={GEARBOX_TYPES}
      />

      {/* Počet stupňů převodovky */}
      <Select
        label="Počet stupňů"
        value={filters.gearbox_level_id}
        onChange={(v) => { setFilter('gearbox_level_id', v); search(); }}
        options={GEARBOX_LEVELS}
      />

      {/* Rozšířené filtry */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-2 w-full py-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
      >
        {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showMore ? 'Méně filtrů' : 'Další filtry'}
      </button>

      {showMore && (
        <div className="space-y-4 pt-2 border-t border-surface-800">
          <Select label="Karoserie" value={filters.body_type_id} onChange={(v) => { setFilter('body_type_id', v); search(); }} options={BODY_TYPES} />
          <Select label="Pohon" value={filters.drive_id} onChange={(v) => { setFilter('drive_id', v); search(); }} options={DRIVE_TYPES} />
          <Select label="Barva" value={filters.color_id} onChange={(v) => { setFilter('color_id', v); search(); }} options={COLORS} />
          <Select label="Odstín laku" value={filters.color_tone_id} onChange={(v) => { setFilter('color_tone_id', v); search(); }} options={COLOR_TONES} />
          <Select label="Typ laku" value={filters.color_type_id} onChange={(v) => { setFilter('color_type_id', v); search(); }} options={COLOR_TYPES} />
          <Select label="Klimatizace" value={filters.aircondition_id} onChange={(v) => { setFilter('aircondition_id', v); search(); }} options={AIRCONDITION_TYPES} />
          <Select label="Emisní norma" value={filters.euro_id} onChange={(v) => { setFilter('euro_id', v); search(); }} options={EURO_TYPES} />
          <Select label="Počet dveří" value={filters.door_count_id} onChange={(v) => { setFilter('door_count_id', v); search(); }} options={DOOR_COUNTS} />
          <Select label="Počet míst" value={filters.capacity_id} onChange={(v) => { setFilter('capacity_id', v); search(); }} options={CAPACITY_TYPES} />
          <Select label="Počet airbagů" value={filters.airbag_count_id} onChange={(v) => { setFilter('airbag_count_id', v); search(); }} options={AIRBAG_COUNTS} />
          <Select label="Počet lůžek" value={filters.bed_count_id} onChange={(v) => { setFilter('bed_count_id', v); search(); }} options={BED_COUNTS} placeholder="Pro obytné vozy" />
          <Select label="Dostupnost" value={filters.availability_id} onChange={(v) => { setFilter('availability_id', v); search(); }} options={AVAILABILITY_TYPES} />
          <Select label="Servisní knížka" value={filters.servicebook_id} onChange={(v) => { setFilter('servicebook_id', v); search(); }} options={SERVICEBOOK_TYPES} />
          <Select label="Země původu" value={filters.country_id} onChange={(v) => { setFilter('country_id', v); search(); }} options={COUNTRIES} />
          <Select label="Potahy sedadel" value={filters.upholstery_id} onChange={(v) => { setFilter('upholstery_id', v); search(); }} options={UPHOLSTERY_TYPES} />
          <Select label="Počet vlastníků" value={filters.owner_count_id} onChange={(v) => { setFilter('owner_count_id', v); search(); }} options={OWNER_COUNTS} />
          <Select label="Typ obchodu" value={filters.deal_type_id} onChange={(v) => { setFilter('deal_type_id', v); search(); }} options={DEAL_TYPES} />
          <Select label="Typ prodejce" value={filters.seller_type_id} onChange={(v) => { setFilter('seller_type_id', v); search(); }} options={SELLER_TYPES} />
          <Select label="Ověřený program" value={filters.certified_id} onChange={(v) => { setFilter('certified_id', v); search(); }} options={CERTIFIED_PROGRAMS} />

          {/* Typově specifické filtry */}
          {filters.kind_id === 3 && (
            <Select label="Typ motocyklu" value={filters.motorcycle_type_id} onChange={(v) => { setFilter('motorcycle_type_id', v); search(); }} options={MOTORCYCLE_TYPES} />
          )}
          {filters.kind_id === 5 && (
            <Select label="Typ nákladního vozu" value={filters.truck_type_id} onChange={(v) => { setFilter('truck_type_id', v); search(); }} options={TRUCK_TYPES} />
          )}
          {filters.kind_id === 6 && (
            <>
              <Select label="Typ autobusu" value={filters.bus_type_id} onChange={(v) => { setFilter('bus_type_id', v); search(); }} options={BUS_TYPES} />
              <Select label="Kategorie sedadel" value={filters.seatplace_id} onChange={(v) => { setFilter('seatplace_id', v); search(); }} options={SEATPLACE_TYPES} />
            </>
          )}
          {filters.kind_id === 7 && (
            <Select label="Typ přívěsu" value={filters.trailer_type_id} onChange={(v) => { setFilter('trailer_type_id', v); search(); }} options={TRAILER_TYPES} />
          )}

          {/* Objem motoru (ccm) */}
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1">Objem motoru (ccm)</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.volume_from ?? ''}
                onChange={(e) => { setFilter('volume_from', e.target.value ? Number(e.target.value) : undefined); search(); }}
                className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
              >
                <option value="">od</option>
                {[800, 1000, 1200, 1400, 1600, 1800, 2000, 2500, 3000].map((v) => (
                  <option key={v} value={v}>{(v / 1000).toFixed(1)} l</option>
                ))}
              </select>
              <select
                value={filters.volume_to ?? ''}
                onChange={(e) => { setFilter('volume_to', e.target.value ? Number(e.target.value) : undefined); search(); }}
                className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
              >
                <option value="">do</option>
                {[1000, 1200, 1400, 1600, 1800, 2000, 2500, 3000, 4000, 5000, 6000].map((v) => (
                  <option key={v} value={v}>{(v / 1000).toFixed(1)} l</option>
                ))}
              </select>
            </div>
          </div>

          {/* Výkon */}
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1">Výkon (kW)</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.power_from ?? ''}
                onChange={(e) => { setFilter('power_from', e.target.value ? Number(e.target.value) : undefined); search(); }}
                className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
              >
                <option value="">od</option>
                {[44, 55, 66, 85, 100, 120, 150, 200, 250].map((p) => (
                  <option key={p} value={p}>{p} kW ({Math.round(p * 1.36)} PS)</option>
                ))}
              </select>
              <select
                value={filters.power_to ?? ''}
                onChange={(e) => { setFilter('power_to', e.target.value ? Number(e.target.value) : undefined); search(); }}
                className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
              >
                <option value="">do</option>
                {[66, 85, 100, 120, 150, 200, 250, 300, 400].map((p) => (
                  <option key={p} value={p}>{p} kW ({Math.round(p * 1.36)} PS)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Standort / Region */}
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1">Okres</label>
            <select
              value={filters.region_id ?? ''}
              onChange={(e) => { setFilter('region_id', e.target.value ? Number(e.target.value) : undefined); search(); }}
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
            >
              <option value="">Celá ČR</option>
              {Object.entries(regionGroups).map(([group, regions]) => (
                <optgroup key={group} label={group}>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Checkboxy */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.vat_deductible ?? false}
                onChange={(e) => { setFilter('vat_deductible', e.target.checked || undefined); search(); }}
                className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-sm text-surface-300 group-hover:text-surface-100 transition-colors">Odpočet DPH</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.first_owner ?? false}
                onChange={(e) => { setFilter('first_owner', e.target.checked || undefined); search(); }}
                className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-sm text-surface-300 group-hover:text-surface-100 transition-colors">První majitel</span>
            </label>
          </div>

          {/* Výbava */}
          <div>
            <button
              onClick={() => setShowEquipment(!showEquipment)}
              className="flex items-center gap-2 w-full py-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              {showEquipment ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Výbava ({filters.equipment_ids?.length || 0} vybráno)
            </button>

            {showEquipment && (
              <div className="mt-2 max-h-80 overflow-y-auto space-y-4 pr-2">
                {EQUIPMENT_CATEGORIES.map((cat) => {
                  const items = EQUIPMENT.filter((e) => e.category === cat);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat}>
                      <h4 className="text-xs font-semibold text-surface-300 mb-2 uppercase tracking-wider">{cat}</h4>
                      <div className="space-y-1">
                        {items.map((eq) => {
                          const checked = filters.equipment_ids?.includes(eq.id) ?? false;
                          return (
                            <label key={eq.id} className="flex items-center gap-2 py-1 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const ids = filters.equipment_ids ?? [];
                                  const next = checked ? ids.filter((i) => i !== eq.id) : [...ids, eq.id];
                                  setFilter('equipment_ids', next.length > 0 ? next : undefined);
                                  search();
                                }}
                                className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-600 focus:ring-primary-600"
                              />
                              <span className="text-xs text-surface-300 group-hover:text-surface-100 transition-colors">
                                {eq.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={() => { resetFilters(); search(); }}
        className="flex items-center gap-2 w-full py-2.5 text-sm text-surface-400 hover:text-surface-100 border border-surface-700 rounded-lg justify-center transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Resetovat filtry
      </button>
    </div>
  );

  return (
    <>
      {/* Mobilní toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden flex items-center gap-2 w-full py-3 px-4 bg-surface-900 border border-surface-800 rounded-xl text-sm font-medium text-surface-100 mb-4"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtry
        {mobileOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </button>

      {/* Desktop */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-20 bg-surface-900 rounded-xl border border-surface-800 p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          {filtersContent}
        </div>
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <div className="lg:hidden bg-surface-900 rounded-xl border border-surface-800 p-4 mb-4">
          {filtersContent}
        </div>
      )}
    </>
  );
}
