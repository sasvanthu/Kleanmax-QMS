-- Klean Max Pro — Smart Quotation Automation System
-- Database Migration: Initial Schema
-- Target: PostgreSQL / Supabase

-- 1. PROFILES (extends Supabase auth.users or standalone auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. COMPANY_SETTINGS (singleton or multi-branch company profile)
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'Klean Max Pro',
    legal_name VARCHAR(255) NOT NULL DEFAULT 'Klean Max Pro Commercial Services',
    gstin VARCHAR(15),
    pan VARCHAR(10),
    cin VARCHAR(30),
    address_line1 VARCHAR(255) NOT NULL DEFAULT '6, Jayam Industrial Estate, Chettyar Agaram 1st St',
    address_line2 VARCHAR(255) DEFAULT 'Opp to Ishwarya Apts, Vanagaram',
    city VARCHAR(100) NOT NULL DEFAULT 'Chennai',
    state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
    state_code VARCHAR(2) NOT NULL DEFAULT '33',
    pincode VARCHAR(20) NOT NULL DEFAULT '600095',
    phone1 VARCHAR(50) DEFAULT '+91 73388 82034',
    phone2 VARCHAR(50) DEFAULT '+91 97101 48218',
    email VARCHAR(255) DEFAULT 'info@kleanmaxpro.com',
    website VARCHAR(255) DEFAULT 'www.kleanmaxpro.com',
    bank_name VARCHAR(255) DEFAULT 'HDFC Bank',
    bank_account_no VARCHAR(100) DEFAULT '50200012345678',
    bank_ifsc VARCHAR(50) DEFAULT 'HDFC0001234',
    bank_branch VARCHAR(255) DEFAULT 'Porur, Chennai',
    logo_url VARCHAR(500) DEFAULT '/static/logo.png',
    quotation_prefix VARCHAR(20) DEFAULT 'KMP',
    default_validity_days INTEGER DEFAULT 30,
    rounding_policy VARCHAR(50) DEFAULT 'HALF_UP', -- 'HALF_UP', 'ROUND_UP', 'ROUND_DOWN'
    default_payment_terms TEXT DEFAULT '100% advance along with confirmed work order, or 50% advance and balance on completion.',
    default_delivery_terms TEXT DEFAULT 'Work will commence within 3-5 business days of advance receipt and site clearance.',
    default_warranty_terms TEXT DEFAULT 'Standard workmanship warranty of 30 days on deep cleaning services. Equipment as per OEM warranty terms.',
    terms_and_conditions TEXT DEFAULT '1. Rates quoted are valid for 30 days from the quotation date.\n2. Water and electricity required for cleaning work to be supplied by customer at site.\n3. GST is applicable as per government regulations.\n4. Disputes subject to Chennai jurisdiction.',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(50) UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    gstin VARCHAR(15),
    pan VARCHAR(10),
    billing_address_line1 VARCHAR(255) NOT NULL,
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100) NOT NULL DEFAULT 'Chennai',
    billing_state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
    billing_state_code VARCHAR(2) NOT NULL DEFAULT '33',
    billing_pincode VARCHAR(20) NOT NULL,
    delivery_address_line1 VARCHAR(255),
    delivery_address_line2 VARCHAR(255),
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(100),
    delivery_state_code VARCHAR(2),
    delivery_pincode VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SERVICES
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_code VARCHAR(50) NOT NULL UNIQUE,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('cleaning', 'painting', 'equipment_sales', 'spare_parts', 'repair_service', 'rental', 'amc')),
    quotation_type VARCHAR(50) NOT NULL DEFAULT 'area_based' CHECK (quotation_type IN ('area_based', 'item_based', 'repair_service', 'rental', 'contract')),
    description TEXT,
    default_uom VARCHAR(50) NOT NULL DEFAULT 'sq_ft' CHECK (default_uom IN ('sq_ft', 'sq_m', 'nos', 'hours', 'days', 'months', 'sets')),
    hsn_sac_code VARCHAR(20) DEFAULT '998533',
    standard_rate NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    tax_category VARCHAR(50) NOT NULL DEFAULT 'taxable' CHECK (tax_category IN ('taxable', 'exempt', 'nil_rated')),
    default_tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SERVICE_RATES (Historical and tiered rate records)
CREATE TABLE IF NOT EXISTS service_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    uom VARCHAR(50) NOT NULL DEFAULT 'sq_ft',
    rate NUMERIC(14, 4) NOT NULL,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    min_area NUMERIC(14, 4),
    max_area NUMERIC(14, 4),
    created_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. QUOTATIONS
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number VARCHAR(100) NOT NULL,
    revision_number INTEGER NOT NULL DEFAULT 0,
    parent_quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    quotation_type VARCHAR(50) NOT NULL DEFAULT 'area_based' CHECK (quotation_type IN ('area_based', 'item_based', 'repair_service', 'rental', 'contract')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'issued', 'revised', 'cancelled')),
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    validity_date DATE NOT NULL,
    customer_ref VARCHAR(100),
    job_description TEXT,
    payment_terms TEXT,
    delivery_terms TEXT,
    warranty_terms TEXT,
    terms_and_conditions TEXT,
    notes TEXT,
    
    -- Financials (All stored authoritative Decimals)
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    discount_type VARCHAR(50) NOT NULL DEFAULT 'none' CHECK (discount_type IN ('none', 'percentage', 'fixed')),
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
    
    prepared_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    issued_at TIMESTAMPTZ,
    snapshot_json JSONB, -- Full frozen snapshot when issued
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_quotation_revision UNIQUE (quotation_number, revision_number)
);

