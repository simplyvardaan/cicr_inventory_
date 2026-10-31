const { createClient } = require('@supabase/supabase-js');
const { loadEnv } = require('./loadEnv.cjs');

const { supabaseUrl, serviceRoleKey } = loadEnv();
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function returnAll() {
  console.log('Returning all components in backend...');
  const { data: items, error: fetchErr } = await supabase.from('inventory_items').select('*');
  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }

  let returnedCount = 0;
  for (const item of items) {
    if (item.available_qty !== item.total_qty || item.status !== 'In Stock') {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          available_qty: item.total_qty,
          status: 'In Stock',
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);
      if (error) {
        console.error('Error updating', item.name, error.message);
      } else {
        console.log(`Successfully returned: ${item.name} (${item.total_qty}/${item.total_qty})`);
        returnedCount++;
      }
    }
  }

  // Update any existing borrow requests to returned
  const { error: reqError } = await supabase
    .from('borrow_requests')
    .update({
      status: 'returned',
      actual_return_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    })
    .eq('status', 'approved');

  if (reqError) console.error('Error updating borrow requests:', reqError.message);
  else console.log('All active loan requests updated to returned in Supabase');

  // Verify
  const { data: verified } = await supabase.from('inventory_items').select('total_qty, available_qty, status');
  const total = verified.reduce((a, b) => a + b.total_qty, 0);
  const avail = verified.reduce((a, b) => a + b.available_qty, 0);
  const unreturned = verified.filter(i => i.available_qty < i.total_qty);
  console.log(`Verified Backend: Total Assets = ${total}, Available = ${avail}, Unreturned = ${unreturned.length}`);
}

returnAll().catch(console.error);

