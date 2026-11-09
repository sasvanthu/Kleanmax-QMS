-- =========================================================================
-- KLEANMAX PRO QMS - COMPLETE MASTER DATABASE SCHEMA & MIGRATION SCRIPT
-- Compatible with PostgreSQL / Supabase and SQLite
-- =========================================================================

-- 1. EXTENSIONS (PostgreSQL only - ignored in SQLite)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. COMPANY SETTINGS (4 Distinct Companies)
CREATE TABLE IF NOT EXISTS company_settings (
    id VARCHAR(36) PRIMARY KEY,
    company_code VARCHAR(50) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    gstin VARCHAR(20),
    pan VARCHAR(20),
    cin VARCHAR(30),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    state_code VARCHAR(10),
    pincode VARCHAR(20),
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
    quotation_prefix VARCHAR(20) DEFAULT 'KMP',
    default_validity_days INTEGER DEFAULT 30,
    rounding_policy VARCHAR(20) DEFAULT 'HALF_UP',
    tagline VARCHAR(255),
    brand_color VARCHAR(20) DEFAULT '#FED10C',
    default_payment_terms TEXT,
    default_delivery_terms TEXT,
    default_warranty_terms TEXT,
    terms_and_conditions TEXT,
    about_us TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. USER PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'staff', -- 'admin', 'manager', 'sales_executive', 'staff'
    company_code VARCHAR(50) DEFAULT 'kleanmaxpro',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    customer_code VARCHAR(50),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    gstin VARCHAR(20),
    pan VARCHAR(20),
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_state_code VARCHAR(10),
    billing_pincode VARCHAR(20),
    delivery_address_line1 VARCHAR(255),
    delivery_address_line2 VARCHAR(255),
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(100),
    delivery_state_code VARCHAR(10),
    delivery_pincode VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_by_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_id) REFERENCES profiles(id)
);

