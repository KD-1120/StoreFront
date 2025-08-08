/*
  # Add missing is_published column to stores table

  1. Changes
    - Add `is_published` boolean column to stores table with default false
    - Update existing stores to have is_published = false by default
  
  2. Security
    - No RLS changes needed as column is just being added to existing table
*/

-- Add the missing is_published column to stores table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE stores ADD COLUMN is_published boolean DEFAULT false;
  END IF;
END $$;