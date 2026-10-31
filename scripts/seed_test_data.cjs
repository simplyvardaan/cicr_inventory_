const { createClient } = require('@supabase/supabase-js');
const { loadEnv } = require('./loadEnv.cjs');

const { supabaseUrl, serviceRoleKey } = loadEnv();
const password = process.env.TEST_FIXTURE_PASSWORD || process.env.TEST_USER_PASSWORD;
const domain = process.env.TEST_FIXTURE_DOMAIN || 'example.com';
const prefix = process.env.TEST_FIXTURE_PREFIX || 'cicr-fixture';

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}
if (!password) {
  throw new Error('TEST_FIXTURE_PASSWORD or TEST_USER_PASSWORD is required.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  { key: 'admin', name: 'CICR Fixture Admin', role: 'admin', roll: 'FIX-ADMIN' },
  { key: 'lead', name: 'CICR Fixture Lead', role: 'lead', roll: 'FIX-LEAD' },
  { key: 'member', name: 'CICR Fixture Member', role: 'member', roll: 'FIX-MEMBER' },
];

const items = [
  {
    name: 'Fixture ESP32 Board',
    sku: 'FIX-MCU-001',
    category: 'Microcontrollers & SBCs',
    description: 'Automated test fixture item.',
    location: 'Fixture Cabinet A',
    total_qty: 10,
    available_qty: 8,
    min_threshold: 2,
    condition: 'Good',
    status: 'In Stock',
  },
  {
    name: 'Fixture Distance Sensor',
    sku: 'FIX-SEN-001',
    category: 'Sensors & Modules',
    description: 'Automated test fixture item.',
    location: 'Fixture Cabinet B',
    total_qty: 6,
    available_qty: 2,
    min_threshold: 2,
    condition: 'Good',
    status: 'Low Stock',
  },
  {
    name: 'Fixture Servo Motor',
    sku: 'FIX-MOT-001',
    category: 'Motors & Drivers',
    description: 'Automated test fixture item.',
    location: 'Fixture Cabinet C',
    total_qty: 4,
    available_qty: 0,
    min_threshold: 1,
    condition: 'Maintenance',
    status: 'Out of Stock',
  },
];

async function ensureUser(definition) {
  const email = `${prefix}.${definition.key}@${domain}`;
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw new Error(`Could not inspect users: ${listError.message}`);

  const existing = listed.users.find((user) => user.email?.toLowerCase() === email);
  let user = existing;

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: definition.name, role: definition.role, status: 'approved' },
    });
    if (error) throw new Error(`Could not update ${email}: ${error.message}`);
    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: definition.name, role: definition.role, status: 'approved' },
    });
    if (error) throw new Error(`Could not create ${email}: ${error.message}`);
    user = data.user;
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: definition.name,
    email,
    role: definition.role,
    roll_number: definition.roll,
    phone: '+91 90000 00000',
    avatar_url: 'status:approved',
  });
  if (profileError) throw new Error(`Could not upsert profile ${email}: ${profileError.message}`);
  return { ...definition, id: user.id, email };
}

async function seed() {
  const fixtureUsers = [];
  for (const definition of users) fixtureUsers.push(await ensureUser(definition));

  const { data: savedItems, error: itemError } = await supabase
    .from('inventory_items')
    .upsert(items, { onConflict: 'sku' })
    .select();
  if (itemError) throw new Error(`Could not upsert fixture items: ${itemError.message}`);

  const member = fixtureUsers.find((user) => user.key === 'member');
  const lead = fixtureUsers.find((user) => user.key === 'lead');
  const firstItem = savedItems.find((item) => item.sku === 'FIX-MCU-001');
  const secondItem = savedItems.find((item) => item.sku === 'FIX-SEN-001');
  if (!member || !lead || !firstItem || !secondItem) throw new Error('Fixture records were not returned.');

  const requests = [
    {
      id: '00000000-0000-4000-8000-000000000101',
      item_id: firstItem.id,
      user_id: member.id,
      user_name: member.name,
      user_email: member.email,
      item_name: firstItem.name,
      quantity: 1,
      project_name: 'Fixture Navigation Robot',
      purpose: 'Validate pending requests.',
      status: 'pending',
      expected_return_date: '2030-01-15',
    },
    {
      id: '00000000-0000-4000-8000-000000000102',
      item_id: secondItem.id,
      user_id: lead.id,
      user_name: lead.name,
      user_email: lead.email,
      item_name: secondItem.name,
      quantity: 1,
      project_name: 'Fixture Sensor Test',
      purpose: 'Validate approved requests.',
      status: 'approved',
      borrow_date: '2030-01-01',
      expected_return_date: '2030-01-20',
      approved_by: 'CICR Fixture Admin',
    },
  ];

  for (const request of requests) {
    const { error } = await supabase
      .from('borrow_requests')
      .upsert(request, { onConflict: 'id' });
    if (error && !error.message.includes('no unique')) {
      throw new Error(`Could not insert fixture request: ${error.message}`);
    }
  }

  const logs = [
    {
      id: '00000000-0000-4000-8000-000000000201',
      user_id: member.id,
      user_name: member.name,
      action: 'ACCOUNT_REQUEST',
      details: JSON.stringify({ status: 'approved', fixture: true }),
    },
    {
      id: '00000000-0000-4000-8000-000000000202',
      user_id: lead.id,
      user_name: lead.name,
      action: 'BORROW_REQUEST',
      details: `Requested ${secondItem.name} for fixture validation`,
    },
    {
      id: '00000000-0000-4000-8000-000000000203',
      user_id: member.id,
      user_name: member.name,
      action: 'CREATE_ITEM',
      details: `Fixture created ${firstItem.name}`,
    },
  ];
  const { error: logError } = await supabase
    .from('activity_logs')
    .upsert(logs, { onConflict: 'id' });
  if (logError) throw new Error(`Could not insert fixture logs: ${logError.message}`);

  console.log(`Seeded ${fixtureUsers.length} users, ${savedItems.length} inventory items, 2 requests, and ${logs.length} activity logs.`);
  console.log(`Fixture login email pattern: ${prefix}.<admin|lead|member>@${domain}`);
}

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
