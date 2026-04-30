
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjzlnvbtzetcouwexdrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqemxudmJ0emV0Y291d2V4ZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzEwMzEsImV4cCI6MjA5MzEwNzAzMX0.zwlN3nzp3FEs0TzrSwA7JdA1SNJ539-0C-aX9ilbr5I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLS() {
  console.log("Checking RLS by attempting to read with ANON key...");
  const { data, error } = await supabase.from('incidents').select('*');
  if (error) {
    console.log("ANON KEY cannot read incidents:", error.message);
  } else {
    console.log(`ANON KEY found ${data.length} incidents.`);
  }
}

checkRLS();
