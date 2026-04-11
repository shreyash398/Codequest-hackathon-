import os
import pandas as pd
import random

# --- Dataset Paths ---
DATASET_PATH = os.path.join(os.path.dirname(__file__), 'smart_meter_data.csv')
KAGGLE_CACHE_PATH = os.path.join(
    os.path.expanduser('~'), '.cache', 'kagglehub', 'datasets',
    'ziya07', 'smart-meter-electricity-consumption-dataset',
    'versions', '1', 'smart_meter_data.csv'
)

# --- Scaling Constants ---
# Maps normalized (0-1) dataset values to realistic kW readings.
# With base=150, range=300: mean(0.377) -> ~263 kW, matching existing baseline of 262 kW.
ENERGY_BASE = 150.0    # kW floor
ENERGY_RANGE = 300.0   # kW range

# Environmental scaling
TEMP_MAX = 45.0        # Max temperature in °C
HUMIDITY_MAX = 100.0   # Max humidity in %
WIND_MAX = 50.0        # Max wind speed in km/h


class DataProvider:
    """Streams real smart-meter data points from the Kaggle dataset."""

    def __init__(self):
        path = DATASET_PATH if os.path.exists(DATASET_PATH) else KAGGLE_CACHE_PATH
        if not os.path.exists(path):
            raise FileNotFoundError(
                f"Dataset not found at {DATASET_PATH} or {KAGGLE_CACHE_PATH}. "
                "Please download it using kagglehub."
            )
        self.df = pd.read_csv(path)
        self.index = 0
        self.total_rows = len(self.df)

    def get_next(self):
        """Get the next data point, cycling back to the start when exhausted."""
        row = self.df.iloc[self.index]
        self.index = (self.index + 1) % self.total_rows

        consumed_norm = float(row['Electricity_Consumed'])
        avg_past_norm = float(row['Avg_Past_Consumption'])

        return {
            'timestamp': str(row['Timestamp']),
            'electricity_consumed_norm': consumed_norm,
            'electricity_consumed_kw': ENERGY_BASE + consumed_norm * ENERGY_RANGE,
            'avg_past_consumption_norm': avg_past_norm,
            'avg_past_consumption_kw': ENERGY_BASE + avg_past_norm * ENERGY_RANGE,
            'temperature': float(row['Temperature']),
            'humidity': float(row['Humidity']),
            'wind_speed': float(row['Wind_Speed']),
            'anomaly_label': str(row['Anomaly_Label']),
            'is_anomaly_ground_truth': str(row['Anomaly_Label']).strip() == 'Abnormal',
        }

    def get_history(self, size=20):
        """Return a list of kW readings for priming the anomaly detector."""
        normal_rows = self.df[self.df['Anomaly_Label'] == 'Normal'].head(size)
        return [ENERGY_BASE + v * ENERGY_RANGE for v in normal_rows['Electricity_Consumed'].tolist()]

    def get_position(self):
        """Return the current cursor position in the dataset."""
        return {
            'current_index': self.index,
            'total_rows': self.total_rows,
            'progress_pct': round(self.index / self.total_rows * 100, 1),
        }


# --- Legacy compatibility ---
def generate_mock_history(size=50, base_min=260, base_max=300):
    """Backward-compatible helper. Uses real data if available, else random."""
    try:
        provider = DataProvider()
        return provider.get_history(size)
    except Exception:
        return [random.randint(base_min, base_max) for _ in range(size)]