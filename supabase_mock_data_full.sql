-- ============================================================
-- CRISISCHAIN: MOCK DATA SEED (LEAN)
-- Run this in Supabase SQL Editor to populate all charts
-- ============================================================

-- Step 1: Clear existing seed data
DELETE FROM incidents WHERE reporter_name = 'AutoSeed' OR description LIKE '%[SEED]%';

-- Step 2: Insert 20 incidents spread across last 7 days

INSERT INTO incidents (type, status, severity, location, latitude, longitude, description, reporter_name, response_time_minutes, created_at)
VALUES
-- DAY 1 (7 days ago)
('fire',       'RESOLVED',   'high',     'Mangaluru Port, Karnataka',         12.8698, 74.8431,  '[SEED] Industrial fire at port warehouse, 3 units deployed.',           'AutoSeed', 18, NOW() - INTERVAL '7 days' + INTERVAL '3 hours'),
('flood',      'RESOLVED',   'critical', 'Udupi, Karnataka',                  13.3409, 74.7421,  '[SEED] Flash flood following heavy rainfall, evacuation completed.',    'AutoSeed', 45, NOW() - INTERVAL '7 days' + INTERVAL '10 hours'),
('cyclone',    'RESOLVED',   'critical', 'Malpe Beach, Udupi',                13.3500, 74.7100,  '[SEED] Cyclonic storm warning, coastal areas evacuated.',               'AutoSeed', 60, NOW() - INTERVAL '7 days' + INTERVAL '16 hours'),

-- DAY 2 (6 days ago)
('earthquake', 'RESOLVED',   'medium',   'Coorg, Karnataka',                  12.3375, 75.8069,  '[SEED] Minor tremor 4.2M, building inspections underway.',             'AutoSeed', 30, NOW() - INTERVAL '6 days' + INTERVAL '2 hours'),
('chemical',   'RESOLVED',   'critical', 'MRPL Refinery, Mangaluru',          12.9600, 74.8100,  '[SEED] Chemical spill at refinery, HAZMAT team deployed.',             'AutoSeed', 35, NOW() - INTERVAL '6 days' + INTERVAL '12 hours'),

-- DAY 3 (5 days ago)
('wildfire',   'CONTAINED',  'high',     'Shiradi Ghat, Sakleshpur',          12.9300, 75.7800,  '[SEED] Wildfire spreading along ghat section, 3 forest brigades.',     'AutoSeed', 42, NOW() - INTERVAL '5 days' + INTERVAL '4 hours'),
('medical',    'RESOLVED',   'high',     'KMC Hospital, Manipal',             13.3559, 74.7850,  '[SEED] Road accident trauma, 5 critical patients operated.',           'AutoSeed', 11, NOW() - INTERVAL '5 days' + INTERVAL '9 hours'),
('fire',       'RESOLVED',   'medium',   'Bunder, Mangaluru',                 12.8750, 74.8320,  '[SEED] Fish market fire, damage contained to 3 stalls.',               'AutoSeed', 16, NOW() - INTERVAL '5 days' + INTERVAL '15 hours'),

-- DAY 4 (4 days ago)
('flood',      'CONTAINED',  'critical', 'Puttur, Dakshina Kannada',          12.7650, 75.2000,  '[SEED] Severe flooding, NH highway submerged, army deployed.',         'AutoSeed', 90, NOW() - INTERVAL '4 days' + INTERVAL '5 hours'),
('wildfire',   'ACTIVE',     'high',     'Agumbe, Shivamogga',                13.5000, 75.1000,  '[SEED] Forest fire near protected reserve, under control.',            'AutoSeed', 48, NOW() - INTERVAL '4 days' + INTERVAL '14 hours'),

-- DAY 5 (3 days ago)
('cyclone',    'ACTIVE',     'critical', 'Bhatkal, Uttara Kannada',           13.9800, 74.5600,  '[SEED] Cyclone warning, fishing boats recalled, shelters opened.',     'AutoSeed', 80, NOW() - INTERVAL '3 days' + INTERVAL '6 hours'),
('medical',    'RESOLVED',   'critical', 'A J Hospital, Mangaluru',           12.8900, 74.8400,  '[SEED] Multi-car crash on flyover, 2 fatalities, 6 critical.',        'AutoSeed', 6,  NOW() - INTERVAL '3 days' + INTERVAL '12 hours'),
('earthquake', 'RESOLVED',   'high',     'Bellary, Karnataka',                15.1394, 76.9214,  '[SEED] 5.0M earthquake, 12 buildings damaged, 40 displaced.',         'AutoSeed', 40, NOW() - INTERVAL '3 days' + INTERVAL '18 hours'),

-- DAY 6 (2 days ago)
('wildfire',   'ACTIVE',     'critical', 'Nagarhole Reserve, Kodagu',         11.9500, 76.0300,  '[SEED] Major wildfire in tiger reserve, aircraft deployed.',           'AutoSeed', 65, NOW() - INTERVAL '2 days' + INTERVAL '5 hours'),
('fire',       'CONTAINED',  'high',     'Yeyyadi, Mangaluru',                12.9000, 74.8500,  '[SEED] Market fire, 10 shops gutted, fire brigade contained spread.', 'AutoSeed', 30, NOW() - INTERVAL '2 days' + INTERVAL '14 hours'),

