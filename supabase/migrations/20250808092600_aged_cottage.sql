/*
  # Add settings column to stores table

  1. New Columns
    - `stores.settings` (jsonb, nullable) - Store configuration and customization settings

  2. Changes
    - Add settings column to existing stores table
    - Column allows null values for backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'settings'
  ) THEN
    ALTER TABLE stores ADD COLUMN settings jsonb;
  END IF;
END $$;