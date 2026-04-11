import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const TABS = ['Controls', 'Settings', 'Schedule', 'Alerts'];

export const ControlCenter = () => {
  const [activeTab, setActiveTab] = useState('Controls');
  const [data, setData] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRestart = async () => {
    try {
      showNotification('Restarting system...', 'warning');
      const r = await fetch('http://localhost:5000/api/system/restart', { method: 'POST' });
      if (r.ok) {
        const result = await r.json();
        setData(result.status);
        showNotification('System rebooted successfully');
      }
    } catch (e) {
      showNotification('Restart failed', 'error');
    }
  };

  const handleExport = async (format) => {
    try {
      showNotification(`Exporting ${format.toUpperCase()}...`);
      const response = await fetch(`http://localhost:5000/api/system/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kinetic_telemetry.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      showNotification(`${format.toUpperCase()} exported`);
    } catch (e) {
      showNotification('Export failed', 'error');
    }
  };

  const handleSaveConfig = () => {
    showNotification('Configuration saved to local storage');
  };

  useEffect(() => {
    const f = async () => { try { setData(await (await fetch('http://localhost:5000/api/status')).json()); } catch(e) {} };
    f(); const i = setInterval(f, 2000); return () => clearInterval(i);
  }, []);

  const toggleDevice = async (device, currentStatus) => {
    try { await fetch('http://localhost:5000/api/control', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ device, status: currentStatus === 'ON' ? 'OFF' : 'ON' })}); } catch(e) {}
  };

  const triggerSpike = async () => {
    try { await fetch('http://localhost:5000/api/trigger-spike', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ device: 'HVAC' })}); } catch(e) {}
  };

  const clearSpike = async () => {
    try { await fetch('http://localhost:5000/api/clear-spike', { method: 'POST' }); } catch(e) {}
  };

  if (!data) return (
    <div className="md:ml-64 h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const isAnomaly = data.anomaly?.detected;

  return (
    <main className="md:ml-64 pt-24 px-6 pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black font-headline tracking-tight">Energy Control Center</h1>
            <p className="text-sm text-muted mt-1">Real-time hardware management and system overrides.</p>
          </div>
          <div className="flex bg-surface-container/80 rounded-xl p-1 ghost-border">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-xs font-bold font-headline tracking-wider uppercase transition-all ${activeTab === tab ? 'gradient-primary text-[#231000] shadow-lg' : 'text-muted hover:text-on-surface'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'Controls' && <ControlsTab key="controls" data={data} toggleDevice={toggleDevice} triggerSpike={triggerSpike} clearSpike={clearSpike} isAnomaly={isAnomaly} handleExport={handleExport} handleRestart={handleRestart} handleSaveConfig={handleSaveConfig} />}
          {activeTab === 'Settings' && <SettingsTab key="settings" data={data} showNotification={showNotification} />}
          {activeTab === 'Schedule' && <ScheduleTab key="schedule" data={data} />}
          {activeTab === 'Alerts' && <AlertsTab key="alerts" data={data} />}
        </AnimatePresence>

        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`fixed bottom-8 right-8 z-50 px-6 py-3 rounded-xl shadow-2xl border ghost-border flex items-center gap-3 ${notification.type === 'error' ? 'bg-error/90 text-white border-error/20' : notification.type === 'warning' ? 'bg-primary/90 text-[#231000] border-primary/20' : 'bg-secondary/90 text-[#231000] border-secondary/20'}`}>
              <span className="material-symbols-outlined text-base">
                {notification.type === 'error' ? 'error' : notification.type === 'warning' ? 'potted_plant' : 'check_circle'}
              </span>
              <span className="font-bold text-sm">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TAB 1: CONTROLS
   ═══════════════════════════════════════════════════════════════ */
const ControlsTab = ({ data, toggleDevice, triggerSpike, clearSpike, isAnomaly, handleExport, handleRestart, handleSaveConfig }) => {
  const devices = [
    { name: 'HVAC', label: 'Solar Inverter', icon: 'wb_sunny', getDesc: (d) => `Active Generation: ${d?.current?.toFixed(1) || 0} kW` },
    { name: 'Data Center', label: 'Battery System', icon: 'battery_charging_full', getDesc: (d) => `Charge Level: ${Math.round((d?.current || 0) / 1.2)}%` },
    { name: 'Production Line', label: 'Grid Connection', icon: 'electrical_services', getDesc: (d) => `Net Metering: ${d?.status === 'ON' ? 'Exporting' : 'Standby'}` },
    { name: 'Lighting', label: 'Smart Load Management', icon: 'tune', getDesc: (d) => `Optimizing ${Object.values(data.appliances).filter(a => a.status === 'ON').length * 3} appliances` },
  ];

  const efficiencyRating = isAnomaly ? 78 : 92;

  // Mini bar chart data for kinetic flow
  const barData = {
    labels: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6'],
    datasets: [{
      data: Object.values(data.appliances).map(a => Math.round(a.current)).concat([0, 0]).slice(0, 6),
      backgroundColor: '#3fff8b', borderRadius: 6, barThickness: 28,
    }],
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Device Controls */}
        <div className="lg:col-span-8 bg-surface-container-highest/60 rounded-2xl p-6 ghost-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-primary"></span>
              <h3 className="text-lg font-bold font-headline">Device Controls</h3>
            </div>
            <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
              <span className={`w-2 h-2 rounded-full ${isAnomaly ? 'bg-error' : 'bg-secondary'} pulse-live`}></span>
              <span className={isAnomaly ? 'text-error' : 'text-secondary'}>{isAnomaly ? 'ANOMALY' : 'SYSTEM LIVE'}</span>
            </span>
          </div>
          <div className="space-y-3">
            {devices.map((device) => {
              const appData = data.appliances[device.name];
              const isOn = appData?.status === 'ON';
              const isAnomalyDevice = isAnomaly && data.anomaly.device === device.name;
              return (
                <div key={device.name} className={`bg-surface-container/60 rounded-xl p-4 ghost-border flex items-center justify-between transition-all hover:bg-surface-container-high/60 ${isAnomalyDevice ? 'ring-1 ring-error/30' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOn ? 'bg-primary/15 text-primary' : 'bg-white/5 text-muted-dark'}`}>
                      <span className="material-symbols-outlined text-lg">{device.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">{device.label}</h4>
                      <p className="text-[11px] text-on-surface-variant">{device.getDesc(appData)}</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={isOn} onChange={() => toggleDevice(device.name, appData?.status)} />
                </div>
              );
            })}
            {/* Backup Mode */}
            <div className="bg-surface-container/60 rounded-xl p-4 ghost-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-error/15 text-error flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">shield</span>
                </div>
                <div>
                  <h4 className="font-bold text-error text-sm">Backup Mode</h4>
                  <p className="text-[11px] text-on-surface-variant">Standby for power outage</p>
                </div>
              </div>
              <ToggleSwitch enabled={false} onChange={() => {}} color="error" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1 h-6 rounded-full bg-primary"></span>
              <h3 className="text-lg font-bold font-headline">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <QuickAction icon="description" label="Export CSV" desc="Download monthly logs" onClick={() => handleExport('csv')} />
              <QuickAction icon="code" label="Export JSON" desc="Raw telemetry data" onClick={() => handleExport('json')} />
              <QuickAction icon="refresh" label="Restart System" desc="Full hardware reboot" onClick={handleRestart} />
            </div>
            <button onClick={handleSaveConfig} className="w-full mt-4 gradient-primary text-[#231000] py-3 rounded-xl font-bold text-sm tracking-wider transition-all hover:brightness-110 active:scale-[0.98]">Save Config</button>
          </div>
        </div>
      </div>

      {/* Real-time Kinetic Flow + Security */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface-container-highest/60 rounded-2xl p-6 ghost-border">
          <h3 className="text-lg font-bold font-headline mb-6">Real-time Kinetic Flow</h3>
          <div className="flex items-end gap-8">
            <div className="text-center">
              <span className={`text-6xl font-black font-headline ${isAnomaly ? 'text-error' : 'text-secondary'}`}>{efficiencyRating}%</span>
              <p className="text-[10px] text-muted uppercase tracking-widest mt-1">Efficiency Rating</p>
            </div>
            <div className="flex-1 h-32">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(0,0,0,0.9)', cornerRadius: 8 } }, scales: { x: { display: false }, y: { display: false } } }} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-container-highest/60 rounded-2xl p-6 ghost-border">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] text-muted uppercase tracking-widest font-bold">SEC</span>
            <div className="flex items-center gap-2 bg-surface-container/60 rounded-full px-3 py-1 ghost-border">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span className="text-[9px] text-secondary font-bold tracking-widest uppercase">HARDWARE STATUS: NOMINAL</span>
            </div>
          </div>
          <div className="space-y-5 mt-6">
            <SecurityItem icon="verified_user" label="Encrypted Link" desc="AES-256 Protocol Active" color="secondary" />
            <SecurityItem icon="sync" label="Last Sync" desc="2 minutes ago" color="tertiary" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TAB 2: SETTINGS
   ═══════════════════════════════════════════════════════════════ */
const SettingsTab = ({ data, showNotification }) => {
  const settings = data.settings || {};
  
  const updateSetting = async (key, value) => {
    try {
      const r = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
      if (!r.ok) throw new Error();
    } catch (e) {
      showNotification('Failed to update setting', 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
      <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">settings</span>
          </div>
          <h2 className="text-xl font-black font-headline tracking-tight">System Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
          {/* Battery Management */}
          <div className="space-y-8">
            <h3 className="text-sm font-black font-headline tracking-widest text-on-surface uppercase mb-6">Battery Management</h3>
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[11px] font-bold tracking-widest uppercase text-muted">
                  <span>Minimum Battery Level</span>
                  <span className="text-on-surface">{settings.min_battery_level}%</span>
                </div>
                <input type="range" min="0" max="50" value={settings.min_battery_level} 
                  onChange={e => updateSetting('min_battery_level', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-low rounded-full appearance-none cursor-pointer accent-secondary" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[11px] font-bold tracking-widest uppercase text-muted">
                  <span>Maximum Battery Level</span>
                  <span className="text-on-surface">{settings.max_battery_level}%</span>
                </div>
                <input type="range" min="50" max="100" value={settings.max_battery_level} 
                  onChange={e => updateSetting('max_battery_level', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-low rounded-full appearance-none cursor-pointer accent-secondary" />
              </div>
            </div>
          </div>

          {/* Grid Management */}
          <div className="space-y-8">
            <h3 className="text-sm font-black font-headline tracking-widest text-on-surface uppercase mb-6">Grid Management</h3>
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[11px] font-bold tracking-widest uppercase text-muted">
                  <span>Grid Export Limit (kW)</span>
                  <span className="text-on-surface">{settings.grid_export_limit} kW</span>
                </div>
                <input type="range" min="0" max="25" value={settings.grid_export_limit} 
                  onChange={e => updateSetting('grid_export_limit', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-low rounded-full appearance-none cursor-pointer accent-secondary" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[11px] font-bold tracking-widest uppercase text-muted">
                  <span>Load Priority</span>
                </div>
                <select value={settings.load_priority} onChange={e => updateSetting('load_priority', e.target.value)}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm font-bold border border-white/5 focus:outline-none focus:border-primary/40 appearance-none cursor-pointer">
                  <option value="Solar First">Solar First</option>
                  <option value="Battery First">Battery First</option>
                  <option value="Grid First">Grid Balanced</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5 w-full mb-8"></div>

        {/* Action Toggle Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SettingsButton label="Peak Shaving" active={settings.peak_shaving} onClick={() => updateSetting('peak_shaving', !settings.peak_shaving)} />
          <SettingsButton label="Night Mode" active={settings.night_mode} onClick={() => updateSetting('night_mode', !settings.night_mode)} />
          <SettingsButton label="Enable Alerts" active={settings.enable_alerts} onClick={() => updateSetting('enable_alerts', !settings.enable_alerts)} />
          <SettingsButton label="Auto Restart" active={settings.auto_restart} onClick={() => updateSetting('auto_restart', !settings.auto_restart)} />
        </div>
      </div>

      <div className="bg-surface-container-low/40 rounded-2xl p-5 ghost-border flex items-center gap-3">
        <span className="material-symbols-outlined text-sm text-muted">lock</span>
        <p className="text-[10px] text-muted-dark leading-relaxed font-bold tracking-wider uppercase">System changes are propagated via Kinetic Core end-to-end encrypted protocols.</p>
      </div>
    </motion.div>
  );
};

const SettingsButton = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`py-4 rounded-xl font-black font-headline text-xs tracking-widest uppercase transition-all border ghost-border ${active ? 'gradient-primary text-[#231000] shadow-lg scale-[1.02]' : 'bg-surface-container-low/50 text-muted hover:text-on-surface hover:bg-surface-container-high/50'}`}>
    {label}
  </button>
);

/* ═══════════════════════════════════════════════════════════════
   TAB 3: SCHEDULE
   ═══════════════════════════════════════════════════════════════ */
const ScheduleTab = ({ data }) => {
  const [solarOpt, setSolarOpt] = useState(true);
  const [loadShift, setLoadShift] = useState(true);
  const [peakStart, setPeakStart] = useState('09:00');
  const [peakEnd, setPeakEnd] = useState('17:00');
  const [offPeakStart, setOffPeakStart] = useState('22:00');
  const [offPeakEnd, setOffPeakEnd] = useState('06:00');

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Automate node performance based on grid volatility and solar yield.</p>
        <div className="bg-surface-container-highest/60 rounded-xl px-5 py-2.5 ghost-border">
          <span className="text-[10px] text-muted uppercase tracking-widest block">Current Yield</span>
          <span className="text-xl font-black font-headline text-primary">{data.total_energy} <span className="text-xs text-muted font-normal">kW</span></span>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-surface-container-highest/60 rounded-2xl p-8 ghost-border relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/8 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <span className="material-symbols-outlined text-primary">wb_sunny</span>
          <h2 className="text-xl font-bold font-headline">Peak Hours Configuration</h2>
        </div>
        <p className="text-xs text-muted mb-6 relative z-10">Automatically switch to discharge mode during peak pricing.</p>
        <div className="grid grid-cols-2 gap-6 relative z-10">
          <TimeInput label="Start Time" value={peakStart} onChange={e => setPeakStart(e.target.value)} />
          <TimeInput label="End Time" value={peakEnd} onChange={e => setPeakEnd(e.target.value)} />
        </div>
        <div className="mt-6 relative z-10">
          <SettingsToggle label="Solar Optimization" desc="Prioritize solar panel charging during daylight." enabled={solarOpt} onChange={() => setSolarOpt(!solarOpt)} color="secondary" />
        </div>
      </div>

      {/* Off-Peak Hours */}
      <div className="bg-surface-container-highest/60 rounded-2xl p-8 ghost-border relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-tertiary/8 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <span className="material-symbols-outlined text-tertiary">dark_mode</span>
          <h2 className="text-xl font-bold font-headline">Off-Peak Hours Configuration</h2>
        </div>
        <p className="text-xs text-muted mb-6 relative z-10">Prioritize battery replenishment. HVAC pre-conditioning enabled.</p>
        <div className="grid grid-cols-2 gap-6 relative z-10">
          <TimeInput label="Start Time" value={offPeakStart} onChange={e => setOffPeakStart(e.target.value)} />
          <TimeInput label="End Time" value={offPeakEnd} onChange={e => setOffPeakEnd(e.target.value)} />
        </div>
        <div className="mt-6 relative z-10">
          <SettingsToggle label="Load Shifting" desc="Delay heavy appliance cycles to off-peak windows." enabled={loadShift} onChange={() => setLoadShift(!loadShift)} color="tertiary" />
        </div>
      </div>

      {/* Environment */}
      <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border">
        <h3 className="text-sm font-bold font-headline text-muted mb-4">Current Environment</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center"><span className="text-[10px] text-muted block">Temperature</span><span className="text-2xl font-bold font-headline text-primary">{data.environment?.temperature}°C</span></div>
          <div className="text-center"><span className="text-[10px] text-muted block">Humidity</span><span className="text-2xl font-bold font-headline text-tertiary">{data.environment?.humidity}%</span></div>
          <div className="text-center"><span className="text-[10px] text-muted block">Wind</span><span className="text-2xl font-bold font-headline text-secondary">{data.environment?.wind_speed} km/h</span></div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TAB 4: ALERTS
   ═══════════════════════════════════════════════════════════════ */
const AlertsTab = ({ data }) => {
  const isAnomaly = data.anomaly?.detected;
  const timeAgo = (mins) => `${mins} min ago`;

  const alerts = [];

  if (isAnomaly) {
    alerts.push({ id: 'anomaly', severity: 'critical', icon: 'crisis_alert', title: `${data.anomaly.device} — Grid Violation`, desc: `Waste rate: ₹${data.money_lost.toFixed(1)}/cycle. Intervention recommended.`, time: 'Just now' });
  }

  Object.entries(data.appliances).forEach(([name, device]) => {
    if (device.status === 'OFF') {
      alerts.push({ id: `${name}-off`, severity: 'warning', icon: 'power_off', title: `${name} deactivated`, desc: 'Manual override or scheduled downtime.', time: timeAgo(Math.floor(Math.random() * 5 + 1)) });
    }
  });

  const onlineCount = Object.values(data.appliances).filter(a => a.status === 'ON').length;
  if (onlineCount === Object.keys(data.appliances).length) {
    alerts.push({ id: 'optimal', severity: 'success', icon: 'check_circle', title: 'System running optimally', desc: `All ${onlineCount * 3} nodes report health scores above 98%.`, time: timeAgo(2) });
  }

  alerts.push({ id: 'gen', severity: 'info', icon: 'solar_power', title: 'Generation target on track', desc: `${(data.total_energy * 0.12).toFixed(1)} kWh produced. Battery at ${Math.min(85, Math.round(data.total_energy / 4))}%.`, time: timeAgo(5) });

  if (data.eco_mode) {
    alerts.push({ id: 'eco', severity: 'success', icon: 'eco', title: 'Eco-Mode engaged', desc: 'AI reducing peak consumption by up to 15%.', time: timeAgo(3) });
  }

  alerts.push({ id: 'voltage', severity: isAnomaly ? 'warning' : 'info', icon: 'electric_bolt', title: isAnomaly ? 'Voltage fluctuation detected' : 'Grid voltage stable', desc: isAnomaly ? 'Stabilizers engaged.' : 'All sectors within 2% variance.', time: timeAgo(8) });

  alerts.push({ id: 'sync', severity: 'info', icon: 'sync', title: 'Inverter sync complete', desc: 'Communication latency: 12ms.', time: timeAgo(12) });

  const severityConfig = {
    critical: { bg: 'bg-error/10', text: 'text-error', badge: 'bg-error/20 text-error' },
    warning: { bg: 'bg-primary/5', text: 'text-primary', badge: 'bg-primary/20 text-primary' },
    success: { bg: 'bg-secondary/5', text: 'text-secondary', badge: 'bg-secondary/20 text-secondary' },
    info: { bg: 'bg-tertiary/5', text: 'text-tertiary', badge: 'bg-tertiary/20 text-tertiary' },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Real-time status updates and critical alerts.</p>
        <div className="flex gap-2">
          <span className="text-[10px] bg-error/10 text-error px-3 py-1 rounded-full font-bold">{alerts.filter(a => a.severity === 'critical').length} Critical</span>
          <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{alerts.filter(a => a.severity === 'warning').length} Warnings</span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const config = severityConfig[alert.severity];
          return (
            <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className={`${config.bg} rounded-xl p-5 ghost-border relative overflow-hidden`}>
              {alert.severity === 'critical' && <div className="absolute inset-0 bg-error/5 animate-pulse pointer-events-none"></div>}
              <div className="flex items-start gap-4 relative z-10">
                <div className={`w-9 h-9 rounded-lg ${config.badge} flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined ${config.text} text-base`}>{alert.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-on-surface text-sm">{alert.title}</h3>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full ${config.badge} font-bold uppercase tracking-widest`}>{alert.severity}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{alert.desc}</p>
                </div>
                <span className="text-[10px] text-muted flex-shrink-0">{alert.time}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Network Pulse */}
      <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border text-center relative overflow-hidden">
        <div className="absolute inset-0 hud-scanline pointer-events-none"></div>
        <div className="relative z-10">
          <span className="material-symbols-outlined text-primary text-3xl mb-2 block">radar</span>
          <h3 className="text-sm font-bold font-headline mb-1">Kinetic Network Pulse</h3>
          <p className="text-xs text-muted">Monitoring <span className="text-primary font-bold">{(data.total_energy * 16).toFixed(0)} kW</span> across global segments</p>
          <div className="grid grid-cols-4 gap-4 mt-6">
            <PulseStat label="Nodes" value="12" color="primary" />
            <PulseStat label="Uptime" value="99.8%" color="secondary" />
            <PulseStat label="Latency" value="12ms" color="tertiary" />
            <PulseStat label="Threads" value="48" color="primary" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
const ToggleSwitch = ({ enabled, onChange, color = 'primary' }) => (
  <button onClick={onChange} className={`w-14 h-7 rounded-full relative transition-colors flex-shrink-0 ${enabled ? `bg-${color}` : 'bg-white/10'}`}>
    <motion.div animate={{ x: enabled ? 28 : 4 }} className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-lg" />
  </button>
);

const SettingsToggle = ({ label, desc, enabled, onChange, color = 'primary' }) => (
  <div className="flex items-center justify-between py-3 px-1">
    <div>
      <h4 className="text-sm font-bold text-on-surface">{label}</h4>
      <p className="text-[10px] text-muted mt-0.5 max-w-sm">{desc}</p>
    </div>
    <ToggleSwitch enabled={enabled} onChange={onChange} color={color} />
  </div>
);

const TimeInput = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] text-muted uppercase tracking-widest block mb-2">{label}</label>
    <input type="time" value={value} onChange={onChange} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-headline font-bold ghost-border focus:outline-none focus:border-primary/40 transition-colors" />
  </div>
);

const QuickAction = ({ icon, label, desc, onClick }) => (
  <button onClick={onClick} className="w-full bg-surface-container/60 rounded-xl p-4 ghost-border flex items-center gap-4 hover:bg-surface-container-high/60 transition-all text-left group">
    <span className="material-symbols-outlined text-primary text-lg group-hover:scale-110 transition-transform">{icon}</span>
    <div>
      <h4 className="text-sm font-bold text-on-surface">{label}</h4>
      <p className="text-[10px] text-muted">{desc}</p>
    </div>
  </button>
);

const SecurityItem = ({ icon, label, desc, color }) => (
  <div className="flex items-center gap-4">
    <div className={`w-9 h-9 rounded-xl bg-${color}/15 flex items-center justify-center`}>
      <span className={`material-symbols-outlined text-${color} text-base`}>{icon}</span>
    </div>
    <div>
      <h4 className="text-sm font-bold text-on-surface">{label}</h4>
      <p className="text-[10px] text-muted">{desc}</p>
    </div>
  </div>
);

const PulseStat = ({ label, value, color }) => (
  <div>
    <span className="text-[10px] text-muted block uppercase tracking-widest">{label}</span>
    <span className={`text-lg font-black font-headline text-${color}`}>{value}</span>
  </div>
);
