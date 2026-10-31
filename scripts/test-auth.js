import { createClient } from '@supabase/supabase-js';
import { loadEnv } from './loadEnv.js';

const { supabaseUrl, serviceRoleKey } = loadEnv();
const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function testAuth() {
  const { data, error } = await adminClient.auth.admin.listUsers();
  if (error) {
    console.error('Auth error:', error);
  } else {
    console.log('Current Auth Users count:', data.users.length);
    console.log('Users:', data.users.map(u => ({ id: u.id, email: u.email })));
  }
}

testAuth();

