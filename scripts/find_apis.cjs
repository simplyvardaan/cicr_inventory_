const fs = require('fs');
const html = fs.readFileSync('scripts/page.html', 'utf8');

['Arduino Cables', 'Resistor Box', 'Ignition Wires', 'Potentiometer', 'Relay Module', 'Buck Converter', 'RUN CAM', 'ESP Cables', 'supabase', 'firebase', 'api'].forEach(term => {
  const idx = html.indexOf(term);
  console.log(`HTML term "${term}" found at index:`, idx);
});

// Look for API endpoints or Supabase URLs or JSON files
const urls = [...html.matchAll(/https?:\/\/[^\s"'<>]+/g)].map(m => m[0]);
console.log('URLs in HTML:', [...new Set(urls)]);

// Also check in bundle for supabase or fetch or api
const js = fs.readFileSync('scripts/_assets_index_DRfbHtwr_js.js', 'utf8');
const jsUrls = [...js.matchAll(/https?:\/\/[^\s"'<>`]+/g)].map(m => m[0]);
console.log('URLs in JS bundle:', [...new Set(jsUrls)].filter(u => !u.includes('w3.org') && !u.includes('schema.org')));

