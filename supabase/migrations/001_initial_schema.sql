-- ============================================================
-- AUTOVIZOR.CZ - Kompletní databázové schéma
-- Optimalizováno pro 100K+ vozidel
-- Všechny číselníky ze Sauto.cz API
-- ============================================================

-- Rozšíření pro fulltextové vyhledávání (trigram)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- ČÍSELNÍKY (Codebooks)
-- ============================================================

-- Výrobci vozidel
CREATE TABLE manufacturers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  seo_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_manufacturers_name ON manufacturers(name);
CREATE INDEX idx_manufacturers_seo ON manufacturers(seo_name);

-- Modely vozidel
CREATE TABLE models (
  id INTEGER PRIMARY KEY,
  manufacturer_id INTEGER NOT NULL REFERENCES manufacturers(id),
  name TEXT NOT NULL,
  seo_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_models_manufacturer ON models(manufacturer_id);
CREATE INDEX idx_models_name ON models(name);

-- Typ karoserie
CREATE TABLE body_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO body_types (id, name) VALUES
  (1, 'Hatchback'),
  (2, 'Sedan'),
  (3, 'Kombi'),
  (4, 'Liftback'),
  (5, 'MPV'),
  (6, 'SUV'),
  (7, 'Kupé'),
  (8, 'Kabriolet'),
  (9, 'Roadster'),
  (10, 'Pickup'),
  (11, 'Van'),
  (12, 'Minivan'),
  (13, 'Limuzína'),
  (14, 'Terénní'),
  (15, 'Mikro'),
  (16, 'Fastback'),
  (17, 'Targa'),
  (18, 'Shooting Brake'),
  (19, 'Jiné');

-- Typ motocyklu
CREATE TABLE motorcycle_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO motorcycle_types (id, name) VALUES
  (1, 'Naked'), (2, 'Sportovní'), (3, 'Touring'), (4, 'Chopper/Cruiser'),
  (5, 'Enduro'), (6, 'Cross/Motokros'), (7, 'Supermoto'), (8, 'Skútr'),
  (9, 'Trial'), (10, 'Cestovní enduro'), (11, 'Café racer'), (12, 'Bobber'),
  (13, 'Scrambler'), (14, 'Minibike'), (15, 'Elektrický'), (16, 'Tříkolka'),
  (17, 'Sidecar'), (18, 'Jiný');

-- Typ nákladního vozidla
CREATE TABLE truck_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO truck_types (id, name) VALUES
  (1, 'Tahač návěsů'), (2, 'Valník'), (3, 'Sklápěč'), (4, 'Skříňový'),
  (5, 'Plachtový'), (6, 'Cisternový'), (7, 'Nosič kontejnerů'),
  (8, 'Chladírenský/Mrazírenský'), (9, 'Míchač'), (10, 'Podvozek'),
  (11, 'Odtahový'), (12, 'Přeprava vozidel'), (13, 'Hasiči/Speciální'),
  (14, 'Komunální'), (15, 'Hydraulická ruka'), (16, 'Jiný');

-- Typ autobusu
CREATE TABLE bus_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO bus_types (id, name) VALUES
  (1, 'Městský'), (2, 'Meziměstský'), (3, 'Dálkový/Zájezdový'),
  (4, 'Minibus'), (5, 'Školní'), (6, 'Kloubový'), (7, 'Patrový'),
  (8, 'Trolejbus'), (9, 'Jiný');

-- Typ přívěsu/návěsu
CREATE TABLE trailer_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO trailer_types (id, name) VALUES
  (1, 'Skříňový'), (2, 'Plachtový/Curtainsider'), (3, 'Valníkový'),
  (4, 'Podvalník/Nízkoložný'), (5, 'Sklápěcí'), (6, 'Chladírenský'),
  (7, 'Cisternový'), (8, 'Přeprava vozidel'), (9, 'Přeprava kontejnerů'),
  (10, 'Přívěs za osobní'), (11, 'Přívěs pro přepravu člunů'),
  (12, 'Přívěs pro přepravu koní'), (13, 'Obytný přívěs'), (14, 'Jiný');

-- Typ prodejce
CREATE TABLE seller_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO seller_types (id, name) VALUES
  (1, 'Soukromý prodejce'), (2, 'Autobazar'), (3, 'Autorizovaný dealer'),
  (4, 'Leasingová společnost'), (5, 'Autoservis');

-- Typ obchodu
CREATE TABLE deal_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO deal_types (id, name) VALUES
  (1, 'Prodej'), (2, 'Leasing'), (3, 'Operativní leasing'),
  (4, 'Úvěr'), (5, 'Na splátky'), (6, 'Na protiúčet');

-- Materiál čalounění
CREATE TABLE upholstery_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO upholstery_types (id, name) VALUES
  (1, 'Látka'), (2, 'Kůže'), (3, 'Částečná kůže'), (4, 'Alcantara'),
  (5, 'Semišová kůže'), (6, 'Umělá kůže'), (7, 'Velur'),
  (8, 'Kombinace kůže/látka'), (9, 'Jiné');

-- Hmotnostní kategorie
CREATE TABLE weight_categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO weight_categories (id, name) VALUES
  (1, 'do 3,5 t'), (2, '3,5 – 7,5 t'), (3, '7,5 – 12 t'),
  (4, '12 – 18 t'), (5, '18 – 26 t'), (6, '26 – 32 t'), (7, 'nad 32 t');

-- Typ čtyřkolky
CREATE TABLE quad_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO quad_types (id, name) VALUES
  (1, 'Sportovní'), (2, 'Užitková'), (3, 'Dětská'),
  (4, 'Side-by-side (UTV)'), (5, 'Jiná');

-- Počet vlastníků
CREATE TABLE owner_counts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO owner_counts (id, name) VALUES
  (1, '1. majitel'), (2, '2. majitel'), (3, '3. majitel'), (4, '4. a více');

-- Typ pracovního stroje
CREATE TABLE machine_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO machine_types (id, name) VALUES
  (1, 'Bagr'), (2, 'Nakladač'), (3, 'Buldozer'), (4, 'Jeřáb'),
  (5, 'Vysokozdvižný vozík'), (6, 'Válec'), (7, 'Fréza'),
  (8, 'Kompresor'), (9, 'Plošina'), (10, 'Manipulátor'),
  (11, 'Traktor'), (12, 'Jiný');

-- Druh vozidla (kind)
CREATE TABLE vehicle_kinds (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO vehicle_kinds (id, name) VALUES
  (1, 'Osobní'),
  (3, 'Motocykl'),
  (4, 'Užitkové'),
  (5, 'Nákladní'),
  (6, 'Autobus'),
  (7, 'Přívěs/Návěs'),
  (9, 'Obytné'),
  (10, 'Pracovní stroj'),
  (11, 'Čtyřkolka'),
  (12, 'Náhradní díly');

-- Palivo
CREATE TABLE fuel_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO fuel_types (id, name) VALUES
  (1, 'Benzín'),
  (2, 'Nafta'),
  (3, 'LPG + benzín'),
  (4, 'Elektro'),
  (5, 'Hybridní'),
  (6, 'CNG + benzín'),
  (7, 'Ethanol'),
  (8, 'Jiné'),
  (9, 'Vodík');

-- Převodovka
CREATE TABLE gearbox_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO gearbox_types (id, name) VALUES
  (1, 'Manuální'),
  (2, 'Poloautomatická'),
  (3, 'Automatická');

-- Barva
CREATE TABLE colors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO colors (id, name) VALUES
  (1, 'Bílá'),
  (2, 'Žlutá'),
  (3, 'Oranžová'),
  (4, 'Červená'),
  (5, 'Vínová'),
  (6, 'Růžová'),
  (7, 'Fialová'),
  (8, 'Modrá'),
  (9, 'Zelená'),
  (10, 'Hnědá'),
  (11, 'Šedá'),
  (12, 'Černá'),
  (13, 'Béžová'),
  (14, 'Stříbrná'),
  (15, 'Zlatá'),
  (16, 'Jiná'),
  (17, 'Bronzová');

-- Stav vozidla
CREATE TABLE conditions (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO conditions (id, name) VALUES
  (1, 'Nové'),
  (2, 'Ojeté'),
  (3, 'Havarované'),
  (4, 'Předváděcí'),
  (5, 'Veterán');

-- Pohon
CREATE TABLE drive_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO drive_types (id, name) VALUES
  (1, '4x2'),
  (2, '4x4'),
  (3, '6x2'),
  (4, '6x4'),
  (5, '6x6'),
  (6, '8x4'),
  (7, '8x6'),
  (8, '8x8'),
  (9, 'Pohon předních kol'),
  (10, 'Pohon zadních kol');

-- Klimatizace
CREATE TABLE aircondition_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO aircondition_types (id, name) VALUES
  (1, 'Bez klimatizace'),
  (2, 'Manuální'),
  (3, 'Automatická'),
  (4, 'Dvouzónová automatická'),
  (5, 'Třízónová automatická'),
  (6, 'Čtyřzónová automatická');

-- Emisní norma
CREATE TABLE euro_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO euro_types (id, name) VALUES
  (1, 'EURO 1'),
  (2, 'EURO 2'),
  (3, 'EURO 3'),
  (4, 'EURO 4'),
  (5, 'EURO 5'),
  (6, 'EURO 6');

-- Počet dveří
CREATE TABLE door_counts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO door_counts (id, name) VALUES
  (1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5'), (6, '6');

-- Počet airbagů
CREATE TABLE airbag_counts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO airbag_counts (id, name) VALUES
  (1, '1'), (2, '2'), (3, '4'), (4, '6'), (5, '7'),
  (6, '8'), (7, '9'), (8, '10'), (9, '12'), (10, '14');

-- Počet míst
CREATE TABLE capacity_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO capacity_types (id, name) VALUES
  (1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5'),
  (6, '6'), (7, '7'), (8, '8'), (9, '9');

-- Počet lůžek (obytné vozy)
CREATE TABLE bed_counts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO bed_counts (id, name) VALUES
  (1, '1'), (2, '2'), (3, '3'), (4, '4'),
  (5, '5'), (6, '6'), (7, '7'), (8, '8 a více');

-- Dostupnost
CREATE TABLE availability_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO availability_types (id, name) VALUES
  (1, 'Datum'),
  (2, 'Skladem'),
  (3, 'Na objednávku');

-- Servisní knížka
CREATE TABLE servicebook_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO servicebook_types (id, name) VALUES
  (1, 'Ano'),
  (2, 'Ne');

-- Jednotka tachometru
CREATE TABLE tachometer_units (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO tachometer_units (id, name) VALUES
  (1, 'km'),
  (2, 'míle');

-- Země původu
CREATE TABLE countries (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO countries (id, name) VALUES
  (1, 'Česká republika'),
  (2, 'Slovenská republika'),
  (3, 'Francie'),
  (4, 'Itálie'),
  (5, 'Německo'),
  (6, 'Rakousko'),
  (7, 'Švýcarsko'),
  (8, 'Holandsko'),
  (9, 'Lucembursko'),
  (10, 'Jiná'),
  (11, 'Belgie'),
  (12, 'Španělsko'),
  (13, 'Dánsko'),
  (14, 'Nedohledatelný původ'),
  (15, 'USA'),
  (16, 'Švédsko'),
  (17, 'Polsko');

-- Regiony (okresy)
CREATE TABLE regions (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  region_group TEXT
);
INSERT INTO regions (id, name, region_group) VALUES
  (47, 'Hlavní město Praha', 'Praha'),
  (1, 'České Budějovice', 'Jihočeský kraj'),
  (2, 'Český Krumlov', 'Jihočeský kraj'),
  (3, 'Jindřichův Hradec', 'Jihočeský kraj'),
  (4, 'Písek', 'Jihočeský kraj'),
  (5, 'Prachatice', 'Jihočeský kraj'),
  (6, 'Strakonice', 'Jihočeský kraj'),
  (7, 'Tábor', 'Jihočeský kraj'),
  (8, 'Domažlice', 'Plzeňský kraj'),
  (9, 'Cheb', 'Karlovarský kraj'),
  (10, 'Karlovy Vary', 'Karlovarský kraj'),
  (11, 'Klatovy', 'Plzeňský kraj'),
  (12, 'Plzeň-město', 'Plzeňský kraj'),
  (13, 'Plzeň-jih', 'Plzeňský kraj'),
  (14, 'Plzeň-sever', 'Plzeňský kraj'),
  (15, 'Rokycany', 'Plzeňský kraj'),
  (16, 'Sokolov', 'Karlovarský kraj'),
  (17, 'Tachov', 'Plzeňský kraj'),
  (18, 'Česká Lípa', 'Liberecký kraj'),
  (19, 'Děčín', 'Ústecký kraj'),
  (20, 'Chomutov', 'Ústecký kraj'),
  (21, 'Jablonec nad Nisou', 'Liberecký kraj'),
  (22, 'Liberec', 'Liberecký kraj'),
  (23, 'Litoměřice', 'Ústecký kraj'),
  (24, 'Louny', 'Ústecký kraj'),
  (25, 'Most', 'Ústecký kraj'),
  (26, 'Teplice', 'Ústecký kraj'),
  (27, 'Ústí nad Labem', 'Ústecký kraj'),
  (28, 'Hradec Králové', 'Královéhradecký kraj'),
  (29, 'Chrudim', 'Pardubický kraj'),
  (30, 'Jičín', 'Královéhradecký kraj'),
  (31, 'Náchod', 'Královéhradecký kraj'),
  (32, 'Pardubice', 'Pardubický kraj'),
  (33, 'Rychnov nad Kněžnou', 'Královéhradecký kraj'),
  (34, 'Semily', 'Liberecký kraj'),
  (35, 'Svitavy', 'Pardubický kraj'),
  (36, 'Trutnov', 'Královéhradecký kraj'),
  (37, 'Ústí nad Orlicí', 'Pardubický kraj'),
  (38, 'Zlín', 'Zlínský kraj'),
  (39, 'Kroměříž', 'Zlínský kraj'),
  (40, 'Prostějov', 'Olomoucký kraj'),
  (41, 'Uherské Hradiště', 'Zlínský kraj'),
  (42, 'Olomouc', 'Olomoucký kraj'),
  (43, 'Přerov', 'Olomoucký kraj'),
  (44, 'Šumperk', 'Olomoucký kraj'),
  (45, 'Vsetín', 'Zlínský kraj'),
  (46, 'Jeseník', 'Olomoucký kraj'),
  (48, 'Benešov', 'Středočeský kraj'),
  (49, 'Beroun', 'Středočeský kraj'),
  (50, 'Kladno', 'Středočeský kraj'),
  (51, 'Kolín', 'Středočeský kraj'),
  (52, 'Kutná Hora', 'Středočeský kraj'),
  (53, 'Mladá Boleslav', 'Středočeský kraj'),
  (54, 'Mělník', 'Středočeský kraj'),
  (55, 'Nymburk', 'Středočeský kraj'),
  (56, 'Praha-východ', 'Středočeský kraj'),
  (57, 'Praha-západ', 'Středočeský kraj'),
  (58, 'Příbram', 'Středočeský kraj'),
  (59, 'Rakovník', 'Středočeský kraj'),
  (60, 'Bruntál', 'Moravskoslezský kraj'),
  (61, 'Frýdek-Místek', 'Moravskoslezský kraj'),
  (62, 'Karviná', 'Moravskoslezský kraj'),
  (63, 'Nový Jičín', 'Moravskoslezský kraj'),
  (64, 'Opava', 'Moravskoslezský kraj'),
  (65, 'Ostrava-město', 'Moravskoslezský kraj'),
  (66, 'Havlíčkův Brod', 'Kraj Vysočina'),
  (67, 'Jihlava', 'Kraj Vysočina'),
  (68, 'Pelhřimov', 'Kraj Vysočina'),
  (69, 'Třebíč', 'Kraj Vysočina'),
  (70, 'Žďár nad Sázavou', 'Kraj Vysočina'),
  (71, 'Blansko', 'Jihomoravský kraj'),
  (72, 'Brno-město', 'Jihomoravský kraj'),
  (73, 'Brno-venkov', 'Jihomoravský kraj'),
  (74, 'Břeclav', 'Jihomoravský kraj'),
  (75, 'Hodonín', 'Jihomoravský kraj'),
  (76, 'Vyškov', 'Jihomoravský kraj'),
  (77, 'Znojmo', 'Jihomoravský kraj');

-- Výbava (331 položek)
CREATE TABLE equipment (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT
);
INSERT INTO equipment (id, name, category) VALUES
  -- Bezpečnost
  (8, 'ABS', 'Bezpečnost'),
  (15, 'ESP', 'Bezpečnost'),
  (142, 'Protiprokluzový systém kol (ASR)', 'Bezpečnost'),
  (106, 'Elektronická uzávěrka diferenciálu (EDS)', 'Bezpečnost'),
  (252, 'Nouzové brždění', 'Bezpečnost'),
  (250, 'Hlídání mrtvého úhlu', 'Bezpečnost'),
  (251, 'Sledování jízdního pruhu', 'Bezpečnost'),
  (255, 'Sledování únavy řidiče', 'Bezpečnost'),
  (261, 'Rozpoznávání dopravních značek', 'Bezpečnost'),
  (262, 'Upozornění na přijíždějící vozidla při couvání (RCTA)', 'Bezpečnost'),
  (263, 'Asistent stability přívěsu (TSA)', 'Bezpečnost'),
  (268, 'Aktivní kapota', 'Bezpečnost'),
  (299, 'Systém nouzového zastavení', 'Bezpečnost'),
  (303, 'Aktivní asistent řízení', 'Bezpečnost'),
  (305, 'Asistent pro odbočování', 'Bezpečnost'),
  (306, 'Asistent udržování odstupu', 'Bezpečnost'),
  (307, 'Ochrana proti odcizení a vloupání', 'Bezpečnost'),
  (311, 'Asistent změny jízdního pruhu', 'Bezpečnost'),
  (324, 'Front Assist', 'Bezpečnost'),
  (325, 'Lane Assist', 'Bezpečnost'),
  (226, 'Deaktivace airbagu spolujezdce', 'Bezpečnost'),
  -- Komfort
  (17, 'Tempomat', 'Komfort'),
  (232, 'Adaptivní tempomat', 'Komfort'),
  (308, 'Prediktivní tempomat', 'Komfort'),
  (279, 'Asistent pro jízdu v koloně', 'Komfort'),
  (280, 'Asistent pro vedení vozu v jízdních pruzích', 'Komfort'),
  (7, 'Centrální zamykání', 'Komfort'),
  (24, 'Dálkové centrální zamykání', 'Komfort'),
  (218, 'Bezklíčkové ovládání', 'Komfort'),
  (32, 'Posilovač řízení', 'Komfort'),
  (51, 'El. ovládání oken', 'Komfort'),
  (13, 'El. ovládání zrcátek', 'Komfort'),
  (245, 'El. sklopná zrcátka', 'Komfort'),
  (246, 'El. ovládaný kufr', 'Komfort'),
  (93, 'El. seřiditelná sedadla', 'Komfort'),
  (313, 'El. seřiditelné sedadlo řidiče', 'Komfort'),
  (315, 'El. nastavitelná zadní sedadla', 'Komfort'),
  (287, 'El. parkovací brzda', 'Komfort'),
  (314, 'Elektrické dovírání zavazadlového prostoru', 'Komfort'),
  (330, 'Elektrické dovírání dveří', 'Komfort'),
  (288, 'Funkce plynulého dovírání dveří', 'Komfort'),
  (212, 'Start/Stop systém', 'Komfort'),
  (213, 'Asistent rozjezdu do kopce', 'Komfort'),
  (222, 'Asistent při jízdě ze svahu', 'Komfort'),
  (300, 'Volba jízdního režimu', 'Komfort'),
  (296, 'Pádla řazení na volantu', 'Komfort'),
  (30, 'Palubní počítač', 'Komfort'),
  (27, 'Multifunkční volant', 'Komfort'),
  (36, 'Nastavitelná sedadla', 'Komfort'),
  (37, 'Nastavitelný volant', 'Komfort'),
  (94, 'Výškově nastavitelná sedadla', 'Komfort'),
  (224, 'Výškově nastavitelné sedadlo řidiče', 'Komfort'),
  (95, 'Podélný posuv sedadel', 'Komfort'),
  (297, 'Paměť nastavení sedadla řidiče', 'Komfort'),
  (146, 'Venkovní teploměr', 'Komfort'),
  (147, 'Vnitřní teploměr', 'Komfort'),
  (316, 'Elektrické tažné zařízení', 'Komfort'),
  -- Interiér
  (3, 'Kožené čalounění', 'Interiér'),
  (98, 'Kožené potahy', 'Interiér'),
  (227, 'Kožená sedadla', 'Interiér'),
  (328, 'Sedadla Alcantara', 'Interiér'),
  (258, 'Malý kožený paket', 'Interiér'),
  (92, 'Sportovní sedadla', 'Interiér'),
  (329, 'Sportovní paket', 'Interiér'),
  (99, 'Dřevěné obložení', 'Interiér'),
  (42, 'Vyhřívaná sedadla', 'Interiér'),
  (320, 'Vyhřívaná zadní sedadla', 'Interiér'),
  (241, 'Vyhřívaný volant', 'Interiér'),
  (274, 'Odvětrávání sedadel', 'Interiér'),
  (318, 'Ventilovaná zadní sedadla', 'Interiér'),
  (242, 'Masážní sedadla', 'Interiér'),
  (221, 'Dělená zadní sedadla', 'Interiér'),
  (321, 'Třetí řada sedadel', 'Interiér'),
  (89, 'Vyjímatelná zadní sedadla', 'Interiér'),
  (96, 'Sedadla výsuvná do uličky', 'Interiér'),
  (97, 'Výsuvné opěrky hlav', 'Interiér'),
  (302, 'Zadní loketní opěrka', 'Interiér'),
  (276, 'Ambientní LED osvětlení interiéru', 'Interiér'),
  (223, 'Klimatizovaná přihrádka', 'Interiér'),
  (267, 'Roletky na zadní okna', 'Interiér'),
  -- Exteriér
  (16, 'Litá kola', 'Exteriér'),
  (6, 'Střešní okno', 'Exteriér'),
  (217, 'Panoramatická střecha', 'Exteriér'),
  (72, 'Otevíratelná střecha', 'Exteriér'),
  (38, 'Střešní nosič', 'Exteriér'),
  (77, 'Střešní spoiler', 'Exteriér'),
  (39, 'Tónovaná skla', 'Exteriér'),
  (265, 'Zatmavená zadní skla', 'Exteriér'),
  (326, 'Akustická skla', 'Exteriér'),
  (191, 'Boční nášlapy', 'Exteriér'),
  (76, 'Ochranné rámy', 'Exteriér'),
  (45, 'Závěsné zařízení v TP', 'Exteriér'),
  (105, 'Tažné zařízení', 'Exteriér'),
  -- Světla
  (43, 'Xenony', 'Světla'),
  (240, 'Bi-xenony', 'Světla'),
  (238, 'LED světlomety plnohodnotné', 'Světla'),
  (228, 'LED denní svícení', 'Světla'),
  (275, 'Denní svícení', 'Světla'),
  (291, 'Laserová světla', 'Světla'),
  (292, 'LED adaptivní světlomety', 'Světla'),
  (293, 'LED matrixové světlomety', 'Světla'),
  (247, 'Natáčecí světlomety', 'Světla'),
  (248, 'Automatické svícení', 'Světla'),
  (312, 'Automatické přepínání dálkových světel', 'Světla'),
  (187, 'Mlhovky', 'Světla'),
  (188, 'Zadní mlhovka', 'Světla'),
  (33, 'Přídavná světla', 'Světla'),
  (75, 'Ostřikovače světlometů', 'Světla'),
  -- Multimédia
  (5, 'Navigační systém', 'Multimédia'),
  (103, 'Satelitní navigace', 'Multimédia'),
  (323, 'Multimediální systém bez navigace', 'Multimédia'),
  (28, 'Autorádio', 'Multimédia'),
  (220, 'Originální autorádio', 'Multimédia'),
  (219, 'Rádio', 'Multimédia'),
  (54, 'Příprava pro autorádio', 'Multimédia'),
  (283, 'Digitální příjem rádia (DAB)', 'Multimédia'),
  (56, 'CD přehrávač', 'Multimédia'),
  (57, 'CD měnič', 'Multimédia'),
  (254, 'DVD přehrávač', 'Multimédia'),
  (58, 'Televize', 'Multimédia'),
  (59, 'Přehrávač videa', 'Multimédia'),
  (60, '1 monitor', 'Multimédia'),
  (61, '2 monitory', 'Multimédia'),
  (62, '3 monitory', 'Multimédia'),
  (63, '4 monitory', 'Multimédia'),
  (243, 'USB', 'Multimédia'),
  (331, 'AUX', 'Multimédia'),
  (253, 'Vstup paměťové karty', 'Multimédia'),
  (244, 'Bluetooth', 'Multimédia'),
  (277, 'Android Auto', 'Multimédia'),
  (278, 'Apple Car Play', 'Multimédia'),
  (271, 'Premiový audiosystém', 'Multimédia'),
  (327, 'Příplatkový audiosystém', 'Multimédia'),
  (270, 'Přístrojová deska s barevným displejem', 'Multimédia'),
  (284, 'Digitální přístrojový štít', 'Multimédia'),
  (317, 'Digitální přístrojová deska', 'Multimédia'),
  (286, 'Dotykové ovládání palubního počítače', 'Multimédia'),
  (290, 'Hlasové ovládání palubního počítače', 'Multimédia'),
  (295, 'Ovládání vybraných funkcí vozu gesty', 'Multimédia'),
  (289, 'Head-up display', 'Multimédia'),
  -- Konektivita
  (64, 'Telefon', 'Konektivita'),
  (65, 'Příprava pro telefon', 'Konektivita'),
  (66, 'CB vysílačka', 'Konektivita'),
  (67, 'Mikrofon', 'Konektivita'),
  (294, 'Mobilní připojení', 'Konektivita'),
  (319, 'Wifi hotspot', 'Konektivita'),
  (266, 'Bezdrátová nabíječka mobilních telefonů (Qi)', 'Konektivita'),
  -- Parkování
  (31, 'Parkovací asistent', 'Parkování'),
  (214, 'Parkovací senzory', 'Parkování'),
  (281, 'Parkovací senzory přední', 'Parkování'),
  (282, 'Parkovací senzory zadní', 'Parkování'),
  (231, 'Parkovací kamera', 'Parkování'),
  (259, '360° monitorovací systém (AVM)', 'Parkování'),
  (304, 'Akustická výstraha při couvání', 'Parkování'),
  -- Zabezpečení
  (4, 'Imobilizér', 'Zabezpečení'),
  (22, 'Alarm', 'Zabezpečení'),
  (23, 'Alarm s dálkovým ovládáním', 'Zabezpečení'),
  (25, 'Bezpečnostní pískování oken', 'Zabezpečení'),
  (44, 'Zámek řadící páky', 'Zabezpečení'),
  (68, 'Zaslepení zámků', 'Zabezpečení'),
  -- Skla a zrcátka
  (40, 'Vyhřívaná zrcátka', 'Skla a zrcátka'),
  (41, 'Vyhřívané čelní sklo', 'Skla a zrcátka'),
  (264, 'Elektrochromatické vnitřní zpětné zrcátko', 'Skla a zrcátka'),
  (108, 'Senzor stěračů', 'Skla a zrcátka'),
  (79, 'Zadní stěrač', 'Skla a zrcátka'),
  (301, 'Vyhřívané trysky ostřikovačů skla', 'Skla a zrcátka'),
  -- Ostatní
  (18, 'Záruka', 'Ostatní'),
  (26, 'LPG v TP', 'Ostatní'),
  (90, 'Příprava pro isofix', 'Ostatní'),
  (215, 'Isofix', 'Ostatní'),
  (91, 'Síťka mezistěny zavazadlového prostoru', 'Ostatní'),
  (49, 'Katalyzátor', 'Ostatní'),
  (119, 'Sportovní podvozek', 'Ostatní'),
  (310, 'Adaptivní regulace podvozku', 'Ostatní'),
  (120, 'Laděný výfuk', 'Ostatní'),
  (153, 'Regulace výšky podvozku', 'Ostatní'),
  (154, 'Regulace tuhosti podvozku', 'Ostatní'),
  (156, 'Konvenční odpružení', 'Ostatní'),
  (158, 'Vzduchové odpružení', 'Ostatní'),
  (118, 'Otáčkoměr', 'Ostatní'),
  (193, 'S couvacím světlem', 'Ostatní'),
  (201, 'Rezervní kolo', 'Ostatní'),
  (285, 'Dojezdové rezervní kolo', 'Ostatní'),
  (298, 'Plnohodnotné rezervní kolo', 'Ostatní'),
  (257, 'Senzor tlaku v pneumatikách', 'Ostatní'),
  (249, 'Senzor opotřebení brzd. destiček', 'Ostatní'),
  (322, 'Tepelné čerpadlo', 'Ostatní'),
  (309, 'Zásuvka pro přídavné spotřebiče', 'Ostatní'),
  (87, 'Nezávislé topení', 'Ostatní'),
  (88, 'Nezávislé topení s čas. předehřívačem', 'Ostatní'),
  (225, 'Automatická uzávěrka diferenciálu', 'Ostatní'),
  (189, 'Uzávěrka zadního diferenciálu', 'Ostatní'),
  (190, 'Uzávěrka předního diferenciálu', 'Ostatní'),
  (145, 'Uzávěrka mezinápravového diferenciálu', 'Ostatní'),
  (155, 'Tlumič řízení', 'Ostatní'),
  (161, 'Naviják', 'Ostatní'),
  (192, 'Šnorchl', 'Ostatní'),
  (233, 'Sklápěč', 'Ostatní'),
  (273, 'Motorová brzda', 'Ostatní'),
  (86, 'Zásuvka na 220 V', 'Ostatní'),
  (74, 'Ski box', 'Ostatní'),
  -- Motocykly
  (46, 'Nožní startér', 'Motocykly'),
  (47, 'El. startér', 'Motocykly'),
  (48, 'Variátor', 'Motocykly'),
  (50, 'Plexi štít', 'Motocykly'),
  (149, 'Padáky', 'Motocykly'),
  (150, 'Kufry', 'Motocykly'),
  (151, 'Brašny', 'Motocykly'),
  (139, 'Dálkový start', 'Motocykly'),
  -- Nákladní / Užitková
  (124, 'Hydraulika pro sklápění', 'Nákladní'),
  (127, 'Jednoduchá nádrž do 400 l nafty', 'Nákladní'),
  (128, 'Dvojitá nádrž do 800 l nafty', 'Nákladní'),
  (137, 'Intardér', 'Nákladní'),
  (138, 'Retardér', 'Nákladní'),
  (143, 'Výbava ADR', 'Nákladní'),
  (152, 'Vzduchové ovládání dveří', 'Nákladní'),
  (159, 'Tachograf', 'Nákladní'),
  (183, 'Kabina trambusová', 'Nákladní'),
  (184, 'Kabina kapotovaná', 'Nákladní'),
  -- Obytné vozy
  (80, 'Chladnička', 'Obytné vozy'),
  (81, 'Kávovar', 'Obytné vozy'),
  (83, 'Mikrovlná trouba', 'Obytné vozy'),
  (84, 'WC', 'Obytné vozy'),
  (85, 'Ohřívač vody', 'Obytné vozy'),
  -- Přívěsy
  (194, 'Vidlice 7-pol', 'Přívěsy'),
  (195, 'Vidlice 13-pol', 'Přívěsy'),
  (196, 'Opěrné kolečko', 'Přívěsy'),
  (197, 'Opěrné nohy', 'Přívěsy'),
  (198, 'Plachta', 'Přívěsy'),
  (199, 'Laminátové víko', 'Přívěsy'),
  (200, 'Kotvící oka', 'Přívěsy'),
  (202, 'Zakládací klíny', 'Přívěsy'),
  (203, 'Nebrzděný', 'Přívěsy'),
  (204, 'Brzděný', 'Přívěsy'),
  (205, 'Trubková/jeklová oj', 'Přívěsy'),
  (206, 'V oj', 'Přívěsy'),
  (207, 'Výškově stavitelná oj', 'Přívěsy'),
  (208, 'Překližkové bočnice', 'Přívěsy'),
  (209, 'Plechové bočnice', 'Přívěsy'),
  (210, 'Hliníkové bočnice', 'Přívěsy'),
  (211, 'Bez bočnic', 'Přívěsy');

-- ============================================================
-- HLAVNÍ TABULKA VOZIDEL (optimalizováno pro 100K+)
-- ============================================================

CREATE TABLE vehicles (
  id BIGSERIAL PRIMARY KEY,
  sauto_id BIGINT UNIQUE,           -- ID z Sauto.cz
  custom_id TEXT,                     -- Vlastní ID prodejce

  -- Základní údaje
  kind_id INTEGER REFERENCES vehicle_kinds(id),
  manufacturer_id INTEGER REFERENCES manufacturers(id),
  model_id INTEGER REFERENCES models(id),
  body_type_id INTEGER REFERENCES body_types(id),
  condition_id INTEGER REFERENCES conditions(id),
  title TEXT NOT NULL,                -- Generovaný název (Výrobce Model Varianta)
  model_variant TEXT,                 -- Modellvariante (např. GTI, RS, ...)
  series TEXT,                        -- Baureihe (řada)

  -- Cena
  price INTEGER NOT NULL DEFAULT 0,
  price_note TEXT,                    -- Poznámka k ceně
  vat_deductible BOOLEAN DEFAULT FALSE, -- Odpočet DPH
  deal_type TEXT DEFAULT 'sale',      -- sale, operating_lease, sale_or_lease

  -- Technické údaje
  fuel_type_id INTEGER REFERENCES fuel_types(id),
  gearbox_id INTEGER REFERENCES gearbox_types(id),
  drive_id INTEGER REFERENCES drive_types(id),
  engine_volume INTEGER,              -- Objem motoru (ccm)
  engine_power INTEGER,               -- Výkon (kW)
  engine_power_ps INTEGER,            -- Výkon (PS) - počítáno
  tachometer INTEGER DEFAULT 0,       -- Stav tachometru
  tachometer_unit_id INTEGER DEFAULT 1 REFERENCES tachometer_units(id),

  -- Elektrická/hybridní vozidla
  battery_capacity INTEGER,           -- Kapacita baterie (kWh)
  electric_mileage NUMERIC(5,1),      -- Spotřeba (kWh/100km)
  vehicle_range INTEGER,              -- Dojezd (km)

  -- Registrace a stáří
  manufacture_date DATE,              -- Datum výroby
  first_registration DATE,            -- Datum první registrace
  made_year INTEGER,                  -- Rok výroby
  made_month INTEGER,                 -- Měsíc výroby

  -- Vzhled
  color_id INTEGER REFERENCES colors(id),
  color_tone TEXT,                    -- Odstín (metalíza, pastelová, ...)

  -- Další údaje
  door_count_id INTEGER REFERENCES door_counts(id),
  capacity_id INTEGER REFERENCES capacity_types(id),
  airbag_count_id INTEGER REFERENCES airbag_counts(id),
  aircondition_id INTEGER REFERENCES aircondition_types(id),
  euro_id INTEGER REFERENCES euro_types(id),
  servicebook_id INTEGER REFERENCES servicebook_types(id),
  country_id INTEGER REFERENCES countries(id),
  availability_id INTEGER REFERENCES availability_types(id),
  bed_count_id INTEGER REFERENCES bed_counts(id),

  -- VIN a vlastníci
  vin TEXT,
  owners_count INTEGER,               -- Počet vlastníků
  crashed BOOLEAN DEFAULT FALSE,       -- Havarováno
  first_owner BOOLEAN DEFAULT FALSE,   -- První vlastník

  -- Lokace
  region_id INTEGER REFERENCES regions(id),
  address TEXT,
  city TEXT,
  zip_code TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),

  -- Prodejce
  seller_name TEXT,
  seller_phone TEXT,
  seller_email TEXT,
  seller_type TEXT DEFAULT 'dealer',   -- dealer, private
  seller_logo_url TEXT,
  seller_rating NUMERIC(3,2),
  seller_review_count INTEGER DEFAULT 0,

  -- Popis a média
  description TEXT,
  note TEXT,

  -- Obrázky (JSONB pro flexibilitu a rychlost)
  images JSONB DEFAULT '[]'::jsonb,     -- [{url, thumbnail_url, order}]
  image_count INTEGER DEFAULT 0,
  main_image_url TEXT,
  main_thumbnail_url TEXT,

  -- Video
  video_url TEXT,

  -- Cenové hodnocení
  price_rating TEXT,                    -- very_good, good, fair, high
  price_rating_value NUMERIC(5,2),

  -- Metadata
  source TEXT DEFAULT 'sauto',
  source_url TEXT,
  is_top BOOLEAN DEFAULT FALSE,
  is_promoted BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- ============================================================
-- INDEXY PRO VÝKON PŘI 100K+ ZÁZNAMECH
-- ============================================================

-- Primární vyhledávací indexy
CREATE INDEX idx_vehicles_manufacturer ON vehicles(manufacturer_id) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_model ON vehicles(model_id) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_price ON vehicles(price) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_year ON vehicles(made_year) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_tachometer ON vehicles(tachometer) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_fuel ON vehicles(fuel_type_id) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_gearbox ON vehicles(gearbox_id) WHERE is_active = TRUE;

-- Kompozitní indexy pro časté kombinace filtrů
CREATE INDEX idx_vehicles_make_model ON vehicles(manufacturer_id, model_id) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_make_price ON vehicles(manufacturer_id, price) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_fuel_gearbox ON vehicles(fuel_type_id, gearbox_id) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_kind_condition ON vehicles(kind_id, condition_id) WHERE is_active = TRUE;

-- Indexy pro řazení
CREATE INDEX idx_vehicles_created ON vehicles(created_at DESC) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_price_asc ON vehicles(price ASC) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_price_desc ON vehicles(price DESC) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_tachometer_asc ON vehicles(tachometer ASC) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_year_desc ON vehicles(made_year DESC NULLS LAST) WHERE is_active = TRUE;

-- Lokace
CREATE INDEX idx_vehicles_region ON vehicles(region_id) WHERE is_active = TRUE;

-- Další filtry
CREATE INDEX idx_vehicles_color ON vehicles(color_id) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_drive ON vehicles(drive_id) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_condition ON vehicles(condition_id) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_body ON vehicles(body_type_id) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_power ON vehicles(engine_power) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_volume ON vehicles(engine_volume) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_doors ON vehicles(door_count_id) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_capacity ON vehicles(capacity_id) WHERE is_active = TRUE;

-- Sauto sync
CREATE INDEX idx_vehicles_sauto_id ON vehicles(sauto_id);
CREATE INDEX idx_vehicles_source ON vehicles(source);
CREATE INDEX idx_vehicles_synced ON vehicles(synced_at);

-- Fulltext search
CREATE INDEX idx_vehicles_title_trgm ON vehicles USING gin(title gin_trgm_ops);
-- Poznámka: vyžaduje CREATE EXTENSION pg_trgm;

-- ============================================================
-- VÝBAVA VOZIDLA (M:N vztah)
-- ============================================================

CREATE TABLE vehicle_equipment (
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  equipment_id INTEGER NOT NULL REFERENCES equipment(id),
  PRIMARY KEY (vehicle_id, equipment_id)
);
CREATE INDEX idx_vehicle_equipment_vehicle ON vehicle_equipment(vehicle_id);
CREATE INDEX idx_vehicle_equipment_equip ON vehicle_equipment(equipment_id);

-- ============================================================
-- OPERATIVNÍ LEASING
-- ============================================================

CREATE TABLE vehicle_leasing (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  monthly_payment INTEGER,            -- Měsíční splátka
  deposit INTEGER,                    -- Záloha
  duration_months INTEGER,            -- Doba trvání (měsíce)
  annual_km INTEGER,                  -- Roční nájezd (km)
  services JSONB DEFAULT '[]'::jsonb, -- Zahrnuté služby
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vehicle_leasing_vehicle ON vehicle_leasing(vehicle_id);

-- ============================================================
-- UŽIVATELÉ
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_dealer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- OBLÍBENÉ VOZIDLA
-- ============================================================

CREATE TABLE favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vehicle_id)
);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ============================================================
-- ULOŽENÁ HLEDÁNÍ
-- ============================================================

CREATE TABLE saved_searches (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,             -- Kompletní filtrační kritéria
  notify_email BOOLEAN DEFAULT FALSE,
  notify_frequency TEXT DEFAULT 'daily', -- daily, weekly, instant
  results_count INTEGER DEFAULT 0,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);

-- ============================================================
-- HISTORIE PROHLÍŽENÍ
-- ============================================================

CREATE TABLE view_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  session_id TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_view_history_user ON view_history(user_id);
CREATE INDEX idx_view_history_vehicle ON view_history(vehicle_id);
CREATE INDEX idx_view_history_time ON view_history(viewed_at DESC);

-- ============================================================
-- SYNC LOG (pro sledování importu ze Sauto.cz)
-- ============================================================

CREATE TABLE sync_log (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'sauto',
  status TEXT NOT NULL,               -- running, completed, failed
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  new_items INTEGER DEFAULT 0,
  updated_items INTEGER DEFAULT 0,
  deleted_items INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

-- ============================================================
-- FUNKCE
-- ============================================================

-- Automatický update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Materialized view pro statistiky (rychlé načítání na homepage)
CREATE MATERIALIZED VIEW vehicle_stats AS
SELECT
  COUNT(*) AS total_vehicles,
  COUNT(*) FILTER (WHERE kind_id = 1) AS personal_vehicles,
  COUNT(*) FILTER (WHERE fuel_type_id = 4) AS electric_vehicles,
  MIN(price) FILTER (WHERE price > 0) AS min_price,
  MAX(price) AS max_price,
  AVG(price)::INTEGER AS avg_price,
  COUNT(DISTINCT manufacturer_id) AS manufacturer_count,
  COUNT(DISTINCT model_id) AS model_count
FROM vehicles
WHERE is_active = TRUE;

-- Materialized view pro počty po značkách (pro filtry)
CREATE MATERIALIZED VIEW manufacturer_counts AS
SELECT
  m.id,
  m.name,
  COUNT(v.id) AS vehicle_count
FROM manufacturers m
LEFT JOIN vehicles v ON v.manufacturer_id = m.id AND v.is_active = TRUE
GROUP BY m.id, m.name
HAVING COUNT(v.id) > 0
ORDER BY COUNT(v.id) DESC;

-- RPC funkce pro vyhledávání s počty
CREATE OR REPLACE FUNCTION search_vehicles(
  p_manufacturer_id INTEGER DEFAULT NULL,
  p_model_id INTEGER DEFAULT NULL,
  p_price_from INTEGER DEFAULT NULL,
  p_price_to INTEGER DEFAULT NULL,
  p_year_from INTEGER DEFAULT NULL,
  p_year_to INTEGER DEFAULT NULL,
  p_km_from INTEGER DEFAULT NULL,
  p_km_to INTEGER DEFAULT NULL,
  p_fuel_type_id INTEGER DEFAULT NULL,
  p_gearbox_id INTEGER DEFAULT NULL,
  p_body_type_id INTEGER DEFAULT NULL,
  p_color_id INTEGER DEFAULT NULL,
  p_drive_id INTEGER DEFAULT NULL,
  p_condition_id INTEGER DEFAULT NULL,
  p_region_id INTEGER DEFAULT NULL,
  p_kind_id INTEGER DEFAULT 1,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_dir TEXT DEFAULT 'desc',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  vehicles JSONB,
  total_count BIGINT
) AS $$
DECLARE
  v_query TEXT;
  v_count_query TEXT;
  v_where TEXT := 'WHERE v.is_active = TRUE';
  v_order TEXT;
  v_total BIGINT;
  v_result JSONB;
BEGIN
  -- Budování WHERE klauzule
  IF p_kind_id IS NOT NULL THEN
    v_where := v_where || ' AND v.kind_id = ' || p_kind_id;
  END IF;
  IF p_manufacturer_id IS NOT NULL THEN
    v_where := v_where || ' AND v.manufacturer_id = ' || p_manufacturer_id;
  END IF;
  IF p_model_id IS NOT NULL THEN
    v_where := v_where || ' AND v.model_id = ' || p_model_id;
  END IF;
  IF p_price_from IS NOT NULL THEN
    v_where := v_where || ' AND v.price >= ' || p_price_from;
  END IF;
  IF p_price_to IS NOT NULL THEN
    v_where := v_where || ' AND v.price <= ' || p_price_to;
  END IF;
  IF p_year_from IS NOT NULL THEN
    v_where := v_where || ' AND v.made_year >= ' || p_year_from;
  END IF;
  IF p_year_to IS NOT NULL THEN
    v_where := v_where || ' AND v.made_year <= ' || p_year_to;
  END IF;
  IF p_km_from IS NOT NULL THEN
    v_where := v_where || ' AND v.tachometer >= ' || p_km_from;
  END IF;
  IF p_km_to IS NOT NULL THEN
    v_where := v_where || ' AND v.tachometer <= ' || p_km_to;
  END IF;
  IF p_fuel_type_id IS NOT NULL THEN
    v_where := v_where || ' AND v.fuel_type_id = ' || p_fuel_type_id;
  END IF;
  IF p_gearbox_id IS NOT NULL THEN
    v_where := v_where || ' AND v.gearbox_id = ' || p_gearbox_id;
  END IF;
  IF p_body_type_id IS NOT NULL THEN
    v_where := v_where || ' AND v.body_type_id = ' || p_body_type_id;
  END IF;
  IF p_color_id IS NOT NULL THEN
    v_where := v_where || ' AND v.color_id = ' || p_color_id;
  END IF;
  IF p_drive_id IS NOT NULL THEN
    v_where := v_where || ' AND v.drive_id = ' || p_drive_id;
  END IF;
  IF p_condition_id IS NOT NULL THEN
    v_where := v_where || ' AND v.condition_id = ' || p_condition_id;
  END IF;
  IF p_region_id IS NOT NULL THEN
    v_where := v_where || ' AND v.region_id = ' || p_region_id;
  END IF;

  -- Řazení
  v_order := CASE p_sort_by
    WHEN 'price_asc' THEN 'v.price ASC'
    WHEN 'price_desc' THEN 'v.price DESC'
    WHEN 'year_desc' THEN 'v.made_year DESC NULLS LAST'
    WHEN 'year_asc' THEN 'v.made_year ASC NULLS LAST'
    WHEN 'km_asc' THEN 'v.tachometer ASC'
    WHEN 'km_desc' THEN 'v.tachometer DESC'
    WHEN 'power_desc' THEN 'v.engine_power DESC NULLS LAST'
    ELSE 'v.created_at DESC'
  END;

  -- Počet výsledků
  EXECUTE 'SELECT COUNT(*) FROM vehicles v ' || v_where INTO v_total;

  -- Data
  EXECUTE format(
    'SELECT COALESCE(jsonb_agg(row_to_json(sub)), ''[]''::jsonb) FROM (
      SELECT v.*, m.name as manufacturer_name, mo.name as model_name,
             f.name as fuel_name, g.name as gearbox_name,
             c.name as color_name, co.name as condition_name,
             r.name as region_name
      FROM vehicles v
      LEFT JOIN manufacturers m ON m.id = v.manufacturer_id
      LEFT JOIN models mo ON mo.id = v.model_id
      LEFT JOIN fuel_types f ON f.id = v.fuel_type_id
      LEFT JOIN gearbox_types g ON g.id = v.gearbox_id
      LEFT JOIN colors c ON c.id = v.color_id
      LEFT JOIN conditions co ON co.id = v.condition_id
      LEFT JOIN regions r ON r.id = v.region_id
      %s ORDER BY %s LIMIT %s OFFSET %s
    ) sub',
    v_where, v_order, p_limit, p_offset
  ) INTO v_result;

  RETURN QUERY SELECT v_result, v_total;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_history ENABLE ROW LEVEL SECURITY;

-- Vozidla - veřejně čitelná
CREATE POLICY vehicles_read ON vehicles FOR SELECT USING (TRUE);

-- Oblíbené - pouze vlastní
CREATE POLICY favorites_read ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY favorites_insert ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY favorites_delete ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Uložená hledání - pouze vlastní
CREATE POLICY saved_searches_read ON saved_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY saved_searches_insert ON saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY saved_searches_update ON saved_searches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY saved_searches_delete ON saved_searches FOR DELETE USING (auth.uid() = user_id);

-- Historie - pouze vlastní
CREATE POLICY view_history_read ON view_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY view_history_insert ON view_history FOR INSERT WITH CHECK (TRUE);
