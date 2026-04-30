import { Navigate } from 'react-router-dom';
import { useDashboard } from '../context';
import { canAccessRoute, getDefaultRoute, getRoleLabel, getRoleColor } from '../lib/rbac';
import { ShieldOff, ArrowLeft, Lock } from 'lucide-react';

/**
 * RoleGuard — Route-level access control component.
 * 
 * Usage:
 *   <RoleGuard path="/dashboard"><DashboardMain /></RoleGuard>
 * 
 * Behavior:
 *   1. If not authenticated → redirect to /login
 *   2. If authenticated but wrong role → show Unauthorized page
 *   3. If authorized → render children
 */
export function RoleGuard({ path, children }) {
  const { user, profile, loading } = useDashboard();

  // While loading, allow the layout to render (don't block)
  if (loading) return children;

  // Not authenticated → login
  if (!user) {
    console.log(`RoleGuard: No session. Redirecting to /login from ${path}`);
    return <Navigate to="/login" replace />;
  }

  // Resolve role from profile (fallback to 'user' for safety)
  const role = profile?.role || 'user';

  // Check route access
  if (!canAccessRoute(role, path)) {
    console.log(`RoleGuard: Role '${role}' denied access to ${path}, redirecting to home.`);
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * ProtectedRoute — Simple auth-only guard (no role check).
 * Used for routes accessible to ANY authenticated user (e.g., /report).
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useDashboard();

  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * UnauthorizedPage — Displayed when a user's role doesn't permit access.
 * Maintains the existing tactical UI aesthetic.
 */
function UnauthorizedPage({ role, attemptedPath }) {
  const roleLabel = getRoleLabel(role);
  const roleColor = getRoleColor(role);
  const defaultRoute = getDefaultRoute(role);

  return (
    <div className="h-screen w-screen bg-[#08080A] flex items-center justify-center relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] opacity-[0.05] bg-red-600" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md text-center px-8">
        {/* Icon */}
        <div className="relative">
          <div className="w-24 h-24 bg-red-500/5 border border-red-500/20 flex items-center justify-center">
            <ShieldOff className="w-10 h-10 text-red-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="font-outfit text-4xl font-black tracking-tighter text-white uppercase">
            ACCESS<span className="text-red-500">://</span>DENIED
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Lock size={10} className="text-red-500" />
            <span className="font-mono text-[9px] font-bold tracking-[0.5em] text-red-500/60 uppercase">
              CLEARANCE INSUFFICIENT
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="w-full bg-white/[0.02] border border-white/5 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">YOUR_ROLE</span>
            <span className="font-mono text-[10px] font-black uppercase tracking-widest" style={{ color: roleColor }}>
              {roleLabel}
            </span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">ROUTE_REQ</span>
            <span className="font-mono text-[10px] font-black text-white/60 uppercase tracking-widest">
              {attemptedPath}
            </span>
          </div>
          <div className="h-px bg-white/5" />
          <p className="font-mono text-[9px] text-white/20 uppercase tracking-wider leading-relaxed">
            Your current authorization level does not permit access to this module.
            Contact system administrator for role elevation.
          </p>
        </div>

        {/* Action */}
        <a
          href={defaultRoute}
          className="group flex items-center gap-4 px-10 py-4 bg-white/5 border border-white/10 hover:border-red-500/30 transition-all duration-500"
        >
          <ArrowLeft size={14} className="text-white/40 group-hover:text-red-500 transition-colors" />
          <span className="font-mono text-[10px] font-black text-white/60 group-hover:text-white uppercase tracking-[0.3em] transition-colors">
            RETURN_TO_BASE
          </span>
        </a>
      </div>
    </div>
  );
}

export default RoleGuard;
