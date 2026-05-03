import { useSellWizardStore } from '../../stores/sellWizardStore';
import { REGIONS, formatPrice } from '../../lib/codebooks';
import { MANUFACTURERS } from '../../lib/manufacturers';
import { useMemo } from 'react';

export default function SellStep5() {
  const { data, patch } = useSellWizardStore();

  const regionGroups = useMemo(() => {
    const out: Record<string, typeof REGIONS> = {};
    for (const r of REGIONS) {
      const g = r.region_group ?? 'Ostatní';
      if (!out[g]) out[g] = [];
      out[g].push(r);
    }
    return out;
  }, []);

  // Auto-title fallback pro náhled
  const mfr = data.manufacturer_id ? MANUFACTURERS.find((m) => m.id === data.manufacturer_id) : null;
  const model = mfr?.models.find((m) => m.id === data.model_id);
  const previewTitle = data.title || (mfr && model
    ? `${mfr.name} ${model.name}${data.model_variant ? ' ' + data.model_variant : ''}`
    : 'Vozidlo');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-surface-50 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Cena, popis a kontakt
        </h2>
        <p className="text-sm text-surface-400">Posledních pár věcí — pak inzerát publikujeme.</p>
      </div>

      {/* Price */}
      <div className="p-4 bg-gradient-to-br from-primary-500/10 to-accent-500/5 border border-primary-500/20 rounded-xl">
        <Field label="Cena (Kč)" required>
          <div className="relative">
            <input
              type="number"
              value={data.price ?? ''}
              onChange={(e) => patch({ price: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="např. 285 000"
              min={0}
              step={1000}
              className="w-full bg-surface-900 rounded-lg px-3 py-3 pr-12 text-lg font-bold text-surface-50 outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-surface-400">Kč</span>
          </div>
        </Field>

        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.price_includes_vat ?? true}
              onChange={(e) => patch({ price_includes_vat: e.target.checked })}
              className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-surface-200">Cena včetně DPH</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.vat_deductible ?? false}
              onChange={(e) => patch({ vat_deductible: e.target.checked })}
              className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-surface-200">Možnost odpočtu DPH (B2B)</span>
          </label>
        </div>
      </div>

      {/* Description */}
      <Field label="Popis vozidla" required>
        <textarea
          value={data.description ?? ''}
          onChange={(e) => patch({ description: e.target.value })}
          rows={6}
          placeholder="Popište stav, výbavu, historii servisu, důvod prodeje…"
          maxLength={5000}
          className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y"
        />
        <p className="text-[10px] text-surface-500 mt-1">{data.description?.length ?? 0} / 5000 znaků</p>
      </Field>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Okres / Kraj" required>
          <select
            value={data.region_id ?? ''}
            onChange={(e) => patch({ region_id: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="">Vyber lokaci</option>
            {Object.entries(regionGroups).map(([group, regs]) => (
              <optgroup key={group} label={group}>
                {regs.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="Město">
          <input
            type="text"
            value={data.city ?? ''}
            onChange={(e) => patch({ city: e.target.value })}
            placeholder="např. Praha"
            className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="PSČ">
          <input
            type="text"
            value={data.zip_code ?? ''}
            onChange={(e) => patch({ zip_code: e.target.value })}
            placeholder="11000"
            maxLength={6}
            className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </Field>
        <Field label="Adresa (volitelné)">
          <input
            type="text"
            value={data.address ?? ''}
            onChange={(e) => patch({ address: e.target.value })}
            placeholder="Ulice, č.p."
            className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </Field>
      </div>

      {/* STK */}
      <Field label="Platnost STK (volitelné)">
        <input
          type="month"
          value={
            data.stk_date && /^\d{4}-\d{2}-\d{2}$/.test(data.stk_date)
              ? data.stk_date.slice(0, 7)
              : ''
          }
          onChange={(e) => {
            const v = e.target.value;
            // <input type="month"> vrací strict "YYYY-MM" — ale validujme
            if (v && /^\d{4}-\d{2}$/.test(v)) {
              patch({ stk_date: `${v}-01` });
            } else {
              patch({ stk_date: undefined });
            }
          }}
          min="2000-01"
          max="2100-12"
          className="w-full bg-surface-900 rounded-lg px-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
        />
      </Field>

      {/* Preview */}
      <div className="border-t border-surface-800 pt-6">
        <h3 className="text-sm font-bold text-surface-100 mb-3">Náhled inzerátu</h3>
        <div className="bg-surface-900 rounded-2xl overflow-hidden flex flex-col sm:flex-row">
          {data.image_urls && data.image_urls.length > 0 ? (
            <img
              src={data.image_urls[0]}
              alt=""
              className="w-full sm:w-48 h-40 object-cover bg-surface-800"
            />
          ) : (
            <div className="w-full sm:w-48 h-40 bg-surface-800 flex items-center justify-center text-surface-600 text-xs">
              Žádná fotka
            </div>
          )}
          <div className="p-4 flex-1 min-w-0">
            <h4 className="text-sm font-bold text-surface-50 truncate">{previewTitle}</h4>
            <p className="text-2xl font-extrabold text-surface-50 mt-1">
              {data.price ? formatPrice(data.price) : '—'}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-surface-400 mt-2">
              {data.made_year && <span>{data.made_year}</span>}
              {data.tachometer != null && <span>{data.tachometer.toLocaleString('cs-CZ')} km</span>}
              {data.engine_power && <span>{data.engine_power} kW</span>}
              {data.fuel_type_id && <span>Palivo #{data.fuel_type_id}</span>}
            </div>
            {data.description && (
              <p className="text-xs text-surface-500 mt-2 line-clamp-2">{data.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
