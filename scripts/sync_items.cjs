const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { loadEnv } = require('./loadEnv.cjs');

const { supabaseUrl, serviceRoleKey } = loadEnv();
const supabase = createClient(supabaseUrl, serviceRoleKey);

const raw = JSON.parse(fs.readFileSync('scripts/fetched_items.json', 'utf8'));
const items = raw.data || raw;

function getCategoryMapping(cat) {
  switch (cat) {
    case 'Controllers':
      return 'Microcontrollers & SBCs';
    case 'Sensors':
      return 'Sensors & Modules';
    case 'Actuators':
      return 'Motors & Drivers';
    case 'Power':
      return 'Power & Batteries';
    case 'Tools':
      return 'Tools & Fabrication';
    default:
      return cat;
  }
}

function getPrefix(cat) {
  switch (cat) {
    case 'Controllers': return 'MCU';
    case 'Sensors': return 'SEN';
    case 'Actuators': return 'ACT';
    case 'Power': return 'PWR';
    case 'Tools': return 'TOOL';
    default: return 'GEN';
  }
}

async function sync() {
  console.log(`Syncing ${items.length} components from cicr-inventory.vercel.app to Supabase...`);

  // Fetch existing items from Supabase
  const { data: existingItems } = await supabase.from('inventory_items').select('id, name, sku');
  const existingMap = new Map();
  if (existingItems) {
    existingItems.forEach(i => {
      existingMap.set(i.name.toLowerCase().trim(), i);
    });
  }

  let added = 0;
  let updated = 0;

  for (let idx = 0; idx < items.length; idx++) {
    const it = items[idx];
    const cat = getCategoryMapping(it.category);
    const sku = `CICR-${getPrefix(it.category)}-${String(idx + 1).padStart(3, '0')}`;
    const totalQty = it.quantity || 1;
    const availQty = it.available_quantity !== undefined ? it.available_quantity : totalQty;
    const minThreshold = Math.max(1, Math.round(totalQty * 0.2));
    const status = availQty <= 0 ? 'Out of Stock' : availQty <= minThreshold ? 'Low Stock' : 'In Stock';

    const payload = {
      name: it.name.trim(),
      category: cat,
      description: it.description || '',
      location: it.location || 'CICR Lab',
      total_qty: Number(totalQty),
      available_qty: Number(availQty),
      min_threshold: Number(minThreshold),
      condition: 'Good',
      status: status,
      image_url: it.image ? (it.image.startsWith('http') ? it.image : `https://cicr-inventory.vercel.app/${it.image}`) : null,
    };

    const existing = existingMap.get(it.name.toLowerCase().trim());
    if (existing) {
      const { error } = await supabase
        .from('inventory_items')
        .update(payload)
        .eq('id', existing.id);
      if (error) console.error('Update error:', it.name, error.message);
      else updated++;
    } else {
      payload.sku = sku;
      const { error } = await supabase
        .from('inventory_items')
        .insert([payload]);
      if (error) console.error('Insert error:', it.name, error.message);
      else added++;
    }
  }

  console.log(`Finished syncing! Added: ${added}, Updated: ${updated}, Total: ${items.length}`);
}

sync().catch(console.error);

