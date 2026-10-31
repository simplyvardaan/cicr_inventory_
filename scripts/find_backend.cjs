const fs = require('fs');
const js = fs.readFileSync('scripts/_assets_index_DRfbHtwr_js.js', 'utf8');

// Find all matches around 5000/api or /api or fetch or axios or supabase
const matches = [...js.matchAll(/(\w+API|\w+_URL|baseURL|apiUrl|apiEndpoint|VITE_\w+)\s*[:=]\s*["'`]([^"'`]+)["'`]/g)];
console.log('API config matches:');
matches.forEach(m => console.log(m[0]));

// Let's find context around '5000/api' or 'onrender' or 'supabase'
const idx = js.indexOf(':5000/api');
if (idx !== -1) {
  console.log('Context around :5000/api:');
  console.log(js.slice(idx - 300, idx + 400));
}

// Also check for onrender
const renderIdx = js.indexOf('onrender.com');
if (renderIdx !== -1) {
  console.log('Context around onrender.com:');
  console.log(js.slice(renderIdx - 200, renderIdx + 300));
}

// Also check for neon.tech
const neonIdx = js.indexOf('neon.tech');
if (neonIdx !== -1) {
  console.log('Context around neon.tech:');
  console.log(js.slice(neonIdx - 200, neonIdx + 300));
}

// Check for items endpoint e.g. /components or /inventory or /items
const endpointMatches = [...js.matchAll(/["'`](\/(api\/)?[a-zA-Z0-9_\-\/]+)["'`]/g)].map(m => m[1]);
console.log('Endpoints found:', [...new Set(endpointMatches)].filter(e => e.includes('item') || e.includes('comp') || e.includes('inv') || e.includes('product') || e.includes('hardware')));

