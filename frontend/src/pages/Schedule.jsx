import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const Schedule = () => {
  const [data, setData] = useState(null);
  const [solarOpt, setSolarOpt] = useState(true);
  const [loadShift, setLoadShift] = useState(true);
  const [peakStart, setPeakStart] = useState('09:00');
  const [peakEnd, setPeakEnd] = useState('17:00');
  const [offPeakStart, setOffPeakStart] = useState('22:00');
  const [offPeakEnd, setOffPeakEnd] = useState('06:00');

  useEffect(() => {
    const f = async () => { try { setData(await (await fetch('http://localhost:5000/api/status')).json()); } catch(e) {} };
    f(); const i = setInterval(f, 5000); return () => clearInterval(i);
  }, []);

  if (!data) return null;

  return (
    <main className="md:ml-64 pt-24 px-6 pb-12 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-primary font-headline text-sm font-semibold tracking-widest uppercase mb-1">Automation</p>
            <h1 className="text-4xl font-black font-headline tracking-tight">Energy Schedule</h1>
            <p className="text-sm text-muted mt-1">Automate your node performance based on grid volatility and solar yield.</p>
          </div>
          <div className="bg-surface-container-highest/60 rounded-xl px-5 py-3 ghost-border">
            <span className="text-[10px] text-muted uppercase tracking-widest block">Current Yield</span>
            <span className="text-2xl font-black font-headline text-primary">{data.total_energy} <span className="text-xs text-muted font-normal">kW</span></span>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-surface-container-highest/60 rounded-2xl p-8 ghost-border relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/8 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <span className="material-symbols-outlined text-primary">wb_sunny</span>
            <h2 className="text-xl font-bold font-headline">Peak Hours Configuration</h2>
          </div>
          <p className="text-xs text-muted mb-6 relative z-10">Nodes will automatically switch to discharge mode during these hours to minimize grid draw during peak pricing.</p>
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div>
              <label className="text-[10px] text-muted uppercase tracking-widest block mb-2">Start Time</label>
              <input type="time" value={peakStart} onChange={e => setPeakStart(e.target.value)} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-headline font-bold ghost-border focus:outline-none focus:border-primary/40 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase tracking-widest block mb-2">End Time</label>
              <input type="time" value={peakEnd} onChange={e => setPeakEnd(e.target.value)} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-headline font-bold ghost-border focus:outline-none focus:border-primary/40 transition-colors" />
            </div>
          </div>

          <div className="mt-8 bg-surface-container-low/60 rounded-xl p-5 ghost-border relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-on-surface">Solar Optimization</h4>
                <p className="text-[10px] text-muted mt-0.5">Prioritize solar panel charging during daylight availability over grid sources.</p>
              </div>
              <button onClick={() => setSolarOpt(!solarOpt)} className={`w-14 h-7 rounded-full relative transition-colors ${solarOpt ? 'bg-secondary' : 'bg-white/10'}`}>
                <motion.div animate={{ x: solarOpt ? 28 : 4 }} className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Off-Peak Hours */}
        <div className="bg-surface-container-highest/60 rounded-2xl p-8 ghost-border relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-tertiary/8 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <span className="material-symbols-outlined text-tertiary">dark_mode</span>
            <h2 className="text-xl font-bold font-headline">Off-Peak Hours Configuration</h2>
          </div>
          <p className="text-xs text-muted mb-6 relative z-10">System will prioritize battery storage replenishment during this window. HVAC pre-conditioning enabled for optimized morning comfort.</p>
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div>
              <label className="text-[10px] text-muted uppercase tracking-widest block mb-2">Start Time</label>
              <input type="time" value={offPeakStart} onChange={e => setOffPeakStart(e.target.value)} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-headline font-bold ghost-border focus:outline-none focus:border-primary/40 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-muted uppercase tracking-widest block mb-2">End Time</label>
              <input type="time" value={offPeakEnd} onChange={e => setOffPeakEnd(e.target.value)} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-headline font-bold ghost-border focus:outline-none focus:border-primary/40 transition-colors" />
            </div>
          </div>

          <div className="mt-8 bg-surface-container-low/60 rounded-xl p-5 ghost-border relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-on-surface">Load Shifting</h4>
                <p className="text-[10px] text-muted mt-0.5">Automatically delay heavy appliance cycles to match off-peak energy windows.</p>
              </div>
              <button onClick={() => setLoadShift(!loadShift)} className={`w-14 h-7 rounded-full relative transition-colors ${loadShift ? 'bg-tertiary' : 'bg-white/10'}`}>
                <motion.div animate={{ x: loadShift ? 28 : 4 }} className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Environmental context */}
        <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border">
          <h3 className="text-sm font-bold font-headline text-muted mb-4">Current Environment</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center"><span className="text-[10px] text-muted block">Temperature</span><span className="text-2xl font-bold font-headline text-primary">{data.environment?.temperature}°C</span></div>
            <div className="text-center"><span className="text-[10px] text-muted block">Humidity</span><span className="text-2xl font-bold font-headline text-tertiary">{data.environment?.humidity}%</span></div>
            <div className="text-center"><span className="text-[10px] text-muted block">Wind</span><span className="text-2xl font-bold font-headline text-secondary">{data.environment?.wind_speed} km/h</span></div>
          </div>
        </div>
      </div>
    </main>
  );
};
