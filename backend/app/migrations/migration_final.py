"""
Comprehensive, Idempotent Database Migration Script
Works with both SQLite (local development) and PostgreSQL / Supabase (production).
Checks all tables and columns, adds any missing columns dynamically, and seeds 4 companies.
"""

import sys
import os
import logging
from sqlalchemy import text, inspect

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.core.database import engine, Base, SessionLocal
from backend.app.models.all_models import (
    CompanySetting, Profile, Customer, Service, ServiceRate,
    Quotation, QuotationSection, QuotationItem, QuotationRevision, AuditLog
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def migrate_database():
    logger.info("==================================================")
    logger.info("STARTING COMPLETE DATABASE MIGRATION")
    logger.info("==================================================")

    # 1. Create all tables defined in SQLAlchemy models if not exist
    Base.metadata.create_all(bind=engine)
    logger.info("✓ Checked and ensured all 10 core tables exist.")

    # 2. Inspect database columns dynamically and add missing ones
    inspector = inspect(engine)
    db_dialect = engine.dialect.name.lower()
    logger.info(f"Database dialect detected: {db_dialect}")

    column_definitions = {
        "company_settings": [
            ("company_code", "VARCHAR(50) DEFAULT 'kleanmaxpro'"),
            ("legal_name", "VARCHAR(255)"),
            ("pan", "VARCHAR(20)"),
            ("cin", "VARCHAR(30)"),
            ("address_line2", "VARCHAR(255)"),
            ("phone1", "VARCHAR(50)"),
            ("phone2", "VARCHAR(50)"),
            ("website", "VARCHAR(255)"),
            ("bank_account_name", "VARCHAR(255)"),
            ("bank_branch", "VARCHAR(255)"),
            ("logo_url", "TEXT"),
            ("tagline", "VARCHAR(255)"),
            ("brand_color", "VARCHAR(20) DEFAULT '#FED10C'"),
            ("signatory_name", "VARCHAR(255) DEFAULT 'Mr. Manikandan Balamurugan'"),
            ("signatory_designation", "VARCHAR(255) DEFAULT 'Sales and Service Head'"),
            ("default_payment_terms", "TEXT"),
            ("default_delivery_terms", "TEXT"),
            ("default_warranty_terms", "TEXT"),
            ("about_us", "TEXT"),
        ],
        "quotations": [
            ("company_code", "VARCHAR(50) DEFAULT 'kleanmaxpro'"),
            ("snapshot_json", "JSON" if db_dialect == "postgresql" else "TEXT"),
            ("image_url", "TEXT"),
            ("customer_ref", "VARCHAR(100)"),
            ("job_description", "TEXT"),
            ("notes", "TEXT"),
            ("terms_and_conditions", "TEXT"),
            ("payment_terms", "TEXT"),
            ("delivery_terms", "TEXT"),
            ("warranty_terms", "TEXT"),
            ("signatory_name", "VARCHAR(255) DEFAULT 'Mr. Manikandan Balamurugan'"),
            ("signatory_designation", "VARCHAR(255) DEFAULT 'Sales and Service Head'"),
        ],
        "customers": [
            ("billing_address_line2", "VARCHAR(255)"),
            ("delivery_address_line1", "VARCHAR(255)"),
            ("delivery_address_line2", "VARCHAR(255)"),
            ("delivery_city", "VARCHAR(100)"),
            ("delivery_state", "VARCHAR(100)"),
            ("delivery_state_code", "VARCHAR(10)"),
            ("delivery_pincode", "VARCHAR(20)"),
            ("pan", "VARCHAR(20)"),
            ("notes", "TEXT"),
        ],
        "services": [
            ("company_code", "VARCHAR(50) DEFAULT 'kleanmaxpro'"),
            ("image_url", "TEXT"),
            ("hsn_sac", "VARCHAR(50)"),
            ("tax_rate", "NUMERIC(5, 2) DEFAULT 18.00"),
        ]
    }

    with engine.connect() as conn:
        for table_name, columns in column_definitions.items():
            if table_name in inspector.get_table_names():
                existing_cols = [c["name"].lower() for c in inspector.get_columns(table_name)]
                for col_name, col_type in columns:
                    if col_name.lower() not in existing_cols:
                        logger.info(f"Adding missing column: {table_name}.{col_name} ({col_type})")
                        try:
                            conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type};"))
                            conn.commit()
                        except Exception as e:
                            logger.warning(f"Note on {table_name}.{col_name}: {e}")

    logger.info("✓ Column verification and dynamic migration completed.")

    # 3. Seed / Verify All 4 Company Settings
    db = SessionLocal()
    try:
        companies_seed = [
            {
                "company_code": "kleanmaxpro",
                "company_name": "Klean Max Pro",
                "legal_name": "KLEAN MAX PRO PRIVATE LIMITED",
                "gstin": "33AABCK1234F1Z8",
                "address_line1": "No. 6, B6, Jayam Industrial Estate, Near Porur Toll Plaza",
                "address_line2": "Vanagaram",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "state_code": "33",
                "pincode": "600077",
                "phone1": "+91 73388 82036",
                "phone2": "+91 97101 48218",
                "email": "operations@kleanmaxpro.com",
                "website": "www.kleanmaxpro.com",
                "bank_name": "ICICI BANK",
                "bank_account_name": "KLEAN MAX PRO PRIVATE LIMITED",
                "bank_account_no": "027505010327",
                "bank_ifsc": "ICIC0000275",
                "bank_branch": "PORUR, CHENNAI",
                "quotation_prefix": "KMP",
                "default_validity_days": 30,
                "brand_color": "#FED10C",
                "tagline": "Industrial Area Floor Scrubbing & Warehouse Maintenance",
                "about_us": "Kleanmax Pro is a leading provider of cleaning machine rental and sales services, offering a wide range of equipment — from vacuum cleaners to ride-on scrubbers — to industries, malls, commercial spaces, and facility management companies across Chennai, Bangalore, Hyderabad and Visakhapatnam."
            },
            {
                "company_code": "kleanmax",
                "company_name": "Kleanmax",
                "legal_name": "KLEANMAX SERVICES & SPARES",
                "gstin": "33AABCK1234F1Z8",
                "address_line1": "No. 6, B6, Jayam Industrial Estate, Chettiyar Agaram First Main Road",
                "address_line2": "Near Porur Toll Plaza, Vanagaram",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "state_code": "33",
                "pincode": "600077",
                "phone1": "+91 73388 82036",
                "phone2": "+91 97101 48218",
                "email": "service@kleanmax.in",
                "website": "www.kleanmaxpro.com",
                "bank_name": "KARUR VYSYA BANK (KVB)",
                "bank_account_name": "KLEANMAX SERVICES",
                "bank_account_no": "1278135000007113",
                "bank_ifsc": "KVBL0001278",
                "bank_branch": "ASHOK NAGAR, CHENNAI",
                "quotation_prefix": "KM",
                "default_validity_days": 30,
                "brand_color": "#0284C7",
                "tagline": "Cleaning Machine Service, Motherboard Repair & Spare Parts",
                "about_us": "Kleanmax is a trusted name in the repair and maintenance of all types of cleaning equipment — from vacuum cleaners to ride-on scrubbers. With 12+ years of experience since 2013, we operate a fully equipped service center with custom parts fabrication."
            },
            {
                "company_code": "uniquepainters",
                "company_name": "Unique Painters",
                "legal_name": "UNIQUE PAINTERS & PROTECTIVE COATINGS",
                "gstin": "33BWHPM8908H2ZP9",
                "address_line1": "No. 6, B6, Jayam Industrial Estate, Near Porur Toll Plaza",
                "address_line2": "Vanagaram",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "state_code": "33",
                "pincode": "600077",
                "phone1": "9710148218",
                "phone2": "7338882034",
                "email": "uniquepainters11@gmail.com",
                "website": "www.uniquepainters.in",
                "bank_name": "INDIAN OVERSEAS BANK",
                "bank_account_name": "K. SRIDHAR",
                "bank_account_no": "042802000001234",
                "bank_ifsc": "IOBA0000428",
                "bank_branch": "VALASARAVAKKAM, CHENNAI",
                "quotation_prefix": "UNP",
                "default_validity_days": 30,
                "brand_color": "#9333EA",
                "tagline": "Industrial Epoxy Flooring, Wall Putty & Protective Coatings",
                "about_us": "Unique Painters is a trusted contractor for commercial, industrial, and protective coatings with over a decade of hands-on expertise in epoxy floor systems and robotic spray coatings."
            },
            {
                "company_code": "cleantech",
                "company_name": "Cleantech Services",
                "legal_name": "CLEANTECH SERVICES",
                "gstin": "33BWHPM8908H2ZP9",
                "address_line1": "No. 6, B6, Jayam Industrial Estate, Chettiyar Agaram First Main Road",
                "address_line2": "Near Porur Toll Plaza, Vanagaram",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "state_code": "33",
                "pincode": "600077",
                "phone1": "9500065813",
                "phone2": "+91 73388 82036",
                "email": "cleantechservices11@gmail.com",
                "website": "www.cleantechservices.in",
                "bank_name": "IDFC FIRST BANK",
                "bank_account_name": "CLEANTECH",
                "bank_account_no": "73388820361",
                "bank_ifsc": "IDFB0081831",
                "bank_branch": "CHENNAI - IYYAPANTHANGAL BRANCH",
                "quotation_prefix": "CTS",
                "default_validity_days": 30,
                "brand_color": "#14B8A6",
                "tagline": "Rooftop Solar Panel Wash, Glass Facade Cleaning & Scheduled AMC",
                "about_us": "Cleantech Services specializes in high-quality performance-tested cleaning solutions for solar panels, industrial facades, and periodic AMC maintenance."
            }
        ]

        for c_data in companies_seed:
            code = c_data["company_code"]
            existing = db.query(CompanySetting).filter(CompanySetting.company_code == code).first()
            if existing:
                for k, v in c_data.items():
                    if getattr(existing, k, None) is None or getattr(existing, k) == "":
                        setattr(existing, k, v)
                logger.info(f"✓ Company '{code}' settings verified & updated.")
            else:
                new_c = CompanySetting(**c_data)
                db.add(new_c)
                logger.info(f"✓ Company '{code}' newly seeded.")

        db.commit()
        logger.info("==================================================")
        logger.info("DATABASE MIGRATION COMPLETED SUCCESSFULLY!")
        logger.info("==================================================")
    except Exception as e:
        db.rollback()
        logger.error(f"Migration error: {e}", exc_info=True)
    finally:
        db.close()


if __name__ == "__main__":
    migrate_database()
