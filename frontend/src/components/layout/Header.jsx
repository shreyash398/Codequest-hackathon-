import React from 'react';
import { NavLink } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#030e22]/60 backdrop-blur-xl ghost-border border-l-0 border-r-0 border-t-0 flex justify-between items-center px-8 py-4">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-black tracking-tighter text-primary drop-shadow-[0_0_12px_rgba(255,168,79,0.5)] font-headline uppercase">
          KINETIC ETHER
        </h1>

      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:block relative">
          <input 
            type="text" 
            placeholder="QUERY SYSTEM..." 
            className="bg-white/5 ghost-border rounded-xl py-2 px-5 text-[10px] font-headline font-bold tracking-widest text-primary focus:ring-1 focus:ring-primary/50 w-56 placeholder:text-muted-dark transition-all focus:outline-none"
          />
        </div>
        <div className="flex gap-4 text-muted">
          <NavLink to="/alerts" className="hover:text-primary cursor-pointer transition-colors">
            <span className="material-symbols-outlined">notifications_active</span>
          </NavLink>
          <NavLink to="/settings" className="hover:text-primary cursor-pointer transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </NavLink>
        </div>
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-on-primary font-bold text-sm font-headline">
          KE
        </div>
      </div>
    </header>
  );
};
