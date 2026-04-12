import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlotlyEnergyFlow } from '../components/charts/PlotlyEnergyFlow';
import { D3WeeklyPerformance } from '../components/charts/D3WeeklyPerformance';
import { D3StorageGauge } from '../components/charts/D3StorageGauge';
import { D3EnergyMix } from '../components/charts/D3EnergyMix';
import { EnergyFlow3D } from '../components/charts/EnergyFlow3D';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchData = async () => {
    try {
      const r = await fetch('http://localhost:5000/api/status');
      setData(await r.json());
    } catch (e) { console.error("Backend unreachable", e); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerSpike = async () => {
    try {
      setIsSimulating(true);
      await fetch('http://localhost:5000/api/trigger-spike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device: 'HVAC' })
      });
      fetchData();
    } catch (e) { setIsSimulating(false); }
  };

  const clearSpike = async () => {
    try {
      setIsSimulating(false);
      await fetch('http://localhost:5000/api/clear-spike', { method: 'POST' });
      fetchData();
    } catch (e) { }
  };

  if (!data) return (
    <div className="md:ml-64 h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const history = data.history || {};
  const labels = new Array(30).fill('');
  labels[0] = '03:25';
  labels[4] = '03:26';
  labels[8] = '03:27';
  labels[12] = '03:28';
  labels[15] = '03:29';
  labels[19] = '03:30';
  labels[23] = '03:31';
  labels[26] = '03:32';
  labels[29] = '03:33';
  
  // Storage calculations
  const storageVal = data.total_energy; 
  const storageCap = 12.0;
  const storagePercent = Math.min(100, Math.round((storageVal / storageCap) * 100));

  // Consumption values
  const appliances = Object.entries(data.appliances);
  const activeCons = appliances.filter(([_, a]) => a.status === 'ON').reduce((s, [_, a]) => s + a.current, 0).toFixed(2);

  // Solar Values
  const solarGen = (data.total_energy / 1.5).toFixed(2);
  const pv1 = (solarGen / 2).toFixed(2);
  const pv2 = (solarGen / 2).toFixed(2);

  const rawEnergy = history.energy || [];

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
            <div className="flex gap-2">
              {data.anomaly?.detected ? (
                <button 
                  onClick={clearSpike}
                  className="flex items-center gap-2 bg-error/20 hover:bg-error/30 text-error rounded-full px-4 py-1.5 ghost-border transition-all animate-pulse"
                >
                  <span className="material-symbols-outlined text-[14px]">potted_plant</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest">STABILIZE GRID</span>
                </button>
              ) : (
                <button 
                  onClick={triggerSpike}
                  className="flex items-center gap-2 bg-primary/15 hover:bg-primary/25 text-primary rounded-full px-4 py-1.5 ghost-border transition-all"
                >
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest">TEST ANOMALY</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 bg-surface-container/80 rounded-full px-3 py-1.5 ghost-border">
              <span className={`w-1.5 h-1.5 rounded-full ${data.anomaly?.detected ? 'bg-error pulse-live' : 'bg-secondary pulse-live'}`}></span>
              <span className="text-[9px] text-muted uppercase tracking-widest font-bold">
                {data.anomaly?.detected ? 'ANOMALY DETECTED' : 'MQTT:CONNECTED'}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container/80 rounded-full px-3 py-1.5 ghost-border">
              <span className="material-symbols-outlined text-primary text-[12px]">bolt</span>
              <span className="text-[9px] text-muted uppercase tracking-widest font-bold">INVERTER:ACTIVE</span>
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

        {/* Row 1: Main Metric Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Solar Gen */}
          <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border flex flex-col justify-between h-[200px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Solar Generation</h3>
                <p className="text-5xl font-black font-headline text-primary tracking-tighter">{solarGen} <span className="text-sm font-normal text-primary/70">kW</span></p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><span className="material-symbols-outlined">wb_sunny</span></div>
            </div>
            <div className="flex gap-3 mt-auto">
              <div className="bg-surface-container/80 rounded-xl p-3 flex-1 ghost-border">
                <span className="text-[9px] text-muted tracking-widest">PV 1</span>
                <p className="text-sm font-bold font-headline text-on-surface mt-0.5">{pv1} kW</p>
              </div>
              <div className="bg-surface-container/80 rounded-xl p-3 flex-1 ghost-border">
                <span className="text-[9px] text-muted tracking-widest">PV 2</span>
                <p className="text-sm font-bold font-headline text-on-surface mt-0.5">{pv2} kW</p>
              </div>
            </div>
          </div>

          {/* Active Consumption */}
          <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border flex flex-col justify-between h-[200px]">
             <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Active Consumption</h3>
                <p className="text-5xl font-black font-headline text-tertiary tracking-tighter">{activeCons} <span className="text-sm font-normal text-tertiary/70">kW</span></p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center"><span className="material-symbols-outlined">bolt</span></div>
            </div>
            <div className="flex gap-4 mt-auto">
              {['Kitchen', 'HVAC', 'EV Charger'].map((lbl, idx) => (
                <div key={lbl} className="flex-1">
                  <span className="text-[9px] text-muted block mb-1">{lbl}</span>
                  <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary" style={{ width: idx === 0 ? '60%' : idx === 1 ? '30%' : '0%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Status */}
          <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border flex flex-col items-center justify-center h-[200px]">
             <div className="relative w-28 h-28">
               <D3StorageGauge percent={storagePercent} />
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-2xl font-black font-headline text-on-surface">{storagePercent}%</span>
                 <span className="text-[8px] text-secondary font-bold tracking-widest">CHARGING</span>
               </div>
             </div>
             <h3 className="text-[10px] text-muted uppercase tracking-widest font-bold mt-4">Storage Status</h3>
             <p className="text-xs font-bold text-on-surface">{storageVal.toFixed(1)} / {storageCap.toFixed(1)} kWh</p>
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
                   <span className="text-[10px] text-muted uppercase tracking-widest font-bold">Import From Grid</span>
                   <p className="text-xl font-bold font-headline text-on-surface mt-0.5">0.00 kW</p>
                 </div>
               </div>
             </div>
             <div className="border-t border-white/5 pt-4 space-y-2">
               <div className="flex justify-between items-center text-[11px]"><span className="text-muted">Grid Frequency</span><span className="font-bold text-on-surface">50.02 Hz</span></div>
               <div className="flex justify-between items-center text-[11px]"><span className="text-muted">Grid Voltage</span><span className="font-bold text-on-surface">231.4 V</span></div>
             </div>
          </div>
        </div>

        {/* Row 3: Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon="wb_sunny" title="Daily Generation" value="32.4" unit="kWh" trend="+12% vs Yesterday" trendColor="text-secondary" iconColor="text-primary" />
          <StatCard icon="bolt" title="Daily Consumption" value="18.1" unit="kWh" trend="-4% Efficiency" trendColor="text-error" iconColor="text-tertiary" />
          <StatCard icon="payments" title="Cost Savings" value="₹14.65" unit="" sub="today" trendColor="text-secondary" iconColor="text-secondary" />
          <StatCard icon="eco" title="CO2 Saved" value="12.4" unit="kg" trendColor="text-secondary" iconColor="text-secondary" />
        </div>

        {/* Row 4: Anomaly Simulation Panel */}
        <div className={`rounded-2xl p-6 ghost-border relative overflow-hidden transition-all duration-500 ${data.anomaly?.detected ? 'bg-error/10 ring-1 ring-error/30' : 'bg-surface-container-highest/60'}`}>
          {/* Animated background glow when anomaly is active */}
          {data.anomaly?.detected && (
            <div className="absolute inset-0 bg-gradient-to-r from-error/5 via-error/10 to-error/5 animate-pulse pointer-events-none"></div>
          )}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.anomaly?.detected ? 'bg-error/20 text-error' : 'bg-primary/15 text-primary'}`}>
                  <span className="material-symbols-outlined text-xl">{data.anomaly?.detected ? 'crisis_alert' : 'science'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-headline">AI Anomaly Simulation</h3>
                  <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Grid Stress Test & Diagnostics</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${data.anomaly?.detected ? 'bg-error/20 text-error' : 'bg-secondary/15 text-secondary'}`}>
                <span className={`w-2 h-2 rounded-full ${data.anomaly?.detected ? 'bg-error animate-ping' : 'bg-secondary'}`}></span>
                <span className={`w-2 h-2 rounded-full absolute ${data.anomaly?.detected ? 'bg-error' : 'bg-secondary'}`}></span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{data.anomaly?.detected ? 'ANOMALY ACTIVE' : 'SYSTEM NOMINAL'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Action Buttons */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                {data.anomaly?.detected ? (
                  <button 
                    onClick={clearSpike}
                    className="w-full flex items-center justify-center gap-3 bg-error hover:bg-error/80 text-white py-4 rounded-xl font-bold text-sm tracking-wider transition-all hover:shadow-lg hover:shadow-error/25 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-lg">potted_plant</span>
                    STABILIZE GRID
                  </button>
                ) : (
                  <button 
                    onClick={triggerSpike}
                    className="w-full flex items-center justify-center gap-3 gradient-primary text-[#231000] py-4 rounded-xl font-bold text-sm tracking-wider transition-all hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-lg">warning</span>
                    SIMULATE GRID SPIKE
                  </button>
                )}
                <p className="text-[10px] text-muted text-center leading-relaxed">
                  {data.anomaly?.detected 
                    ? 'An anomaly has been injected. The AI is analyzing the spike. Click above to resolve.' 
                    : 'Inject a simulated power surge to test AI detection and response capabilities.'}
                </p>
              </div>

              {/* Right: Status Indicators */}
              <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-surface-container/60 rounded-xl p-4 ghost-border text-center">
                  <span className="text-[9px] text-muted uppercase tracking-widest block mb-1">Status</span>
                  <span className={`text-xl font-black font-headline ${data.anomaly?.detected ? 'text-error' : 'text-secondary'}`}>
                    {data.anomaly?.detected ? 'CRITICAL' : 'HEALTHY'}
                  </span>
                </div>
                <div className="bg-surface-container/60 rounded-xl p-4 ghost-border text-center">
                  <span className="text-[9px] text-muted uppercase tracking-widest block mb-1">AI Confidence</span>
                  <span className={`text-xl font-black font-headline ${data.anomaly?.detected ? 'text-primary' : 'text-secondary'}`}>
                    {data.anomaly?.detected ? '94%' : '99%'}
                  </span>
                </div>
                <div className="bg-surface-container/60 rounded-xl p-4 ghost-border text-center">
                  <span className="text-[9px] text-muted uppercase tracking-widest block mb-1">Affected Device</span>
                  <span className="text-xl font-black font-headline text-on-surface">
                    {data.anomaly?.device || '—'}
                  </span>
                </div>
                <div className="bg-surface-container/60 rounded-xl p-4 ghost-border text-center">
                  <span className="text-[9px] text-muted uppercase tracking-widest block mb-1">Impact</span>
                  <span className={`text-xl font-black font-headline ${data.anomaly?.detected ? 'text-error' : 'text-secondary'}`}>
                    {data.anomaly?.impact || 'NORMAL'}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
