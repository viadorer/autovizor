import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Crosshair, Search, X } from 'lucide-react';

interface Props {
  initialLat?: number;
  initialLng?: number;
  initialRadiusKm?: number;
  onChange: (params: { lat?: number; lng?: number; radiusKm?: number; zip?: string } | null) => void;
}

// Centroid ČR + sensible defaults
const CZ_CENTER: [number, number] = [49.8175, 15.4730];
const DEFAULT_ZOOM = 7;
const RADIUS_OPTIONS = [10, 25, 50, 100, 200];

// PSČ → lat/lng přes Nominatim (OSM, zdarma, rate-limited 1 req/s)
async function geocodeZip(zip: string): Promise<{ lat: number; lng: number; label: string } | null> {
  try {
    const cleaned = zip.replace(/\s/g, '');
    if (!/^\d{3,5}$/.test(cleaned)) return null;
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${cleaned}&country=Czechia&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'cs' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      label: data[0].display_name?.split(',').slice(0, 2).join(',') ?? cleaned,
    };
  } catch {
    return null;
  }
}

/**
 * Mapový radius-search filter.
 * - Klikem na mapu se nastaví střed
 * - Geolokace přes browser API (Crosshair button)
 * - PSČ vyhledávání přes Nominatim
 * - Volá onChange({lat, lng, radiusKm}) → searchStore filtry user_lat/user_lng/radius_km
 */
export default function MapRadiusSearch({
  initialLat,
  initialLng,
  initialRadiusKm = 50,
  onChange,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const [center, setCenter] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [radiusKm, setRadiusKm] = useState(initialRadiusKm);
  const [zipInput, setZipInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Init mapy (jednou)
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initialCenter = center ?? CZ_CENTER;
    const map = L.map(mapRef.current, {
      center: initialCenter,
      zoom: center ? 9 : DEFAULT_ZOOM,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      setCenter([e.latlng.lat, e.latlng.lng]);
    });

    mapInstance.current = map;

    // Pokud byla mapa inicializovaná zatímco container neměl rozměry
    // (např. v collapsed "Další filtry" sekci), invalidate po viditelnosti.
    const ro = new ResizeObserver(() => {
      try { map.invalidateSize(); } catch { /* map removed */ }
    });
    ro.observe(mapRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapInstance.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker/circle/centerování při změně center nebo radiusu
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    if (center) {
      markerRef.current = L.marker(center).addTo(map);
      circleRef.current = L.circle(center, {
        radius: radiusKm * 1000,
        color: '#f97316', // primary-500
        fillColor: '#f97316',
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(map);

      // Posun mapy + zoom dle radiusu
      const zoom = radiusKm <= 25 ? 10 : radiusKm <= 50 ? 9 : radiusKm <= 100 ? 8 : 7;
      map.setView(center, zoom, { animate: true });
    }

    // Notify parent
    onChange(center ? { lat: center[0], lng: center[1], radiusKm } : null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, radiusKm]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Prohlížeč nepodporuje geolokaci');
      return;
    }
    setError(null);
    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        setSearching(false);
      },
      (err) => {
        setError(err.code === 1 ? 'Geolokace zamítnuta' : 'Nelze určit polohu');
        setSearching(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  };

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipInput) return;
    setSearching(true);
    setError(null);
    const result = await geocodeZip(zipInput);
    if (result) {
      setCenter([result.lat, result.lng]);
    } else {
      setError('PSČ nenalezeno');
    }
    setSearching(false);
  };

  const clear = () => {
    setCenter(null);
    setZipInput('');
    setError(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-surface-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Vyhledávání podle polohy
        </label>
        {center && (
          <button
            onClick={clear}
            className="text-xs text-surface-500 hover:text-surface-300 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Zrušit
          </button>
        )}
      </div>

      {/* PSČ input + geolokace */}
      <div className="flex gap-2">
        <form onSubmit={handleZipSubmit} className="flex-1 flex gap-1">
          <input
            type="text"
            inputMode="numeric"
            placeholder="PSČ (např. 11000)"
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value)}
            className="flex-1 bg-surface-850 rounded-lg px-3 py-2 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={searching || !zipInput}
            className="px-3 py-2 bg-surface-800 hover:bg-surface-700 rounded-lg text-surface-100 disabled:opacity-50"
            title="Vyhledat PSČ"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={searching}
          className="px-3 py-2 bg-surface-800 hover:bg-surface-700 rounded-lg text-surface-100 disabled:opacity-50"
          title="Použít moji polohu"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Mapa — explicitní height kvůli Leaflet (h-56 utility nezaručí dostatečnou výšku v flex parentu) */}
      <div
        ref={mapRef}
        className="w-full rounded-lg overflow-hidden border border-surface-800"
        style={{ height: 224 }}
        aria-label="Mapa pro výběr polohy"
      />
      {!center && (
        <p className="text-xs text-surface-500">
          Klikněte na mapu, zadejte PSČ nebo použijte polohu zařízení.
        </p>
      )}

      {/* Radius slider/select */}
      {center && (
        <div>
          <label className="block text-xs font-medium text-surface-400 mb-1">
            Okruh: <strong className="text-surface-100">{radiusKm} km</strong>
          </label>
          <div className="flex gap-1.5">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${
                  r === radiusKm
                    ? 'bg-primary-500 text-white font-semibold'
                    : 'bg-surface-850 text-surface-400 hover:text-surface-100'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
