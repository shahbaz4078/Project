import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, Lock } from 'lucide-react';
import { useAuth, roleRoute } from '../context/AuthContext.jsx';

/**
 * Wraps a page so that only authenticated users whose role matches
 * `allowedRole` can see it.
 *
 * - Not logged in  → redirect to /login?from=<current path>
 * - Wrong role     → styled Access Denied page with a link to their dashboard
 * - admin          → always allowed (bypass)
 * - Correct role   → render children
 */
export default function ProtectedRoute({ allowedRole, children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Not logged in at all
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?from=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // 2. Admin bypasses all role checks
  if (user.role === 'admin') {
    return children;
  }

  // 3. Role mismatch
  if (allowedRole && user.role !== allowedRole) {
    const userDash = roleRoute(user.role);
    const roleLabel = {
      farmer: 'Farmer',
      processor: 'Distributor',
      retailer: 'Retailer',
      consumer: 'Consumer',
    }[user.role] || user.role;

    return (
      <div className="access-denied-page">
        <div className="access-denied-card">
          {/* Icon */}
          <div className="ad-icon-wrap">
            <ShieldX size={48} strokeWidth={1.5} />
          </div>

          {/* Status pill */}
          <span className="ad-pill">403 — Access Denied</span>

          <h1 className="ad-title">Wrong Dashboard</h1>
          <p className="ad-body">
            You are signed in as a <strong>{roleLabel}</strong>. This page is
            reserved for a different role.
          </p>

          {/* CTA buttons */}
          <div className="ad-actions">
            <Link to={userDash} className="ad-btn ad-btn-primary">
              <ArrowLeft size={16} />
              Go to my dashboard
            </Link>
            <Link to="/" className="ad-btn ad-btn-ghost">
              Home
            </Link>
          </div>

          {/* Lock decoration */}
          <div className="ad-lock-deco">
            <Lock size={96} strokeWidth={0.6} />
          </div>
        </div>

        <style>{`
          .access-denied-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            background: radial-gradient(ellipse at 60% 0%, rgba(239,68,68,.08) 0%, transparent 60%),
                        radial-gradient(ellipse at 20% 100%, rgba(99,102,241,.06) 0%, transparent 55%),
                        #0f172a;
          }

          .access-denied-card {
            position: relative;
            overflow: hidden;
            max-width: 480px;
            width: 100%;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.09);
            border-radius: 24px;
            padding: 3rem 2.5rem;
            text-align: center;
            backdrop-filter: blur(20px);
            box-shadow:
              0 0 0 1px rgba(239,68,68,.15),
              0 32px 64px rgba(0,0,0,.4);
          }

          .ad-icon-wrap {
            width: 88px;
            height: 88px;
            border-radius: 24px;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(239,68,68,.25), rgba(239,68,68,.08));
            border: 1px solid rgba(239,68,68,.3);
            color: #f87171;
            box-shadow: 0 8px 32px rgba(239,68,68,.2);
          }

          .ad-pill {
            display: inline-block;
            padding: 0.3rem 0.85rem;
            border-radius: 20px;
            background: rgba(239,68,68,.15);
            border: 1px solid rgba(239,68,68,.3);
            color: #f87171;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            margin-bottom: 1.25rem;
          }

          .ad-title {
            font-size: 2rem;
            font-weight: 800;
            color: #f1f5f9;
            margin: 0 0 .75rem;
            letter-spacing: -.02em;
          }

          .ad-body {
            color: #94a3b8;
            font-size: 1rem;
            line-height: 1.6;
            margin: 0 0 2rem;
          }

          .ad-body strong {
            color: #e2e8f0;
          }

          .ad-actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          .ad-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.65rem 1.4rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.9rem;
            text-decoration: none;
            transition: all 0.2s ease;
          }

          .ad-btn-primary {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: #fff;
            box-shadow: 0 4px 16px rgba(99,102,241,.35);
          }

          .ad-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(99,102,241,.45);
            color: #fff;
          }

          .ad-btn-ghost {
            background: rgba(255,255,255,.06);
            color: #94a3b8;
            border: 1px solid rgba(255,255,255,.1);
          }

          .ad-btn-ghost:hover {
            background: rgba(255,255,255,.1);
            color: #e2e8f0;
          }

          .ad-lock-deco {
            position: absolute;
            bottom: -32px;
            right: -32px;
            color: rgba(239,68,68,.04);
            pointer-events: none;
            transform: rotate(-15deg);
          }
        `}</style>
      </div>
    );
  }

  // 4. Correct role — render page
  return children;
}
