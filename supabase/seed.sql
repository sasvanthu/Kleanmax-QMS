-- Klean Max Pro Seed Data
-- Fictional development seed data with realistic industrial specifications

-- Insert Profiles
INSERT INTO profiles (id, email, full_name, role, is_active, phone)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@kleanmaxpro.com', 'Arun Kumar (Admin)', 'admin', true, '+91 73388 82034'),
    ('22222222-2222-2222-2222-222222222222', 'manager@kleanmaxpro.com', 'Suresh Rajan (Manager)', 'manager', true, '+91 97101 48218'),
    ('33333333-3333-3333-3333-333333333333', 'staff@kleanmaxpro.com', 'Kavitha S (Staff Estimator)', 'staff', true, '+91 98401 23456')
ON CONFLICT (email) DO NOTHING;

-- Insert Company Settings
INSERT INTO company_settings (
    id, company_name, legal_name, gstin, pan, cin,
    address_line1, address_line2, city, state, state_code, pincode,
    phone1, phone2, email, website,
    bank_name, bank_account_no, bank_ifsc, bank_branch,
    quotation_prefix, default_validity_days, rounding_policy
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Klean Max Pro',
    'Klean Max Pro Commercial Services Private Limited',
    '33AABCK1234F1Z8',
    'AABCK1234F',
    'U74999TN2021PTC145678',
    '6, Jayam Industrial Estate, Chettyar Agaram 1st St',
    'Opp to Ishwarya Apts, Vanagaram',
    'Chennai',
    'Tamil Nadu',
    '33',
    '600095',
    '+91 73388 82034',
    '+91 97101 48218',
    'info@kleanmaxpro.com',
    'www.kleanmaxpro.com',
    'HDFC Bank Limited',
    '50200088991122',
    'HDFC0001234',
    'Porur Branch, Chennai',
    'KMP',
    30,
    'HALF_UP'
) ON CONFLICT (id) DO NOTHING;

