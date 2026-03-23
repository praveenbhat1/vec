import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Zap,
  Map as MapIcon,
  BarChart3,
  Users,
  AlertTriangle,
  Activity,
  Target,
  FileText,
  Monitor,
} from "lucide-react";

const injectFonts = () => {
  if (!document.getElementById("crisischain-fonts")) {
    const style = document.createElement("style");
    style.id = "crisischain-fonts";
    style.innerHTML = `
      @import url("https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700&display=swap");

      .font-anton { font-family: "Anton", sans-serif; letter-spacing: 0.05em; }
      .font-inter { font-family: "Inter", sans-serif; }

      @keyframes radar-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes line-flow {
        to { stroke-dashoffset: -100; }
      }
      
      @keyframes pulse-expand {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(229, 57, 53, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(229, 57, 53, 0); }
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
    `;
    document.head.appendChild(style);
  }
};

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    injectFonts();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e2e] text-white font-inter overflow-x-hidden relative">
      {/* Dynamic Grid Background Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 h 80 v 80 h -80 Z' fill='none' stroke='%2300aaff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Top Navbar */}
      <nav className="fixed w-full z-50 top-0 border-b border-blue-900/40 bg-[#070a24]/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <Target className="h-7 w-7 text-[#e53935] drop-shadow-[0_0_8px_rgba(229,57,53,0.6)]" />
              <span className="text-2xl font-bold tracking-widest text-[#e53935]">
                CRISIS
                <span className="text-white font-black drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">
                  CHAIN
                </span>
              </span>
            </div>

            <div className="hidden md:flex space-x-4 items-center">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 rounded-full text-sm font-semibold text-white border border-white/40 hover:border-white/80 hover:bg-white/5 transition-all"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-2 rounded-full text-sm font-semibold text-white bg-[#e53935] hover:bg-red-500 shadow-[0_0_15px_rgba(229,57,53,0.4)] transition-all"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden flex items-center z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            {/* Left Column: Typography */}
            <div className="flex-1 w-full flex flex-col items-start space-y-6 z-20">
              <div className="inline-block px-3 py-1 rounded border border-[#e53935]/40 bg-[#e53935]/10">
                <span className="text-xs font-bold tracking-[0.2em] text-[#e53935] uppercase drop-shadow-md">
                  CRISISCHAIN
                </span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-anton text-white leading-[1.05] uppercase drop-shadow-2xl">
                COORDINATING <br /> HOPE <br /> IN REAL-TIME
              </h1>

              <p className="max-w-lg text-sm md:text-base text-slate-300 font-medium tracking-[0.2em] uppercase leading-relaxed opacity-80">
                BRIDGING THE GAP BETWEEN VICTIMS AND RESPONDERS
              </p>
            </div>

            {/* Right Column: Interactive Map Visualization */}
            <div className="flex-1 w-full relative h-[500px] lg:h-[600px] bg-[#070a24]/80 backdrop-blur-md rounded-2xl border border-[#00aaff]/20 shadow-[0_0_40px_rgba(0,170,255,0.1)] overflow-hidden">
              {/* Radar Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,170,255,0.1)_0%,transparent_70%)] pointer-events-none"></div>

              {/* Radar Rings */}
              <div className="absolute top-[50%] left-[50%] flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <div className="absolute w-40 h-40 rounded-full border border-[#00aaff]/30 border-t-[#00aaff] animate-[radar-spin_3s_linear_infinite]"></div>
                <div className="absolute w-80 h-80 rounded-full border border-[#00aaff]/10 border-b-[#00aaff]/50 animate-[radar-spin_6s_linear_infinite_reverse]"></div>
                <div className="w-2 h-2 bg-[#00aaff] rounded-full shadow-[0_0_20px_#00aaff]"></div>
              </div>

              {/* Animated Connection Lines representing logistics/supply/data flow */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="w-full h-full"
                >
                  <path
                    d="M40,60 Q60,40 80,50"
                    fill="none"
                    stroke="#00aaff"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                  <path
                    d="M40,60 Q30,70 15,65"
                    fill="none"
                    stroke="#00aaff"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />

                  <path
                    d="M40,60 Q60,40 80,50"
                    fill="none"
                    stroke="#00aaff"
                    strokeWidth="1"
                    strokeDasharray="15 85"
                    className="animate-[line-flow_3s_linear_infinite]"
                  />
                  <path
                    d="M40,60 Q30,70 15,65"
                    fill="none"
                    stroke="#00aaff"
                    strokeWidth="1"
                    strokeDasharray="15 85"
                    className="animate-[line-flow_4s_linear_infinite]"
                  />

                  <circle
                    r="1.5"
                    fill="#fff"
                    filter="drop-shadow(0 0 5px #00aaff)"
                  >
                    <animateMotion
                      dur="3s"
                      repeatCount="indefinite"
                      path="M40,60 Q60,40 80,50"
                    />
                  </circle>
                  <circle
                    r="1.5"
                    fill="#fff"
                    filter="drop-shadow(0 0 5px #00aaff)"
                  >
                    <animateMotion
                      dur="4s"
                      repeatCount="indefinite"
                      path="M40,60 Q30,70 15,65"
                    />
                  </circle>
                </svg>
              </div>

              {/* Map Incident Markers */}
              <div className="absolute top-[40%] left-[80%] flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-4 h-4 bg-[#e53935] rounded-full animate-[pulse-expand_1.5s_infinite]"></div>
                <div className="mt-1 bg-black/60 border border-[#e53935]/50 text-[#e53935] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider backdrop-blur-sm">
                  Disaster
                </div>
              </div>

              <div className="absolute top-[65%] left-[20%] flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-3 h-3 bg-[#e53935] rounded-full animate-[pulse-expand_2s_infinite_0.5s]"></div>
                <div className="mt-1 bg-black/60 border border-[#e53935]/50 text-[#e53935] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider backdrop-blur-sm">
                  Accident
                </div>
              </div>

              {/* Floating Stat Widget - Bottom Left */}
              <div className="absolute bottom-6 left-6 z-30 bg-[#070a24]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 w-64 shadow-2xl animate-[float_4s_ease-in-out_infinite_alternate]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#e53935] rounded-full animate-ping"></div>
                    Active Incidents
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-red-900/40 px-2 py-0.5 rounded border border-[#e53935]/30">
                      <div className="w-1.5 h-1.5 bg-[#e53935] rounded-full"></div>
                      <span className="text-[#e53935] font-bold text-sm">
                        20
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded border border-white/10">
                      <span className="text-slate-400 text-xs font-bold">
                        X
                      </span>
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                  </div>
                </div>

                {/* Mini Graph bars */}
                <div className="flex items-end gap-1 h-8 mb-4">
                  {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
                    <div
                      key={i}
                      className={`w-full rounded-t-sm transition-all ${i % 2 === 0 ? "bg-[#00aaff]" : "bg-[#e53935]"}`}
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Resources Deployed</span>
                    <span className="text-[#00aaff] text-xs">20+</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">NGOs Connected</span>
                    <span className="text-white text-xs">5+</span>
                  </div>
                </div>
              </div>

              {/* Floating Sparkline Graph - Top Right */}
              <div className="absolute top-6 right-6 z-30 bg-[#070a24]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 w-48 shadow-2xl animate-[float_5s_ease-in-out_infinite_alternate-reverse]">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Activity className="w-3 h-3 text-[#00aaff]" />
                  Active Incidents
                </span>

                {/* SVG Graph Curve */}
                <svg
                  className="w-full h-12"
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,40 L0,30 Q10,20 20,25 T40,15 T60,20 T80,5 T100,10 L100,40 Z"
                    fill="rgba(0,170,255,0.15)"
                  />
                  <path
                    d="M0,30 Q10,20 20,25 T40,15 T60,20 T80,5 T100,10"
                    fill="none"
                    stroke="#00aaff"
                    strokeWidth="2"
                  />
                </svg>
                <div className="flex justify-between mt-1 px-1">
                  <span className="text-[8px] text-slate-500 font-bold">
                    JAN
                  </span>
                  <span className="text-[8px] text-slate-500 font-bold">
                    SEP
                  </span>
                </div>
              </div>

              {/* Main Call to Action Button right over the map */}
              <button
                onClick={() => navigate("/report")}
                className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 group hover:scale-105 transition-all"
              >
                <div className="absolute -inset-2 bg-[#e53935] rounded-full blur opacity-40 group-hover:opacity-80 transition duration-300"></div>
                <div className="relative px-8 py-4 bg-[#e53935] rounded-full flex items-center gap-3 border border-red-400/30 shadow-[0_0_20px_rgba(229,57,53,0.5)]">
                  <AlertTriangle className="w-6 h-6 text-white" />
                  <span className="text-sm font-bold text-white uppercase tracking-widest">
                    Report Emergency
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Information Banner */}
      <section className="py-16 relative z-10 w-full bg-[#0a0e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#070a24] border border-[#00aaff]/10 rounded-2xl p-8 hover:-translate-y-1 transition-transform relative overflow-hidden group shadow-lg">
              <div className="absolute right-[-10%] top-[-10%] opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText className="w-40 h-40 text-white" />
              </div>
              <h3 className="text-xl font-anton text-white uppercase tracking-wider mt-4 mb-3 relative z-10">
                INSTANT REPORTING
              </h3>
              <p className="text-slate-400 text-sm font-medium relative z-10 leading-relaxed">
                Submit emergency signals seamlessly. Our intelligent platform
                immediately routes crucial information to the nearest accessible
                responders.
              </p>
            </div>

            <div className="bg-[#070a24] border border-[#00aaff]/10 rounded-2xl p-8 hover:-translate-y-1 transition-transform relative overflow-hidden group shadow-lg">
              <div className="absolute right-[-10%] top-[-10%] opacity-5 group-hover:opacity-10 transition-opacity">
                <Monitor className="w-40 h-40 text-white" />
              </div>
              <h3 className="text-xl font-anton text-white uppercase tracking-wider mt-4 mb-3 relative z-10">
                REAL-TIME VISUALIZATION
              </h3>
              <p className="text-slate-400 text-sm font-medium relative z-10 leading-relaxed">
                Monitor the unfolding situation on a dynamic map that reflects
                active ground truth.
              </p>
            </div>

            <div className="bg-[#070a24] border border-[#00aaff]/10 rounded-2xl p-8 hover:-translate-y-1 transition-transform relative overflow-hidden group shadow-lg">
              <div className="absolute right-[-10%] top-[-10%] opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-40 h-40 text-white" />
              </div>
              <h3 className="text-xl font-anton text-white uppercase tracking-wider mt-4 mb-3 relative z-10">
                EFFICIENT ALLOCATION
              </h3>
              <p className="text-slate-400 text-sm font-medium relative z-10 leading-relaxed">
                Intelligent dispatching system optimizing resource allocation to
                where it's needed most based on urgency.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
