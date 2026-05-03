import React, { useState, useEffect, useMemo, Component } from 'react';
import { useDashboard } from '../context';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { 
    Package, MapPin, Database, Hospital,
    AlertCircle, CheckCircle2, ChevronRight, Pill,
    Truck, Navigation, Clock, Activity, Send, HeartPulse, Wrench, Shield, Globe, Zap,
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw, Layers,
    Target, AlertTriangle, Play, BarChart3, MoreHorizontal, UserCheck, Settings
} from 'lucide-react';
import { SZ } from '../constants';

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
                        LOGISTICS_FAULT // RECALIBRATING_SYTEM
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// ── HELPER COMPONENTS ──
function StockProgressBar({ available, total }) {
    const pct = Math.min(100, Math.max(0, (available / total) * 100));
    const colorClass = pct < 20 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : pct < 50 ? 'bg-amber-500' : 'bg-[#00FFCC] shadow-[0_0_10px_#00FFCC]';
    
    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between text-[8px] font-mono font-black tracking-widest uppercase text-white/40">
                <span>Current Stock</span>
                <span className={pct < 20 ? 'text-red-500' : 'text-white/60'}>{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${colorClass}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function HealthCard({ label, status, trend, icon: Icon, color }) {
    return (
        <div className="bg-[#14171F] border border-white/5 p-6 relative group overflow-hidden transition-all hover:border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" style={{ backgroundColor: color }} />
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-white/5 border border-white/5 text-white/40 group-hover:text-white transition-all">
                    <Icon size={20} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 font-mono text-[10px] font-black ${trend > 0 ? 'text-[#00FFCC]' : 'text-red-500'}`}>
                        {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="relative z-10">
                <span className="block text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] mb-2">{label}</span>
                <h3 className="text-3xl font-outfit font-black text-white uppercase tracking-tighter leading-none">{status}</h3>
            </div>
        </div>
    );
}

function AllocationEngine({ resources, incidents, onAllocate }) {
    // Mock logic for suggestions
    const suggestions = useMemo(() => {
        if (!incidents?.length || !resources?.length) return [];
        return incidents.slice(0, 3).map((inc, i) => {
            const res = resources[i % resources.length];
            return {
                id: inc.id,
                incident: inc.type?.toUpperCase() || 'UNKNOWN',
                location: inc.location,
                resource: res.name,
                resourceId: res.id,
                qty: 15,
                unit: res.unit
            };
        });
    }, [incidents, resources]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Layers size={14} className="text-[#00FFCC]" />
                <span className="font-mono text-[10px] font-black tracking-[0.4em] text-white/20 uppercase">Auto_Allocation_Engine</span>
            </div>
            <div className="space-y-4">
                {suggestions.map((s, i) => (
                    <div key={i} className="p-5 bg-white/[0.02] border border-white/5 hover:border-[#00FFCC]/20 transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-mono text-red-500 uppercase font-black">Urgent Need: {s.incident}</span>
                                <h4 className="text-sm font-outfit font-black text-white uppercase tracking-tight">{s.location}</h4>
                            </div>
                            <div className="px-2 py-1 bg-[#00FFCC]/10 border border-[#00FFCC]/20 text-[#00FFCC] font-mono text-[8px] font-black">AI_SUGGESTED</div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-mono text-white/20 uppercase">Requirement</span>
                                <span className="text-xs font-mono font-black text-white uppercase">{s.qty} {s.unit} {s.resource}</span>
                            </div>
                            <button 
                                onClick={() => onAllocate(s.resourceId, s.qty)}
                                className="px-4 py-2 bg-[#00FFCC] text-black font-mono text-[8px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                            >
                                ALLOCATE NOW
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ResourceContent() {
    const { 
        resources: contextResources, incidents, allocateResource, createResourceAction,
        isSidebarOpen, hasPermission, PERMISSIONS, addToast
    } = useDashboard();
    
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', total: '', unit: 'units', location: '', type: 'medical_kit' });

    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const resources = useMemo(() => {
        return (contextResources || []).map(r => {
            const available = r.available ?? r.total;
            const depletionRate = Math.floor(Math.random() * 5) + 1; // Mock rate units/hr
            const hoursLeft = Math.floor(available / depletionRate);
            return {
                ...r,
                available,
                usageRate: depletionRate,
                depletionTime: `${hoursLeft}H`,
                status: available / r.total < 0.2 ? 'CRITICAL' : available / r.total < 0.5 ? 'LIMITED' : 'STABLE'
            };
        });
    }, [contextResources]);

    const filteredResources = useMemo(() => {
        if (activeCategory === 'ALL') return resources;
        return resources.filter(r => r.category?.toUpperCase() === activeCategory);
    }, [resources, activeCategory]);

    const systemHealth = useMemo(() => {
        const criticalItems = resources.filter(r => r.status === 'CRITICAL');
        const limitedItems = resources.filter(r => r.status === 'LIMITED');
        
        if (criticalItems.length > 2) {
            return { 
                status: 'CRITICAL_LOAD', 
                color: '#ef4444', 
                message: 'Multiple severe shortages detected. Initiate emergency restock protocol for all Sector A and B hubs.',
                recommendation: 'AUTHORIZE_GLOBAL_REALLOCATION'
            };
        }
        if (limitedItems.length > 3 || criticalItems.length > 0) {
            return { 
                status: 'LIMITED_CAP', 
                color: '#f59e0b', 
                message: 'Logistics friction detected in medical supplies. Recommend cross-sector transfers.',
                recommendation: 'OPTIMIZE_DISTRIBUTION_CHANNELS'
            };
        }
        return { 
            status: 'OPTIMAL', 
            color: '#00FFCC', 
            message: 'All supply nodes operating within safe operational parameters.',
            recommendation: 'MAINTAIN_CURRENT_ROSTER'
        };
    }, [resources]);

    const handleAddStock = async (e) => {
        e.preventDefault();
        if (!hasPermission(PERMISSIONS.ADD_RESOURCE)) return addToast('Restricted: Admin Only', 'error');
        try {
            await createResourceAction({
                ...newItem,
                total: parseInt(newItem.total),
                category: 'supply'
            });
            setIsAddModalOpen(false);
            setNewItem({ name: '', total: '', unit: 'units', location: '', type: 'medical_kit' });
        } catch (err) { addToast('Provisioning failed', 'error'); }
    };

    return (
        <div className="flex h-screen bg-[#08080A] font-inter selection:bg-[#00FFCC] selection:text-black overflow-hidden relative">
            
            {/* ── BACKGROUND ── */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
                <div 
                  className="absolute w-[1200px] h-[1200px] rounded-full blur-[250px] opacity-[0.04] bg-blue-600 transition-transform duration-1000 ease-out"
                  style={{ transform: `translate(${mousePos.x - 600}px, ${mousePos.y - 600}px)` }}
                />
            </div>

            <Sidebar />
            
            <div className="flex-1 flex flex-col min-w-0 relative">
                <TopNavbar />

                <main
                    className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar"
                >
                <div className="p-12 max-w-[1600px] mx-auto space-y-12 pb-32">
                    
                    {/* ── HEADER ── */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <Database size={14} className="text-[#00FFCC]" />
                                <span className="text-[10px] font-mono font-black tracking-[0.5em] text-[#00FFCC] uppercase">Logistics_Command_Center</span>
                            </div>
                            <h1 className="font-outfit text-6xl font-black tracking-tighter uppercase text-white leading-none">
                                Resource Hub
                            </h1>
                            <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest max-w-md">
                                Intelligent resource allocation and stock auditing system for multi-sector crisis management.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-mono text-[10px] font-black uppercase tracking-widest">
                                Export Inventory
                            </button>
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-10 py-4 bg-[#00FFCC] text-black font-mono text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_30px_rgba(0,255,204,0.2)]"
                            >
                                NEW_STOCK_INTAKE
                            </button>
                        </div>
                    </div>

                    {/* ── HEALTH OVERVIEW ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-up">
                        <div className="md:col-span-1 lg:col-span-1 bg-[#14171F] border border-white/5 p-8 relative flex flex-col justify-between group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: systemHealth.color }} />
                                    <span className="font-mono text-[10px] font-black text-white/20 uppercase tracking-widest">Tactical Health</span>
                                </div>
                                <h3 className="text-4xl font-outfit font-black uppercase tracking-tighter leading-none" style={{ color: systemHealth.color }}>
                                    {systemHealth.status}
                                </h3>
                                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest leading-relaxed">
                                    {systemHealth.message}
                                </p>
                                <div className="pt-4 mt-2 border-t border-white/5">
                                    <span className="text-[8px] font-mono text-white/20 uppercase block mb-2">Recommendation</span>
                                    <span className="text-[9px] font-mono font-black text-white uppercase tracking-widest bg-white/5 px-2 py-1">{systemHealth.recommendation}</span>
                                </div>
                            </div>
                        </div>
                        <HealthCard label="Active Utilization" status={`${Math.round((resources.reduce((acc, r) => acc + (r.deployed || 0), 0) / resources.reduce((acc, r) => acc + (r.total || 1), 0)) * 100)}%`} trend={+12} icon={TrendingUp} color="#3b82f6" />
                        <HealthCard label="Pending Shortages" status={resources.filter(r => r.status === 'CRITICAL').length.toString()} trend={-5} icon={AlertTriangle} color="#ef4444" />
                        <HealthCard label="Fleet Deployment" status="84%" trend={+8} icon={Truck} color="#10b981" />
                    </div>

                    <div className="grid grid-cols-12 gap-10">
                        
                        {/* ── LEFT: INVENTORY GRID ── */}
                        <div className="col-span-12 lg:col-span-8 space-y-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                <div className="flex items-center gap-8">
                                    <SectionLabel text="STOCK_INVENTORY" icon={Package} />
                                    <div className="flex gap-4">
                                        {['ALL', 'SUPPLY', 'MEDICAL', 'FLEET'].map(cat => (
                                            <button 
                                                key={cat} 
                                                onClick={() => setActiveCategory(cat)}
                                                className={`font-mono text-[9px] font-black tracking-widest transition-all ${activeCategory === cat ? 'text-[#00FFCC]' : 'text-white/20 hover:text-white/40'}`}
                                            >
                                                [{cat}]
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-white/20 font-mono text-[9px]">
                                    <RefreshCw size={10} className="animate-spin-slow" />
                                    SYNCING_REALTIME
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredResources.map((res) => (
                                    <div key={res.id} className={`bg-[#14171F]/80 border p-8 hover:bg-[#14171F] transition-all group relative overflow-hidden ${res.status === 'CRITICAL' ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-white/5'}`}>
                                        
                                        {res.status === 'CRITICAL' && (
                                            <div className="absolute top-0 right-0 p-3 bg-red-600 text-white font-mono text-[8px] font-black tracking-tighter">SHORTAGE_ALARM</div>
                                        )}

                                        <div className="flex items-start justify-between mb-8">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 bg-white/5 border border-white/5 flex items-center justify-center transition-all ${res.status === 'CRITICAL' ? 'text-red-500' : 'text-[#00FFCC]'}`}>
                                                    {res.category?.toLowerCase() === 'medical' ? <HeartPulse size={24} /> : res.category?.toLowerCase() === 'fleet' ? <Truck size={24} /> : <Package size={24} />}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-mono font-black text-white/20 uppercase tracking-[0.3em]">{res.location}</span>
                                                    <h3 className="text-2xl font-outfit font-black text-white uppercase tracking-tight leading-none">{res.name}</h3>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs font-mono font-black text-white uppercase tracking-tighter">{res.available} {res.unit}</span>
                                                <span className="text-[8px] font-mono text-white/20 uppercase">Total: {res.total}</span>
                                            </div>
                                        </div>

                                        <StockProgressBar available={res.available} total={res.total} />

                                        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-mono text-white/20 uppercase">Usage Rate</span>
                                                <div className="flex items-center gap-2">
                                                    <TrendingDown size={12} className="text-red-500" />
                                                    <span className="text-[10px] font-mono font-black text-white uppercase">{res.usageRate} {res.unit}/HR</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-mono text-white/20 uppercase">Est. Depletion</span>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={12} className="text-amber-500" />
                                                    <span className="text-[10px] font-mono font-black text-white uppercase">{res.depletionTime} REMAINING</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                            <button 
                                                onClick={() => allocateResource(res.id, 10)}
                                                className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-mono text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                            >
                                                QUICK_ALLOCATE
                                            </button>
                                            {res.status === 'CRITICAL' && (
                                            <button 
                                                onClick={() => {
                                                    addToast(`RESTOCK_REQUEST_SENT: ${res.name}`, 'info');
                                                    createResourceAction({
                                                        name: res.name,
                                                        total: 50,
                                                        category: res.category,
                                                        location: res.location
                                                    });
                                                }}
                                                className="flex-1 py-3 bg-red-600 text-white font-mono text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                                            >
                                                REQUEST_RESTOCK
                                            </button>
                                        )}
                                    </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── RIGHT: INTELLIGENCE & LOGISTICS ── */}
                        <div className="col-span-12 lg:col-span-4 space-y-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            
                            <AllocationEngine 
                                resources={resources} 
                                incidents={incidents} 
                                onAllocate={allocateResource} 
                            />

                            <div className="space-y-6">
                                <SectionLabel text="LIVE_LOGISTICS_FEED" icon={Truck} />
                                <div className="bg-[#14171F]/80 border border-white/5 p-8 space-y-8">
                                    {[
                                        { id: 'TX-92', to: 'North Sector', status: 'En Route', progress: 65, eta: '4m' },
                                        { id: 'TX-44', to: 'West Hub', status: 'Loading', progress: 15, eta: '12m' },
                                        { id: 'AX-11', to: 'Critical Zone 1', status: 'En Route', progress: 88, eta: '1m' },
                                    ].map((fleet, i) => (
                                        <div key={i} className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Fleet_ID: {fleet.id}</span>
                                                    <h4 className="text-xs font-outfit font-black text-white uppercase tracking-widest">DEST: {fleet.to}</h4>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[9px] font-mono font-black text-[#00FFCC] uppercase">{fleet.status}</span>
                                                    <span className="text-[8px] font-mono text-white/20 uppercase">ETA: {fleet.eta}</span>
                                                </div>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 overflow-hidden">
                                                <div className="h-full bg-blue-500 animate-pulse transition-all duration-1000" style={{ width: `${fleet.progress}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <SectionLabel text="UTILIZATION_METRICS" icon={BarChart3} />
                                <div className="bg-[#14171F]/80 border border-white/5 p-8">
                                    <div className="flex items-end gap-2 h-40">
                                        {[40, 70, 45, 90, 65, 30, 85, 60, 95].map((h, i) => (
                                            <div key={i} className="flex-1 bg-white/5 relative group cursor-crosshair">
                                                <div className="absolute bottom-0 w-full bg-[#00FFCC]/20 group-hover:bg-[#00FFCC]/40 transition-all" style={{ height: `${h}%` }} />
                                                {i % 3 === 0 && <span className="absolute bottom-[-20px] left-0 text-[7px] font-mono text-white/10 uppercase tracking-tighter">0{i}:00</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-8 text-[9px] font-mono text-white/20 uppercase tracking-widest leading-relaxed">
                                        System-wide utilization peaked at 95% during the last 24H operational cycle.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            </div>

            {/* ── ADD STOCK MODAL ── */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl animate-fade-in">
                    <div className="bg-[#08080A] border border-white/10 w-full max-w-xl relative overflow-hidden shadow-[0_0_100px_rgba(0,255,204,0.1)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#00FFCC] shadow-[0_0_10px_#00FFCC]" />
                        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-[#00FFCC] font-black uppercase tracking-[0.5em]">Inventory Provisioning</span>
                                <h2 className="text-4xl font-outfit font-black text-white tracking-tighter uppercase leading-none mt-2">New Stock Intake</h2>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-white/40 hover:text-white transition-all"><X size={32} /></button>
                        </div>
                        <form onSubmit={handleAddStock} className="p-10 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] font-black ml-1">ITEM_NAME*</label>
                                <input required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-white/5 border border-white/5 focus:border-[#00FFCC]/40 px-6 py-4 font-mono text-xs text-white uppercase tracking-widest outline-none transition-all placeholder:text-white/5" placeholder="Example: Medical Kits..." />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] font-black ml-1">Quantity*</label>
                                    <input required type="number" value={newItem.total} onChange={e => setNewItem({...newItem, total: e.target.value})} className="w-full bg-white/5 border border-white/5 focus:border-[#00FFCC]/40 px-6 py-4 font-mono text-xs text-white uppercase tracking-widest outline-none transition-all" placeholder="0" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] font-black ml-1">Unit*</label>
                                    <select value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="w-full bg-[#0E1015] border border-white/5 focus:border-[#00FFCC]/40 px-6 py-4 font-mono text-xs text-white uppercase tracking-widest outline-none transition-all">
                                        <option value="units">Units</option>
                                        <option value="kg">KG</option>
                                        <option value="liters">Liters</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] font-black ml-1">Locality*</label>
                                <input required value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} className="w-full bg-white/5 border border-white/5 focus:border-[#00FFCC]/40 px-6 py-4 font-mono text-xs text-white uppercase tracking-widest outline-none transition-all" placeholder="Sector A..." />
                            </div>
                            <div className="pt-6 border-t border-white/5 flex justify-end gap-6">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-8 py-4 font-mono text-[10px] text-white/20 hover:text-white font-black uppercase tracking-widest">ABORT</button>
                                <button type="submit" className="px-12 py-4 bg-[#00FFCC] text-black font-mono text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,255,204,0.2)]">AUTHORIZE_PROVISIONING</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 255, 204, 0.1); }
                .animate-spin-slow { animation: spin 8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slide-up { animation: slide-up 0.8s ease-out forwards; opacity: 0; }
                @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}

function SectionLabel({ text, icon: Icon }) {
    return (
        <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/5 border border-white/5 text-[#00FFCC]">
                {Icon && <Icon size={12} />}
            </div>
            <span className="font-mono text-[9px] font-black tracking-[0.4em] text-white/20 uppercase">{text}</span>
        </div>
    );
}

const X = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function ResourceInventory() {
    return (
        <LocalErrorBoundary>
            <ResourceContent />
        </LocalErrorBoundary>
    );
}
