import { createClient } from '@supabase/supabase-js';
import { loadEnv } from './loadEnv.js';

const { supabaseUrl, serviceRoleKey } = loadEnv();
const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function listAndConfirmUsers() {
  const { data, error } = await adminClient.auth.admin.listUsers();
  if (error) {
    console.error('List error:', error);
    return;
  }

  console.log(`Found ${data.users.length} users:`);
  for (const u of data.users) {
    console.log(`- ${u.email} (confirmed: ${!!u.email_confirmed_at})`);
    if (!u.email_confirmed_at) {
      console.log(`Confirming email for ${u.email}...`);
      const { data: updated, error: updateError } = await adminClient.auth.admin.updateUserById(
        u.id,
        { email_confirm: true }
      );
      if (updateError) {
        console.error(`Failed to confirm ${u.email}:`, updateError.message);
      } else {
        console.log(`Successfully confirmed ${u.email}!`);
      }
    }
  }
}

listAndConfirmUsers();

