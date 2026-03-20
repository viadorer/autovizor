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

-- Oprava color_tones – Sauto má jen 2 hodnoty
DELETE FROM color_tones WHERE id > 2;
UPDATE color_tones SET name = 'Světlá' WHERE id = 1;
UPDATE color_tones SET name = 'Tmavá' WHERE id = 2;

-- Oprava operating_lease_services
DELETE FROM operating_lease_services;
INSERT INTO operating_lease_services (id, name) VALUES
  (1, 'Servis'),
  (2, 'Zimní pneumatiky'),
  (3, 'GAP');

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
