from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import select
from backend.app.models.all_models import QuotationCounter, CompanySetting

def get_current_fiscal_year(d: date = None) -> str:
    """Returns Indian Financial Year format 'YYYY-YY', e.g. 2026-27."""
    if d is None:
        d = date.today()
    year = d.year
    # Indian FY starts on April 1
    if d.month >= 4:
        next_yr_short = str(year + 1)[-2:]
        return f"{year}-{next_yr_short}"
    else:
        prev_yr = year - 1
        curr_yr_short = str(year)[-2:]
        return f"{prev_yr}-{curr_yr_short}"


def generate_next_quotation_number(db: Session, quotation_date: date = None) -> str:
    """Atomically generates the next sequential quotation number in a race-condition safe manner.
    Format: {PREFIX}/{FY}/{SEQUENCE:04d}, e.g. KMP/2026-27/0001
    """
    if quotation_date is None:
        quotation_date = date.today()

    fy = get_current_fiscal_year(quotation_date)

    # Get prefix from company settings if available
    prefix = "KMP"
    company = db.query(CompanySetting).first()
    if company and company.quotation_prefix:
        prefix = company.quotation_prefix.strip().upper()

    # Lock counter row with FOR UPDATE when on PostgreSQL
    # On SQLite or Postgres, we query and update inside the active transaction
    counter = db.query(QuotationCounter).filter(QuotationCounter.fiscal_year == fy).with_for_update().first() if db.bind.dialect.name == "postgresql" else db.query(QuotationCounter).filter(QuotationCounter.fiscal_year == fy).first()

    if not counter:
        counter = QuotationCounter(fiscal_year=fy, last_sequence=1)
        db.add(counter)
        db.flush()
        seq = 1
    else:
        counter.last_sequence += 1
        seq = counter.last_sequence
        db.flush()

    return f"{prefix}/{fy}/{seq:04d}"
