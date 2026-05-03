# Autovizor Photo Uploader (Cloudflare Worker)

Bezpečný upload fotek vozidel z prohlížeče přímo do Cloudflare R2.

## Architektura

```
Browser (Sell Wizard)
    │
    │  1. Client-side resize (Canvas API → max 1920px)
    │  2. POST /upload + Supabase JWT
    ▼
Cloudflare Worker (autovizor-photo-uploader.workers.dev)
    │
    │  1. Verify JWT (HS256, Supabase secret)
    │  2. Validate MIME + size
    │  3. Path enforcement: vehicles/{user_id}/...
    │  4. R2 PUT
    ▼
Cloudflare R2 (autovizor bucket, public)
    │
    ▼
Public URL → uloženo do vehicles.images JSONB
```

## Cena

- Worker: **100k requests/den zdarma**, $0.30/M poté
- R2 storage: $0.015/GB
- R2 egress: **zdarma** (klíčová výhoda vs. Supabase Storage)

## Setup (jednorázově)

```bash
cd cloudflare/photo-uploader
npm install
npx wrangler login
```

V `wrangler.toml` uprav:

- `SUPABASE_PROJECT_URL` na svou Supabase URL
- `R2_PUBLIC_URL` na svou R2 public URL (Dashboard → R2 → bucket → Settings → Public access)
- `bucket_name` v `[[r2_buckets]]` pokud nemáš bucket "autovizor"

Nastav secret:

```bash
npx wrangler secret put SUPABASE_JWT_SECRET
# vlož JWT Secret z Supabase Dashboard → Settings → API → JWT Settings
```

Deploy:

```bash
npm run deploy
```

Po deploy získáš URL `https://autovizor-photo-uploader.<account>.workers.dev`.

V hlavním projektu nastav env var:

```bash
# .env
VITE_PHOTO_UPLOADER_URL=https://autovizor-photo-uploader.<account>.workers.dev
```

## API

### `POST /upload`

```http
POST /upload HTTP/1.1
Authorization: Bearer <supabase_jwt>
Content-Type: multipart/form-data

file: <binary image data>
draft_key: draft-abc123 | vehicle-456
index: 0
```

**Response:**

```json
{
  "url": "https://pub-xxx.r2.dev/vehicles/{user_id}/{draft_key}/0.jpg",
  "key": "vehicles/{user_id}/{draft_key}/0.jpg",
  "size": 234567,
  "type": "image/jpeg"
}
```

### `POST /delete`

```http
POST /delete HTTP/1.1
Authorization: Bearer <supabase_jwt>
Content-Type: application/json

{ "key": "vehicles/{user_id}/{draft_key}/0.jpg" }
```

User může mazat **jen své fotky** (path musí začínat `vehicles/{user_id}/`).

### `GET /health`

```json
{ "ok": true, "version": "1.0.0" }
```

## Lokální vývoj

```bash
npx wrangler dev
# Worker poběží na http://localhost:8787
```

Ve frontend dočasně:

```bash
VITE_PHOTO_UPLOADER_URL=http://localhost:8787
```

## Logy

```bash
npx wrangler tail
```

## Bezpečnost

- ✅ JWT verifikace (HS256, expirace, issuer match)
- ✅ Path enforcement (`vehicles/{user_id}/...` — user nemůže nahrát do cizí složky)
- ✅ MIME whitelist (jen image/*)
- ✅ Size limit 10 MB
- ✅ CORS allowlist přes `ALLOWED_ORIGINS` env var
- ✅ Client-side resize → menší upload, méně storage
- ✅ Public R2 read přes vlastní URL (žádné secrets)

## TODO později

- [ ] Cloudflare Image Resizing pro on-demand variants (paid, $5/měs)
- [ ] AVIF re-encoding ve workeru (vyžaduje wasm-image-optimization, ~700 kB)
- [ ] Rate limit per user_id (Cloudflare Workers + Durable Object)
- [ ] Cleanup zombie uploads (R2 lifecycle rule pro draft-* paths > 30 dní)
