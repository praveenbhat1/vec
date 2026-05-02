import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../context';
import { ShieldAlert, Zap, Clock, Terminal, Activity, ChevronRight, Activity as Heartbeat } from 'lucide-react';

export function ResponseTimer({ startTime }) {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        const update = () => {
            const diff = Date.now() - new Date(startTime).getTime();
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setElapsed(`${mins}m ${secs}s`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <div className="flex items-center gap-2 text-[9px] font-mono text-red-400 font-bold tracking-widest uppercase">
            <Clock size={10} className="animate-pulse" />
            <span>ELAPSED: {elapsed}</span>
        </div>
    );
}

export default function LiveAlertsPanel() {
    const navigate = useNavigate();
    const { incidents, getIcon, addToast, updateStatus, user, setSelectedIncidentId, selectedIncidentId } = useDashboard();
    const criticalCount = (incidents || []).filter(a => a.severity?.toLowerCase() === 'critical').length;

    return (
        <div className="flex flex-col h-full w-full bg-[#0A0A0B]/20 relative overflow-hidden backdrop-blur-3xl group">
            
            {/* Header Header Status Bar */}
            <div className={`
                flex items-center justify-between px-6 py-5 border-b transition-all duration-700
                ${criticalCount > 0 ? 'bg-red-500/[0.03] border-red-500/20' : 'bg-white/[0.02] border-white/5'}
            `}>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Heartbeat className={`w-6 h-6 ${criticalCount > 0 ? 'text-red-500 animate-[pulse_2s_infinite]' : 'text-blue-500/40'}`} />
                        {criticalCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping" />}
                    </div>
                    <div>
                        <h4 className="font-outfit font-black text-xl tracking-tight text-white uppercase leading-none mb-1">LIVE INCIDENTS</h4>
                        <p className="font-mono text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase">MONITORING: {incidents?.length || 0} AREAS</p>
                    </div>
                </div>
                {criticalCount > 0 && (
                    <div className="px-5 py-2 bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-[9px] font-black tracking-widest uppercase animate-pulse">
                        {criticalCount} URGENT
                    </div>
                )}
            </div>

            {/* Alert List Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.03]">
                {(incidents || [])
                    .filter(a => a.status?.toUpperCase() !== 'RESOLVED' && a.status?.toUpperCase() !== 'CONTAINED')
                    .map((alert) => {
                    const Icon = getIcon(alert.iconName);
                    const isSelected = selectedIncidentId === alert.id;
                    const isCritical = alert.severity?.toLowerCase() === 'critical';
                    return (
                        <div
                            key={alert.id}
                            onClick={() => {
                              setSelectedIncidentId(alert.id);
                              addToast(`Uplink Synchronized: ${alert.type}`, 'success');
                            }}
                            className={`
                                group/alert flex items-start gap-5 px-6 py-5 cursor-pointer transition-all duration-500 hover:bg-white/[0.03] relative border-l-2
                                ${isCritical ? 'border-l-red-500 bg-red-500/[0.02]' : 'border-l-blue-500/40'}
                                ${isSelected ? 'bg-white/[0.05] border-l-white scale-[1.02] z-20' : ''}
                            `}
                        >
                            {/* Marker */}
                            <div className="relative flex-shrink-0 mt-1">
                                <div className={`w-10 h-10 border flex items-center justify-center transition-all group-hover/alert:scale-110 ${isCritical ? 'bg-red-500/5 border-red-500/20 text-red-500' : 'bg-white/5 border-white/5 text-white/40'} ${isSelected ? 'border-white text-white' : ''}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                {isCritical && <div className="absolute inset-0 bg-red-500/10 blur-[12px] -z-10 group-hover/alert:opacity-100 opacity-0 transition-opacity" />}
                            </div>

                            {/* Content Block */}
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <h5 className={`font-outfit font-black text-lg tracking-tight uppercase leading-none ${isSelected ? 'text-[#00FFCC]' : isCritical ? 'text-white' : 'text-blue-100/60'}`}>
                                        {alert.type}
                                    </h5>
                                    <span className="font-mono text-[9px] text-white/20 tracking-widest font-bold uppercase transition-transform group-hover/alert:translate-x-2">[{alert.time}]</span>
                                </div>
                                <p className="font-mono text-[10px] text-white/30 uppercase italic tracking-tighter line-clamp-1">LOCATION: {alert.location}</p>
                                
                                <div className="flex flex-col gap-3 mt-1">
                                    <ResponseTimer startTime={alert.created_at} />
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="px-3 py-1 bg-white/5 border border-white/5 font-mono text-[8px] font-black tracking-widest uppercase text-white/20">
                                            ID: {alert.id.toString().slice(0, 8).toUpperCase()}
                                        </div>
                                        <div className={`px-3 py-1 border font-mono text-[8px] font-black tracking-widest uppercase ${isCritical ? 'border-red-500/20 text-red-500 bg-red-500/5' : 'border-blue-500/20 text-blue-400 bg-blue-500/5'}`}>
                                            {alert.status.toUpperCase() === 'ACTIVE' ? 'ACTIVE_UNASSIGNED' : alert.status.toUpperCase() === 'RESPONDING' ? 'RESPONDERS_DISPATCHED' : 'RESOLVED'}
                                        </div>
                                        
                                        {/* Responder Actions */}
                                        {(user?.role === 'responder' || user?.role === 'admin' || user?.role === 'official') && (
                                           <div className="flex gap-2">
                                              {(alert.status.toUpperCase() === 'ACTIVE' || alert.status.toUpperCase() === 'REPORTED') && (
                                                <button 
                                                  onClick={async (e) => { e.stopPropagation(); await updateStatus(alert.id, 'RESPONDING'); }}
                                                  className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono text-[8px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                  Engage Response
                                                </button>
                                              )}
                                           </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/40">
                <button
                    onClick={() => {
                        addToast('Opening Alert Feed…', 'info');
                        navigate('/alerts');
                    }}
                    className="w-full h-10 bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all font-mono text-[9px] font-black tracking-[0.5em] text-white/40 hover:text-[#00FFCC] uppercase"
                >
                    VIEW ALL ALERTS
                </button>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
            `}} />
        </div>
    );
}
