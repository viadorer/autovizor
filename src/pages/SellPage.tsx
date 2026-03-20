import { useState, useCallback } from 'react';
import {
  Car, Camera, Upload, Info, Phone, Mail, MapPin,
  ChevronDown, ChevronUp, Check, AlertCircle, Loader2, Search,
} from 'lucide-react';
import { decodeVin, validateVin, isVindecoderAvailable, type VinDecodeResult } from '../lib/vin-decoder';
import {
  VEHICLE_KINDS, FUEL_TYPES, GEARBOX_TYPES, COLORS, CONDITIONS,
  DRIVE_TYPES, BODY_TYPES, AIRCONDITION_TYPES, EURO_TYPES,
  DOOR_COUNTS, CAPACITY_TYPES, COUNTRIES, REGIONS, YEAR_OPTIONS,
  COLOR_TONES, EQUIPMENT, EQUIPMENT_CATEGORIES,
  UPHOLSTERY_TYPES, OWNER_COUNTS, DEAL_TYPES,
  MOTORCYCLE_TYPES, TRUCK_TYPES, BUS_TYPES, TRAILER_TYPES,
} from '../lib/codebooks';
import { MOCK_MANUFACTURERS_LIST } from '../lib/mock-data';

interface FormData {
  kind_id: string;
  manufacturer_id: string;
  model_id: string;
  body_type_id: string;
  condition_id: string;
  title: string;
  price: string;
  vat_deductible: boolean;
  fuel_type_id: string;
  gearbox_id: string;
  drive_id: string;
  engine_volume: string;
  engine_power: string;
  tachometer: string;
  made_year: string;
  made_month: string;
  color_id: string;
  color_tone_id: string;
  door_count_id: string;
  capacity_id: string;
  aircondition_id: string;
  euro_id: string;
  country_id: string;
  region_id: string;
  upholstery_id: string;
  owner_count_id: string;
  deal_type_id: string;
  vin: string;
  description: string;
  seller_name: string;
  seller_phone: string;
  seller_email: string;
  equipment_ids: number[];
}

const INITIAL: FormData = {
  kind_id: '1', manufacturer_id: '', model_id: '', body_type_id: '',
  condition_id: '', title: '', price: '', vat_deductible: false,
  fuel_type_id: '', gearbox_id: '', drive_id: '', engine_volume: '',
  engine_power: '', tachometer: '', made_year: '', made_month: '',
  color_id: '', color_tone_id: '', door_count_id: '', capacity_id: '',
  aircondition_id: '', euro_id: '', country_id: '1', region_id: '',
  upholstery_id: '', owner_count_id: '', deal_type_id: '',
  vin: '', description: '', seller_name: '', seller_phone: '',
  seller_email: '', equipment_ids: [],
};

