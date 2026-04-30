-- 1. MAKE lak@gmail.com AN ADMIN
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'lak@gmail.com'
);

-- 2. INSERT MOCK INCIDENTS FOR ANALYTICS PAGE (Past 30 days)
-- We will insert a variety of incidents with different dates, types, and statuses.

INSERT INTO public.incidents (type, location, latitude, longitude, severity, status, description, reporter_name, reporter_phone, response_time_minutes, created_at)
VALUES 
  ('fire', 'Industrial District', 40.7128, -74.0060, 'critical', 'ACTIVE', 'Large industrial fire reported at chemical plant.', 'John Doe', '555-0101', 12, NOW() - INTERVAL '2 hours'),
  ('flood', 'Downtown', 40.7150, -74.0100, 'high', 'CONTAINED', 'Severe flooding in downtown area due to burst water main.', 'Jane Smith', '555-0102', 45, NOW() - INTERVAL '1 day'),
  ('accident', 'I-95 North', 40.7300, -73.9900, 'medium', 'RESOLVED', 'Multi-vehicle collision on I-95.', 'Bob Builder', '555-0103', 15, NOW() - INTERVAL '3 days'),
  ('medical', 'City Mall', 40.7400, -73.9800, 'high', 'REPORTED', 'Multiple people reported fainting.', 'Alice Wonderland', '555-0104', null, NOW() - INTERVAL '5 hours'),
  ('utility', 'Sector 4', 40.7500, -73.9700, 'critical', 'ACTIVE', 'Sector 4 experiencing total blackout.', 'Charlie Brown', '555-0105', 8, NOW() - INTERVAL '2 days'),
  ('hazard', 'Port Area', 40.7000, -74.0200, 'high', 'CONTAINED', 'Old warehouse roof caved in.', 'Dave Lo', '555-0106', 22, NOW() - INTERVAL '5 days'),
  ('hazard', 'Transit Route B', 40.7600, -73.9600, 'critical', 'RESOLVED', 'Hazardous material leaked on transit route.', 'Eve Apple', '555-0107', 35, NOW() - INTERVAL '10 days'),
  ('fire', 'West Hills', 40.7800, -73.9500, 'high', 'ACTIVE', 'Brush fire spreading near residential zone.', 'Frank Castle', '555-0108', 40, NOW() - INTERVAL '12 hours'),
  ('utility', 'East Side', 40.7900, -73.9400, 'medium', 'REPORTED', 'Reports of unsafe tap water.', 'Grace Hopper', '555-0109', null, NOW() - INTERVAL '1 hour'),
  ('earthquake', 'Citywide', 40.7500, -74.0000, 'critical', 'RESOLVED', 'Minor structural damages reported.', 'Heidi Klum', '555-0110', 10, NOW() - INTERVAL '15 days'),
  ('accident', 'Underground Station 5', 40.7200, -73.9800, 'high', 'CONTAINED', 'Train derailed, minor injuries.', 'Ivan Drago', '555-0111', 18, NOW() - INTERVAL '4 days'),
  ('fire', 'North Quarter', 40.8000, -73.9300, 'critical', 'ACTIVE', 'Apartment building on fire.', 'Judy Garland', '555-0112', 5, NOW() - INTERVAL '30 minutes'),
  ('flood', 'Riverfront', 40.7100, -74.0300, 'high', 'ACTIVE', 'River banks breached after heavy rain.', 'Karl Marx', '555-0113', 25, NOW() - INTERVAL '18 hours'),
  ('hazard', 'Commercial Ave', 40.7350, -73.9950, 'medium', 'CONTAINED', 'Strong smell of gas in commercial block.', 'Liam Neeson', '555-0114', 12, NOW() - INTERVAL '2 days'),
  ('medical', 'Stadium', 40.8100, -73.9200, 'critical', 'RESOLVED', 'Crowd crush at local event.', 'Mia Wallace', '555-0115', 7, NOW() - INTERVAL '20 days'),
  ('hazard', 'Main Bridge', 40.7050, -74.0150, 'high', 'REPORTED', 'Sensors indicate structural stress on Main Bridge.', 'Noah Ark', '555-0116', null, NOW() - INTERVAL '4 hours'),
  ('weather', 'Outskirts', 40.8500, -73.9000, 'critical', 'RESOLVED', 'Funnel cloud spotted near city limits.', 'Olivia Pope', '555-0117', 20, NOW() - INTERVAL '25 days'),
  ('weather', 'Suburbs', 40.8200, -73.9100, 'medium', 'CONTAINED', 'High winds caused widespread tree falls.', 'Peter Parker', '555-0118', 30, NOW() - INTERVAL '6 days'),
  ('fire', 'Tech Park', 40.7650, -73.9550, 'critical', 'RESOLVED', 'Blast at manufacturing facility.', 'Quinn Fabray', '555-0119', 9, NOW() - INTERVAL '28 days'),
  ('medical', 'General Hospital', 40.7450, -73.9750, 'high', 'ACTIVE', 'New cluster of highly infectious disease.', 'Rachel Green', '555-0120', 14, NOW() - INTERVAL '8 days')
