-- ===========================================================================
-- SUPABASE COMPLETE INITIALIZATION SCHEMA & SEED DATA
-- Project: Kleanmax Pro QMS (4 Companies Commercial Platform)
-- Paste this script in Supabase SQL Editor and click RUN
-- ===========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DDL: TABLES DEFINITIONS


CREATE TABLE IF NOT EXISTS company_settings (
    id VARCHAR(36) PRIMARY KEY,
    company_code VARCHAR(50) UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(15),
    pan VARCHAR(10),
    cin VARCHAR(30),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    phone1 VARCHAR(50),
    phone2 VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    bank_name VARCHAR(255),
    bank_account_no VARCHAR(100),
    bank_ifsc VARCHAR(50),
    bank_branch VARCHAR(255),
    logo_url VARCHAR(500),
    quotation_prefix VARCHAR(20),
    default_validity_days INTEGER DEFAULT 30,
    rounding_policy VARCHAR(50) DEFAULT 'round_to_rupee',
    tagline VARCHAR(255),
    brand_color VARCHAR(50),
    default_payment_terms TEXT,
    default_delivery_terms TEXT,
    default_warranty_terms TEXT,
    terms_and_conditions TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    auth_user_id VARCHAR(36) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
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
    gstin VARCHAR(15),
    pan VARCHAR(10),
    billing_address_line1 VARCHAR(255) NOT NULL,
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100) NOT NULL,
    billing_state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
    billing_state_code VARCHAR(2) NOT NULL DEFAULT '33',
    billing_pincode VARCHAR(20) NOT NULL DEFAULT '600001',
    delivery_address_line1 VARCHAR(255),
    delivery_address_line2 VARCHAR(255),
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(100),
    delivery_state_code VARCHAR(2),
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
    status VARCHAR(50) NOT NULL DEFAULT 'approved',
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
-- 2. SEED DATA (COMPANIES, ADMIN, SERVICES, CUSTOMERS)
-- ===========================================================================

