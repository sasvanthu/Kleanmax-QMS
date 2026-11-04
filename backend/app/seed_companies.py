import sqlite3

def seed_companies():
    conn = sqlite3.connect('kleanmaxpro.db')
    c = conn.cursor()

    # Ensure columns exist
    cols = [r[1] for r in c.execute('PRAGMA table_info(company_settings)').fetchall()]
    if 'company_code' not in cols:
        c.execute('ALTER TABLE company_settings ADD COLUMN company_code VARCHAR(50)')
    if 'tagline' not in cols:
        c.execute('ALTER TABLE company_settings ADD COLUMN tagline VARCHAR(255)')
    if 'brand_color' not in cols:
        c.execute('ALTER TABLE company_settings ADD COLUMN brand_color VARCHAR(50)')

    # Check quotation column
    q_cols = [r[1] for r in c.execute('PRAGMA table_info(quotations)').fetchall()]
    if 'company_code' not in q_cols:
        c.execute('ALTER TABLE quotations ADD COLUMN company_code VARCHAR(50)')

    # Set default for existing row
    c.execute("UPDATE company_settings SET company_code='kleanmaxpro', tagline='Commercial Floor Scrubbing & Deep Facility Care', brand_color='#FED10C' WHERE company_code IS NULL OR company_code=''")

    companies = [
        {
            'id': 'c0000000-0000-0000-0000-000000000001',
            'company_code': 'kleanmaxpro',
            'company_name': 'Klean Max Pro',
            'legal_name': 'Klean Max Pro Commercial Services Private Limited',
            'gstin': '33AABCK1234F1Z8',
            'pan': 'AABCK1234F',
            'cin': 'U74999TN2021PTC145678',
            'address_line1': '6, Jayam Industrial Estate, Chettyar Agaram 1st St',
            'address_line2': 'Opp to Ishwarya Apts, Vanagaram',
            'city': 'Chennai',
            'state': 'Tamil Nadu',
            'state_code': '33',
            'pincode': '600095',
            'phone1': '+91 73388 82034',
            'phone2': '+91 97101 48218',
            'email': 'info@kleanmaxpro.com',
            'website': 'www.kleanmaxpro.com',
            'bank_name': 'HDFC Bank Limited',
            'bank_account_no': '50200088991122',
            'bank_ifsc': 'HDFC0001234',
            'bank_branch': 'Porur Branch, Chennai',
            'quotation_prefix': 'KMP',
            'default_validity_days': 30,
            'rounding_policy': 'HALF_UP',
            'tagline': 'Commercial Floor Scrubbing & Deep Facility Care',
            'brand_color': '#FED10C',
            'default_payment_terms': '50% Advance with confirmed work order, 50% upon job completion.',
            'default_delivery_terms': 'Service execution commences within 3 business days of site readiness.',
            'default_warranty_terms': '30-day workmanship assurance on all commercial deep floor scrubbing.',
            'terms_and_conditions': '1. Water and 3-phase electricity must be provided at the site by the customer.\n2. GST applicable as per statutory guidelines.\n3. Quotation valid for 30 days.'
        },
        {
            'id': 'c0000000-0000-0000-0000-000000000002',
            'company_code': 'kleanmax',
            'company_name': 'Kleanmax',
            'legal_name': 'Kleanmax Equipment & Spares India LLP',
            'gstin': '33DXIPS4251R2ZP',
            'pan': 'DXIPS4251R',
            'cin': 'AAB-5432',
            'address_line1': '6, Jayam Industrial Estate, Chettyar Agaram 1st St',
            'address_line2': 'Opp to Ishwarya Apts, Vanagaram',
            'city': 'Chennai',
            'state': 'Tamil Nadu',
            'state_code': '33',
            'pincode': '600095',
            'phone1': '+91 98400 12345',
            'phone2': '+91 97101 48218',
            'email': 'service@kleanmax.in',
            'website': 'www.kleanmax.in',
            'bank_name': 'ICICI Bank',
            'bank_account_no': '001105023948',
            'bank_ifsc': 'ICIC0000011',
            'bank_branch': 'Vanagaram Branch, Chennai',
            'quotation_prefix': 'KLM',
            'default_validity_days': 15,
            'rounding_policy': 'HALF_UP',
            'tagline': 'Industrial Cleaning Equipment, Spares & Authorized Service',
            'brand_color': '#0284c7',
            'default_payment_terms': '100% advance against Proforma Invoice prior to machine/spares dispatch.',
            'default_delivery_terms': 'Ex-works Chennai warehouse. Ready spares dispatched within 24-48 hours.',
            'default_warranty_terms': '12 months standard OEM manufacturer warranty on machines. 90 days on genuine spares.',
            'terms_and_conditions': '1. Freight, transit insurance and handling extra at actuals.\n2. Goods once sold will not be taken back unless OEM defect confirmed.\n3. Subject to Chennai jurisdiction.'
        },
        {
            'id': 'c0000000-0000-0000-0000-000000000003',
            'company_code': 'uniquepainters',
            'company_name': 'Unique Painters',
            'legal_name': 'Unique Painters & Surface Coatings Private Limited',
            'gstin': '33AABUP9876G1ZK',
            'pan': 'AABUP9876G',
            'cin': 'U45200TN2022PTC156789',
            'address_line1': 'Plot No. 14, Industrial Corridor, Ambattur Industrial Estate',
            'address_line2': 'Near Telephone Exchange',
            'city': 'Chennai',
            'state': 'Tamil Nadu',
            'state_code': '33',
            'pincode': '600058',
            'phone1': '+91 94440 88776',
            'phone2': '+91 98402 33445',
            'email': 'contact@uniquepainters.in',
            'website': 'www.uniquepainters.in',
            'bank_name': 'State Bank of India',
            'bank_account_no': '38992019283',
            'bank_ifsc': 'SBIN0001550',
            'bank_branch': 'Ambattur Industrial Estate Branch',
            'quotation_prefix': 'UNP',
            'default_validity_days': 30,
            'rounding_policy': 'HALF_UP',
            'tagline': 'Commercial & Residential Painting, Epoxy Flooring & Waterproofing',
            'brand_color': '#7c3aed',
            'default_payment_terms': '40% advance with work order, 40% on primer/base completion, 20% on final coat inspection.',
            'default_delivery_terms': 'Painting starts within 48 hours of surface preparation clearance.',
            'default_warranty_terms': 'Up to 3-5 years warranty on exterior weather-coat paint and 24 months on epoxy floor coating.',
            'terms_and_conditions': '1. Scaffolding / boom lift arrangements included as per quote specification.\n2. Civil repairs and crack-filling beyond 3mm will be billed additionally.\n3. Color shades to be approved in writing prior to application.'
        },
        {
            'id': 'c0000000-0000-0000-0000-000000000004',
            'company_code': 'cleantech',
            'company_name': 'Cleantech Services',
            'legal_name': 'Cleantech Environmental & Industrial Services LLP',
            'gstin': '33AABCT5432M1ZQ',
            'pan': 'AABCT5432M',
            'cin': 'AAK-8921',
            'address_line1': '28, Tech Park Road, Porur Phase II',
            'address_line2': 'Near Mount Poonamallee High Road',
            'city': 'Chennai',
            'state': 'Tamil Nadu',
            'state_code': '33',
            'pincode': '600116',
            'phone1': '+91 98840 55667',
            'phone2': '+91 97101 48218',
            'email': 'contracts@cleantechservices.in',
            'website': 'www.cleantechservices.in',
            'bank_name': 'Axis Bank',
            'bank_account_no': '921020038849102',
            'bank_ifsc': 'UTIB0000128',
            'bank_branch': 'Porur Branch, Chennai',
            'quotation_prefix': 'CTS',
            'default_validity_days': 45,
            'rounding_policy': 'HALF_UP',
            'tagline': 'Specialized Sanitization, Solar Panel & Facade Tech Solutions',
            'brand_color': '#0d9488',
            'default_payment_terms': 'Monthly/Quarterly in advance for AMC contracts; 50% advance for specialized projects.',
            'default_delivery_terms': 'Scheduled as per agreed SLA calendar and monthly service windows.',
            'default_warranty_terms': '100% SLA adherence guarantee with documented before-after de-ionization and turbidity reports.',
            'terms_and_conditions': '1. Roof and electrical access permits to be secured by client prior to solar wash.\n2. Water supply point within 50m of work zone to be provided.\n3. Safety and rope-access permits comply with ISO 45001 standards.'
        }
    ]

    for comp in companies:
        exists = c.execute('SELECT id FROM company_settings WHERE company_code=?', (comp['company_code'],)).fetchone()
        if exists:
            c.execute('''
                UPDATE company_settings SET
                    company_name=?, legal_name=?, gstin=?, pan=?, cin=?,
                    address_line1=?, address_line2=?, city=?, state=?, state_code=?, pincode=?,
                    phone1=?, phone2=?, email=?, website=?,
                    bank_name=?, bank_account_no=?, bank_ifsc=?, bank_branch=?,
                    quotation_prefix=?, default_validity_days=?, rounding_policy=?,
                    tagline=?, brand_color=?,
                    default_payment_terms=?, default_delivery_terms=?, default_warranty_terms=?, terms_and_conditions=?
                WHERE company_code=?
            ''', (
                comp['company_name'], comp['legal_name'], comp['gstin'], comp['pan'], comp['cin'],
                comp['address_line1'], comp['address_line2'], comp['city'], comp['state'], comp['state_code'], comp['pincode'],
                comp['phone1'], comp['phone2'], comp['email'], comp['website'],
                comp['bank_name'], comp['bank_account_no'], comp['bank_ifsc'], comp['bank_branch'],
                comp['quotation_prefix'], comp['default_validity_days'], comp['rounding_policy'],
                comp['tagline'], comp['brand_color'],
                comp['default_payment_terms'], comp['default_delivery_terms'], comp['default_warranty_terms'], comp['terms_and_conditions'],
                comp['company_code']
            ))
        else:
            c.execute('''
                INSERT INTO company_settings (
                    id, company_code, company_name, legal_name, gstin, pan, cin,
                    address_line1, address_line2, city, state, state_code, pincode,
                    phone1, phone2, email, website,
                    bank_name, bank_account_no, bank_ifsc, bank_branch,
                    quotation_prefix, default_validity_days, rounding_policy,
                    tagline, brand_color,
                    default_payment_terms, default_delivery_terms, default_warranty_terms, terms_and_conditions,
                    updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?,
                    ?, ?, ?, ?,
                    CURRENT_TIMESTAMP
                )
            ''', (
                comp['id'], comp['company_code'], comp['company_name'], comp['legal_name'], comp['gstin'], comp['pan'], comp['cin'],
                comp['address_line1'], comp['address_line2'], comp['city'], comp['state'], comp['state_code'], comp['pincode'],
                comp['phone1'], comp['phone2'], comp['email'], comp['website'],
                comp['bank_name'], comp['bank_account_no'], comp['bank_ifsc'], comp['bank_branch'],
                comp['quotation_prefix'], comp['default_validity_days'], comp['rounding_policy'],
                comp['tagline'], comp['brand_color'],
                comp['default_payment_terms'], comp['default_delivery_terms'], comp['default_warranty_terms'], comp['terms_and_conditions']
            ))

    # Also seed some representative sample quotations for the companies if none exist for them
    conn.commit()
    print("All 4 companies seeded successfully!")
    rows = c.execute("SELECT company_code, company_name, quotation_prefix FROM company_settings").fetchall()
    print("Current companies in DB:", rows)
    conn.close()

if __name__ == "__main__":
    seed_companies()

