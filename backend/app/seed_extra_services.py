import sqlite3
from decimal import Decimal

def seed_extra_services_and_quotes():
    conn = sqlite3.connect('kleanmaxpro.db')
    c = conn.cursor()

    # Extra services
    extra_services = [
        # Unique Painters
        ("s-pnt-01", "PNT-INT-ROYALE", "Premium Interior Royale Luxury Emulsion (2 Coats + Primer)", "painting", "area_based", "High-sheen anti-fungal luxury emulsion paint with surface putty smoothing and alkali-resistant primer.", "sq_ft", "995472", 28.50, 18.00),
        ("s-pnt-02", "PNT-EXT-APEX", "Exterior Apex Weatherproof Acrylic Protective Coating", "painting", "area_based", "Heavy duty exterior facade weather-guard elastomeric coating with 5-year anti-fading warranty.", "sq_ft", "995472", 34.00, 18.00),
        ("s-pnt-03", "PNT-EPOXY-IND", "Industrial 1000-Micron Self-Leveling Epoxy Floor System", "painting", "area_based", "Diamond floor grinding, high-adhesion epoxy primer, screed coat, and 1000-micron self-leveling aliphatic polyurethane topcoat.", "sq_ft", "995472", 65.00, 18.00),
        ("s-pnt-04", "PNT-DAMP-PROOF", "Terrace & Parapet Elastomeric Waterproofing Membrane", "painting", "area_based", "3-coat fiber-mesh reinforced elastomeric waterproofing coating resistant to standing water and UV.", "sq_ft", "995472", 48.00, 18.00),
        ("s-pnt-05", "PNT-TEX-STENCIL", "Architectural Texture & Metallic Stencil Accent Finish", "painting", "area_based", "Custom decorative textured plaster finish, roller patterns, and metallic glaze finish.", "sq_ft", "995472", 75.00, 18.00),

        # Cleantech Services
        ("s-cts-01", "CTS-SOLAR-WASH", "De-Ionized Robotic Solar Panel Array Wash & Dusting", "cleaning", "item_based", "Zero-mineral de-ionized water high-flow wash with soft scratch-free rotary brushes. Improves generation up to 18%.", "nos", "998533", 45.00, 18.00),
        ("s-cts-02", "CTS-FAC-GLASS", "High-Rise Glass Facade & Curtain Wall Cradle Cleaning", "cleaning", "area_based", "Professional rope-access / cradle-assisted glass curtain wall, frame, and ACP silicone panel restoration.", "sq_ft", "998533", 6.50, 18.00),
        ("s-cts-03", "CTS-DUCT-EXHAUST", "Commercial Kitchen Grease Exhaust Hood & Duct Degreasing", "cleaning", "item_based", "High-temperature caustic steam jetting, baffle filter chemical soak, and duct line fire-hazard grease scraping.", "nos", "998533", 8500.00, 18.00),
        ("s-cts-04", "CTS-AMC-FACILITY", "Comprehensive Facility Annual Maintenance Contract (AMC)", "amc", "contract", "Periodic scheduled monthly deep sanitization, HVAC duct inspection, and high-pressure exterior washing visits.", "months", "998533", 22000.00, 18.00),
        ("s-cts-05", "CTS-HIGH-PRESSURE", "Industrial High-Pressure 250-Bar Jet Surface Washing", "cleaning", "area_based", "Heavy-duty 250-bar cold/hot water jet cleaning for parking bays, oil pits, interlocking paver blocks.", "sq_ft", "998533", 3.80, 18.00),
    ]

    for s_id, code, name, cat, q_type, desc, uom, hsn, rate, tax in extra_services:
        exists = c.execute("SELECT id FROM services WHERE service_code=?", (code,)).fetchone()
        if not exists:
            c.execute("""
                INSERT INTO services (id, service_code, service_name, category, quotation_type, description, default_uom, hsn_sac_code, standard_rate, tax_category, default_tax_rate, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'taxable', ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """, (s_id, code, name, cat, q_type, desc, uom, hsn, rate, tax))

            # Service rate
            c.execute("""
                INSERT INTO service_rates (id, service_id, uom, rate, effective_from, is_current, created_at)
                VALUES (?, ?, ?, ?, DATE('now'), 1, CURRENT_TIMESTAMP)
            """, (f"rate-{s_id}", s_id, uom, rate))

    # Seed Sample Customers if needed
    customers_data = [
        ("cust-01", "CUST-KMP-001", "Foxconn Mega Tech Park", "Mr. R. Rajesh (Admin)", "+91 98401 22334", "facilities@foxconn-india.com", "33AAACF1029R1Z1", "AAACF1029R", "Plot 10, Hi-Tech SEZ, Sriperumbudur", "Near Toll Plaza", "Chennai", "Tamil Nadu", "33", "602105"),
        ("cust-02", "CUST-KLM-002", "Hyundai Motor Engineering Works", "Mr. S. Karthik (Procurement)", "+91 97909 44556", "karthik.s@hyundai-auto.in", "33AAACH4981M1ZK", "AAACH4981M", "Automotive Hub, Irungattukottai", "SIPCOT Industrial Park", "Chennai", "Tamil Nadu", "33", "602117"),
        ("cust-03", "CUST-UNP-003", "Prestige Cyber Tower Corp", "Ms. Ananya Sharma (Facility Head)", "+91 94441 55667", "infra@prestigegroup.com", "33AABCP3891L1ZQ", "AABCP3891L", "Tower B, OMR IT Expressway, Karapakkam", "Opp TCS Synergy Park", "Chennai", "Tamil Nadu", "33", "600097"),
        ("cust-04", "CUST-CTS-004", "Tata Power Solar & Logistics Park", "Mr. V. Sundaram (Operations)", "+91 98842 77889", "sundaram.v@tatapowerclean.com", "33AAACT9921B1ZM", "AAACT9921B", "Logistics Hub, Vallam Vadagal Industrial Park", "Oragadam", "Chennai", "Tamil Nadu", "33", "602105"),
    ]

    for cid, code, comp_name, contact, ph, email, gstin, pan, addr1, addr2, city, state, st_code, pin in customers_data:
        exists = c.execute("SELECT id FROM customers WHERE customer_code=?", (code,)).fetchone()
        if not exists:
            c.execute("""
                INSERT INTO customers (id, customer_code, company_name, contact_person, phone, email, gstin, pan, billing_address_line1, billing_address_line2, billing_city, billing_state, billing_state_code, billing_pincode, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """, (cid, code, comp_name, contact, ph, email, gstin, pan, addr1, addr2, city, state, st_code, pin))

    # Seed Sample Quotations for each of the 4 companies if none exist
    # 1. Kleanmax Pro
    if not c.execute("SELECT id FROM quotations WHERE company_code='kleanmaxpro'").fetchone():
        c.execute("""
            INSERT INTO quotations (
                id, company_code, quotation_number, revision_number, customer_id, quotation_type, status,
                quotation_date, validity_date, customer_ref, job_description, subtotal, discount_type,
                discount_value, total_discount, freight_charges, packing_charges, other_charges,
                taxable_amount, is_interstate, cgst_rate, cgst_amount, sgst_rate, sgst_amount,
                igst_rate, igst_amount, total_tax, rounding_adjustment, final_amount, amount_in_words,
                created_at, updated_at
            ) VALUES (
                'q-kmp-001', 'kleanmaxpro', 'KMP/2026-27/0001', 0, 'cust-01', 'area_based', 'approved',
                DATE('now', '-3 days'), DATE('now', '+27 days'), 'PO-FOX-892',
                'Comprehensive Industrial Floor Scrubbing & High-Gloss Degreasing for Main Production Hall 1 & 2',
                125000.00, 'none', 0, 0, 0, 0, 0, 125000.00, 0, 9.00, 11250.00, 9.00, 11250.00,
                0, 0, 22500.00, 0, 147500.00, 'One Lakh Forty-Seven Thousand Five Hundred Rupees Only',
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        """)

    # 2. Kleanmax
    if not c.execute("SELECT id FROM quotations WHERE company_code='kleanmax'").fetchone():
        c.execute("""
            INSERT INTO quotations (
                id, company_code, quotation_number, revision_number, customer_id, quotation_type, status,
                quotation_date, validity_date, customer_ref, job_description, subtotal, discount_type,
                discount_value, total_discount, freight_charges, packing_charges, other_charges,
                taxable_amount, is_interstate, cgst_rate, cgst_amount, sgst_rate, sgst_amount,
                igst_rate, igst_amount, total_tax, rounding_adjustment, final_amount, amount_in_words,
                created_at, updated_at
            ) VALUES (
                'q-klm-001', 'kleanmax', 'KLM/2026-27/0001', 0, 'cust-02', 'repair_service', 'issued',
                DATE('now', '-5 days'), DATE('now', '+10 days'), 'RFQ-HYU-3819',
                'Karcher Scrubber Model B 40 C EP Complete Brush Drive Overhaul, Vacuum Hose Assembly & Chemical Valve Kit',
                42800.00, 'none', 0, 0, 1200.00, 0, 0, 44000.00, 0, 9.00, 3960.00, 9.00, 3960.00,
                0, 0, 7920.00, 0, 51920.00, 'Fifty-One Thousand Nine Hundred Twenty Rupees Only',
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        """)

    # 3. Unique Painters
    if not c.execute("SELECT id FROM quotations WHERE company_code='uniquepainters'").fetchone():
        c.execute("""
            INSERT INTO quotations (
                id, company_code, quotation_number, revision_number, customer_id, quotation_type, status,
                quotation_date, validity_date, customer_ref, job_description, subtotal, discount_type,
                discount_value, total_discount, freight_charges, packing_charges, other_charges,
                taxable_amount, is_interstate, cgst_rate, cgst_amount, sgst_rate, sgst_amount,
                igst_rate, igst_amount, total_tax, rounding_adjustment, final_amount, amount_in_words,
                created_at, updated_at
            ) VALUES (
                'q-unp-001', 'uniquepainters', 'UNP/2026-27/0001', 0, 'cust-03', 'area_based', 'pending_approval',
                DATE('now', '-1 days'), DATE('now', '+29 days'), 'PREST-TWR-PNT-99',
                'Prestige Cyber Tower 4th & 5th Floor Interior Royale Emulsion Painting & Basement 1000-Micron Epoxy Coating',
                284000.00, 'percentage', 5.00, 14200.00, 0, 0, 0, 269800.00, 0, 9.00, 24282.00, 9.00, 24282.00,
                0, 0, 48564.00, 0, 318364.00, 'Three Lakh Eighteen Thousand Three Hundred Sixty-Four Rupees Only',
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        """)

    # 4. Cleantech Services
    if not c.execute("SELECT id FROM quotations WHERE company_code='cleantech'").fetchone():
        c.execute("""
            INSERT INTO quotations (
                id, company_code, quotation_number, revision_number, customer_id, quotation_type, status,
                quotation_date, validity_date, customer_ref, job_description, subtotal, discount_type,
                discount_value, total_discount, freight_charges, packing_charges, other_charges,
                taxable_amount, is_interstate, cgst_rate, cgst_amount, sgst_rate, sgst_amount,
                igst_rate, igst_amount, total_tax, rounding_adjustment, final_amount, amount_in_words,
                created_at, updated_at
            ) VALUES (
                'q-cts-001', 'cleantech', 'CTS/2026-27/0001', 0, 'cust-04', 'contract', 'approved',
                DATE('now', '-2 days'), DATE('now', '+43 days'), 'TATA-SOLAR-AMC-26',
                'Annual Maintenance Contract (AMC): 1.5MW Solar Panel Array Robotic De-ionized Cleaning (12 Monthly Cycles)',
                198000.00, 'none', 0, 0, 0, 0, 0, 198000.00, 0, 9.00, 17820.00, 9.00, 17820.00,
                0, 0, 35640.00, 0, 233640.00, 'Two Lakh Thirty-Three Thousand Six Hundred Forty Rupees Only',
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        """)

    conn.commit()
    print("Extra services, customers, and company quotations seeded successfully!")
    conn.close()

if __name__ == "__main__":
    seed_extra_services_and_quotes()

