const fs = require('fs');

const js = fs.readFileSync('scripts/_assets_index_DRfbHtwr_js.js', 'utf8');

// Let's search for keywords like 'name', 'category', 'location', 'total', 'sku'
console.log('Searching for items in bundle...');

// Let's find matches for objects with name and category
// e.g., name:"...", category:"..."
const regex = /\{[^}]*?name:\s*["']([^"']+)["'][^}]*?\}/g;
let match;
let count = 0;

// Also look for array definitions like =[{id:...
const arrayMatches = [...js.matchAll(/\[\s*\{[^[\]]*?name:\s*["'][^"']+["'][\s\S]*?\}\s*\]/g)];
console.log('Array matches count:', arrayMatches.length);

// Let's write a parser to find the main components list
fs.writeFileSync('scripts/bundle_snippet.txt', js.slice(0, 5000));

// Search for recognizable component names from the screenshot
['Arduino Cables', 'Resistor Box', 'Ignition Wires', 'Potentiometer', 'Relay Module', 'Buck Converter', 'RUN CAM', 'ESP Cables'].forEach(term => {
  const idx = js.indexOf(term);
  console.log(`Term "${term}" found at index:`, idx);
  if (idx !== -1) {
    console.log(`Context around "${term}":`);
    console.log(js.slice(Math.max(0, idx - 150), Math.min(js.length, idx + 300)));
    console.log('---');
  }
});

