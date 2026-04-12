import random
import os
import sqlite3
from collections import deque
from dotenv import load_dotenv
from model import AnomalyDetector
from data import DataProvider, ENERGY_BASE, ENERGY_RANGE, TEMP_MAX, HUMIDITY_MAX, WIND_MAX

# Load config
load_dotenv()

HISTORY_SIZE = 30  # Number of readings to keep for charts


class EnergyGenerator:
    """
    Core simulation engine for Kinetic Ether.
    Now drives appliance readings from a real smart-meter dataset instead of
    purely synthetic random fluctuations.
    """

    def __init__(self):
        # --- Real data source ---
        self.data_provider = DataProvider()

        # --- Appliance baselines (used for proportional distribution) ---
        self.standard_baselines = {
            "HVAC": 45.0,
            "Lighting": 12.0,
            "Production Line": 120.0,
            "Data Center": 85.0,
        }
        self.total_standard_baseline = sum(self.standard_baselines.values())  # 262 kW

        self.appliances = {
            "HVAC":            {"baseline": 45.0,  "target_baseline": 45.0,  "current": 45.0,  "unit": "kW", "status": "ON"},
            "Lighting":        {"baseline": 12.0,  "target_baseline": 12.0,  "current": 12.0,  "unit": "kW", "status": "ON"},
            "Production Line": {"baseline": 120.0, "target_baseline": 120.0, "current": 120.0, "unit": "kW", "status": "ON"},
            "Data Center":     {"baseline": 85.0,  "target_baseline": 85.0,  "current": 85.0,  "unit": "kW", "status": "ON"},
        }

        self.unit_cost = 8.5       # ₹ per kWh
        self.co2_factor = 0.45     # kg CO₂ per kWh
        self.total_energy = self.total_standard_baseline

        self.spike_active = False
        self.anomaly_device = None
        self.eco_mode = False

        # --- System Settings (Matching UI requirements) ---
        self.settings = {
            "min_battery_level": 20,
            "max_battery_level": 95,
            "grid_export_limit": 5,
            "load_priority": "Solar First",
            "peak_shaving": True,
            "night_mode": False,
            "enable_alerts": True,
            "auto_restart": True
        }

        # --- Environmental context from dataset ---
        self.current_env = {"temperature": 22.0, "humidity": 50.0, "wind_speed": 10.0}
        self.current_timestamp = ""
        self.ground_truth_anomaly = False

        # --- Rolling history buffer for charts ---
        self.energy_history = deque(maxlen=HISTORY_SIZE)
        self.appliance_history = {name: deque(maxlen=HISTORY_SIZE) for name in self.appliances}
        self.env_history = {"temperature": deque(maxlen=HISTORY_SIZE), "humidity": deque(maxlen=HISTORY_SIZE), "wind_speed": deque(maxlen=HISTORY_SIZE)}
        self.timestamp_history = deque(maxlen=HISTORY_SIZE)
        self.predicted_history = deque(maxlen=HISTORY_SIZE)
        self.anomaly_history = deque(maxlen=HISTORY_SIZE)

        # --- AI / ML anomaly detector ---
        self.detector = AnomalyDetector(
            cost_per_unit=self.unit_cost,
            window_size=10,
            threshold_multiplier=1.3,
        )
        history = self.data_provider.get_history(20)
        self.detector.prime_history(history)
        self.latest_analysis = self.detector.analyze(
            self.total_energy, expected_baseline=self.total_standard_baseline
        )

        # --- SQLite Database Integration ---
        self.db_path = os.path.join(os.path.dirname(__file__), "telemetry.db")
        self._init_db()

    def _init_db(self):
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS telemetry (
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
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
                conn.commit()
        except Exception as e:
            print(f"Failed to initialize SQLite DB: {e}")

    # ------------------------------------------------------------------
    # Core update — called on every /api/status poll
    # ------------------------------------------------------------------
    def update(self):
        # 1. Pull the next real data point
        dp = self.data_provider.get_next()

        # 2. Store environmental readings (scaled to human-readable units)
        self.current_env = {
            "temperature": round(dp["temperature"] * TEMP_MAX, 1),
            "humidity":    round(dp["humidity"] * HUMIDITY_MAX, 1),
            "wind_speed":  round(dp["wind_speed"] * WIND_MAX, 1),
        }
        self.current_timestamp = dp["timestamp"]
        self.ground_truth_anomaly = dp["is_anomaly_ground_truth"]

        # 3. Real total energy from the dataset
        real_total_kw = dp["electricity_consumed_kw"]
        expected_baseline_kw = dp["avg_past_consumption_kw"]

        # 4. Calculate active baseline (accounts for eco-mode ramp & OFF devices)
        active_baseline = 0.0
        for name, info in self.appliances.items():
            if info["status"] == "OFF":
                continue
            # Smooth eco-mode transitions
            if info["baseline"] != info["target_baseline"]:
                info["baseline"] += (info["target_baseline"] - info["baseline"]) * 0.15
            active_baseline += info["baseline"]

        # 5. Distribute total energy across appliances proportionally
        self.total_energy = 0.0
        for name, info in self.appliances.items():
            if info["status"] == "OFF":
                info["current"] = 0.0
                continue

            proportion = info["baseline"] / active_baseline if active_baseline > 0 else 0.0
            # Small per-appliance jitter (±3 %) keeps the dashboard feeling alive
            info["current"] = real_total_kw * proportion * random.uniform(0.97, 1.03)

            # Manual spike injection (still supported)
            if self.spike_active and name == self.anomaly_device:
                info["current"] *= 2.8

            self.total_energy += info["current"]

        # 6. AI detection — pass real expected baseline for context-aware analysis
        self.latest_analysis = self.detector.analyze(
            self.total_energy, expected_baseline=expected_baseline_kw
        )

        # 7. Record to history buffer
        self.energy_history.append(round(self.total_energy, 2))
        for name, info in self.appliances.items():
            self.appliance_history[name].append(round(info["current"], 2))
        self.env_history["temperature"].append(self.current_env["temperature"])
        self.env_history["humidity"].append(self.current_env["humidity"])
        self.env_history["wind_speed"].append(self.current_env["wind_speed"])
        self.timestamp_history.append(self.current_timestamp)
        self.predicted_history.append(round(self.latest_analysis.get("predicted", 0), 2))
        self.anomaly_history.append(self.latest_analysis["is_anomaly"])

        # 8. Reconcile anomaly state
        if self.latest_analysis["is_anomaly"] and not self.spike_active:
            self.spike_active = True
            self.anomaly_device = "HVAC"  # heuristic blame
        elif not self.latest_analysis["is_anomaly"] and self.spike_active:
            self.clear_spike()

        # 9. Sync to Database
        self.write_to_db()

    def write_to_db(self):
        try:
            from datetime import datetime
            now_ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO telemetry (
                        timestamp, total_energy, predicted_kw, temperature, humidity, 
                        carbon_footprint, eco_mode, anomaly_detected, is_historical
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
                ''', (
                    now_ts,
                    float(self.total_energy),
                    float(self.latest_analysis.get("predicted", 0)),
                    float(self.current_env["temperature"]),
                    float(self.current_env["humidity"]),
                    float(self.total_energy * self.co2_factor),
                    int(self.eco_mode),
                    int(self.spike_active)
                ))
                conn.commit()
        except Exception as e:
            pass  # Silent fail to avoid disrupting simulation

    # ------------------------------------------------------------------
    # Controls
    # ------------------------------------------------------------------
    def toggle_device(self, name, status):
        if name in self.appliances:
            self.appliances[name]["status"] = status

    def trigger_spike(self, device="HVAC"):
        self.spike_active = True
        self.anomaly_device = device

    def clear_spike(self):
        self.spike_active = False
        self.anomaly_device = None

    def toggle_eco_mode(self, active):
        self.eco_mode = active
        self.settings["peak_shaving"] = active # Sync with UI settings
        if active:
            self.appliances["HVAC"]["target_baseline"] = 28.0
            self.appliances["Lighting"]["target_baseline"] = 6.0
            self.appliances["Data Center"]["target_baseline"] = 60.0
        else:
            for name, base_val in self.standard_baselines.items():
                self.appliances[name]["target_baseline"] = base_val

    def update_settings(self, new_settings):
        """Updates the system settings from the frontend."""
        self.settings.update(new_settings)
        # Handle side effects if any
        if "peak_shaving" in new_settings:
            self.toggle_eco_mode(new_settings["peak_shaving"])
        return self.settings

    def reset(self):
        """Resets the simulation engine to its initial state."""
        self.energy_history.clear()
        for name in self.appliance_history:
            self.appliance_history[name].clear()
        self.env_history["temperature"].clear()
        self.env_history["humidity"].clear()
        self.env_history["wind_speed"].clear()
        self.timestamp_history.clear()
        self.predicted_history.clear()
        self.anomaly_history.clear()
        
        self.spike_active = False
        self.anomaly_device = None
        self.eco_mode = False
        self.data_provider.index = 0
        
        # Initial values
        self.total_energy = self.total_standard_baseline
        for name, base in self.standard_baselines.items():
            self.appliances[name]["baseline"] = base
            self.appliances[name]["target_baseline"] = base
            self.appliances[name]["status"] = "ON"

    def generate_forecast(self, horizon='24h'):
        """
        Generate energy consumption forecast based on historical patterns.
        Returns list of {hour, predicted, upper, lower} for charting.
        """
        from datetime import datetime, timedelta
        import math

        # Base prediction from detector's historical average
        base = self.detector.baseline_prediction
        if base <= 0:
            base = self.total_standard_baseline

        now = datetime.now()
        points = []

        if horizon == '7d':
            num_points = 7 * 24  # hourly for 7 days
        else:
            num_points = 24  # hourly for 24h

        for i in range(num_points):
            future_time = now + timedelta(hours=i)
            hour_of_day = future_time.hour

            # Time-of-day weighting (peak hours have higher consumption)
            # Simulates typical industrial/residential pattern
            if 9 <= hour_of_day <= 17:  # Peak hours
                tod_factor = 1.0 + 0.15 * math.sin((hour_of_day - 9) * math.pi / 8)
            elif 6 <= hour_of_day <= 9:  # Morning ramp-up
                tod_factor = 0.7 + 0.3 * ((hour_of_day - 6) / 3)
            elif 17 < hour_of_day <= 22:  # Evening wind-down
                tod_factor = 1.0 - 0.3 * ((hour_of_day - 17) / 5)
            else:  # Night (minimal load)
                tod_factor = 0.55 + random.uniform(-0.05, 0.05)

            # Slight daily variation for multi-day forecasts
            day_offset = i // 24
            day_factor = 1.0 + (random.uniform(-0.03, 0.03) * day_offset)

            predicted = base * tod_factor * day_factor
            # Add small random noise
            predicted *= random.uniform(0.97, 1.03)

            # Confidence bounds widen over time
            uncertainty = 0.08 + (i / num_points) * 0.12
            upper = predicted * (1 + uncertainty)
            lower = predicted * (1 - uncertainty)

            # Format label
            if horizon == '7d':
                label = future_time.strftime('%a %H:%M') if i % 6 == 0 else ''
            else:
                label = future_time.strftime('%H:%M')

            points.append({
                'hour': label,
                'predicted': round(predicted, 2),
                'upper': round(upper, 2),
                'lower': round(lower, 2),
            })

        return points

    def get_history_data(self):
        """Returns the history buffer as a list of dictionaries for export."""
        export = []
        for i in range(len(self.timestamp_history)):
            row = {
                "timestamp": self.timestamp_history[i],
                "total_energy_kw": self.energy_history[i],
                "predicted_kw": self.predicted_history[i],
                "is_anomaly": self.anomaly_history[i],
                "temp": self.env_history["temperature"][i],
                "humidity": self.env_history["humidity"][i],
            }
            # Add appliance data
            for name in self.appliances:
                if i < len(self.appliance_history[name]):
                    row[f"device_{name.lower().replace(' ', '_')}"] = self.appliance_history[name][i]
            export.append(row)
        return export

    # ------------------------------------------------------------------
    # Status payload (served to the frontend)
    # ------------------------------------------------------------------
    def get_status(self):
        return {
            "total_energy": round(self.total_energy, 2),
            "money_lost": round(self.latest_analysis.get("total_money_lost", 0.0), 2),
            "carbon_footprint": round(self.total_energy * self.co2_factor, 2),
            "appliances": self.appliances,
            "eco_mode": self.eco_mode,
            "anomaly": {
                "detected": self.spike_active,
                "device": self.anomaly_device,
                "impact": "CRITICAL" if self.spike_active else "NORMAL",
            },
            # --- Real dataset context ---
            "environment": self.current_env,
            "dataset_timestamp": self.current_timestamp,
            "ground_truth_anomaly": self.ground_truth_anomaly,
            "dataset_position": self.data_provider.get_position(),
            "ai_analysis": {
                "predicted_kw": self.latest_analysis.get("predicted", 0),
                "actual_kw": self.latest_analysis.get("actual", 0),
                "waste_kw": self.latest_analysis.get("waste_kw", 0),
            },
            # --- Chart history ---
            "history": {
                "timestamps": list(self.timestamp_history),
                "energy": list(self.energy_history),
                "predicted": list(self.predicted_history),
                "anomalies": list(self.anomaly_history),
                "appliances": {name: list(vals) for name, vals in self.appliance_history.items()},
                "environment": {k: list(v) for k, v in self.env_history.items()},
            },
            "settings": self.settings,
        }


# Singleton instance for the server
generator = EnergyGenerator()
