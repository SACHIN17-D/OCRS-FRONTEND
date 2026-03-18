import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getPrincipalReports, confirmPrincipalMeeting } from '../../services/api';

export default function PrincipalDashboard() {
  const [data, setData] = useState({ reports: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await getPrincipalReports();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setConfirmLoading(true);
    try {
      await confirmPrincipalMeeting(selected._id, { meetingNotes });
      showAlert('Meeting confirmed! Admin can now approve the report. ✅');
      setSelected(null);
      setMeetingNotes('');
      fetchReports();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to confirm meeting.', 'error');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }} className="page-enter">

        {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ width: 40, height: 3, background: '#a78bfa', borderRadius: 2, marginBottom: 16 }} />
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, fontWeight: 700 }}>
            Principal Dashboard
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Students with 4th warning requiring principal meeting
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Pending Meetings', value: data.reports.filter(r => r.meetingStatus === 'pending').length, color: '#ef4444' },
            { label: 'Confirmed Meetings', value: data.reports.filter(r => r.meetingStatus === 'confirmed').length, color: '#22c55e' },
            { label: 'Total Students', value: data.students.length, color: '#a78bfa' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontFamily: 'DM Serif Display, serif', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Reports list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading...</div>
        ) : data.reports.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 56 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontFamily: 'DM Serif Display, serif', marginBottom: 6 }}>No pending meetings</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>No students have reached the 4th warning level!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.reports.map(report => {
              const student = data.students.find(s => s.rollNo === report.studentRollNo);
              return (
                <div key={report._id} className="card" style={{
                  borderLeft: `4px solid ${report.meetingStatus === 'confirmed' ? '#22c55e' : '#7c3aed'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, color: '#a78bfa', fontSize: 14 }}>{report.reportId}</span>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: report.meetingStatus === 'confirmed' ? 'var(--green-light)' : 'rgba(124,58,237,0.1)',
                          color: report.meetingStatus === 'confirmed' ? 'var(--green)' : '#a78bfa',
                        }}>
                          {report.meetingStatus === 'confirmed' ? '✅ Meeting Done' : '⏳ Pending Meeting'}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                        {report.studentName} — {report.studentRollNo}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                        {report.category} · Dept: {student?.department} · {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
                        ⚠️ Warning Count: <strong style={{ color: '#7c3aed' }}>{student?.warningCount || 4}</strong>
                      </div>
                    </div>

                    {report.meetingStatus === 'pending' && (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => { setSelected(report); setMeetingNotes(''); }}>
                        ✅ Confirm Meeting
                      </button>
                    )}

                    {report.meetingStatus === 'confirmed' && (
                      <div style={{
                        padding: '8px 14px', borderRadius: 8,
                        background: 'var(--green-light)', color: 'var(--green)',
                        fontSize: 12, fontWeight: 600,
                      }}>
                        ✅ Confirmed
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg2)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 4 }}>
                      Incident Details
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text2)' }}>{report.details}</p>
                  </div>

                  {report.meetingNotes && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--green-light)', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 4 }}>
                        Meeting Notes
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text2)' }}>{report.meetingNotes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Confirm Meeting Modal */}
        {selected && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 24,
          }} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
            <div style={{
              background: 'var(--surface)', borderRadius: 16, padding: 32,
              width: '100%', maxWidth: 480,
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 700 }}>
                    ✅ Confirm Meeting
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>{selected.reportId} — {selected.studentName}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
              </div>

              <div style={{ padding: '12px 16px', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: 'var(--text2)' }}>
                💡 By confirming, you certify that <strong>{selected.studentName}</strong> has met with you in person regarding this disciplinary report.
              </div>

              <form onSubmit={handleConfirm}>
                <div className="form-group">
                  <label className="form-label">Meeting Notes (optional)</label>
                  <textarea className="form-input"
                    placeholder="Add notes about the meeting outcome..."
                    value={meetingNotes}
                    onChange={e => setMeetingNotes(e.target.value)}
                    style={{ minHeight: 100 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }}
                    onClick={() => setSelected(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success" style={{ flex: 1 }}
                    disabled={confirmLoading}>
                    {confirmLoading ? 'Confirming...' : '✅ Confirm Meeting Done'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}