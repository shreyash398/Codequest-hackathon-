import numpy as np


class AnomalyDetector:
    """
    Sliding-window anomaly detector that compares current energy usage against
    a predicted baseline derived from either an explicit expected value or a
    historical moving average.
    """

    def __init__(self, cost_per_unit=8.5, window_size=10, threshold_multiplier=1.3):
        self.history = []
        self.cost_per_unit = cost_per_unit
        self.window_size = window_size
        self.threshold_multiplier = threshold_multiplier
        self.cumulative_money_lost = 0.0
        self.baseline_prediction = 0

    def prime_history(self, initial_data):
        """Pre-populate history with a list of historical usage figures."""
        self.history = list(initial_data)

    def analyze(self, current_usage, expected_baseline=None):
        """
        Analyse a single reading and return anomaly diagnostics.

        Parameters
        ----------
        current_usage : float
            The observed total energy draw in kW.
        expected_baseline : float | None
            If provided, used as the primary truth for the expected baseline.
            Otherwise the model falls back to its own moving-average prediction.
        """
        is_anomaly = False
        waste = 0.0
        money_lost = 0.0

        # Determine baseline from explicit value or rolling window
        if expected_baseline is not None:
            self.baseline_prediction = expected_baseline
        elif self.history:
            window = self.history[-self.window_size:]
            self.baseline_prediction = sum(window) / len(window)
        else:
            self.baseline_prediction = current_usage

        # Detection: flag if current usage significantly exceeds expected draw
        if len(self.history) >= self.window_size or expected_baseline is not None:
            if current_usage > self.baseline_prediction * self.threshold_multiplier:
                is_anomaly = True
                waste = current_usage - self.baseline_prediction
                # Simulate per-hour unit cost accrual (assuming ~1 s poll interval)
                money_lost = (waste * self.cost_per_unit) / 3600
                self.cumulative_money_lost += money_lost
            else:
                # Only append normal readings so anomalies don't corrupt the baseline
                self.history.append(current_usage)
                if len(self.history) > self.window_size * 5:
                    self.history.pop(0)
        else:
            self.history.append(current_usage)

        return {
            "predicted": round(self.baseline_prediction, 2),
            "actual": round(current_usage, 2),
            "is_anomaly": is_anomaly,
            "waste_kw": round(waste, 2),
            "money_lost_tick": round(money_lost, 4),
            "total_money_lost": round(self.cumulative_money_lost, 2),
        }