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
  console.log("Supabase: [SEED] Initiating Massive Tactical Seeding...");
  try {
    // 1. Check Incidents
    const { count: incCount, error: incErr } = await supabase
      .from('incidents')
      .select('*', { count: 'exact', head: true });
      
    if (!incErr) {
      const currentCount = incCount || 0;
      if (currentCount < 72) {
        console.log(`Supabase: [SEED] Grid at ${currentCount}/72. Scaling up...`);
        const types = ['fire', 'flood', 'medical', 'accident', 'wildfire', 'cyclone', 'earthquake'];
        const severities = ['low', 'medium', 'high', 'critical'];
        
        const remaining = 72 - currentCount;
        const batch = [];
        
        for (let i = 0; i < remaining; i++) {
          const type = types[Math.floor(Math.random() * types.length)];
          const lat = 13.34 + (Math.random() - 0.5) * 0.15;
          const lng = 74.74 + (Math.random() - 0.5) * 0.15;
          
          batch.push({
            type,
            location: `Sector ${Math.floor(Math.random() * 99) + 100}`,
            latitude: lat,
            longitude: lng,
            severity: severities[Math.floor(Math.random() * severities.length)],
            status: Math.random() > 0.3 ? 'ACTIVE' : 'REPORTED',
            description: `Tactical node ${i} reporting abnormal activity. Integrity check recommended.`,
            reporter_name: `Automated Sentry ${Math.floor(Math.random() * 999)}`,
            created_at: new Date(Date.now() - Math.random() * 3600000).toISOString()
          });
        }
        
        // Insert in one large batch
        const { error: batchErr } = await supabase.from('incidents').insert(batch);
        if (batchErr) {
           console.error("Supabase: [SEED] Batch insertion failed. Using individual fallback...", batchErr.message);
           for (const item of batch) {
             await supabase.from('incidents').insert(item);
           }
        }
        console.log(`Supabase: [SEED] Tactical Grid Successfully Provisioned to 72 Units.`);
      }
    }

    // 2. Check Resources
    const { count: resCount, error: resErr } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true });

    if (!resErr && resCount < 20) {
      console.log("Supabase: [SEED] Provisioning additional resources...");
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

    // 4. Check Activity Logs (Action Queue)
    const { count: logCount, error: logErr } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true });
    
    if (!logErr && (logCount || 0) < 10) {
      console.log("Supabase: [SEED] Filling Action Queue...");
      const mockActions = [
        { action_type: 'UNIT_DEPLOYMENT', details: 'Air Ambulance 02 dispatched to Sector 142. [PRIORITY:High] [SOURCE:HQ_COMMAND]', created_at: new Date(Date.now() - 300000).toISOString() },
        { action_type: 'RECON_UPLINK', details: 'Drone Recon established over Central Hub. [PRIORITY:Medium] [SOURCE:SATELLITE_LINK]', created_at: new Date(Date.now() - 900000).toISOString() },
        { action_type: 'AGENCY_SYNC', details: 'City Hospital synced with Fire Dept Alpha. [PRIORITY:Low] [SOURCE:NET_SYNC]', created_at: new Date(Date.now() - 1800000).toISOString() },
        { action_type: 'GRID_OPTIMIZE', details: 'AI Routing optimized for Sector 4 congestion. [PRIORITY:Medium] [SOURCE:AI_CORE]', created_at: new Date(Date.now() - 2700000).toISOString() },
        { action_type: 'RESOURCE_ALLOC', details: 'Medical kits (Tier 2) moved to Forward Base. [PRIORITY:High] [SOURCE:LOGISTICS]', created_at: new Date(Date.now() - 3600000).toISOString() },
        { action_type: 'SYSTEM_AUDIT', details: 'Core integrity check complete. Zero drift. [PRIORITY:Low] [SOURCE:SYSTEM]', created_at: new Date(Date.now() - 5400000).toISOString() },
        { action_type: 'RESPONDER_LINK', details: 'Police Unit 105 linked to Objective 72. [PRIORITY:High] [SOURCE:FIELD_OPS]', created_at: new Date(Date.now() - 7200000).toISOString() },
        { action_type: 'HEARTBEAT_SYNC', details: 'Satellite Uplink 04 re-established. [PRIORITY:Medium] [SOURCE:COMM_HUB]', created_at: new Date(Date.now() - 9000000).toISOString() },
        { action_type: 'EVAC_ORDER', details: 'Evacuation order issued for Sector 21 due to flood risk. [PRIORITY:Critical] [SOURCE:LOCAL_AUTHORITY]', created_at: new Date(Date.now() - 600000).toISOString() },
        { action_type: 'AMBULANCE_DISPATCH', details: 'Unit 404 (Ambulance) responding to cardiac arrest in Sector 5. [PRIORITY:High] [SOURCE:DISPATCH_911]', created_at: new Date(Date.now() - 1200000).toISOString() },
        { action_type: 'FIRE_SUPPRESSION', details: 'Water tanker dispatched to contain structural fire. [PRIORITY:High] [SOURCE:FIRE_DEPT]', created_at: new Date(Date.now() - 2400000).toISOString() },
        { action_type: 'SUPPLY_AIRDROP', details: 'Food and water packages dropped in isolated North Sector. [PRIORITY:Medium] [SOURCE:LOGISTICS_AIR]', created_at: new Date(Date.now() - 4800000).toISOString() }
      ];
      await supabase.from('activity_logs').insert(mockActions);
    }

    console.log("Supabase: [SEED] Massive Database Seeding Complete.");
  } catch (err) {
    console.error("Supabase: [SEED] Critical Error:", err);
  }
}