-- 5. SERVICES & PRODUCTS CATALOGUE
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(36) PRIMARY KEY,
    service_code VARCHAR(50) NOT NULL UNIQUE,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'rental', 'equipment_sales', 'cleaning', 'spare_parts'
    company_code VARCHAR(50) DEFAULT 'kleanmaxpro',
    description TEXT,
    hsn_sac VARCHAR(50),
    standard_rate NUMERIC(12, 4) DEFAULT 0.0000,
    uom VARCHAR(20) DEFAULT 'NOS',
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. SERVICE RATES (Tiered & Multi-UOM)
CREATE TABLE IF NOT EXISTS service_rates (
    id VARCHAR(36) PRIMARY KEY,
    service_id VARCHAR(36) NOT NULL,
    rate_type VARCHAR(50) DEFAULT 'standard',
    rate NUMERIC(12, 4) NOT NULL,
    uom VARCHAR(20) NOT NULL,
    min_quantity NUMERIC(12, 4) DEFAULT 1.0000,
    max_quantity NUMERIC(12, 4),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 7. QUOTATIONS
CREATE TABLE IF NOT EXISTS quotations (
    id VARCHAR(36) PRIMARY KEY,
    company_code VARCHAR(50) DEFAULT 'kleanmaxpro',
    quotation_number VARCHAR(100) NOT NULL,
    revision_number INTEGER DEFAULT 0,
    parent_quotation_id VARCHAR(36),
    customer_id VARCHAR(36) NOT NULL,
    quotation_type VARCHAR(50) DEFAULT 'area_based', -- 'area_based', 'repair_service', 'item_based', 'rental'
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'issued', 'revised', 'cancelled'
    quotation_date DATE NOT NULL,
    validity_date DATE,
    customer_ref VARCHAR(100),
    job_description TEXT,
    payment_terms TEXT,
    delivery_terms TEXT,
    warranty_terms TEXT,
    terms_and_conditions TEXT,
    notes TEXT,
    subtotal NUMERIC(14, 2) DEFAULT 0.00,
    discount_type VARCHAR(20) DEFAULT 'none',
    discount_value NUMERIC(14, 2) DEFAULT 0.00,
    total_discount NUMERIC(14, 2) DEFAULT 0.00,
    freight_charges NUMERIC(14, 2) DEFAULT 0.00,
    packing_charges NUMERIC(14, 2) DEFAULT 0.00,
    other_charges NUMERIC(14, 2) DEFAULT 0.00,
    taxable_amount NUMERIC(14, 2) DEFAULT 0.00,
    is_interstate BOOLEAN DEFAULT FALSE,
    cgst_rate NUMERIC(5, 2) DEFAULT 9.00,
    cgst_amount NUMERIC(14, 2) DEFAULT 0.00,
    sgst_rate NUMERIC(5, 2) DEFAULT 9.00,
    sgst_amount NUMERIC(14, 2) DEFAULT 0.00,
    igst_rate NUMERIC(5, 2) DEFAULT 0.00,
    igst_amount NUMERIC(14, 2) DEFAULT 0.00,
    total_tax NUMERIC(14, 2) DEFAULT 0.00,
    rounding_adjustment NUMERIC(6, 2) DEFAULT 0.00,
    final_amount NUMERIC(14, 2) DEFAULT 0.00,
    amount_in_words TEXT,
    snapshot_json TEXT,
    image_url TEXT,
    prepared_by_id VARCHAR(36),
    approved_by_id VARCHAR(36),
    approved_at TIMESTAMP,
    issued_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (prepared_by_id) REFERENCES profiles(id),
    FOREIGN KEY (approved_by_id) REFERENCES profiles(id)
);

-- 8. QUOTATION SECTIONS (Area Measurements)
CREATE TABLE IF NOT EXISTS quotation_sections (
    id VARCHAR(36) PRIMARY KEY,
    quotation_id VARCHAR(36) NOT NULL,
    section_name VARCHAR(255) NOT NULL,
    section_order INTEGER DEFAULT 1,
    service_id VARCHAR(36),
    service_name VARCHAR(255),
    length NUMERIC(10, 2),
    breadth NUMERIC(10, 2),
    measurement_unit VARCHAR(20) DEFAULT 'FEET',
    calculated_area NUMERIC(12, 4) DEFAULT 0.0000,
    repetitions INTEGER DEFAULT 1,
    billable_area NUMERIC(12, 4) DEFAULT 0.0000,
    billable_uom VARCHAR(20) DEFAULT 'SQFT',
    rate_source VARCHAR(50) DEFAULT 'catalogue',
    original_catalogue_rate NUMERIC(12, 4) DEFAULT 0.0000,
    applied_rate NUMERIC(12, 4) DEFAULT 0.0000,
    override_reason TEXT,
    override_by_id VARCHAR(36),
    override_at TIMESTAMP,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    line_total NUMERIC(14, 2) DEFAULT 0.00,
    notes TEXT,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (override_by_id) REFERENCES profiles(id)
);

-- 9. QUOTATION ITEMS (Line Items & Machine Spares)
CREATE TABLE IF NOT EXISTS quotation_items (
    id VARCHAR(36) PRIMARY KEY,
    quotation_id VARCHAR(36) NOT NULL,
    item_order INTEGER DEFAULT 1,
    service_id VARCHAR(36),
    item_code VARCHAR(50),
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    hsn_sac VARCHAR(50),
    quotation_type VARCHAR(50) DEFAULT 'item_based',
    quantity NUMERIC(10, 4) DEFAULT 1.0000,
    uom VARCHAR(20) DEFAULT 'NOS',
    unit_price NUMERIC(12, 4) DEFAULT 0.0000,
    rate_source VARCHAR(50) DEFAULT 'catalogue',
    original_catalogue_rate NUMERIC(12, 4) DEFAULT 0.0000,
    applied_rate NUMERIC(12, 4) DEFAULT 0.0000,
    override_reason TEXT,
    discount_type VARCHAR(20) DEFAULT 'none',
    discount_value NUMERIC(14, 2) DEFAULT 0.00,
    taxable_value NUMERIC(14, 2) DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    cgst_amount NUMERIC(14, 2) DEFAULT 0.00,
    sgst_amount NUMERIC(14, 2) DEFAULT 0.00,
    igst_amount NUMERIC(14, 2) DEFAULT 0.00,
    line_total NUMERIC(14, 2) DEFAULT 0.00,
    notes TEXT,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- 10. QUOTATION REVISIONS (Audit History)
CREATE TABLE IF NOT EXISTS quotation_revisions (
    id VARCHAR(36) PRIMARY KEY,
    quotation_id VARCHAR(36) NOT NULL,
    revision_number INTEGER NOT NULL,
    revision_reason TEXT NOT NULL,
    snapshot_json TEXT NOT NULL,
    created_by_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES profiles(id)
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by_id VARCHAR(36),
    changes_json TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by_id) REFERENCES profiles(id)
);

-- 12. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_company ON quotations(company_code);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quote ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_sections_quote ON quotation_sections(quotation_id);
CREATE INDEX IF NOT EXISTS idx_services_company ON services(company_code);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_name);

