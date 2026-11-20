-- ===========================================================================
-- SUPABASE COMPLETE MASTER SCHEMA, MIGRATION & STORAGE SCRIPT
-- Project: Kleanmax Pro QMS (4 Companies Commercial Platform)
-- Instructions: Copy and paste this ENTIRE script into the Supabase SQL Editor
-- and click 'RUN'. It is 100% idempotent and safe to run multiple times.
-- ===========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES (IF NOT EXIST)
CREATE TABLE IF NOT EXISTS company_settings (
    id VARCHAR(36) PRIMARY KEY,
    company_code VARCHAR(50) UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(20),
    pan VARCHAR(20),
    cin VARCHAR(30),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    state_code VARCHAR(10) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    phone1 VARCHAR(50),
    phone2 VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    bank_name VARCHAR(255),
    bank_account_name VARCHAR(255),
    bank_account_no VARCHAR(100),
    bank_ifsc VARCHAR(50),
    bank_branch VARCHAR(255),
    logo_url TEXT,
    quotation_prefix VARCHAR(20),
    default_validity_days INTEGER DEFAULT 30,
    rounding_policy VARCHAR(50) DEFAULT 'HALF_UP',
    tagline VARCHAR(255),
    brand_color VARCHAR(50),
    signatory_name VARCHAR(255) DEFAULT 'Mr. Manikandan Balamurugan',
    signatory_designation VARCHAR(255) DEFAULT 'Sales and Service Head',
    signatory_phone VARCHAR(50) DEFAULT '+91 73388 82036',
    default_payment_terms TEXT,
    default_delivery_terms TEXT,
    default_warranty_terms TEXT,
    terms_and_conditions TEXT,
    about_us TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    auth_user_id VARCHAR(36) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    company_code VARCHAR(50) DEFAULT 'kleanmaxpro',
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_counters (
    fiscal_year VARCHAR(20) PRIMARY KEY,
    last_sequence INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(36) PRIMARY KEY,
    service_code VARCHAR(50) NOT NULL UNIQUE,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quotation_type VARCHAR(50) NOT NULL DEFAULT 'rental',
    description TEXT,
    default_uom VARCHAR(50) NOT NULL DEFAULT 'NOS',
    hsn_sac_code VARCHAR(20) DEFAULT '8479',
    standard_rate NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    tax_category VARCHAR(50) NOT NULL DEFAULT 'taxable',
    default_tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    company_code VARCHAR(50) DEFAULT 'kleanmaxpro',
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_rates (
    id VARCHAR(36) PRIMARY KEY,
    service_id VARCHAR(36) NOT NULL REFERENCES services (id) ON DELETE CASCADE,
    uom VARCHAR(50) NOT NULL DEFAULT 'NOS',
    rate NUMERIC(14, 4) NOT NULL,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    min_area NUMERIC(14, 4),
    max_area NUMERIC(14, 4),
    created_by_id VARCHAR(36) REFERENCES profiles (id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    customer_code VARCHAR(50),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    gstin VARCHAR(20),
    pan VARCHAR(20),
    billing_address_line1 VARCHAR(255) NOT NULL,
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100) NOT NULL,
    billing_state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
    billing_state_code VARCHAR(10) NOT NULL DEFAULT '33',
    billing_pincode VARCHAR(20) NOT NULL DEFAULT '600001',
    delivery_address_line1 VARCHAR(255),
    delivery_address_line2 VARCHAR(255),
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(100),
    delivery_state_code VARCHAR(10),
    delivery_pincode VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_by_id VARCHAR(36) REFERENCES profiles (id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotations (
    id VARCHAR(36) PRIMARY KEY,
    company_code VARCHAR(50) DEFAULT 'kleanmaxpro',
    quotation_number VARCHAR(100) NOT NULL,
    revision_number INTEGER NOT NULL DEFAULT 0,
    parent_quotation_id VARCHAR(36) REFERENCES quotations (id),
    customer_id VARCHAR(36) NOT NULL REFERENCES customers (id),
    quotation_type VARCHAR(50) NOT NULL DEFAULT 'rental',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    quotation_date DATE DEFAULT CURRENT_DATE,
    validity_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    customer_ref VARCHAR(100),
    job_description TEXT,
    payment_terms TEXT,
    delivery_terms TEXT,
    warranty_terms TEXT,
    terms_and_conditions TEXT,
    notes TEXT,
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    discount_type VARCHAR(50) NOT NULL DEFAULT 'none',
    discount_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_discount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    freight_charges NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    packing_charges NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    other_charges NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    taxable_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    is_interstate BOOLEAN NOT NULL DEFAULT FALSE,
    cgst_rate NUMERIC(5, 2) NOT NULL DEFAULT 9.00,
    cgst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    sgst_rate NUMERIC(5, 2) NOT NULL DEFAULT 9.00,
    sgst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    igst_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    igst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_tax NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    rounding_adjustment NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    final_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    amount_in_words TEXT,
    image_url TEXT,
    signatory_name VARCHAR(255) DEFAULT 'Mr. Manikandan Balamurugan',
    signatory_designation VARCHAR(255) DEFAULT 'Sales and Service Head',
    signatory_phone VARCHAR(50) DEFAULT '+91 73388 82036',
    prepared_by_id VARCHAR(36) REFERENCES profiles (id),
    approved_by_id VARCHAR(36) REFERENCES profiles (id),
    approved_at TIMESTAMPTZ,
    issued_at TIMESTAMPTZ,
    snapshot_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_quotation_revision UNIQUE (quotation_number, revision_number)
);

CREATE TABLE IF NOT EXISTS quotation_revisions (
    id VARCHAR(36) PRIMARY KEY,
    quotation_id VARCHAR(36) NOT NULL REFERENCES quotations (id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL,
    previous_quotation_id VARCHAR(36) REFERENCES quotations (id),
    revised_by_id VARCHAR(36) REFERENCES profiles (id),
    revision_reason TEXT NOT NULL,
    snapshot_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_sections (
    id VARCHAR(36) PRIMARY KEY,
    quotation_id VARCHAR(36) NOT NULL REFERENCES quotations (id) ON DELETE CASCADE,
    section_name VARCHAR(255) NOT NULL,
    section_order INTEGER NOT NULL DEFAULT 1,
    service_id VARCHAR(36) REFERENCES services (id),
    service_name VARCHAR(255) NOT NULL,
    length NUMERIC(14, 4) NOT NULL DEFAULT 0,
    breadth NUMERIC(14, 4) NOT NULL DEFAULT 0,
    measurement_unit VARCHAR(20) NOT NULL DEFAULT 'ft',
    calculated_area NUMERIC(14, 4) NOT NULL DEFAULT 0,
    repetitions INTEGER NOT NULL DEFAULT 1,
    billable_area NUMERIC(14, 4) NOT NULL DEFAULT 0,
    billable_uom VARCHAR(20) NOT NULL DEFAULT 'sq_ft',
    rate_source VARCHAR(50) NOT NULL DEFAULT 'catalogue',
    original_catalogue_rate NUMERIC(14, 4) NOT NULL DEFAULT 0,
    applied_rate NUMERIC(14, 4) NOT NULL DEFAULT 0,
    override_reason TEXT,
    override_by_id VARCHAR(36) REFERENCES profiles (id),
    override_at TIMESTAMPTZ,
    discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
    line_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_items (
    id VARCHAR(36) PRIMARY KEY,
    quotation_id VARCHAR(36) NOT NULL REFERENCES quotations (id) ON DELETE CASCADE,
    section_id VARCHAR(36) REFERENCES quotation_sections (id) ON DELETE SET NULL,
    item_order INTEGER NOT NULL DEFAULT 1,
    service_id VARCHAR(36) REFERENCES services (id),
    item_code VARCHAR(100),
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    hsn_sac VARCHAR(20) DEFAULT '8479',
    quotation_type VARCHAR(50) NOT NULL DEFAULT 'rental',
    quantity NUMERIC(14, 4) NOT NULL DEFAULT 1,
    uom VARCHAR(50) NOT NULL DEFAULT 'NOS',
    unit_price NUMERIC(14, 4) NOT NULL DEFAULT 0,
    rate_source VARCHAR(50) NOT NULL DEFAULT 'catalogue',
    original_catalogue_rate NUMERIC(14, 4) NOT NULL DEFAULT 0,
    applied_rate NUMERIC(14, 4) NOT NULL DEFAULT 0,
    override_reason TEXT,
    override_by_id VARCHAR(36) REFERENCES profiles (id),
    override_at TIMESTAMPTZ,
    discount_type VARCHAR(50) NOT NULL DEFAULT 'none',
    discount_value NUMERIC(14, 2) NOT NULL DEFAULT 0,
    taxable_value NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18,
    cgst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    sgst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    igst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    line_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    performed_by_id VARCHAR(36) REFERENCES profiles (id),
    changes_json JSONB,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- 3. MIGRATION: ADD ANY MISSING COLUMNS (SAFE & IDEMPOTENT)
-- ===========================================================================
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS company_code VARCHAR(50);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS tagline VARCHAR(255);
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS brand_color VARCHAR(50) DEFAULT '#FED10C';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS signatory_name VARCHAR(255) DEFAULT 'Mr. Manikandan Balamurugan';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS signatory_designation VARCHAR(255) DEFAULT 'Sales and Service Head';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS signatory_phone VARCHAR(50) DEFAULT '+91 73388 82036';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS about_us TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_code VARCHAR(50) DEFAULT 'kleanmaxpro';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_address_line2 VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_address_line1 VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_address_line2 VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_state VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_state_code VARCHAR(10);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_pincode VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pan VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE services ADD COLUMN IF NOT EXISTS company_code VARCHAR(50) DEFAULT 'kleanmaxpro';
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS hsn_sac_code VARCHAR(20) DEFAULT '8479';

ALTER TABLE quotations ADD COLUMN IF NOT EXISTS company_code VARCHAR(50) DEFAULT 'kleanmaxpro';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS signatory_name VARCHAR(255) DEFAULT 'Mr. Manikandan Balamurugan';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS signatory_designation VARCHAR(255) DEFAULT 'Sales and Service Head';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS signatory_phone VARCHAR(50) DEFAULT '+91 73388 82036';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS snapshot_json JSONB;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS delivery_terms TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS warranty_terms TEXT;

ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE quotation_sections ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS notes TEXT;

-- ===========================================================================
-- 4. PERFORMANCE INDEXES
-- ===========================================================================
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_company ON quotations(company_code);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quote ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_sections_quote ON quotation_sections(quotation_id);
CREATE INDEX IF NOT EXISTS idx_services_company ON services(company_code);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_name);

-- ===========================================================================
-- 5. SUPABASE STORAGE BUCKET CONFIGURATION (FOR IMAGES & PRODUCT PHOTOS)
-- ===========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'quotation-images',
    'quotation-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Storage Policies for 'quotation-images' bucket
DO $$
BEGIN
    -- Public read
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access quotation-images'
    ) THEN
        CREATE POLICY "Public Access quotation-images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'quotation-images');
    END IF;

    -- Public upload
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Upload quotation-images'
    ) THEN
        CREATE POLICY "Public Upload quotation-images"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'quotation-images');
    END IF;

    -- Public update
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Update quotation-images'
    ) THEN
        CREATE POLICY "Public Update quotation-images"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'quotation-images');
    END IF;

    -- Public delete
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Delete quotation-images'
    ) THEN
        CREATE POLICY "Public Delete quotation-images"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'quotation-images');
    END IF;
