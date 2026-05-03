import { useMemo, useState } from 'react';
import { Search, Check } from 'lucide-react';
import { useSellWizardStore } from '../../stores/sellWizardStore';
import { EQUIPMENT, EQUIPMENT_CATEGORIES } from '../../lib/codebooks';

export default function SellStep3() {
  const { data, patch } = useSellWizardStore();
  const [query, setQuery] = useState('');
  const selected = data.equipment_ids ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EQUIPMENT;
    return EQUIPMENT.filter((eq) => eq.name.toLowerCase().includes(q));
  }, [query]);

  const grouped = useMemo(() => {
    const out: Record<string, typeof EQUIPMENT> = {};
    for (const cat of EQUIPMENT_CATEGORIES) out[cat] = [];
    for (const eq of filtered) {
      const cat = eq.category ?? 'Ostatní';
      if (!out[cat]) out[cat] = [];
      out[cat].push(eq);
    }
    return out;
  }, [filtered]);

  const toggle = (id: number) => {
    const has = selected.includes(id);
    patch({
      equipment_ids: has ? selected.filter((x) => x !== id) : [...selected, id],
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-surface-50 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Výbava
        </h2>
        <p className="text-sm text-surface-400">
          Označte výbavu, kterou vůz má. Vybráno: <strong className="text-primary-400">{selected.length}</strong> z {EQUIPMENT.length}.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hledat výbavu (např. tempomat, kamera, kožená sedadla)…"
          className="w-full bg-surface-900 rounded-lg pl-10 pr-3 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Categories */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {Object.entries(grouped).map(([cat, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-surface-400 mb-2 uppercase tracking-wider">{cat}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                {items.map((eq) => {
                  const isSelected = selected.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => toggle(eq.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary-500/15 text-primary-300 border border-primary-500/30'
                          : 'bg-surface-900 hover:bg-surface-850 text-surface-300 border border-transparent'
                      }`}
                    >
                      <span className={`shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-primary-500 text-white' : 'bg-surface-800'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </span>
                      <span className="text-xs leading-tight">{eq.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
