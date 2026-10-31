const { createClient } = require('@supabase/supabase-js');
const { loadEnv } = require('./loadEnv.cjs');

const { supabaseUrl, serviceRoleKey } = loadEnv();
const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;
const fullName = process.env.TEST_USER_NAME || 'CICR Test Admin';
const role = process.env.TEST_USER_ROLE || 'admin';

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}
if (!email || !password) {
  throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD are required.');
}
if (!['member', 'lead', 'admin'].includes(role)) {
  throw new Error('TEST_USER_ROLE must be member, lead, or admin.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createTestUser() {
  const { data: existing, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw new Error(`Could not inspect users: ${listError.message}`);

  const current = existing.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  let user = current;

  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role, status: 'approved' },
    });
    if (error) throw new Error(`Could not update test user: ${error.message}`);
    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role, status: 'approved' },
    });
    if (error) throw new Error(`Could not create test user: ${error.message}`);
    user = data.user;
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: fullName,
    email,
    role,
    avatar_url: 'status:approved',
  });
  if (profileError) throw new Error(`Could not create profile: ${profileError.message}`);

  console.log(`Test user is ready: ${email} (${role}).`);
}

createTestUser().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
