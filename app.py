from flask import Flask, jsonify, request, Response
import io
import csv
import json
import os
import sqlite3
from dotenv import load_dotenv
from flask_cors import CORS
from generator import generator

# Load environment
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests for Vite

DB_FILE = os.path.join(os.path.dirname(__file__), "telemetry.db")


@app.route("/")
def home():
    return jsonify({"status": "KINETIC ETHER ACTIVE", "version": "2.1.0", "data_source": "kaggle/smart-meter"})


@app.route("/api/status")
def get_status():
    generator.update()
    return jsonify(generator.get_status())


@app.route("/api/control", methods=["POST"])
def control_device():
    data = request.json
    device = data.get("device")
    status = data.get("status")  # "ON" or "OFF"
    generator.toggle_device(device, status)
    return jsonify({"message": f"{device} set to {status}", "status": generator.get_status()})


@app.route("/api/trigger-spike", methods=["POST"])
def trigger_spike():
    data = request.json or {}
    device = data.get("device", "HVAC")
    generator.trigger_spike(device)
    return jsonify({"message": f"Anomaly injected into {device}", "status": generator.get_status()})


@app.route("/api/clear-spike", methods=["POST"])
def clear_spike():
    generator.clear_spike()
    return jsonify({"message": "Grid stabilized", "status": generator.get_status()})


@app.route("/api/optimize", methods=["POST"])
def optimize_grid():
    data = request.json
    generator.toggle_eco_mode(data.get("active", False))
    return jsonify({
        "message": "Optimization toggled",
        "eco_mode": generator.eco_mode,
        "status": generator.get_status(),
    })


@app.route("/api/dataset-info")
def dataset_info():
    """Returns metadata about the loaded smart-meter dataset."""
    pos = generator.data_provider.get_position()
    return jsonify({
        "dataset": "ziya07/smart-meter-electricity-consumption-dataset",
        "total_rows": pos["total_rows"],
        "current_index": pos["current_index"],
        "progress_pct": pos["progress_pct"],
        "current_timestamp": generator.current_timestamp,
    })


@app.route("/api/system/restart", methods=["POST"])
def restart_system():
    generator.reset()
    return jsonify({"message": "System restarted successfully", "status": generator.get_status()})


@app.route("/api/system/export")
def export_data():
    fmt = request.args.get("format", "json").lower()
    data = generator.get_history_data()

    if fmt == "csv":
        if not data:
            return Response("No data available", status=400)
            
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename=kinetic_telemetry.csv"}
        )
    else:
        return Response(
            json.dumps(data, indent=2),
            mimetype="application/json",
            headers={"Content-disposition": "attachment; filename=kinetic_telemetry.json"}
        )


@app.route("/api/history")
def get_history():
    period = request.args.get("range", "24h")
    
    # SQLite range and aggregation logic
    # Default: last 24 hours
    range_sql = "datetime('now', '-24 hours')"
    group_fmt = "%Y-%m-%d %H:%M" # 1 min resolution
    
    if period == "1h":
        range_sql = "datetime('now', '-1 hour')"
        group_fmt = "%Y-%m-%d %H:%M:%S"
    elif period == "24h":
        range_sql = "datetime('now', '-24 hours')"
        group_fmt = "%Y-%m-%d %H:%M"
    elif period == "1mo":
        range_sql = "datetime('now', '-1 month')"
        group_fmt = "%Y-%m-%d"
    elif period == "6mo":
        range_sql = "datetime('now', '-6 month')"
        group_fmt = "%Y-%W"
    elif period == "1y":
        range_sql = "datetime('now', '-1 year')"
        group_fmt = "%Y-%W"
    elif period == "all":
        range_sql = "datetime('1970-01-01')"
        group_fmt = "%Y-%m" # Monthly for all-time
    
    query = f'''
        SELECT strftime('{group_fmt}', timestamp) as time_group, AVG(total_energy) as avg_val
        FROM telemetry
        WHERE timestamp >= {range_sql}
        GROUP BY time_group
        ORDER BY time_group ASC
    '''
    
    try:
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query)
            rows = cursor.fetchall()
            
            history = [{"time": row["time_group"], "value": round(row["avg_val"], 2)} for row in rows]
            return jsonify(history)
    except Exception as e:
        print(f"SQLite Query Error: {e}")
        return jsonify([])


@app.route("/api/settings", methods=["POST"])
def update_settings():
    new_settings = request.json
    updated = generator.update_settings(new_settings)
    return jsonify({"status": "success", "settings": updated})


@app.route("/chat", methods=["POST"])
def chat():
    user_msg = request.json.get("message", "").lower()
    status_data = generator.get_status()
    env = status_data.get("environment", {})
    ai = status_data.get("ai_analysis", {})

    if "waste" in user_msg or "leak" in user_msg:
        reply = (
            f"Currently, ₹{status_data['money_lost']} is being wasted. "
            f"AI detected {ai.get('waste_kw', 0)} kW of excess draw. "
            f"Analyzing HVAC thermal leakage patterns."
        )
    elif "usage" in user_msg or "load" in user_msg:
        reply = (
            f"Current grid load is at {status_data['total_energy']} kW "
            f"(predicted baseline: {ai.get('predicted_kw', 'N/A')} kW). "
            f"Resonance is {'unstable' if status_data['anomaly']['detected'] else 'optimal'}."
        )
    elif "weather" in user_msg or "temp" in user_msg or "environment" in user_msg:
        reply = (
            f"Environmental conditions: {env.get('temperature', '?')}°C, "
            f"{env.get('humidity', '?')}% humidity, "
            f"wind at {env.get('wind_speed', '?')} km/h."
        )
    elif "dataset" in user_msg or "data" in user_msg:
        pos = generator.data_provider.get_position()
        reply = (
            f"Streaming from Kaggle smart-meter dataset. "
            f"Position: row {pos['current_index']}/{pos['total_rows']} "
            f"({pos['progress_pct']}%). Timestamp: {generator.current_timestamp}."
        )
    elif "status" in user_msg:
        if status_data["anomaly"]["detected"]:
            reply = (
                f"CRITICAL ALERT — anomaly on {status_data['anomaly']['device']}! "
                f"Actual: {ai.get('actual_kw', '?')} kW vs predicted {ai.get('predicted_kw', '?')} kW."
            )
        else:
            reply = "All systems operating within normal parameters."
    else:
        reply = (
            "I am the Kinetic Ether AI. I can analyze system load, detect energy waste, "
            "report environmental conditions, and optimize resonance. How can I assist you?"
        )

    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(port=5000, debug=True)