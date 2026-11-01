-- CICR application schema for Neon failover.
-- Neon has no Supabase auth.uid()/auth.role(), so authentication is handled
-- by the server-side failover API rather than database RLS policies.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  roll_number TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'lead', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  password_reset_required BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

UPDATE profiles
SET status = 'approved'
WHERE status IS NULL;

ALTER TABLE profiles
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sku TEXT UNIQUE,
  description TEXT,
  location TEXT DEFAULT '',
  total_qty INTEGER NOT NULL DEFAULT 1 CHECK (total_qty >= 0),
  available_qty INTEGER NOT NULL DEFAULT 1 CHECK (available_qty >= 0),
  min_threshold INTEGER NOT NULL DEFAULT 2 CHECK (min_threshold >= 0),
  condition TEXT DEFAULT 'Good',
  status TEXT NOT NULL DEFAULT 'In Stock'
    CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock', 'Maintenance')),
  image_url TEXT,
  datasheet_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS borrow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  project_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'overdue')),
  borrow_date DATE,
  expected_return_date DATE NOT NULL,
  actual_return_date DATE,
  approved_by TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  item_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  password_reset_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE auth_users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS inventory_items_category_idx ON inventory_items(category);
CREATE INDEX IF NOT EXISTS borrow_requests_user_id_idx ON borrow_requests(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at DESC);

-- Migration: Make location optional
ALTER TABLE inventory_items ALTER COLUMN location DROP NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN location SET DEFAULT '';
