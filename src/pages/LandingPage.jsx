import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Map as MapIcon, 
  Users, 
  BarChart3, 
  ArrowRight, 
  AlertTriangle,
  Zap,
  Globe,
  Bell,
  Menu,
  X,
  Target,
  Plus,
  Clock,
  Layers,
  Crosshair,
  Terminal,
  Compass,
  CheckCircle,
  HeartHandshake
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { useDashboard } from '../context';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// --- SUB-COMPONENT FOR GLOBE TO PREVENT FULL PAGE RE-RENDERS ---
const GlobeView = ({ hoveredMarker, setHoveredMarker, onEnter, onLeave }) => {
  const [rotation, setRotation] = useState(0);
  const { incidents: rawIncidents = [] } = useDashboard();

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    const rotateInterval = setInterval(() => {
      setRotation(prev => (prev + (isMobile ? 0.3 : 0.5)) % 360);
    }, 50);
    return () => clearInterval(rotateInterval);
  }, []);

  const incidents = React.useMemo(() => {
    return rawIncidents.map(inc => ({
      ...inc,
      coords: { 
        lat: parseFloat(inc.lat || inc.latitude || 0), 
        lng: parseFloat(inc.lng || inc.longitude || 0) 
      },
      type: (inc.priority || inc.status || 'LIVE').toUpperCase(),
      label: inc.title || inc.description || 'Incident',
      time: 'LIVE',
      color: inc.priority === 'high' ? '#ef4444' : '#3b82f6'
    })).filter(inc => inc.coords.lat !== 0 || inc.coords.lng !== 0);
  }, [rawIncidents]);

  return (
    <div className="w-[300px] h-[300px] lg:w-[450px] lg:h-[450px] relative z-20 pointer-events-auto">
      <ComposableMap 
        projection="geoOrthographic" 
        projectionConfig={{ rotate: [rotation, -15, 0], scale: 140 }}
        className="w-full h-full opacity-90 drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="rgba(15, 23, 42, 0.4)"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "rgba(59, 130, 246, 0.1)", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        
        {incidents.map((inc, i) => (
          <Marker 
            key={i} 
            coordinates={[inc.coords.lng, inc.coords.lat]}
          >
            <g 
              className="cursor-pointer"
              onMouseEnter={() => onEnter(inc)}
              onMouseLeave={() => onLeave()}
            >
              {/* Hit area - significantly increased for rotating globe */}
              <circle r={35} fill="transparent" />
              <circle 
                r={hoveredMarker === inc ? 7 : 5} 
                fill={inc.color} 
                className="animate-pulse transition-all duration-300" 
                style={{ filter: `drop-shadow(0 0 10px ${inc.color})` }}
              />
              <circle r={12} fill={inc.color} className="animate-ping opacity-20" />
            </g>
          </Marker>
        ))}

        <Marker coordinates={[rotation - 20, 45]}>
           <circle r={1.5} fill="#3b82f6" />
        </Marker>
      </ComposableMap>
    </div>
  );
};

