-- Supabase Database Migration: Remove location column from inventory_items
-- Run this in your Supabase SQL Editor if needed:

DO $$
BEGIN
    -- 1. Make location nullable and default empty string so inserts without location never fail
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'inventory_items' 
          AND column_name = 'location'
    ) THEN
        ALTER TABLE public.inventory_items ALTER COLUMN location DROP NOT NULL;
        ALTER TABLE public.inventory_items ALTER COLUMN location SET DEFAULT '';
    END IF;
END $$;

-- Optional: If you want to permanently drop the column completely from the database:
-- ALTER TABLE public.inventory_items DROP COLUMN IF EXISTS location;

