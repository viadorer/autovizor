// ============================================================
// Gemini AI — slovní popis → filtry vyhledávání
// ============================================================

import { MANUFACTURERS } from './manufacturers';
import { FUEL_TYPES, GEARBOX_TYPES, BODY_TYPES, COLORS, DRIVE_TYPES, CONDITIONS } from './codebooks';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Build compact brand→models map for osobní (kind_id=1)
// Format: "Škoda(93):Fabia|Octavia|Superb|Kodiaq|Karoq|Kamiq|Scala|Enyaq iV"
const OSOBNI = MANUFACTURERS.filter(m => !m.kind_ids || m.kind_ids.includes(1));

const BRAND_MODEL_LIST = OSOBNI
  .map(m => {
    const models = m.models
      .filter(mod => mod.name !== 'Ostatní')
      .map(mod => mod.name)
      .join('|');
    return `${m.name}(${m.id}):${models}`;
  })
  .join('\n');

// Compact codebook lists
const FUEL_LIST = FUEL_TYPES.map(f => `${f.name}(${f.id})`).join(', ');
const GEARBOX_LIST = GEARBOX_TYPES.map(g => `${g.name}(${g.id})`).join(', ');
const BODY_LIST = BODY_TYPES.map(b => `${b.name}(${b.id})`).join(', ');
const COLOR_LIST = COLORS.map(c => `${c.name}(${c.id})`).join(', ');
const DRIVE_LIST = DRIVE_TYPES.map(d => `${d.name}(${d.id})`).join(', ');
const CONDITION_LIST = CONDITIONS.map(c => `${c.name}(${c.id})`).join(', ');

const SYSTEM_PROMPT = `Jsi AI asistent pro český automobilový vyhledávač Autovizor.cz.
Uživatel popíše slovně jaké auto hledá. Extrahuj strukturované filtry.

Vrať POUZE JSON (bez markdown, bez komentářů):
{
  "manufacturer_id": číslo,
  "model_id": číslo,
  "fuel_type_id": číslo,
  "gearbox_id": číslo,
  "body_type_id": číslo,
  "color_id": číslo,
  "drive_id": číslo,
  "condition_id": číslo,
  "year_from": číslo,
  "year_to": číslo,
  "price_from": číslo,
  "price_to": číslo,
  "km_from": číslo,
  "km_to": číslo,
  "power_from": číslo (kW),
  "power_to": číslo (kW)
}

Vynech pole která uživatel nezmínil. Používej PŘESNÁ ID z číselníků níže.

PALIVO: ${FUEL_LIST}
PŘEVODOVKA: ${GEARBOX_LIST}
KAROSERIE: ${BODY_LIST}
BARVA: ${COLOR_LIST}
POHON: ${DRIVE_LIST}
STAV: ${CONDITION_LIST}

ZNAČKY A MODELY (formát: Značka(manufacturer_id):Model1|Model2|...):
${BRAND_MODEL_LIST}

PRAVIDLA:
- "do 150 tisíc" / "do 150k" = price_to: 150000
- "do milionu" = price_to: 1000000
- "nad 200 koní" → přepočet na kW: power_from = Math.round(200 * 0.7355) = 147
- "1.9 TDI" = nafta (fuel_type_id pro Naftu)
- "TSI" / "TFSI" / "benzín" = benzín
- "automat" / "DSG" / "tiptronic" = automatická
- Pokud uživatel zmíní motor (1.9 TDI, 2.0 TSI), urči palivo z názvu motoru
- Pokud zmíní jen značku a model bez dalších filtrů, vrať manufacturer_id + model_id

Příklady:
"škoda octavia 1.9 tdi do 150k" → {"manufacturer_id":93,"model_id":705,"fuel_type_id":2,"price_to":150000}
"bmw řady 3 automat 2020+" → {"manufacturer_id":5,"model_id":39,"gearbox_id":3,"year_from":2020}
"suv do 500 tisíc nafta" → {"body_type_id":9,"price_to":500000,"fuel_type_id":2}
"elektromobil do milionu" → {"fuel_type_id":4,"price_to":1000000}`;

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

    // Gemini now returns direct IDs — just validate and pass through
    if (parsed.manufacturer_id) {
      const mfr = OSOBNI.find(m => m.id === parsed.manufacturer_id);
      if (mfr) {
        filters.manufacturer_id = mfr.id;
        if (parsed.model_id) {
          const model = mfr.models.find(m => m.id === parsed.model_id);
          if (model) filters.model_id = model.id;
        }
      }
    }

    // Validate codebook IDs
    if (parsed.fuel_type_id && FUEL_TYPES.some(f => f.id === parsed.fuel_type_id)) {
      filters.fuel_type_id = parsed.fuel_type_id;
    }
    if (parsed.gearbox_id && GEARBOX_TYPES.some(g => g.id === parsed.gearbox_id)) {
      filters.gearbox_id = parsed.gearbox_id;
    }
    if (parsed.body_type_id && BODY_TYPES.some(b => b.id === parsed.body_type_id)) {
      filters.body_type_id = parsed.body_type_id;
    }
    if (parsed.color_id && COLORS.some(c => c.id === parsed.color_id)) {
      filters.color_id = parsed.color_id;
    }
    if (parsed.drive_id && DRIVE_TYPES.some(d => d.id === parsed.drive_id)) {
      filters.drive_id = parsed.drive_id;
    }
    if (parsed.condition_id && CONDITIONS.some(c => c.id === parsed.condition_id)) {
      filters.condition_id = parsed.condition_id;
    }

    // Numeric filters — pass through
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
