const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { loadEnv } = require('./loadEnv.cjs');

const { supabaseUrl, serviceRoleKey } = loadEnv();
const supabase = createClient(supabaseUrl, serviceRoleKey);

const raw = JSON.parse(fs.readFileSync('scripts/fetched_items.json', 'utf8'));
const webItems = raw.data || raw;
const webNames = new Set(webItems.map(i => i.name.toLowerCase().trim()));

async function clean() {
  console.log('1. Checking items in Supabase...');
  const { data: dbItems, error } = await supabase.from('inventory_items').select('*');
  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  console.log(`Current items in DB: ${dbItems.length}`);

  // Find all items not in cicr-inventory.vercel.app
  const mockItems = dbItems.filter(i => !webNames.has(i.name.toLowerCase().trim()));
  console.log(`Found ${mockItems.length} mock items to remove:`);
  mockItems.forEach(i => console.log(` - ${i.name} (${i.sku})`));

  for (const m of mockItems) {
    const { error: delErr } = await supabase.from('inventory_items').delete().eq('id', m.id);
    if (delErr) console.error(`Error deleting ${m.name}:`, delErr.message);
    else console.log(`Deleted mock item: ${m.name}`);
  }

  // 2. Clear any test/mock borrow requests
  const { error: reqErr } = await supabase.from('borrow_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (reqErr) console.error('Error clearing mock requests:', reqErr);
  else console.log('Cleared mock borrow requests (Active loans reset to 0)');

  // 3. Clear mock activity logs
  const { error: logErr } = await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (logErr) console.error('Error clearing mock logs:', logErr);
  else console.log('Cleared mock activity logs');

  // 4. Verify final items
  const { data: finalItems } = await supabase.from('inventory_items').select('*');
  console.log(`Final items count in DB: ${finalItems.length}`);
  const totalQty = finalItems.reduce((acc, i) => acc + (i.total_qty || 0), 0);
  const availQty = finalItems.reduce((acc, i) => acc + (i.available_qty || 0), 0);
  console.log(`Total Assets: ${totalQty}, Available: ${availQty}`);
}

clean().catch(console.error);

