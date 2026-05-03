// ============================================================
// Klientský rate-limit pro drahá API volání (Gemini, Nominatim, atd.)
// Zabraňuje účtu klienta za rapid-fire volání. Skutečná ochrana
// API klíčů by měla být na backendu (Edge Function), tohle je
// jen "best effort" obrana proti náhodným click-storm uživatelům.
// ============================================================

interface Bucket {
  count: number;
  resetAt: number;
}

const STORAGE_PREFIX = 'autovizor_ratelimit_';

export function checkRateLimit(
  key: string,
  maxPerWindow: number,
  windowMs: number
): { ok: boolean; remaining: number; resetAt: number } {
  if (typeof window === 'undefined') {
    return { ok: true, remaining: maxPerWindow, resetAt: 0 };
  }

  const storageKey = `${STORAGE_PREFIX}${key}`;
  const now = Date.now();
  let bucket: Bucket;

  try {
    const raw = localStorage.getItem(storageKey);
    bucket = raw ? JSON.parse(raw) : { count: 0, resetAt: now + windowMs };
  } catch {
    bucket = { count: 0, resetAt: now + windowMs };
  }

  // Window expired → reset
  if (now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
  }

  if (bucket.count >= maxPerWindow) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  try {
    localStorage.setItem(storageKey, JSON.stringify(bucket));
  } catch {
    // localStorage full or disabled → fall back to allowing
  }

  return {
    ok: true,
    remaining: maxPerWindow - bucket.count,
    resetAt: bucket.resetAt,
  };
}

export function formatResetTime(resetAt: number): string {
  const ms = resetAt - Date.now();
  if (ms <= 0) return 'nyní';
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) return `za ${minutes} min`;
  const hours = Math.ceil(minutes / 60);
  return `za ${hours} h`;
}
