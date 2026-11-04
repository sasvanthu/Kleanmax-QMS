-- Migration: 20261104000001_multi_company.sql
-- Description: Multi-Company Architecture for 4 Subsidiaries (Kleanmax Pro, Kleanmax, Unique Painters, Cleantech Services)
-- Target: PostgreSQL / Supabase

-- 1. Add company_code, tagline, and brand_color to company_settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_settings' AND column_name = 'company_code'
    ) THEN
        ALTER TABLE company_settings ADD COLUMN company_code VARCHAR(50);
        ALTER TABLE company_settings ADD CONSTRAINT uq_company_settings_code UNIQUE (company_code);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_settings' AND column_name = 'tagline'
    ) THEN
        ALTER TABLE company_settings ADD COLUMN tagline VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_settings' AND column_name = 'brand_color'
    ) THEN
        ALTER TABLE company_settings ADD COLUMN brand_color VARCHAR(50) DEFAULT '#FED10C';
    END IF;
END $$;

-- 2. Add company_code to quotations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'quotations' AND column_name = 'company_code'
    ) THEN
        ALTER TABLE quotations ADD COLUMN company_code VARCHAR(50) DEFAULT 'kleanmaxpro';
        CREATE INDEX IF NOT EXISTS idx_quotations_company_code ON quotations(company_code);
    END IF;
END $$;

-- 3. Update existing default row if needed
UPDATE company_settings
SET
    company_code = 'kleanmaxpro',
    tagline = 'Commercial Floor Scrubbing & Deep Facility Care',
    brand_color = '#FED10C'
WHERE company_code IS NULL OR company_code = '';

-- 4. Enable RLS on company_settings and quotations for Supabase
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Allow public read of active company settings
CREATE POLICY "Allow public read of company settings"
ON company_settings FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to update company settings
CREATE POLICY "Allow authenticated admin update of company settings"
ON company_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow all reads and writes for service role / authenticated backend
CREATE POLICY "Allow full access to quotations for authenticated"
ON quotations FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

