import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { MANUFACTURERS, getManufacturerLogoUrl } from '../lib/manufacturers';

interface ManufacturerSelectProps {
  value: number | undefined;
  onChange: (id: number | undefined) => void;
  placeholder?: string;
  className?: string;
  kindId?: number;
}

export default function ManufacturerSelect({
  value,
  onChange,
  placeholder = 'Značka',
  className = '',
  kindId,
}: ManufacturerSelectProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = value ? MANUFACTURERS.find((m) => m.id === value) : undefined;

  // Filter manufacturers by kind_id if specified
  const kindFiltered = kindId
    ? MANUFACTURERS.filter((m) => !m.kind_ids || m.kind_ids.includes(kindId))
    : MANUFACTURERS;

  const filtered = filter
    ? kindFiltered.filter((m) => m.name.toLowerCase().includes(filter.toLowerCase()))
    : kindFiltered;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFilter('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-left outline-none focus:ring-2 focus:ring-primary-600 cursor-pointer"
      >
        {selected ? (
          <>
            <img
              src={getManufacturerLogoUrl(selected.name)}
              alt=""
              className="w-5 h-5 object-contain shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="text-surface-100 truncate flex-1">{selected.name}</span>
            <X
              className="w-4 h-4 text-surface-400 hover:text-surface-200 shrink-0"
              onClick={(e) => { e.stopPropagation(); onChange(undefined); setOpen(false); setFilter(''); }}
            />
          </>
        ) : (
          <>
            <span className="text-surface-500 flex-1">{placeholder}</span>
            <ChevronDown className="w-4 h-4 text-surface-400 shrink-0" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] bg-surface-800 border border-surface-700 rounded-lg shadow-xl max-h-72 overflow-hidden">
          <div className="p-2 border-b border-surface-700">
            <input
              ref={inputRef}
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Hledat značku..."
              className="w-full bg-surface-900 rounded px-2.5 py-1.5 text-sm text-surface-100 placeholder-surface-500 outline-none"
            />
          </div>
          <div className="overflow-y-auto max-h-56">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-surface-500">Nenalezeno</p>
            )}
            {filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { onChange(m.id); setOpen(false); setFilter(''); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-surface-700 transition-colors ${
                  m.id === value ? 'bg-surface-700 text-primary-400' : 'text-surface-100'
                }`}
              >
                <img
                  src={getManufacturerLogoUrl(m.name)}
                  alt=""
                  className="w-5 h-5 object-contain shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                />
                <span className="truncate">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
