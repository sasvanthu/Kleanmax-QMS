import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.core.database import Base
from backend.app.models.all_models import CompanySetting, QuotationCounter
from backend.app.services.numbering import (
    get_current_fiscal_year, generate_next_quotation_number
)

TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def numbering_db():
    Base.metadata.create_all(bind=engine)
    db = Session()
    company = CompanySetting(quotation_prefix="KMP")
    db.add(company)
    db.commit()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


def test_indian_fiscal_year_calculation():
    # April 2026 -> FY 2026-27
    d_apr = date(2026, 4, 1)
    assert get_current_fiscal_year(d_apr) == "2026-27"

    # October 2026 -> FY 2026-27
    d_oct = date(2026, 10, 15)
    assert get_current_fiscal_year(d_oct) == "2026-27"

    # March 2027 -> Still FY 2026-27!
    d_mar = date(2027, 3, 31)
    assert get_current_fiscal_year(d_mar) == "2026-27"

    # April 2027 -> FY 2027-28
    d_next = date(2027, 4, 1)
    assert get_current_fiscal_year(d_next) == "2027-28"


def test_sequential_quotation_numbering(numbering_db):
    d = date(2026, 10, 15)

    n1 = generate_next_quotation_number(numbering_db, d)
    assert n1 == "KMP/2026-27/0001"

    n2 = generate_next_quotation_number(numbering_db, d)
    assert n2 == "KMP/2026-27/0002"

    n3 = generate_next_quotation_number(numbering_db, d)
    assert n3 == "KMP/2026-27/0003"
