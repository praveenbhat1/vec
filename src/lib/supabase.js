import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://wjzlnvbtzetcouwexdrx.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqemxudmJ0emV0Y291d2V4ZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzEwMzEsImV4cCI6MjA5MzEwNzAzMX0.zwlN3nzp3FEs0TzrSwA7JdA1SNJ539-0C-aX9ilbr5I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : null,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// ============================================
// AUTH HELPERS
// ============================================
export async function signUp({ email, password, name, role }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: role || 'victim' },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchAllProfiles() {
  console.log("Supabase: [FETCH] Fetching profiles...");
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name');
    
  if (error) {
    console.error("Supabase: [FETCH_ERROR] Profiles:", error.message);
    throw error;
  }
  console.log(`Supabase: [FETCH_SUCCESS] Found ${data?.length || 0} profiles.`);
  return data;
}

// ============================================
// INCIDENTS
// ============================================
export async function fetchIncidents() {
  console.log("Supabase: [FETCH] Fetching incidents...");
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Supabase: [FETCH_ERROR] Incidents:", error.message, error.details);
    throw error;
  }
  console.log(`Supabase: [FETCH_SUCCESS] Found ${data?.length || 0} incidents.`);
  return data;
}

export async function createIncident(incident) {
  console.log("Supabase: [DB_INSERT] Table: incidents | Payload:", incident);
  const { data, error } = await supabase
    .from('incidents')
    .insert(incident)
    .select()
    .single();
    
  if (error) {
    console.error("Supabase: [DB_ERROR] Table: incidents | Details:", error);
    throw error;
  }
  
  console.log("Supabase: [DB_SUCCESS] Table: incidents | Created:", data);
  return data;
}

