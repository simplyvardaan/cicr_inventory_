const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { loadEnv } = require('./loadEnv.cjs');

loadEnv();

if (!process.env.NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL is required.');
}

async function initialize() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: true },
  });

  await client.connect();
  try {
    const schema = fs.readFileSync(
      path.resolve(__dirname, '../neon_schema.sql'),
      'utf8'
    );
    await client.query(schema);
    console.log('Neon operational schema initialized successfully.');
  } finally {
    await client.end();
  }
}

initialize().catch((error) => {
  console.error('Neon initialization failed:', error.message);
  process.exitCode = 1;
});
