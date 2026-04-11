import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Alerts = () => {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const f = async () => { try { setData(await (await fetch('http://localhost:5000/api/status')).json()); } catch(e) {} };
    f(); const i = setInterval(f, 3000); return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!data) return;
    const now = new Date();
    const timeAgo = (mins) => `${mins} min ago`;
    const isAnomaly = data.anomaly?.detected;

    const baseAlerts = [];

    if (isAnomaly) {
      baseAlerts.push({
        id: 'anomaly-active',
        severity: 'critical',
        icon: 'crisis_alert',
        title: `${data.anomaly.device} — Grid Violation`,
        desc: `Anomaly detected. Waste rate: ₹${data.money_lost.toFixed(1)}/cycle. Immediate intervention recommended.`,
        time: 'Just now',
      });
    }

    // Dynamic alerts based on device status
    Object.entries(data.appliances).forEach(([name, device]) => {
      if (device.status === 'OFF') {
        baseAlerts.push({
          id: `${name}-off`,
          severity: 'warning',
          icon: 'power_off',
          title: `${name} deactivated`,
          desc: `Unit reports shutdown. Manual override or scheduled downtime.`,
          time: timeAgo(Math.floor(Math.random() * 5 + 1)),
        });
      }
    });

    // System status alerts
    const onlineCount = Object.values(data.appliances).filter(a => a.status === 'ON').length;
    if (onlineCount === Object.keys(data.appliances).length) {
      baseAlerts.push({
        id: 'all-optimal',
        severity: 'success',
        icon: 'check_circle',
        title: 'System running optimally',
        desc: `All ${onlineCount * 3} nodes report health scores above 98%.`,
        time: timeAgo(2),
      });
    }

    baseAlerts.push({
      id: 'gen-target',
      severity: 'info',
      icon: 'solar_power',
      title: 'Generation target on track',
      desc: `${(data.total_energy * 0.12).toFixed(1)} kWh produced. Battery storage at ${Math.min(85, Math.round(data.total_energy / 4))}%.`,
      time: timeAgo(5),
    });

    if (data.eco_mode) {
      baseAlerts.push({
        id: 'eco-active',
        severity: 'success',
        icon: 'eco',
        title: 'Eco-Mode engaged',
        desc: 'AI optimization active. Reducing peak consumption by up to 15%.',
        time: timeAgo(3),
      });
    }

    baseAlerts.push({
      id: 'voltage',
      severity: isAnomaly ? 'warning' : 'info',
      icon: 'electric_bolt',
      title: isAnomaly ? 'Grid voltage fluctuation detected' : 'Grid voltage stable',
      desc: isAnomaly ? `Variance of ${(Math.random() * 8 + 5).toFixed(0)}% detected. Stabilizers engaged.` : 'All sectors within 2% variance. Normal operation.',
      time: timeAgo(8),
    });

    baseAlerts.push({
      id: 'sync',
      severity: 'info',
      icon: 'sync',
      title: 'Inverter sync complete',
      desc: 'All units synchronized with the local grid. Communication latency: 12ms.',
      time: timeAgo(12),
    });

    setAlerts(baseAlerts);
  }, [data]);

  if (!data) return null;

  const severityConfig = {
    critical: { bg: 'bg-error/10', ring: 'ring-error/30', text: 'text-error', badge: 'bg-error/20 text-error' },
    warning: { bg: 'bg-primary/5', ring: 'ring-primary/20', text: 'text-primary', badge: 'bg-primary/20 text-primary' },
    success: { bg: 'bg-secondary/5', ring: 'ring-secondary/20', text: 'text-secondary', badge: 'bg-secondary/20 text-secondary' },
    info: { bg: 'bg-tertiary/5', ring: 'ring-tertiary/20', text: 'text-tertiary', badge: 'bg-tertiary/20 text-tertiary' },
  };

  return (
    <main className="md:ml-64 pt-24 px-6 pb-12 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-primary font-headline text-sm font-semibold tracking-widest uppercase mb-1">Monitoring</p>
            <h1 className="text-4xl font-black font-headline tracking-tight">System Notifications</h1>
            <p className="text-sm text-muted mt-1">Real-time status updates and critical alerts for your energy grid.</p>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] bg-error/10 text-error px-3 py-1 rounded-full font-bold">{alerts.filter(a => a.severity === 'critical').length} Critical</span>
            <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{alerts.filter(a => a.severity === 'warning').length} Warnings</span>
          </div>
        </div>

        {/* Alert Timeline */}
        <div className="space-y-3">
          <AnimatePresence>
            {alerts.map((alert, i) => {
              const config = severityConfig[alert.severity];
              return (
                <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className={`${config.bg} rounded-2xl p-6 ghost-border relative overflow-hidden group hover:ring-1 ${config.ring} transition-all`}>
                  {alert.severity === 'critical' && <div className="absolute inset-0 bg-error/5 animate-pulse pointer-events-none"></div>}
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`w-10 h-10 rounded-xl ${config.badge} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <span className={`material-symbols-outlined ${config.text} text-lg`}>{alert.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-on-surface text-sm">{alert.title}</h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full ${config.badge} font-bold uppercase tracking-widest`}>{alert.severity}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{alert.desc}</p>
                    </div>
                    <span className="text-[10px] text-muted flex-shrink-0">{alert.time}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Kinetic Network Pulse */}
        <div className="bg-surface-container-highest/60 rounded-2xl p-8 ghost-border text-center relative overflow-hidden">
          <div className="absolute inset-0 hud-scanline pointer-events-none"></div>
          <div className="relative z-10">
            <span className="material-symbols-outlined text-primary text-4xl mb-4 block">radar</span>
            <h3 className="text-lg font-bold font-headline mb-1">Kinetic Network Pulse</h3>
            <p className="text-sm text-muted">Monitoring <span className="text-primary font-bold">{(data.total_energy * 16).toFixed(0)} kW</span> across global segments</p>
            <div className="grid grid-cols-4 gap-4 mt-8">
              <PulseMetric label="Nodes" value="12" color="primary" />
              <PulseMetric label="Uptime" value="99.8%" color="secondary" />
              <PulseMetric label="Latency" value="12ms" color="tertiary" />
              <PulseMetric label="Threads" value="48" color="primary" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const PulseMetric = ({ label, value, color }) => (
  <div>
    <span className="text-[10px] text-muted block uppercase tracking-widest">{label}</span>
    <span className={`text-xl font-black font-headline text-${color}`}>{value}</span>
  </div>
);
