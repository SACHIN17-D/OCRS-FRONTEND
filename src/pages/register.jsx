import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEPARTMENTS = [
  'AGRI', 'AIDS', 'AIML', 'BM', 'BT',
  'CIVIL', 'CSBS', 'CSD', 'CSE', 'CT',
  'ECE', 'EEE', 'EIE', 'FD', 'FT',
  'ISE', 'IT', 'MECH', 'MTRS'
];

export default function Register() {
  const [form, setForm] = useState({ name: '', rollNo: '', email: '', department: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.endsWith('@bitsathy.ac.in')) {
      setError('Please use your college email (@bitsathy.ac.in)');
      return;
    }

    const localPart = form.email.split('@')[0];
    if (!localPart.includes('.')) {
      setError('Invalid student email format. Use your college student email.');
      return;
    }

    if (!form.department) {
      setError('Please select your department.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://ocrs-backend-8fgs.onrender.com'}/api/auth/register-student`, {
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
        background: 'var(--bg)', padding: 24, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 210, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 210, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px', pointerEvents: 'none',
        }} />
        <div style={{
          background: 'rgba(12, 31, 56, 0.85)',
          border: '1px solid rgba(0, 210, 255, 0.15)',
          borderRadius: 20, padding: '48px 44px',
          width: '100%', maxWidth: 440,
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          textAlign: 'center', position: 'relative', zIndex: 1,
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#e8f4ff' }}>
            Registration Successful!
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
            Your account has been created. Now login with your college Google account to access your dashboard.
          </p>
          <a href={`${process.env.REACT_APP_API_URL || 'https://ocrs-backend-8fgs.onrender.com'}/api/auth/google`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '12px 20px', borderRadius: 10,
              border: '1px solid rgba(0, 210, 255, 0.2)',
              background: 'rgba(0, 210, 255, 0.05)',
              color: '#e8f4ff', fontSize: 14, fontWeight: 600,
              textDecoration: 'none', marginBottom: 12,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google" />
            Continue with College Google Account
          </a>
          <button onClick={() => navigate('/login')} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
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
      background: 'var(--bg)', padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `
          radial-gradient(ellipse at 20% 20%, rgba(0, 210, 255, 0.07) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(0, 100, 255, 0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 210, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 210, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px', pointerEvents: 'none',
      }} />

      <div style={{
        background: 'rgba(12, 31, 56, 0.85)',
        border: '1px solid rgba(0, 210, 255, 0.15)',
        borderRadius: 20, padding: '48px 44px',
        width: '100%', maxWidth: 440,
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        position: 'relative', zIndex: 1,
        backdropFilter: 'blur(20px)',
        animation: 'fadeUp 0.5s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #00d2ff, #0066ff)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 4px 20px rgba(0, 210, 255, 0.3)',
          }}>📋</div>
          <div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 700, color: '#e8f4ff' }}>
              OCRS<span style={{ color: '#00d2ff' }}>.</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              Online Compliance Reporting System
            </div>
          </div>
        </div>

        <div style={{ width: 40, height: 3, background: '#00d2ff', borderRadius: 2, marginBottom: 16 }} />
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, fontWeight: 700, marginBottom: 6, color: '#e8f4ff' }}>
          Student Registration
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 28 }}>
          Create your OCRS account using your college details
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" type="text" placeholder="e.g. Sachin S"
              value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Register Number *</label>
            <input className="form-input" type="text" placeholder="e.g. 727623BCS123"
              value={form.rollNo} onChange={e => set('rollNo', e.target.value.toUpperCase())} required />
          </div>

          <div className="form-group">
            <label className="form-label">Department *</label>
            <select className="form-input" value={form.department}
              onChange={e => set('department', e.target.value)} required>
              <option value="">Select your department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">College Gmail *</label>
            <input className="form-input" type="email" placeholder="sachin.cs23@bitsathy.ac.in"
              value={form.email} onChange={e => set('email', e.target.value.toLowerCase())} required />
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
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
            style={{ color: '#00d2ff', cursor: 'pointer', fontWeight: 600 }}>
            Sign in here
          </span>
        </p>
      </div>
    </div>
  );
}