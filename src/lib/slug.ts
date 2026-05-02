// ============================================================
// AUTOVIZOR.CZ — slug helpery
// Sjednocené pravidlo: /vozidlo/{slug}-{id}
// {slug} je odebraná diakritika + lowercase + dash
// {id} je vždy poslední numerická část — to umožňuje
//   1) bezpečný redirect po změně titulu
//   2) zachování indexace i při změně názvu
// ============================================================

export function makeSlug(input: string): string {
  if (!input) return 'vozidlo';
  const s = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // diakritika
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return s.length > 0 ? s.slice(0, 100) : 'vozidlo';
}

/**
 * Parsuje URL parameter `:slugOrId` na čisté id.
 * - Akceptuje jak `123` tak `skoda-octavia-2-0-tdi-110kw-2019-123`
 * - Extrahuje poslední numerickou část jako id (po posledním dashi)
 */
export function parseSlugOrId(slugOrId: string | undefined): number | undefined {
  if (!slugOrId) return undefined;
  // Pure number
  if (/^\d+$/.test(slugOrId)) return Number(slugOrId);
  // Last numeric segment after a dash
  const m = slugOrId.match(/-(\d+)$/);
  if (m) {
    const n = Number(m[1]);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

export function buildVehicleHref(vehicle: { id: number; slug?: string; title?: string }): string {
  const slug = vehicle.slug?.trim() || makeSlug(vehicle.title ?? '');
  return `/vozidlo/${slug}-${vehicle.id}`;
}

export function buildManufacturerHref(name: string): string {
  return `/hledat?manufacturer_name=${encodeURIComponent(name)}`;
}
