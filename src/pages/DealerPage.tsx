import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ShieldCheck, Star, MapPin, Phone, Mail, Globe, Clock,
  ArrowLeft, Car, Loader2, BadgeCheck,
} from 'lucide-react';
import { useDealerBySlug, useDealerListings, useDealerReviews } from '../hooks/useVehicles';
import VehicleCard from '../components/VehicleCard';
import { CERTIFIED_PROGRAMS, getCodebookName, SELLER_TYPES, REGIONS } from '../lib/codebooks';

const SITE_URL = 'https://autovizor.cz';

export default function DealerPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: dealer, isLoading } = useDealerBySlug(slug);
  const { data: listings = [] } = useDealerListings(dealer?.id);
  const { data: reviews = [] } = useDealerReviews(dealer?.id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // SEO meta + JSON-LD AutoDealer schema
  useEffect(() => {
    if (!dealer) return;
    const url = `${SITE_URL}/prodejce/${dealer.slug ?? dealer.id}`;
    const title = `${dealer.name} – ${listings.length} vozů | Autovizor.cz`;
    const description = [
      dealer.name,
      dealer.city,
      dealer.rating ? `Hodnocení ${dealer.rating}/5` : null,
      `${listings.length} aktuálních nabídek`,
    ].filter(Boolean).join(' • ');

    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'profile', true);
    setMeta('og:url', url, true);
    if (dealer.logo_url) setMeta('og:image', dealer.logo_url, true);
    setCanonical(url);

    const jsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'AutoDealer',
      '@id': url,
      name: dealer.name,
      url,
      telephone: dealer.phone,
      email: dealer.email,
      image: dealer.logo_url,
      description: dealer.description,
    };
    if (dealer.address || dealer.city) {
      jsonLd.address = {
        '@type': 'PostalAddress',
        streetAddress: dealer.address,
        addressLocality: dealer.city,
        postalCode: dealer.zip_code,
        addressCountry: 'CZ',
      };
    }
    if (dealer.latitude && dealer.longitude) {
      jsonLd.geo = {
        '@type': 'GeoCoordinates',
        latitude: dealer.latitude,
        longitude: dealer.longitude,
      };
    }
    if (dealer.rating && dealer.review_count) {
      jsonLd.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: dealer.rating,
        reviewCount: dealer.review_count,
      };
    }

    setJsonLd('dealer-jsonld', removeUndefined(jsonLd));
    return () => removeJsonLd('dealer-jsonld');
  }, [dealer, listings.length]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
        <p className="text-sm text-surface-400">Načítání profilu prodejce…</p>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShieldCheck className="w-12 h-12 text-surface-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-surface-100 mb-2">Prodejce nenalezen</h2>
        <Link to="/hledat" className="text-primary-400 hover:text-primary-300 text-sm">
          Zpět na vyhledávání
        </Link>
      </div>
    );
  }

  const isPrivate = dealer.type_id === 1;
  const sellerTypeName = getCodebookName(SELLER_TYPES, dealer.type_id);
  const certifiedName = dealer.certified_program_id
    ? getCodebookName(CERTIFIED_PROGRAMS, dealer.certified_program_id)
    : null;
  const region = dealer.region_id ? REGIONS.find((r) => r.id === dealer.region_id) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link
        to="/hledat"
        className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-100 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Zpět na vyhledávání
      </Link>

      {/* Header card */}
      <div className="bg-surface-950 rounded-2xl shadow-sm p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo / fallback */}
          <div className="shrink-0">
            {dealer.logo_url ? (
              <img
                src={dealer.logo_url}
                alt={dealer.name}
                className="w-24 h-24 rounded-2xl object-contain bg-surface-900 p-2"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-surface-900 flex items-center justify-center text-surface-500">
                {isPrivate ? <ShieldCheck className="w-12 h-12" /> : <Car className="w-12 h-12" />}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-surface-50" style={{ fontFamily: 'var(--font-display)' }}>
                {dealer.name}
              </h1>
              {dealer.is_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/15 text-emerald-400 rounded-md text-xs font-semibold">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Ověřeno
                </span>
              )}
              {sellerTypeName && (
                <span className="px-2 py-1 bg-surface-900 text-surface-300 rounded-md text-xs">
                  {sellerTypeName}
                </span>
              )}
              {certifiedName && (
                <span className="px-2 py-1 bg-accent-500/15 text-accent-400 rounded-md text-xs font-semibold">
                  {certifiedName}
                </span>
              )}
            </div>

            {dealer.rating && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(dealer.rating!) ? 'fill-amber-400' : 'text-surface-700'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-surface-200 font-medium">{dealer.rating.toFixed(1)}</span>
                <span className="text-sm text-surface-500">({dealer.review_count ?? 0} hodnocení)</span>
              </div>
            )}

            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-surface-300">
              {(dealer.address || dealer.city) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-surface-500" />
                  {[dealer.address, dealer.city, region?.name].filter(Boolean).join(', ')}
                </span>
              )}
              {dealer.phone && (
                <a href={`tel:${dealer.phone}`} className="flex items-center gap-1.5 hover:text-primary-400">
                  <Phone className="w-4 h-4 text-surface-500" />
                  {dealer.phone}
                </a>
              )}
              {dealer.email && (
                <a href={`mailto:${dealer.email}`} className="flex items-center gap-1.5 hover:text-primary-400">
                  <Mail className="w-4 h-4 text-surface-500" />
                  {dealer.email}
                </a>
              )}
              {dealer.website && (
                <a
                  href={dealer.website}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary-400"
                >
                  <Globe className="w-4 h-4 text-surface-500" />
                  Web
                </a>
              )}
            </div>

            {dealer.opening_hours && Object.keys(dealer.opening_hours).length > 0 && (
              <div className="mt-3 flex items-start gap-2 text-xs text-surface-400">
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div>
                  {Object.entries(dealer.opening_hours).map(([day, hours]) => (
                    <span key={day} className="inline-block mr-3">
                      <strong>{day}</strong>: {hours}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {dealer.description && (
              <p className="mt-4 text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">
                {dealer.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="mb-12">
        <h2 className="text-xl font-extrabold text-surface-50 mb-5" style={{ fontFamily: 'var(--font-display)' }}>
          Aktuální nabídky ({listings.length})
        </h2>
        {listings.length === 0 ? (
          <div className="bg-surface-950 rounded-2xl p-12 text-center">
            <Car className="w-12 h-12 text-surface-600 mx-auto mb-3" />
            <p className="text-sm text-surface-400">Tento prodejce nemá aktuální inzeráty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((v) => (
              <VehicleCard key={v.id} vehicle={v} layout="grid" />
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-extrabold text-surface-50 mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            Hodnocení zákazníků ({reviews.length})
          </h2>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-surface-950 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400' : 'text-surface-700'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-surface-500">
                    {new Date(r.created_at).toLocaleDateString('cs-CZ')}
                  </span>
                </div>
                {r.title && <h3 className="text-sm font-semibold text-surface-100 mb-1">{r.title}</h3>}
                {r.body && <p className="text-sm text-surface-300 mb-2">{r.body}</p>}
                {(r.pros || r.cons) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {r.pros && (
                      <div className="text-xs">
                        <span className="font-semibold text-emerald-400">Klady:</span>{' '}
                        <span className="text-surface-400">{r.pros}</span>
                      </div>
                    )}
                    {r.cons && (
                      <div className="text-xs">
                        <span className="font-semibold text-red-400">Zápory:</span>{' '}
                        <span className="text-surface-400">{r.cons}</span>
                      </div>
                    )}
                  </div>
                )}
                {r.is_verified_purchase && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-emerald-400">
                    <BadgeCheck className="w-3 h-3" />
                    Ověřený nákup
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== SEO helpers (replikováno z VehicleSeoHead — TODO refactor do utility) =====

function setMeta(name: string, content: string | undefined, isProperty = false) {
  if (!content) return;
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(id: string, data: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.text = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function removeUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(removeUndefined).filter((v) => v !== undefined) as T;
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = removeUndefined(v);
    }
    return out as T;
  }
  return obj;
}
