import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjzlnvbtzetcouwexdrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqemxudmJ0emV0Y291d2V4ZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzEwMzEsImV4cCI6MjA5MzEwNzAzMX0.zwlN3nzp3FEs0TzrSwA7JdA1SNJ539-0C-aX9ilbr5I';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Seeding Analytics data...");

  const now = new Date();
  
  // Valid types: flood, cyclone, wildfire, earthquake, collapse, chemical, other
  const incidents = [
    { type: 'chemical', location: 'Industrial District', latitude: 40.7128, longitude: -74.0060, severity: 'critical', status: 'ACTIVE', description: 'Large industrial fire reported at chemical plant.', response_time_minutes: 12, created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() },
    { type: 'flood', location: 'Downtown', latitude: 40.7150, longitude: -74.0100, severity: 'high', status: 'CONTAINED', description: 'Severe flooding in downtown area due to burst water main.', response_time_minutes: 45, created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString() },
    { type: 'other', location: 'I-95 North', latitude: 40.7300, longitude: -73.9900, severity: 'medium', status: 'RESOLVED', description: 'Multi-vehicle collision on I-95.', response_time_minutes: 15, created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { type: 'other', location: 'City Mall', latitude: 40.7400, longitude: -73.9800, severity: 'high', status: 'REPORTED', description: 'Multiple people reported fainting.', response_time_minutes: null, created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString() },
    { type: 'other', location: 'Sector 4', latitude: 40.7500, longitude: -73.9700, severity: 'critical', status: 'ACTIVE', description: 'Sector 4 experiencing total blackout.', response_time_minutes: 8, created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { type: 'collapse', location: 'Port Area', latitude: 40.7000, longitude: -74.0200, severity: 'high', status: 'CONTAINED', description: 'Old warehouse roof caved in.', response_time_minutes: 22, created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { type: 'chemical', location: 'Transit Route B', latitude: 40.7600, longitude: -73.9600, severity: 'critical', status: 'RESOLVED', description: 'Hazardous material leaked on transit route.', response_time_minutes: 35, created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { type: 'wildfire', location: 'West Hills', latitude: 40.7800, longitude: -73.9500, severity: 'high', status: 'ACTIVE', description: 'Brush fire spreading near residential zone.', response_time_minutes: 40, created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString() },
    { type: 'other', location: 'East Side', latitude: 40.7900, longitude: -73.9400, severity: 'medium', status: 'REPORTED', description: 'Reports of unsafe tap water.', response_time_minutes: null, created_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() },
    { type: 'earthquake', location: 'Citywide', latitude: 40.7500, longitude: -74.0000, severity: 'critical', status: 'RESOLVED', description: 'Minor structural damages reported.', response_time_minutes: 10, created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString() },
    { type: 'other', location: 'Underground Station 5', latitude: 40.7200, longitude: -73.9800, severity: 'high', status: 'CONTAINED', description: 'Train derailed, minor injuries.', response_time_minutes: 18, created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { type: 'wildfire', location: 'North Quarter', latitude: 40.8000, longitude: -73.9300, severity: 'critical', status: 'ACTIVE', description: 'Apartment building on fire.', response_time_minutes: 5, created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString() },
    { type: 'flood', location: 'Riverfront', latitude: 40.7100, longitude: -74.0300, severity: 'high', status: 'ACTIVE', description: 'River banks breached after heavy rain.', response_time_minutes: 25, created_at: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString() },
    { type: 'chemical', location: 'Commercial Ave', latitude: 40.7350, longitude: -73.9950, severity: 'medium', status: 'CONTAINED', description: 'Strong smell of gas in commercial block.', response_time_minutes: 12, created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { type: 'other', location: 'Stadium', latitude: 40.8100, longitude: -73.9200, severity: 'critical', status: 'RESOLVED', description: 'Crowd crush at local event.', response_time_minutes: 7, created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString() },
    { type: 'collapse', location: 'Main Bridge', latitude: 40.7050, longitude: -74.0150, severity: 'high', status: 'REPORTED', description: 'Sensors indicate structural stress on Main Bridge.', response_time_minutes: null, created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString() },
    { type: 'cyclone', location: 'Outskirts', latitude: 40.8500, longitude: -73.9000, severity: 'critical', status: 'RESOLVED', description: 'Funnel cloud spotted near city limits.', response_time_minutes: 20, created_at: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString() },
    { type: 'cyclone', location: 'Suburbs', latitude: 40.8200, longitude: -73.9100, severity: 'medium', status: 'CONTAINED', description: 'High winds caused widespread tree falls.', response_time_minutes: 30, created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    { type: 'wildfire', location: 'Tech Park', latitude: 40.7650, longitude: -73.9550, severity: 'critical', status: 'RESOLVED', description: 'Blast at manufacturing facility.', response_time_minutes: 9, created_at: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString() },
    { type: 'other', location: 'General Hospital', latitude: 40.7450, longitude: -73.9750, severity: 'high', status: 'ACTIVE', description: 'New cluster of highly infectious disease.', response_time_minutes: 14, created_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  const { error: incErr } = await supabase.from('incidents').insert(incidents);
  if (incErr) console.log("Error incidents:", incErr.message);
  else console.log("Incidents inserted.");

  const resources = [
    { name: 'Mobile Medical Unit Alpha', category: 'vehicle', type: 'ambulance', total: 5, available: 2, deployed: 3, location: 'Central Station', status: 'Available' },
    { name: 'Heavy Duty Fire Engine', category: 'vehicle', type: 'fire_truck', total: 10, available: 4, deployed: 6, location: 'Firehouse 1', status: 'Deployed' },
    { name: 'Hazmat Response Kits', category: 'supply', type: 'medical_kit', total: 500, available: 350, deployed: 150, location: 'Supply Depot', status: 'Available' },
    { name: 'Emergency Water Rations', category: 'supply', type: 'medical_kit', total: 10000, available: 8000, deployed: 2000, location: 'Warehouse B', status: 'Available' },
    { name: 'Search and Rescue Chopper', category: 'vehicle', type: 'air_support', total: 3, available: 1, deployed: 2, location: 'Helipad Alpha', status: 'Deployed' }
  ];

  const { error: resErr } = await supabase.from('resources').insert(resources);
  if (resErr) console.log("Error resources:", resErr.message);
  else console.log("Resources inserted.");

  const orgs = [
    { name: 'Red Cross Metro', type: 'ngo', location: 'Downtown HQ', contact: '+1-800-RED-CROSS', status: 'Active' },
    { name: 'City Fire Department', type: 'government', location: 'Citywide', contact: '911', status: 'Active' },
    { name: 'Federal Emergency Agency', type: 'government', location: 'Capital City', contact: '+1-800-FEMA', status: 'Active' }
  ];
  
  const { error: orgErr } = await supabase.from('organizations').insert(orgs);
  if (orgErr) console.log("Error organizations:", orgErr.message);
  else console.log("Organizations inserted.");
}

run();
