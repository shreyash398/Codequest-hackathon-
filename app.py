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


@app.route("/api/forecast")
def get_forecast():
    horizon = request.args.get("horizon", "24h")
    data = generator.generate_forecast(horizon)
    return jsonify(data)


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
    settings = status_data.get("settings", {})

    if "peak" in user_msg or "highest" in user_msg:
        reply = (
            f"Based on simulated time-of-day patterns, your peak usage typically occurs between "
            f"09:00–17:00. Current load is {status_data['total_energy']} kW. "
            f"The AI predicts a baseline of {ai.get('predicted_kw', 'N/A')} kW. "
            f"Consider shifting heavy appliances to off-peak hours (22:00–06:00) for up to 15% savings."
        )
    elif "reduce" in user_msg or "save" in user_msg or "lower" in user_msg or "cut" in user_msg:
        tips = []
        if not status_data.get('eco_mode'):
            tips.append("Enable AI Eco-Mode to automatically throttle HVAC and lighting by 15%.")
        tips.append("Shift heavy loads (EV charging, laundry) to off-peak hours (22:00-06:00).")
        tips.append(f"Your current carbon footprint is {status_data['carbon_footprint']} kg CO₂. Reducing consumption by 10% saves ≈{round(status_data['carbon_footprint'] * 0.1, 2)} kg/day.")
        if any(a['status'] == 'ON' for a in status_data['appliances'].values()):
            idle_devices = [n for n, a in status_data['appliances'].items() if a['status'] == 'ON' and a['current'] < 5]
            if idle_devices:
                tips.append(f"Consider turning off idle devices: {', '.join(idle_devices)}.")
        reply = "Here are actionable recommendations:\n\n" + "\n".join(f"• {t}" for t in tips)
    elif "forecast" in user_msg or "predict" in user_msg or "tomorrow" in user_msg:
        forecast = generator.generate_forecast('24h')
        peak_val = max(f['predicted'] for f in forecast)
        low_val = min(f['predicted'] for f in forecast)
        avg_val = sum(f['predicted'] for f in forecast) / len(forecast)
        reply = (
            f"24-hour forecast summary:\n"
            f"• Peak predicted: {peak_val:.1f} kW (around 13:00–14:00)\n"
            f"• Lowest predicted: {low_val:.1f} kW (around 03:00–05:00)\n"
            f"• Average consumption: {avg_val:.1f} kW\n"
            f"• Confidence range: ±8-20% depending on horizon.\n"
            f"Visit the Analytics page to see the full interactive forecast chart."
        )
    elif "efficiency" in user_msg or "performance" in user_msg:
        actual = ai.get('actual_kw', 0)
        predicted = ai.get('predicted_kw', 0)
        if predicted > 0:
            eff = min(100, (1 - abs(actual - predicted) / predicted) * 100)
        else:
            eff = 95.0
        reply = (
            f"System efficiency analysis:\n"
            f"• Current load: {actual} kW vs predicted baseline: {predicted} kW\n"
            f"• Efficiency score: {eff:.1f}%\n"
            f"• Eco-Mode: {'ACTIVE ✓' if status_data.get('eco_mode') else 'INACTIVE'}\n"
            f"• {'⚠️ Anomaly detected — efficiency degraded.' if status_data['anomaly']['detected'] else '✓ All systems operating within normal parameters.'}"
        )
    elif "eco" in user_msg or "optimize" in user_msg or "green" in user_msg:
        if "on" in user_msg or "enable" in user_msg or "activate" in user_msg:
            generator.toggle_eco_mode(True)
            reply = "✓ AI Eco-Mode has been ENABLED. HVAC reduced to 28kW, Lighting to 6kW. Expected savings: ~15% on peak consumption."
        elif "off" in user_msg or "disable" in user_msg:
            generator.toggle_eco_mode(False)
            reply = "Eco-Mode has been DISABLED. All devices restored to standard baselines."
        else:
            reply = (
                f"Eco-Mode is currently {'ACTIVE ✓' if status_data.get('eco_mode') else 'INACTIVE'}.\n"
                f"Say 'enable eco mode' or 'disable eco mode' to control it.\n"
                f"When active, AI automatically throttles HVAC and Lighting to reduce peak draw by ~15%."
            )
    elif "waste" in user_msg or "leak" in user_msg:
        reply = (
            f"Currently, ₹{status_data['money_lost']} is being wasted per cycle. "
            f"AI detected {ai.get('waste_kw', 0)} kW of excess draw. "
            f"Analyzing HVAC thermal leakage patterns. Consider enabling Eco-Mode to reduce waste."
        )
    elif "usage" in user_msg or "load" in user_msg or "consumption" in user_msg:
        reply = (
            f"Current grid load is at {status_data['total_energy']} kW "
            f"(predicted baseline: {ai.get('predicted_kw', 'N/A')} kW). "
            f"Resonance is {'unstable — anomaly active!' if status_data['anomaly']['detected'] else 'optimal'}.\n"
            f"Active devices: {sum(1 for a in status_data['appliances'].values() if a['status'] == 'ON')}/{len(status_data['appliances'])}"
        )
    elif "weather" in user_msg or "temp" in user_msg or "environment" in user_msg:
        reply = (
            f"Environmental conditions:\n"
            f"• Temperature: {env.get('temperature', '?')}°C\n"
            f"• Humidity: {env.get('humidity', '?')}%\n"
            f"• Wind speed: {env.get('wind_speed', '?')} km/h\n"
            f"These values are streamed from the smart-meter dataset."
        )
    elif "dataset" in user_msg or "data" in user_msg:
        pos = generator.data_provider.get_position()
        reply = (
            f"Streaming from Kaggle smart-meter dataset. "
            f"Position: row {pos['current_index']}/{pos['total_rows']} "
            f"({pos['progress_pct']}%). Timestamp: {generator.current_timestamp}."
        )
    elif "status" in user_msg or "health" in user_msg:
        if status_data["anomaly"]["detected"]:
            reply = (
                f"⚠️ CRITICAL ALERT — anomaly on {status_data['anomaly']['device']}!\n"
                f"Actual: {ai.get('actual_kw', '?')} kW vs predicted {ai.get('predicted_kw', '?')} kW.\n"
                f"Waste: ₹{status_data['money_lost']}/cycle. Recommend immediate intervention."
            )
        else:
            reply = (
                f"✓ All systems operating within normal parameters.\n"
                f"Load: {status_data['total_energy']} kW | Eco: {'ON' if status_data.get('eco_mode') else 'OFF'} | "
                f"Devices: {sum(1 for a in status_data['appliances'].values() if a['status'] == 'ON')}/{len(status_data['appliances'])} active"
            )
    elif "help" in user_msg or "what can" in user_msg:
        reply = (
            "I can help with:\n"
            "• 'peak usage' — When is your highest consumption?\n"
            "• 'reduce consumption' — Actionable savings tips\n"
            "• 'forecast' — Predicted consumption for next 24h\n"
            "• 'efficiency' — Current vs predicted performance\n"
            "• 'eco mode on/off' — Toggle AI optimization\n"
            "• 'status' — Full system health check\n"
            "• 'weather' — Environmental conditions\n"
            "• 'waste' — Energy waste analysis"
        )
    else:
        reply = (
            "I am the Kinetic Ether AI. I can analyze system load, detect energy waste, "
            "predict consumption, report environmental conditions, and optimize energy usage.\n\n"
            "Try asking: 'peak usage', 'reduce consumption', 'forecast', 'efficiency', or 'help'."
        )

    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(port=5000, debug=True)