function FormSelect({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { id: number; name: string }[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-surface-300 mb-1.5">
        {label} {required && <span className="text-primary-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
      >
        <option value="">Vyberte...</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </div>
  );
}

function FormInput({ label, value, onChange, type = 'text', placeholder, required, suffix }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; suffix?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-surface-300 mb-1.5">
        {label} {required && <span className="text-primary-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-600"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export default function SellPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [step, setStep] = useState(1);
  const [showEquipment, setShowEquipment] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [vinLoading, setVinLoading] = useState(false);
  const [vinResult, setVinResult] = useState<VinDecodeResult | null>(null);
  const [vinError, setVinError] = useState<string | null>(null);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // VIN dekódování - najde odpovídající ID z číselníku podle názvu
  const findCodebookId = (items: { id: number; name: string }[], search?: string): string => {
    if (!search) return '';
    const lower = search.toLowerCase();
    const found = items.find((i) => i.name.toLowerCase().includes(lower) || lower.includes(i.name.toLowerCase()));
    return found ? String(found.id) : '';
  };

  const findManufacturerId = (name?: string): string => {
    if (!name) return '';
    const lower = name.toLowerCase();
    const found = MOCK_MANUFACTURERS_LIST.find(
      (m) => m.name.toLowerCase() === lower || lower.includes(m.name.toLowerCase())
    );
    return found ? String(found.id) : '';
  };

  const findModelId = (mfrId: string, modelName?: string): string => {
    if (!mfrId || !modelName) return '';
    const mfr = MOCK_MANUFACTURERS_LIST.find((m) => m.id === Number(mfrId));
    if (!mfr) return '';
    const lower = modelName.toLowerCase();
    const found = mfr.models.find(
      (m) => m.name.toLowerCase() === lower || lower.includes(m.name.toLowerCase())
    );
    return found ? String(found.id) : '';
  };

  const handleVinDecode = useCallback(async () => {
    const validation = validateVin(form.vin);
    if (!validation.valid) {
      setVinError(validation.error ?? 'Neplatný VIN');
      setVinResult(null);
      return;
    }

    setVinLoading(true);
    setVinError(null);
    setVinResult(null);

    try {
      const result = await decodeVin(form.vin);
      setVinResult(result);

      if (!result.valid) {
        setVinError(result.error ?? 'Nepodařilo se dekódovat VIN');
        return;
      }

      // Automatické vyplnění formuláře z dekódovaného VIN
      setForm((prev) => {
        const mfrId = findManufacturerId(result.manufacturer);
        const mdlId = findModelId(mfrId, result.model);

        return {
          ...prev,
          manufacturer_id: mfrId || prev.manufacturer_id,
          model_id: mdlId || prev.model_id,
          made_year: result.year ? String(result.year) : prev.made_year,
          fuel_type_id: findCodebookId(FUEL_TYPES, result.fuel_type) || prev.fuel_type_id,
          gearbox_id: findCodebookId(GEARBOX_TYPES, result.gearbox) || prev.gearbox_id,
          drive_id: findCodebookId(DRIVE_TYPES, result.drive_type) || prev.drive_id,
          body_type_id: findCodebookId(BODY_TYPES, result.body_type) || prev.body_type_id,
          door_count_id: findCodebookId(DOOR_COUNTS, result.door_count) || prev.door_count_id,
          engine_volume: result.engine_volume || prev.engine_volume,
          engine_power: result.engine_power || prev.engine_power,
          title: result.manufacturer && result.model
            ? `${result.manufacturer} ${result.model}${result.year ? ` ${result.year}` : ''}`
            : prev.title,
        };
      });
    } catch {
      setVinError('Nepodařilo se dekódovat VIN');
    } finally {
      setVinLoading(false);
    }
  }, [form.vin]);

  const toggleEquip = (id: number) => {
    set('equipment_ids',
      form.equipment_ids.includes(id)
        ? form.equipment_ids.filter((i) => i !== id)
        : [...form.equipment_ids, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-surface-100 mb-3">Inzerát byl odeslán</h1>
        <p className="text-surface-400 mb-8">
          Váš inzerát bude zkontrolován a zveřejněn do 24 hodin.
          O zveřejnění vás budeme informovat e-mailem.
        </p>
        <button
          onClick={() => { setForm(INITIAL); setStep(1); setSubmitted(false); }}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium text-white transition-colors"
        >
          Vložit další inzerát
        </button>
      </div>
    );
  }

  const regionGroups = REGIONS.reduce<Record<string, typeof REGIONS>>((acc, r) => {
    const g = r.region_group ?? 'Ostatní';
    if (!acc[g]) acc[g] = [];
    acc[g].push(r);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-100">Prodat vozidlo</h1>
        <p className="text-surface-400 mt-2">Vytvořte inzerát a oslovte tisíce zájemců</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: 'Základní údaje' },
          { n: 2, label: 'Technické parametry' },
          { n: 3, label: 'Výbava a popis' },
          { n: 4, label: 'Fotografie a kontakt' },
        ].map((s) => (
          <button
            key={s.n}
            onClick={() => setStep(s.n)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
              step === s.n
                ? 'bg-primary-600 text-white'
                : step > s.n
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'bg-surface-800 text-surface-500'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Krok 1: Základní údaje */}
        {step === 1 && (
          <div className="bg-surface-900 rounded-xl border border-surface-800 p-6 space-y-5">
            <h2 className="text-lg font-bold text-surface-100 flex items-center gap-2">
              <Car className="w-5 h-5 text-primary-500" />
              Základní údaje o vozidle
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect label="Typ vozidla" value={form.kind_id} onChange={(v) => set('kind_id', v)} options={VEHICLE_KINDS} required />
              <FormSelect label="Stav" value={form.condition_id} onChange={(v) => set('condition_id', v)} options={CONDITIONS} required />
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  Značka <span className="text-primary-500">*</span>
                </label>
                <select
                  value={form.manufacturer_id}
                  onChange={(e) => { set('manufacturer_id', e.target.value); set('model_id', ''); }}
                  required
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
                >
                  <option value="">Vyberte značku...</option>
                  {MOCK_MANUFACTURERS_LIST.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  Model <span className="text-primary-500">*</span>
                </label>
                <select
                  value={form.model_id}
                  onChange={(e) => set('model_id', e.target.value)}
                  required
                  disabled={!form.manufacturer_id}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Vyberte model...</option>
                  {form.manufacturer_id && MOCK_MANUFACTURERS_LIST.find((m) => m.id === Number(form.manufacturer_id))?.models.map((mod) => (
                    <option key={mod.id} value={mod.id}>{mod.name}</option>
                  ))}
                </select>
              </div>
              <FormSelect label="Karoserie" value={form.body_type_id} onChange={(v) => set('body_type_id', v)} options={BODY_TYPES} />
              <FormInput label="Název inzerátu" value={form.title} onChange={(v) => set('title', v)} placeholder="např. Škoda Octavia 2.0 TDI Elegance" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Cena" value={form.price} onChange={(v) => set('price', v)} type="number" placeholder="0" suffix="Kč" required />
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.vat_deductible}
                    onChange={(e) => set('vat_deductible', e.target.checked)}
                    className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-600 focus:ring-primary-600"
                  />
                  <span className="text-sm text-surface-300">Možnost odpočtu DPH</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium text-white transition-colors">
                Pokračovat
              </button>
            </div>
          </div>
        )}

        {/* Krok 2: Technické parametry */}
        {step === 2 && (
          <div className="bg-surface-900 rounded-xl border border-surface-800 p-6 space-y-5">
            <h2 className="text-lg font-bold text-surface-100 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary-500" />
              Technické parametry
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormSelect label="Palivo" value={form.fuel_type_id} onChange={(v) => set('fuel_type_id', v)} options={FUEL_TYPES} required />
              <FormSelect label="Převodovka" value={form.gearbox_id} onChange={(v) => set('gearbox_id', v)} options={GEARBOX_TYPES} required />
              <FormSelect label="Pohon" value={form.drive_id} onChange={(v) => set('drive_id', v)} options={DRIVE_TYPES} />
              <FormInput label="Objem motoru" value={form.engine_volume} onChange={(v) => set('engine_volume', v)} type="number" placeholder="1968" suffix="ccm" />
              <FormInput label="Výkon" value={form.engine_power} onChange={(v) => set('engine_power', v)} type="number" placeholder="110" suffix="kW" />
              <FormInput label="Najeté km" value={form.tachometer} onChange={(v) => set('tachometer', v)} type="number" placeholder="0" suffix="km" required />
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  Rok výroby <span className="text-primary-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={form.made_month}
                    onChange={(e) => set('made_month', e.target.value)}
                    className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
                  >
                    <option value="">Měsíc</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
                    ))}
                  </select>
                  <select
                    value={form.made_year}
                    onChange={(e) => set('made_year', e.target.value)}
                    required
                    className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
                  >
                    <option value="">Rok</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <FormSelect label="Barva" value={form.color_id} onChange={(v) => set('color_id', v)} options={COLORS} required />
              <FormSelect label="Odstín" value={form.color_tone_id} onChange={(v) => set('color_tone_id', v)} options={COLOR_TONES} />
              <FormSelect label="Počet dveří" value={form.door_count_id} onChange={(v) => set('door_count_id', v)} options={DOOR_COUNTS} />
              <FormSelect label="Počet míst" value={form.capacity_id} onChange={(v) => set('capacity_id', v)} options={CAPACITY_TYPES} />
              <FormSelect label="Klimatizace" value={form.aircondition_id} onChange={(v) => set('aircondition_id', v)} options={AIRCONDITION_TYPES} />
              <FormSelect label="Emisní norma" value={form.euro_id} onChange={(v) => set('euro_id', v)} options={EURO_TYPES} />
              <FormSelect label="Země původu" value={form.country_id} onChange={(v) => set('country_id', v)} options={COUNTRIES} />
              <FormSelect label="Potahy sedadel" value={form.upholstery_id} onChange={(v) => set('upholstery_id', v)} options={UPHOLSTERY_TYPES} />
              <FormSelect label="Počet vlastníků" value={form.owner_count_id} onChange={(v) => set('owner_count_id', v)} options={OWNER_COUNTS} />
              <FormSelect label="Typ obchodu" value={form.deal_type_id} onChange={(v) => set('deal_type_id', v)} options={DEAL_TYPES} />

              {/* VIN s dekódováním */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  VIN – automatické vyplnění údajů
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={form.vin}
                      onChange={(e) => set('vin', e.target.value.toUpperCase())}
                      placeholder="např. TMBAG7NE1L0123456"
                      maxLength={17}
                      className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-600 font-mono tracking-wider"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-500">
                      {form.vin.length}/17
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleVinDecode}
                    disabled={vinLoading || form.vin.length !== 17}
                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-700 disabled:text-surface-500 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2 shrink-0"
                  >
                    {vinLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Dekóduji...</>
                    ) : (
                      <><Search className="w-4 h-4" /> Dekódovat VIN</>
                    )}
                  </button>
                </div>

                {/* Chyba */}
                {vinError && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {vinError}
                  </div>
                )}

                {/* Úspěšné dekódování */}
                {vinResult && vinResult.valid && !vinError && (
                  <div className="mt-3 p-3 bg-emerald-600/10 border border-emerald-600/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 mb-2">
                      <Check className="w-4 h-4" />
                      VIN úspěšně dekódován
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                      {vinResult.manufacturer && (
                        <div><span className="text-surface-500">Výrobce:</span> <span className="text-surface-100">{vinResult.manufacturer}</span></div>
                      )}
                      {vinResult.model && (
                        <div><span className="text-surface-500">Model:</span> <span className="text-surface-100">{vinResult.model}</span></div>
                      )}
                      {vinResult.year && (
                        <div><span className="text-surface-500">Rok:</span> <span className="text-surface-100">{vinResult.year}</span></div>
                      )}
                      {vinResult.body_type && (
                        <div><span className="text-surface-500">Karoserie:</span> <span className="text-surface-100">{vinResult.body_type}</span></div>
                      )}
                      {vinResult.fuel_type && (
                        <div><span className="text-surface-500">Palivo:</span> <span className="text-surface-100">{vinResult.fuel_type}</span></div>
                      )}
                      {vinResult.engine_volume && (
                        <div><span className="text-surface-500">Objem:</span> <span className="text-surface-100">{vinResult.engine_volume} ccm</span></div>
                      )}
                      {vinResult.engine_power && (
                        <div><span className="text-surface-500">Výkon:</span> <span className="text-surface-100">{vinResult.engine_power} kW</span></div>
                      )}
                      {vinResult.drive_type && (
                        <div><span className="text-surface-500">Pohon:</span> <span className="text-surface-100">{vinResult.drive_type}</span></div>
                      )}
                      {vinResult.gearbox && (
                        <div><span className="text-surface-500">Převodovka:</span> <span className="text-surface-100">{vinResult.gearbox}</span></div>
                      )}
                      {vinResult.country && (
                        <div><span className="text-surface-500">Země výroby:</span> <span className="text-surface-100">{vinResult.country}</span></div>
                      )}
                    </div>
                    <p className="text-xs text-surface-500 mt-2">
                      Údaje byly automaticky vyplněny do formuláře. Zkontrolujte a případně opravte.
                    </p>

                    {/* Rozšířené údaje z vindecoder.eu */}
                    {vinResult.source === 'vindecoder' && (
                      <div className="mt-3 pt-3 border-t border-emerald-600/20">
                        <h4 className="text-xs font-semibold text-emerald-400 mb-2">Rozšířené údaje (vindecoder.eu)</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                          {vinResult.model_variant && (
                            <div><span className="text-surface-500">Varianta:</span> <span className="text-surface-100">{vinResult.model_variant}</span></div>
                          )}
                          {vinResult.color && (
                            <div><span className="text-surface-500">Barva:</span> <span className="text-surface-100">{vinResult.color}</span></div>
                          )}
                          {vinResult.capacity && (
                            <div><span className="text-surface-500">Počet míst:</span> <span className="text-surface-100">{vinResult.capacity}</span></div>
                          )}
                          {vinResult.weight && (
                            <div><span className="text-surface-500">Hmotnost:</span> <span className="text-surface-100">{vinResult.weight}</span></div>
                          )}
                          {vinResult.top_speed && (
                            <div><span className="text-surface-500">Max. rychlost:</span> <span className="text-surface-100">{vinResult.top_speed}</span></div>
                          )}
                          {vinResult.acceleration && (
                            <div><span className="text-surface-500">0-100 km/h:</span> <span className="text-surface-100">{vinResult.acceleration}</span></div>
                          )}
                          {vinResult.co2_emissions && (
                            <div><span className="text-surface-500">CO₂:</span> <span className="text-surface-100">{vinResult.co2_emissions}</span></div>
                          )}
                          {vinResult.fuel_consumption && (
                            <div><span className="text-surface-500">Spotřeba:</span> <span className="text-surface-100">{vinResult.fuel_consumption}</span></div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Výbava z VIN */}
                    {vinResult.equipment && vinResult.equipment.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-emerald-600/20">
                        <h4 className="text-xs font-semibold text-emerald-400 mb-2">
                          Výbava z VIN ({vinResult.equipment.length} položek)
                        </h4>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {Object.entries(
                            vinResult.equipment.reduce<Record<string, typeof vinResult.equipment>>((acc, eq) => {
                              const cat = eq.category || 'Ostatní';
                              if (!acc[cat]) acc[cat] = [];
                              acc[cat]!.push(eq);
                              return acc;
                            }, {})
                          ).map(([category, items]) => (
                            <div key={category}>
                              <h5 className="text-xs font-medium text-surface-400 uppercase tracking-wider">{category}</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 mt-1">
                                {items!.map((eq, i) => (
                                  <span key={i} className="flex items-center gap-1.5 text-xs text-surface-300">
                                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                    {eq.name}
                                    {eq.code && <span className="text-surface-600">({eq.code})</span>}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-surface-500 mt-2">
                          Výbavové položky budou automaticky zaškrtnuty v kroku 3.
                        </p>
                      </div>
                    )}

                    {!isVindecoderAvailable() && (
                      <p className="text-xs text-amber-500/70 mt-2">
                        Pro kompletní výbavu z VIN nastavte vindecoder.eu API klíč v .env
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 hover:bg-surface-700 transition-colors">
                Zpět
              </button>
              <button type="button" onClick={() => setStep(3)} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium text-white transition-colors">
                Pokračovat
              </button>
            </div>
          </div>
        )}

        {/* Krok 3: Výbava a popis */}
        {step === 3 && (
          <div className="bg-surface-900 rounded-xl border border-surface-800 p-6 space-y-5">
            <h2 className="text-lg font-bold text-surface-100">Výbava a popis</h2>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Popis vozidla</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={5}
                placeholder="Popište stav, historii a vše důležité o vozidle..."
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-600 resize-y"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowEquipment(!showEquipment)}
                className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                {showEquipment ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Výbava ({form.equipment_ids.length} položek vybráno)
              </button>

              {showEquipment && (
                <div className="mt-3 max-h-96 overflow-y-auto space-y-4 pr-2">
                  {EQUIPMENT_CATEGORIES.map((cat) => {
                    const items = EQUIPMENT.filter((e) => e.category === cat);
                    if (items.length === 0) return null;
                    return (
                      <div key={cat}>
                        <h4 className="text-xs font-semibold text-surface-300 mb-2 uppercase tracking-wider">{cat}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {items.map((eq) => (
                            <label key={eq.id} className="flex items-center gap-2 py-1 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={form.equipment_ids.includes(eq.id)}
                                onChange={() => toggleEquip(eq.id)}
                                className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-600 focus:ring-primary-600"
                              />
                              <span className="text-xs text-surface-300 group-hover:text-surface-100 transition-colors">{eq.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 hover:bg-surface-700 transition-colors">
                Zpět
              </button>
              <button type="button" onClick={() => setStep(4)} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium text-white transition-colors">
                Pokračovat
              </button>
            </div>
          </div>
        )}

        {/* Krok 4: Fotografie a kontakt */}
        {step === 4 && (
          <div className="bg-surface-900 rounded-xl border border-surface-800 p-6 space-y-6">
            <h2 className="text-lg font-bold text-surface-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary-500" />
              Fotografie a kontaktní údaje
            </h2>

            {/* Upload fotek */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Fotografie vozidla</label>
              <div className="border-2 border-dashed border-surface-700 rounded-xl p-8 text-center hover:border-surface-500 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-surface-500 mx-auto mb-3" />
                <p className="text-sm text-surface-300 mb-1">Přetáhněte fotografie sem nebo klikněte pro výběr</p>
                <p className="text-xs text-surface-500">JPG, PNG do 10 MB. Doporučujeme min. 5 fotek.</p>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-surface-500">
                <AlertCircle className="w-3.5 h-3.5" />
                Kvalitní fotky zvyšují šanci na prodej až o 70 %
              </div>
            </div>

            {/* Kontakt */}
            <div>
              <h3 className="text-sm font-semibold text-surface-100 mb-3">Kontaktní údaje</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="Jméno / Firma" value={form.seller_name} onChange={(v) => set('seller_name', v)} placeholder="Jan Novák" required />
                <FormInput label="Telefon" value={form.seller_phone} onChange={(v) => set('seller_phone', v)} type="tel" placeholder="+420 123 456 789" required />
                <FormInput label="E-mail" value={form.seller_email} onChange={(v) => set('seller_email', v)} type="email" placeholder="jan@email.cz" required />
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Okres <span className="text-primary-500">*</span></label>
                  <select
                    value={form.region_id}
                    onChange={(e) => set('region_id', e.target.value)}
                    required
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
                  >
                    <option value="">Vyberte okres...</option>
                    {Object.entries(regionGroups).map(([group, regions]) => (
                      <optgroup key={group} label={group}>
                        {regions.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-surface-800">
              <button type="button" onClick={() => setStep(3)} className="px-6 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 hover:bg-surface-700 transition-colors">
                Zpět
              </button>
              <button type="submit" className="px-8 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-bold text-white transition-colors flex items-center gap-2">
                <Check className="w-4 h-4" />
                Zveřejnit inzerát
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
