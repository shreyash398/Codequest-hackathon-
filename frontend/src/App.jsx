import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { AnalyticsDeep } from './pages/AnalyticsDeep';
import { ControlCenter } from './pages/ControlCenter';
import { AIChatPanel } from './components/AIChatPanel';

function App() {
  return (
    <div className="bg-background min-h-screen text-on-background selection:bg-primary/30 font-body">
      <Sidebar />
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/analytics/deep" element={<AnalyticsDeep />} />
        <Route path="/control" element={<ControlCenter />} />
      </Routes>

      {/* AI Chat Panel — accessible from every page */}
      <AIChatPanel />

      {/* Background Decoration */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full pointer-events-none"></div>
    </div>
  );
}

export default App;
