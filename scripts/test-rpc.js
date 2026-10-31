import { loadEnv } from './loadEnv.js';

const { supabaseUrl, serviceRoleKey } = loadEnv();
const url = `${supabaseUrl}/rest/v1/rpc`;
const serviceKey = serviceRoleKey;

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
}).then(r => console.log('RPC endpoint status:', r.status)).catch(e => console.error(e));

