const fs = require('fs');
const js = fs.readFileSync('scripts/_assets_index_DRfbHtwr_js.js', 'utf8');

// Search for all occurrences of `${T}` or `${E}` or `/api/`
const apiCalls = [...js.matchAll(/[`"']\$\{[TE]\}\/([^`"']+)`|["']\/api\/([^"']+)["']/g)];
console.log('API routes:');
apiCalls.forEach(m => console.log(m[1] || m[2]));

// Let's also search for functions that make requests
const matches = [...js.matchAll(/fetch\s*\(\s*`\$\{[^}]+\}\/([^`]+)`/g)];
matches.forEach(m => console.log('Fetch route:', m[1]));

