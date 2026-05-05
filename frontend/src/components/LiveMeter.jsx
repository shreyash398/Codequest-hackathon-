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
        { label: "Voltage",      value: data.voltage?.toFixed(1),   unit: "V",   color: "text-secondary", icon: "electric_bolt" },
        { label: "Current",      value: data.current?.toFixed(3),   unit: "A",   color: "text-tertiary",  icon: "electric_meter" },
        { label: "Power",        value: data.power?.toFixed(1),     unit: "W",   color: "text-primary",   icon: "bolt" },
        { label: "Energy",       value: data.energy?.toFixed(3),    unit: "kWh", color: "text-on-surface", icon: "auto_graph" },
        { label: "Frequency",    value: data.frequency?.toFixed(1), unit: "Hz",  color: "text-tertiary",  icon: "waves" },
        { label: "Power Factor", value: data.pf?.toFixed(2),        unit: "PF",  color: "text-secondary", icon: "tune" },
      ]
    : [];

  return (
    <div className="glass-card rounded-3xl p-8 border-white/5 relative overflow-hidden group hover-lift my-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black font-headline text-gradient-primary">Live Hardware Telemetry</h2>
          <p className="text-[10px] text-muted uppercase tracking-widest font-black mt-1">Direct bridge from ESP8266/PZEM</p>
        </div>
        <div className="flex items-center gap-2.5 bg-black/30 rounded-full px-4 py-2 border border-white/5 backdrop-blur-md">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-secondary' : 'bg-error'} pulse-live`}></span>
          <span className="text-[10px] text-muted uppercase tracking-widest font-black">
            {connected ? 'HARDWARE: LINKED' : 'HARDWARE: NO SIGNAL'}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      {!data ? (
        <div className="h-48 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/5 rounded-3xl">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-spin">
             <span className="material-symbols-outlined text-muted">sync</span>
          </div>
          <p className="text-[11px] text-muted font-black uppercase tracking-widest">
            Waiting for data pulse...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="mesh-gradient-primary rounded-2xl p-5 border border-white/5 text-center hover:bg-black/30 transition-all group/metric"
            >
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4 ${m.color.replace('text-', 'text-opacity-80 ')} group-hover/metric:scale-110 transition-transform`}>
                 <span className="material-symbols-outlined text-xl">{m.icon}</span>
              </div>
              <p className="text-[9px] text-muted uppercase tracking-widest font-black mb-1">
                {m.label}
              </p>
              <p className={`text-2xl font-black font-headline ${m.color} tracking-tight`}>
                {m.value ?? "--"}
              </p>
              <p className="text-[9px] text-muted/60 font-black uppercase tracking-widest mt-1">{m.unit}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
