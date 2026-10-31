import { createClient } from '@supabase/supabase-js';
import { loadEnv } from './loadEnv.js';

const { supabaseUrl, serviceRoleKey } = loadEnv();

console.log('Testing Supabase connection...');
const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  try {
    const { data, error } = await adminClient.from('inventory_items').select('*').limit(5);
    if (error) {
      console.log('Table inventory_items query result:', error.message, error.code);
    } else {
      console.log('Successfully connected to Supabase! Found inventory_items count:', data?.length);
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Error connecting to Supabase:', err);
  }
}

check();

