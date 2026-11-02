from datetime import date, datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal, engine, Base
from backend.app.core.security import get_password_hash
from backend.app.models.all_models import (
    Profile, CompanySetting, Customer, Service, ServiceRate, QuotationCounter
)

def run_seed():
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if company settings exist
        if not db.query(CompanySetting).first():
            company = CompanySetting(
                id="c0000000-0000-0000-0000-000000000001",
                company_name="Klean Max Pro",
                legal_name="Klean Max Pro Commercial Services Private Limited",
                gstin="33AABCK1234F1Z8",
                pan="AABCK1234F",
                cin="U74999TN2021PTC145678",
                address_line1="6, Jayam Industrial Estate, Chettyar Agaram 1st St",
                address_line2="Opp to Ishwarya Apts, Vanagaram",
                city="Chennai",
                state="Tamil Nadu",
                state_code="33",
                pincode="600095",
                phone1="+91 73388 82034",
                phone2="+91 97101 48218",
                email="info@kleanmaxpro.com",
                website="www.kleanmaxpro.com",
                bank_name="HDFC Bank Limited",
                bank_account_no="50200088991122",
                bank_ifsc="HDFC0001234",
                bank_branch="Porur Branch, Chennai",
                quotation_prefix="KMP",
                default_validity_days=30,
                rounding_policy="HALF_UP",
            )
            db.add(company)

        # Ensure clean single Admin profile
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

        # Remove any legacy mock profiles
        db.query(Profile).filter(Profile.email.in_(["manager@kleanmaxpro.com", "staff@kleanmaxpro.com"])).delete(synchronize_session=False)

        # Quotation counter
        if not db.query(QuotationCounter).filter(QuotationCounter.fiscal_year == "2026-27").first():
            counter = QuotationCounter(fiscal_year="2026-27", last_sequence=0)
            db.add(counter)
        # Seed Services
        if not db.query(Service).first():
            services_data = [
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
                Service(
                    id="s4444444-4444-4444-4444-444444444444",
                    service_code="SVC-EPOXY-COAT",
                    service_name="Industrial Epoxy Floor Coating & Line Marking",
                    category="painting",
                    quotation_type="area_based",
                    description="Surface preparation with diamond grinding, 100% solids epoxy primer, intermediate self-leveling coat and 500-micron polyurethane topcoat.",
                    default_uom="sq_ft",
                    hsn_sac_code="995472",
                    standard_rate=Decimal("42.0000"),
                    tax_category="taxable",
                    default_tax_rate=Decimal("18.00"),
                    is_active=True,
                    internal_notes="Warranty 24 months against peeling and delamination."
                ),
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
                    id="s7777777-7777-7777-7777-777777777777",
                    service_code="RNT-RIDE-SCRUB",
                    service_name="Ride-on Scrubber Daily/Weekly Rental with Operator",
                    category="rental",
                    quotation_type="rental",
                    description="Rental of heavy duty ride-on scrubber including trained operator, fuel/battery charge, and standard detergents.",
                    default_uom="days",
                    hsn_sac_code="997312",
                    standard_rate=Decimal("4500.0000"),
                    tax_category="taxable",
                    default_tax_rate=Decimal("18.00"),
                    is_active=True,
                    internal_notes="Minimum 3-day rental period."
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
            ]
            db.add_all(services_data)
            db.flush()

            for s in services_data:
                rate = ServiceRate(
                    service_id=s.id,
                    uom=s.default_uom,
                    rate=s.standard_rate,
                    is_current=True,
                )
                db.add(rate)

        db.commit()
        print("Database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
