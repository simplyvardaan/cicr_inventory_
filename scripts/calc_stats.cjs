const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('scripts/fetched_items.json', 'utf8'));
const items = raw.data || raw;

console.log('Total items count:', items.length);

let totalAssets = 0;
let available = 0;
let lowReserves50 = 0;
let lowReservesThreshold = 0;
let depleted = 0;

items.forEach(i => {
  const q = i.quantity || 0;
  const a = i.available_quantity !== undefined ? i.available_quantity : q;
  totalAssets += q;
  available += a;

  if (a > 0 && (a / q) <= 0.5) {
    lowReserves50++;
  }
  if (a <= 0) {
    depleted++;
  }
});

console.log('Calculated Stats on 53 items from cicr-inventory.vercel.app:');
console.log('Total Assets (sum of quantities):', totalAssets);
console.log('Available (sum of available):', available);
console.log('Low Reserves (<= 50% available):', lowReserves50);
console.log('Depleted (0 units in stock):', depleted);