;

-- 3. INSERT MOCK RESOURCES FOR ANALYTICS PAGE
INSERT INTO public.resources (name, category, type, total, available, deployed, unit, location, status)
VALUES
  ('Mobile Medical Unit Alpha', 'vehicle', 'ambulance', 5, 2, 3, 'units', 'Central Station', 'Available'),
  ('Heavy Duty Fire Engine', 'vehicle', 'fire_truck', 10, 4, 6, 'units', 'Firehouse 1', 'Deployed'),
  ('Hazmat Response Kits', 'supply', 'medical_kit', 500, 350, 150, 'boxes', 'Supply Depot', 'Available'),
  ('Emergency Water Rations', 'supply', 'medical_kit', 10000, 8000, 2000, 'liters', 'Warehouse B', 'Available'),
  ('Search and Rescue Chopper', 'vehicle', 'air_support', 3, 1, 2, 'units', 'Helipad Alpha', 'Deployed'),
  ('Portable Generators', 'supply', 'equipment', 50, 40, 10, 'units', 'Tech Hub', 'Available'),
  ('Trauma Personnel', 'personnel', 'medical_staff', 100, 20, 80, 'people', 'City Hospital', 'Deployed'),
  ('Field Tents', 'supply', 'equipment', 200, 150, 50, 'units', 'Relief Center', 'Available')
;

-- 4. INSERT MOCK ORGANIZATIONS
INSERT INTO public.organizations (name, type, location, contact, status)
VALUES
  ('Red Cross Metro', 'ngo', 'Downtown HQ', '+1-800-RED-CROSS', 'Active'),
  ('City Fire Department', 'fire_dept', 'Citywide', '911', 'Active'),
  ('Metro Police Dept', 'police', 'Citywide', '911', 'Active'),
  ('Federal Emergency Agency', 'gov', 'Capital City', '+1-800-FEMA', 'Active'),
  ('Global Health Response', 'ngo', 'Medical Center', '+1-555-HEALTH', 'Active')
;

-- 5. INSERT MOCK ACTIVITY LOGS
INSERT INTO public.activity_logs (action, description, created_at)
VALUES
  ('SYSTEM_BOOT', 'CrisisChain strategic network initialized', NOW() - INTERVAL '30 days'),
  ('INCIDENT_RESOLVED', 'Mass Casualty Incident at Stadium successfully managed', NOW() - INTERVAL '19 days'),
  ('RESOURCE_DEPLOYED', 'Dispatched 3 Mobile Medical Units to Industrial Fire', NOW() - INTERVAL '2 hours'),
  ('STATUS_UPDATE', 'Downtown Flooding contained by local authorities', NOW() - INTERVAL '23 hours'),
  ('NEW_ALERT', 'Major Factory Fire reported. Auto-dispatching fire units.', NOW() - INTERVAL '2 hours')
;
