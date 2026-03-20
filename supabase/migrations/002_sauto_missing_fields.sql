-- ============================================================
-- AUTOVIZOR.CZ - Doplnění chybějících polí ze Sauto API v4.0.19
-- Nové číselníky + nové sloupce v tabulce vehicles
-- ============================================================

-- ============================================================
-- NOVÉ ČÍSELNÍKY
-- ============================================================

-- Typ laku (Sauto: color_type)
CREATE TABLE color_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO color_types (id, name) VALUES
  (1, 'Základní'),
  (2, 'Metalíza'),
  (3, 'Fólie'),
  (4, 'Pastelová'),
  (5, 'Perleťová');

-- Počet stupňů převodovky (Sauto: gearbox_level)
CREATE TABLE gearbox_levels (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO gearbox_levels (id, name) VALUES
  (3, '3stupňová a méně'),
  (4, '4stupňová'),
  (5, '5stupňová'),
  (6, '6stupňová'),
  (7, '7stupňová'),
  (8, '8stupňová a více');

-- Kategorie sedadel autobusu (Sauto: seatplace)
CREATE TABLE seatplace_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO seatplace_types (id, name) VALUES
  (1, 'Do 16 sedadel'),
  (2, '17–29 sedadel'),
  (3, '30–39 sedadel'),
  (4, '40–49 sedadel'),
  (5, '50 a více sedadel');

-- Operativní leasing – určeno pro (Sauto: operating_lease_intended_for)
CREATE TABLE lease_intended_for (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO lease_intended_for (id, name) VALUES
  (1, 'Firma'),
  (2, 'OSVČ'),
  (3, 'Fyzická osoba');

-- Ověřené programy výrobců (Sauto: certified_id)
CREATE TABLE certified_programs (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO certified_programs (id, name) VALUES
  (1, 'Škoda Plus'),
  (2, 'Das WeltAuto'),
  (3, 'BMW Premium Selection'),
  (4, 'Mercedes-Benz Junge Sterne'),
  (5, 'Audi Approved Plus'),
  (6, 'Toyota Garantovaná ojetina'),
  (7, 'Hyundai Promise'),
  (8, 'Volvo Selekt'),
  (9, 'Ford Approved'),
  (10, 'Peugeot Příslib'),
  (11, 'Kia Approved'),
  (12, 'Renault Selection');

-- ============================================================
-- FIX #1: Vytvoření chybějící tabulky color_tones
-- (migrace 001 ji nevytvořila, ale 002 na ni odkazuje)
-- ============================================================
CREATE TABLE IF NOT EXISTS color_tones (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO color_tones (id, name) VALUES
  (1, 'Světlá'),
  (2, 'Tmavá')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================================
-- FIX #2: Vytvoření chybějící tabulky operating_lease_services
-- (migrace 001 ji nevytvořila, ale 002 na ni odkazuje)
-- ============================================================
CREATE TABLE IF NOT EXISTS operating_lease_services (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO operating_lease_services (id, name) VALUES
  (1, 'Servis'),
  (2, 'Zimní pneumatiky'),
  (3, 'GAP')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================================
-- FIX #3: Vytvoření chybějící tabulky engine_volume_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS engine_volume_categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO engine_volume_categories (id, name) VALUES
  (1, 'do 800 ccm'),
  (2, '800 – 1 000 ccm'),
  (3, '1 000 – 1 200 ccm'),
  (4, '1 200 – 1 400 ccm'),
  (5, '1 400 – 1 600 ccm'),
  (6, '1 600 – 1 800 ccm'),
  (7, '1 800 – 2 000 ccm'),
  (8, '2 000 – 2 500 ccm'),
  (9, '2 500 – 3 000 ccm'),
  (10, '3 000 – 4 000 ccm'),
  (11, '4 000 – 5 000 ccm'),
  (12, 'nad 5 000 ccm');

-- ============================================================
-- FIX #4: Oprava deal_types – Sauto API má jen 3 hodnoty
-- ============================================================
TRUNCATE deal_types CASCADE;
INSERT INTO deal_types (id, name) VALUES
  (1, 'Prodej'),
  (2, 'Operativní leasing'),
  (3, 'Prodej nebo leasing');

-- ============================================================
-- FIX #5: Chybějící položky výbavy (87 items)
-- ============================================================
INSERT INTO equipment (id, name, category) VALUES
  -- Bezpečnost
  (10, 'Airbag řidiče', 'Bezpečnost'),
  (11, 'Airbag spolujezdce', 'Bezpečnost'),
  (12, 'Boční airbagy', 'Bezpečnost'),
  (14, 'Hlavové airbagy', 'Bezpečnost'),
  (19, 'Kolenní airbag', 'Bezpečnost'),
  (20, 'Isofix přední sedadlo', 'Bezpečnost'),
  (21, 'Upevňovací body TOP Tether', 'Bezpečnost'),
  -- Komfort
  (29, 'Přední hlavová opěrka', 'Komfort'),
  (34, 'Loketní opěrka vpředu', 'Komfort'),
  (35, 'Loketní opěrka vzadu', 'Komfort'),
  (52, 'El. ovládání oken - přední', 'Komfort'),
  (53, 'El. ovládání oken - zadní', 'Komfort'),
  (69, 'Automatické stahování oken', 'Komfort'),
  (70, 'Dešťový senzor', 'Komfort'),
  (71, 'Senzor světla', 'Komfort'),
  (78, 'Oddělená zadní klimatizace', 'Komfort'),
  -- Interiér
  (55, 'Přihrádka v palubní desce', 'Interiér'),
  -- Sedadla
  (73, 'Sklopná zadní sedadla', 'Sedadla'),
  -- Motocykly
  (100, 'Vyhřívané rukojeti', 'Motocykly'),
  (101, 'Kombinovaný brzdový systém (CBS)', 'Motocykly'),
  (102, 'Quickshifter', 'Motocykly'),
  (104, 'Trakční kontrola', 'Motocykly'),
  (107, 'Výfuk s homologací', 'Motocykly'),
  (109, 'Ochranné rámy motocyklu', 'Motocykly'),
  (110, 'Sedlo pro spolujezdce', 'Motocykly'),
  (111, 'Centrální stojan', 'Motocykly'),
  (112, 'Boční stojan', 'Motocykly'),
  (113, 'Řetěz', 'Motocykly'),
  (114, 'Kardanový převod', 'Motocykly'),
  (115, 'Řemenový převod', 'Motocykly'),
  (116, 'Regulovatelné páčky', 'Motocykly'),
  (117, 'Nastavitelné odpružení', 'Motocykly'),
  -- Nákladní
  (121, 'Hydraulické čelo', 'Nákladní'),
  (122, 'Jeřáb', 'Nákladní'),
  (123, 'Plošina', 'Nákladní'),
  (125, 'Chladírenská nástavba', 'Nákladní'),
  (126, 'Mrazírenská nástavba', 'Nákladní'),
  (129, 'Valníková nástavba', 'Nákladní'),
  (130, 'Skříňová nástavba', 'Nákladní'),
  (131, 'Plachtová nástavba', 'Nákladní'),
  (132, 'Cisternová nástavba', 'Nákladní'),
  (133, 'Kontejnerový nosič', 'Nákladní'),
  (134, 'Odtahový podvozek', 'Nákladní'),
  (135, 'Přeprava vozidel', 'Nákladní'),
  (136, 'Míchačka na beton', 'Nákladní'),
  (140, 'Pneumatické sedadlo řidiče', 'Nákladní'),
  (141, 'Lůžko v kabině', 'Nákladní'),
  (144, 'Třístranný sklápěč', 'Nákladní'),
  (148, 'Posuvný podlaha', 'Nákladní'),
  (157, 'Vzduchové sedadlo spolujezdce', 'Nákladní'),
  (174, 'Dvojité zadní kola', 'Nákladní'),
  (175, 'Elektronický tachograf', 'Nákladní'),
  (176, 'Horský program', 'Nákladní'),
  (177, 'Klanicová nástavba', 'Nákladní'),
  (178, 'Korba', 'Nákladní'),
  (179, 'Měchové odpružení zadní nápravy', 'Nákladní'),
  (180, 'Mezinápravový diferenciál', 'Nákladní'),
  (181, 'Odmontovatelné bočnice', 'Nákladní'),
  (182, 'Přepravní box', 'Nákladní'),
  (185, 'Spací kabina', 'Nákladní'),
  (186, 'Denní kabina', 'Nákladní'),
  -- Obytné vozy
  (82, 'Vařič', 'Obytné vozy'),
  (160, 'Sprcha', 'Obytné vozy'),
  (162, 'Markýza', 'Obytné vozy'),
  (163, 'Solární panel', 'Obytné vozy'),
  (164, 'Satelitní TV', 'Obytné vozy'),
  (165, 'Plynová láhev', 'Obytné vozy'),
  (166, 'Zásobník na vodu', 'Obytné vozy'),
  (167, 'Klimatizace obytné části', 'Obytné vozy'),
  (168, 'Topení obytné části', 'Obytné vozy'),
  (169, 'Elektrická přípojka 230V', 'Obytné vozy'),
  (170, 'Druhá baterie', 'Obytné vozy'),
  (171, 'Generátor', 'Obytné vozy'),
  (172, 'Nájezdová rampa', 'Obytné vozy'),
  (173, 'Jízdní kolo / nosič', 'Obytné vozy'),
  -- Ostatní
  (216, 'Přední ochranný rám', 'Ostatní'),
  (229, 'Sada na opravu pneumatik', 'Ostatní'),
  (230, 'Kompresory na huštění kol', 'Ostatní'),
  (234, 'Hasicí přístroj', 'Ostatní'),
  (235, 'Výstražný trojúhelník', 'Ostatní'),
  (236, 'Reflexní vesta', 'Ostatní'),
  (237, 'Lékárnička', 'Ostatní'),
  (239, 'Druhá sada kol', 'Ostatní'),
  (256, 'Zimní paket', 'Ostatní'),
  (260, 'Servisní paket', 'Ostatní'),
  (269, 'Sériová výbava', 'Ostatní'),
  (272, 'Záruka výrobce', 'Ostatní');

-- ============================================================
-- FIX #6: Oprava kategorií výbavy (66 items s nesprávnou kategorií)
-- Kategorie v SQL se musí shodovat s TS codebooks.ts
-- ============================================================

-- Interiér → Sedadla
UPDATE equipment SET category = 'Sedadla' WHERE id IN (3, 42, 89, 92, 96, 97, 98, 99, 221, 227, 241, 242, 258, 274, 302, 318, 320, 321, 328, 329);

-- Bezpečnost → Asistenční systémy
UPDATE equipment SET category = 'Asistenční systémy' WHERE id IN (250, 251, 252, 255, 261, 262, 263, 299, 303, 305, 306, 311, 324, 325);

-- Komfort → Asistenční systémy
UPDATE equipment SET category = 'Asistenční systémy' WHERE id IN (213, 222, 279, 280);

-- Světla → Asistenční systémy
UPDATE equipment SET category = 'Asistenční systémy' WHERE id = 312;

-- Ostatní → Podvozek a řízení
UPDATE equipment SET category = 'Podvozek a řízení' WHERE id IN (119, 145, 153, 154, 155, 156, 158, 189, 190, 225, 310);

-- Ostatní → Motor a výfuk
UPDATE equipment SET category = 'Motor a výfuk' WHERE id IN (49, 120, 273, 322);

-- Ostatní → Komfort
UPDATE equipment SET category = 'Komfort' WHERE id IN (87, 88);

-- Motocykly → Komfort
UPDATE equipment SET category = 'Komfort' WHERE id = 139;

-- Ostatní → Interiér
UPDATE equipment SET category = 'Interiér' WHERE id IN (86, 90, 91, 215, 309);

-- Ostatní → Exteriér
UPDATE equipment SET category = 'Exteriér' WHERE id IN (74, 192);

-- Ostatní → Světla
UPDATE equipment SET category = 'Světla' WHERE id = 193;

-- Multimédia → Konektivita
UPDATE equipment SET category = 'Konektivita' WHERE id = 244;

-- ============================================================
-- FIX #7: Odstranění starého textového sloupce color_tone
-- (nahrazen referencí color_tone_id)
-- ============================================================
ALTER TABLE vehicles DROP COLUMN IF EXISTS color_tone;

-- ============================================================
-- NOVÉ SLOUPCE V TABULCE VEHICLES
-- ============================================================

-- Cena
ALTER TABLE vehicles ADD COLUMN price_leasing INTEGER;
ALTER TABLE vehicles ADD COLUMN payment INTEGER;
ALTER TABLE vehicles ADD COLUMN payment_count INTEGER;
ALTER TABLE vehicles ADD COLUMN dph BOOLEAN DEFAULT TRUE;

-- Technické
ALTER TABLE vehicles ADD COLUMN gearbox_level_id INTEGER REFERENCES gearbox_levels(id);
ALTER TABLE vehicles ADD COLUMN gas_mileage NUMERIC(5,1);
ALTER TABLE vehicles ADD COLUMN weight INTEGER;
ALTER TABLE vehicles ADD COLUMN load_capacity INTEGER;
ALTER TABLE vehicles ADD COLUMN motohodiny INTEGER;

-- Datum
ALTER TABLE vehicles ADD COLUMN run_date DATE;
ALTER TABLE vehicles ADD COLUMN disused_date DATE;
ALTER TABLE vehicles ADD COLUMN stk_date DATE;
ALTER TABLE vehicles ADD COLUMN guarantee_date DATE;
ALTER TABLE vehicles ADD COLUMN delivery_date DATE;

-- Vzhled
ALTER TABLE vehicles ADD COLUMN color_tone_id INTEGER REFERENCES color_tones(id);
ALTER TABLE vehicles ADD COLUMN color_type_id INTEGER REFERENCES color_types(id);

-- Další
ALTER TABLE vehicles ADD COLUMN seatplace_id INTEGER REFERENCES seatplace_types(id);
ALTER TABLE vehicles ADD COLUMN certified_id INTEGER REFERENCES certified_programs(id);
ALTER TABLE vehicles ADD COLUMN type_info TEXT;

-- Příznaky
ALTER TABLE vehicles ADD COLUMN tunning BOOLEAN DEFAULT FALSE;
ALTER TABLE vehicles ADD COLUMN handicapped BOOLEAN DEFAULT FALSE;
ALTER TABLE vehicles ADD COLUMN environmental_tax BOOLEAN DEFAULT FALSE;

-- Cebia
ALTER TABLE vehicles ADD COLUMN cebia_coupon TEXT;
ALTER TABLE vehicles ADD COLUMN cebia_smart_code_url TEXT;

-- Změna first_owner z BOOLEAN na INTEGER (codebook: 1=Ano, 2=Ne)
ALTER TABLE vehicles ALTER COLUMN first_owner TYPE INTEGER USING CASE WHEN first_owner THEN 1 ELSE 2 END;

-- Upholstery + owner_count + deal_type + seller_type references
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS upholstery_id INTEGER REFERENCES upholstery_types(id);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_count_id INTEGER REFERENCES owner_counts(id);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS deal_type_id INTEGER REFERENCES deal_types(id);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS seller_type_id INTEGER REFERENCES seller_types(id);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS motorcycle_type_id INTEGER REFERENCES motorcycle_types(id);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS truck_type_id INTEGER REFERENCES truck_types(id);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS bus_type_id INTEGER REFERENCES bus_types(id);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS trailer_type_id INTEGER REFERENCES trailer_types(id);

-- ============================================================
-- OPERATIVNÍ LEASING
-- ============================================================

CREATE TABLE operating_leases (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  annual_distance INTEGER,          -- roční nájezd km
  price_without_vat INTEGER,        -- cena bez DPH
  period INTEGER,                   -- doba pronájmu v měsících
  intended_for_id INTEGER REFERENCES lease_intended_for(id),
  additional_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_operating_leases_vehicle ON operating_leases(vehicle_id);

-- Služby operativního leasingu (M:N)
CREATE TABLE operating_lease_service_links (
  operating_lease_id BIGINT REFERENCES operating_leases(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES operating_lease_services(id),
  PRIMARY KEY (operating_lease_id, service_id)
);

-- ============================================================
-- NOVÉ INDEXY
-- ============================================================

CREATE INDEX idx_vehicles_stk ON vehicles(stk_date) WHERE is_active = TRUE AND stk_date IS NOT NULL;
CREATE INDEX idx_vehicles_certified ON vehicles(certified_id) WHERE is_active = TRUE AND certified_id IS NOT NULL;
CREATE INDEX idx_vehicles_color_type ON vehicles(color_type_id) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_gearbox_level ON vehicles(gearbox_level_id) WHERE is_active = TRUE;

-- ============================================================
-- FIX #8: Chybějící Sauto API sloupce
-- ============================================================

-- sign_note: poznámka na štítek za sklem (max 100 znaků)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS sign_note TEXT;

-- deactivation_reason: důvod deaktivace inzerátu
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;

-- car_status: status inzerátu ze Sauto (1=aktivní, jiná=neaktivní)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS car_status INTEGER;

-- priority_ordering: priorita řazení (promoted listing ze Sauto)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS priority_ordering INTEGER DEFAULT 0;

-- ============================================================
-- FIX #9: Odstranění duplicitních textových sloupců
-- (nahrazeny FK referencemi v této migraci)
-- ============================================================

-- deal_type TEXT → deal_type_id INTEGER (již přidáno výše)
ALTER TABLE vehicles DROP COLUMN IF EXISTS deal_type;

-- seller_type TEXT → seller_type_id INTEGER (již přidáno výše)
ALTER TABLE vehicles DROP COLUMN IF EXISTS seller_type;

-- ============================================================
-- FIX #10: Odstranění duplicitní tabulky vehicle_leasing
-- (nahrazena tabulkou operating_leases v této migraci)
-- ============================================================
DROP TABLE IF EXISTS vehicle_leasing CASCADE;

-- ============================================================
-- FIX #11: Přidání pg_trgm pro fulltextové vyhledávání
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- FIX #12: Chybějící indexy na nových FK sloupcích
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_vehicles_deal_type ON vehicles(deal_type_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicles_seller_type ON vehicles(seller_type_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicles_motorcycle ON vehicles(motorcycle_type_id) WHERE is_active = TRUE AND motorcycle_type_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_truck ON vehicles(truck_type_id) WHERE is_active = TRUE AND truck_type_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_bus ON vehicles(bus_type_id) WHERE is_active = TRUE AND bus_type_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_trailer ON vehicles(trailer_type_id) WHERE is_active = TRUE AND trailer_type_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_seatplace ON vehicles(seatplace_id) WHERE is_active = TRUE AND seatplace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_weight ON vehicles(weight) WHERE is_active = TRUE AND weight IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_priority ON vehicles(priority_ordering DESC) WHERE is_active = TRUE AND priority_ordering > 0;
