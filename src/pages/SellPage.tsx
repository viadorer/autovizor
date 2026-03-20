import { useState } from 'react';
import {
  Car, Camera, Upload, Info, Phone, Mail, MapPin,
  ChevronDown, ChevronUp, Check, AlertCircle,
} from 'lucide-react';
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
        className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
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
          className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-600"
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

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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
        <h1 className="text-2xl font-bold text-white mb-3">Inzerát byl odeslán</h1>
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
        <h1 className="text-3xl font-bold text-white">Prodat vozidlo</h1>
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
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
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
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
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
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer disabled:opacity-50"
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
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
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
                    className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
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
                    className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
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
              <FormInput label="VIN" value={form.vin} onChange={(v) => set('vin', v)} placeholder="Nepovinné" />
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white hover:bg-surface-700 transition-colors">
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
            <h2 className="text-lg font-bold text-white">Výbava a popis</h2>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Popis vozidla</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={5}
                placeholder="Popište stav, historii a vše důležité o vozidle..."
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-600 resize-y"
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
                              <span className="text-xs text-surface-300 group-hover:text-white transition-colors">{eq.name}</span>
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
              <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white hover:bg-surface-700 transition-colors">
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
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
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
              <h3 className="text-sm font-semibold text-white mb-3">Kontaktní údaje</h3>
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
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary-600 appearance-none cursor-pointer"
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
              <button type="button" onClick={() => setStep(3)} className="px-6 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white hover:bg-surface-700 transition-colors">
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
