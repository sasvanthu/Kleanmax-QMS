-- =========================================================================
-- KLEANMAX PRO QMS - COMPLETE MASTER SUPABASE POSTGRESQL MIGRATION & SEED
-- =========================================================================
-- This script is 100% idempotent and works on both:
-- 1. Brand new Supabase projects
-- 2. Existing Supabase projects with older tables (adds missing columns automatically)
-- =========================================================================

-- -------------------------------------------------------------------------
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- -------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- STEP 2: CREATE BASE TABLES (IF NOT EXIST)
-- -------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS company_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_code VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    billing_address_line1 VARCHAR(255) NOT NULL,
    billing_city VARCHAR(100) NOT NULL DEFAULT 'Chennai',
    billing_state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
    billing_state_code VARCHAR(10) NOT NULL DEFAULT '33',
    billing_pincode VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    service_code VARCHAR(50) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_rates (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    service_id VARCHAR(36) NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    rate NUMERIC(14, 4) NOT NULL,
    uom VARCHAR(50) NOT NULL DEFAULT 'sq_ft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotations (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    quotation_number VARCHAR(100) NOT NULL,
    revision_number INTEGER NOT NULL DEFAULT 0,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    validity_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotation_sections (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    quotation_id VARCHAR(36) NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    section_name VARCHAR(255) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    length NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    breadth NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    applied_rate NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotation_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    quotation_id VARCHAR(36) NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    applied_rate NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotation_revisions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    quotation_id VARCHAR(36) NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL,
    revision_reason TEXT NOT NULL,
    snapshot_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotation_counters (
    fiscal_year VARCHAR(20) PRIMARY KEY,
    last_sequence INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- STEP 3: DYNAMICALLY ENSURE ALL COLUMNS EXIST (Fixes "column does not exist")
-- -------------------------------------------------------------------------

-- Columns for company_settings
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255) DEFAULT 'KLEAN MAX PRO PRIVATE LIMITED';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS gstin VARCHAR(20);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS pan VARCHAR(20);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS cin VARCHAR(30);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255) DEFAULT 'No. 6, B6, Jayam Industrial Estate';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Chennai';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Tamil Nadu';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS state_code VARCHAR(10) DEFAULT '33';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS pincode VARCHAR(20) DEFAULT '600077';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS phone1 VARCHAR(50);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS phone2 VARCHAR(50);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS bank_account_no VARCHAR(100);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS bank_ifsc VARCHAR(50);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS bank_branch VARCHAR(255);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS quotation_prefix VARCHAR(20) DEFAULT 'KMP';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS default_validity_days INTEGER DEFAULT 30;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS rounding_policy VARCHAR(50) DEFAULT 'HALF_UP';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS tagline VARCHAR(255);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS brand_color VARCHAR(50) DEFAULT '#FED10C';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS default_payment_terms TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS default_delivery_terms TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS default_warranty_terms TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS about_us TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS signatory_name VARCHAR(255) DEFAULT 'Mr. Manikandan Balamurugan';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS signatory_designation VARCHAR(255) DEFAULT 'Sales and Service Head';

-- Columns for profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_user_id VARCHAR(36);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'staff';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_code VARCHAR(50) DEFAULT 'kleanmaxpro';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Columns for customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gstin VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pan VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_address_line2 VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_address_line1 VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_address_line2 VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_state VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_state_code VARCHAR(10);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_pincode VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by_id VARCHAR(36);

-- Columns for services
ALTER TABLE services ADD COLUMN IF NOT EXISTS quotation_type VARCHAR(50) DEFAULT 'area_based';
ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS default_uom VARCHAR(50) DEFAULT 'sq_ft';
ALTER TABLE services ADD COLUMN IF NOT EXISTS uom VARCHAR(50) DEFAULT 'NOS';
ALTER TABLE services ADD COLUMN IF NOT EXISTS hsn_sac_code VARCHAR(50) DEFAULT '998533';
ALTER TABLE services ADD COLUMN IF NOT EXISTS hsn_sac VARCHAR(50);
ALTER TABLE services ADD COLUMN IF NOT EXISTS standard_rate NUMERIC(14, 4) DEFAULT 0.0000;
ALTER TABLE services ADD COLUMN IF NOT EXISTS tax_category VARCHAR(50) DEFAULT 'taxable';
ALTER TABLE services ADD COLUMN IF NOT EXISTS default_tax_rate NUMERIC(5, 2) DEFAULT 18.00;
ALTER TABLE services ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) DEFAULT 18.00;
ALTER TABLE services ADD COLUMN IF NOT EXISTS company_code VARCHAR(50) DEFAULT 'kleanmaxpro';
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Columns for service_rates
ALTER TABLE service_rates ADD COLUMN IF NOT EXISTS rate_type VARCHAR(50) DEFAULT 'standard';
ALTER TABLE service_rates ADD COLUMN IF NOT EXISTS min_quantity NUMERIC(14, 4) DEFAULT 1.0000;
ALTER TABLE service_rates ADD COLUMN IF NOT EXISTS max_quantity NUMERIC(14, 4);
ALTER TABLE service_rates ADD COLUMN IF NOT EXISTS min_area NUMERIC(14, 4);
ALTER TABLE service_rates ADD COLUMN IF NOT EXISTS max_area NUMERIC(14, 4);
ALTER TABLE service_rates ADD COLUMN IF NOT EXISTS effective_from DATE DEFAULT CURRENT_DATE;
ALTER TABLE service_rates ADD COLUMN IF NOT EXISTS effective_to DATE;
ALTER TABLE service_rates ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT TRUE;
ALTER TABLE service_rates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE service_rates ADD COLUMN IF NOT EXISTS created_by_id VARCHAR(36);

