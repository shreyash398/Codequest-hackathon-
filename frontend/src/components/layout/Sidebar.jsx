import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { id: 'dashboard', label: 'Energy Dashboard', icon: 'bolt', path: '/' },
  { id: 'analytics', label: 'Advanced Analytics', icon: 'analytics', path: '/analytics' },
  { id: 'control', label: 'Control Center', icon: 'settings_input_component', path: '/control' },
];



export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-full z-40 w-64 bg-[#030e22]/80 backdrop-blur-2xl hidden md:flex flex-col pt-24 ghost-border border-l-0 border-t-0 border-b-0">

      
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `
              px-5 py-3 flex items-center gap-3 font-body text-[13px] font-medium tracking-tight transition-all rounded-xl
              ${isActive 
                ? 'bg-primary/10 text-primary glow-primary' 
                : 'text-muted hover:text-on-surface hover:bg-white/5'}
            `}
          >
            <span className="material-symbols-outlined text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 mb-8">
        <h4 className="text-[10px] text-muted font-bold tracking-[0.15em] uppercase mb-3">Quick Stats</h4>
        <div className="space-y-2">
          <div className="bg-surface-container/40 hover:bg-surface-container transition-colors rounded-xl p-3 flex items-center justify-between ghost-border cursor-default">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ffa84f] text-[16px]">wb_sunny</span>
              <span className="text-[13px] text-muted-dark font-medium font-body transition-colors hover:text-muted">Solar</span>
            </div>
            <span className="text-[13px] font-bold text-on-surface">2.45 kW</span>
          </div>
          <div className="bg-surface-container/40 hover:bg-surface-container transition-colors rounded-xl p-3 flex items-center justify-between ghost-border cursor-default">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#3fff8b] text-[16px]">battery_horiz_050</span>
              <span className="text-[13px] text-muted-dark font-medium font-body transition-colors hover:text-muted">Battery</span>
            </div>
            <span className="text-[13px] font-bold text-on-surface">68 %</span>
          </div>
          <div className="bg-surface-container/40 hover:bg-surface-container transition-colors rounded-xl p-3 flex items-center justify-between ghost-border cursor-default">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#44a5ff] text-[16px]">bolt</span>
              <span className="text-[13px] text-muted-dark font-medium font-body transition-colors hover:text-muted">Grid</span>
            </div>
            <span className="text-[13px] font-bold text-on-surface">0.75 kW</span>
          </div>
          <div className="bg-surface-container/40 hover:bg-surface-container transition-colors rounded-xl p-3 flex items-center justify-between ghost-border cursor-default">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#a84fff] text-[16px]">show_chart</span>
              <span className="text-[13px] text-muted-dark font-medium font-body transition-colors hover:text-muted">Load</span>
            </div>
            <span className="text-[13px] font-bold text-on-surface">3.20 kW</span>
          </div>
        </div>
      </div>

      <div className="p-6 pt-2">
        <div className="flex items-center gap-3 px-2 pt-4 border-t border-white/5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-[#231000] font-bold text-[10px] font-headline">KE</div>
          <div>
            <span className="text-xs font-bold text-on-surface block">System Admin</span>
            <span className="text-[10px] text-secondary flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>Network Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
