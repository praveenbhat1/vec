
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjzlnvbtzetcouwexdrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqemxudmJ0emV0Y291d2V4ZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzEwMzEsImV4cCI6MjA5MzEwNzAzMX0.zwlN3nzp3FEs0TzrSwA7JdA1SNJ539-0C-aX9ilbr5I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOrgs() {
  const { data, error } = await supabase.from('organizations').select('*').limit(1);
  if (error) {
    console.error(error);
    return;
  }
  if (data && data.length > 0) {
    console.log("Columns in organizations:", Object.keys(data[0]));
  } else {
    console.log("No data in organizations to check columns.");
  }
}

checkOrgs();