-- Columns for quotations
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS company_code VARCHAR(50) DEFAULT 'kleanmaxpro';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS parent_quotation_id VARCHAR(36);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS quotation_type VARCHAR(50) DEFAULT 'area_based';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS customer_ref VARCHAR(100);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS job_description TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS delivery_terms TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS warranty_terms TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS subtotal NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS discount_type VARCHAR(50) DEFAULT 'none';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS discount_value NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS total_discount NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS freight_charges NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS packing_charges NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS other_charges NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS taxable_amount NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS is_interstate BOOLEAN DEFAULT FALSE;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS cgst_rate NUMERIC(5, 2) DEFAULT 9.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS sgst_rate NUMERIC(5, 2) DEFAULT 9.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS igst_rate NUMERIC(5, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS igst_amount NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS total_tax NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS rounding_adjustment NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS final_amount NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS amount_in_words TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS snapshot_json JSONB;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) DEFAULT 18.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS signatory_name VARCHAR(255) DEFAULT 'Mr. Manikandan Balamurugan';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS signatory_designation VARCHAR(255) DEFAULT 'Sales and Service Head';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS prepared_by_id VARCHAR(36);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS approved_by_id VARCHAR(36);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS issued_at TIMESTAMP WITH TIME ZONE;

-- Columns for quotation_sections
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS section_order INTEGER DEFAULT 1;
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS service_id VARCHAR(36);
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS measurement_unit VARCHAR(20) DEFAULT 'ft';
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS calculated_area NUMERIC(14, 4) DEFAULT 0.0000;
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 1;
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS billable_area NUMERIC(14, 4) DEFAULT 0.0000;
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS billable_uom VARCHAR(20) DEFAULT 'sq_ft';
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS rate_source VARCHAR(50) DEFAULT 'catalogue';
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS original_catalogue_rate NUMERIC(14, 4) DEFAULT 0.0000;
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS override_reason TEXT;
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS override_by_id VARCHAR(36);
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS override_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5, 2) DEFAULT 0.00;
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS line_total NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS notes TEXT;

-- Columns for quotation_items
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS section_id VARCHAR(36);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS item_order INTEGER DEFAULT 1;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS service_id VARCHAR(36);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS item_code VARCHAR(100);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS hsn_sac VARCHAR(20);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS quotation_type VARCHAR(50) DEFAULT 'area_based';
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS quantity NUMERIC(14, 4) DEFAULT 1.0000;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS uom VARCHAR(50) DEFAULT 'nos';
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(14, 4) DEFAULT 0.0000;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS rate_source VARCHAR(50) DEFAULT 'catalogue';
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS original_catalogue_rate NUMERIC(14, 4) DEFAULT 0.0000;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS override_reason TEXT;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS override_by_id VARCHAR(36);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS override_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS discount_type VARCHAR(50) DEFAULT 'none';
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS discount_value NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS taxable_value NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) DEFAULT 18.00;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS igst_amount NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS line_total NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS notes TEXT;

-- Columns for quotation_revisions
ALTER TABLE quotation_revisions ADD COLUMN IF NOT EXISTS previous_quotation_id VARCHAR(36);
ALTER TABLE quotation_revisions ADD COLUMN IF NOT EXISTS revised_by_id VARCHAR(36);

-- Columns for audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS performed_by_id VARCHAR(36);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS changes_json JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50);

