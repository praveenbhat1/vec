import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjzlnvbtzetcouwexdrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqemxudmJ0emV0Y291d2V4ZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzEwMzEsImV4cCI6MjA5MzEwNzAzMX0.zwlN3nzp3FEs0TzrSwA7JdA1SNJ539-0C-aX9ilbr5I';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debug() {
  console.log('--- Checking Resources Table ---');
  const { data: resData, error: resErr } = await supabase.from('resources').select('*').limit(1);
  if (resErr) {
    console.error('Error fetching resources:', resErr);
  } else if (resData && resData.length > 0) {
    console.log('Columns in resources:', Object.keys(resData[0]));
  } else {
    console.log('Resources table is empty.');
  }

  console.log('\n--- Attempting Test Insertion ---');
  const testRes = {
    name: 'TEST_ITEM_' + Date.now(),
    total: 10,
    available: 10,
    unit: 'kg',
    location: 'DEBUG_SECTOR',
    category: 'supply',
    type: 'supply',
    status: 'Available'
  };

  const { data: insertData, error: insertErr } = await supabase.from('resources').insert([testRes]).select();
  if (insertErr) {
    console.error('INSERTION FAILED:', insertErr.message, insertErr.details, insertErr.hint);
  } else {
    console.log('INSERTION SUCCESSFUL:', insertData);
  }
}

debug();
