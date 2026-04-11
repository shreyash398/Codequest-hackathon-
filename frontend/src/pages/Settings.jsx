import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const Settings = () => {
  const [peakShaving, setPeakShaving] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [autoRestart, setAutoRestart] = useState(true);
  const [reservePct, setReservePct] = useState(5);
  const [solarPriority, setSolarPriority] = useState(true);

  const ToggleSwitch = ({ label, desc, enabled, onChange, color = 'primary' }) => (
    <div className="flex items-center justify-between py-4">
      <div>
        <h4 className="text-sm font-bold text-on-surface">{label}</h4>
        <p className="text-[10px] text-muted mt-0.5 max-w-xs">{desc}</p>
      </div>
      <button onClick={onChange} className={`w-14 h-7 rounded-full relative transition-colors ${enabled ? `bg-${color}` : 'bg-white/10'}`}>
        <motion.div animate={{ x: enabled ? 28 : 4 }} className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-lg" />
      </button>
    </div>
  );

  return (
    <main className="md:ml-64 pt-24 px-6 pb-12 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="text-primary font-headline text-sm font-semibold tracking-widest uppercase mb-1">Configuration</p>
          <h1 className="text-4xl font-black font-headline tracking-tight">System Settings</h1>
        </div>

        {/* Battery Management */}
        <div className="bg-surface-container-highest/60 rounded-2xl p-8 ghost-border relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/8 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <span className="material-symbols-outlined text-secondary">battery_charging_full</span>
            <h2 className="text-xl font-bold font-headline">Battery Management</h2>
          </div>
          <p className="text-xs text-muted mb-6 relative z-10">Optimize storage life and reserve capacity.</p>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-on-surface-variant">Reserve Buffer</span>
              <span className="text-sm font-bold font-headline text-secondary">{reservePct}%</span>
            </div>
            <input type="range" min="0" max="20" value={reservePct} onChange={e => setReservePct(e.target.value)}
              className="w-full h-1.5 bg-surface-container-low rounded-full appearance-none cursor-pointer accent-secondary" />
            <p className="text-[10px] text-muted mt-3">Leaving 5% buffer extends battery cycle life by approximately 18%.</p>
          </div>
        </div>

        {/* Grid Management */}
        <div className="bg-surface-container-highest/60 rounded-2xl p-8 ghost-border">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-tertiary">electrical_services</span>
            <h2 className="text-xl font-bold font-headline">Grid Management</h2>
          </div>
          <p className="text-xs text-muted mb-6">System will prioritize local solar consumption before charging batteries.</p>
          <div className="bg-surface-container-low/60 rounded-xl p-5 ghost-border">
            <ToggleSwitch label="Solar Priority" desc="Always use solar generation as primary source before grid." enabled={solarPriority} onChange={() => setSolarPriority(!solarPriority)} color="tertiary" />
          </div>
        </div>

        {/* Quick Automations */}
        <div className="bg-surface-container-highest/60 rounded-2xl p-8 ghost-border">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <h2 className="text-xl font-bold font-headline">Quick Automations</h2>
          </div>
          <div className="space-y-0 divide-y divide-white/5">
            <ToggleSwitch label="Peak Shaving" desc="Reduce grid usage during high-tariff periods." enabled={peakShaving} onChange={() => setPeakShaving(!peakShaving)} color="primary" />
            <ToggleSwitch label="Night Mode" desc="Minimal fan noise and LED brightness levels." enabled={nightMode} onChange={() => setNightMode(!nightMode)} color="tertiary" />
            <ToggleSwitch label="Enable Alerts" desc="Push notifications for critical grid events." enabled={enableAlerts} onChange={() => setEnableAlerts(!enableAlerts)} color="secondary" />
            <ToggleSwitch label="Auto Restart" desc="Reboot logic board after fatal errors." enabled={autoRestart} onChange={() => setAutoRestart(!autoRestart)} color="primary" />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-surface-container-low/40 rounded-2xl p-6 ghost-border">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-sm text-muted">lock</span>
            <span className="text-[10px] text-muted uppercase tracking-widest font-bold">Security Notice</span>
          </div>
          <p className="text-xs text-muted-dark leading-relaxed">All settings are locally stored and encrypted. Changes propagate to the inverter in real-time via Kinetic Core protocols. No personally identifiable data leaves the local network.</p>
        </div>
      </div>
    </main>
  );
};
