import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { AnalyticsDeep } from './pages/AnalyticsDeep';
import { ControlCenter } from './pages/ControlCenter';

function App() {
  return (
    <div className="bg-background min-h-screen text-on-background selection:bg-primary/30 font-body">
      <Header />
      <Sidebar />
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/analytics/deep" element={<AnalyticsDeep />} />
        <Route path="/control" element={<ControlCenter />} />
      </Routes>

      {/* Background Decoration */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full pointer-events-none"></div>
    </div>
  );
}

export default App;
