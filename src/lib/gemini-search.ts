// ============================================================
// Gemini AI — slovní popis → filtry vyhledávání
// ============================================================

import { MANUFACTURERS } from './manufacturers';
import { FUEL_TYPES, GEARBOX_TYPES, BODY_TYPES, COLORS, DRIVE_TYPES, CONDITIONS } from './codebooks';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Build manufacturer name list for osobní (kind_id=1)
const MFR_NAMES = MANUFACTURERS
  .filter(m => !m.kind_ids || m.kind_ids.includes(1))
  .map(m => m.name)
  .slice(0, 100); // top 100 for prompt size

const SYSTEM_PROMPT = `Jsi AI asistent pro český automobilový vyhledávač Autovizor.cz.
Uživatel popíše slovně jaké auto hledá. Tvým úkolem je extrahovat strukturované filtry pro vyhledávání.

Vrať POUZE validní JSON objekt (bez markdown, bez vysvětlení) s těmito poli (vynech pole která uživatel nezmínil):

{
  "manufacturer": "název značky (přesný z tohoto seznamu: ${MFR_NAMES.join(', ')})",
  "model": "název modelu (pokud zmíněn)",
  "fuel_type": "benzín|nafta|lpg|elektro|hybrid|cng",
  "gearbox": "manuální|automatická",
  "body_type": "hatchback|sedan|kombi|suv|kabriolet|kupé|mpv|pick-up|van|liftback|roadster",
  "color": "bílá|černá|šedá|stříbrná|modrá|červená|zelená|hnědá|béžová|oranžová|žlutá|zlatá|fialová",
  "drive": "4x4|4x2",
  "condition": "nové|ojeté",
  "year_from": 2015,
  "year_to": 2024,
  "price_from": 100000,
  "price_to": 500000,
  "km_from": 0,
  "km_to": 100000,
  "power_from": 100,
  "power_to": 200
}

Příklady:
- "rodinné SUV do 500 tisíc, automat" → {"body_type":"suv","price_to":500000,"gearbox":"automatická"}
- "Škoda Octavia kombi, nafta, do 100 000 km" → {"manufacturer":"Škoda","model":"Octavia","body_type":"kombi","fuel_type":"nafta","km_to":100000}
- "elektromobil do milionu" → {"fuel_type":"elektro","price_to":1000000}
- "BMW řady 3, 2020 a novější, automat" → {"manufacturer":"BMW","model":"Řada 3","year_from":2020,"gearbox":"automatická"}
- "levné auto do 200 tisíc" → {"price_to":200000}
- "sportovní kupé nad 200 koní" → {"body_type":"kupé","power_from":200}`;

interface ParsedFilters {
  manufacturer_id?: number;
  model_id?: number;
  fuel_type_id?: number;
  gearbox_id?: number;
  body_type_id?: number;
  color_id?: number;
  drive_id?: number;
  condition_id?: number;
  year_from?: number;
  year_to?: number;
  price_from?: number;
  price_to?: number;
  km_from?: number;
  km_to?: number;
  power_from?: number;
  power_to?: number;
}

function matchId(list: { id: number; name: string }[], value: string | undefined): number | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  const exact = list.find(item => item.name.toLowerCase() === lower);
  if (exact) return exact.id;
  const partial = list.find(item => item.name.toLowerCase().includes(lower) || lower.includes(item.name.toLowerCase()));
  return partial?.id;
}

export async function aiParseQuery(query: string): Promise<ParsedFilters | null> {
  if (!GEMINI_API_KEY || !query.trim()) return null;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: SYSTEM_PROMPT },
            { text: `Uživatel hledá: "${query}"` },
          ],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!res.ok) {
      console.error('Gemini API error:', res.status);
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response (strip markdown fences if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const filters: ParsedFilters = {};

    // Map text values to IDs
    if (parsed.manufacturer) {
      const mfr = MANUFACTURERS.find(m =>
        m.name.toLowerCase() === parsed.manufacturer.toLowerCase() ||
        m.name.toLowerCase().includes(parsed.manufacturer.toLowerCase())
      );
      if (mfr) {
        filters.manufacturer_id = mfr.id;
        // Try to match model within manufacturer
        if (parsed.model && mfr.models) {
          const model = mfr.models.find(m =>
            m.name.toLowerCase() === parsed.model.toLowerCase() ||
            m.name.toLowerCase().includes(parsed.model.toLowerCase()) ||
            parsed.model.toLowerCase().includes(m.name.toLowerCase())
          );
          if (model) filters.model_id = model.id;
        }
      }
    }

    if (parsed.fuel_type) filters.fuel_type_id = matchId(FUEL_TYPES, parsed.fuel_type);
    if (parsed.gearbox) filters.gearbox_id = matchId(GEARBOX_TYPES, parsed.gearbox);
    if (parsed.body_type) filters.body_type_id = matchId(BODY_TYPES, parsed.body_type);
    if (parsed.color) filters.color_id = matchId(COLORS, parsed.color);
    if (parsed.drive) filters.drive_id = matchId(DRIVE_TYPES, parsed.drive);
    if (parsed.condition) filters.condition_id = matchId(CONDITIONS, parsed.condition);

    // Numeric filters
    if (parsed.year_from) filters.year_from = parsed.year_from;
    if (parsed.year_to) filters.year_to = parsed.year_to;
    if (parsed.price_from) filters.price_from = parsed.price_from;
    if (parsed.price_to) filters.price_to = parsed.price_to;
    if (parsed.km_from) filters.km_from = parsed.km_from;
    if (parsed.km_to) filters.km_to = parsed.km_to;
    if (parsed.power_from) filters.power_from = parsed.power_from;
    if (parsed.power_to) filters.power_to = parsed.power_to;

    return filters;
  } catch (err) {
    console.error('Gemini parse error:', err);
    return null;
  }
}
