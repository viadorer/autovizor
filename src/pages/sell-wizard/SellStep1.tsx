import { useState } from 'react';
import { Search, Loader2, Sparkles, Info } from 'lucide-react';
import { useSellWizardStore } from '../../stores/sellWizardStore';
import { decodeVin, validateVin } from '../../lib/vin-decoder';
import {
  VEHICLE_KINDS, CONDITIONS, BODY_TYPES, YEAR_OPTIONS,
} from '../../lib/codebooks';
import { MANUFACTURERS } from '../../lib/manufacturers';

export default function SellStep1() {
  const { data, patch } = useSellWizardStore();
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState<string | null>(null);

  const handleVinDecode = async () => {
    if (!data.vin || !validateVin(data.vin)) {
      setVinError('VIN kód musí mít 17 znaků (bez I/O/Q).');
      return;
    }
    setVinError(null);
    setVinLoading(true);
    try {
      const result = await decodeVin(data.vin);
      if (!result.valid) {
        setVinError(result.error ?? 'VIN se nepodařilo dekódovat.');
        return;
      }

      // Match manufacturer podle name
      const mfrMatch = result.manufacturer
        ? MANUFACTURERS.find(
          (m) => m.name.toLowerCase() === result.manufacturer!.toLowerCase()
        )
        : null;

      const toNum = (v: unknown): number | undefined => {
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
        if (typeof v === 'string') {
          const n = parseInt(v.replace(/[^\d]/g, ''));
          return Number.isNaN(n) ? undefined : n;
        }
        return undefined;
      };

      const updates: Partial<typeof data> = {
        made_year: toNum(result.year) ?? data.made_year,
        engine_volume: toNum(result.engine_volume) ?? data.engine_volume,
        engine_power: toNum(result.engine_power) ?? data.engine_power,
      };

      if (mfrMatch) updates.manufacturer_id = mfrMatch.id;

      patch(updates);
    } catch (err) {
      setVinError(err instanceof Error ? err.message : 'Chyba dekódování');
    } finally {
      setVinLoading(false);
    }
  };

  // Modely vázané na manufacturer
  const selectedMfr = data.manufacturer_id
    ? MANUFACTURERS.find((m) => m.id === data.manufacturer_id)
    : null;
  const models = selectedMfr?.models ?? [];

  // Filtruj značky dle kind_id
  const filteredManufacturers = MANUFACTURERS.filter(
    (m) => !m.kind_ids || m.kind_ids.includes(data.kind_id ?? 1)
  );

  // Generuj rok options počínaje aktuálním
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-surface-50 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Základní informace
        </h2>
        <p className="text-sm text-surface-400">Identifikujte vozidlo. Pokud znáte VIN, použijte automatické vyplnění.</p>
      </div>

      {/* VIN autofill */}
      <div className="p-4 bg-gradient-to-br from-primary-500/10 to-accent-500/5 border border-primary-500/20 rounded-xl">
        <label className="flex items-center gap-2 text-sm font-semibold text-surface-100 mb-2">
          <Sparkles className="w-4 h-4 text-primary-400" />
          Automatické vyplnění z VIN (volitelné)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={data.vin ?? ''}
            onChange={(e) => patch({ vin: e.target.value.toUpperCase().slice(0, 17) })}
            placeholder="WAUZZZ8K9DA000000"
            className="flex-1 bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500 font-mono uppercase"
            maxLength={17}
          />
          <button
            type="button"
            onClick={handleVinDecode}
            disabled={vinLoading || !data.vin || data.vin.length !== 17}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 rounded-lg text-sm font-semibold text-white"
          >
            {vinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Načíst
          </button>
        </div>
        {vinError && <p className="text-xs text-red-400 mt-2">{vinError}</p>}
        <p className="text-[10px] text-surface-500 mt-2">
          <Info className="w-3 h-3 inline mr-1" />
          VIN je 17-znakový kód v technickém průkazu. Dekódovat lze značku, ročník, motor.
        </p>
      </div>

      {/* Kind */}
      <Field label="Druh vozidla" required>
        <Select
          value={data.kind_id}
          options={VEHICLE_KINDS}
          onChange={(v) => patch({ kind_id: v as number, manufacturer_id: undefined, model_id: undefined })}
        />
      </Field>

      {/* Manufacturer + Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Značka" required>
          <SearchableSelect
            value={data.manufacturer_id}
            options={filteredManufacturers.map((m) => ({ id: m.id, name: m.name }))}
            placeholder="Vyber značku…"
            onChange={(v) => patch({ manufacturer_id: v, model_id: undefined })}
          />
        </Field>
        <Field label="Model" required>
          <SearchableSelect
            value={data.model_id}
            options={models.map((m) => ({ id: m.id, name: m.name }))}
            placeholder={selectedMfr ? 'Vyber model…' : 'Nejdřív značku'}
            onChange={(v) => patch({ model_id: v })}
            disabled={!selectedMfr}
          />
        </Field>
      </div>

      <Field label="Označení modelu / variace (volitelné)">
        <input
          type="text"
          value={data.model_variant ?? ''}
          onChange={(e) => patch({ model_variant: e.target.value })}
          placeholder="GTI / TDI / xDrive…"
          className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
        />
      </Field>

      {/* Condition + Body type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Stav" required>
          <Select
            value={data.condition_id}
            options={CONDITIONS}
            onChange={(v) => patch({ condition_id: v as number })}
          />
        </Field>
        <Field label="Karoserie">
          <Select
            value={data.body_type_id}
            options={BODY_TYPES}
            onChange={(v) => patch({ body_type_id: v as number })}
            placeholder="Libovolná"
          />
        </Field>
      </div>

      {/* Year + Month */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Rok první registrace" required>
          <Select
            value={data.made_year}
            options={YEAR_OPTIONS.map((y) => ({ id: y, name: String(y) }))}
            onChange={(v) => patch({ made_year: v as number })}
            placeholder="Vyber rok"
          />
        </Field>
        <Field label="Měsíc">
          <Select
            value={data.made_month}
            options={months.map((m) => ({ id: m, name: String(m).padStart(2, '0') }))}
            onChange={(v) => patch({ made_month: v as number })}
            placeholder="Volitelný"
          />
        </Field>
      </div>

      {/* Title autogenerate */}
      <Field label="Název inzerátu (zobrazený)">
        <input
          type="text"
          value={data.title ?? ''}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder={
            selectedMfr && data.model_id
              ? `${selectedMfr.name} ${models.find((m) => m.id === data.model_id)?.name ?? ''}${data.model_variant ? ' ' + data.model_variant : ''}`
              : 'Auto-generováno z výběrů'
          }
          className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
        />
      </Field>
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

function SearchableSelect({
  value, options, onChange, placeholder, disabled,
}: {
  value: number | undefined;
  options: { id: number; name: string }[];
  onChange: (v: number | undefined) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  // Pokud je <500 možností, jednoduchý select stačí
  if (options.length <= 500) {
    return (
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        disabled={disabled}
        className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    );
  }

  // Datalist autocomplete pro >500
  const valueObj = value ? options.find((o) => o.id === value) : null;
  return (
    <input
      type="text"
      list="searchable-options"
      defaultValue={valueObj?.name ?? ''}
      placeholder={placeholder}
      onChange={(e) => {
        const found = options.find((o) => o.name.toLowerCase() === e.target.value.toLowerCase());
        onChange(found?.id);
      }}
      disabled={disabled}
      className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
    />
  );
}
