import sqlite3
from datetime import datetime, timedelta

def shift_data():
    conn = sqlite3.connect('telemetry.db')
    cursor = conn.cursor()
    
    # Find the latest historical timestamp
    cursor.execute('SELECT max(timestamp) FROM telemetry WHERE is_historical=1')
    latest = cursor.fetchone()[0]
    
    if not latest:
        print("No historical data found to shift.")
        conn.close()
        return
        
    latest_dt = datetime.strptime(latest, '%Y-%m-%d %H:%M:%S')
    now_dt = datetime.now()
    diff = now_dt - latest_dt
    
    print(f"Latest historical record: {latest_dt}")
    print(f"Current time: {now_dt}")
    print(f"Shifting all records by {diff}")
    
    # Get all records
    cursor.execute('SELECT timestamp, rowid FROM telemetry WHERE is_historical=1')
    rows = cursor.fetchall()
    
    for ts, rid in rows:
        old_dt = datetime.strptime(ts, '%Y-%m-%d %H:%M:%S')
        new_dt = old_dt + diff
        new_ts = new_dt.strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute('UPDATE telemetry SET timestamp=? WHERE rowid=?', (new_ts, rid))
        
    conn.commit()
    print(f"Successfully shifted {len(rows)} records.")
    conn.close()

if __name__ == "__main__":
    shift_data()
