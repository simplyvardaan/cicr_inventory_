-- Neon backup storage for the CICR Supabase project.
-- This schema stores source rows as JSONB so it remains compatible with
-- Supabase schema changes without exposing database credentials to the client.

CREATE TABLE IF NOT EXISTS backup_runs (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  row_count INTEGER NOT NULL DEFAULT 0,
  error TEXT
);

CREATE TABLE IF NOT EXISTS backup_records (
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  record JSONB NOT NULL,
  source_updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (table_name, record_id)
);

CREATE INDEX IF NOT EXISTS backup_records_table_name_idx
  ON backup_records (table_name);
