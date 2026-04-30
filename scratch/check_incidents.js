
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjzlnvbtzetcouwexdrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqemxudmJ0emV0Y291d2V4ZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzEwMzEsImV4cCI6MjA5MzEwNzAzMX0.zwlN3nzp3FEs0TzrSwA7JdA1SNJ539-0C-aX9ilbr5I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkIncidentsContent() {
  const { data, error } = await supabase.from('incidents').select('id, type, latitude, longitude').limit(10);
  if (error) {
    console.error(error);
    return;
  }
  console.log("Incidents Content:", JSON.stringify(data, null, 2));
}

checkIncidentsContent();
