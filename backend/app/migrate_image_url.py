
"""
Migration: Add image_url column to quotations table.
Run from project root: python backend/app/migrate_image_url.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import text, inspect
from backend.app.core.database import engine

def migrate():
    with engine.connect() as conn:
        insp = inspect(engine)
        columns = [col['name'] for col in insp.get_columns('quotations')]
        
        if 'image_url' not in columns:
            conn.execute(text("ALTER TABLE quotations ADD COLUMN image_url TEXT"))
            conn.commit()
            print("DONE: Added image_url column to quotations table")
        else:
            print("INFO: image_url column already exists in quotations table")

        if 'snapshot_json' not in columns:
            conn.execute(text("ALTER TABLE quotations ADD COLUMN snapshot_json TEXT"))
            conn.commit()
            print("DONE: Added snapshot_json column to quotations table")
        else:
            print("INFO: snapshot_json already exists")

if __name__ == "__main__":
    migrate()
