import csv
import sqlite3
from datetime import datetime

CSV_FILE = 'india_monthly_full_release_long_format.csv'
DB_FILE = 'telemetry.db'

def backfill():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Ensure table exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS telemetry (
            timestamp DATETIME,
            total_energy REAL,
            predicted_kw REAL,
            temperature REAL,
            humidity REAL,
            carbon_footprint REAL,
            eco_mode BOOLEAN,
            anomaly_detected BOOLEAN,
            is_historical BOOLEAN DEFAULT 0
        )
    ''')

    print(f"Starting backfill from {CSV_FILE} into SQLite...")
    
    count = 0
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Filter for Electricity generation data at National level (India Total)
                if row['Category'] == 'Electricity generation' and row['State'] == 'India Total' and row['Variable'] == 'Total Generation':
                    try:
                        # Date format is YYYY-MM-DD
                        dt_str = f"{row['Date']} 00:00:00"
                        val = float(row['Value'])
                        
                        cursor.execute('''
                            INSERT INTO telemetry (
                                timestamp, total_energy, predicted_kw, is_historical,
                                temperature, humidity, carbon_footprint, eco_mode, anomaly_detected
                            ) VALUES (?, ?, ?, 1, 0, 0, 0, 0, 0)
                        ''', (dt_str, val, val))
                        
                        count += 1
                        if count % 100 == 0:
                            print(f"Ingested {count} records...")
                    except Exception as e:
                        print(f"Error processing row: {e}")
        
        conn.commit()
        print(f"Backfill complete! Ingested {count} historical records.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    backfill()
