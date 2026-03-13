import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get('error');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser({ email, password, role: 'admin' });
      login(res.data.user, res.data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute', top: -100, right: -100, width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(192,57,43,0.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -80, width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '44px 40px',
        width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)',
        position: 'relative', zIndex: 1,
        animation: 'fadeUp 0.5s ease',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, background: 'var(--accent)',
            borderRadius: 14, display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 24, marginBottom: 12,
          }}>📋</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700 }}>
            OCRS<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            Online Compliance Reporting System
          </div>
        </div>

        {/* OAuth error */}
        {oauthError === 'unauthorized' && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            ❌ Unauthorized email. Only college emails are allowed.
          </div>
        )}

        {/* Student & Faculty Section */}
        <div style={{
          background: 'var(--bg)', borderRadius: 12,
          padding: '18px 20px', marginBottom: 24,
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 4 }}>
            🎓 Students & 👨‍🏫 Faculty
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
            Use your college Google account to sign in
          </div>
          <a href="https://ocrs-backend-8fgs.onrender.com/api/auth/google"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '11px 20px', borderRadius: 'var(--radius)',
              border: '1.5px solid var(--border)', background: 'var(--white)',
              color: 'var(--text)', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.15s',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4285f4'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(66,133,244,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <img src="https://www.google.com/favicon.ico" width="16" height="16" alt="Google" />
            Continue with College Google Account
          </a>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <span
              onClick={() => navigate('/register')}
              style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
            >
              New student? Register here →
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Admin Login
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Admin login form */}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="admin@college.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full"
            disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Signing in...' : '🛡️ Sign in as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}