
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjzlnvbtzetcouwexdrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqemxudmJ0emV0Y291d2V4ZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzEwMzEsImV4cCI6MjA5MzEwNzAzMX0.zwlN3nzp3FEs0TzrSwA7JdA1SNJ539-0C-aX9ilbr5I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedMore() {
  console.log("Seeding more mock data...");

  const orgs = [
    { name: 'National Guard Sector 7', type: 'ngo', location: 'Fort Ridge', contact: '+1-555-9000', status: 'Active' },
    { name: 'Coast Guard Unit B', type: 'fire_dept', location: 'Harbor Base', contact: '+1-555-8822', status: 'Active' },
    { name: 'Volunteers Without Borders', type: 'ngo', location: 'Global Relief Hub', contact: '+1-555-7766', status: 'Active' }
  ];

  const { error: orgError } = await supabase.from('organizations').insert(orgs);
  if (orgError) console.error("Org Seed Error:", orgError);
  else console.log("Organizations inserted successfully.");

  console.log("Done.");
}

seedMore();
