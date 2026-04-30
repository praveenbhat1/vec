import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08080A] text-[#E5E5E7] flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#14171F] border border-red-500/30 p-8 rounded-sm text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-outfit font-black tracking-widest uppercase mb-4 text-white">System Fault</h1>
            <p className="text-white/60 mb-8 font-mono text-sm leading-relaxed">
              The interface encountered an unexpected structural anomaly. This incident has been logged.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-mono font-bold uppercase tracking-widest border border-red-500/30 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Initialize Recovery
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-mono uppercase tracking-widest border border-white/10 transition-all"
              >
                <Home className="w-4 h-4" /> Return to Base
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
