import uuid
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import (
    Column, String, Boolean, Integer, Numeric, Text, Date, DateTime,
    ForeignKey, UniqueConstraint, JSON
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base, GUID

def generate_uuid():
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    auth_user_id = Column(GUID, unique=True, nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="staff")  # 'admin', 'manager', 'staff'
    is_active = Column(Boolean, nullable=False, default=True)
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class CompanySetting(Base):
    __tablename__ = "company_settings"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    company_name = Column(String(255), nullable=False, default="Klean Max Pro")
    legal_name = Column(String(255), nullable=False, default="Klean Max Pro Commercial Services Private Limited")
    gstin = Column(String(15), nullable=True, default="33AABCK1234F1Z8")
    pan = Column(String(10), nullable=True, default="AABCK1234F")
    cin = Column(String(30), nullable=True, default="U74999TN2021PTC145678")
    address_line1 = Column(String(255), nullable=False, default="6, Jayam Industrial Estate, Chettyar Agaram 1st St")
    address_line2 = Column(String(255), nullable=True, default="Opp to Ishwarya Apts, Vanagaram")
    city = Column(String(100), nullable=False, default="Chennai")
    state = Column(String(100), nullable=False, default="Tamil Nadu")
    state_code = Column(String(2), nullable=False, default="33")
    pincode = Column(String(20), nullable=False, default="600095")
    phone1 = Column(String(50), default="+91 73388 82034")
    phone2 = Column(String(50), default="+91 97101 48218")
    email = Column(String(255), default="info@kleanmaxpro.com")
    website = Column(String(255), default="www.kleanmaxpro.com")
    bank_name = Column(String(255), default="HDFC Bank Limited")
    bank_account_no = Column(String(100), default="50200088991122")
    bank_ifsc = Column(String(50), default="HDFC0001234")
    bank_branch = Column(String(255), default="Porur Branch, Chennai")
    logo_url = Column(String(500), default="/static/logo.png")
    quotation_prefix = Column(String(20), default="KMP")
    default_validity_days = Column(Integer, default=30)
    rounding_policy = Column(String(50), default="HALF_UP")
    default_payment_terms = Column(Text, default="100% advance along with confirmed work order, or 50% advance and balance on completion.")
    default_delivery_terms = Column(Text, default="Work will commence within 3-5 business days of advance receipt and site clearance.")
    default_warranty_terms = Column(Text, default="Standard workmanship warranty of 30 days on deep cleaning services. Equipment as per OEM warranty terms.")
    terms_and_conditions = Column(Text, default="1. Rates quoted are valid for 30 days from quotation date.\n2. Water and electricity required for cleaning work to be supplied by customer at site.\n3. GST is applicable as per government regulations.\n4. Disputes subject to Chennai jurisdiction.")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    customer_code = Column(String(50), unique=True, nullable=True, index=True)
    company_name = Column(String(255), nullable=False, index=True)
    contact_person = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    gstin = Column(String(15), nullable=True)
    pan = Column(String(10), nullable=True)
    billing_address_line1 = Column(String(255), nullable=False)
    billing_address_line2 = Column(String(255), nullable=True)
    billing_city = Column(String(100), nullable=False, default="Chennai")
    billing_state = Column(String(100), nullable=False, default="Tamil Nadu")
    billing_state_code = Column(String(2), nullable=False, default="33")
    billing_pincode = Column(String(20), nullable=False)
    delivery_address_line1 = Column(String(255), nullable=True)
    delivery_address_line2 = Column(String(255), nullable=True)
    delivery_city = Column(String(100), nullable=True)
    delivery_state = Column(String(100), nullable=True)
    delivery_state_code = Column(String(2), nullable=True)
    delivery_pincode = Column(String(20), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    notes = Column(Text, nullable=True)
    created_by_id = Column(GUID, ForeignKey("profiles.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    quotations = relationship("Quotation", back_populates="customer")


class Service(Base):
    __tablename__ = "services"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    service_code = Column(String(50), unique=True, nullable=False, index=True)
    service_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # cleaning, painting, equipment_sales, spare_parts, repair_service, rental, amc
    quotation_type = Column(String(50), nullable=False, default="area_based")  # area_based, item_based, repair_service, rental, contract
    description = Column(Text, nullable=True)
    default_uom = Column(String(50), nullable=False, default="sq_ft")  # sq_ft, sq_m, nos, hours, days, months, sets
    hsn_sac_code = Column(String(20), default="998533")
    standard_rate = Column(Numeric(14, 4), nullable=False, default=Decimal("0.0000"))
    tax_category = Column(String(50), nullable=False, default="taxable")  # taxable, exempt, nil_rated
    default_tax_rate = Column(Numeric(5, 2), nullable=False, default=Decimal("18.00"))
    is_active = Column(Boolean, nullable=False, default=True)
    internal_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    rates = relationship("ServiceRate", back_populates="service", cascade="all, delete-orphan")


class ServiceRate(Base):
    __tablename__ = "service_rates"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    service_id = Column(GUID, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    uom = Column(String(50), nullable=False, default="sq_ft")
    rate = Column(Numeric(14, 4), nullable=False)
    effective_from = Column(Date, nullable=False, default=date.today)
    effective_to = Column(Date, nullable=True)
    is_current = Column(Boolean, nullable=False, default=True)
    min_area = Column(Numeric(14, 4), nullable=True)
    max_area = Column(Numeric(14, 4), nullable=True)
    created_by_id = Column(GUID, ForeignKey("profiles.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    service = relationship("Service", back_populates="rates")


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    quotation_number = Column(String(100), nullable=False, index=True)
    revision_number = Column(Integer, nullable=False, default=0)
    parent_quotation_id = Column(GUID, ForeignKey("quotations.id"), nullable=True)
    customer_id = Column(GUID, ForeignKey("customers.id"), nullable=False)
    quotation_type = Column(String(50), nullable=False, default="area_based")
    status = Column(String(50), nullable=False, default="draft")  # draft, pending_approval, approved, issued, revised, cancelled
    quotation_date = Column(Date, nullable=False, default=date.today)
    validity_date = Column(Date, nullable=False)
    customer_ref = Column(String(100), nullable=True)
    job_description = Column(Text, nullable=True)
    payment_terms = Column(Text, nullable=True)
    delivery_terms = Column(Text, nullable=True)
    warranty_terms = Column(Text, nullable=True)
    terms_and_conditions = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    # Authoritative financial snapshot
    subtotal = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    discount_type = Column(String(50), nullable=False, default="none")  # none, percentage, fixed
    discount_value = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    total_discount = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    freight_charges = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    packing_charges = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    other_charges = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    taxable_amount = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))

    is_interstate = Column(Boolean, nullable=False, default=False)
    cgst_rate = Column(Numeric(5, 2), nullable=False, default=Decimal("9.00"))
    cgst_amount = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    sgst_rate = Column(Numeric(5, 2), nullable=False, default=Decimal("9.00"))
    sgst_amount = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    igst_rate = Column(Numeric(5, 2), nullable=False, default=Decimal("0.00"))
    igst_amount = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    total_tax = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))

    rounding_adjustment = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    final_amount = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    amount_in_words = Column(Text, nullable=True)

    prepared_by_id = Column(GUID, ForeignKey("profiles.id"), nullable=True)
    approved_by_id = Column(GUID, ForeignKey("profiles.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    issued_at = Column(DateTime, nullable=True)
    snapshot_json = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("quotation_number", "revision_number", name="uq_quotation_revision"),
    )

    customer = relationship("Customer", back_populates="quotations")
    sections = relationship("QuotationSection", back_populates="quotation", cascade="all, delete-orphan", order_by="QuotationSection.section_order")
    items = relationship("QuotationItem", back_populates="quotation", cascade="all, delete-orphan", order_by="QuotationItem.item_order")
    revisions = relationship("QuotationRevision", back_populates="quotation", cascade="all, delete-orphan", foreign_keys="QuotationRevision.quotation_id")
    prepared_by = relationship("Profile", foreign_keys=[prepared_by_id])
    approved_by = relationship("Profile", foreign_keys=[approved_by_id])


class QuotationSection(Base):
    __tablename__ = "quotation_sections"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    quotation_id = Column(GUID, ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    section_name = Column(String(255), nullable=False)
    section_order = Column(Integer, nullable=False, default=1)
    service_id = Column(GUID, ForeignKey("services.id"), nullable=True)
    service_name = Column(String(255), nullable=False)
    length = Column(Numeric(14, 4), nullable=False)
    breadth = Column(Numeric(14, 4), nullable=False)
    measurement_unit = Column(String(20), nullable=False, default="ft")  # ft, m, sq_ft, sq_m
    calculated_area = Column(Numeric(14, 4), nullable=False)
    repetitions = Column(Integer, nullable=False, default=1)
    billable_area = Column(Numeric(14, 4), nullable=False)
    billable_uom = Column(String(20), nullable=False, default="sq_ft")
    rate_source = Column(String(50), nullable=False, default="catalogue")  # catalogue, manual_override
    original_catalogue_rate = Column(Numeric(14, 4), nullable=False, default=Decimal("0.0000"))
    applied_rate = Column(Numeric(14, 4), nullable=False)
    override_reason = Column(Text, nullable=True)
    override_by_id = Column(GUID, ForeignKey("profiles.id"), nullable=True)
    override_at = Column(DateTime, nullable=True)
    discount_percent = Column(Numeric(5, 2), nullable=False, default=Decimal("0.00"))
    line_total = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    quotation = relationship("Quotation", back_populates="sections")
    override_by = relationship("Profile", foreign_keys=[override_by_id])


class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    quotation_id = Column(GUID, ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    section_id = Column(GUID, ForeignKey("quotation_sections.id", ondelete="SET NULL"), nullable=True)
    item_order = Column(Integer, nullable=False, default=1)
    service_id = Column(GUID, ForeignKey("services.id"), nullable=True)
    item_code = Column(String(100), nullable=True)
    item_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    hsn_sac = Column(String(20), nullable=True)
    quotation_type = Column(String(50), nullable=False, default="area_based")
    quantity = Column(Numeric(14, 4), nullable=False, default=Decimal("1.0000"))
    uom = Column(String(50), nullable=False, default="nos")
    unit_price = Column(Numeric(14, 4), nullable=False, default=Decimal("0.0000"))
    rate_source = Column(String(50), nullable=False, default="catalogue")
    original_catalogue_rate = Column(Numeric(14, 4), nullable=False, default=Decimal("0.0000"))
    applied_rate = Column(Numeric(14, 4), nullable=False)
    override_reason = Column(Text, nullable=True)
    override_by_id = Column(GUID, ForeignKey("profiles.id"), nullable=True)
    override_at = Column(DateTime, nullable=True)
    discount_type = Column(String(50), nullable=False, default="none")
    discount_value = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    taxable_value = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    tax_rate = Column(Numeric(5, 2), nullable=False, default=Decimal("18.00"))
    cgst_amount = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    sgst_amount = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    igst_amount = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    line_total = Column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    quotation = relationship("Quotation", back_populates="items")


class QuotationRevision(Base):
    __tablename__ = "quotation_revisions"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    quotation_id = Column(GUID, ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    revision_number = Column(Integer, nullable=False)
    previous_quotation_id = Column(GUID, ForeignKey("quotations.id"), nullable=True)
    revised_by_id = Column(GUID, ForeignKey("profiles.id"), nullable=True)
    revision_reason = Column(Text, nullable=False)
    snapshot_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    quotation = relationship("Quotation", back_populates="revisions", foreign_keys=[quotation_id])
    revised_by = relationship("Profile", foreign_keys=[revised_by_id])


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(GUID, primary_key=True, default=generate_uuid)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    performed_by_id = Column(GUID, ForeignKey("profiles.id"), nullable=True)
    changes_json = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    performed_by = relationship("Profile", foreign_keys=[performed_by_id])


class QuotationCounter(Base):
    __tablename__ = "quotation_counters"

    fiscal_year = Column(String(20), primary_key=True)
    last_sequence = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