-- SEED: company_settings (4 rows)
INSERT INTO company_settings (id, company_name, legal_name, gstin, pan, cin, address_line1, address_line2, city, state, state_code, pincode, phone1, phone2, email, website, bank_name, bank_account_no, bank_ifsc, bank_branch, logo_url, quotation_prefix, default_validity_days, rounding_policy, default_payment_terms, default_delivery_terms, default_warranty_terms, terms_and_conditions, updated_at, company_code, tagline, brand_color) VALUES ('c0000000-0000-0000-0000-000000000001', 'Klean Max Pro', 'Klean Max Pro Commercial Services Private Limited', '33DXIPS4251R2ZP', 'DXIPS4251R', 'U74999TN2021PTC145678', 'NO 6, B6, Jayam Industrial Estate, Chettiyar Agaram First Main Road', 'Vanagaram', 'Chennai', 'Tamil Nadu', '33', '600077', '+91 73388 82036', '+91 97101 48218', 'info@kleanmaxpro.com', 'www.kleanmaxpro.com', 'ICICI BANK KMP', '027505010327', 'ICIC0000275', 'PORUR', '/static/logo.png', 'KMP', 30, 'HALF_UP', '50% Advance with confirmed work order, 50% upon job completion.', 'Service execution commences within 3 business days of site readiness.', '30-day workmanship assurance on all commercial deep floor scrubbing.', '1. Water and 3-phase electricity must be provided at the site by the customer.
2. GST applicable as per statutory guidelines.
3. Quotation valid for 30 days.', '2026-11-04 05:03:24.282565', 'kleanmaxpro', 'Commercial Floor Scrubbing & Deep Facility Care', '#FED10C') ON CONFLICT DO NOTHING;
INSERT INTO company_settings (id, company_name, legal_name, gstin, pan, cin, address_line1, address_line2, city, state, state_code, pincode, phone1, phone2, email, website, bank_name, bank_account_no, bank_ifsc, bank_branch, logo_url, quotation_prefix, default_validity_days, rounding_policy, default_payment_terms, default_delivery_terms, default_warranty_terms, terms_and_conditions, updated_at, company_code, tagline, brand_color) VALUES ('c0000000-0000-0000-0000-000000000002', 'Kleanmax', 'Kleanmax Equipment & Spares India LLP', '33DZPPS3614K1ZW', 'DZPPS3614K', 'AAB-5432', 'NO 6, B6, JAYAM INDUSTRIAL ESTATE, CHETTIYAR AGARAM FIRST MAIN ROAD', 'VANAGARAM', 'Chennai', 'Tamil Nadu', '33', '600077', '97101 48218', '+91 73388 82036', 'info@kleanmax.com', 'www.kleanmax.com', 'KVB BANK', '1278135000007113', 'KVBL000127', 'ASHOK NAGAR', NULL, 'KLM', 15, 'HALF_UP', '100% advance against Proforma Invoice prior to machine/spares dispatch.', 'Ex-works Chennai warehouse. Ready spares dispatched within 24-48 hours.', '12 months standard OEM manufacturer warranty on machines. 90 days on genuine spares.', '1. Freight, transit insurance and handling extra at actuals.
2. Goods once sold will not be taken back unless OEM defect confirmed.
3. Subject to Chennai jurisdiction.', '2026-11-04 05:03:24.288270', 'kleanmax', 'Industrial Cleaning Equipment, Spares & Authorized Service', '#0284c7') ON CONFLICT DO NOTHING;
INSERT INTO company_settings (id, company_name, legal_name, gstin, pan, cin, address_line1, address_line2, city, state, state_code, pincode, phone1, phone2, email, website, bank_name, bank_account_no, bank_ifsc, bank_branch, logo_url, quotation_prefix, default_validity_days, rounding_policy, default_payment_terms, default_delivery_terms, default_warranty_terms, terms_and_conditions, updated_at, company_code, tagline, brand_color) VALUES ('c0000000-0000-0000-0000-000000000003', 'Unique Painters', 'Unique Painters & Surface Coatings Private Limited', '33AABUP9876G1ZK', 'AABUP9876G', 'U45200TN2022PTC156789', 'Plot No. 14, Industrial Corridor, Ambattur Industrial Estate', 'Near Telephone Exchange', 'Chennai', 'Tamil Nadu', '33', '600058', '+91 94440 88776', '+91 98402 33445', 'contact@uniquepainters.in', 'www.uniquepainters.in', 'State Bank of India', '38992019283', 'SBIN0001550', 'Ambattur Industrial Estate Branch', NULL, 'UNP', 30, 'HALF_UP', '40% advance with work order, 40% on primer/base completion, 20% on final coat inspection.', 'Painting starts within 48 hours of surface preparation clearance.', 'Up to 3-5 years warranty on exterior weather-coat paint and 24 months on epoxy floor coating.', '1. Scaffolding / boom lift arrangements included as per quote specification.
2. Civil repairs and crack-filling beyond 3mm will be billed additionally.
3. Color shades to be approved in writing prior to application.', '2026-11-04 00:50:58', 'uniquepainters', 'Commercial & Residential Painting, Epoxy Flooring & Waterproofing', '#7c3aed') ON CONFLICT DO NOTHING;
INSERT INTO company_settings (id, company_name, legal_name, gstin, pan, cin, address_line1, address_line2, city, state, state_code, pincode, phone1, phone2, email, website, bank_name, bank_account_no, bank_ifsc, bank_branch, logo_url, quotation_prefix, default_validity_days, rounding_policy, default_payment_terms, default_delivery_terms, default_warranty_terms, terms_and_conditions, updated_at, company_code, tagline, brand_color) VALUES ('c0000000-0000-0000-0000-000000000004', 'Cleantech Services', 'Cleantech Environmental & Industrial Services LLP', '33ABWCS8841M1ZA', 'ABWCS8841M', 'AAK-8921', '28, Tech Park Road, Porur Phase II', 'Near Mount Poonamallee High Road', 'Chennai', 'Tamil Nadu', '33', '600116', '+91 73388 82036', '+91 97101 48218', 'service@cleantechservices.in', 'www.cleantechservices.in', 'IDFC BANK', '73388820361', 'IDFB0081831', 'Chennai – Iyyapanthangal Branch', NULL, 'CTS', 45, 'HALF_UP', 'Monthly/Quarterly in advance for AMC contracts; 50% advance for specialized projects.', 'Scheduled as per agreed SLA calendar and monthly service windows.', '100% SLA adherence guarantee with documented before-after de-ionization and turbidity reports.', '1. Roof and electrical access permits to be secured by client prior to solar wash.
2. Water supply point within 50m of work zone to be provided.
3. Safety and rope-access permits comply with ISO 45001 standards.', '2026-11-04 05:03:24.290714', 'cleantech', 'Specialized Sanitization, Solar Panel & Facade Tech Solutions', '#0d9488') ON CONFLICT DO NOTHING;

-- SEED: profiles (2 rows)
INSERT INTO profiles (id, auth_user_id, email, hashed_password, full_name, role, is_active, phone, created_at, updated_at) VALUES ('11111111-1111-1111-1111-111111111111', NULL, 'admin@kleanmaxpro.com', 'sha256$240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'admin', TRUE, '+91 73388 82034', '2026-10-15 04:10:02.276665', '2026-10-15 04:10:02.276665') ON CONFLICT DO NOTHING;
INSERT INTO profiles (id, auth_user_id, email, hashed_password, full_name, role, is_active, phone, created_at, updated_at) VALUES ('7ba4e523-ba6d-4071-b70f-90f1f817ad9a', NULL, 'employee@kleanmaxpro.com', '$2b$12$U.BhZfSwkZprxgv4XLEj5eltlRC.bIyJ8GwOJIoXnyLq0ythc3nrO', 'Staff Employee', 'employee', TRUE, NULL, '2026-11-04 11:23:34.760014', '2026-11-04 11:23:34.760014') ON CONFLICT DO NOTHING;

-- SEED: quotation_counters (1 rows)
INSERT INTO quotation_counters (fiscal_year, last_sequence, updated_at) VALUES ('2026-27', 0, '2026-10-15 04:27:55.042241') ON CONFLICT DO NOTHING;

-- SEED: services (32 rows)
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s1111111-1111-1111-1111-111111111111', 'SVC-WH-DEEP', 'Warehouse Deep Floor Scrubbing & Degreasing', 'cleaning', 'area_based', 'Comprehensive heavy-duty industrial rotary scrubbing, oil stain degreasing, slurry suction and high-gloss neutral wash.', 'sq_ft', '998533', 4.5, 'taxable', 18, TRUE, 'Standard rate per sq ft for warehouse floors up to 50,000 sq ft.', '2026-10-15 04:10:02.285269', '2026-11-04 04:45:15.774580', 'kleanmax') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s2222222-2222-2222-2222-222222222222', 'SVC-IND-AUTO', 'Industrial Ride-On Automated Floor Cleaning', 'cleaning', 'area_based', 'High-speed mechanized auto-scrubbing with cylindrical nylon brushes and eco-friendly industrial cleaning chemical.', 'sq_ft', '998533', 3.25, 'taxable', 18, TRUE, 'Recommended for regular maintenance or large open shop floors.', '2026-10-15 04:10:02.285269', '2026-11-04 04:45:15.774580', 'kleanmax') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s3333333-3333-3333-3333-333333333333', 'SVC-FAC-DUST', 'Factory High-Level Roof Truss & Pipeline Dusting', 'cleaning', 'area_based', 'Safety harness-assisted overhead beam, truss, cable tray and duct cleaning using explosion-proof industrial vacuums.', 'sq_ft', '998533', 5.5, 'taxable', 18, TRUE, 'Rate includes boom lift / scaffolding operator overhead.', '2026-10-15 04:10:02.285269', '2026-11-04 04:45:15.774580', 'kleanmax') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s4444444-4444-4444-4444-444444444444', 'SVC-EPOXY-COAT', 'Industrial Epoxy Floor Coating & Line Marking', 'painting', 'area_based', 'Surface preparation with diamond grinding, 100% solids epoxy primer, intermediate self-leveling coat and 500-micron polyurethane topcoat.', 'sq_ft', '995472', 42, 'taxable', 18, TRUE, 'Warranty 24 months against peeling and delamination.', '2026-10-15 04:10:02.285269', '2026-11-04 04:45:15.774580', 'uniquepainters') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s5555555-5555-5555-5555-555555555555', 'EQ-RIDE-KMP850', 'KMP-850R Industrial Ride-On Scrubber Dryer', 'equipment_sales', 'item_based', '850mm scrub width, 120L solution tank, heavy-duty traction motor, twin disc brushes, maintenance-free AGM battery pack.', 'nos', '84798999', 485000, 'taxable', 18, TRUE, 'OEM 1-year on-site comprehensive warranty included.', '2026-10-15 04:10:02.285269', '2026-10-15 04:10:02.285269', 'kleanmaxpro') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s6666666-6666-6666-6666-666666666666', 'EQ-VAC-WD80', 'KMP Heavy Duty Wet & Dry Industrial Vacuum 80L', 'equipment_sales', 'item_based', '3000W triple bypass motor, stainless steel 80L tilt tank, complete accessory kit for sludge and fine dust extraction.', 'nos', '84798999', 38500, 'taxable', 18, TRUE, 'Popular unit for factory shop floors.', '2026-10-15 04:10:02.285269', '2026-11-04 04:45:15.774580', 'kleanmax') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s7777777-7777-7777-7777-777777777777', 'RNT-RIDE-SCRUB', 'Ride-on Scrubber Daily/Weekly Rental with Operator', 'rental', 'rental', 'Rental of heavy duty ride-on scrubber including trained operator, fuel/battery charge, and standard detergents.', 'days', '997312', 4500, 'taxable', 18, TRUE, 'Minimum 3-day rental period.', '2026-10-15 04:10:02.285269', '2026-10-15 04:10:02.285269', 'kleanmaxpro') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s8888888-8888-8888-8888-888888888888', 'REP-MAINT-SRV', 'Cleaning Equipment Maintenance & Overhaul Service', 'repair_service', 'repair_service', 'Comprehensive machine inspection, electrical diagnostic, brush motor overhaul, vacuum motor sealing and squeegee tuning.', 'hours', '998719', 850, 'taxable', 18, TRUE, 'Spare parts billed separately as per actuals.', '2026-10-15 04:10:02.285269', '2026-11-04 04:45:15.774580', 'kleanmax') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s-pnt-01', 'PNT-INT-ROYALE', 'Premium Interior Royale Luxury Emulsion (2 Coats + Primer)', 'painting', 'area_based', 'High-sheen anti-fungal luxury emulsion paint with surface putty smoothing and alkali-resistant primer.', 'sq_ft', '995472', 28.5, 'taxable', 18, TRUE, NULL, '2026-11-04 00:58:12', '2026-11-04 04:45:15.774580', 'uniquepainters') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s-pnt-02', 'PNT-EXT-APEX', 'Exterior Apex Weatherproof Acrylic Protective Coating', 'painting', 'area_based', 'Heavy duty exterior facade weather-guard elastomeric coating with 5-year anti-fading warranty.', 'sq_ft', '995472', 34, 'taxable', 18, TRUE, NULL, '2026-11-04 00:58:12', '2026-11-04 04:45:15.774580', 'uniquepainters') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s-pnt-03', 'PNT-EPOXY-IND', 'Industrial 1000-Micron Self-Leveling Epoxy Floor System', 'painting', 'area_based', 'Diamond floor grinding, high-adhesion epoxy primer, screed coat, and 1000-micron self-leveling aliphatic polyurethane topcoat.', 'sq_ft', '995472', 65, 'taxable', 18, TRUE, NULL, '2026-11-04 00:58:12', '2026-11-04 04:45:15.774580', 'uniquepainters') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s-pnt-04', 'PNT-DAMP-PROOF', 'Terrace & Parapet Elastomeric Waterproofing Membrane', 'painting', 'area_based', '3-coat fiber-mesh reinforced elastomeric waterproofing coating resistant to standing water and UV.', 'sq_ft', '995472', 48, 'taxable', 18, TRUE, NULL, '2026-11-04 00:58:12', '2026-11-04 04:45:15.774580', 'uniquepainters') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s-pnt-05', 'PNT-TEX-STENCIL', 'Architectural Texture & Metallic Stencil Accent Finish', 'painting', 'area_based', 'Custom decorative textured plaster finish, roller patterns, and metallic glaze finish.', 'sq_ft', '995472', 75, 'taxable', 18, TRUE, NULL, '2026-11-04 00:58:12', '2026-11-04 04:45:15.774580', 'uniquepainters') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s-cts-01', 'CTS-SOLAR-WASH', 'De-Ionized Robotic Solar Panel Array Wash & Dusting', 'cleaning', 'item_based', 'Zero-mineral de-ionized water high-flow wash with soft scratch-free rotary brushes. Improves generation up to 18%.', 'nos', '998533', 45, 'taxable', 18, TRUE, NULL, '2026-11-04 00:58:12', '2026-11-04 04:45:15.774580', 'cleantech') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s-cts-02', 'CTS-FAC-GLASS', 'High-Rise Glass Facade & Curtain Wall Cradle Cleaning', 'cleaning', 'area_based', 'Professional rope-access / cradle-assisted glass curtain wall, frame, and ACP silicone panel restoration.', 'sq_ft', '998533', 6.5, 'taxable', 18, TRUE, NULL, '2026-11-04 00:58:12', '2026-11-04 04:45:15.774580', 'cleantech') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s-cts-03', 'CTS-DUCT-EXHAUST', 'Commercial Kitchen Grease Exhaust Hood & Duct Degreasing', 'cleaning', 'item_based', 'High-temperature caustic steam jetting, baffle filter chemical soak, and duct line fire-hazard grease scraping.', 'nos', '998533', 8500, 'taxable', 18, TRUE, NULL, '2026-11-04 00:58:12', '2026-11-04 04:45:15.774580', 'cleantech') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s-cts-04', 'CTS-AMC-FACILITY', 'Comprehensive Facility Annual Maintenance Contract (AMC)', 'amc', 'contract', 'Periodic scheduled monthly deep sanitization, HVAC duct inspection, and high-pressure exterior washing visits.', 'months', '998533', 22000, 'taxable', 18, TRUE, NULL, '2026-11-04 00:58:12', '2026-11-04 04:45:15.774580', 'cleantech') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('s-cts-05', 'CTS-HIGH-PRESSURE', 'Industrial High-Pressure 250-Bar Jet Surface Washing', 'cleaning', 'area_based', 'Heavy-duty 250-bar cold/hot water jet cleaning for parking bays, oil pits, interlocking paver blocks.', 'sq_ft', '998533', 3.8, 'taxable', 18, TRUE, NULL, '2026-11-04 00:58:12', '2026-11-04 04:45:15.774580', 'cleantech') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('cc581902-89c5-4962-991b-e381194bfd3d', 'KMP-RENT-RB800', 'RIDE ON SCRUBBER MACHINE RB-800', 'rental', 'rental', 'BRUSH SCRUBBING WIDTH - 800mm
SUCTION WIDTH - 1100mm
COVERAGE AREA - 4800M.SQ/HR
WORKING SPEED - 6KM/HR
AIRFLOW RATE - 33L/SEC
VACCUM PRESSURE - 1650MM
POWER - 24V
TOTAL POWER - 2400W
BRUSH MOTOR - 2*550W
VACCUM MOTOR - 550W
PERFORMANCE - 1950 m2/hr
TANK CAPACITY - 120LTRS
DIAMETRE OF BRUSH - 405MM
DRIVER MOTOR POWER - 750MM', 'NOS', '8479', 32000, 'taxable', 18, TRUE, NULL, '2026-11-04T04:07:44.500608', '2026-11-04T04:07:44.500608', 'kleanmaxpro') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('d7cc4954-636c-4509-a4bb-308f07b45869', 'KMP-RENT-RB650', 'RIDE ON SCRUBBER MACHINE RB-650', 'rental', 'rental', 'Scrubbing Width: 650 mm
Suction / Squeegee Width: 870 mm
Theoretical Area Coverage: 4,225 m2/hr
Working Speed: Up to 6.5 km/hr (Travel speed up to 7 km/hr)
Power Supply / Battery: 24 V DC / 200 Ah
Total Power: 1,600 W
Brushes: 2 disc brushes, 333 mm diameter each, running at 180 RPM
Brush Pressure: 25 kg
Solution / Fresh Water Tank: 100 L
Recovery / Dirty Water Tank: 100 L', 'NOS', '8479', 27000, 'taxable', 18, TRUE, NULL, '2026-11-04T04:07:44.500608', '2026-11-04T04:07:44.500608', 'kleanmaxpro') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('e9f283f3-b87d-4dfb-b957-7430d5a71c0a', 'KMP-RENT-BD5050', 'WALK BEHIND SCRUBBER DRYER BD-50/50', 'rental', 'rental', 'Working width brushes: 510 mm
Working width suction: 850 mm
Fresh/dirty water tank: 50 / 50 L
Area performance: 2000 m2/h
Battery powered 24V with onboard charger', 'NOS', '8479', 18000, 'taxable', 18, TRUE, NULL, '2026-11-04T04:07:44.500608', '2026-11-04T04:07:44.500608', 'kleanmaxpro') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('b3cc74da-8f5b-426a-bf03-bba65d4aeded', 'KMP-RENT-BDS43150', 'SINGLE DISC SCRUBBER MACHINE BDS 43/150', 'rental', 'rental', 'Working width: 430 mm
Brush speed: 150 rpm
Motor rating: 1500 W
Heavy-duty planetary gear drive for polishing, stripping and scrubbing', 'NOS', '8479', 8500, 'taxable', 18, TRUE, NULL, '2026-11-04T04:07:44.500608', '2026-11-04T04:07:44.500608', 'kleanmaxpro') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('fa0a8d8d-7cb3-47e6-a092-ccee2217125f', 'KMP-RENT-NT702', 'INDUSTRIAL WET & DRY VACUUM CLEANER NT 70/2', 'rental', 'rental', 'Air flow: 2 x 74 l/s
Vacuum: 254 mbar
Container capacity: 70 L robust plastic tank
Dual high-performance bypass suction motors', 'NOS', '8479', 6000, 'taxable', 18, TRUE, NULL, '2026-11-04T04:07:44.500608', '2026-11-04T04:07:44.500608', 'kleanmaxpro') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('f2cd9e62-470e-48e7-8015-52542efc5719', 'KMP-RENT-HD615', 'HIGH PRESSURE WASHER HD 6/15', 'rental', 'rental', 'Operating pressure: 150 bar
Flow rate: 560 l/h
Connected load: 3.1 kW
Automatic pressure relief and brass cylinder head', 'NOS', '8479', 12000, 'taxable', 18, TRUE, NULL, '2026-11-04T04:07:44.500608', '2026-11-04T04:07:44.500608', 'kleanmaxpro') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('455eb283-1a26-40f8-893c-bedae661b67c', 'CTS-SP-HOSE', 'VACUUM HOSE PIPE 30L/70L', 'spare_parts', 'item_based', 'Flexible heavy-duty suction hose with machine and cuff connectors', 'NOS', '998533', 1400, 'taxable', 18, TRUE, NULL, '2026-11-04 10:37:00.345680', '2026-11-04 10:37:00.345680', 'cleantech') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('abfa9801-7c0f-464e-b703-d54e3b245832', 'CTS-SP-FILTER', 'FILTER BAG DUST COLLECTOR', 'spare_parts', 'item_based', 'High efficiency washable dust filter bag for 30L/70L vacuums', 'NOS', '998533', 1100, 'taxable', 18, TRUE, NULL, '2026-11-04 10:37:00.345680', '2026-11-04 10:37:00.345680', 'cleantech') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('7d8513ef-cdb8-4259-a483-3751e66d1e54', 'CTS-SP-PIPE', 'STAINLESS STEEL EXTENSION WAND / PIPE', 'spare_parts', 'item_based', 'Two-piece chrome-plated steel suction wand rod', 'NOS', '998533', 1870, 'taxable', 18, TRUE, NULL, '2026-11-04 10:37:00.345680', '2026-11-04 10:37:00.345680', 'cleantech') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('15ed376f-b701-40e6-a74c-4ac4e0c5491d', 'CTS-SP-WETTOOL', 'WET FLOOR SQUEEGEE NOZZLE TOOL', 'spare_parts', 'item_based', 'Heavy-duty floor squeegee tool with replaceable rubber blades', 'NOS', '998533', 1400, 'taxable', 18, TRUE, NULL, '2026-11-04 10:37:00.345680', '2026-11-04 10:37:00.345680', 'cleantech') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('e1d4f2fe-2c2f-4fd4-b7e1-67551456e46f', 'CTS-SP-DRYTOOL', 'DRY FLOOR BRUSH NOZZLE TOOL', 'spare_parts', 'item_based', 'Wide dry floor brush nozzle tool for industrial dust pickup', 'NOS', '998533', 1490, 'taxable', 18, TRUE, NULL, '2026-11-04 10:37:00.345680', '2026-11-04 10:37:00.345680', 'cleantech') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('bd97dfc2-8120-4d7a-b839-8c6ab31c667b', 'CTS-SP-MOTOR', 'VACUUM SUCTION MOTOR 1200W/1400W', 'spare_parts', 'item_based', 'Single-phase bypass copper winding vacuum suction motor', 'NOS', '998533', 3800, 'taxable', 18, TRUE, NULL, '2026-11-04 10:37:00.345680', '2026-11-04 10:37:00.345680', 'cleantech') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('a58376a0-8a4c-427c-8878-224aad16f06e', 'CTS-SRV-OVERHAUL', 'VACUUM CLEANER COMPLETE SERVICE & OVERHAUL', 'repair_service', 'item_based', 'Labor charges for comprehensive electrical & mechanical servicing', 'NOS', '998533', 1200, 'taxable', 18, TRUE, NULL, '2026-11-04 10:37:00.345680', '2026-11-04 10:37:00.345680', 'cleantech') ON CONFLICT DO NOTHING;
INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes, created_at, updated_at, company_code) VALUES ('1e370389-2489-48cc-b31e-4df53697495e', 'KMP-TEST-1793791389', 'RIDE ON SCRUBBER DRYER RB-900 TURBO', 'rental', 'rental', 'Heavy industrial dual scrub disc with 140L tank', 'NOS', '8479', 36000, 'taxable', 18, TRUE, NULL, '2026-11-04 11:23:09.330721', '2026-11-04 11:23:09.330721', 'kleanmaxpro') ON CONFLICT DO NOTHING;

