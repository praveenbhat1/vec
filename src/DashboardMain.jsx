import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import WorkflowPanel from './components/panels/WorkflowPanel';
import LiveAlertsPanel from './components/panels/LiveAlertsPanel';
import MapPanel from './components/panels/MapPanel';
import CommunicationPanel from './components/panels/CommunicationPanel';
import ResourceTrackingPanel from './components/panels/ResourceTrackingPanel';
import OrganizationPanel from './components/panels/OrganizationPanel';
import IncidentActionPanel from './components/panels/IncidentActionPanel';
import DecisionPanel from './components/panels/DecisionPanel';
import { useDashboard } from './context';
import { Shield, ShieldAlert, Zap, Globe, Cpu, Radio, Terminal, Target, Square, Lock, Activity, Radar, Database, BarChart3, ListFilter, AlertTriangle, Clock } from 'lucide-react';
import { SZ } from './constants';

import { memo } from 'react';

const SystemGridOverlay = memo(function SystemGridOverlay() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let frame;
    const handleMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:40px_40px]" />
      <div 
        className="absolute w-[800px] h-[800px] bg-[#00FFCC]/[0.02] rounded-full blur-[120px] transition-transform duration-[1.5s] ease-out will-change-transform"
        style={{ transform: `translate3d(${mousePos.x - 400}px, ${mousePos.y - 400}px, 0)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#08080A]/20 to-[#08080A]" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00FFCC]/10 to-transparent animate-scan-y" />
    </div>
  );
});

function StatCard({ label, value, trend, icon: Icon, color, isCritical }) {
  return (
    <div className="bg-[#14171F] border border-white/5 p-6 flex flex-col gap-3 group hover:border-white/10 transition-all">
       <div className="flex justify-between items-start">
          <div className="p-2 bg-white/5 border border-white/5 text-white/20 group-hover:text-white transition-colors">
             <Icon size={16} />
          </div>
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border ${trend > 0 ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
       </div>
       <div className="mt-2">
          <span className="block text-[8px] font-mono text-white/30 uppercase tracking-[0.3em] mb-1">{label}</span>
          <span className="text-3xl font-outfit font-black text-white tracking-tighter">{value}</span>
       </div>
    </div>
  );
}

function MissionClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-sm font-outfit font-black text-[#00FFCC] animate-pulse">
      {time.toLocaleTimeString('en-GB', { hour12: false })}
    </span>
  );
}

function PanelContainer({ label, children, accent, status }) {
  return (
    <div className="flex flex-col h-full bg-[#0F1117] border border-white/5 relative group/panel overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
         <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="text-[10px] font-mono font-black text-white/40 tracking-[0.3em] uppercase">{label}</span>
         </div>
         {status && (
           <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-white/5" />
              <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{status}</span>
           </div>
         )}
      </div>
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
         <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-white/10" />
      </div>
    </div>
  );
}

export default function DashboardMain() {
  const { toasts, isSidebarOpen, closeSidebar, stats } = useDashboard();
  const navigate = useNavigate();

  useEffect(() => {
    closeSidebar();
  }, [closeSidebar]);

  return (
    <div className="flex h-screen bg-[#08080A] font-inter selection:bg-[#00FFCC] selection:text-black overflow-hidden relative">
      <SystemGridOverlay />
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopNavbar />
        
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar"
        >
          <div className="max-w-[1920px] mx-auto fluid-p">
          
          {/* Functional Dashboard Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8">
             <div className="space-y-2">
                  <div className="flex items-center gap-3">
                   <Shield size={14} className="text-[#00FFCC]" />
                   <span className="text-[10px] font-mono font-bold tracking-[0.4em] text-[#00FFCC] uppercase">OVERVIEW</span>
                </div>
                <h1 className="font-outfit text-4xl font-black tracking-tighter uppercase text-white">ADMIN DASHBOARD</h1>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-0">
                  <div className="px-6 py-2.5 bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                     <span className="text-[7px] font-mono text-white/40 uppercase">Mission Clock</span>
                     <MissionClock />
                  </div>
                  <button className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-mono text-[9px] font-black tracking-widest uppercase">
                     Export
                  </button>
                  <button onClick={() => navigate('/report')} className="px-6 py-2.5 bg-[#00FFCC] text-black hover:brightness-110 transition-all font-mono text-[9px] font-black tracking-widest uppercase shadow-[0_0_20px_rgba(0,255,204,0.2)]">
                     Report Incident
                  </button>
             </div>
          </div>

          {/* Quick Stats Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-fade-in">
             <StatCard label="Total Reports" value={stats.total ?? 0} trend={0} icon={AlertTriangle} color="#ef4444" />
             <StatCard label="Critical" value={stats.criticalIncidents ?? 0} trend={+12} icon={ShieldAlert} color="#ef4444" />
             <StatCard label="Tactical Load" value={`${Math.round(((stats.active || 0) / (stats.total || 1)) * 100)}%`} trend={+5} icon={Activity} color="#f97316" />
             <StatCard label="Resolved" value={stats.contained ?? 0} trend={0} icon={Radio} color="#a855f7" />
          </div>

          {/* ── Main Workspace Grid: TACTICAL 3-6-3 SPLIT ── */}
          <div className="grid grid-cols-12 gap-6">

            {/* Left Column: Live Monitoring (3) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col gap-6">
                <div className="h-[600px] animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <PanelContainer label="LIVE MONITORING" accent="#ef4444" status="SCANNING">
                    <LiveAlertsPanel />
                  </PanelContainer>
               </div>
               <div className="h-[350px] animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <PanelContainer label="COMMAND COMM" accent="#a855f7">
                    <CommunicationPanel />
                  </PanelContainer>
               </div>
            </div>

            {/* Middle Column: Geospatial Intelligence (6) */}
            <div className="col-span-12 md:col-span-12 lg:col-span-6 flex flex-col gap-6">
                <div className="h-[680px] animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <PanelContainer label="GEOSPATIAL INTELLIGENCE" accent="#3b82f6" status="LIVE_GRID">
                    <MapPanel />
                  </PanelContainer>
               </div>
               
               <div className="h-[270px] animate-slide-up" style={{ animationDelay: '0.5s' }}>
                  <PanelContainer label="RESPONSE WORKFLOW" accent="#00FFCC">
                     <WorkflowPanel />
                  </PanelContainer>
               </div>
            </div>

            {/* Right Column: AI & Risk Assessment (3) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col gap-6">
                <div className="h-[975px] animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <PanelContainer label="AI DECISION OVERRIDE" accent="#00FFCC" status="COGNITIVE">
                    <DecisionPanel />
                  </PanelContainer>
               </div>
            </div>

            {/* Bottom Row: Resource & Agency Management (Full Width) */}
             <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.7s' }}>
                <PanelContainer label="RESOURCE TRACKING" accent="#10b981">
                   <ResourceTrackingPanel />
                </PanelContainer>
                <PanelContainer label="AGENCY COORDINATION" accent="#3b82f6">
                   <OrganizationPanel />
                </PanelContainer>
                <PanelContainer label="TACTICAL ACTIONS" accent="#ef4444">
                   <IncidentActionPanel />
                </PanelContainer>
             </div>
          </div>

          {/* Footer Metadata */}
          <div className="mt-20 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 pt-10 pb-10">
              <div className="flex gap-10 text-[9px] font-mono text-white/10 uppercase tracking-[0.5em] font-black">
                 <span className="flex items-center gap-3"><Clock size={12} />NETWORK STATUS: 99.9%</span>
                 <span className="flex items-center gap-3"><Lock size={12} />SECURE CONNECTION</span>
              </div>
              <div className="text-[9px] font-mono text-white/5 uppercase tracking-[0.8em] font-black">
                 CRISISCHAIN // DISASTER RESPONSE // V5.0
              </div>
          </div>
        </div>
      </main>
      </div>

      {toasts && toasts.length > 0 && (
        <div className="fixed bottom-10 right-10 z-[200] flex flex-col gap-4 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="font-mono px-6 py-4 backdrop-blur-3xl border border-white/5 bg-black/80 text-[10px] font-black tracking-widest uppercase shadow-2xl animate-slide-in-right"
                 style={{ color: t.type === 'error' ? '#ef4444' : '#00FFCC' }}>
                {t.message}
            </div>
          ))}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-y {
          0% { transform: translateY(0); }
          50% { transform: translateY(100vh); }
          100% { transform: translateY(0); }
        }
        .animate-scan-y { animation: scan-y 8s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
      `}} />
    </div>
  );
}
