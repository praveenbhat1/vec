
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjzlnvbtzetcouwexdrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqemxudmJ0emV0Y291d2V4ZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzEwMzEsImV4cCI6MjA5MzEwNzAzMX0.zwlN3nzp3FEs0TzrSwA7JdA1SNJ539-0C-aX9ilbr5I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkVisibility() {
  console.log("Checking data visibility with ANON KEY...");

  const { data: orgs, error: orgErr } = await supabase.from('organizations').select('*');
  if (orgErr) console.error("Orgs Fetch Error:", orgErr);
  else console.log(`Orgs found: ${orgs.length}`);

  const { data: incs, error: incErr } = await supabase.from('incidents').select('*');
  if (incErr) console.error("Incs Fetch Error:", incErr);
  else console.log(`Incs found: ${incs.length}`);

  const { data: profs, error: profErr } = await supabase.from('profiles').select('*');
  if (profErr) console.error("Profs Fetch Error:", profErr);
  else console.log(`Profs found: ${profs.length}`);
}

checkVisibility();
