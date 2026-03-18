import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import StatusTracker from '../../components/StatusTracker';
import { getAllReports, verifyReport } from '../../services/api';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [alert, setAlert] = useState(null);

  const MOCK_REPORTS = [
    { _id: '1', reportId: 'RPT-2024-001', studentName: 'John Student', studentRollNo: 'CS2024001', category: 'Attendance', severity: 'medium', status: 'proof_submitted', details: 'Student was absent for 3 consecutive days without prior notice or valid reason.', reporterName: 'Prof. Reporter', createdAt: new Date(), evidence: { explanation: 'I was sick and forgot to inform. Here is my medical certificate.' } },
    { _id: '2', reportId: 'RPT-2024-002', studentName: 'Jane Doe', studentRollNo: 'CS2024002', category: 'Dress Code', severity: 'low', status: 'reported', details: 'Student was not wearing the college ID card during campus hours.', reporterName: 'Prof. Reporter', createdAt: new Date() },
    { _id: '3', reportId: 'RPT-2024-003', studentName: 'Mike Smith', studentRollNo: 'CS2024003', category: 'Cheating', severity: 'high', status: 'resolved', details: 'Student was caught using unauthorized materials during the mid-semester examination.', reporterName: 'Prof. Reporter', createdAt: new Date(), adminComment: 'Verified. Disciplinary action has been taken.' },
    { _id: '4', reportId: 'RPT-2024-004', studentName: 'Sara Lee', studentRollNo: 'CS2024004', category: 'Behavior', severity: 'medium', status: 'under_review', details: 'Student was disruptive during lecture and refused to follow instructions.', reporterName: 'Prof. Reporter', createdAt: new Date() },
  ];

  const fetchReports = async () => {
    try {
      const res = await getAllReports();
      setReports(res.data);
    } catch (err) {
      // Use mock data if backend not available
      setReports(MOCK_REPORTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleVerify = async (decision) => {
    setActionLoading(true);
    try {
      const res = await verifyReport(selected._id, { decision, adminComment });
      if (res.data) {
        // Update the report in local state immediately
        setReports(prev => prev.map(r =>
          r._id === selected._id
            ? { ...r, status: decision === 'approve' ? 'resolved' : 'rejected', adminComment }
            : r
        ));
      }
      showAlert(`Report ${decision === 'approve' ? 'approved ✅' : 'rejected ❌'} successfully`);
      setSelected(null);
      setAdminComment('');
      fetchReports();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  const counts = {
    all: reports.length,
    reported: reports.filter(r => r.status === 'reported').length,
    proof_submitted: reports.filter(r => r.status === 'proof_submitted').length,
    under_review: reports.filter(r => r.status === 'under_review').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }} className="page-enter">

        {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Review and verify student conduct reports</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Reports', value: counts.all, color: 'var(--text)' },
            { label: 'Awaiting Proof', value: counts.reported, color: 'var(--accent)' },
            { label: 'Needs Review', value: counts.proof_submitted + counts.under_review, color: 'var(--amber)' },
            { label: 'Resolved', value: counts.resolved, color: 'var(--green)' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'reported', label: 'Reported' },
            { key: 'proof_submitted', label: 'Proof Submitted' },
            { key: 'under_review', label: 'Under Review' },
            { key: 'resolved', label: 'Resolved' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
              padding: '9px 16px', border: 'none', background: 'none',
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', color: filter === tab.key ? 'var(--accent)' : 'var(--muted)',
              borderBottom: `2px solid ${filter === tab.key ? 'var(--accent)' : 'transparent'}`,
              marginBottom: -1, transition: 'all 0.15s',
            }}>
              {tab.label} <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.7 }}>({counts[tab.key] ?? filtered.length})</span>
            </button>
          ))}
        </div>

        {/* Reports Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Loading reports...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
              No reports found
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Report ID', 'Student', 'Category', 'Severity', 'Date', 'Status', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: 'var(--muted)',
                      borderBottom: '1px solid var(--border)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(report => (
                  <tr key={report._id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                      {report.reportId}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{report.studentName || 'Unknown'}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{report.studentRollNo}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>{report.category}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${report.severity}`}>{report.severity}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text2)' }}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${report.status}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => { setSelected(report); setAdminComment(''); }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Modal */}
        {selected && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 24,
          }} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
            <div style={{
              background: 'var(--white)', borderRadius: 16, padding: 32,
              width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700 }}>
                    {selected.reportId}
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>Report Details</p>
                </div>
                <button onClick={() => setSelected(null)} style={{
                  background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)',
                }}>✕</button>
              </div>

              {/* Status tracker */}
              <div style={{ marginBottom: 24 }}>
                <StatusTracker status={selected.status} />
              </div>

              <hr className="divider" />

              {/* Report info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                {[
                  { label: 'Student', value: selected.studentName },
                  { label: 'Roll No.', value: selected.studentRollNo },
                  { label: 'Category', value: selected.category },
                  { label: 'Severity', value: selected.severity },
                  { label: 'Reported By', value: selected.reporterName },
                  { label: 'Date', value: new Date(selected.createdAt).toLocaleDateString() },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 6 }}>Incident Details</div>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, padding: '12px 14px', background: 'var(--bg)', borderRadius: 8 }}>{selected.details}</p>
              </div>

              {/* Evidence */}
              {selected.evidence && (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 8 }}>
      Student Proof
    </div>
    {selected.evidence.imageUrl && (
      <a href={selected.evidence.imageUrl} target="_blank" rel="noreferrer">
        <img src={selected.evidence.imageUrl} alt="Proof" style={{
          width: '100%', maxHeight: 400, objectFit: 'contain',
          borderRadius: 8, border: '1px solid var(--border)', marginBottom: 10,
          background: 'var(--bg)', cursor: 'pointer',
        }} />
      </a>
    )}
    <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 4 }}>
      Click image to view full size 🔍
    </div>
    {selected.evidence.explanation && (
      <p style={{ fontSize: 13, color: 'var(--text2)', padding: '10px 14px', background: 'var(--bg)', borderRadius: 8 }}>
        {selected.evidence.explanation}
      </p>
    )}
  </div>
)}
              {/* Appeal message */}
{selected.appealMessage && (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 6 }}>
      Student Appeal —{' '}
      <span style={{ color: selected.appealStatus === 'resubmitted' ? 'var(--blue)' : 'var(--amber)' }}>
        {selected.appealStatus === 'resubmitted' ? '📎 Re-submitted Proof' : '✍️ Written Appeal'}
      </span>
    </div>
    <p style={{ fontSize: 13, color: 'var(--text2)', padding: '12px 14px', background: 'var(--amber-light)', borderRadius: 8, border: '1px solid #fde68a' }}>
      {selected.appealMessage}
    </p>
  </div>
)}

              {/* Admin action */}
              {(selected.status === 'proof_submitted' || selected.status === 'under_review') && (
                <div>
                  <hr className="divider" />
                  <div className="form-group">
                    <label className="form-label">Admin Comment (optional)</label>
                    <textarea className="form-input" placeholder="Add a note about your decision..."
                      value={adminComment} onChange={e => setAdminComment(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-success" style={{ flex: 1 }}
                      disabled={actionLoading} onClick={() => handleVerify('approve')}>
                      ✅ Approve & Resolve
                    </button>
                    <button className="btn btn-danger" style={{ flex: 1 }}
                      disabled={actionLoading} onClick={() => handleVerify('rejected')}>
                      ❌ Reject Report
                    </button>
                  </div>
                </div>
              )}

              {selected.status === 'resolved' && (
                <div className="alert alert-success">This report has been resolved.</div>
              )}
              {selected.status === 'rejected' && (
                <div style={{ padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#6b7280' }}>
                  This report was rejected.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