-- SEED: service_rates (19 rows)
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('f85d5b33-5c6f-4a7a-be75-63fde2555c8a', 's1111111-1111-1111-1111-111111111111', 'sq_ft', 4.5, '2026-10-15', NULL, TRUE, NULL, NULL, NULL, '2026-10-15 04:10:02.294910') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('2fd60564-1b55-4bb4-86b1-38a485ea515f', 's2222222-2222-2222-2222-222222222222', 'sq_ft', 3.25, '2026-10-15', NULL, TRUE, NULL, NULL, NULL, '2026-10-15 04:10:02.294910') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('8c40402e-03e4-4fd5-a2c4-394718b3f8af', 's3333333-3333-3333-3333-333333333333', 'sq_ft', 5.5, '2026-10-15', NULL, TRUE, NULL, NULL, NULL, '2026-10-15 04:10:02.294910') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('929944ec-0167-4e19-8d34-be679bfd85e5', 's4444444-4444-4444-4444-444444444444', 'sq_ft', 42, '2026-10-15', NULL, TRUE, NULL, NULL, NULL, '2026-10-15 04:10:02.294910') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('9c9ed2d4-2de1-462d-bf90-a28f1fd34ad1', 's5555555-5555-5555-5555-555555555555', 'nos', 485000, '2026-10-15', NULL, TRUE, NULL, NULL, NULL, '2026-10-15 04:10:02.294910') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('27f873c6-1745-48ec-9e3a-565944d0f996', 's6666666-6666-6666-6666-666666666666', 'nos', 38500, '2026-10-15', NULL, TRUE, NULL, NULL, NULL, '2026-10-15 04:10:02.294910') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('c15b3171-3b68-4477-abeb-e97b2e7ba36a', 's7777777-7777-7777-7777-777777777777', 'days', 4500, '2026-10-15', NULL, TRUE, NULL, NULL, NULL, '2026-10-15 04:10:02.294910') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('a2f20857-2708-4138-be11-2c514a50f467', 's8888888-8888-8888-8888-888888888888', 'hours', 850, '2026-10-15', NULL, TRUE, NULL, NULL, NULL, '2026-10-15 04:10:02.294910') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('rate-s-pnt-01', 's-pnt-01', 'sq_ft', 28.5, '2026-11-04', NULL, TRUE, NULL, NULL, NULL, '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('rate-s-pnt-02', 's-pnt-02', 'sq_ft', 34, '2026-11-04', NULL, TRUE, NULL, NULL, NULL, '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('rate-s-pnt-03', 's-pnt-03', 'sq_ft', 65, '2026-11-04', NULL, TRUE, NULL, NULL, NULL, '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('rate-s-pnt-04', 's-pnt-04', 'sq_ft', 48, '2026-11-04', NULL, TRUE, NULL, NULL, NULL, '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('rate-s-pnt-05', 's-pnt-05', 'sq_ft', 75, '2026-11-04', NULL, TRUE, NULL, NULL, NULL, '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('rate-s-cts-01', 's-cts-01', 'nos', 45, '2026-11-04', NULL, TRUE, NULL, NULL, NULL, '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('rate-s-cts-02', 's-cts-02', 'sq_ft', 6.5, '2026-11-04', NULL, TRUE, NULL, NULL, NULL, '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('rate-s-cts-03', 's-cts-03', 'nos', 8500, '2026-11-04', NULL, TRUE, NULL, NULL, NULL, '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('rate-s-cts-04', 's-cts-04', 'months', 22000, '2026-11-04', NULL, TRUE, NULL, NULL, NULL, '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('rate-s-cts-05', 's-cts-05', 'sq_ft', 3.8, '2026-11-04', NULL, TRUE, NULL, NULL, NULL, '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO service_rates (id, service_id, uom, rate, effective_from, effective_to, is_current, min_area, max_area, created_by_id, created_at) VALUES ('a316c43c-f9a8-4f1f-b32e-7af3ea04dcba', '1e370389-2489-48cc-b31e-4df53697495e', 'NOS', 36000, '2026-11-04', NULL, TRUE, NULL, NULL, '11111111-1111-1111-1111-111111111111', '2026-11-04 11:23:09.338719') ON CONFLICT DO NOTHING;

-- SEED: customers (4 rows)
INSERT INTO customers (id, customer_code, company_name, contact_person, phone, email, gstin, pan, billing_address_line1, billing_address_line2, billing_city, billing_state, billing_state_code, billing_pincode, delivery_address_line1, delivery_address_line2, delivery_city, delivery_state, delivery_state_code, delivery_pincode, is_active, notes, created_by_id, created_at, updated_at) VALUES ('cust-01', 'CUST-KMP-001', 'Foxconn Mega Tech Park', 'Mr. R. Rajesh (Admin)', '+91 98401 22334', 'facilities@foxconn-india.com', '33AAACF1029R1Z1', 'AAACF1029R', 'Plot 10, Hi-Tech SEZ, Sriperumbudur', 'Near Toll Plaza', 'Chennai', 'Tamil Nadu', '33', '602105', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, NULL, '2026-11-04 00:58:12', '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO customers (id, customer_code, company_name, contact_person, phone, email, gstin, pan, billing_address_line1, billing_address_line2, billing_city, billing_state, billing_state_code, billing_pincode, delivery_address_line1, delivery_address_line2, delivery_city, delivery_state, delivery_state_code, delivery_pincode, is_active, notes, created_by_id, created_at, updated_at) VALUES ('cust-02', 'CUST-KLM-002', 'Hyundai Motor Engineering Works', 'Mr. S. Karthik (Procurement)', '+91 97909 44556', 'karthik.s@hyundai-auto.in', '33AAACH4981M1ZK', 'AAACH4981M', 'Automotive Hub, Irungattukottai', 'SIPCOT Industrial Park', 'Chennai', 'Tamil Nadu', '33', '602117', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, NULL, '2026-11-04 00:58:12', '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO customers (id, customer_code, company_name, contact_person, phone, email, gstin, pan, billing_address_line1, billing_address_line2, billing_city, billing_state, billing_state_code, billing_pincode, delivery_address_line1, delivery_address_line2, delivery_city, delivery_state, delivery_state_code, delivery_pincode, is_active, notes, created_by_id, created_at, updated_at) VALUES ('cust-03', 'CUST-UNP-003', 'Prestige Cyber Tower Corp', 'Ms. Ananya Sharma (Facility Head)', '+91 94441 55667', 'infra@prestigegroup.com', '33AABCP3891L1ZQ', 'AABCP3891L', 'Tower B, OMR IT Expressway, Karapakkam', 'Opp TCS Synergy Park', 'Chennai', 'Tamil Nadu', '33', '600097', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, NULL, '2026-11-04 00:58:12', '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
INSERT INTO customers (id, customer_code, company_name, contact_person, phone, email, gstin, pan, billing_address_line1, billing_address_line2, billing_city, billing_state, billing_state_code, billing_pincode, delivery_address_line1, delivery_address_line2, delivery_city, delivery_state, delivery_state_code, delivery_pincode, is_active, notes, created_by_id, created_at, updated_at) VALUES ('cust-04', 'CUST-CTS-004', 'Tata Power Solar & Logistics Park', 'Mr. V. Sundaram (Operations)', '+91 98842 77889', 'sundaram.v@tatapowerclean.com', '33AAACT9921B1ZM', 'AAACT9921B', 'Logistics Hub, Vallam Vadagal Industrial Park', 'Oragadam', 'Chennai', 'Tamil Nadu', '33', '602105', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, NULL, '2026-11-04 00:58:12', '2026-11-04 00:58:12') ON CONFLICT DO NOTHING;
