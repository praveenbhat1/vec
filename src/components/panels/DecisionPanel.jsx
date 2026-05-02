import { useDashboard } from '../../context';
import { Brain, Cpu, Zap, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';

export default function DecisionPanel() {
  const { recommendations, executeAction, stats } = useDashboard();

  return (
    <div className="flex flex-col h-full bg-[#0A0A0B]/20 backdrop-blur-3xl">
      <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain size={16} className="text-[#00FFCC]" />
          <div>
            <h4 className="font-outfit font-black text-sm tracking-tight text-white uppercase leading-none mb-1">COGNITIVE_OVERRIDE</h4>
            <p className="font-mono text-[8px] font-bold tracking-[0.2em] text-white/30 uppercase">AI REASONING ENGINE ACTIVE</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-[#00FFCC]/10 border border-[#00FFCC]/20">
           <Zap size={10} className="text-[#00FFCC] animate-pulse" />
           <span className="font-mono text-[8px] text-[#00FFCC] font-black uppercase">Optimized</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <div key={rec.id} className="group relative p-5 bg-white/[0.03] border border-white/5 hover:border-[#00FFCC]/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-0.5 text-[8px] font-mono font-black tracking-widest uppercase border ${
                  rec.priority === 'CRITICAL' ? 'text-red-500 border-red-500/30 bg-red-500/5' : 
                  rec.priority === 'HIGH' ? 'text-orange-500 border-orange-500/30 bg-orange-500/5' : 
                  'text-blue-400 border-blue-400/30 bg-blue-400/5'
                }`}>
                  {rec.priority}_PRIORITY
                </span>
                <Cpu size={12} className="text-white/10 group-hover:text-[#00FFCC]/40 transition-colors" />
              </div>
              
              <p className="text-xs font-outfit font-medium text-white/80 leading-relaxed mb-6">
                {rec.text}
              </p>

              <button 
                onClick={() => executeAction(rec.id, rec.action)}
                className="w-full py-3 bg-[#00FFCC]/5 border border-[#00FFCC]/20 hover:bg-[#00FFCC] hover:text-black transition-all duration-500 flex items-center justify-center gap-3 group/btn"
              >
                <span className="font-mono text-[9px] font-black tracking-[0.2em] uppercase">Execute Command</span>
                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <div className="absolute -bottom-[1px] -left-[1px] w-0 h-[1px] bg-[#00FFCC] group-hover:w-[100%] transition-all duration-500" />
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-10">
            <ShieldCheck size={40} className="mb-4" />
            <p className="font-mono text-[10px] uppercase tracking-widest font-black">All Systems Normal</p>
            <p className="font-mono text-[8px] uppercase tracking-widest mt-2">No recommended actions</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5">
        <div className="flex items-center gap-3 text-white/20">
           <Terminal size={12} />
           <span className="font-mono text-[8px] tracking-[0.3em] uppercase">Analyzing {stats.active || 0} active nodes...</span>
        </div>
      </div>
    </div>
  );
}
