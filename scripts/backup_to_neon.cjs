const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const { loadEnv } = require('./loadEnv.cjs');

const { supabaseUrl, serviceRoleKey } = loadEnv();
const neonDatabaseUrl = process.env.NEON_DATABASE_URL;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}

if (!neonDatabaseUrl) {
  throw new Error('NEON_DATABASE_URL is required.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const neon = new Client({
  connectionString: neonDatabaseUrl,
  ssl: { rejectUnauthorized: true },
});

const sourceTables = [
  { name: 'profiles', updatedColumn: 'updated_at' },
  { name: 'inventory_items', updatedColumn: 'updated_at' },
  { name: 'borrow_requests', updatedColumn: 'updated_at' },
  { name: 'activity_logs', updatedColumn: 'created_at' },
];

const schemaPath = path.resolve(__dirname, '../neon_backup_schema.sql');

async function fetchTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    throw new Error(`Failed to read ${tableName}: ${error.message}`);
  }
  return data || [];
}

async function fetchAuthUsers() {
  const users = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`Failed to read auth users: ${error.message}`);
    }

    users.push(...(data.users || []));
    if (!data.users || data.users.length < perPage) break;
    page += 1;
  }

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    phone: user.phone,
    created_at: user.created_at,
    updated_at: user.updated_at,
    last_sign_in_at: user.last_sign_in_at,
    user_metadata: user.user_metadata,
    app_metadata: user.app_metadata,
    confirmed_at: user.confirmed_at,
  }));
}

async function ensureSchema() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await neon.query(schema);
}

async function syncRecords(tableName, updatedColumn, records) {
  try {
    await neon.query('BEGIN');
    await neon.query('DELETE FROM backup_records WHERE table_name = $1', [tableName]);

    for (const record of records) {
      const recordId = record.id;
      if (!recordId) {
        throw new Error(`A row in ${tableName} is missing its id.`);
      }

      const updatedAt = record[updatedColumn] || null;
      await neon.query(
        `INSERT INTO backup_records
          (table_name, record_id, record, source_updated_at, synced_at)
         VALUES ($1, $2, $3::jsonb, $4, NOW())
         ON CONFLICT (table_name, record_id) DO UPDATE SET
           record = EXCLUDED.record,
           source_updated_at = EXCLUDED.source_updated_at,
           synced_at = EXCLUDED.synced_at`,
        [tableName, String(recordId), JSON.stringify(record), updatedAt]
      );
    }

    await neon.query('COMMIT');
  } catch (error) {
    await neon.query('ROLLBACK');
    throw error;
  }
}

async function backup() {
  await neon.connect();
  await ensureSchema();

  const run = await neon.query(
    `INSERT INTO backup_runs (status) VALUES ('running') RETURNING id`
  );
  const runId = run.rows[0].id;
  let totalRows = 0;

  try {
    for (const table of sourceTables) {
      const records = await fetchTable(table.name);
      await syncRecords(table.name, table.updatedColumn, records);
      totalRows += records.length;
      console.log(`Backed up ${records.length} ${table.name} rows.`);
    }

    const authUsers = await fetchAuthUsers();
    await syncRecords('auth_users', 'updated_at', authUsers);
    totalRows += authUsers.length;
    console.log(`Backed up ${authUsers.length} auth user records (without passwords).`);

    await neon.query(
      `UPDATE backup_runs
       SET status = 'completed', completed_at = NOW(), row_count = $2
       WHERE id = $1`,
      [runId, totalRows]
    );
    console.log(`Neon backup completed: ${totalRows} total rows.`);
  } catch (error) {
    await neon.query(
      `UPDATE backup_runs
       SET status = 'failed', completed_at = NOW(), error = $2
       WHERE id = $1`,
      [runId, error instanceof Error ? error.message : String(error)]
    );
    throw error;
  } finally {
    await neon.end();
  }
}

backup().catch((error) => {
  console.error('Neon backup failed:', error.message);
  process.exitCode = 1;
});
