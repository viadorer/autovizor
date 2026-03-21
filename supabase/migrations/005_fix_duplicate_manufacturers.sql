-- Fix duplicate manufacturers: remap vehicles + models from old IDs to Sauto IDs, then delete old
-- Old IDs are from the original seed, Sauto IDs are from the official carList XML

-- Remap models first (FK constraint)
UPDATE models SET manufacturer_id = 298 WHERE manufacturer_id = 6;    -- Bugatti
UPDATE models SET manufacturer_id = 37  WHERE manufacturer_id = 11;   -- Chrysler
UPDATE models SET manufacturer_id = 21  WHERE manufacturer_id = 19;   -- Ferrari
UPDATE models SET manufacturer_id = 31  WHERE manufacturer_id = 25;   -- Hyundai
UPDATE models SET manufacturer_id = 38  WHERE manufacturer_id = 29;   -- Jaguar
UPDATE models SET manufacturer_id = 42  WHERE manufacturer_id = 32;   -- Lada
UPDATE models SET manufacturer_id = 391 WHERE manufacturer_id = 35;   -- Land Rover
UPDATE models SET manufacturer_id = 48  WHERE manufacturer_id = 40;   -- Mazda
UPDATE models SET manufacturer_id = 146 WHERE manufacturer_id = 43;   -- MG
UPDATE models SET manufacturer_id = 148 WHERE manufacturer_id = 46;   -- Morgan
UPDATE models SET manufacturer_id = 70  WHERE manufacturer_id = 49;   -- Peugeot
UPDATE models SET manufacturer_id = 78  WHERE manufacturer_id = 52;   -- Renault
UPDATE models SET manufacturer_id = 93  WHERE manufacturer_id = 57;   -- Škoda
UPDATE models SET manufacturer_id = 99  WHERE manufacturer_id = 63;   -- Toyota
UPDATE models SET manufacturer_id = 1506 WHERE manufacturer_id = 74;  -- Alpine

-- Remap vehicles
UPDATE vehicles SET manufacturer_id = 298 WHERE manufacturer_id = 6;   -- Bugatti
UPDATE vehicles SET manufacturer_id = 37  WHERE manufacturer_id = 11;  -- Chrysler
UPDATE vehicles SET manufacturer_id = 21  WHERE manufacturer_id = 19;  -- Ferrari
UPDATE vehicles SET manufacturer_id = 31  WHERE manufacturer_id = 25;  -- Hyundai
UPDATE vehicles SET manufacturer_id = 38  WHERE manufacturer_id = 29;  -- Jaguar
UPDATE vehicles SET manufacturer_id = 42  WHERE manufacturer_id = 32;  -- Lada
UPDATE vehicles SET manufacturer_id = 391 WHERE manufacturer_id = 35;  -- Land Rover
UPDATE vehicles SET manufacturer_id = 48  WHERE manufacturer_id = 40;  -- Mazda
UPDATE vehicles SET manufacturer_id = 146 WHERE manufacturer_id = 43;  -- MG
UPDATE vehicles SET manufacturer_id = 148 WHERE manufacturer_id = 46;  -- Morgan
UPDATE vehicles SET manufacturer_id = 70  WHERE manufacturer_id = 49;  -- Peugeot
UPDATE vehicles SET manufacturer_id = 78  WHERE manufacturer_id = 52;  -- Renault
UPDATE vehicles SET manufacturer_id = 93  WHERE manufacturer_id = 57;  -- Škoda
UPDATE vehicles SET manufacturer_id = 99  WHERE manufacturer_id = 63;  -- Toyota
UPDATE vehicles SET manufacturer_id = 1506 WHERE manufacturer_id = 74; -- Alpine

-- Delete old duplicate manufacturers
DELETE FROM manufacturers WHERE id IN (6, 11, 19, 25, 29, 32, 35, 40, 43, 46, 49, 52, 57, 63, 74);

-- Also delete ORA (id=68) and DFSK (id=76) if no vehicles reference them
DELETE FROM manufacturers WHERE id = 68 AND NOT EXISTS (SELECT 1 FROM vehicles WHERE manufacturer_id = 68);
DELETE FROM manufacturers WHERE id = 76 AND NOT EXISTS (SELECT 1 FROM vehicles WHERE manufacturer_id = 76);
