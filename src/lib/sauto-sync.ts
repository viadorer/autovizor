// ============================================================
// AUTOVIZOR.CZ - Sauto.cz synchronizační služba
// Import vozidel z REST Search API + XML-RPC Import API
// Optimalizováno pro 100K+ záznamů
// ============================================================

import { supabase } from './supabase';

// ============================================================
// REST Search API (veřejné, bez autentizace)
// ============================================================

const SAUTO_SEARCH_API = '/api/sauto/api/v1/items/search';

interface SautoSearchParams {
  limit?: number;
  offset?: number;
  manufacturer_model_seo?: string;
  condition_seo?: string;
  category_id?: string;
  price_from?: string;
  price_to?: string;
}

export async function searchSauto(params: SautoSearchParams) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const response = await fetch(`${SAUTO_SEARCH_API}?${searchParams}`);
  if (!response.ok) throw new Error(`Sauto API error: ${response.status}`);
  return response.json();
}

// ============================================================
// XML-RPC Import API (vyžaduje přihlášení)
// ============================================================

const SAUTO_IMPORT_API = 'https://import.sauto.cz/RPC2';

interface SautoSession {
  session_id: string;
  expires_at: number;
}

let currentSession: SautoSession | null = null;

// MD5 hash (pro autentizaci)
async function md5(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('MD5', data).catch(() => null);

  if (hash) {
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Fallback - jednoduchý MD5 (pro produkci použijte knihovnu)
  throw new Error('MD5 není dostupné v tomto prostředí. Nainstalujte knihovnu md5.');
}

// XML-RPC volání
async function xmlRpcCall(method: string, params: unknown[] = []): Promise<unknown> {
  const xmlParams = params.map((p) => serializeParam(p)).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
  <methodName>${method}</methodName>
  <params>${xmlParams}</params>
</methodCall>`;

  const response = await fetch(SAUTO_IMPORT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    body: xml,
  });

  if (!response.ok) throw new Error(`XML-RPC error: ${response.status}`);
  const text = await response.text();
  return parseXmlRpcResponse(text);
}

function serializeParam(value: unknown): string {
  if (typeof value === 'string') {
    return `<param><value><string>${escapeXml(value)}</string></value></param>`;
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return `<param><value><int>${value}</int></value></param>`;
    }
    return `<param><value><double>${value}</double></value></param>`;
  }
  if (typeof value === 'boolean') {
    return `<param><value><boolean>${value ? 1 : 0}</boolean></value></param>`;
  }
  if (Array.isArray(value)) {
    const data = value.map((v) => `<value>${serializeValue(v)}</value>`).join('');
    return `<param><value><array><data>${data}</data></array></value></param>`;
  }
  if (typeof value === 'object' && value !== null) {
    const members = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `<member><name>${k}</name><value>${serializeValue(v)}</value></member>`)
      .join('');
    return `<param><value><struct>${members}</struct></value></param>`;
  }
  return `<param><value><string></string></value></param>`;
}

function serializeValue(value: unknown): string {
  if (typeof value === 'string') return `<string>${escapeXml(value)}</string>`;
  if (typeof value === 'number') return Number.isInteger(value) ? `<int>${value}</int>` : `<double>${value}</double>`;
  if (typeof value === 'boolean') return `<boolean>${value ? 1 : 0}</boolean>`;
  return `<string>${String(value)}</string>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseXmlRpcResponse(xml: string): unknown {
  // Zjednodušený parser - v produkci použijte knihovnu
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const fault = doc.querySelector('fault');
  if (fault) {
    throw new Error(`XML-RPC Fault: ${fault.textContent}`);
  }

  const values = doc.querySelectorAll('params > param > value');
  if (values.length === 0) return null;
  return parseXmlValue(values[0]);
}

function parseXmlValue(element: Element): unknown {
  const child = element.firstElementChild;
  if (!child) return element.textContent;

  switch (child.tagName) {
    case 'string': return child.textContent;
    case 'int':
    case 'i4': return parseInt(child.textContent ?? '0', 10);
    case 'double': return parseFloat(child.textContent ?? '0');
    case 'boolean': return child.textContent === '1';
    case 'struct': {
      const obj: Record<string, unknown> = {};
      child.querySelectorAll(':scope > member').forEach((member) => {
        const name = member.querySelector('name')?.textContent ?? '';
        const value = member.querySelector('value');
        if (value) obj[name] = parseXmlValue(value);
      });
      return obj;
    }
    case 'array': {
      const arr: unknown[] = [];
      child.querySelectorAll(':scope > data > value').forEach((value) => {
        arr.push(parseXmlValue(value));
      });
      return arr;
    }
    default: return child.textContent;
  }
}

// ============================================================
// Autentizace
// ============================================================

export async function loginSauto(login: string, password: string, softwareKey: string): Promise<string> {
  // Krok 1: Získání hash
  const hashResult = await xmlRpcCall('getHash', [login]) as { session_id: string; hash_key: string };

  // Krok 2: Výpočet MD5 hashe
  const passwordMd5 = await md5(password);
  const authHash = await md5(passwordMd5 + hashResult.hash_key);

  // Krok 3: Přihlášení
  const loginResult = await xmlRpcCall('login', [hashResult.session_id, authHash, softwareKey]) as { status: number };

  if (loginResult.status !== 200) {
    throw new Error(`Přihlášení selhalo: status ${loginResult.status}`);
  }

  currentSession = {
    session_id: hashResult.session_id,
    expires_at: Date.now() + 7 * 60 * 60 * 1000, // 7 hodin (bezpečnostní marže)
  };

  return hashResult.session_id;
}

function getSessionId(): string {
  if (!currentSession || Date.now() > currentSession.expires_at) {
    throw new Error('Sauto session vypršela. Přihlaste se znovu.');
  }
  return currentSession.session_id;
}

// ============================================================
// Operace s vozidly
// ============================================================

export async function getCarDetail(carId: number) {
  const sessionId = getSessionId();
  return xmlRpcCall('getCar', [sessionId, carId]);
}

export async function listCars(offset = 0, limit = 100) {
  const sessionId = getSessionId();
  return xmlRpcCall('listOfCars', [sessionId, true, offset, limit]) as Promise<{
    total_cars: number;
    cars: unknown[];
  }>;
}

export async function getCarPhotos(carId: number, offset = 0, limit = 50) {
  const sessionId = getSessionId();
  return xmlRpcCall('listOfPhotos', [sessionId, carId, offset, limit]);
}

export async function getCarEquipment(carId: number) {
  const sessionId = getSessionId();
  return xmlRpcCall('listOfEquipment', [sessionId, carId]);
}

// ============================================================
// Batch synchronizace (pro 100K+ aut)
// ============================================================

interface SyncOptions {
  batchSize?: number;
  priceFrom?: number;
  priceTo?: number;
  onProgress?: (processed: number, total: number) => void;
}

export async function syncFromSearchApi(options: SyncOptions = {}) {
  const { batchSize = 1000, priceFrom, priceTo, onProgress } = options;

  let offset = 0;
  let totalProcessed = 0;
  let hasMore = true;

  // Log start
  const { data: syncLog } = await supabase
    .from('sync_log')
    .insert({ source: 'sauto', status: 'running' })
    .select()
    .single();

  try {
    while (hasMore) {
      const params: SautoSearchParams = {
        limit: batchSize,
        offset,
        ...(priceFrom !== undefined && { price_from: String(priceFrom) }),
        ...(priceTo !== undefined && { price_to: String(priceTo) }),
      };

      const result = await searchSauto(params);
      const items = result?.results ?? [];

      if (items.length === 0) {
        hasMore = false;
        break;
      }

      // Transformace a upsert do Supabase
      const vehicles = items.map(transformSautoItem);

      const { error } = await supabase
        .from('vehicles')
        .upsert(vehicles, { onConflict: 'sauto_id' });

      if (error) {
        console.error('Upsert error:', error);
      }

      totalProcessed += items.length;
      offset += batchSize;
      onProgress?.(totalProcessed, -1);

      // Rate limiting
      await new Promise((r) => setTimeout(r, 500));

      if (items.length < batchSize) {
        hasMore = false;
      }
    }

    // Log complete
    if (syncLog) {
      await supabase
        .from('sync_log')
        .update({
          status: 'completed',
          processed_items: totalProcessed,
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - new Date(syncLog.started_at).getTime(),
        })
        .eq('id', syncLog.id);
    }

    return { success: true, processed: totalProcessed };
  } catch (error) {
    // Log error
    if (syncLog) {
      await supabase
        .from('sync_log')
        .update({
          status: 'failed',
          error_message: String(error),
          processed_items: totalProcessed,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog.id);
    }
    throw error;
  }
}

// Segmentovaný sync (pro kompletní import 100K+)
// Rozdělí import na cenové segmenty, aby obešel limit 1000 výsledků
export async function fullSync(onProgress?: (msg: string) => void) {
  const priceSegments = [
    [0, 50000],
    [50001, 100000],
    [100001, 200000],
    [200001, 300000],
    [300001, 500000],
    [500001, 750000],
    [750001, 1000000],
    [1000001, 1500000],
    [1500001, 2000000],
    [2000001, 3000000],
    [3000001, 5000000],
    [5000001, 99999999],
  ];

  let totalProcessed = 0;

  for (const [from, to] of priceSegments) {
    onProgress?.(`Synchronizuji cenový segment ${from.toLocaleString('cs-CZ')} - ${to.toLocaleString('cs-CZ')} Kč...`);

    const result = await syncFromSearchApi({
      priceFrom: from,
      priceTo: to,
      onProgress: (processed) => {
        onProgress?.(`Segment ${from.toLocaleString('cs-CZ')}-${to.toLocaleString('cs-CZ')} Kč: ${processed} vozidel`);
      },
    });

    totalProcessed += result.processed;
    onProgress?.(`Segment dokončen: ${result.processed} vozidel`);
  }

  // Aktualizace materialized views
  onProgress?.('Aktualizuji statistiky...');
  await supabase.rpc('refresh_materialized_views');

  onProgress?.(`Synchronizace dokončena. Celkem: ${totalProcessed} vozidel.`);
  return totalProcessed;
}

// ============================================================
// Transformace dat z API do DB schématu
// ============================================================

function transformSautoItem(item: Record<string, unknown>) {
  return {
    sauto_id: item.id,
    title: `${item.manufacturer_name ?? ''} ${item.model_name ?? ''}`.trim() || 'Neznámé',
    kind_id: item.kind_id ?? 1,
    manufacturer_id: item.manufacturer_id,
    model_id: item.model_id,
    condition_id: item.condition_id,
    price: item.price ?? 0,
    fuel_type_id: item.fuel_id,
    gearbox_id: item.gearbox_id,
    drive_id: item.drive_id,
    engine_volume: item.engine_volume,
    engine_power: item.engine_power,
    engine_power_ps: item.engine_power ? Math.round((item.engine_power as number) * 1.36) : null,
    tachometer: item.tachometer ?? 0,
    made_year: item.made_year,
    made_month: item.made_month,
    color_id: item.color_id,
    door_count_id: item.door_id,
    capacity_id: item.capacity_id,
    aircondition_id: item.aircondition_id,
    region_id: item.region_id,
    address: item.address,
    seller_name: item.seller_name,
    seller_type: item.seller_type ?? 'dealer',
    main_image_url: item.main_image_url ?? item.image_url,
    main_thumbnail_url: item.thumbnail_url,
    images: item.images ?? [],
    image_count: item.image_count ?? 0,
    source: 'sauto',
    source_url: item.url,
    is_active: true,
    synced_at: new Date().toISOString(),
  };
}

// ============================================================
// Codebook sync (stažení číselníků)
// ============================================================

export async function syncCodebooks() {
  const codebookUrls = [
    { name: 'fuel', table: 'fuel_types', idField: 'fuel_id', nameField: 'fuel_name' },
    { name: 'gearbox', table: 'gearbox_types', idField: 'gearbox_id', nameField: 'gearbox_name' },
    { name: 'color', table: 'colors', idField: 'color_id', nameField: 'color_name' },
    { name: 'condition', table: 'conditions', idField: 'condition_id', nameField: 'condition_name' },
    { name: 'drive', table: 'drive_types', idField: 'drive_id', nameField: 'drive_name' },
    { name: 'aircondition', table: 'aircondition_types', idField: 'aircondition_id', nameField: 'aircondition_name' },
    { name: 'euro', table: 'euro_types', idField: 'euro_id', nameField: 'euro_name' },
    { name: 'door', table: 'door_counts', idField: 'door_id', nameField: 'door_name' },
    { name: 'capacity', table: 'capacity_types', idField: 'capacity_id', nameField: 'capacity_name' },
    { name: 'state', table: 'countries', idField: 'state_id', nameField: 'state_name' },
  ];

  for (const codebook of codebookUrls) {
    try {
      const response = await fetch(`https://www.sauto.cz/import/list?list=${codebook.name}`);
      if (!response.ok) continue;

      const xml = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');

      const items: { id: number; name: string }[] = [];
      doc.querySelectorAll(`${codebook.name}_list > ${codebook.name}`).forEach((el) => {
        const id = parseInt(el.querySelector(codebook.idField)?.textContent ?? '0', 10);
        const name = el.querySelector(codebook.nameField)?.textContent ?? '';
        if (id && name) items.push({ id, name });
      });

      if (items.length > 0) {
        await supabase.from(codebook.table).upsert(items, { onConflict: 'id' });
      }
    } catch (err) {
      console.error(`Chyba při syncu číselníku ${codebook.name}:`, err);
    }
  }
}

// ============================================================
// Sync výrobců a modelů
// ============================================================

export async function syncManufacturersAndModels() {
  try {
    const response = await fetch('https://www.sauto.cz/import/carList');
    if (!response.ok) throw new Error('Nelze načíst carList');

    const xml = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    const manufacturers: { id: number; name: string }[] = [];
    const models: { id: number; manufacturer_id: number; name: string }[] = [];

    doc.querySelectorAll('manufacturer').forEach((mfrEl) => {
      const mfrId = parseInt(mfrEl.querySelector('manufacturer_id')?.textContent ?? '0', 10);
      const mfrName = mfrEl.querySelector('manufacturer_name')?.textContent ?? '';

      if (mfrId && mfrName) {
        manufacturers.push({ id: mfrId, name: mfrName });

        mfrEl.querySelectorAll('model').forEach((modelEl) => {
          const modelId = parseInt(modelEl.querySelector('model_id')?.textContent ?? '0', 10);
          const modelName = modelEl.querySelector('model_name')?.textContent ?? '';
          if (modelId && modelName) {
            models.push({ id: modelId, manufacturer_id: mfrId, name: modelName });
          }
        });
      }
    });

    // Upsert
    if (manufacturers.length > 0) {
      await supabase.from('manufacturers').upsert(manufacturers, { onConflict: 'id' });
    }
    if (models.length > 0) {
      // Batch po 500
      for (let i = 0; i < models.length; i += 500) {
        await supabase.from('models').upsert(models.slice(i, i + 500), { onConflict: 'id' });
      }
    }

    return { manufacturers: manufacturers.length, models: models.length };
  } catch (err) {
    console.error('Chyba při syncu výrobců:', err);
    throw err;
  }
}