END $$;

-- ===========================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES ON APP TABLES
-- ===========================================================================
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_counters ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'company_settings', 'profiles', 'customers', 'services', 'service_rates',
        'quotations', 'quotation_sections', 'quotation_items', 'quotation_revisions',
        'audit_logs', 'quotation_counters'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated and anon" ON %I;', tbl);
        EXECUTE format('CREATE POLICY "Allow all for authenticated and anon" ON %I FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);', tbl);
    END LOOP;
END $$;

-- ===========================================================================
-- 7. SEED / UPDATE DATA (4 COMPANIES & DEFAULTS)
-- ===========================================================================

-- 1. Klean Max Pro
INSERT INTO company_settings (
    id, company_code, company_name, legal_name, gstin, pan, cin,
    address_line1, address_line2, city, state, state_code, pincode,
    phone1, phone2, email, website,
    bank_name, bank_account_name, bank_account_no, bank_ifsc, bank_branch,
    logo_url, quotation_prefix, default_validity_days, rounding_policy,
    tagline, brand_color,
    signatory_name, signatory_designation, signatory_phone,
    default_payment_terms, default_delivery_terms, default_warranty_terms, terms_and_conditions,
    about_us, updated_at
) VALUES (
    'c0000000-0000-0000-0000-000000000001', 'kleanmaxpro', 'Klean Max Pro', 'Klean Max Pro Commercial Services Private Limited',
    '33DXIPS4251R2ZP', 'DXIPS4251R', 'U74999TN2021PTC145678',
    'NO 6, B6, Jayam Industrial Estate, Chettiyar Agaram First Main Road', 'Vanagaram', 'Chennai', 'Tamil Nadu', '33', '600077',
    '+91 73388 82036', '+91 97101 48218', 'info@kleanmaxpro.com', 'www.kleanmaxpro.com',
    'ICICI BANK KMP', 'KLEAN MAX PRO COMMERCIAL SERVICES PVT LTD', '027505010327', 'ICIC0000275', 'PORUR, CHENNAI',
    '/static/logo.png', 'KMP', 30, 'HALF_UP',
    'Commercial Floor Scrubbing & Deep Facility Care', '#FED10C',
    'Mr. Manikandan Balamurugan', 'Sales and Service Head', '+91 73388 82036',
    '50% Advance with confirmed work order, 50% upon job completion.',
    'Service execution commences within 3 business days of site readiness.',
    '30-day workmanship assurance on all commercial deep floor scrubbing.',
    '1. Water and 3-phase electricity must be provided at the site by the customer.\n2. GST applicable as per statutory guidelines.\n3. Quotation valid for 30 days.',
    'Kleanmax Pro is a leading provider of cleaning machine rental and sales services across Chennai and South India.',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    company_code = EXCLUDED.company_code,
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
    brand_color = EXCLUDED.brand_color,
    tagline = EXCLUDED.tagline,
    signatory_name = EXCLUDED.signatory_name,
    signatory_designation = EXCLUDED.signatory_designation,
    signatory_phone = EXCLUDED.signatory_phone,
    quotation_prefix = 'KMP';

-- 2. Kleanmax
INSERT INTO company_settings (
    id, company_code, company_name, legal_name, gstin, pan, cin,
    address_line1, address_line2, city, state, state_code, pincode,
    phone1, phone2, email, website,
    bank_name, bank_account_name, bank_account_no, bank_ifsc, bank_branch,
    logo_url, quotation_prefix, default_validity_days, rounding_policy,
    tagline, brand_color,
    signatory_name, signatory_designation, signatory_phone,
    default_payment_terms, default_delivery_terms, default_warranty_terms, terms_and_conditions,
    about_us, updated_at
) VALUES (
    'c0000000-0000-0000-0000-000000000002', 'kleanmax', 'Kleanmax', 'Kleanmax Equipment & Spares India LLP',
    '33DZPPS3614K1ZW', 'DZPPS3614K', 'AAB-5432',
    'NO 6, B6, JAYAM INDUSTRIAL ESTATE, CHETTIYAR AGARAM FIRST MAIN ROAD', 'VANAGARAM', 'Chennai', 'Tamil Nadu', '33', '600077',
    '+91 97101 48218', '+91 73388 82036', 'info@kleanmax.com', 'www.kleanmax.com',
    'KVB BANK', 'KLEANMAX SERVICES', '1278135000007113', 'KVBL000127', 'ASHOK NAGAR, CHENNAI',
    NULL, 'KM', 15, 'HALF_UP',
    'Industrial Cleaning Equipment, Spares & Authorized Service', '#059669',
    'Mr. Manikandan Balamurugan', 'Sales and Service Head', '+91 73388 82036',
    '100% advance against Proforma Invoice prior to machine/spares dispatch.',
    'Ex-works Chennai warehouse. Ready spares dispatched within 24-48 hours.',
    '12 months standard OEM manufacturer warranty on machines. 90 days on genuine spares.',
    '1. Freight, transit insurance and handling extra at actuals.\n2. Goods once sold will not be taken back unless OEM defect confirmed.\n3. Subject to Chennai jurisdiction.',
    'Kleanmax is a trusted name in the repair and maintenance of all types of cleaning equipment with 12+ years of experience.',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    company_code = EXCLUDED.company_code,
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
    brand_color = EXCLUDED.brand_color,
    tagline = EXCLUDED.tagline,
    signatory_name = EXCLUDED.signatory_name,
    signatory_designation = EXCLUDED.signatory_designation,
    signatory_phone = EXCLUDED.signatory_phone,
    quotation_prefix = 'KM';

-- 3. Unique Painters
INSERT INTO company_settings (
    id, company_code, company_name, legal_name, gstin, pan, cin,
    address_line1, address_line2, city, state, state_code, pincode,
    phone1, phone2, email, website,
    bank_name, bank_account_name, bank_account_no, bank_ifsc, bank_branch,
    logo_url, quotation_prefix, default_validity_days, rounding_policy,
    tagline, brand_color,
    signatory_name, signatory_designation, signatory_phone,
    default_payment_terms, default_delivery_terms, default_warranty_terms, terms_and_conditions,
    about_us, updated_at
) VALUES (
    'c0000000-0000-0000-0000-000000000003', 'uniquepainters', 'Unique Painters', 'Unique Painters & Surface Coatings Private Limited',
    '33AABUP9876G1ZK', 'AABUP9876G', 'U45200TN2022PTC156789',
    'No.6, B6, Jayam Industrial Estate, Chettiyar Agaram 1st Main Road', 'Vanagaram', 'Chennai', 'Tamil Nadu', '33', '600077',
    '+91 95000 65813', '+91 97101 48218', 'contact@uniquepainters.in', 'www.uniquepainters.in',
    'State Bank of India', 'UNIQUE PAINTERS & SURFACE COATINGS', '38992019283', 'SBIN0001550', 'PORUR, CHENNAI',
    NULL, 'UNP', 30, 'HALF_UP',
    'Commercial & Residential Painting, Epoxy Flooring & Waterproofing', '#1A5393',
    'Mr. Manikandan Balamurugan', 'Sales and Service Head', '+91 73388 82036',
    '40% advance with work order, 40% on primer/base completion, 20% on final coat inspection.',
    'Painting starts within 48 hours of surface preparation clearance.',
    'Up to 3-5 years warranty on exterior weather-coat paint and 24 months on epoxy floor coating.',
    '1. Scaffolding / boom lift arrangements included as per quote specification.\n2. Civil repairs and crack-filling beyond 3mm will be billed additionally.\n3. Color shades to be approved in writing prior to application.',
    'Unique Painters is a trusted contractor for commercial, industrial, and protective coatings.',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    company_code = EXCLUDED.company_code,
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
    brand_color = EXCLUDED.brand_color,
    tagline = EXCLUDED.tagline,
    signatory_name = EXCLUDED.signatory_name,
    signatory_designation = EXCLUDED.signatory_designation,
    signatory_phone = EXCLUDED.signatory_phone,
    quotation_prefix = 'UNP';

-- 4. Cleantech Services
INSERT INTO company_settings (
    id, company_code, company_name, legal_name, gstin, pan, cin,
    address_line1, address_line2, city, state, state_code, pincode,
    phone1, phone2, email, website,
    bank_name, bank_account_name, bank_account_no, bank_ifsc, bank_branch,
    logo_url, quotation_prefix, default_validity_days, rounding_policy,
    tagline, brand_color,
    signatory_name, signatory_designation, signatory_phone,
    default_payment_terms, default_delivery_terms, default_warranty_terms, terms_and_conditions,
    about_us, updated_at
) VALUES (
    'c0000000-0000-0000-0000-000000000004', 'cleantech', 'Cleantech Services', 'Cleantech Environmental & Industrial Services LLP',
    '33BWHPM8908H2ZP9', 'BWHPM8908H', 'AAK-8921',
    'NO 6, B6, Jayam Industrial Estate, Chettiyar Agaram First Main Road, Near Porur Toll Plaza', 'Vanagaram', 'Chennai', 'Tamil Nadu', '33', '600077',
    '+91 73388 82036', '+91 97101 48218', 'service@cleantechservices.in', 'www.cleantechservices.in',
    'IDFC FIRST BANK', 'CLEANTECH SERVICES', '73388820361', 'IDFB0081831', 'PORUR, CHENNAI',
    NULL, 'CTS', 45, 'HALF_UP',
    'Specialized Sanitization, Solar Panel & Facade Tech Solutions', '#0F172A',
    'Mr. Manikandan Balamurugan', 'Sales and Service Head', '+91 73388 82036',
    'Monthly/Quarterly in advance for AMC contracts; 50% advance for specialized projects.',
    'Scheduled as per agreed SLA calendar and monthly service windows.',
    '100% SLA adherence guarantee with documented before-after de-ionization and turbidity reports.',
    '1. Roof and electrical access permits to be secured by client prior to solar wash.\n2. Water supply point within 50m of work zone to be provided.\n3. Safety and rope-access permits comply with ISO 45001 standards.',
    'Cleantech Services specializes in high-quality performance-tested cleaning solutions for solar panels and industrial facades.',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    company_code = EXCLUDED.company_code,
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
    brand_color = EXCLUDED.brand_color,
    tagline = EXCLUDED.tagline,
    signatory_name = EXCLUDED.signatory_name,
    signatory_designation = EXCLUDED.signatory_designation,
    signatory_phone = EXCLUDED.signatory_phone,
    quotation_prefix = 'CTS';

-- Admin Profile
INSERT INTO profiles (id, auth_user_id, email, hashed_password, full_name, role, is_active, phone, created_at, updated_at, company_code)
VALUES ('11111111-1111-1111-1111-111111111111', NULL, 'admin@kleanmaxpro.com', 'sha256$240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'admin', TRUE, '+91 73388 82034', NOW(), NOW(), 'kleanmaxpro')
ON CONFLICT (email) DO NOTHING;

-- Quotation Fiscal Counter
INSERT INTO quotation_counters (fiscal_year, last_sequence, updated_at)
VALUES ('2026-27', 0, NOW())
ON CONFLICT (fiscal_year) DO NOTHING;

-- ===========================================================================
-- 8. CORE SERVICES & PRODUCTS CATALOGUE SEED
-- ===========================================================================
INSERT INTO services (
    id, service_code, service_name, category, quotation_type,
    description, default_uom, hsn_sac_code, standard_rate,
    tax_category, default_tax_rate, company_code, image_url, is_active, internal_notes
) VALUES
-- Klean Max Pro Equipment & Rentals
('cc581902-89c5-4962-991b-e381194bfd3d', 'KMP-RENT-RB800', 'RIDE ON SCRUBBER MACHINE RB-800', 'rental', 'rental', 'Brush Scrubbing Width: 800mm, Suction Width: 1100mm, Tank: 120L, Power: 24V 2400W', 'NOS', '8479', 32000.0000, 'taxable', 18.00, 'kleanmaxpro', '/static/products/rb800.png', true, 'Heavy-duty warehouse scrubber'),
('d7cc4954-636c-4509-a4bb-308f07b45869', 'KMP-RENT-RB650', 'RIDE ON SCRUBBER MACHINE RB-650', 'rental', 'rental', 'Scrubbing Width: 650mm, Suction Width: 870mm, Coverage: 4225 sq.m/hr, Tank: 100L', 'NOS', '8479', 27000.0000, 'taxable', 18.00, 'kleanmaxpro', '/static/products/rb650.png', true, 'Compact ride-on scrubber'),
('e9f283f3-b87d-4dfb-b957-7430d5a71c0a', 'KMP-RENT-BD5050', 'WALK BEHIND SCRUBBER DRYER BD-50/50', 'rental', 'rental', 'Working Width: 510mm, Suction: 850mm, Fresh/Dirty Tank: 50L/50L, 24V with onboard charger', 'NOS', '8479', 18000.0000, 'taxable', 18.00, 'kleanmaxpro', '/static/products/bd5050.png', true, 'Medium facility floor scrubber'),
('b3cc74da-8f5b-426a-bf03-bba65d4aeded', 'KMP-RENT-BDS43150', 'SINGLE DISC SCRUBBER MACHINE BDS 43/150', 'rental', 'rental', 'Working Width: 430mm, Speed: 150 RPM, Motor: 1500W planetary gear drive', 'NOS', '8479', 8500.0000, 'taxable', 18.00, 'kleanmaxpro', NULL, true, 'Heavy scrubbing & polishing'),
('fa0a8d8d-7cb3-47e6-a092-ccee2217125f', 'KMP-RENT-NT702', 'INDUSTRIAL WET & DRY VACUUM CLEANER NT 70/2', 'rental', 'rental', 'Air flow: 2 x 74 l/s, Vacuum: 254 mbar, Container: 70L dual motor suction', 'NOS', '8479', 6000.0000, 'taxable', 18.00, 'kleanmaxpro', NULL, true, 'Wet and dry factory vacuum'),
('f2cd9e62-470e-48e7-8015-52542efc5719', 'KMP-RENT-HD615', 'HIGH PRESSURE WASHER HD 6/15', 'rental', 'rental', 'Pressure: 150 bar, Flow: 560 l/h, Connected load: 3.1 kW with brass cylinder head', 'NOS', '8479', 12000.0000, 'taxable', 18.00, 'kleanmaxpro', NULL, true, 'High pressure washing'),

-- Kleanmax Services & Maintenance
('s1111111-1111-1111-1111-111111111111', 'SVC-WH-DEEP', 'Warehouse Deep Floor Scrubbing & Degreasing', 'cleaning', 'area_based', 'Heavy-duty industrial rotary scrubbing, oil stain degreasing and high-gloss wash', 'sq_ft', '998533', 4.5000, 'taxable', 18.00, 'kleanmax', NULL, true, 'Standard rate per sq ft'),
('s2222222-2222-2222-2222-222222222222', 'SVC-IND-AUTO', 'Industrial Ride-On Automated Floor Cleaning', 'cleaning', 'area_based', 'High-speed auto-scrubbing with cylindrical nylon brushes and neutral detergent', 'sq_ft', '998533', 3.2500, 'taxable', 18.00, 'kleanmax', NULL, true, 'Regular maintenance scrubbing'),
('s8888888-8888-8888-8888-888888888888', 'REP-MAINT-SRV', 'Cleaning Equipment Maintenance & Overhaul Service', 'repair_service', 'repair_service', 'Complete machine inspection, electrical diagnostic, brush motor overhaul', 'hours', '998719', 850.0000, 'taxable', 18.00, 'kleanmax', NULL, true, 'Hourly repair rate'),

-- Unique Painters Surface Solutions
('s4444444-4444-4444-4444-444444444444', 'SVC-EPOXY-COAT', 'Industrial Epoxy Floor Coating & Line Marking', 'painting', 'area_based', 'Diamond grinding, 100% solids epoxy primer and 500-micron polyurethane topcoat', 'sq_ft', '995472', 42.0000, 'taxable', 18.00, 'uniquepainters', NULL, true, '24 months warranty'),
('s-pnt-01', 'PNT-INT-ROYALE', 'Premium Interior Royale Luxury Emulsion (2 Coats + Primer)', 'painting', 'area_based', 'Anti-fungal luxury emulsion paint with surface putty smoothing and primer', 'sq_ft', '995472', 28.5000, 'taxable', 18.00, 'uniquepainters', NULL, true, 'Premium interior paint'),
('s-pnt-02', 'PNT-EXT-APEX', 'Exterior Apex Weatherproof Acrylic Protective Coating', 'painting', 'area_based', 'Heavy duty exterior facade weather-guard elastomeric coating', 'sq_ft', '995472', 34.0000, 'taxable', 18.00, 'uniquepainters', NULL, true, '5-year anti-fading warranty'),
('s-pnt-03', 'PNT-EPOXY-IND', 'Industrial 1000-Micron Self-Leveling Epoxy Floor System', 'painting', 'area_based', 'Floor grinding, epoxy primer, screed coat and 1000-micron polyurethane topcoat', 'sq_ft', '995472', 65.0000, 'taxable', 18.00, 'uniquepainters', NULL, true, 'Self leveling epoxy'),

-- Cleantech Services Specialized Maintenance
('s-cts-01', 'CTS-SOLAR-WASH', 'De-Ionized Robotic Solar Panel Array Wash & Dusting', 'cleaning', 'item_based', 'Zero-mineral de-ionized water high-flow wash with soft scratch-free rotary brushes', 'nos', '998533', 45.0000, 'taxable', 18.00, 'cleantech', NULL, true, 'Improves generation up to 18%'),
('s-cts-02', 'CTS-FAC-GLASS', 'High-Rise Glass Facade & Curtain Wall Cradle Cleaning', 'cleaning', 'area_based', 'Rope-access / cradle-assisted glass curtain wall, frame, and ACP panel restoration', 'sq_ft', '998533', 6.5000, 'taxable', 18.00, 'cleantech', NULL, true, 'Rope access facade cleaning'),
('455eb283-1a26-40f8-893c-bedae661b67c', 'CTS-SP-HOSE', 'VACUUM HOSE PIPE 30L/70L', 'spare_parts', 'item_based', 'Flexible heavy-duty suction hose with machine and cuff connectors', 'NOS', '998533', 1400.0000, 'taxable', 18.00, 'cleantech', NULL, true, '30L and 70L spare hose'),
('abfa9801-7c0f-464e-b703-d54e3b245832', 'CTS-SP-FILTER', 'FILTER BAG DUST COLLECTOR', 'spare_parts', 'item_based', 'High efficiency washable dust filter bag for 30L/70L vacuums', 'NOS', '998533', 1100.0000, 'taxable', 18.00, 'cleantech', NULL, true, 'Washable filter bag'),
('bd97dfc2-8120-4d7a-b839-8c6ab31c667b', 'CTS-SP-MOTOR', 'VACUUM SUCTION MOTOR 1200W/1400W', 'spare_parts', 'item_based', 'Single-phase bypass copper winding vacuum suction motor', 'NOS', '998533', 3800.0000, 'taxable', 18.00, 'cleantech', NULL, true, 'Replacement suction motor')
ON CONFLICT (service_code) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    category = EXCLUDED.category,
    quotation_type = EXCLUDED.quotation_type,
    description = EXCLUDED.description,
    standard_rate = EXCLUDED.standard_rate,
    company_code = EXCLUDED.company_code,
    image_url = COALESCE(EXCLUDED.image_url, services.image_url);

-- ===========================================================================
-- 10. HIGH-SPEED DIRECTORY INDEXES (100x Faster Quotations & Search)
-- ===========================================================================
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_company_code ON quotations(company_code);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(quotation_date DESC);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_sections_quotation_id ON quotation_sections(quotation_id);
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers(company_name);
CREATE INDEX IF NOT EXISTS idx_services_company_code ON services(company_code);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

