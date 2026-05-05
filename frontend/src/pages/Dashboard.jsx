import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlotlyEnergyFlow } from '../components/charts/PlotlyEnergyFlow';
import { D3WeeklyPerformance } from '../components/charts/D3WeeklyPerformance';
import { D3StorageGauge } from '../components/charts/D3StorageGauge';
import { D3EnergyMix } from '../components/charts/D3EnergyMix';
import { EnergyFlow3D } from '../components/charts/EnergyFlow3D';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { getApiUrl } from '../apiConfig';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [hardwareData, setHardwareData] = useState(null);

  useEffect(() => {
    // 1. Listen to Real-time Hardware Data from Firebase
    const energyRef = ref(db, "energy/");
    const unsubFirebase = onValue(energyRef, (snapshot) => {
      if (snapshot.exists()) {
        setHardwareData(snapshot.val());
      }
    });

    // 2. Fetch Historical data from local API (SQLite)
    const fetchHistory = async () => {
      try {
        const r = await fetch(getApiUrl('/api/status'));
        setData(await r.json());
      } catch (e) { console.error("History fetch failed", e); }
    };
    fetchHistory();

    return () => unsubFirebase();
  }, []);

  // Fallback if historical data is still loading
  const history = data?.history || {};
  const rawEnergy = history.energy || [];
  const solarGen = history.solar || [];
  
  // Real Hardware Metrics Mapping (with safe fallbacks)
  const activeCons = hardwareData?.power ? hardwareData.power.toFixed(2) : "0.00";
  const voltage = hardwareData?.voltage ? hardwareData.voltage.toFixed(1) : "0.0";
  const current = hardwareData?.current ? hardwareData.current.toFixed(3) : "0.000";
  const frequency = hardwareData?.frequency ? hardwareData.frequency.toFixed(1) : "0.0";
  const energyTotal = hardwareData?.energy ? hardwareData.energy.toFixed(3) : "0.000";
  const pf = hardwareData?.pf ? hardwareData.pf.toFixed(2) : "0.00";

  return (
    <main className="md:ml-64 pt-6 px-6 pb-12 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Tabs & Status */}
        <div className="flex justify-between items-center bg-surface-container-high/40 rounded-xl px-4 py-2 ghost-border">
          <div className="flex gap-6 text-[11px] font-bold tracking-widest uppercase">
            <button className="text-secondary border-b-2 border-secondary pb-1 pt-1">Live View</button>
            <button className="text-muted hover:text-on-surface pt-1 pb-1 transition-colors">History</button>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-surface-container/80 rounded-full px-3 py-1.5 ghost-border">
              <span className={`w-1.5 h-1.5 rounded-full ${hardwareData ? 'bg-secondary pulse-live' : 'bg-error'}`}></span>
              <span className="text-[9px] text-muted uppercase tracking-widest font-bold">
                {hardwareData ? 'HARDWARE: LIVE' : 'HARDWARE: OFFLINE'}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container/80 rounded-full px-3 py-1.5 ghost-border">
              <span className="material-symbols-outlined text-primary text-[12px]">bolt</span>
              <span className="text-[9px] text-muted uppercase tracking-widest font-bold">INVERTER:ACTIVE</span>
            </div>
          </div>
        </div>


        {/* Row 1: Real Hardware Metric Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Active Power */}
          <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border flex flex-col justify-between h-[180px]">
             <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Active Power</h3>
                <p className="text-4xl font-black font-headline text-primary tracking-tighter">{activeCons} <span className="text-sm font-normal text-primary/70">W</span></p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><span className="material-symbols-outlined">bolt</span></div>
            </div>
            <div className="text-[10px] text-muted mt-auto">Real-time load from hardware</div>
          </div>

          {/* Voltage */}
          <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border flex flex-col justify-between h-[180px]">
             <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Line Voltage</h3>
                <p className="text-4xl font-black font-headline text-secondary tracking-tighter">{voltage} <span className="text-sm font-normal text-secondary/70">V</span></p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center"><span className="material-symbols-outlined">electric_bolt</span></div>
            </div>
            <div className="text-[10px] text-muted mt-auto">Main supply voltage</div>
          </div>

          {/* Current */}
          <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border flex flex-col justify-between h-[180px]">
             <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Total Current</h3>
                <p className="text-4xl font-black font-headline text-tertiary tracking-tighter">{current} <span className="text-sm font-normal text-tertiary/70">A</span></p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center"><span className="material-symbols-outlined">electric_meter</span></div>
            </div>
            <div className="text-[10px] text-muted mt-auto">Amperage draw</div>
          </div>

          {/* Energy (kWh) */}
          <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border flex flex-col justify-between h-[180px]">
             <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Total Energy</h3>
                <p className="text-4xl font-black font-headline text-on-surface tracking-tighter">{energyTotal} <span className="text-sm font-normal text-muted">kWh</span></p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-on-surface/10 text-on-surface flex items-center justify-center"><span className="material-symbols-outlined">auto_graph</span></div>
            </div>
            <div className="text-[10px] text-muted mt-auto">Cumulative consumption</div>
          </div>
        </div>

        {/* Row 2: Charts and Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 bg-surface-container-highest/60 rounded-2xl p-6 ghost-border">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">show_chart</span>
                <h3 className="text-lg font-bold font-headline">Energy Flow Analysis</h3>
              </div>
              <div className="bg-[#3fff8b]/10 text-[#3fff8b] border border-[#3fff8b]/20 rounded-full px-3 py-1 flex items-center ghost-border">
                <span className="text-[10px] tracking-widest font-bold uppercase">LIVE</span>
              </div>
            </div>
            <div className="h-[220px]"><PlotlyEnergyFlow rawEnergy={rawEnergy} solarGen={solarGen} /></div>
            <div className="flex items-center justify-center gap-6 mt-6 text-[12px] font-body tracking-wider">
              <span className="flex items-center gap-2 text-[#44a5ff]">
                <span className="flex items-center justify-center w-6 relative">
                  <span className="absolute w-full border-t border-[#44a5ff]/80"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-background border border-[#44a5ff] relative z-10"></span>
                </span>
                Consumption
              </span>
              <span className="flex items-center gap-1.5 text-[#3fff8b]">
                <span className="w-3 h-3 bg-[#3fff8b] rounded-sm"></span>
                Net Energy
              </span>
              <span className="flex items-center gap-2 text-[#ffa84f]">
                <span className="flex items-center justify-center w-6 relative">
                  <span className="absolute w-full border-t border-[#ffa84f]/80"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-background border border-[#ffa84f] relative z-10"></span>
                </span>
                Solar Generation
              </span>
            </div>
          </div>

          <div className="xl:col-span-4 bg-surface-container-highest/60 rounded-2xl p-6 ghost-border flex flex-col justify-between">
             <h3 className="text-base font-bold font-headline mb-4">Grid Activity</h3>
             <div className="space-y-3 mb-6">
               <div className="bg-surface-container/60 rounded-xl p-4 flex items-center gap-4 ghost-border">
                 <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20"><span className="material-symbols-outlined text-lg">vertical_align_bottom</span></div>
                 <div>
                   <span className="text-[10px] text-muted uppercase tracking-widest font-bold">Exporting to Grid</span>
                   <p className="text-xl font-bold font-headline text-on-surface mt-0.5">4.58 kW</p>
                 </div>
               </div>
               <div className="bg-surface-container/60 rounded-xl p-4 flex items-center gap-4 ghost-border">
                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted border border-white/10"><span className="material-symbols-outlined text-lg">vertical_align_top</span></div>
                 <div>
                   <span className="text-[10px] text-muted uppercase tracking-widest font-bold">System Status</span>
                   <p className="text-xl font-bold font-headline text-on-surface mt-0.5">Normal</p>
                 </div>
               </div>
             </div>
              <div className="border-t border-white/5 pt-4 space-y-2">
                <div className="flex justify-between items-center text-[11px]"><span className="text-muted">Grid Frequency</span><span className="font-bold text-on-surface">{frequency} Hz</span></div>
                <div className="flex justify-between items-center text-[11px]"><span className="text-muted">Grid Voltage</span><span className="font-bold text-on-surface">{voltage} V</span></div>
                <div className="flex justify-between items-center text-[11px]"><span className="text-muted">Power Factor</span><span className="font-bold text-on-surface">{pf}</span></div>
              </div>
          </div>
        </div>

        {/* Topology Row */}
        <div className="mb-6">
          {/* 3D Energy Flow */}
          <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border h-[380px] flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-2 absolute top-6 left-6 z-10 pointer-events-none">
              <span className="material-symbols-outlined text-primary text-xl">3d_rotation</span>
              <div>
                <h3 className="text-lg font-bold font-headline">Energy Flow 3D</h3>
                <p className="text-[10px] text-muted uppercase tracking-widest mt-0.5">Real-time particle stream</p>
              </div>
            </div>
            <div className="absolute inset-0 pt-16">
              <EnergyFlow3D data={data} />
            </div>
          </div>
        </div>

        {/* Row 3: Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard icon="wb_sunny" title="Daily Generation" value="32.4" unit="kWh" trend="+12% vs Yesterday" trendColor="text-secondary" iconColor="text-primary" />
          <StatCard icon="bolt" title="Daily Consumption" value="18.1" unit="kWh" trend="-4% Efficiency" trendColor="text-error" iconColor="text-tertiary" />
          <StatCard icon="payments" title="Cost Savings" value="₹14.65" unit="" sub="today" trendColor="text-secondary" iconColor="text-secondary" />
          <StatCard icon="eco" title="CO2 Saved" value="12.4" unit="kg" trendColor="text-secondary" iconColor="text-secondary" />
        </div>


        {/* Row 5: Weekly + Mix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-surface-container-highest/60 rounded-2xl p-6 ghost-border flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#44a5ff]">trending_up</span>
                <h3 className="text-base font-bold font-headline">Weekly Performance</h3>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-[9px] text-muted font-bold tracking-widest uppercase"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Solar</span>
                <span className="flex items-center gap-1.5 text-[9px] text-muted font-bold tracking-widest uppercase"><span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>Grid</span>
              </div>
            </div>
            <div className="flex-1 min-h-[160px]"><D3WeeklyPerformance /></div>
          </div>

          <div className="lg:col-span-4 bg-surface-container-highest/60 rounded-2xl p-6 ghost-border flex flex-col items-center justify-center">
            <h3 className="text-base font-bold font-headline self-start mb-6">Energy Source Mix</h3>
            <div className="flex items-center justify-center gap-8 w-full">
              <div className="relative w-36 h-36">
                <D3EnergyMix />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] text-muted uppercase tracking-widest font-bold">Renewable</span>
                  <span className="text-2xl font-black font-headline text-secondary">92%</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-6 w-full">
              <span className="flex items-center gap-1.5 text-[10px] text-muted"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Solar: 75%</span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>Battery: 17%</span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted"><span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>Grid: 8%</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

const StatCard = ({ icon, title, value, unit, sub, trend, trendColor, iconColor }) => (
  <div className="bg-surface-container-highest/60 rounded-2xl p-5 flex flex-col justify-between h-[130px] ghost-border">
    <div className="flex justify-between items-start">
      <span className={`material-symbols-outlined text-lg ${iconColor}`}>{icon}</span>
      {trend && <span className={`text-[9px] font-bold tracking-widest ${trendColor}`}>{trend}</span>}
    </div>
    <div>
      <span className="text-[9px] text-muted uppercase tracking-widest block mb-0.5">{title}</span>
      <p className="text-2xl font-black font-headline text-on-surface">{value} <span className="text-xs text-muted font-normal">{unit} {sub}</span></p>
    </div>
  </div>
);
