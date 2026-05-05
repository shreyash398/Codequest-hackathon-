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
        const result = await r.json();
        setData(result);
      } catch (e) { console.error("History fetch failed", e); }
    };
    
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);

    return () => {
      unsubFirebase();
      clearInterval(interval);
    };
  }, []);

  // Fallback if historical data is still loading
  const history = data?.history || {};
  const stats = data?.stats || {};
  const rawEnergy = history.energy || [];
  const solarGen = history.solar || history.energy?.map(() => 0) || [];
  
  // Real Hardware Metrics Mapping (with safe fallbacks)
  const activeCons = hardwareData?.power ? hardwareData.power.toFixed(2) : "0.00";
  const voltage = hardwareData?.voltage ? hardwareData.voltage.toFixed(1) : "0.0";
  const current = hardwareData?.current ? hardwareData.current.toFixed(3) : "0.000";
  const frequency = hardwareData?.frequency ? hardwareData.frequency.toFixed(1) : "0.0";
  const energyTotal = hardwareData?.energy ? hardwareData.energy.toFixed(3) : "0.000";
  const pf = hardwareData?.pf ? hardwareData.pf.toFixed(2) : "0.00";

  return (
    <main className="md:ml-64 pt-6 px-6 pb-12 relative min-h-screen">
      <div className="bg-mesh"></div>
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Tabs & Status */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-tab rounded-2xl px-6 py-3 border-white/5">
          <div className="flex gap-2 p-1 bg-black/20 rounded-xl">
            <button className="px-6 py-1.5 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all glass-tab-active">Live View</button>
            <button className="px-6 py-1.5 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all text-muted hover:text-on-surface">History</button>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2.5 bg-black/30 rounded-full px-4 py-2 border border-white/5 backdrop-blur-md">
              <span className={`w-2 h-2 rounded-full ${hardwareData ? 'bg-secondary' : 'bg-error'} pulse-live`}></span>
              <span className="text-[10px] text-muted uppercase tracking-widest font-black">
                {hardwareData ? 'Hardware Link: Active' : 'Hardware Link: Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-black font-headline text-gradient-primary mb-1">Energy Intelligence</h2>
          <p className="text-sm text-muted font-medium mb-8">Real-time telemetry and predictive analysis</p>
        </div>

        {/* Row 1: Real Hardware Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Power */}
          <div className="mesh-gradient-primary rounded-3xl p-6 ghost-border flex flex-col justify-between h-[190px] hover-lift group">
             <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest font-black mb-1 group-hover:text-primary transition-colors">Active Power</h3>
                <p className="text-5xl font-black font-headline text-primary tracking-tighter drop-shadow-lg">{activeCons} <span className="text-sm font-normal text-primary/70">W</span></p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all"><span className="material-symbols-outlined text-2xl">bolt</span></div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted mt-auto font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
              Live Load
            </div>
          </div>

          {/* Voltage */}
          <div className="mesh-gradient-secondary rounded-3xl p-6 ghost-border flex flex-col justify-between h-[190px] hover-lift group">
             <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest font-black mb-1 group-hover:text-secondary transition-colors">Line Voltage</h3>
                <p className="text-5xl font-black font-headline text-secondary tracking-tighter drop-shadow-lg">{voltage} <span className="text-sm font-normal text-secondary/70">V</span></p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/20 group-hover:bg-secondary group-hover:text-black transition-all"><span className="material-symbols-outlined text-2xl">electric_bolt</span></div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted mt-auto font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary/40"></span>
              Main Supply
            </div>
          </div>

          {/* Current */}
          <div className="mesh-gradient-primary rounded-3xl p-6 ghost-border flex flex-col justify-between h-[190px] hover-lift group">
             <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest font-black mb-1 group-hover:text-tertiary transition-colors">Total Current</h3>
                <p className="text-5xl font-black font-headline text-tertiary tracking-tighter drop-shadow-lg">{current} <span className="text-sm font-normal text-tertiary/70">A</span></p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center border border-tertiary/20 group-hover:bg-tertiary group-hover:text-black transition-all"><span className="material-symbols-outlined text-2xl">electric_meter</span></div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted mt-auto font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary/40"></span>
              Current Draw
            </div>
          </div>

          {/* Energy (kWh) */}
          <div className="mesh-gradient-secondary rounded-3xl p-6 ghost-border flex flex-col justify-between h-[190px] hover-lift group">
             <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest font-black mb-1 group-hover:text-on-surface transition-colors">Total Energy</h3>
                <p className="text-5xl font-black font-headline text-on-surface tracking-tighter drop-shadow-lg">{energyTotal} <span className="text-sm font-normal text-muted">kWh</span></p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 text-on-surface flex items-center justify-center border border-white/10 group-hover:bg-on-surface group-hover:text-black transition-all"><span className="material-symbols-outlined text-2xl">auto_graph</span></div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted mt-auto font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              Cumulative
            </div>
          </div>
        </div>

        {/* Row 2: Charts and Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 glass-card rounded-3xl p-8 border-white/5 relative overflow-hidden group hover-lift">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-tertiary/10 text-tertiary"><span className="material-symbols-outlined">show_chart</span></div>
                <h3 className="text-xl font-black font-headline tracking-tight">Energy Analytics</h3>
              </div>
              <div className="bg-secondary/10 text-secondary border border-secondary/20 rounded-full px-4 py-1.5 backdrop-blur-md">
                <span className="text-[10px] tracking-widest font-black uppercase">Real-Time</span>
              </div>
            </div>
            <div className="h-[260px]"><PlotlyEnergyFlow rawEnergy={rawEnergy} solarGen={solarGen} /></div>
          </div>

          <div className="xl:col-span-4 glass-card rounded-3xl p-8 border-white/5 flex flex-col justify-between hover-lift">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary"><span className="material-symbols-outlined">power_settings_new</span></div>
                <h3 className="text-xl font-black font-headline tracking-tight">System Status</h3>
             </div>
             <div className="space-y-4 mb-10">
               <div className="bg-black/20 rounded-2xl p-5 border border-white/5 flex items-center justify-between group hover:bg-black/30 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">bolt</span></div>
                    <div>
                      <span className="text-[10px] text-muted uppercase tracking-widest font-black">Status</span>
                      <p className="text-lg font-bold font-headline text-on-surface">Synchronized</p>
                    </div>
                 </div>
                 <span className="w-2 h-2 rounded-full bg-secondary pulse-live"></span>
               </div>
               
               <div className="bg-black/20 rounded-2xl p-5 border border-white/5 flex items-center justify-between group hover:bg-black/30 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">shield</span></div>
                    <div>
                      <span className="text-[10px] text-muted uppercase tracking-widest font-black">Safety</span>
                      <p className="text-lg font-bold font-headline text-on-surface">Isolated</p>
                    </div>
                 </div>
               </div>
             </div>
              <div className="border-t border-white/5 pt-6 space-y-3">
                <div className="flex justify-between items-center text-[11px] font-bold"><span className="text-muted tracking-widest uppercase">Grid Frequency</span><span className="text-on-surface">{frequency} Hz</span></div>
                <div className="flex justify-between items-center text-[11px] font-bold"><span className="text-muted tracking-widest uppercase">Power Factor</span><span className="text-on-surface">{pf}</span></div>
              </div>
          </div>
        </div>

        {/* 3D Flow Panel */}
        <div className="glass-card rounded-3xl p-8 border-white/5 h-[460px] flex flex-col relative overflow-hidden group hover-lift">
          <div className="absolute top-0 left-0 w-full h-full bg-mesh opacity-30"></div>
          <div className="flex items-center gap-3 absolute top-8 left-8 z-10 pointer-events-none">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20"><span className="material-symbols-outlined text-2xl">view_in_ar</span></div>
            <div>
              <h3 className="text-2xl font-black font-headline tracking-tight">Kinetic Topology</h3>
              <p className="text-[10px] text-muted uppercase tracking-widest font-black mt-0.5 opacity-60">Spatial Energy Distribution</p>
            </div>
          </div>
          <div className="absolute inset-0 pt-20">
            <EnergyFlow3D data={data} />
          </div>
        </div>

        {/* Row 3: Analysis & Mix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 glass-card rounded-3xl p-8 border-white/5 hover-lift">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-tertiary/10 text-tertiary"><span className="material-symbols-outlined">assessment</span></div>
              <h3 className="text-xl font-black font-headline tracking-tight">Weekly Performance</h3>
            </div>
            <div className="h-[220px]"><D3WeeklyPerformance data={history.weekly} /></div>
          </div>

          <div className="lg:col-span-4 glass-card rounded-3xl p-8 border-white/5 flex flex-col items-center hover-lift">
            <div className="flex items-center gap-3 self-start mb-8">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><span className="material-symbols-outlined">pie_chart</span></div>
              <h3 className="text-xl font-black font-headline tracking-tight">Source Mix</h3>
            </div>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <D3EnergyMix data={[
                { label: 'Solar', value: 0, color: '#ffa84f' },
                { label: 'Battery', value: 0, color: '#3fff8b' },
                { label: 'Grid', value: 100, color: '#44a5ff' }
              ]} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-muted uppercase tracking-widest font-black">Primary</span>
                <span className="text-3xl font-black font-headline text-secondary">GRID</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon="wb_sunny" title="Daily Generation" value={stats.daily_gen || "0.0"} unit="kWh" trend="+0% vs Yesterday" trendColor="text-secondary" iconColor="text-primary" />
          <StatCard icon="bolt" title="Daily Consumption" value={stats.daily_cons || "0.0"} unit="kWh" trend="Hardware Active" trendColor="text-secondary" iconColor="text-tertiary" />
          <StatCard icon="payments" title="Cost Savings" value={`₹${stats.savings || "0.0"}`} unit="" sub="est." trendColor="text-secondary" iconColor="text-secondary" />
          <StatCard icon="eco" title="CO2 Saved" value={stats.co2 || "0.0"} unit="kg" trendColor="text-secondary" iconColor="text-secondary" />
        </div>

      </div>
    </main>
  );
};

const StatCard = ({ icon, title, value, unit, sub, trend, trendColor, iconColor }) => (
  <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-[130px] border-white/5 hover-lift group">
    <div className="flex justify-between items-start">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 ${iconColor.replace('text-', 'bg-').replace('primary', 'primary/10').replace('secondary', 'secondary/10').replace('tertiary', 'tertiary/10')} group-hover:scale-110 transition-transform`}>
        <span className={`material-symbols-outlined text-lg ${iconColor}`}>{icon}</span>
      </div>
      {trend && <span className={`text-[9px] font-black tracking-widest uppercase ${trendColor}`}>{trend}</span>}
    </div>
    <div>
      <span className="text-[9px] text-muted uppercase tracking-widest font-black block mb-0.5 opacity-60">{title}</span>
      <p className="text-2xl font-black font-headline text-on-surface tracking-tight">{value} <span className="text-[10px] text-muted font-black uppercase">{unit} {sub}</span></p>
    </div>
  </div>
);