-- Insert Realistic Customers
INSERT INTO customers (
    id, customer_code, company_name, contact_person, phone, email, gstin,
    billing_address_line1, billing_address_line2, billing_city, billing_state, billing_state_code, billing_pincode,
    delivery_address_line1, delivery_city, delivery_state, delivery_state_code, delivery_pincode,
    created_by_id
) VALUES 
(
    'c1111111-1111-1111-1111-111111111111',
    'CUST-2026-001',
    'Tata Steel Processing & Distribution Ltd',
    'Mr. Rajesh Sharma (Plant Head)',
    '+91 98409 11223',
    'r.sharma@tatasteel.com',
    '33AAACT2727Q1ZT',
    'Plot 42-45, SIPCOT Industrial Park, Phase II',
    'Mambakkam Post',
    'Sriperumbudur',
    'Tamil Nadu',
    '33',
    '602105',
    'Bay 3 & 4 Central Logistics Hub, SIPCOT Phase II',
    'Sriperumbudur',
    'Tamil Nadu',
    '33',
    '602105',
    '11111111-1111-1111-1111-111111111111'
),
(
    'c2222222-2222-2222-2222-222222222222',
    'CUST-2026-002',
    'Hyundai Motor Logistics Park',
    'Mr. K. Narayanan (Facilities Manager)',
    '+91 97109 44556',
    'k.narayanan@hmi-logistics.in',
    '33AABCH7890K1Z2',
    'NH4 Outer Ring Road Intersect',
    'Irungattukottai',
    'Kancheepuram',
    'Tamil Nadu',
    '33',
    '602117',
    'Warehouse Unit 7, Component Receiving Bay',
    'Kancheepuram',
    'Tamil Nadu',
    '33',
    '602117',
    '22222222-2222-2222-2222-222222222222'
),
(
    'c3333333-3333-3333-3333-333333333333',
    'CUST-2026-003',
    'Godrej Consumer Logistics Hub (Interstate)',
    'Ms. Anita Desai (Regional Procurement)',
    '+91 98200 99887',
    'anita.desai@godrejcp.com',
    '29AAACG1234M1Z5', -- Karnataka GSTIN for Interstate IGST testing!
    'Godrej Bhavan, 4th Cross, Peenya Industrial Area',
    'Phase 1',
    'Bengaluru',
    'Karnataka',
    '29',
    '560058',
    'Depot 2, Hosur Road Border Logistics Yard',
    'Bengaluru',
    'Karnataka',
    '29',
    '560058',
    '11111111-1111-1111-1111-111111111111'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Services
INSERT INTO services (
    id, service_code, service_name, category, quotation_type, description,
    default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, internal_notes
) VALUES
(
    's1111111-1111-1111-1111-111111111111',
    'SVC-WH-DEEP',
    'Warehouse Deep Floor Scrubbing & Degreasing',
    'cleaning',
    'area_based',
    'Comprehensive heavy-duty industrial rotary scrubbing, oil stain degreasing, slurry suction and high-gloss neutral wash.',
    'sq_ft',
    '998533',
    4.5000,
    'taxable',
    18.00,
    true,
    'Standard rate per sq ft for warehouse floors up to 50,000 sq ft.'
),
(
    's2222222-2222-2222-2222-222222222222',
    'SVC-IND-AUTO',
    'Industrial Ride-On Automated Floor Cleaning',
    'cleaning',
    'area_based',
    'High-speed mechanized auto-scrubbing with cylindrical nylon brushes and eco-friendly industrial cleaning chemical.',
    'sq_ft',
    '998533',
    3.2500,
    'taxable',
    18.00,
    true,
    'Recommended for regular maintenance or large open shop floors.'
),
(
    's3333333-3333-3333-3333-333333333333',
    'SVC-FAC-DUST',
    'Factory High-Level Roof Truss & Pipeline Dusting',
    'cleaning',
    'area_based',
    'Safety harness-assisted overhead beam, truss, cable tray and duct cleaning using explosion-proof industrial vacuums.',
    'sq_ft',
    '998533',
    5.5000,
    'taxable',
    18.00,
    true,
    'Rate includes boom lift / scaffolding operator overhead.'
),
(
    's4444444-4444-4444-4444-444444444444',
    'SVC-EPOXY-COAT',
    'Industrial Epoxy Floor Coating & Line Marking',
    'painting',
    'area_based',
    'Surface preparation with diamond grinding, 100% solids epoxy primer, intermediate self-leveling coat and 500-micron polyurethane topcoat.',
    'sq_ft',
    '995472',
    42.0000,
    'taxable',
    18.00,
    true,
    'Warranty 24 months against peeling and delamination.'
),
(
    's5555555-5555-5555-5555-555555555555',
    'EQ-RIDE-KMP850',
    'KMP-850R Industrial Ride-On Scrubber Dryer',
    'equipment_sales',
    'item_based',
    '850mm scrub width, 120L solution tank, heavy-duty traction motor, twin disc brushes, maintenance-free AGM battery pack.',
    'nos',
    '84798999',
    485000.0000,
    'taxable',
    18.00,
    true,
    'OEM 1-year on-site comprehensive warranty included.'
),
(
    's6666666-6666-6666-6666-666666666666',
    'EQ-VAC-WD80',
    'KMP Heavy Duty Wet & Dry Industrial Vacuum 80L',
    'equipment_sales',
    'item_based',
    '3000W triple bypass motor, stainless steel 80L tilt tank, complete accessory kit for sludge and fine dust extraction.',
    'nos',
    '84798999',
    38500.0000,
    'taxable',
    18.00,
    true,
    'Popular unit for factory shop floors.'
),
(
    's7777777-7777-7777-7777-777777777777',
    'RNT-RIDE-SCRUB',
    'Ride-on Scrubber Daily/Weekly Rental with Operator',
    'rental',
    'rental',
    'Rental of heavy duty ride-on scrubber including trained operator, fuel/battery charge, and standard detergents.',
    'days',
    '997312',
    4500.0000,
    'taxable',
    18.00,
    true,
    'Minimum 3-day rental period.'
),
(
    's8888888-8888-8888-8888-888888888888',
    'REP-MAINT-SRV',
    'Cleaning Equipment Maintenance & Overhaul Service',
    'repair_service',
    'repair_service',
    'Comprehensive machine inspection, electrical diagnostic, brush motor overhaul, vacuum motor sealing and squeegee tuning.',
    'hours',
    '998719',
    850.0000,
    'taxable',
    18.00,
    true,
    'Spare parts billed separately as per actuals.'
)
ON CONFLICT (service_code) DO NOTHING;

-- Insert Service Rates
INSERT INTO service_rates (service_id, uom, rate, effective_from, is_current)
SELECT id, default_uom, standard_rate, CURRENT_DATE, true FROM services
ON CONFLICT DO NOTHING;

-- Initialize Fiscal Year Counter for atomic quotation numbering
INSERT INTO quotation_counters (fiscal_year, last_sequence)
VALUES ('2026-27', 0)
ON CONFLICT (fiscal_year) DO NOTHING;