-- -------------------------------------------------------------------------
-- STEP 4: ENSURE UNIQUE CONSTRAINTS EXIST SAFELY
-- -------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_settings_company_code_key'
    ) THEN
        ALTER TABLE company_settings ADD CONSTRAINT company_settings_company_code_key UNIQUE (company_code);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_service_code_key'
    ) THEN
        ALTER TABLE services ADD CONSTRAINT services_service_code_key UNIQUE (service_code);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_quotation_revision'
    ) THEN
        ALTER TABLE quotations ADD CONSTRAINT uq_quotation_revision UNIQUE (quotation_number, revision_number);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- -------------------------------------------------------------------------
-- STEP 5: PERFORMANCE INDEXES
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_company ON quotations(company_code);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quote ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_sections_quote ON quotation_sections(quotation_id);
CREATE INDEX IF NOT EXISTS idx_services_company ON services(company_code);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_name);

-- -------------------------------------------------------------------------
-- STEP 6: SEED 4 COMPANIES
-- -------------------------------------------------------------------------
INSERT INTO company_settings (
    company_code, company_name, legal_name, gstin, pan, cin,
    address_line1, address_line2, city, state, state_code, pincode,
    phone1, phone2, email, website,
    bank_name, bank_account_name, bank_account_no, bank_ifsc, bank_branch,
    quotation_prefix, default_validity_days, brand_color, tagline, about_us,
    signatory_name, signatory_designation
) VALUES
(
    'kleanmaxpro',
    'Klean Max Pro',
    'KLEAN MAX PRO PRIVATE LIMITED',
    '33AABCK1234F1Z8',
    'AABCK1234F',
    'U74999TN2021PTC145678',
    'No. 6, B6, Jayam Industrial Estate, Near Porur Toll Plaza',
    'Vanagaram',
    'Chennai',
    'Tamil Nadu',
    '33',
    '600077',
    '+91 73388 82036',
    '+91 97101 48218',
    'operations@kleanmaxpro.com',
    'www.kleanmaxpro.com',
    'ICICI BANK',
    'KLEAN MAX PRO PRIVATE LIMITED',
    '027505010327',
    'ICIC0000275',
    'PORUR, CHENNAI',
    'KMP',
    30,
    '#FED10C',
    'Industrial Area Floor Scrubbing & Warehouse Maintenance',
    'Kleanmax Pro is a leading provider of cleaning machine rental and sales services, offering a wide range of equipment — from vacuum cleaners to ride-on scrubbers — to industries, malls, commercial spaces, and facility management companies across Chennai, Bangalore, Hyderabad and Visakhapatnam.',
    'Mr. Manikandan Balamurugan',
    'Sales and Service Head'
),
(
    'kleanmax',
    'Kleanmax',
    'KLEANMAX SERVICES & SPARES',
    '33AABCK1234F1Z8',
    'AABCK1234F',
    'U74999TN2013PTC098765',
    'No. 6, B6, Jayam Industrial Estate, Chettiyar Agaram First Main Road',
    'Near Porur Toll Plaza, Vanagaram',
    'Chennai',
    'Tamil Nadu',
    '33',
    '600077',
    '+91 73388 82036',
    '+91 97101 48218',
    'service@kleanmax.in',
    'www.kleanmaxpro.com',
    'KARUR VYSYA BANK (KVB)',
    'KLEANMAX SERVICES',
    '1278135000007113',
    'KVBL0001278',
    'ASHOK NAGAR, CHENNAI',
    'KLM',
    30,
    '#0284C7',
    'Cleaning Machine Service, Motherboard Repair & Spare Parts',
    'Kleanmax is a trusted name in the repair and maintenance of all types of cleaning equipment — from vacuum cleaners to ride-on scrubbers. With 12+ years of experience since 2013, we operate a fully equipped service center with custom parts fabrication.',
    'Mr. Manikandan Balamurugan',
    'Sales and Service Head'
),
(
    'uniquepainters',
    'Unique Painters',
    'UNIQUE PAINTERS & PROTECTIVE COATINGS',
    '33BWHPM8908H2ZP9',
    'BWHPM8908H',
    'U45200TN2015PTC112233',
    'No. 6, B6, Jayam Industrial Estate, Near Porur Toll Plaza',
    'Vanagaram',
    'Chennai',
    'Tamil Nadu',
    '33',
    '600077',
    '9710148218',
    '7338882034',
    'uniquepainters11@gmail.com',
    'www.uniquepainters.in',
    'INDIAN OVERSEAS BANK',
    'K. SRIDHAR',
    '042802000001234',
    'IOBA0000428',
    'VALASARAVAKKAM, CHENNAI',
    'UNP',
    30,
    '#9333EA',
    'Industrial Epoxy Flooring, Wall Putty & Protective Coatings',
    'Unique Painters is a trusted contractor for commercial, industrial, and protective coatings with over a decade of hands-on expertise in epoxy floor systems and robotic spray coatings.',
    'Mr. Manikandan Balamurugan',
    'Sales and Service Head'
),
(
    'cleantech',
    'Cleantech Services',
    'CLEANTECH SERVICES',
    '33BWHPM8908H2ZP9',
    'BWHPM8908H',
    'U74999TN2018PTC123987',
    'No. 6, B6, Jayam Industrial Estate, Chettiyar Agaram First Main Road',
    'Near Porur Toll Plaza, Vanagaram',
    'Chennai',
    'Tamil Nadu',
    '33',
    '600077',
    '9500065813',
    '+91 73388 82036',
    'cleantechservices11@gmail.com',
    'www.cleantechservices.in',
    'IDFC FIRST BANK',
    'CLEANTECH',
    '73388820361',
    'IDFB0081831',
    'CHENNAI - IYYAPANTHANGAL BRANCH',
    'CTS',
    30,
    '#14B8A6',
    'Rooftop Solar Panel Wash, Glass Facade Cleaning & Scheduled AMC',
    'Cleantech Services specializes in high-quality performance-tested cleaning solutions for solar panels, industrial facades, and periodic AMC maintenance.',
    'Mr. Manikandan Balamurugan',
    'Sales and Service Head'
)
ON CONFLICT (company_code) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    legal_name = EXCLUDED.legal_name,
    gstin = EXCLUDED.gstin,
    pan = EXCLUDED.pan,
    cin = EXCLUDED.cin,
    address_line1 = EXCLUDED.address_line1,
    address_line2 = EXCLUDED.address_line2,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    state_code = EXCLUDED.state_code,
    pincode = EXCLUDED.pincode,
    phone1 = EXCLUDED.phone1,
    phone2 = EXCLUDED.phone2,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    bank_name = EXCLUDED.bank_name,
    bank_account_name = EXCLUDED.bank_account_name,
    bank_account_no = EXCLUDED.bank_account_no,
    bank_ifsc = EXCLUDED.bank_ifsc,
    bank_branch = EXCLUDED.bank_branch,
    quotation_prefix = EXCLUDED.quotation_prefix,
    brand_color = EXCLUDED.brand_color,
    signatory_name = EXCLUDED.signatory_name,
    signatory_designation = EXCLUDED.signatory_designation,
    tagline = EXCLUDED.tagline,
    about_us = EXCLUDED.about_us;

