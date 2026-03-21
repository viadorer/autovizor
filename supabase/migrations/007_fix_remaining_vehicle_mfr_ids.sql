-- Fix remaining 115 vehicles with wrong manufacturer_id (pointing to užitkové/nákladní)

-- Tatra (id=95): 1 vehicles
UPDATE vehicles SET manufacturer_id = 95 WHERE id IN (36217);

-- Smart (id=266): 12 vehicles
UPDATE vehicles SET manufacturer_id = 266 WHERE id IN (36085,36086,36087,36089,36090,36091,36092,36093,36095,36097,36099,36101);

-- SsangYong (id=393): 10 vehicles
UPDATE vehicles SET manufacturer_id = 393 WHERE id IN (35984,35986,35975,35983,35985,35988,35982,35987,35974,35980);

-- Polestar (id=1429): 10 vehicles
UPDATE vehicles SET manufacturer_id = 1429 WHERE id IN (36132,36133,36118,36120,36121,36117,36119,36122,36123,36124);

-- NIO (id=1503): 1 vehicles
UPDATE vehicles SET manufacturer_id = 1503 WHERE id IN (36180);

-- XPENG (id=1564): 13 vehicles
UPDATE vehicles SET manufacturer_id = 1564 WHERE id IN (36181,36182,36183,36184,36185,36187,36188,36189,36190,36191,36192,36193,36194);

