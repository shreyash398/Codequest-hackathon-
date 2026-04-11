import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend);

export const AnalyticsDeep = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    const f = async () => { try { setData(await (await fetch('http://localhost:5000/api/status')).json()); } catch(e) {} };
    f(); const i = setInterval(f, 3000); return () => clearInterval(i);
  }, []);
  if (!data) return null;

  const history = data.history || {};
  const labels = (history.timestamps || []).map(t => t ? t.split(' ')[1]?.substring(0,5) : '');

  const trendData = {
    labels,
    datasets: [
      { label: 'Solar Gen', data: history.energy || [], borderColor: '#3fff8b', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 2 },
      { label: 'House Demand', data: (history.energy || []).map(v => v * 0.65), borderColor: '#ffa84f', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 2 },
    ],
  };

  const distData = {
    labels: Object.keys(data.appliances),
    datasets: [{ data: Object.values(data.appliances).map(a => Math.round(a.current)), backgroundColor: ['#ffa84f', '#3fff8b', '#44a5ff', '#ff716c'], borderWidth: 0 }],
  };

  const chartOpts = { responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
    plugins: { legend: { display: true, position: 'top', labels: { color: 'rgba(255,255,255,0.5)', font: { size: 10 }, boxWidth: 10 } }, tooltip: { backgroundColor: 'rgba(0,0,0,0.9)', cornerRadius: 8 } },
    scales: { x: { ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9 }, maxTicksLimit: 8 }, grid: { display: false } }, y: { ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } } },
  };

  return (
    <main className="md:ml-64 pt-24 px-6 pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <p className="text-tertiary font-headline text-sm font-semibold tracking-widest uppercase mb-1">Deep Analytics</p>
          <h1 className="text-4xl font-black font-headline tracking-tight">Advanced Insights</h1>
        </div>

        {/* Performance Trends */}
        <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border">
          <h3 className="text-lg font-bold font-headline mb-1">Performance Trends</h3>
          <p className="text-xs text-muted mb-4">Solar generation vs House demand</p>
          <div className="h-64"><Line data={trendData} options={chartOpts} /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Energy Distribution */}
          <div className="lg:col-span-4 bg-surface-container-highest/60 rounded-2xl p-6 ghost-border">
            <h3 className="text-lg font-bold font-headline mb-4">Energy Distribution</h3>
            <div className="h-52"><Doughnut data={distData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.5)', font: { size: 10 }, boxWidth: 8 } } } }} /></div>
          </div>

          {/* Efficiency Analysis */}
          <div className="lg:col-span-4 bg-surface-container-highest/60 rounded-2xl p-6 ghost-border">
            <h3 className="text-lg font-bold font-headline mb-6">Efficiency Analysis</h3>
            <div className="space-y-6">
              <BigMetric label="Peak Yield" value="8.4" unit="kWh" color="primary" />
              <BigMetric label="Avg Efficiency" value="91.4" unit="%" color="secondary" />
            </div>
          </div>

          {/* Health Score */}
          <div className="lg:col-span-4 bg-surface-container-highest/60 rounded-2xl p-6 ghost-border flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold font-headline mb-4 text-muted">Health Score</h3>
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <motion.path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3fff8b" strokeWidth="3" strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: "96, 100" }} transition={{ duration: 1.5 }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-black font-headline text-secondary">96</span></div>
            </div>
          </div>
        </div>

        {/* Financial + Solar + Battery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatSection title="Financial Impact" icon="account_balance" items={[
            { label: 'Total Savings', value: `₹${(data.total_energy * 2.1).toFixed(0)}`, color: 'primary' },
            { label: 'ROI', value: '14.2%', color: 'secondary' },
            { label: 'Payback Period', value: '5.2 YRS', color: 'tertiary' },
          ]} />
          <StatSection title="Solar Performance" icon="solar_power" items={[
            { label: 'Total Generated', value: `${(data.total_energy * 0.016).toFixed(1)} MWh`, color: 'primary' },
            { label: 'Grid Exported', value: `${(data.total_energy * 0.003).toFixed(1)} MWh`, color: 'secondary' },
            { label: 'Peak Power', value: `${(data.total_energy * 0.025).toFixed(1)} kW`, color: 'tertiary' },
          ]} />
          <StatSection title="Battery Analytics" icon="battery_charging_full" items={[
            { label: 'Cycles', value: '428', color: 'primary' },
            { label: 'Avg Depth', value: '65%', color: 'secondary' },
            { label: 'Health Index', value: '98%', color: 'tertiary' },
          ]} />
        </div>
      </div>
    </main>
  );
};

const BigMetric = ({ label, value, unit, color }) => (
  <div className="text-center">
    <span className="text-[10px] text-muted uppercase tracking-widest block mb-1">{label}</span>
    <span className={`text-4xl font-black font-headline text-${color}`}>{value}</span>
    <span className="text-sm text-muted ml-1">{unit}</span>
  </div>
);

const StatSection = ({ title, icon, items }) => (
  <div className="bg-surface-container-highest/60 rounded-2xl p-6 ghost-border">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center"><span className="material-symbols-outlined text-primary text-sm">{icon}</span></div>
      <h3 className="text-lg font-bold font-headline">{title}</h3>
    </div>
    <div className="space-y-5">
      {items.map((item, i) => (
        <div key={i} className="flex justify-between items-center">
          <span className="text-xs text-on-surface-variant">{item.label}</span>
          <span className={`text-lg font-black font-headline text-${item.color}`}>{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);
