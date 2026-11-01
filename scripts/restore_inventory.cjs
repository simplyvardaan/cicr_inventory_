const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { loadEnv } = require('./loadEnv.cjs');

const { supabaseUrl, serviceRoleKey } = loadEnv();
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase credentials missing.');
}
const supabase = createClient(supabaseUrl, serviceRoleKey);

function getStandardCategory(cat) {
  switch (cat) {
    case 'Controllers':
    case 'Microcontrollers':
    case 'Microcontrollers & SBCs':
      return 'Microcontrollers & SBCs';
    case 'Sensors':
    case 'Sensors & Modules':
      return 'Sensors & Modules';
    case 'Actuators':
    case 'Motors & Drivers':
      return 'Motors & Drivers';
    case 'Power':
    case 'Power & Batteries':
      return 'Power & Batteries';
    case 'Tools':
    case 'Tools & Fabrication':
      return 'Tools & Fabrication';
    default:
      return 'Electronic Components';
  }
}

function getPrefix(cat) {
  switch (cat) {
    case 'Microcontrollers & SBCs': return 'MCU';
    case 'Sensors & Modules': return 'SEN';
    case 'Motors & Drivers': return 'MOT';
    case 'Power & Batteries': return 'PWR';
    case 'Tools & Fabrication': return 'TOOL';
    default: return 'GEN';
  }
}

async function restore() {
  console.log('--- CICR INVENTORY RESTORATION & RETURN ---');
  
  // 1. Fetch fetched_items.json (the 53 authentic components)
  const raw = JSON.parse(fs.readFileSync('scripts/fetched_items.json', 'utf8'));
  const authenticItems = raw.data || raw;
  const authenticNames = new Set(authenticItems.map(i => i.name.toLowerCase().trim()));
  console.log(`Authentic component definitions loaded: ${authenticItems.length}`);

  // 2. Fetch current DB items
  const { data: dbItems, error: fetchErr } = await supabase.from('inventory_items').select('*');
  if (fetchErr) throw fetchErr;
  console.log(`Current items in DB: ${dbItems.length}`);

  // 3. Find mock items
  const mockItems = dbItems.filter(i => !authenticNames.has(i.name.toLowerCase().trim()));
  const realItems = dbItems.filter(i => authenticNames.has(i.name.toLowerCase().trim()));
  console.log(`Identified: ${realItems.length} real components, ${mockItems.length} mock items to remove.`);

  // 4. Safely re-link any borrow requests pointing to mock items (e.g. HC-SR04 -> Ultrasonic Sensor)
  const realUltrasonic = realItems.find(i => i.name.toLowerCase().includes('ultrasonic'));
  if (realUltrasonic) {
    const { error: relinkErr } = await supabase
      .from('borrow_requests')
      .update({
        item_id: realUltrasonic.id,
        item_name: realUltrasonic.name,
      })
      .ilike('item_name', '%HC-SR04%');
    if (relinkErr) console.warn('Warning re-linking borrow request:', relinkErr.message);
    else console.log('Re-linked any HC-SR04 borrow requests to Ultrasonic Sensor.');
  }

  // 5. Delete mock items from Supabase
  for (const mock of mockItems) {
    const { error: delErr } = await supabase.from('inventory_items').delete().eq('id', mock.id);
    if (delErr) console.error(`Error deleting ${mock.name}:`, delErr.message);
    else console.log(`Deleted mock item: ${mock.name} (${mock.sku || 'No SKU'})`);
  }

  // 6. Ensure all borrow requests are marked as returned
  const today = new Date().toISOString().split('T')[0];
  const { error: reqErr } = await supabase
    .from('borrow_requests')
    .update({
      status: 'returned',
      actual_return_date: today,
      admin_notes: 'Returned & Restocked in Laboratory',
      updated_at: new Date().toISOString(),
    })
    .neq('status', 'rejected'); // keep rejected as rejected, mark active/approved as returned

  if (reqErr) console.error('Error updating borrow requests:', reqErr.message);
  else console.log('All non-rejected borrow requests marked as returned.');

  // 7. Update all 53 real components:
  // - Set available_qty = total_qty
  // - status = 'In Stock'
  // - Assign SKU and clean category
  const categoryCounters = {};
  
  for (let idx = 0; idx < authenticItems.length; idx++) {
    const auth = authenticItems[idx];
    const stdCat = getStandardCategory(auth.category);
    const prefix = getPrefix(stdCat);
    categoryCounters[prefix] = (categoryCounters[prefix] || 0) + 1;
    const generatedSku = `CICR-${prefix}-${String(categoryCounters[prefix]).padStart(3, '0')}`;
    const totalQty = auth.quantity || 1;

    const matchedDb = realItems.find(i => i.name.toLowerCase().trim() === auth.name.toLowerCase().trim());
    if (matchedDb) {
      const { error: updateErr } = await supabase
        .from('inventory_items')
        .update({
          sku: matchedDb.sku || generatedSku,
          category: stdCat,
          total_qty: Number(totalQty),
          available_qty: Number(totalQty),
          status: 'In Stock',
          updated_at: new Date().toISOString(),
        })
        .eq('id', matchedDb.id);

      if (updateErr) console.error(`Error updating ${matchedDb.name}:`, updateErr.message);
    }
  }

  // 8. Insert activity log
  try {
    await supabase.from('activity_logs').insert([
      {
        user_name: 'Admin',
        action: 'BATCH_RETURN_ALL',
        details: 'All borrowed hardware components were returned to laboratory stock. Cleaned mock items; restored authentic 53 components with 100% stock available.',
      },
    ]);
    console.log('Logged BATCH_RETURN_ALL to activity_logs.');
  } catch (logErr) {
    console.warn('Logging error:', logErr);
  }

  // 9. Verify final inventory in DB
  const { data: finalItems, error: verifyErr } = await supabase.from('inventory_items').select('*');
  if (verifyErr) throw verifyErr;

  const totalAssets = finalItems.reduce((acc, i) => acc + (i.total_qty || 0), 0);
  const availAssets = finalItems.reduce((acc, i) => acc + (i.available_qty || 0), 0);
  const unreturned = finalItems.filter(i => i.available_qty < i.total_qty);

  console.log('====================================');
  console.log(`Final Components Count: ${finalItems.length} (Target: 53)`);
  console.log(`Total Assets: ${totalAssets} (Target: 172)`);
  console.log(`Available Assets: ${availAssets}`);
  console.log(`Unreturned Items: ${unreturned.length}`);
  console.log('====================================');
}

restore().catch(console.error);

