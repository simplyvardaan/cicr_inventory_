const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('scripts/fetched_items.json', 'utf8'));
const items = raw.data || raw;

console.log('Total fetched items:', items.length);

const categories = [...new Set(items.map(i => i.category))];
console.log('Unique categories:', categories);

items.slice(0, 10).forEach(i => {
  console.log(`[${i.category}] ${i.name} (Qty: ${i.quantity}, Avail: ${i.available_quantity}, Loc: ${i.location})`);
});