-- 7. QUOTATION_SECTIONS (For area-based multiple rectangular sections)
CREATE TABLE IF NOT EXISTS quotation_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    section_name VARCHAR(255) NOT NULL,
    section_order INTEGER NOT NULL DEFAULT 1,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    service_name VARCHAR(255) NOT NULL,
    length NUMERIC(14, 4) NOT NULL CHECK (length > 0),
    breadth NUMERIC(14, 4) NOT NULL CHECK (breadth > 0),
    measurement_unit VARCHAR(20) NOT NULL DEFAULT 'ft' CHECK (measurement_unit IN ('ft', 'm', 'sq_ft', 'sq_m')),
    calculated_area NUMERIC(14, 4) NOT NULL CHECK (calculated_area >= 0),
    repetitions INTEGER NOT NULL DEFAULT 1 CHECK (repetitions >= 1),
    billable_area NUMERIC(14, 4) NOT NULL CHECK (billable_area >= 0),
    billable_uom VARCHAR(20) NOT NULL DEFAULT 'sq_ft' CHECK (billable_uom IN ('sq_ft', 'sq_m')),
    rate_source VARCHAR(50) NOT NULL DEFAULT 'catalogue' CHECK (rate_source IN ('catalogue', 'manual_override')),
    original_catalogue_rate NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    applied_rate NUMERIC(14, 4) NOT NULL CHECK (applied_rate >= 0),
    override_reason TEXT,
    override_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    override_at TIMESTAMPTZ,
    discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    line_total NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. QUOTATION_ITEMS (For item-based, spare parts, equipment sales, rental units)
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    section_id UUID REFERENCES quotation_sections(id) ON DELETE SET NULL,
    item_order INTEGER NOT NULL DEFAULT 1,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    item_code VARCHAR(100),
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    hsn_sac VARCHAR(20),
    quotation_type VARCHAR(50) NOT NULL DEFAULT 'area_based',
    quantity NUMERIC(14, 4) NOT NULL DEFAULT 1.0000 CHECK (quantity > 0),
    uom VARCHAR(50) NOT NULL DEFAULT 'nos',
    unit_price NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    rate_source VARCHAR(50) NOT NULL DEFAULT 'catalogue' CHECK (rate_source IN ('catalogue', 'manual_override')),
    original_catalogue_rate NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    applied_rate NUMERIC(14, 4) NOT NULL CHECK (applied_rate >= 0),
    override_reason TEXT,
    override_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    override_at TIMESTAMPTZ,
    discount_type VARCHAR(50) NOT NULL DEFAULT 'none',
    discount_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    taxable_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    cgst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    sgst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    igst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    line_total NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. QUOTATION_REVISIONS (Tracks full audit snapshot when revising)
CREATE TABLE IF NOT EXISTS quotation_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL,
    previous_quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    revised_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    revision_reason TEXT NOT NULL,
    snapshot_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    performed_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    changes_json JSONB,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. QUOTATION_COUNTERS (Atomic database-backed numbering to prevent collisions)
CREATE TABLE IF NOT EXISTS quotation_counters (
    fiscal_year VARCHAR(20) PRIMARY KEY,
    last_sequence INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(quotation_date);
CREATE INDEX IF NOT EXISTS idx_quotation_sections_quotation_id ON quotation_sections(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ROW LEVEL SECURITY (Supabase RLS enablement)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_counters ENABLE ROW LEVEL SECURITY;

-- POLICIES (Allow authenticated application access and backend service role full access)
CREATE POLICY "Public read company settings" ON company_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Authenticated users can read customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert/update customers" ON customers FOR ALL USING (true);
CREATE POLICY "Authenticated users can read services" ON services FOR SELECT USING (true);
CREATE POLICY "Authenticated users can read service rates" ON service_rates FOR SELECT USING (true);
CREATE POLICY "Authenticated users can read quotations" ON quotations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert/update quotations" ON quotations FOR ALL USING (true);
CREATE POLICY "Authenticated users can read quotation sections" ON quotation_sections FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert/update sections" ON quotation_sections FOR ALL USING (true);
CREATE POLICY "Authenticated users can read quotation items" ON quotation_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert/update items" ON quotation_items FOR ALL USING (true);
CREATE POLICY "Authenticated users can read revisions" ON quotation_revisions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can read audit logs" ON audit_logs FOR SELECT USING (true);
