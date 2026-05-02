import { useEffect } from 'react';
import type { Vehicle } from '../types';
import { buildVehicleHref } from '../lib/slug';

interface Props {
  vehicle: Vehicle;
}

const SITE_URL = 'https://autovizor.cz';

/**
 * Injektuje do <head>:
 *  1. <title>, meta description, canonical
 *  2. OpenGraph + Twitter Card
 *  3. JSON-LD `Vehicle` schema (Schema.org) — rich results na Google
 *
 * Bez závislosti na react-helmet — jednoduchá imperativní mutace headu.
 * Při SSR migraci na Next.js / Remix nahradit Metadata API / `<Head>`.
 */
export default function VehicleSeoHead({ vehicle }: Props) {
  useEffect(() => {
    const url = `${SITE_URL}${buildVehicleHref(vehicle)}`;
    const title = `${vehicle.title} – ${vehicle.price.toLocaleString('cs-CZ')} Kč | Autovizor.cz`;
    const description = [
      vehicle.title,
      vehicle.made_year ? `Rok ${vehicle.made_year}` : null,
      vehicle.tachometer ? `${vehicle.tachometer.toLocaleString('cs-CZ')} km` : null,
      vehicle.fuel_name,
      vehicle.gearbox_name,
      vehicle.engine_power ? `${vehicle.engine_power} kW` : null,
      `Cena ${vehicle.price.toLocaleString('cs-CZ')} Kč.`,
    ].filter(Boolean).join(' • ').slice(0, 160);

    document.title = title;

    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'product', true);
    setMeta('og:url', url, true);
    if (vehicle.main_image_url) setMeta('og:image', vehicle.main_image_url, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (vehicle.main_image_url) setMeta('twitter:image', vehicle.main_image_url);

    setCanonical(url);

    // JSON-LD Vehicle Schema (https://schema.org/Vehicle)
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      '@id': url,
      name: vehicle.title,
      description: vehicle.description ?? description,
      url,
      image: vehicle.images?.length
        ? vehicle.images.map((i) => i.url)
        : (vehicle.main_image_url ? [vehicle.main_image_url] : undefined),
      brand: vehicle.manufacturer_name ? {
        '@type': 'Brand',
        name: vehicle.manufacturer_name,
      } : undefined,
      model: vehicle.model_name,
      vehicleModelDate: vehicle.made_year ? String(vehicle.made_year) : undefined,
      productionDate: vehicle.manufacture_date,
      releaseDate: vehicle.first_registration,
      mileageFromOdometer: vehicle.tachometer ? {
        '@type': 'QuantitativeValue',
        value: vehicle.tachometer,
        unitCode: 'KMT',
      } : undefined,
      fuelType: vehicle.fuel_name,
      vehicleTransmission: vehicle.gearbox_name,
      bodyType: vehicle.body_type_name,
      color: vehicle.color_name,
      driveWheelConfiguration: vehicle.drive_name,
      vehicleEngine: vehicle.engine_power ? {
        '@type': 'EngineSpecification',
        enginePower: {
          '@type': 'QuantitativeValue',
          value: vehicle.engine_power,
          unitCode: 'KWT',
        },
        engineDisplacement: vehicle.engine_volume ? {
          '@type': 'QuantitativeValue',
          value: vehicle.engine_volume,
          unitCode: 'CMQ',
        } : undefined,
      } : undefined,
      vehicleIdentificationNumber: vehicle.vin,
      numberOfDoors: vehicle.door_count_id,
      seatingCapacity: vehicle.capacity_id,
      offers: {
        '@type': 'Offer',
        price: vehicle.price,
        priceCurrency: 'CZK',
        availability: vehicle.is_active === false
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
        itemCondition: vehicle.condition_name === 'Nové'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
        url,
        seller: vehicle.seller_name ? {
          '@type': 'AutoDealer',
          name: vehicle.seller_name,
          telephone: vehicle.seller_phone,
          email: vehicle.seller_email,
          address: vehicle.address ? {
            '@type': 'PostalAddress',
            streetAddress: vehicle.address,
            addressLocality: vehicle.city,
            postalCode: vehicle.zip_code,
            addressRegion: vehicle.region_name,
            addressCountry: 'CZ',
          } : undefined,
          aggregateRating: vehicle.seller_rating ? {
            '@type': 'AggregateRating',
            ratingValue: vehicle.seller_rating,
            reviewCount: vehicle.seller_review_count ?? 0,
          } : undefined,
        } : undefined,
      },
    };

    setJsonLd('vehicle-jsonld', removeUndefined(jsonLd));

    return () => {
      removeJsonLd('vehicle-jsonld');
    };
  }, [vehicle]);

  return null;
}

// ============ helpers ============

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
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter((v) => v !== undefined) as T;
  }
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (v === undefined) continue;
      const cleaned = removeUndefined(v);
      if (cleaned !== undefined && !(typeof cleaned === 'object' && cleaned !== null && Object.keys(cleaned).length === 0 && !Array.isArray(cleaned))) {
        out[k] = cleaned;
      }
    }
    return out as T;
  }
  return obj;
}