export async function updateIncident(id, updates) {
  const { data, error } = await supabase
    .from('incidents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchIncidentStats() {
  const { data, error } = await supabase.from('incidents').select('status, severity, type, created_at, response_time_minutes');
  if (error || !data) {
    return {
      total: 0,
      active: 0,
      contained: 0,
      resolved: 0,
      avgResponseTime: '0.0',
      typeDistribution: {},
      severityDistribution: {},
    };
  }

  const total = data.length;
  const active = data.filter(d => d.status === 'REPORTED' || d.status === 'ACTIVE').length;
  const contained = data.filter(d => d.status === 'CONTAINED').length;
  const resolved = data.filter(d => d.status === 'RESOLVED').length;

  // Calculate type distribution
  const typeDistribution = {};
  data.forEach(d => {
    typeDistribution[d.type] = (typeDistribution[d.type] || 0) + 1;
  });

  // Calculate severity distribution
  const severityDistribution = {};
  data.forEach(d => {
    severityDistribution[d.severity] = (severityDistribution[d.severity] || 0) + 1;
  });

  // Compute real average response time from data
  const withResponse = data.filter(d => d.response_time_minutes != null);
  const avgResponseTime = withResponse.length > 0
    ? (withResponse.reduce((sum, d) => sum + d.response_time_minutes, 0) / withResponse.length).toFixed(1)
    : '0.0';

  return {
    total,
    active,
    contained,
    resolved,
    avgResponseTime,
    typeDistribution,
    severityDistribution,
  };
}

// ============================================
// ORGANIZATIONS
// ============================================
export async function fetchOrganizations() {
  console.log("Supabase: [FETCH] Fetching organizations...");
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name');
    
  if (error) {
    console.error("Supabase: [FETCH_ERROR] Organizations:", error.message);
    throw error;
  }
  console.log(`Supabase: [FETCH_SUCCESS] Found ${data?.length || 0} organizations.`);
  return data;
}

// ============================================
// MESSAGES
// ============================================
export async function fetchMessages(limit = 20) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function createMessage(msg) {
  const { data, error } = await supabase
    .from('messages')
    .insert(msg)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================
// RESOURCES
// ============================================
export async function fetchResources() {
  console.log("Supabase: [FETCH] Fetching resources...");
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('name');
    
  if (error) {
    console.error("Supabase: [FETCH_ERROR] Resources:", error.message);
    throw error;
  }
  console.log(`Supabase: [FETCH_SUCCESS] Found ${data?.length || 0} resources.`);
  return data;
}

export async function createResource(resource) {
  const { data, error } = await supabase
    .from('resources')
    .insert(resource)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateResource(id, updates) {
  const { data, error } = await supabase
    .from('resources')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================
// ACTIVITY LOGS
// ============================================
export async function createActivityLog(log) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert(log)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchActivityLogs(limit = 50) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================
export function subscribeToIncidents(callback) {
  const channel = supabase
    .channel('incidents-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'incidents' },
      (payload) => callback(payload)
    )
    .subscribe();
  return channel;
}

export function subscribeToResources(callback) {
  const channel = supabase
    .channel('resources-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'resources' },
      (payload) => callback(payload)
    )
    .subscribe();
  return channel;
}

export async function subscribeToActivityLogs(callback) {
  const channel = supabase
    .channel('activity-logs-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'activity_logs' },
      (payload) => callback(payload)
    )
    .subscribe();
  return channel;
}

// ============================================
// SEEDING (AUTO-FILL IF EMPTY)
// ============================================
export async function seedDatabaseIfEmpty() {
  console.log("Supabase: [SEED] Checking database status...");
  try {
    // 1. Check Incidents
    const { count: incCount, error: incErr } = await supabase
      .from('incidents')
      .select('*', { count: 'exact', head: true });
      
    if (!incErr && incCount === 0) {
      console.log("Supabase: [SEED] Incidents table empty. Seeding mock data...");
      await supabase.from('incidents').insert([
        { type: "fire", location: "Udupi Main Road", latitude: 13.3409, longitude: 74.7421, severity: "high", status: "ACTIVE", description: "Large structure fire near the main intersection." },
        { type: "accident", location: "NH66 Highway", latitude: 13.3315, longitude: 74.7460, severity: "medium", status: "REPORTED", description: "Multi-vehicle collision on NH66." },
        { type: "flood", location: "Malpe Beach", latitude: 13.3490, longitude: 74.6900, severity: "low", status: "ACTIVE", description: "Tidal surge causing minor flooding." },
        { type: "medical", location: "Manipal Hospital", latitude: 13.3522, longitude: 74.7928, severity: "high", status: "ACTIVE", description: "Emergency department at peak capacity." },
        { type: "wildfire", location: "Kalsanka Woods", latitude: 13.3500, longitude: 74.7600, severity: "critical", status: "ACTIVE", description: "Rapidly spreading forest fire in Kalsanka region." }
      ]);
    }

    // 2. Check Resources
    const { count: resCount, error: resErr } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true });

    if (!resErr && resCount === 0) {
      console.log("Supabase: [SEED] Resources table empty. Seeding mock data...");
      const seedResources = [
          { name: 'Medical Kits (Advanced)', type: 'medical_kit', category: 'supply', total: 120, available: 85, location: 'Central Hub', status: 'available' },
          { name: 'Ambulance Unit Alpha', type: 'ambulance', category: 'vehicle', total: 10, available: 4, location: 'Sector 4', status: 'low' },
          { name: 'Rapid Response Team', type: 'personnel', category: 'personnel', total: 25, available: 12, location: 'North Station', status: 'available' },
          { name: 'Emergency Shelter Kits', type: 'shelter', category: 'supply', total: 500, available: 320, location: 'Malpe Beach', status: 'available' },
          { name: 'Recon Drone Units', type: 'drone', category: 'equipment', total: 15, available: 15, location: 'Headquarters', status: 'available' },
          { name: 'Fire Engine 07', type: 'fire_truck', category: 'vehicle', total: 5, available: 3, location: 'Main Station', status: 'available' }
      ];
      await supabase.from('resources').insert(seedResources);
    }

    // 3. Check Organizations
    const { count: orgCount, error: orgErr } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true });
    
    if (!orgErr && orgCount === 0) {
      console.log("Supabase: [SEED] Organizations table empty. Seeding...");
      await supabase.from('organizations').insert([
        { name: 'City General Hospital', type: 'hospital', location: 'Downtown', contact: '+1-555-0123', status: 'Active' },
        { name: 'Western Fire Dept', type: 'fire_dept', location: 'Industrial Sector', contact: '+1-555-0199', status: 'Active' },
        { name: 'Red Cross Alpha', type: 'ngo', location: 'Suburban East', contact: '+1-555-0144', status: 'Inactive' },
        { name: 'Emergency Medics Unit', type: 'hospital', location: 'North Point', contact: '+1-555-0188', status: 'Active' },
        { name: 'National Guard Sector 7', type: 'ngo', location: 'Fort Ridge', contact: '+1-555-9000', status: 'Active' },
        { name: 'Coast Guard Unit B', type: 'fire_dept', location: 'Harbor Base', contact: '+1-555-8822', status: 'Active' },
        { name: 'Volunteers Without Borders', type: 'ngo', location: 'Global Relief Hub', contact: '+1-555-7766', status: 'Active' }
      ]);
    }

    // 3.5 Check Profiles
    const { count: profCount, error: profErr } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (!profErr && profCount === 0) {
      console.log("Supabase: [SEED] Profiles table empty. Seeding...");
      // Using deterministic UUIDs for mock profiles (V4 format)
      await supabase.from('profiles').insert([
        { id: '00000000-0000-4000-a000-000000000001', name: 'Commander Alex', role: 'admin', organization: 'Crisis HQ' },
        { id: '00000000-0000-4000-a000-000000000002', name: 'Major Sarah', role: 'responder', organization: 'Western Fire Dept' },
        { id: '00000000-0000-4000-a000-000000000003', name: 'Officer James', role: 'responder', organization: 'City General Hospital' },
        { id: '00000000-0000-4000-a000-000000000004', name: 'Tech Elena', role: 'admin', organization: 'IT Hub' },
        { id: '00000000-0000-4000-a000-000000000005', name: 'Dr. Michael Chen', role: 'responder', organization: 'City General Hospital' },
        { id: '00000000-0000-4000-a000-000000000006', name: 'Captain Ramirez', role: 'admin', organization: 'Coast Guard Unit B' },
        { id: '00000000-0000-4000-a000-000000000007', name: 'Dispatcher Kelly', role: 'responder', organization: 'Western Fire Dept' },
        { id: '00000000-0000-4000-a000-000000000008', name: 'Logistics Sam', role: 'responder', organization: 'Red Cross Alpha' }
      ]);
    }

    // 4. Check Messages
    const { count: msgCount, error: msgErr } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });
    
    if (!msgErr && msgCount === 0) {
      console.log("Supabase: [SEED] Messages table empty. Seeding...");
      await supabase.from('messages').insert([
        { sender: 'COMMANDER ALEX', text: 'Aether Grid stabilized. Monitoring all sectors.' },
        { sender: 'MAJOR SARAH', text: 'Ambulance 04 en route to NH66.' },
        { sender: 'OFFICER JAMES', text: 'All units stay on standby for weather update.' }
      ]);
    }

    console.log("Supabase: [SEED] Database check/seed complete.");
  } catch (err) {
    console.error("Supabase: [SEED] Critical Error:", err);
  }
}
