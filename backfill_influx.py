import csv
import os
from datetime import datetime
from dotenv import load_dotenv
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

# Load config
load_dotenv()

INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")

CSV_FILE = 'india_monthly_full_release_long_format.csv'

def backfill():
    if not all([INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET]):
        print("Missing InfluxDB configuration in .env")
        return

    client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)
    write_api = client.write_api(write_options=SYNCHRONOUS)

    print(f"Starting backfill from {CSV_FILE}...")
    
    count = 0
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Filter for Electricity generation data at National level (India)
                if row['Category'] == 'Electricity generation' and row['State'] == 'India' and row['Variable'] == 'Total Generation':
                    try:
                        # Date format is YYYY-MM-DD
                        dt = datetime.strptime(row['Date'], '%Y-%m-%d')
                        val = float(row['Value'])
                        
                        point = Point("telemetry") \
                            .tag("source", "historical_dataset") \
                            .tag("state", "India") \
                            .field("total_energy", val) \
                            .field("is_historical", True) \
                            .time(dt, WritePrecision.NS)
                        
                        write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=point)
                        count += 1
                        if count % 10 == 0:
                            print(f"Ingested {count} records...")
                    except Exception as e:
                        print(f"Error processing row: {e}")
                        
        print(f"Backfill complete! Ingested {count} historical records.")
    except FileNotFoundError:
        print(f"File {CSV_FILE} not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    backfill()
