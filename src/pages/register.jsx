import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', rollNo: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate college email
    if (!form.email.endsWith('@bitsathy.ac.in')) {
      setError('Please use your college email (@bitsathy.ac.in)');
      return;
    }

    // Validate student email pattern (must have dot)
    const localPart = form.email.split('@')[0];
    if (!localPart.includes('.')) {
      setError('Invalid student email format. Use your college student email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://ocrs-backend-8fgs.onrender.com/api/auth/register-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', padding: 24,
      }}>
        <div style={{
          background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '48px 44px',
          width: '100%', maxWidth: 440,
          boxShadow: 'var(--shadow-lg)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Registration Successful!
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
            Your account has been created. Now login with your college Google account to access your dashboard.
          </p>
          <a href="http://localhost:5000/api/auth/google"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '12px 20px', borderRadius: 'var(--radius)',
              border: '1.5px solid var(--border)', background: 'var(--white)',
              color: 'var(--text)', fontSize: 14, fontWeight: 600,
              textDecoration: 'none', marginBottom: 12,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google" />
            Continue with College Google Account
          </a>
          <button onClick={() => navigate('/login')} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24, position: 'relative', overflow: 'hidden',
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
        borderRadius: 20, padding: '48px 44px',
        width: '100%', maxWidth: 440,
        boxShadow: 'var(--shadow-lg)',
        position: 'relative', zIndex: 1,
        animation: 'fadeUp 0.5s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, background: 'var(--accent)',
            borderRadius: 12, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 22,
          }}>📋</div>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700 }}>
              OCRS<span style={{ color: 'var(--accent)' }}>.</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.03em' }}>
              Online Compliance Reporting System
            </div>
          </div>
        </div>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          Student Registration
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 28 }}>
          Create your OCRS account using your college details
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Sachin S"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Register Number *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. 727623BCS123"
              value={form.rollNo}
              onChange={e => set('rollNo', e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">College Gmail *</label>
            <input
              className="form-input"
              type="email"
              placeholder="sachin.cs23@bitsathy.ac.in"
              value={form.email}
              onChange={e => set('email', e.target.value.toLowerCase())}
              required
            />
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              Must be your college email ending with @bitsathy.ac.in
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full"
            disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Registering...' : '🎓 Register Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 20 }}>
          Already registered?{' '}
          <span onClick={() => navigate('/login')}
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
            Sign in here
          </span>
        </p>
      </div>
    </div>
  );
}