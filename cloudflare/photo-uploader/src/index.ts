/**
 * AUTOVIZOR.CZ — Cloudflare Worker pro upload fotek vozidel do R2
 *
 * Endpoint:
 *   POST /upload
 *   Headers: Authorization: Bearer <supabase_jwt>
 *   Body: multipart/form-data
 *     - file: image/jpeg | image/png | image/webp | image/avif
 *     - draft_key: string (např. "draft-abc123" nebo "vehicle-456")
 *     - index: number (pořadí, např. "0")
 *   Response: { url: string, key: string, size: number }
 *
 *   POST /delete
 *   Headers: Authorization: Bearer <supabase_jwt>
 *   Body: { key: string }
 *   (User může mazat jen své vlastní fotky — path musí začínat user_id)
 *
 * Bezpečnost:
 *   - JWT verifikace přes Supabase project URL
 *   - Path enforcement: vehicles/{user_id}/...
 *   - Max file size 10 MB
 *   - Allowed MIME types: image/jpeg, image/png, image/webp, image/avif
 *
 * Env vars (wrangler secret put):
 *   - SUPABASE_PROJECT_URL: https://<project>.supabase.co
 *   - SUPABASE_JWT_SECRET: JWT secret z Supabase Dashboard → Settings → API → JWT Secret
 *
 * R2 binding:
 *   - VEHICLE_PHOTOS: R2 bucket (autovizor)
 *
 * Cena: 100k requests/den zdarma, $0.30/M poté.
 * R2: $0.015/GB storage, egress zdarma.
 */

interface Env {
  VEHICLE_PHOTOS: R2Bucket;
  SUPABASE_PROJECT_URL: string;
  SUPABASE_JWT_SECRET: string;
  R2_PUBLIC_URL: string; // např. https://pub-xxx.r2.dev nebo CDN domain
  ALLOWED_ORIGINS: string; // čárkou oddělené, např. "https://autovizor.cz,http://localhost:3000"
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') ?? '';
    const allowedOrigins = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim());
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? '*';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(corsOrigin),
      });
    }

    // Health
    if (url.pathname === '/health') {
      return jsonResponse({ ok: true, version: '1.0.0' }, corsOrigin);
    }

    // Upload
    if (url.pathname === '/upload' && request.method === 'POST') {
      return handleUpload(request, env, corsOrigin);
    }

    // Delete
    if (url.pathname === '/delete' && request.method === 'POST') {
      return handleDelete(request, env, corsOrigin);
    }

    return new Response('Not found', { status: 404, headers: corsHeaders(corsOrigin) });
  },
};

// ============================================================
// Upload handler
// ============================================================
async function handleUpload(request: Request, env: Env, corsOrigin: string): Promise<Response> {
  // 1. Auth — verifikace JWT
  const userId = await verifyJwt(request, env);
  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, corsOrigin, 401);
  }

  try {
    // 2. Parse multipart
    const formData = await request.formData();
    const file = formData.get('file');
    const draftKey = String(formData.get('draft_key') ?? '');
    const index = String(formData.get('index') ?? '0');

    if (!(file instanceof File)) {
      return jsonResponse({ error: 'Missing file' }, corsOrigin, 400);
    }

    if (!draftKey || !/^[a-zA-Z0-9-_]{1,64}$/.test(draftKey)) {
      return jsonResponse({ error: 'Invalid draft_key' }, corsOrigin, 400);
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return jsonResponse({ error: `Unsupported file type: ${file.type}` }, corsOrigin, 415);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonResponse({ error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024} MB)` }, corsOrigin, 413);
    }

    // 3. Build path: vehicles/{user_id}/{draft_key}/{index}.{ext}
    const ext = mimeToExt(file.type);
    const safeIndex = /^\d+$/.test(index) ? index : '0';
    const key = `vehicles/${userId}/${draftKey}/${safeIndex}.${ext}`;

    // 4. Put to R2
    const arrayBuffer = await file.arrayBuffer();
    await env.VEHICLE_PHOTOS.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
      },
      customMetadata: {
        userId,
        draftKey,
        uploadedAt: new Date().toISOString(),
      },
    });

    // 5. Build public URL
    const publicUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;

    return jsonResponse({
      url: publicUrl,
      key,
      size: file.size,
      type: file.type,
    }, corsOrigin);
  } catch (err) {
    console.error('Upload error:', err);
    return jsonResponse({ error: String(err) }, corsOrigin, 500);
  }
}

// ============================================================
// Delete handler
// ============================================================
async function handleDelete(request: Request, env: Env, corsOrigin: string): Promise<Response> {
  const userId = await verifyJwt(request, env);
  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, corsOrigin, 401);
  }

  try {
    const body = await request.json<{ key: string }>();
    const key = body?.key;

    if (!key || typeof key !== 'string') {
      return jsonResponse({ error: 'Missing key' }, corsOrigin, 400);
    }

    // Path enforcement: user může mazat jen své fotky
    const expectedPrefix = `vehicles/${userId}/`;
    if (!key.startsWith(expectedPrefix)) {
      return jsonResponse({ error: 'Forbidden — můžete mazat jen své fotky' }, corsOrigin, 403);
    }

    await env.VEHICLE_PHOTOS.delete(key);
    return jsonResponse({ deleted: key }, corsOrigin);
  } catch (err) {
    console.error('Delete error:', err);
    return jsonResponse({ error: String(err) }, corsOrigin, 500);
  }
}

// ============================================================
// JWT verification (HS256 — Supabase's default)
// Supabase používá HS256 s shared secret JWT_SECRET.
// V Cloudflare Worker není zabudované JWT lib, musíme ručně.
// ============================================================
async function verifyJwt(request: Request, env: Env): Promise<string | null> {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);

  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    // Verify signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(env.SUPABASE_JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlDecode(signatureB64);
    const valid = await crypto.subtle.verify('HMAC', key, signature, data);
    if (!valid) return null;

    // Parse payload
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64))) as {
      sub?: string;
      exp?: number;
      iss?: string;
    };

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Check issuer matches our project
    if (payload.iss && env.SUPABASE_PROJECT_URL && !payload.iss.startsWith(env.SUPABASE_PROJECT_URL)) {
      return null;
    }

    return payload.sub ?? null;
  } catch (err) {
    console.error('JWT verify error:', err);
    return null;
  }
}

// ============================================================
// Helpers
// ============================================================
function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(body: unknown, corsOrigin: string, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(corsOrigin),
    },
  });
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    default:
      return 'bin';
  }
}

function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(input.length + ((4 - (input.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