const LandingPage = () => {
  const { incidents = [], organizations = [], resources = [] } = useDashboard();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [isZoomed, setIsZoomed] = useState(true);
  const hoverTimeoutRef = React.useRef(null);

  const handleMarkerEnter = (inc) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredMarker(inc);
  };

  const handleMarkerLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMarker(null);
    }, 100);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#08080A] text-[#E5E5E7] font-inter overflow-x-hidden selection:bg-[#00FFCC] selection:text-black">
      
      {/* ── AMBIENT MESH BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[160px] opacity-[0.1] bg-blue-500 transition-transform duration-1000 ease-out"
          style={{ 
            transform: `translate(${mousePos.x - 400}px, ${mousePos.y - 400}px)`,
          }}
        />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.1] bg-blue-600 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[180px] opacity-[0.05] bg-red-900" />
        <div className="absolute inset-0 opacity-[0.03] contrast-150 brightness-150 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* ── MOBILE MENU OVERLAY ── */}
      <div className={`
        fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl transition-all duration-500 lg:hidden
        ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}
      `}>
        <div className="flex flex-col h-full p-8">
            <div className="flex justify-between items-center mb-12">
               <div 
                 onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }} 
                 className="flex items-center gap-4 cursor-pointer"
               >
                 <Shield className="w-8 h-8 text-[#00FFCC]" />
                 <span className="font-outfit font-black text-xl tracking-tighter uppercase">CRISISCHAIN</span>
               </div>
               <button onClick={() => setMobileMenuOpen(false)} className="w-14 h-14 flex items-center justify-center bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all">
                 <X className="w-8 h-8 text-white" />
               </button>
            </div>
           
            <div className="flex flex-col gap-8 flex-1 justify-center">
               <button onClick={() => scrollToSection('intel')} className="text-3xl font-outfit font-black uppercase tracking-tighter text-white flex items-center gap-6 group">
                 <div className="w-1 h-12 bg-[#00FFCC] scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                 OUR MISSION
               </button>
               <button onClick={() => scrollToSection('nodes')} className="text-3xl font-outfit font-black uppercase tracking-tighter text-white flex items-center gap-6 group">
                 <div className="w-1 h-12 bg-[#00FFCC] scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                 GLOBAL COVERAGE
               </button>
               <Link to="/report" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-outfit font-black uppercase tracking-tighter text-red-500 flex items-center gap-6 group">
                 <div className="w-1 h-12 bg-red-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                 REPORT EMERGENCY
               </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-outfit font-black uppercase tracking-tighter text-blue-400 flex items-center gap-6 group">
                  <div className="w-12 h-1 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  LOGIN
                </Link>
           </div>
        </div>
      </div>

      {/* ── NAV BAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? 'bg-black/20 backdrop-blur-3xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#00FFCC]/40 transition-all duration-500">
              <Shield className="w-5 h-5 text-[#00FFCC]" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-outfit font-black text-xl tracking-tighter uppercase">CRISISCHAIN</span>
              <span className="text-[9px] font-mono text-blue-400 tracking-[0.4em] opacity-60">EMERGENCY ASSISTANCE</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-10 text-[9px] font-mono uppercase tracking-[0.4em] font-bold text-white/40">
            <button onClick={() => scrollToSection('intel')} className="hover:text-[#00FFCC] transition-colors">MISSION</button>
            <button onClick={() => scrollToSection('nodes')} className="hover:text-[#00FFCC] transition-colors">COVERAGE</button>
            <Link to="/report" className="text-red-500 hover:text-red-400 transition-colors">REPORT EMERGENCY</Link>
            <Link to="/login" className="px-6 py-2 border border-blue-500/30 bg-white/5 text-blue-400 hover:text-white transition-all uppercase">LOGIN</Link>
          </div>
          <button className="lg:hidden w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 px-8 z-10">
        <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col items-start pt-12">
            <h1 className="font-outfit text-5xl md:text-7xl lg:text-[100px] font-black leading-[0.85] tracking-tighter mb-12 animate-slide-up text-white">
              REAL-TIME <br />
              <span className="text-white/10 stroke-text outline-white/20">DISASTER</span> <br />
              <span className="bg-gradient-to-r from-[#00FFCC] via-white to-white/40 bg-clip-text text-transparent italic">COORDINATION</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-xl mb-16 animate-fade-in">
              Helping hospitals, fire teams, and responders work together in real-time when every second counts.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 items-center animate-fade-in">
                <Link to="/report" className="px-10 py-5 bg-red-600/10 border border-red-500/40 hover:bg-red-600/20 transition-all flex items-center gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[8px] font-mono text-white/60 uppercase">CRITICAL PRIORITY</span>
                    <span className="text-xl font-outfit font-black uppercase tracking-tight">🚨 Report Emergency</span>
                  </div>
                </Link>
                <Link to="/login" className="px-10 py-5 bg-blue-600/10 border border-blue-500/40 hover:bg-blue-600/20 transition-all flex items-center gap-4">
                  <Shield className="w-6 h-6 text-blue-500" />
                  <div className="flex flex-col items-start text-left text-blue-400">
                    <span className="text-[8px] font-mono text-white/60 uppercase">Responder Portal</span>
                    <span className="text-xl font-outfit font-black uppercase tracking-tight">Login</span>
                  </div>
                </Link>
            </div>
          </div>

          <div className="lg:col-span-5 h-[450px] md:h-[600px] lg:h-[750px] relative mt-12 lg:mt-0 animate-fade-in">
            <div className="absolute inset-0 bg-blue-600/[0.02] backdrop-blur-3xl border border-white/10 rounded-[40px] flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-transparent w-[200%] h-[200%] -top-1/2 -left-1/2 animate-radar-sweep origin-center" />
               </div>

               <div className="absolute top-10 left-10 p-6 bg-black/40 border border-blue-500/20 backdrop-blur-3xl z-40 max-w-[200px]">
                  <div className="text-[10px] font-mono text-blue-400 uppercase mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    LIVE UPDATES
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                       <span className="text-[8px] font-mono text-white/40 uppercase">LATENCY</span>
                       <span className="text-xs font-outfit text-white">12MS</span>
                    </div>
                  </div>
               </div>

               <div 
                  className={`relative cursor-crosshair transition-all duration-1000 ease-in-out scale-[2.0] lg:scale-[2.8]`}
                  onClick={() => setIsZoomed(!isZoomed)}
               >
                  <div className="absolute border border-blue-500/10 rounded-full animate-spin-slow inset-[-120px] opacity-20" />
                  <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl opacity-50" />
                  
                  {/* GLOBE COMPONENT */}
                  <GlobeView 
                    hoveredMarker={hoveredMarker} 
                    setHoveredMarker={setHoveredMarker} 
                    onEnter={handleMarkerEnter}
                    onLeave={handleMarkerLeave}
                  />
               </div>
            </div>

            {/* TOOLTIP */}
            {hoveredMarker && (
              <div 
                className="fixed z-[999] pointer-events-none animate-fade-in"
                style={{ left: mousePos.x + 20, top: mousePos.y - 60 }}
              >
                 <div className="bg-black/95 border-l-4 backdrop-blur-2xl px-6 py-4 shadow-2xl border-white/10" style={{ borderLeftColor: hoveredMarker.color }}>
                    <div className="text-[10px] font-mono tracking-widest text-white/40 mb-1 uppercase">
                      {hoveredMarker.time} // {hoveredMarker.type}
                    </div>
                    <div className="text-lg font-outfit font-black text-white uppercase tracking-tight">
                      {hoveredMarker.label}
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- INTEL SECTION (FEATURES) --- */}
      <section id="intel" className="py-40 px-8 relative z-10 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-32 max-w-4xl">
            <span className="text-[9px] font-mono text-[#00FFCC] tracking-[0.6em] uppercase block mb-8">CORE_CAPABILITIES</span>
            <h2 className="font-outfit text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
              INTELLIGENT <br />
              <span className="text-white/20 stroke-text italic">COORDINATION</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-12 bg-white/5 border border-white/5 backdrop-blur-3xl hover:border-[#00FFCC]/20 transition-all duration-700 hover:-translate-y-2">
               <Zap className="text-[#00FFCC] w-10 h-10 mb-8 group-hover:scale-110 transition-transform" />
               <h3 className="font-outfit text-2xl font-black mb-4 uppercase">Rapid Response</h3>
               <p className="text-white/40 text-sm leading-relaxed mb-8">AI-driven incident prioritization ensuring critical cases receive immediate attention from the nearest available units.</p>
               <div className="flex items-center gap-3 text-[8px] font-mono text-[#00FFCC]/40 tracking-widest uppercase">
                 <Clock className="w-3 h-3" /> { '< ' } 2min Average Response
               </div>
            </div>

            <div className="group p-12 bg-white/5 border border-white/5 backdrop-blur-3xl hover:border-blue-500/20 transition-all duration-700 hover:-translate-y-2">
               <Layers className="text-blue-500 w-10 h-10 mb-8 group-hover:scale-110 transition-transform" />
               <h3 className="font-outfit text-2xl font-black mb-4 uppercase">Tactical Mapping</h3>
               <p className="text-white/40 text-sm leading-relaxed mb-8">Unified geospatial intelligence layering real-time telemetry, responder locations, and environmental hazards.</p>
               <div className="flex items-center gap-3 text-[8px] font-mono text-blue-500/40 tracking-widest uppercase">
                 <MapIcon className="w-3 h-3" /> 24/7 Live Monitoring
               </div>
            </div>

            <div className="group p-12 bg-white/5 border border-white/5 backdrop-blur-3xl hover:border-purple-500/20 transition-all duration-700 hover:-translate-y-2">
               <Users className="text-purple-500 w-10 h-10 mb-8 group-hover:scale-110 transition-transform" />
               <h3 className="font-outfit text-2xl font-black mb-4 uppercase">Unified Command</h3>
               <p className="text-white/40 text-sm leading-relaxed mb-8">Cross-agency interoperability allowing hospitals, fire teams, and police to share data and coordinate actions seamlessly.</p>
               <div className="flex items-center gap-3 text-[8px] font-mono text-purple-500/40 tracking-widest uppercase">
                 <Terminal className="w-3 h-3" /> Secure Comms Link
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- NODES SECTION (GLOBAL COVERAGE) --- */}
      <section id="nodes" className="py-40 px-8 relative z-10 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
               <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full opacity-30" />
               <div className="relative p-1 bg-gradient-to-br from-white/10 to-transparent border border-white/5">
                  <div className="p-8 lg:p-16 bg-[#08080A] border border-white/5 flex flex-col gap-10">
                    <div className="grid grid-cols-2 gap-10">
                       <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-mono text-white/20 tracking-widest uppercase">ACTIVE_INCIDENTS</span>
                          <span className="text-5xl font-outfit font-black text-white italic">{incidents.length}<span className="text-[#00FFCC]">+</span></span>
                       </div>
                       <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-mono text-white/20 tracking-widest uppercase">AGENCIES</span>
                          <span className="text-5xl font-outfit font-black text-white italic">{organizations.length || '12'}</span>
                       </div>
                    </div>
                    <div className="h-[200px] w-full border border-white/5 relative overflow-hidden group">
                       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Activity className="w-20 h-20 text-blue-500/10 animate-pulse" />
                       </div>
                       <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00FFCC] to-transparent animate-scan-y opacity-50" />
                    </div>
                  </div>
               </div>
            </div>

            <div className="order-1 lg:order-2 flex flex-col items-start">
               <span className="text-[9px] font-mono text-blue-500 tracking-[0.6em] uppercase block mb-8">GLOBAL_PRESENCE</span>
               <h2 className="font-outfit text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-12">
                 BORDERS <br />
                 <span className="bg-gradient-to-r from-blue-500 to-white bg-clip-text text-transparent">CEASE_TO_EXIST</span>
               </h2>
               <p className="text-white/40 text-lg font-light leading-relaxed mb-12 max-w-xl">
                 CrisisChain's neural network spans across continents, providing every registered responder with the same high-fidelity tactical data. Whether in a dense metropolis or a remote coastline, intelligence remains consistent.
               </p>
               <div className="grid grid-cols-1 gap-6 w-full">
                  {[
                    { label: 'NORTH AMERICA', status: 'OPERATIONAL', health: 98 },
                    { label: 'EUROPEAN SECTOR', status: 'OPERATIONAL', health: 99 },
                    { label: 'ASIA PACIFIC', status: 'MONITORING', health: 94 }
                  ].map(region => (
                    <div key={region.label} className="p-6 border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:border-[#00FFCC]/20 transition-all">
                       <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-mono text-white/20 tracking-widest uppercase">{region.label}</span>
                          <span className="text-sm font-outfit font-bold text-white tracking-widest">{region.status}</span>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="w-32 h-1 bg-white/5 overflow-hidden">
                             <div className="h-full bg-blue-500/40" style={{ width: `${region.health}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-[#00FFCC]">{region.health}%</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROTOCOL SECTION --- */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01] relative z-10">
        <div className="max-w-[1400px] mx-auto px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">
                {[
                    { icon: Compass, title: "Coordinate", desc: "Real-time sync across multi-agency units." },
                    { icon: Crosshair, title: "Target", desc: "Precision resource deployment via AI." },
                    { icon: Terminal, title: "Command", desc: "Direct uplink to emergency protocols." },
                    { icon: HeartHandshake, title: "Recover", desc: "Post-crisis community stabilization." }
                ].map((item, i) => (
                    <div key={i} className="space-y-4 group">
                        <item.icon className="text-[#00FFCC] w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <h4 className="font-outfit font-black uppercase text-xl tracking-tight text-white">{item.title}</h4>
                        <p className="text-white/40 text-[10px] leading-relaxed uppercase font-mono tracking-widest">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- TACTICAL ECOSYSTEM --- */}
      <section className="py-40 px-8 relative z-10 border-b border-white/5 overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="animate-fade-in">
             <span className="text-[9px] font-mono text-[#00FFCC] tracking-[0.6em] uppercase block mb-8">INTEROPERABILITY_CORE</span>
             <h2 className="font-outfit text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] mb-12">
               ONE_SYSTEM <br />
               <span className="text-white/20 stroke-text outline-white/20">EVERY_RESPONSE</span>
             </h2>
             <div className="space-y-10">
                {[
                  { icon: Shield, title: "Responder Safety", desc: "Real-time hazard monitoring and perimeter security indices." },
                  { icon: Target, title: "Resource Precision", desc: "Automated logistics tracking and supply chain integration." },
                  { icon: Activity, title: "Live Telemetry", desc: "Biometric and environmental data streaming from the field." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="w-14 h-14 flex-shrink-0 bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#00FFCC]/40 transition-all duration-500">
                      <item.icon className="w-6 h-6 text-[#00FFCC]" />
                    </div>
                    <div className="space-y-2 pt-1">
                       <h4 className="font-outfit font-black text-xl uppercase tracking-tight text-white">{item.title}</h4>
                       <p className="text-white/40 text-sm font-light leading-relaxed max-w-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="relative p-12 lg:p-20 bg-white/5 border border-white/5 backdrop-blur-3xl overflow-hidden group animate-slide-up">
             <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FFCC]/10 blur-[120px] pointer-events-none" />
             <div className="relative z-10 space-y-12">
                <div className="flex items-center gap-6">
                   <div className="p-3 bg-[#00FFCC]/10 border border-[#00FFCC]/20">
                    <Terminal className="text-[#00FFCC] w-6 h-6" />
                   </div>
                   <span className="text-[10px] font-mono text-white/60 tracking-[0.4em] uppercase">Uplink_Active // V5.4.1</span>
                </div>
                <div className="space-y-8">
                   <div className="space-y-3">
                      <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase tracking-widest"><span>Data Throughput</span><span>84%</span></div>
                      <div className="h-[2px] bg-white/5 w-full overflow-hidden">
                          <div className="h-full bg-[#00FFCC] animate-scan-x" style={{ width: '84%' }} />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase tracking-widest"><span>Node Reliability</span><span>99%</span></div>
                      <div className="h-[2px] bg-white/5 w-full overflow-hidden">
                          <div className="h-full bg-blue-500 animate-scan-x" style={{ width: '99%', animationDelay: '1s' }} />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase tracking-widest"><span>Encryption Load</span><span>24%</span></div>
                      <div className="h-[2px] bg-white/5 w-full overflow-hidden">
                          <div className="h-full bg-red-500 animate-scan-x" style={{ width: '24%', animationDelay: '0.5s' }} />
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/5">
                   <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-white/20 tracking-widest uppercase">ENCRYPTION</span>
                      <span className="text-3xl font-outfit font-black text-white italic tracking-tighter">AES-256</span>
                   </div>
                   <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-white/20 tracking-widest uppercase">PROTOCOL</span>
                      <span className="text-3xl font-outfit font-black text-white italic tracking-tighter">ST-TCP/IP</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- STATS LAYER --- */}
      <section className="py-40 border-b border-white/5 relative z-10 bg-black/40">
        <div className="max-w-[1400px] mx-auto px-8">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
              {[
                { label: 'GLOBAL REACH', value: 'LIVE', icon: Globe },
                { label: 'RESPONDERS', value: 'SYNCED', icon: Users },
                { label: 'RESPONSE TIME', value: 'OPTIMIZED', icon: Clock },
                { label: 'DATA INTEGRITY', value: 'VERIFIED', icon: CheckCircle }
              ].map((stat, i) => (
                <div key={stat.label} className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6 group">
                   <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-[#00FFCC] group-hover:border-[#00FFCC]/20 transition-all duration-500">
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <div className="flex flex-col gap-2">
                      <span className="text-5xl lg:text-6xl font-outfit font-black text-white italic tracking-tighter uppercase">{stat.value}</span>
                      <span className="text-[9px] font-mono text-white/20 tracking-[0.5em] uppercase">{stat.label}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-60 px-8 relative z-10 overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50" />
         <div className="max-w-[1400px] mx-auto text-center flex flex-col items-center">
            <Shield className="w-20 h-20 text-[#00FFCC] mb-12 animate-pulse" />
            <h2 className="font-outfit text-6xl md:text-[120px] font-black tracking-[calc(-0.05em)] uppercase leading-[0.8] mb-12 text-white italic">
               SECURE_THE<br />
               <span className="text-[#00FFCC] stroke-text opacity-50">FUTURE</span>
            </h2>
            <p className="text-white/40 text-xl font-light mb-16 max-w-2xl leading-relaxed">
               Join the global network of responders and agencies coordinating the next generation of disaster assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 items-center">
               <Link to="/register" className="px-12 py-6 bg-[#00FFCC] text-black font-outfit font-black text-xl uppercase tracking-tighter hover:bg-white transition-all duration-500 shadow-[0_0_50px_rgba(0,255,204,0.3)]">
                 Initialize Access
               </Link>
               <Link to="/login" className="px-12 py-6 border border-white/10 hover:bg-white/5 text-white font-outfit font-black text-xl uppercase tracking-tighter transition-all">
                 Command Login
               </Link>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-8 border-t border-white/5 relative z-10">
         <div className="max-w-[1400px] mx-auto grid lg:grid-cols-4 gap-16">
            <div className="lg:col-span-1">
               <div className="flex items-center gap-4 mb-8">
                  <Shield className="w-8 h-8 text-[#00FFCC]" />
                  <span className="font-outfit font-black text-2xl tracking-tighter uppercase">CRISISCHAIN</span>
               </div>
               <p className="text-white/20 text-xs font-mono leading-relaxed uppercase tracking-widest">
                  Advancing humanitarian coordination through real-time geospatial intelligence and tactical interoperability.
               </p>
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { title: 'Intelligence', links: ['Map Explorer', 'Global Nodes', 'Live Feed'] },
                 { title: 'Resources', links: ['Agency List', 'Supply Chains', 'Deployment'] },
                 { title: 'Agency', links: ['Partners', 'Impact', 'Mission'] },
                 { title: 'Legal', links: ['Integrity', 'Privacy', 'Compliance'] }
               ].map(col => (
                 <div key={col.title} className="flex flex-col gap-6">
                    <span className="text-[10px] font-mono text-white tracking-widest uppercase">{col.title}</span>
                    <div className="flex flex-col gap-4">
                       {col.links.map(link => (
                         <button key={link} className="text-[10px] font-mono text-white/30 hover:text-[#00FFCC] transition-colors uppercase text-left">{link}</button>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div className="max-w-[1400px] mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8">
               <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest">© 2026 CRISISCHAIN_NET</span>
               <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" /> SYSTEM_ONLINE
               </span>
            </div>
            <div className="flex items-center gap-8">
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-[#00FFCC] cursor-pointer"><Globe className="w-4 h-4" /></div>
                  <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-[#00FFCC] cursor-pointer"><Target className="w-4 h-4" /></div>
               </div>
            </div>
         </div>
      </footer>

      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text { -webkit-text-stroke: 1px rgba(255,255,255,0.4); text-stroke: 1px rgba(255,255,255,0.4); color: transparent; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes radar-sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-radar-sweep { animation: radar-sweep 6s linear infinite; }
        @keyframes scan-y { 0% { transform: translateY(0); } 100% { transform: translateY(100%); } }
        .animate-scan-y { animation: scan-y 4s linear infinite; }
      `}} />
    </div>
  );
};

export default LandingPage;
