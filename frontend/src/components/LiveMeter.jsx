import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { ref, onValue } from "firebase/database";

export default function LiveMeter() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const energyRef = ref(db, "energy/");
    const unsub = onValue(energyRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
        setConnected(true);
      } else {
        setConnected(false);
      }
    });
    return () => unsub();
  }, []);

  const metrics = data
    ? [
        { label: "Voltage",      value: data.voltage?.toFixed(1),   unit: "V",   color: "#3b82f6" },
        { label: "Current",      value: data.current?.toFixed(3),   unit: "A",   color: "#22c55e" },
        { label: "Power",        value: data.power?.toFixed(1),     unit: "W",   color: "#a855f7" },
        { label: "Energy",       value: data.energy?.toFixed(3),    unit: "kWh", color: "#f59e0b" },
        { label: "Frequency",    value: data.frequency?.toFixed(1), unit: "Hz",  color: "#06b6d4" },
        { label: "Power Factor", value: data.pf?.toFixed(2),        unit: "",    color: "#f43f5e" },
      ]
    : [];

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(24px)",
        borderRadius: "16px",
        padding: "24px",
        margin: "24px 0",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <span style={{ fontSize: "20px", fontWeight: "700", color: "#e2e8f0" }}>
          ⚡ Live Hardware Meter
        </span>
        <span
          style={{
            fontSize: "12px",
            padding: "2px 10px",
            borderRadius: "999px",
            background: connected ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            color: connected ? "#22c55e" : "#ef4444",
          }}
        >
          {connected ? "● LIVE" : "○ No Signal"}
        </span>
      </div>

      {/* Metrics Grid */}
      {!data ? (
        <p style={{ color: "#94a3b8", textAlign: "center" }}>
          Waiting for hardware data...
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "16px",
          }}
        >
          {metrics.map((m) => (
            <div
              key={m.label}
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px" }}>
                {m.label}
              </p>
              <p style={{ color: m.color, fontSize: "28px", fontWeight: "700" }}>
                {m.value ?? "--"}
              </p>
              <p style={{ color: "#64748b", fontSize: "12px" }}>{m.unit}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
