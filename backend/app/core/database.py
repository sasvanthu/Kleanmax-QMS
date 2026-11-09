import uuid
from sqlalchemy import create_engine, String, TypeDecorator
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

class GUID(TypeDecorator):
    """Platform-independent GUID/ID type.
    Stores as VARCHAR(36) or UUID.
    """
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return str(value)

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Replace postgres:// or postgresql:// with postgresql+psycopg2:// for SQLAlchemy compatibility
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
elif db_url.startswith("sqlite:///./"):
    from pathlib import Path
    db_filename = db_url.replace("sqlite:///./", "")
    if not Path(db_filename).exists():
        project_root = Path(__file__).resolve().parent.parent.parent.parent
        root_db = project_root / db_filename
        if root_db.exists():
            db_url = f"sqlite:///{root_db.as_posix()}"

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
