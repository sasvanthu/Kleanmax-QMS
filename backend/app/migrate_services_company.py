import sqlite3

def run_migration():
    conn = sqlite3.connect('kleanmaxpro.db')
    cur = conn.cursor()
    cur.execute('PRAGMA table_info(services)')
    cols = [r[1] for r in cur.fetchall()]
    if 'company_code' not in cols:
        cur.execute("ALTER TABLE services ADD COLUMN company_code VARCHAR(50) DEFAULT 'kleanmaxpro'")
        conn.commit()
        print("Successfully added company_code to services table.")
    else:
        print("company_code column already exists in services table.")

    # Insert or update official Kleanmax Pro rental products from the PDF
    rental_machines = [
        (
            "KMP-RENT-RB800",
            "RIDE ON SCRUBBER MACHINE RB-800",
            "rental",
            "rental",
            "BRUSH SCRUBBING WIDTH - 800mm\nSUCTION WIDTH - 1100mm\nCOVERAGE AREA - 4800M.SQ/HR\nWORKING SPEED - 6KM/HR\nAIRFLOW RATE - 33L/SEC\nVACCUM PRESSURE - 1650MM\nPOWER - 24V\nTOTAL POWER - 2400W\nBRUSH MOTOR - 2*550W\nVACCUM MOTOR - 550W\nPERFORMANCE - 1950 m2/hr\nTANK CAPACITY - 120LTRS\nDIAMETRE OF BRUSH - 405MM\nDRIVER MOTOR POWER - 750MM",
            "NOS",
            "8479",
            32000.00,
            "taxable",
            18.00,
            "kleanmaxpro"
        ),
        (
            "KMP-RENT-RB650",
            "RIDE ON SCRUBBER MACHINE RB-650",
            "rental",
            "rental",
            "Scrubbing Width: 650 mm\nSuction / Squeegee Width: 870 mm\nTheoretical Area Coverage: 4,225 m2/hr\nWorking Speed: Up to 6.5 km/hr (Travel speed up to 7 km/hr)\nPower Supply / Battery: 24 V DC / 200 Ah\nTotal Power: 1,600 W\nBrushes: 2 disc brushes, 333 mm diameter each, running at 180 RPM\nBrush Pressure: 25 kg\nSolution / Fresh Water Tank: 100 L\nRecovery / Dirty Water Tank: 100 L",
            "NOS",
            "8479",
            27000.00,
            "taxable",
            18.00,
            "kleanmaxpro"
        ),
        (
            "KMP-RENT-BD5050",
            "WALK BEHIND SCRUBBER DRYER BD-50/50",
            "rental",
            "rental",
            "Working width brushes: 510 mm\nWorking width suction: 850 mm\nFresh/dirty water tank: 50 / 50 L\nArea performance: 2000 m2/h\nBattery powered 24V with onboard charger",
            "NOS",
            "8479",
            18000.00,
            "taxable",
            18.00,
            "kleanmaxpro"
        ),
        (
            "KMP-RENT-BDS43150",
            "SINGLE DISC SCRUBBER MACHINE BDS 43/150",
            "rental",
            "rental",
            "Working width: 430 mm\nBrush speed: 150 rpm\nMotor rating: 1500 W\nHeavy-duty planetary gear drive for polishing, stripping and scrubbing",
            "NOS",
            "8479",
            8500.00,
            "taxable",
            18.00,
            "kleanmaxpro"
        ),
        (
            "KMP-RENT-NT702",
            "INDUSTRIAL WET & DRY VACUUM CLEANER NT 70/2",
            "rental",
            "rental",
            "Air flow: 2 x 74 l/s\nVacuum: 254 mbar\nContainer capacity: 70 L robust plastic tank\nDual high-performance bypass suction motors",
            "NOS",
            "8479",
            6000.00,
            "taxable",
            18.00,
            "kleanmaxpro"
        ),
        (
            "KMP-RENT-HD615",
            "HIGH PRESSURE WASHER HD 6/15",
            "rental",
            "rental",
            "Operating pressure: 150 bar\nFlow rate: 560 l/h\nConnected load: 3.1 kW\nAutomatic pressure relief and brass cylinder head",
            "NOS",
            "8479",
            12000.00,
            "taxable",
            18.00,
            "kleanmaxpro"
        ),
    ]

    import uuid
    from datetime import datetime
    now_str = datetime.utcnow().isoformat()
    for code, name, cat, qtype, desc, uom, hsn, rate, tax_cat, tax_rate, comp in rental_machines:
        cur.execute("SELECT id FROM services WHERE service_code = ?", (code,))
        row = cur.fetchone()
        if not row:
            sid = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO services (
                    id, service_code, service_name, category, quotation_type,
                    description, default_uom, hsn_sac_code, standard_rate,
                    tax_category, default_tax_rate, is_active, company_code,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
            """, (sid, code, name, cat, qtype, desc, uom, hsn, rate, tax_cat, tax_rate, comp, now_str, now_str))
            print(f"Added product: {name} ({code}) -> Rs. {rate}")
        else:
            cur.execute("""
                UPDATE services SET
                    service_name = ?, category = ?, quotation_type = ?,
                    description = ?, default_uom = ?, hsn_sac_code = ?,
                    standard_rate = ?, company_code = ?, updated_at = ?
                WHERE service_code = ?
            """, (name, cat, qtype, desc, uom, hsn, rate, comp, now_str, code))
            print(f"Updated product: {name} ({code})")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    run_migration()
