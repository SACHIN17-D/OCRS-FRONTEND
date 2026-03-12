import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { createReport } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Attendance', 'Behavior', 'Dress Code', 'Cheating', 'Property Damage', 'Harassment', 'Other'];
const SEVERITIES = [
  { key: 'low', label: '🟡 Low', desc: 'Minor violation' },
  { key: 'medium', label: '🟠 Medium', desc: 'Repeated or moderate' },
  { key: 'high', label: '🔴 High', desc: 'Serious misconduct' },
];

export default function ReporterDashboard() {
  const { user } = useAuth();
  const [form, setForm] = useState({ studentRollNo: '', category: '', severity: 'low', date: '', details: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createReport(form);
      setSubmitted(res.data);
      setForm({ studentRollNo: '', category: '', severity: 'low', date: '', details: '' });
      showAlert(`Report ${res.data.reportId} filed successfully!`);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to submit report', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '28px 32px', maxWidth: 700, margin: '0 auto' }} className="page-enter">

        {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

        {/* Success card */}
        {submitted && (
          <div className="card" style={{ marginBottom: 24, border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>✅</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--green)' }}>Report Filed Successfully</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
                  Report ID: <strong>{submitted.reportId}</strong> — The student will be notified and can now submit their proof.
                </div>
              </div>
              <button onClick={() => setSubmitted(null)} style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--muted)', fontSize: 18,
              }}>✕</button>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700 }}>File a Report</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Report a student misconduct incident. Be accurate and detailed.
          </p>
        </div>

        {/* Reporter info */}
        <div className="card" style={{ marginBottom: 20, padding: '14px 18px', background: 'var(--blue-light)', border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>📋</span>
            <div style={{ fontSize: 13 }}>
              Filing as <strong>{user?.name}</strong>
              {user?.department && <> · {user.department}</>}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

            <div className="form-group">
              <label className="form-label">Student Roll No. *</label>
              <input className="form-input" type="text" placeholder="e.g. CS2024001"
                value={form.studentRollNo} onChange={e => set('studentRollNo', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Incident Date *</label>
              <input className="form-input" type="date"
                value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)} required>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Severity *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {SEVERITIES.map(s => (
                  <button key={s.key} type="button" onClick={() => set('severity', s.key)} style={{
                    flex: 1, padding: '9px 6px', borderRadius: 8, cursor: 'pointer',
                    fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, fontWeight: 600,
                    border: `1.5px solid ${form.severity === s.key ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.severity === s.key ? 'var(--accent-light)' : 'var(--white)',
                    color: form.severity === s.key ? 'var(--accent)' : 'var(--muted)',
                    transition: 'all 0.15s', textAlign: 'center',
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Incident Details *</label>
              <textarea className="form-input" placeholder="Describe the incident clearly — what happened, where, when, and any witnesses..."
                value={form.details} onChange={e => set('details', e.target.value)}
                style={{ minHeight: 120 }} required />
            </div>
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-outline" onClick={() => setForm({ studentRollNo: '', category: '', severity: 'low', date: '', details: '' })}>
              Clear
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : '📋 Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
