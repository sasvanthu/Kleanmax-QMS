from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal, engine, Base
from backend.app.core.security import get_password_hash
from backend.app.models.all_models import (
    Profile, CompanySetting, Customer, Service, ServiceRate, QuotationCounter, Quotation
)

def run_seed():
    db = SessionLocal()
    try:
        # If database already has companies and services seeded in Supabase, ready immediately
        comp_count = db.query(CompanySetting).count()
        svc_count = db.query(Service).count()
        if comp_count >= 4 and svc_count >= 20:
            print(f"Database ready: {comp_count} companies, {svc_count} services connected on Supabase.")
            return
    except Exception:
        pass
    finally:
        db.close()

    # 1. Ensure all tables exist in database (PostgreSQL/Supabase or SQLite)
    Base.metadata.create_all(bind=engine)
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE profiles ADD COLUMN company_code VARCHAR(50)"))
            conn.commit()
    except Exception:
        pass
    db = SessionLocal()

    try:
        # 2. Seed All 4 Companies
        companies_data = [
            {
                "id": "c0000000-0000-0000-0000-000000000001",
                "company_code": "kleanmaxpro",
                "company_name": "Klean Max Pro",
                "legal_name": "Klean Max Pro Commercial Services Private Limited",
                "gstin": "33DXIPS4251R2ZP",
                "pan": "DXIPS4251R",
                "cin": "U74999TN2021PTC145678",
                "address_line1": "NO 6, B6, Jayam Industrial Estate, Chettiyar Agaram First Main Road",
                "address_line2": "Vanagaram",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "state_code": "33",
                "pincode": "600077",
                "phone1": "+91 73388 82036",
                "phone2": "+91 97101 48218",
                "email": "info@kleanmaxpro.com",
                "website": "www.kleanmaxpro.com",
                "bank_name": "ICICI BANK KMP",
                "bank_account_no": "027505010327",
                "bank_ifsc": "ICIC0000275",
                "bank_branch": "PORUR",
                "bank_account_name": "KLEAN MAX PRO",
                "quotation_prefix": "KMP",
                "default_validity_days": 30,
                "rounding_policy": "HALF_UP",
                "tagline": "Commercial Floor Scrubbing & Deep Facility Care",
                "brand_color": "#FED10C",
                "default_payment_terms": "50% Advance with confirmed work order, 50% upon job completion.",
                "default_delivery_terms": "Service execution commences within 3 business days of site readiness.",
                "default_warranty_terms": "30-day workmanship assurance on all commercial deep floor scrubbing.",
                "terms_and_conditions": "1. Water and 3-phase electricity must be provided at the site by the customer.\n2. GST applicable as per statutory guidelines.\n3. Quotation valid for 30 days."
            },
            {
                "id": "c0000000-0000-0000-0000-000000000002",
                "company_code": "kleanmax",
                "company_name": "Kleanmax",
                "legal_name": "Kleanmax Equipment & Spares India LLP",
                "gstin": "33DZPPS3614K1ZW",
                "pan": "DZPPS3614K",
                "cin": "AAB-5432",
                "address_line1": "NO 6, B6, JAYAM INDUSTRIAL ESTATE, CHETTIYAR AGARAM FIRST MAIN ROAD",
                "address_line2": "VANAGARAM",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "state_code": "33",
                "pincode": "600077",
                "phone1": "97101 48218",
                "phone2": "+91 73388 82036",
                "email": "info@kleanmax.com",
                "website": "www.kleanmax.com",
                "bank_name": "KVB BANK",
                "bank_account_no": "1278135000007113",
                "bank_ifsc": "KVBL000127",
                "bank_branch": "ASHOK NAGAR",
                "bank_account_name": "KLEANMAX",
                "quotation_prefix": "KLM",
                "default_validity_days": 15,
                "rounding_policy": "HALF_UP",
                "tagline": "Industrial Cleaning Equipment, Spares & Authorized Service",
                "brand_color": "#0284c7",
                "default_payment_terms": "100% advance against Proforma Invoice prior to machine/spares dispatch.",
                "default_delivery_terms": "Ex-works Chennai warehouse. Ready spares dispatched within 24-48 hours.",
                "default_warranty_terms": "12 months standard OEM manufacturer warranty on machines. 90 days on genuine spares.",
                "terms_and_conditions": "1. Freight, transit insurance and handling extra at actuals.\n2. Goods once sold will not be taken back unless OEM defect confirmed.\n3. Subject to Chennai jurisdiction."
            },
            {
                "id": "c0000000-0000-0000-0000-000000000003",
                "company_code": "uniquepainters",
                "company_name": "Unique Painters",
                "legal_name": "Unique Painters & Surface Coatings Private Limited",
                "gstin": "33AABUP9876G1ZK",
                "pan": "AABUP9876G",
                "cin": "U45200TN2022PTC156789",
                "address_line1": "Plot No. 14, Industrial Corridor, Ambattur Industrial Estate",
                "address_line2": "Near Telephone Exchange",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "state_code": "33",
                "pincode": "600058",
                "phone1": "+91 94440 88776",
                "phone2": "+91 98402 33445",
                "email": "contact@uniquepainters.in",
                "website": "www.uniquepainters.in",
                "bank_name": "State Bank of India",
                "bank_account_no": "38992019283",
                "bank_ifsc": "SBIN0001550",
                "bank_branch": "Ambattur Industrial Estate Branch",
                "quotation_prefix": "UNP",
                "default_validity_days": 30,
                "rounding_policy": "HALF_UP",
                "tagline": "Commercial & Residential Painting, Epoxy Flooring & Waterproofing",
                "brand_color": "#7c3aed",
                "default_payment_terms": "40% advance with work order, 40% on primer/base completion, 20% on final coat inspection.",
                "default_delivery_terms": "Painting starts within 48 hours of surface preparation clearance.",
                "default_warranty_terms": "Up to 3-5 years warranty on exterior weather-coat paint and 24 months on epoxy floor coating.",
                "terms_and_conditions": "1. Scaffolding / boom lift arrangements included as per quote specification.\n2. Civil repairs and crack-filling beyond 3mm will be billed additionally.\n3. Color shades to be approved in writing prior to application."
            },
            {
                "id": "c0000000-0000-0000-0000-000000000004",
                "company_code": "cleantech",
                "company_name": "Cleantech Services",
                "legal_name": "Cleantech Environmental & Industrial Services LLP",
                "gstin": "33ABWCS8841M1ZA",
                "pan": "ABWCS8841M",
                "cin": "AAK-8921",
                "address_line1": "28, Tech Park Road, Porur Phase II",
                "address_line2": "Near Mount Poonamallee High Road",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "state_code": "33",
                "pincode": "600116",
                "phone1": "+91 73388 82036",
                "phone2": "+91 97101 48218",
                "email": "service@cleantechservices.in",
                "website": "www.cleantechservices.in",
                "bank_name": "IDFC BANK",
                "bank_account_no": "73388820361",
                "bank_ifsc": "IDFB0081831",
                "bank_branch": "Chennai – Iyyapanthangal Branch",
                "bank_account_name": "CLEANTECH SERVICES",
                "quotation_prefix": "CTS",
                "default_validity_days": 45,
                "rounding_policy": "HALF_UP",
                "tagline": "Specialized Sanitization, Solar Panel & Facade Tech Solutions",
                "brand_color": "#0d9488",
                "default_payment_terms": "Monthly/Quarterly in advance for AMC contracts; 50% advance for specialized projects.",
                "default_delivery_terms": "Scheduled as per agreed SLA calendar and monthly service windows.",
                "default_warranty_terms": "100% SLA adherence guarantee with documented before-after de-ionization and turbidity reports.",
                "terms_and_conditions": "1. Roof and electrical access permits to be secured by client prior to solar wash.\n2. Water supply point within 50m of work zone to be provided.\n3. Safety and rope-access permits comply with ISO 45001 standards."
            }
        ]

        for c_data in companies_data:
            existing = db.query(CompanySetting).filter(
                (CompanySetting.id == c_data["id"]) | (CompanySetting.company_code == c_data["company_code"])
            ).first()
            if not existing:
                comp = CompanySetting(**c_data)
                db.add(comp)
            else:
                for key, val in c_data.items():
                    if hasattr(existing, key):
                        setattr(existing, key, val)

        # 3. Ensure clean single Admin profile
        admin = db.query(Profile).filter(Profile.email == "admin@kleanmaxpro.com").first()
        if not admin:
            admin = Profile(
                id="11111111-1111-1111-1111-111111111111",
                email="admin@kleanmaxpro.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin",
                role="admin",
                is_active=True,
                phone="+91 73388 82034",
            )
            db.add(admin)
        else:
            admin.full_name = "Admin"
            admin.role = "admin"

        # 4. Quotation counter
        if not db.query(QuotationCounter).filter(QuotationCounter.fiscal_year == "2026-27").first():
            counter = QuotationCounter(fiscal_year="2026-27", last_sequence=4)
            db.add(counter)

        # 5. Seed Core Services
        services_data = [
            # Kleanmax Pro
            Service(
                id="s1111111-1111-1111-1111-111111111111",
                service_code="SVC-WH-DEEP",
                service_name="Warehouse Deep Floor Scrubbing & Degreasing",
                category="cleaning",
                quotation_type="area_based",
                description="Comprehensive heavy-duty industrial rotary scrubbing, oil stain degreasing, slurry suction and high-gloss neutral wash.",
                default_uom="sq_ft",
                hsn_sac_code="998533",
                standard_rate=Decimal("4.5000"),
                tax_category="taxable",
                default_tax_rate=Decimal("18.00"),
                is_active=True,
                internal_notes="Standard rate per sq ft for warehouse floors up to 50,000 sq ft."
            ),
            Service(
                id="s2222222-2222-2222-2222-222222222222",
                service_code="SVC-IND-AUTO",
                service_name="Industrial Ride-On Automated Floor Cleaning",
                category="cleaning",
                quotation_type="area_based",
                description="High-speed mechanized auto-scrubbing with cylindrical nylon brushes and eco-friendly industrial cleaning chemical.",
                default_uom="sq_ft",
                hsn_sac_code="998533",
                standard_rate=Decimal("3.2500"),
                tax_category="taxable",
                default_tax_rate=Decimal("18.00"),
                is_active=True,
                internal_notes="Recommended for regular maintenance or large open shop floors."
            ),
            Service(
                id="s3333333-3333-3333-3333-333333333333",
                service_code="SVC-FAC-DUST",
                service_name="Factory High-Level Roof Truss & Pipeline Dusting",
                category="cleaning",
                quotation_type="area_based",
                description="Safety harness-assisted overhead beam, truss, cable tray and duct cleaning using explosion-proof industrial vacuums.",
                default_uom="sq_ft",
                hsn_sac_code="998533",
                standard_rate=Decimal("5.5000"),
                tax_category="taxable",
                default_tax_rate=Decimal("18.00"),
                is_active=True,
                internal_notes="Rate includes boom lift / scaffolding operator overhead."
            ),

            # Kleanmax Spares & Equipment
            Service(
                id="s5555555-5555-5555-5555-555555555555",
                service_code="EQ-RIDE-KMP850",
                service_name="KMP-850R Industrial Ride-On Scrubber Dryer",
                category="equipment_sales",
                quotation_type="item_based",
                description="850mm scrub width, 120L solution tank, heavy-duty traction motor, twin disc brushes, maintenance-free AGM battery pack.",
                default_uom="nos",
                hsn_sac_code="84798999",
                standard_rate=Decimal("485000.0000"),
                tax_category="taxable",
                default_tax_rate=Decimal("18.00"),
                is_active=True,
                internal_notes="OEM 1-year on-site comprehensive warranty included."
            ),
            Service(
                id="s6666666-6666-6666-6666-666666666666",
                service_code="EQ-VAC-WD80",
                service_name="KMP Heavy Duty Wet & Dry Industrial Vacuum 80L",
                category="equipment_sales",
                quotation_type="item_based",
                description="3000W triple bypass motor, stainless steel 80L tilt tank, complete accessory kit for sludge and fine dust extraction.",
                default_uom="nos",
                hsn_sac_code="84798999",
                standard_rate=Decimal("38500.0000"),
                tax_category="taxable",
                default_tax_rate=Decimal("18.00"),
                is_active=True,
                internal_notes="Popular unit for factory shop floors."
            ),
            Service(
                id="s8888888-8888-8888-8888-888888888888",
                service_code="REP-MAINT-SRV",
                service_name="Cleaning Equipment Maintenance & Overhaul Service",
                category="repair_service",
                quotation_type="repair_service",
                description="Comprehensive machine inspection, electrical diagnostic, brush motor overhaul, vacuum motor sealing and squeegee tuning.",
                default_uom="hours",
                hsn_sac_code="998719",
                standard_rate=Decimal("850.0000"),
                tax_category="taxable",
                default_tax_rate=Decimal("18.00"),
                is_active=True,
                internal_notes="Spare parts billed separately as per actuals."
            ),

            # Unique Painters
            Service(
                id="s-pnt-01",
                service_code="PNT-INT-ROYALE",
                service_name="Premium Interior Royale Luxury Emulsion (2 Coats + Primer)",
                category="painting",
                quotation_type="area_based",
                description="High-sheen anti-fungal luxury emulsion paint with surface putty smoothing and alkali-resistant primer.",
                default_uom="sq_ft",
                hsn_sac_code="995472",
                standard_rate=Decimal("28.5000"),
                tax_category="taxable",
                default_tax_rate=Decimal("18.00"),
                is_active=True
            ),
            Service(
                id="s-pnt-02",
                service_code="PNT-EXT-APEX",
                service_name="Exterior Apex Weatherproof Acrylic Protective Coating",
                category="painting",
                quotation_type="area_based",
                description="Heavy duty exterior facade weather-guard elastomeric coating with 5-year anti-fading warranty.",
                default_uom="sq_ft",
                hsn_sac_code="995472",
                standard_rate=Decimal("34.0000"),
                tax_category="taxable",
                default_tax_rate=Decimal("18.00"),
                is_active=True
            ),
            Service(
                id="s-pnt-03",
                service_code="PNT-EPOXY-IND",
                service_name="Industrial 1000-Micron Self-Leveling Epoxy Floor System",
                category="painting",
                quotation_type="area_based",
                description="Diamond floor grinding, high-adhesion epoxy primer, screed coat, and 1000-micron self-leveling aliphatic polyurethane topcoat.",
                default_uom="sq_ft",
                hsn_sac_code="995472",
                standard_rate=Decimal("65.0000"),
                tax_category="taxable",
                default_tax_rate=Decimal("18.00"),
                is_active=True
            ),

            # Cleantech Services
            Service(
                id="s-cts-01",
                service_code="CTS-SOLAR-WASH",
                service_name="De-Ionized Robotic Solar Panel Array Wash & Dusting",
                category="cleaning",
                quotation_type="item_based",
                description="Zero-mineral de-ionized water high-flow wash with soft scratch-free rotary brushes. Improves generation up to 18%.",
                default_uom="nos",
                hsn_sac_code="998533",
                standard_rate=Decimal("45.0000"),
                tax_category="taxable",
                default_tax_rate=Decimal("18.00"),
                is_active=True
            ),
            Service(
                id="s-cts-02",
                service_code="CTS-FAC-GLASS",
                service_name="High-Rise Glass Facade & Curtain Wall Cradle Cleaning",
                category="cleaning",
                quotation_type="area_based",
                description="Professional rope-access / cradle-assisted glass curtain wall, frame, and ACP silicone panel restoration.",
                default_uom="sq_ft",
                hsn_sac_code="998533",
                standard_rate=Decimal("6.5000"),
                tax_category="taxable",
                default_tax_rate=Decimal("18.00"),
                is_active=True
            ),
            Service(
                id="s-cts-04",
                service_code="CTS-AMC-FACILITY",
                service_name="Comprehensive Facility Annual Maintenance Contract (AMC)",
                category="amc",
                quotation_type="contract",
                description="Periodic scheduled monthly deep sanitization, HVAC duct inspection, and high-pressure exterior washing visits.",
                default_uom="months",
                hsn_sac_code="998533",
                standard_rate=Decimal("22000.0000"),
                tax_category="taxable",
                default_tax_rate=Decimal("18.00"),
                is_active=True
            ),
        ]

        for s in services_data:
            existing_s = db.query(Service).filter(Service.service_code == s.service_code).first()
            if not existing_s:
                db.add(s)
                db.flush()
                rate = ServiceRate(
                    service_id=s.id,
                    uom=s.default_uom,
                    rate=s.standard_rate,
                    is_current=True,
                )
                db.add(rate)

        # 6. Seed Sample Customers
        customers_data = [
            Customer(
                id="c1111111-1111-1111-1111-111111111111",
                customer_code="CUST-KMP-001",
                company_name="Foxconn Mega Tech Park",
                contact_person="Mr. R. Rajesh (Admin)",
                phone="+91 98401 22334",
                email="facilities@foxconn-india.com",
                gstin="33AAACF1029R1Z1",
                pan="AAACF1029R",
                billing_address_line1="Plot 10, Hi-Tech SEZ, Sriperumbudur",
                billing_city="Chennai",
                billing_state="Tamil Nadu",
                billing_state_code="33",
                billing_pincode="602105",
                is_active=True,
            ),
            Customer(
                id="c2222222-2222-2222-2222-222222222222",
                customer_code="CUST-KLM-002",
                company_name="Hyundai Motor Engineering Works",
                contact_person="Mr. S. Karthik (Procurement)",
                phone="+91 97909 44556",
                email="karthik.s@hyundai-auto.in",
                gstin="33AAACH4981M1ZK",
                pan="AAACH4981M",
                billing_address_line1="Automotive Hub, Irungattukottai",
                billing_city="Chennai",
                billing_state="Tamil Nadu",
                billing_state_code="33",
                billing_pincode="602117",
                is_active=True,
            ),
            Customer(
                id="c3333333-3333-3333-3333-333333333333",
                customer_code="CUST-UNP-003",
                company_name="Prestige Cyber Tower Corp",
                contact_person="Ms. Ananya Sharma (Facility Head)",
                phone="+91 94441 55667",
                email="infra@prestigegroup.com",
                gstin="33AABCP3891L1ZQ",
                pan="AABCP3891L",
                billing_address_line1="Tower B, OMR IT Expressway, Karapakkam",
                billing_city="Chennai",
                billing_state="Tamil Nadu",
                billing_state_code="33",
                billing_pincode="600097",
                is_active=True,
            ),
            Customer(
                id="c4444444-4444-4444-4444-444444444444",
                customer_code="CUST-CTS-004",
                company_name="Tata Power Solar & Logistics Park",
                contact_person="Mr. V. Sundaram (Operations)",
                phone="+91 98842 77889",
                email="sundaram.v@tatapowerclean.com",
                gstin="33AAACT9921B1ZM",
                pan="AAACT9921B",
                billing_address_line1="Logistics Hub, Vallam Vadagal Industrial Park",
                billing_city="Chennai",
                billing_state="Tamil Nadu",
                billing_state_code="33",
                billing_pincode="602105",
                is_active=True,
            )
        ]

        for c in customers_data:
            existing_c = db.query(Customer).filter(
                (Customer.id == c.id) | (Customer.customer_code == c.customer_code)
            ).first()
            if not existing_c:
                db.add(c)
        db.flush()

        # 7. Seed Sample Quotations for all 4 companies if empty
        cust_kmp = db.query(Customer).filter((Customer.customer_code == "CUST-KMP-001") | (Customer.id == "cust-01")).first()
        cust_klm = db.query(Customer).filter((Customer.customer_code == "CUST-KLM-002") | (Customer.id == "cust-02")).first()
        cust_unp = db.query(Customer).filter((Customer.customer_code == "CUST-UNP-003") | (Customer.id == "cust-03")).first()
        cust_cts = db.query(Customer).filter((Customer.customer_code == "CUST-CTS-004") | (Customer.id == "cust-04")).first()

        if cust_kmp and not db.query(Quotation).filter(Quotation.company_code == "kleanmaxpro").first():
            q1 = Quotation(
                id="q-kmp-001",
                company_code="kleanmaxpro",
                quotation_number="KMP/2026-27/0001",
                revision_number=0,
                customer_id=cust_kmp.id,
                quotation_type="area_based",
                status="approved",
                quotation_date=date.today() - timedelta(days=3),
                validity_date=date.today() + timedelta(days=27),
                customer_ref="PO-FOX-892",
                job_description="Comprehensive Industrial Floor Scrubbing & High-Gloss Degreasing for Main Production Hall 1 & 2",
                subtotal=Decimal("125000.00"),
                discount_type="none",
                discount_value=Decimal("0.00"),
                total_discount=Decimal("0.00"),
                freight_charges=Decimal("0.00"),
                packing_charges=Decimal("0.00"),
                other_charges=Decimal("0.00"),
                taxable_amount=Decimal("125000.00"),
                is_interstate=False,
                cgst_rate=Decimal("9.00"),
                cgst_amount=Decimal("11250.00"),
                sgst_rate=Decimal("9.00"),
                sgst_amount=Decimal("11250.00"),
                igst_rate=Decimal("0.00"),
                igst_amount=Decimal("0.00"),
                total_tax=Decimal("22500.00"),
                rounding_adjustment=Decimal("0.00"),
                final_amount=Decimal("147500.00"),
                amount_in_words="One Lakh Forty-Seven Thousand Five Hundred Rupees Only"
            )
            db.add(q1)

        if cust_klm and not db.query(Quotation).filter(Quotation.company_code == "kleanmax").first():
            q2 = Quotation(
                id="q-klm-001",
                company_code="kleanmax",
                quotation_number="KLM/2026-27/0001",
                revision_number=0,
                customer_id=cust_klm.id,
                quotation_type="repair_service",
                status="issued",
                quotation_date=date.today() - timedelta(days=5),
                validity_date=date.today() + timedelta(days=10),
                customer_ref="RFQ-HYU-3819",
                job_description="Karcher Scrubber Model B 40 C EP Complete Brush Drive Overhaul, Vacuum Hose Assembly & Chemical Valve Kit",
                subtotal=Decimal("42800.00"),
                discount_type="none",
                discount_value=Decimal("0.00"),
                total_discount=Decimal("0.00"),
                freight_charges=Decimal("1200.00"),
                packing_charges=Decimal("0.00"),
                other_charges=Decimal("0.00"),
                taxable_amount=Decimal("44000.00"),
                is_interstate=False,
                cgst_rate=Decimal("9.00"),
                cgst_amount=Decimal("3960.00"),
                sgst_rate=Decimal("9.00"),
                sgst_amount=Decimal("3960.00"),
                igst_rate=Decimal("0.00"),
                igst_amount=Decimal("0.00"),
                total_tax=Decimal("7920.00"),
                rounding_adjustment=Decimal("0.00"),
                final_amount=Decimal("51920.00"),
                amount_in_words="Fifty-One Thousand Nine Hundred Twenty Rupees Only"
            )
            db.add(q2)

        if cust_unp and not db.query(Quotation).filter(Quotation.company_code == "uniquepainters").first():
            q3 = Quotation(
                id="q-unp-001",
                company_code="uniquepainters",
                quotation_number="UNP/2026-27/0001",
                revision_number=0,
                customer_id=cust_unp.id,
                quotation_type="area_based",
                status="pending_approval",
                quotation_date=date.today() - timedelta(days=1),
                validity_date=date.today() + timedelta(days=29),
                customer_ref="PREST-TWR-PNT-99",
                job_description="Prestige Cyber Tower 4th & 5th Floor Interior Royale Emulsion Painting & Basement 1000-Micron Epoxy Coating",
                subtotal=Decimal("284000.00"),
                discount_type="percentage",
                discount_value=Decimal("5.00"),
                total_discount=Decimal("14200.00"),
                freight_charges=Decimal("0.00"),
                packing_charges=Decimal("0.00"),
                other_charges=Decimal("0.00"),
                taxable_amount=Decimal("269800.00"),
                is_interstate=False,
                cgst_rate=Decimal("9.00"),
                cgst_amount=Decimal("24282.00"),
                sgst_rate=Decimal("9.00"),
                sgst_amount=Decimal("24282.00"),
                igst_rate=Decimal("0.00"),
                igst_amount=Decimal("0.00"),
                total_tax=Decimal("48564.00"),
                rounding_adjustment=Decimal("0.00"),
                final_amount=Decimal("318364.00"),
                amount_in_words="Three Lakh Eighteen Thousand Three Hundred Sixty-Four Rupees Only"
            )
            db.add(q3)

        if cust_cts and not db.query(Quotation).filter(Quotation.company_code == "cleantech").first():
            q4 = Quotation(
                id="q-cts-001",
                company_code="cleantech",
                quotation_number="CTS/2026-27/0001",
                revision_number=0,
                customer_id=cust_cts.id,
                quotation_type="contract",
                status="approved",
                quotation_date=date.today() - timedelta(days=2),
                validity_date=date.today() + timedelta(days=43),
                customer_ref="TATA-SOLAR-AMC-26",
                job_description="Annual Maintenance Contract (AMC): 1.5MW Solar Panel Array Robotic De-ionized Cleaning (12 Monthly Cycles)",
                subtotal=Decimal("198000.00"),
                discount_type="none",
                discount_value=Decimal("0.00"),
                total_discount=Decimal("0.00"),
                freight_charges=Decimal("0.00"),
                packing_charges=Decimal("0.00"),
                other_charges=Decimal("0.00"),
                taxable_amount=Decimal("198000.00"),
                is_interstate=False,
                cgst_rate=Decimal("9.00"),
                cgst_amount=Decimal("17820.00"),
                sgst_rate=Decimal("9.00"),
                sgst_amount=Decimal("17820.00"),
                igst_rate=Decimal("0.00"),
                igst_amount=Decimal("0.00"),
                total_tax=Decimal("35640.00"),
                rounding_adjustment=Decimal("0.00"),
                final_amount=Decimal("233640.00"),
                amount_in_words="Two Lakh Thirty-Three Thousand Six Hundred Forty Rupees Only"
            )
            db.add(q4)

        db.commit()
        print("Database seeded successfully with 4 companies and complete catalogues!")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
