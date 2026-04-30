import { useDashboard } from '../../context';
import { Building2, Activity, Users, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OrganizationPanel() {
  const { organizations } = useDashboard();

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0B0E]/20 relative overflow-hidden backdrop-blur-3xl group">
      
      {/* Header HUD */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 border border-blue-500/20 bg-blue-500/5 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
                <h4 className="font-outfit font-black text-sm tracking-tight text-white uppercase leading-none mb-1">AGENCY STATUS</h4>
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="font-mono text-[8px] font-bold tracking-[0.2em] text-white/20 uppercase">NET_SYNC_ACTIVE</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 p-5 md:p-8 overflow-y-auto custom-scrollbar space-y-4">
        {organizations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-10">
            <Building2 className="w-12 h-12 mb-4" />
            <span className="font-mono text-[10px] font-black tracking-widest uppercase">NO AGENCIES DETECTED</span>
          </div>
        )}
        
        {organizations.map((org) => (
          <div key={org.id} className="group/org bg-white/[0.02] border border-white/5 p-5 hover:border-white/10 transition-all duration-300 relative">
             <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                   <span className="text-[14px] font-outfit font-black text-white uppercase tracking-tight group-hover/org:text-blue-400 transition-colors">
                     {org.name}
                   </span>
                   <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">{org.type} // SECTOR {org.id.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className={`px-2 py-1 border font-mono text-[8px] font-black tracking-widest uppercase flex items-center gap-2 ${org.status === 'READY' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-amber-500/20 text-amber-500 bg-amber-500/5'}`}>
                   {org.status === 'READY' ? <CheckCircle2 size={10} /> : <Activity size={10} className="animate-pulse" />}
                   {org.status || 'READY'}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex flex-col gap-1">
                   <span className="text-[7px] font-mono text-white/10 uppercase tracking-widest">DEPLOYED UNITS</span>
                   <div className="flex items-center gap-2">
                      <Users size={12} className="text-white/20" />
                      <span className="text-xs font-mono font-bold text-white/60">08 / 12</span>
                   </div>
                   <div className="w-full h-[1px] bg-white/5 mt-1">
                      <div className="h-full bg-blue-500/40 w-[66%]" />
                   </div>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[7px] font-mono text-white/10 uppercase tracking-widest">LATENCY</span>
                   <div className="flex items-center gap-2">
                      <Activity size={12} className="text-white/20" />
                      <span className="text-xs font-mono font-bold text-white/60">42ms</span>
                   </div>
                   <div className="w-full h-[1px] bg-white/5 mt-1">
                      <div className="h-full bg-emerald-500/40 w-[90%]" />
                   </div>
                </div>
             </div>

             <div className="mt-6 pt-4 border-t border-white/[0.03] flex items-center gap-3">
                <MapPin size={10} className="text-white/10" />
                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest truncate">{org.address || 'LOC_REDACTED'}</span>
             </div>
          </div>
        ))}
      </div>

      {/* Footer HUD */}
      <div className="px-8 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-4">
             <span className="font-mono text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">TOTAL NODES: {organizations.length}</span>
             <div className="h-3 w-[1px] bg-white/5" />
             <span className="font-mono text-[8px] font-bold text-emerald-500/40 uppercase tracking-[0.2em]">ALL LINKS STABLE</span>
          </div>
      </div>
    </div>
  );
}
