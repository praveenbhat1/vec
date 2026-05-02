import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDashboard } from '../context';
import { filterNavByRole, getRoleColor, getRoleLabel } from '../lib/rbac';
import {
    LayoutDashboard, AlertTriangle, Activity,
    Database, Settings, Shield,
    Terminal, Lock, Radio, ChevronRight, Zap, LogOut, FileText
} from 'lucide-react';

const W_CLOSED = 90;
const W_OPEN   = 300;
const H_TOP    = 80;

const NAV = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { id: 'alerts',    icon: AlertTriangle,   label: 'Emergency Alerts',    path: '/alerts' },
    { id: 'resources', icon: Database,         label: 'Resources', path: '/resources' },
    { id: 'analytics', icon: Activity,         label: 'Analytics',  path: '/analytics' },
    { id: 'settings',  icon: Settings,         label: 'Settings',     path: '/settings' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isSidebarOpen, toggleSidebar, addToast, profile, user, logout, userRole } = useDashboard();
    const w = isSidebarOpen ? W_OPEN : W_CLOSED;
    const filteredNav = filterNavByRole(NAV, userRole);
    const roleColor = getRoleColor(userRole);
    const roleLabel = getRoleLabel(userRole);

    const handleLogout = async () => {
        addToast('Terminating session...', 'info');
        try {
            await logout();
            navigate('/');
        } catch {
            navigate('/');
        }
    };

    return (
        <aside
            className={`h-screen flex flex-col z-[60] transition-[width,transform] duration-300 ease-in-out overflow-hidden bg-[#08080A]/95 backdrop-blur-xl border-r border-white/5 transform-gpu backface-hidden
                ${isSidebarOpen 
                    ? 'w-[280px] translate-x-0' 
                    : 'w-0 lg:w-[90px] -translate-x-full lg:translate-x-0'}
                fixed lg:relative top-0 left-0`}
        >
            {/* ── LOGO CLUSTER ── */}
            <div className="flex items-center flex-shrink-0 relative overflow-hidden group/logo"
                 style={{ height: H_TOP }}>
                <Link to="/" className="flex items-center w-full h-full">
                    <div className="flex-shrink-0 w-[90px] flex items-center justify-center">
                        <div className="relative">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center group-hover/logo:border-[#00FFCC]/60 transition-all duration-500 shadow-[inset_0_0_20px_rgba(0,255,204,0.05)]">
                                <Shield className="w-6 h-6 text-[#00FFCC] group-hover/logo:scale-110 transition-transform" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00FFCC] shadow-[0_0_10px_#00FFCC] animate-pulse" />
                        </div>
                    </div>
                    <div className={`flex flex-col gap-0.5 leading-none transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 delay-150' : 'opacity-0 pointer-events-none'}`}>
                        <span className="font-outfit font-black text-2xl tracking-tighter uppercase text-white whitespace-nowrap">CRISISCHAIN</span>
                        <span className="text-[10px] font-mono font-bold text-blue-500 tracking-[0.5em] opacity-40 uppercase whitespace-nowrap">ADMIN COMMAND SYSTEM</span>
                    </div>
                </Link>

                {/* Mobile Close Button */}
                {isSidebarOpen && (
                    <button 
                        onClick={() => toggleSidebar()}
                        className="lg:hidden ml-auto mr-8 w-10 h-10 flex items-center justify-center border border-white/10 text-white/40 hover:text-white"
                    >
                        <Lock className="w-4 h-4" />
                    </button>
                )}

                {/* Visual Blade Accent */}
                <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-[#00FFCC]/20 to-transparent" />
            </div>

            {/* ── NAVIGATION BLADE ── */}
            <nav className="flex-1 py-16 px-5 space-y-6">
                {filteredNav.map(({ id, icon: Icon, label, path }) => {
                    const isActive = location.pathname === path;
                    return (
                        <button
                            key={id}
                            onClick={() => navigate(path)}
                            className={`
                                group relative flex items-center w-full transition-all duration-300 rounded-sm py-5
                                ${isActive ? 'bg-white/[0.03] shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]' : 'hover:bg-white/[0.01]'}
                            `}
                        >
                            {/* Linear Status Indicator (Stable) */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 bg-[#00FFCC] shadow-[0_0_10px_rgba(0,255,204,0.4)] animate-pulse will-change-transform" />
                            )}
                            
                            <div className="flex-shrink-0 w-[90px] flex items-center justify-center">
                                <Icon className={`transition-all duration-500 ${isActive ? 'text-[#00FFCC] scale-110 drop-shadow-[0_0_10px_rgba(0,255,204,0.3)]' : 'text-white/10 group-hover:text-white/50'}`} 
                                      size={24} />
                            </div>
                            
                            <div className={`flex flex-col items-start min-w-0 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                                <span className={`text-[11px] font-mono font-black tracking-[0.4em] uppercase whitespace-nowrap ${isActive ? 'text-white' : 'text-white/10 group-hover:text-white/30'}`}>
                                    {label}
                                </span>
                                {isActive && (
                                    <div className="h-[1px] w-full bg-gradient-to-r from-[#00FFCC]/40 to-transparent mt-2 animate-width-reveal" />
                                )}
                            </div>

                            {isActive && (
                                <ChevronRight size={14} className={`ml-auto mr-8 text-[#00FFCC]/40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} />
                            )}
                            
                            {/* Floating Metadata Tooltip (Closed Mode) */}
                            {!isSidebarOpen && (
                                <div className="absolute left-[90px] p-6 bg-[#0A0A0B] border border-white/10 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 z-[100] min-w-[200px]">
                                    <div className="flex items-center gap-4 mb-4">
                                       <div className="w-1.5 h-1.5 bg-[#00FFCC] rounded-full" />
                                       <span className="text-[10px] font-mono font-black tracking-[0.4em] text-white uppercase">{label}</span>
                                    </div>
                                    <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest leading-relaxed">
                                       Status: Verified<br />
                                       Encryption: Active
                                    </p>
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* ── SECURITY / IDENT / STATUS ── */}
            <div className="p-8 border-t border-white/5 space-y-10 pb-16 bg-white/[0.01]">
                <div className="flex flex-col gap-8">
                    {/* Status Nodes */}
                    <div className="flex items-center w-full">
                        <div className="flex-shrink-0 w-[90px] flex items-center justify-center">
                            <div className="w-11 h-11 bg-white/5 border border-white/5 flex items-center justify-center relative group/status">
                                <Radio size={20} className="text-[#00FFCC] animate-pulse" />
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_12px_#22c55e]" />
                            </div>
                        </div>
                        <div className={`flex flex-col text-left transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                            <span className="text-[11px] font-mono font-black text-white/40 uppercase tracking-widest whitespace-nowrap">System Status</span>
                            <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-black animate-pulse whitespace-nowrap">Connected</span>
                        </div>
                    </div>
                </div>
                
                {/* User Profile Card */}
                <div className={`p-6 bg-white/[0.03] border border-white/5 relative group/user cursor-pointer overflow-hidden transition-all duration-300 ${!isSidebarOpen ? 'mx-2 border-none bg-transparent' : ''}`}>
                   <div className="absolute inset-0 bg-gradient-to-tr from-[#00FFCC]/5 to-transparent opacity-0 group-hover/user:opacity-100 transition-opacity" />
                   <div className="flex items-center w-full relative z-10">
                      <div className="flex-shrink-0 w-[90px] lg:w-[68px] flex items-center justify-center">
                          <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center font-outfit font-black text-2xl text-white group-hover/user:border-[#00FFCC]/40 transition-all">
                             {profile?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'C'}
                          </div>
                      </div>
                      
                      <div className={`flex items-center justify-between flex-1 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                        <div className="flex flex-col gap-1 leading-none ml-2">
                            <span className="text-[13px] font-outfit font-black text-white uppercase tracking-wider whitespace-nowrap">{profile?.name || user?.user_metadata?.name || user?.user_metadata?.full_name || 'User'}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: roleColor }} />
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] whitespace-nowrap" style={{ color: roleColor }}>
                                    {roleLabel}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                            className="p-2 text-white/10 hover:text-red-500 transition-colors"
                            title="Logout Session"
                        >
                            <LogOut size={16} />
                        </button>
                      </div>

                      {!isSidebarOpen && (
                        <button 
                            onClick={handleLogout}
                            className="absolute inset-0 z-20 flex items-center justify-center opacity-0 hover:opacity-100 bg-red-600/10 transition-opacity"
                        >
                            <LogOut size={16} className="text-red-500" />
                        </button>
                      )}
                   </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
              aside { scrollbar-width: none; }
              aside::-webkit-scrollbar { display: none; }
              @keyframes width-reveal {
                from { width: 0%; }
                to { width: 100%; }
              }
              .animate-width-reveal { animation: width-reveal 1s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
            `}} />
        </aside>
    );
}
