import { useSellWizardStore } from '../../stores/sellWizardStore';
import {
  FUEL_TYPES, GEARBOX_TYPES, GEARBOX_LEVELS, DRIVE_TYPES, EURO_TYPES,
  COLORS, COLOR_TONES, COLOR_TYPES, DOOR_COUNTS, CAPACITY_TYPES,
  AIRCONDITION_TYPES, UPHOLSTERY_TYPES, COUNTRIES, OWNER_COUNTS, SERVICEBOOK_TYPES,
} from '../../lib/codebooks';

export default function SellStep2() {
  const { data, patch } = useSellWizardStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-surface-50 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Technické specifikace
        </h2>
        <p className="text-sm text-surface-400">Klíčové parametry vozu — palivo, výkon, najeté kilometry.</p>
      </div>

      {/* Fuel + Gearbox */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Palivo" required>
          <Select value={data.fuel_type_id} options={FUEL_TYPES} onChange={(v) => patch({ fuel_type_id: v as number })} />
        </Field>
        <Field label="Převodovka">
          <Select value={data.gearbox_id} options={GEARBOX_TYPES} onChange={(v) => patch({ gearbox_id: v as number })} placeholder="Libovolná" />
        </Field>
      </div>

      {/* Gearbox level + Drive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Počet stupňů">
          <Select value={data.gearbox_level_id} options={GEARBOX_LEVELS} onChange={(v) => patch({ gearbox_level_id: v as number })} placeholder="Volitelné" />
        </Field>
        <Field label="Pohon">
          <Select value={data.drive_id} options={DRIVE_TYPES} onChange={(v) => patch({ drive_id: v as number })} placeholder="Volitelné" />
        </Field>
      </div>

      {/* Power + Volume + Mileage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Výkon (kW)" required>
          <NumberInput
            value={data.engine_power}
            onChange={(v) => patch({ engine_power: v })}
            placeholder="např. 110"
            suffix="kW"
            min={1}
          />
          {data.engine_power && (
            <p className="text-[10px] text-surface-500 mt-1">≈ {Math.round(data.engine_power * 1.36)} koní</p>
          )}
        </Field>
        <Field label="Objem motoru">
          <NumberInput
            value={data.engine_volume}
            onChange={(v) => patch({ engine_volume: v })}
            placeholder="např. 1968"
            suffix="ccm"
            min={0}
          />
        </Field>
        <Field label="Najeté km" required>
          <NumberInput
            value={data.tachometer}
            onChange={(v) => patch({ tachometer: v })}
            placeholder="např. 78000"
            suffix="km"
            min={0}
          />
        </Field>
      </div>

      {/* Color + Tone + Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Barva">
          <Select value={data.color_id} options={COLORS} onChange={(v) => patch({ color_id: v as number })} placeholder="Vyber barvu" />
        </Field>
        <Field label="Odstín">
          <Select value={data.color_tone_id} options={COLOR_TONES} onChange={(v) => patch({ color_tone_id: v as number })} placeholder="Volitelné" />
        </Field>
        <Field label="Typ laku">
          <Select value={data.color_type_id} options={COLOR_TYPES} onChange={(v) => patch({ color_type_id: v as number })} placeholder="Volitelné" />
        </Field>
      </div>

      {/* Doors + Seats + AC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Počet dveří">
          <Select value={data.door_count_id} options={DOOR_COUNTS} onChange={(v) => patch({ door_count_id: v as number })} placeholder="Volitelné" />
        </Field>
        <Field label="Počet míst">
          <Select value={data.capacity_id} options={CAPACITY_TYPES} onChange={(v) => patch({ capacity_id: v as number })} placeholder="Volitelné" />
        </Field>
        <Field label="Klimatizace">
          <Select value={data.aircondition_id} options={AIRCONDITION_TYPES} onChange={(v) => patch({ aircondition_id: v as number })} placeholder="Volitelná" />
        </Field>
      </div>

      {/* Euro + Service book + Country */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Emisní norma">
          <Select value={data.euro_id} options={EURO_TYPES} onChange={(v) => patch({ euro_id: v as number })} placeholder="EURO 6" />
        </Field>
        <Field label="Servisní knížka">
          <Select value={data.servicebook_id} options={SERVICEBOOK_TYPES} onChange={(v) => patch({ servicebook_id: v as number })} placeholder="Volitelné" />
        </Field>
        <Field label="Země původu">
          <Select value={data.country_id} options={COUNTRIES} onChange={(v) => patch({ country_id: v as number })} placeholder="ČR" />
        </Field>
      </div>

      {/* Upholstery + Owner count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Potahy">
          <Select value={data.upholstery_id} options={UPHOLSTERY_TYPES} onChange={(v) => patch({ upholstery_id: v as number })} placeholder="Volitelné" />
        </Field>
        <Field label="Počet vlastníků">
          <Select value={data.owner_count_id} options={OWNER_COUNTS} onChange={(v) => patch({ owner_count_id: v as number })} placeholder="Volitelné" />
        </Field>
      </div>

      {/* Flags */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.first_owner === 1}
            onChange={(e) => patch({ first_owner: e.target.checked ? 1 : 2 })}
            className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-600 focus:ring-primary-600"
          />
          <span className="text-sm text-surface-200">První majitel</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.crashed ?? false}
            onChange={(e) => patch({ crashed: e.target.checked })}
            className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-600 focus:ring-primary-600"
          />
          <span className="text-sm text-surface-200">Vozidlo bylo havarované</span>
        </label>
      </div>
    </div>
  );
}

// ===== Helpers =====

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-surface-200 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({
  value, options, onChange, placeholder = 'Vyber',
}: {
  value: number | undefined;
  options: { id: number; name: string }[];
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>{o.name}</option>
      ))}
    </select>
  );
}

function NumberInput({
  value, onChange, placeholder, suffix, min,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  suffix?: string;
  min?: number;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        placeholder={placeholder}
        min={min}
        className={`w-full bg-surface-900 rounded-lg px-3 py-2.5 ${suffix ? 'pr-12' : ''} text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-500">{suffix}</span>
      )}
    </div>
  );
}
