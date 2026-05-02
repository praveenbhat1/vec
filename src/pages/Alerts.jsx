import React, { useState, useEffect, useMemo, Component } from 'react';
import { useDashboard } from '../context';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { 
    AlertTriangle, Flame, Droplets, Activity,
    Clock, MapPin, ShieldAlert, ChevronRight,
    Search, Filter, Calendar, Zap, Bell,
    CheckCircle2, Truck, Info, Navigation,
    Database, Globe, HeartPulse, Send, Satellite, Shield, X, Radio,
    Siren, MessageSquare, Power, UserCheck, Play, ArrowRight,
    CornerRightDown, History, FileText, Target
} from 'lucide-react';

// ── ERROR BOUNDARY ──
class LocalErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-full bg-[#08080A] flex items-center justify-center">
                    <div className="text-red-500 font-mono text-[9px] uppercase tracking-[0.5em] animate-pulse">
                        COMMAND_ERROR // SYSTEM RECOVERY INITIATED
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// ── HELPER: LIVE TIMER ──
function LiveTimer({ startTime }) {
    const [elapsed, setElapsed] = useState('00:00:00');

    useEffect(() => {
        if (!startTime) return;
        const start = new Date(startTime).getTime();
        
        const update = () => {
            const now = Date.now();
            const diff = Math.max(0, now - start);
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            setElapsed(`${h}:${m}:${s}`);
        };

        const interval = setInterval(update, 1000);
        update();
        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <div className="flex flex-col">
            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">Time Elapsed</span>
            <span className="text-xl font-mono font-black text-[#00FFCC] tracking-tighter">{elapsed}</span>
        </div>
    );
}

// ── CUSTOM COMPONENTS ──
function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-[#14171F] border border-white/5 p-5 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 blur-[40px] opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity" 
                 style={{ backgroundColor: color }} />
            <div className="flex justify-between items-start mb-6">
                <div className="p-2 bg-white/5 border border-white/5 text-white/40 group-hover:text-white transition-all">
                    <Icon size={16} />
                </div>
            </div>
            <div>
                <span className="block text-[8px] font-mono text-white/30 uppercase tracking-[0.3em] mb-1">{label}</span>
                <span className="text-2xl font-outfit font-black text-white tracking-tighter leading-none">{value}</span>
            </div>
        </div>
    );
}

function SectionLabel({ text, icon: Icon }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="p-1.5 bg-white/5 border border-white/5 text-red-500">
                {Icon && <Icon size={12} />}
            </div>
            <span className="font-mono text-[9px] font-black tracking-[0.4em] text-white/20 uppercase">{text}</span>
        </div>
    );
}

function StatusFlow({ currentStatus }) {
    const steps = ['REPORTED', 'ACTIVE', 'CONTAINED', 'RESOLVED'];
    const currentIndex = steps.indexOf(currentStatus);
    
    return (
        <div className="w-full flex items-center gap-2 mb-8">
            {steps.map((step, i) => (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1">
                        <div className={`h-1.5 w-full mb-2 transition-all duration-500 ${i <= currentIndex ? 'bg-[#00FFCC] shadow-[0_0_10px_#00FFCC]' : 'bg-white/5'}`} />
                        <span className={`text-[8px] font-mono font-black tracking-widest ${i <= currentIndex ? 'text-white' : 'text-white/10'}`}>{step}</span>
                    </div>
                    {i < steps.length - 1 && <div className="w-4 h-[1px] bg-white/5 mt-[-10px]" />}
                </React.Fragment>
            ))}
        </div>
    );
}

