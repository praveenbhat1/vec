import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './context/DashboardContext';

// Dynamic Imports for Optimized Chunking
const LandingPage       = lazy(() => import('./pages/LandingPage'));
const DashboardMain     = lazy(() => import('./DashboardMain'));
const ResourceInventory = lazy(() => import('./pages/ResourceInventory'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const SignUpPage        = lazy(() => import('./pages/SignUpPage'));
const ReportIncident    = lazy(() => import('./pages/ReportIncident'));
const Alerts            = lazy(() => import('./pages/Alerts'));

function SuspenseFallback() {
  return (
    <div className="h-screen w-screen bg-[#08080A] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-t-2 border-[#00FFCC] rounded-full animate-spin" />
      <span className="font-mono text-[9px] text-[#00FFCC] animate-pulse uppercase tracking-[0.4em]">SYNCING_CORTEX...</span>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardProvider><DashboardMain /></DashboardProvider>} />
          <Route path="/resources" element={<DashboardProvider><ResourceInventory /></DashboardProvider>} />
          <Route path="/alerts"    element={<Alerts />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/report"   element={<ReportIncident />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