-- -------------------------------------------------------------------------
-- STEP 7: SEED PROFILES & LOGINS
-- -------------------------------------------------------------------------
INSERT INTO profiles (id, email, hashed_password, full_name, role, company_code, is_active)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'superadmin@kleanmaxpro.com',
    'sha256$240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    'Super Admin',
    'admin',
    'all',
    true
),
(
    '11111111-1111-1111-1111-111111111112',
    'admin@kleanmaxpro.com',
    'sha256$240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    'Administrator',
    'admin',
    'all',
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'kleanmaxpro@kleanmaxpro.com',
    'sha256$4b898be2c246f669db6e56b4618e00192e4fc139f4d30c5ec709b1ea61b40974',
    'Klean Max Pro Staff',
    'staff',
    'kleanmaxpro',
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'kleanmax@kleanmax.com',
    'sha256$f551d07c0f1cefb525044439c2c2f219d3637e1df2bb35de79b9b4700d3a772b',
    'Kleanmax Staff',
    'staff',
    'kleanmax',
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'uniquepainters@uniquepainters.com',
    'sha256$b5c8793b567d162d981882d9213bc01b54a2ce87e078a6ff6008ab9e51ffecae',
    'Unique Painters Staff',
    'staff',
    'uniquepainters',
    true
),
(
    '55555555-5555-5555-5555-555555555555',
    'cleantech@cleantech.com',
    'sha256$603d7c2a71f021ad5ffc3e6601438992e1e075051b68cecb7f2cae2d93eecae6',
    'Cleantech Staff',
    'staff',
    'cleantech',
    true
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    company_code = EXCLUDED.company_code,
    is_active = EXCLUDED.is_active;

-- -------------------------------------------------------------------------
-- STEP 8: SEED SERVICES CATALOGUE
-- -------------------------------------------------------------------------
INSERT INTO services (service_code, service_name, category, quotation_type, default_uom, uom, standard_rate, default_tax_rate, tax_rate, company_code, description)
VALUES
-- Klean Max Pro
('KMP-RB800', 'Ride-On Scrubber Dryer RB-800', 'rental', 'rental', 'NOS', 'NOS', 32000.0000, 18.00, 18.00, 'kleanmaxpro', '800mm scrub path, heavy-duty battery operated scrubber for warehouses and factories.'),
('KMP-SP500', 'Single Disc Floor Polisher & Scrubber', 'rental', 'rental', 'NOS', 'NOS', 14500.0000, 18.00, 18.00, 'kleanmaxpro', '17-inch 180 RPM single disc scrubbing machine with water tank and brush.'),
('KMP-HPW150', 'High Pressure Washer 150 Bar', 'rental', 'rental', 'NOS', 'NOS', 12000.0000, 18.00, 18.00, 'kleanmaxpro', 'Triplex plunger pump, heavy duty pressure washer for exterior and machinery wash.'),

-- Kleanmax Services & Spares
('KLM-SVC-MTR', 'Drive Motor & Vacuum Motor Rewinding', 'repair_service', 'repair_service', 'NOS', 'NOS', 4500.0000, 18.00, 18.00, 'kleanmax', 'Complete stator rewinding, bearing replacement and dynamic balancing.'),
('KLM-PCB-REP', 'Scrubber Controller PCB Repair', 'repair_service', 'repair_service', 'NOS', 'NOS', 6800.0000, 18.00, 18.00, 'kleanmax', 'MOSFET diagnosis, trace repair, conformal coating and load testing.'),
('KLM-SPR-SQG', 'Polyurethane Squeegee Blade Set (Front + Rear)', 'spare_parts', 'item_based', 'SET', 'SET', 2850.0000, 18.00, 18.00, 'kleanmax', 'Oil-resistant, tear-resistant PU blades compatible with all standard scrubber models.'),

-- Unique Painters
('UNP-EPX-SLF', 'Self-Leveling Epoxy Flooring (2mm)', 'painting', 'area_based', 'sq_ft', 'sq_ft', 75.0000, 18.00, 18.00, 'uniquepainters', 'Surface grinding, primer, 100% solids epoxy screed and self-leveling topcoat.'),
('UNP-EPX-PRC', 'Heavy Duty Epoxy Screed Mortar (3mm - 5mm)', 'painting', 'area_based', 'sq_ft', 'sq_ft', 110.0000, 18.00, 18.00, 'uniquepainters', 'Industrial high-impact mortar for forklifts and heavy vehicular traffic.'),
('UNP-ROB-PLT', 'Robotic Plastering & Spray Wall Finish', 'painting', 'area_based', 'sq_ft', 'sq_ft', 18.0000, 18.00, 18.00, 'uniquepainters', 'Automated wall plastering and high-efficiency uniform spray coat finish.'),

-- Cleantech Services
('CTS-SOL-ROF', 'Rooftop Solar Panel Automated Wet Wash', 'cleaning', 'area_based', 'sq_ft', 'sq_ft', 2.8000, 18.00, 18.00, 'cleantech', 'Demineralized water wash with soft rotary brush to eliminate soiling loss and boost efficiency.'),
('CTS-GLS-FAC', 'High-Rise Glass & ACP Facade Cleaning', 'cleaning', 'area_based', 'sq_ft', 'sq_ft', 6.5000, 18.00, 18.00, 'cleantech', 'Spider-man facade cleaning with rope access, scaffolding, safety harness and glass polish.')
ON CONFLICT (service_code) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    category = EXCLUDED.category,
    quotation_type = EXCLUDED.quotation_type,
    default_uom = EXCLUDED.default_uom,
    standard_rate = EXCLUDED.standard_rate,
    company_code = EXCLUDED.company_code,
    description = EXCLUDED.description;

-- -------------------------------------------------------------------------
-- STEP 9: CONFIGURE SUPABASE STORAGE BUCKET FOR UPLOADS
-- -------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotation-images', 'quotation-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Allow Public Read Quotation Images'
    ) THEN
        CREATE POLICY "Allow Public Read Quotation Images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'quotation-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Allow Anyone To Upload Quotation Images'
    ) THEN
        CREATE POLICY "Allow Anyone To Upload Quotation Images"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'quotation-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Allow Anyone To Update Quotation Images'
    ) THEN
        CREATE POLICY "Allow Anyone To Update Quotation Images"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'quotation-images');
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