-- DAY 7 (yesterday + today)
('fire',       'ACTIVE',     'critical', 'Ullal, Mangaluru',                  12.8100, 74.8600,  '[SEED] Fishing harbour fire, multiple boats ablaze.',                  'AutoSeed', 10, NOW() - INTERVAL '1 day'  + INTERVAL '3 hours'),
('flood',      'ACTIVE',     'high',     'Panja, Dakshina Kannada',           12.9000, 75.0500,  '[SEED] Flash flood, NH27 blocked, rescue operations ongoing.',         'AutoSeed', 40, NOW() - INTERVAL '1 day'  + INTERVAL '8 hours'),
('medical',    'ACTIVE',     'critical', 'KMC Attavar, Mangaluru',            12.8800, 74.8300,  '[SEED] Building collapse, 5 trapped, rescue team on site.',           'AutoSeed', 5,  NOW() - INTERVAL '1 day'  + INTERVAL '12 hours'),
('cyclone',    'REPORTED',   'critical', 'Karwar, Uttara Kannada',            14.8135, 74.1292,  '[SEED] Cyclone BIPARJOY, landfall expected in 12 hours.',              'AutoSeed', 100,NOW() - INTERVAL '10 hours'),
('earthquake', 'REPORTED',   'medium',   'Chitradurga, Karnataka',            14.2251, 76.3980,  '[SEED] 4.5M tremor felt, structural assessments ongoing.',             'AutoSeed', 35, NOW() - INTERVAL '4 hours');

-- Step 3: Resources (clear + re-insert)
-- Valid categories: vehicle, supply, personnel
-- Valid types: ambulance, fire_truck, medical_kit, rescue_boat, shelter
DELETE FROM resources;
INSERT INTO resources (name, type, category, total, deployed, status, location)
VALUES
  ('Ambulance Unit Alpha-1',   'ambulance',    'vehicle',    12,   4, 'available', 'Wenlock Hospital, Mangaluru'),
  ('Fire Engine Squad-1',      'fire_truck',   'vehicle',     8,   3, 'available', 'Fire Station, Bunder'),
  ('Rescue Boat Fleet-1',      'rescue_boat',  'vehicle',     5,   2, 'available', 'Panambur Port, Mangaluru'),
  ('Ambulance Unit Bravo-2',   'ambulance',    'vehicle',     6,   2, 'available', 'HAL Airport, Mangaluru'),
  ('Trauma Kit Supply',        'medical_kit',  'supply',    350,  80, 'available', 'KMC Blood Bank, Manipal'),
  ('Emergency Med Kits',       'medical_kit',  'supply',    120,  25, 'available', 'District Warehouse, Mangaluru'),
  ('Oxygen Supply Units',      'medical_kit',  'supply',     80,  20, 'available', 'A J Hospital, Mangaluru'),
  ('Relief Shelter Tents',     'shelter',      'supply',     40,  12, 'available', 'Civil Lines, Udupi'),
  ('Emergency Blankets',       'shelter',      'supply',   1200, 300, 'available', 'Relief Depot, Mangaluru'),
  ('Fire Truck Squad-2',       'fire_truck',   'vehicle',     4,   1, 'available', 'NDRF Base, Mangaluru'),
  ('Rescue Boat Fleet-2',      'rescue_boat',  'vehicle',     3,   1, 'available', 'Old Port, Mangaluru'),
  ('Food Supply Packs',        'medical_kit',  'supply',   5000,1500, 'available', 'Civil Depot, Bantwal');

-- Step 4: Organizations (clear + re-insert)
-- Columns: name, type, location, contact, status
-- Valid types: hospital, fire_dept, ngo, government
DELETE FROM organizations;
INSERT INTO organizations (name, type, location, contact, status)
VALUES
  ('Mangaluru Fire & Rescue',    'fire_dept',   'Bunder, Mangaluru',      '+91-824-2220101', 'active'),
  ('Wenlock District Hospital',  'hospital',    'Hampankatta, Mangaluru', '+91-824-2220801', 'active'),
  ('KMC Hospital Manipal',       'hospital',    'Manipal, Udupi',         '+91-820-2922000', 'active'),
  ('NDRF 6th Battalion',         'government',  'Panambur, Mangaluru',    '+91-120-2441786', 'active'),
  ('DK District Admin',          'government',  'Lalbagh, Mangaluru',     '+91-824-2220100', 'active'),
  ('Red Cross Society Karnataka','ngo',          'Bengaluru, Karnataka',   '+91-80-22242091', 'active');

-- Verify
SELECT
  (SELECT COUNT(*) FROM incidents WHERE description LIKE '%[SEED]%') AS seeded_incidents,
  (SELECT COUNT(*) FROM resources) AS total_resources,
  (SELECT COUNT(*) FROM organizations) AS total_orgs;
