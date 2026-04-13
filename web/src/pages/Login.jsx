import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, roleRoute } from '../context/AuthContext.jsx';
import { LogIn, UserPlus, Leaf, Truck, Store, Users, Eye, EyeOff } from 'lucide-react';

/** Visual role cards shown in the Register form */
const ROLES = [
  {
    value: 'farmer',
    label: 'Farmer',
    description: 'Register & manage crops',
    Icon: Leaf,
    color: '#16a34a',
    bg: 'rgba(22,163,74,.12)',
    border: 'rgba(22,163,74,.35)',
  },
  {
    value: 'processor',
    label: 'Distributor',
    description: 'Ship & track logistics',
    Icon: Truck,
    color: '#2563eb',
    bg: 'rgba(37,99,235,.12)',
    border: 'rgba(37,99,235,.35)',
  },
  {
    value: 'retailer',
    label: 'Retailer',
    description: 'Manage store inventory',
    Icon: Store,
    color: '#0891b2',
    bg: 'rgba(8,145,178,.12)',
    border: 'rgba(8,145,178,.35)',
  },
  {
    value: 'consumer',
    label: 'Consumer',
    description: 'Browse & verify products',
    Icon: Users,
    color: '#d97706',
    bg: 'rgba(217,119,6,.12)',
    border: 'rgba(217,119,6,.35)',
  },
];

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (mode === 'login') {
        data = await login(email, password);
      } else {
        data = await register({ email, password, name, role: selectedRole });
      }

      // After auth: honour ?from= param if present, otherwise go to role dashboard
      const from = searchParams.get('from');
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        navigate(roleRoute(data.user.role), { replace: true });
      }
    } catch (err) {
      const d = err.response?.data;
      const msg =
        (typeof d?.error === 'string' && d.error) ||
        (d?.details?.formErrors && JSON.stringify(d.details.formErrors)) ||
        err.message ||
        'Request failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bs-body-bg, #f0f8f0)' }}>
      <div style={{ width: '100%', maxWidth: mode === 'register' ? 560 : 440 }}>

        {/* Card */}
        <div className="card shadow-sm">
          <div className="card-body p-4">

            {/* Mode toggle */}
            <div className="btn-group w-100 mb-4" role="group">
              <button
                type="button"
                className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setMode('login')}
              >
                <LogIn size={15} className="me-1" />
                Sign in
              </button>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setMode('register')}
              >
                <UserPlus size={15} className="me-1" />
                Create account
              </button>
            </div>

            <h1 className="h4 mb-1 text-center">
              {mode === 'login' ? 'Welcome back' : 'Join the network'}
            </h1>
            <p className="text-muted small text-center mb-4">
              {mode === 'login'
                ? 'Sign in to access your dashboard'
                : 'Choose your role and get started'}
            </p>

            <form onSubmit={submit}>
              {/* Name — register only */}
              {mode === 'register' && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Full name</label>
                  <input
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary d-flex align-items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Role picker — register only */}
              {mode === 'register' && (
                <div className="mb-4">
                  <label className="form-label fw-semibold">I am a…</label>
                  <div className="row g-2">
                    {ROLES.map(({ value, label, description, Icon, color, bg, border }) => {
                      const active = selectedRole === value;
                      return (
                        <div key={value} className="col-6">
                          <button
                            type="button"
                            onClick={() => setSelectedRole(value)}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: `2px solid ${active ? border : 'transparent'}`,
                              borderRadius: 12,
                              background: active ? bg : 'rgba(0,0,0,.03)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              textAlign: 'left',
                              outline: 'none',
                            }}
                            id={`role-${value}`}
                            aria-pressed={active}
                          >
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <Icon size={16} style={{ color }} />
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: active ? color : 'inherit' }}>
                                {label}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.73rem', color: '#6b7280' }}>
                              {description}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <button type="submit" className="btn btn-success w-100" disabled={loading}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <p className="text-center mt-3 mb-0 small">
              <Link to="/">← Back to home</Link>
            </p>
          </div>
        </div>

        {/* Hint */}
        <p className="text-center text-muted small mt-3">
          {mode === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            className="btn btn-link btn-sm p-0 text-decoration-none"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
