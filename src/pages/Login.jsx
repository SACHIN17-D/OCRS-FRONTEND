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
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `
          radial-gradient(ellipse at 15% 50%, rgba(245,197,24,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 85% 20%, rgba(59,130,246,0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(245,197,24,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(245,197,24,0.03) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 80px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #ff6419, #e6a800)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 4px 20px rgba(245,197,24,0.3)',
          }}>📋</div>
          <div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, fontWeight: 700, color: '#f0f4ff' }}>
              OCRS<span style={{ color: '#ff6419' }}>.</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Online Compliance Reporting
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 480 }}>
          <div style={{ width: 40, height: 3, background: '#ff6419', borderRadius: 2, marginBottom: 24 }} />
          <h1 style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: 48, fontWeight: 700, lineHeight: 1.1,
            color: '#f0f4ff', marginBottom: 16,
          }}>
            Welcome<br />
            <span style={{ color: '#ff6419' }}>Back.</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.7, maxWidth: 380 }}>
            BITSathy's disciplinary management portal for transparent and fair student compliance reporting.
          </p>

          <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
            {[
              { icon: '🎓', label: 'Students', desc: 'Track reports' },
              { icon: '👨‍🏫', label: 'Faculty', desc: 'File reports' },
              { icon: '🛡️', label: 'Admin', desc: 'Manage cases' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f4ff' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: 480, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 40,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: '100%', maxWidth: 400,
          background: 'rgba(26, 35, 64, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(245,197,24,0.15)',
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          animation: 'fadeUp 0.5s ease',
        }}>
          <h2 style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: 24, fontWeight: 700, marginBottom: 6,
          }}>Sign In</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 28 }}>
            Access your OCRS portal
          </p>

          {oauthError === 'unauthorized' && (
            <div className="alert alert-error">❌ Unauthorized email. Only college emails allowed.</div>
          )}

          {/* Google login */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(245,197,24,0.12)',
            borderRadius: 12, padding: '16px 18px', marginBottom: 24,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🎓 Students & 👨‍🏫 Faculty
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
              Use your college Google account
            </div>
            <a href={`${process.env.REACT_APP_API_URL || 'https://ocrs-backend-8fgs.onrender.com'}/api/auth/google`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '11px 20px', borderRadius: 10,
                border: '1px solid rgba(245,197,24,0.2)',
                background: 'rgba(245,197,24,0.05)',
                color: '#f0f4ff', fontSize: 13, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.15s',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff6419'; e.currentTarget.style.background = 'rgba(245,197,24,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,197,24,0.2)'; e.currentTarget.style.background = 'rgba(245,197,24,0.05)'; }}
            >
              <img src="https://www.google.com/favicon.ico" width="16" height="16" alt="Google" />
              Continue with College Google Account
            </a>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <span onClick={() => navigate('/register')} style={{
                fontSize: 12, color: '#ff6419', cursor: 'pointer', fontWeight: 600,
              }}>
                New student? Register here →
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(245,197,24,0.1)' }} />
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Only</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(245,197,24,0.1)' }} />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="admin@college.edu"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full"
              disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Signing in...' : '🛡️ Sign in as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}