function AlertsContent() {
    const { 
        isSidebarOpen, addToast, incidents: contextIncidents, addAlert, updateStatus, 
        deleteIncidentAction, hasPermission, PERMISSIONS, actions,
        autoResponseMode, setAutoResponseMode, setSelectedIncidentId
    } = useDashboard();
    
    const [filterType, setFilterType] = useState('All');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [selectedAlert, setSelectedAlert] = useState(null);

    // Filter incidents and sort by priority
    const alerts = useMemo(() => {
        const sorted = [...(contextIncidents || [])].sort((a, b) => {
            const priority = { critical: 3, high: 2, medium: 1, low: 0 };
            const aSev = (a?.severity || 'low').toLowerCase();
            const bSev = (b?.severity || 'low').toLowerCase();
            return (priority[bSev] || 0) - (priority[aSev] || 0);
        });
        
        return sorted.map(a => {
            const typeMap = { fire: Flame, flood: Droplets, medical: HeartPulse, accident: AlertTriangle, wildfire: Flame, earthquake: Activity, cyclone: Activity, collapse: AlertTriangle, chemical: Activity, other: AlertTriangle };
            const colorMap = { high: '#ef4444', critical: '#ef4444', medium: '#f59e0b', low: '#3b82f6' };
            return {
                ...a,
                Icon: typeMap[a.type?.toLowerCase()] || AlertTriangle,
                color: colorMap[a.severity?.toLowerCase()] || '#3b82f6',
                displayStatus: a.status || 'REPORTED'
            };
        });
    }, [contextIncidents]);

    // System logs for current selected alert
    const incidentLogs = useMemo(() => {
        if (!selectedAlert) return [];
        return (actions || [])
            .filter(l => l.details.includes(selectedAlert.id))
            .slice(0, 10);
    }, [actions, selectedAlert]);

    // Auto-select first alert
    useEffect(() => {
        if (alerts.length > 0 && !selectedAlert) {
            setSelectedAlert(alerts[0]);
        }
    }, [alerts, selectedAlert]);

    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleAction = async (actionType) => {
        if (!selectedAlert) return;
        addToast(`COMMAND_SENT: ${actionType}`, 'success');
        
        // Advance status based on action
        if (selectedAlert.displayStatus === 'REPORTED') {
            await updateStatus(selectedAlert.id, 'ACTIVE');
        } else if (selectedAlert.displayStatus === 'ACTIVE') {
            await updateStatus(selectedAlert.id, 'CONTAINED');
        } else if (selectedAlert.displayStatus === 'CONTAINED') {
            await updateStatus(selectedAlert.id, 'RESOLVED');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("CONFIRM_TERMINATION: Are you sure you want to delete this tactical record?")) {
            await deleteIncidentAction(id);
            addToast('RECORD_TERMINATED', 'success');
            setSelectedAlert(null);
        }
    };

    const zoomToIncident = (alert) => {
        setSelectedAlert(alert);
        setSelectedIncidentId(alert.id);
        addToast(`ZOOMING_TO_COORDINATES: ${alert.latitude}, ${alert.longitude}`, 'info');
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#08080A] text-[#E5E5E7]">
            
            {/* ── BACKGROUND ── */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div 
                  className="absolute w-[800px] h-[800px] rounded-full blur-[200px] opacity-[0.04] bg-red-600 transition-transform duration-1000 ease-out"
                  style={{ transform: `translate(${mousePos.x - 400}px, ${mousePos.y - 400}px)` }}
                />
            </div>

            <Sidebar />
            <TopNavbar />

            <main
                className={`flex-1 overflow-hidden flex flex-col transition-all duration-300 relative z-10 ${isSidebarOpen ? 'ml-sidebar-open' : 'ml-sidebar-closed'}`}
                style={{ marginTop: 80, height: 'calc(100vh - 80px)' }}
            >
                {/* ── COMMAND HEADER ── */}
                <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-[#0A0C11]">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                                <span className="text-[10px] font-mono font-black text-red-500 uppercase tracking-widest">Live Operations Command</span>
                            </div>
                            <h1 className="text-3xl font-outfit font-black tracking-tighter uppercase text-white">Emergency Control System</h1>
                        </div>
                        
                        <div className="h-10 w-[1px] bg-white/5 mx-4" />
                        
                        <div className="flex items-center gap-10">
                            <StatCard label="Active" value={alerts.filter(a => a.displayStatus !== 'RESOLVED').length} icon={Bell} color="#ef4444" />
                            <StatCard label="Critical" value={alerts.filter(a => a.severity?.toLowerCase() === 'critical').length} icon={ShieldAlert} color="#ef4444" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end gap-2">
                           <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Auto Response Mode</span>
                           <button 
                                onClick={() => setAutoResponseMode(!autoResponseMode)}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${autoResponseMode ? 'bg-[#00FFCC]' : 'bg-white/10'}`}
                           >
                               <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${autoResponseMode ? 'left-8' : 'left-1'}`} />
                           </button>
                        </div>
                        <button className="px-8 py-4 bg-red-600 text-white font-mono text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                            SEND GLOBAL ALERT
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    
                    {/* ── LEFT: INCIDENT STREAM ── */}
                    <div className="w-[450px] border-r border-white/5 bg-[#08080A]/80 flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <SectionLabel text="MISSION_FEED" icon={Satellite} />
                            <div className="flex gap-2">
                                {['All', 'Fire', 'Medical'].map(f => (
                                    <button key={f} onClick={() => setFilterType(f)} className={`px-3 py-1 font-mono text-[9px] ${filterType === f ? 'text-white' : 'text-white/20'}`}>[{f}]</button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {alerts.map((alert) => (
                                <div 
                                    key={alert.id}
                                    onClick={() => zoomToIncident(alert)}
                                    className={`p-6 border-b border-white/5 cursor-pointer transition-all relative group ${selectedAlert?.id === alert.id ? 'bg-[#14171F] border-l-4 border-l-red-600' : 'hover:bg-white/[0.02]'}`}
                                >
                                    <div className="flex items-start gap-5">
                                        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border border-white/5 bg-black ${selectedAlert?.id === alert.id ? 'text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'text-white/20'}`}>
                                            <alert.Icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[9px] font-mono font-black uppercase tracking-widest ${alert.severity?.toLowerCase() === 'critical' ? 'text-red-500' : 'text-white/20'}`}>{alert.severity}</span>
                                                <span className="text-[8px] font-mono text-white/10 uppercase font-bold">{new Date(alert.created_at).toLocaleTimeString()}</span>
                                            </div>
                                            <h3 className="text-white font-outfit font-black text-lg uppercase tracking-tight truncate leading-none mb-2">{alert.type} REPORTED</h3>
                                            <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase truncate">
                                                <MapPin size={10} />
                                                {alert.location}
                                            </div>
                                        </div>
                                    </div>
                                    {alert.displayStatus === 'RESOLVED' && <div className="absolute top-2 right-2"><CheckCircle2 size={12} className="text-emerald-500" /></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: TACTICAL COMMAND ── */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#08080A]">
                        {selectedAlert ? (
                            <div className="p-12 space-y-12 max-w-5xl mx-auto">
                                
                                {/* Top Detail */}
                                <div className="flex items-end justify-between border-b border-white/5 pb-10">
                                    <div className="flex items-center gap-8">
                                        <div className="w-24 h-24 bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                                            <selectedAlert.Icon size={48} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-mono font-black text-red-500/60 uppercase tracking-[0.5em]">TICKET_ID: {selectedAlert.id}</span>
                                            <h2 className="text-5xl font-outfit font-black text-white uppercase tracking-tighter leading-none">{selectedAlert.type} IN PROGRESS</h2>
                                            <div className="flex items-center gap-6 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-[#00FFCC]" />
                                                    <span className="text-xs font-mono text-white/60 uppercase tracking-widest">{selectedAlert.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Navigation size={14} className="text-blue-500" />
                                                    <span className="text-xs font-mono text-white/60 uppercase tracking-widest">{selectedAlert.latitude}, {selectedAlert.longitude}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <LiveTimer startTime={selectedAlert.created_at} />
                                </div>

                                <StatusFlow currentStatus={selectedAlert.displayStatus} />

                                <div className="grid grid-cols-12 gap-10">
                                    {/* Command Panels */}
                                    <div className="col-span-8 space-y-10">
                                        
                                        {/* Action Panel */}
                                        <div className="space-y-6">
                                            <SectionLabel text="DISPATCH_COMMANDS" icon={Radio} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <button onClick={() => handleAction('DISPATCH_AMBULANCE')} className="p-6 bg-white/[0.02] border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 group transition-all text-left">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <HeartPulse className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                                                        <ArrowRight size={14} className="text-white/10 group-hover:text-blue-500" />
                                                    </div>
                                                    <span className="block text-xs font-mono font-black text-white uppercase tracking-widest">Dispatch Ambulance</span>
                                                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">ETA: 4.2 MINS</span>
                                                </button>
                                                <button onClick={() => handleAction('DISPATCH_FIRE_UNIT')} className="p-6 bg-white/[0.02] border border-white/5 hover:border-red-500/40 hover:bg-red-500/5 group transition-all text-left">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Flame className="text-red-500 group-hover:scale-110 transition-transform" size={24} />
                                                        <ArrowRight size={14} className="text-white/10 group-hover:text-red-500" />
                                                    </div>
                                                    <span className="block text-xs font-mono font-black text-white uppercase tracking-widest">Send Fire Unit</span>
                                                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">ETA: 6.8 MINS</span>
                                                </button>
                                                <button onClick={() => handleAction('NOTIFY_POLICE')} className="p-6 bg-white/[0.02] border border-white/5 hover:border-purple-500/40 hover:bg-purple-500/5 group transition-all text-left">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Siren className="text-purple-500 group-hover:scale-110 transition-transform" size={24} />
                                                        <ArrowRight size={14} className="text-white/10 group-hover:text-purple-500" />
                                                    </div>
                                                    <span className="block text-xs font-mono font-black text-white uppercase tracking-widest">Notify Police</span>
                                                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">SECURE_CHANNEL: AX-12</span>
                                                </button>
                                                <button onClick={() => handleAction('BROADCAST_ALERT')} className="p-6 bg-white/[0.02] border border-white/5 hover:border-[#00FFCC]/40 hover:bg-[#00FFCC]/5 group transition-all text-left">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Radio className="text-[#00FFCC] group-hover:scale-110 transition-transform" size={24} />
                                                        <ArrowRight size={14} className="text-white/10 group-hover:text-[#00FFCC]" />
                                                    </div>
                                                    <span className="block text-xs font-mono font-black text-white uppercase tracking-widest">Broadcast Alert</span>
                                                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">RANGE: 5KM RADIUS</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-6">
                                            <SectionLabel text="MISSION_DETAILS" icon={FileText} />
                                            <div className="p-8 bg-white/[0.02] border-l-2 border-red-600/40 font-outfit text-xl text-white/80 leading-relaxed italic">
                                                "{selectedAlert.description || 'No detailed description provided for this uplink event.'}"
                                            </div>
                                        </div>
                                    </div>

                                    {/* Side Info */}
                                    <div className="col-span-4 space-y-10">
                                        <div className="space-y-6">
                                            <SectionLabel text="SYSTEM_LOG" icon={History} />
                                            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                                                {incidentLogs.length > 0 ? incidentLogs.map((log, i) => (
                                                    <div key={i} className="flex gap-4 p-4 bg-white/[0.02] border border-white/5">
                                                        <div className="w-1 h-full bg-red-600/20" />
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[8px] font-mono text-white/20 uppercase">{new Date(log.created_at).toLocaleTimeString()}</span>
                                                            <span className="text-[10px] font-mono text-white/60 leading-tight">{log.details.split(':').pop()}</span>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="text-[10px] font-mono text-white/10 uppercase tracking-widest text-center py-10">Waiting for events...</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <SectionLabel text="TACTICAL_LOCATION" icon={Target} />
                                            <div className="aspect-square bg-white/[0.02] border border-white/5 relative flex items-center justify-center group overflow-hidden">
                                                <Globe size={100} className="text-white/5 group-hover:scale-110 transition-transform duration-1000" />
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1),transparent)] animate-pulse" />
                                                <div className="absolute flex flex-col items-center">
                                                    <div className="w-10 h-10 border border-red-500/40 rounded-full flex items-center justify-center mb-4">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444] animate-ping" />
                                                    </div>
                                                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.3em] font-black">LAT: {selectedAlert.latitude}</span>
                                                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.3em] font-black">LNG: {selectedAlert.longitude}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Meta */}
                                <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex gap-8">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">Reporter</span>
                                            <span className="text-xs font-mono font-black text-white uppercase">{selectedAlert.reporter_name || 'SYSTEM_AI'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">Source Port</span>
                                            <span className="text-xs font-mono font-black text-white uppercase">VOX_SYNC_7</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(selectedAlert.id)}
                                        className="px-6 py-3 bg-red-900/20 border border-red-500/20 text-red-500 font-mono text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        TERMINATE INCIDENT
                                    </button>
                                </div>

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center grayscale opacity-10 p-20 gap-8">
                                <Satellite size={120} strokeWidth={0.5} className="animate-pulse" />
                                <span className="font-mono text-sm tracking-[1em] uppercase">Scanning Uplink...</span>
                            </div>
                        )}
                    </div>

                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); }
            `}} />
        </div>
    );
}

export default function Alerts() {
    return (
        <LocalErrorBoundary>
            <AlertsContent />
        </LocalErrorBoundary>
    );
}
