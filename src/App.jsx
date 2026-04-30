import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider, useDashboard } from './context';
import ErrorBoundary from './components/ErrorBoundary';
import { RoleGuard, ProtectedRoute } from './components/RoleGuard';

// Standard Imports for Instant Transitions
import LandingPage from './pages/LandingPage';
import DashboardMain from './DashboardMain';
import ResourceInventory from './pages/ResourceInventory';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ReportIncident from './pages/ReportIncident';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';

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
    <ErrorBoundary>
      <Router>
        <DashboardProvider>
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              {/* ── PUBLIC ROUTES ── */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<SignUpPage />} />
              
              {/* ── AUTHENTICATED (any role) ── */}
              <Route path="/report" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />

              {/* ── ROLE-PROTECTED ROUTES ── */}
              {/* official + admin */}
              <Route path="/dashboard" element={<RoleGuard path="/dashboard"><DashboardMain /></RoleGuard>} />
              <Route path="/alerts"    element={<RoleGuard path="/alerts"><Alerts /></RoleGuard>} />

              {/* admin only */}
              <Route path="/resources" element={<RoleGuard path="/resources"><ResourceInventory /></RoleGuard>} />
              <Route path="/analytics" element={<RoleGuard path="/analytics"><Analytics /></RoleGuard>} />
              <Route path="/settings"  element={<RoleGuard path="/settings"><Settings /></RoleGuard>} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </DashboardProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
