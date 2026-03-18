import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import StatusTracker from '../../components/StatusTracker';
import { getMyReports, uploadEvidence, submitAppeal, getMe } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [preview, setPreview] = useState(null);
  const [appealModal, setAppealModal] = useState(null);
  const [appealMessage, setAppealMessage] = useState('');
  const [appealAction, setAppealAction] = useState('appeal');
  const [appealLoading, setAppealLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await getMyReports();
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchStudentInfo = async () => {
    try {
      const res = await getMe();
      setStudentInfo(res.data); // directly the user object now
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    fetchStudentInfo();
    fetchReports();
  }, []);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!proofImage) { showAlert('Please select an image', 'error'); return; }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', proofImage);
      formData.append('explanation', explanation);
      await uploadEvidence(selected._id, formData);
      showAlert('Proof submitted successfully! Admin will review shortly.');
      setSelected(null);
      setProofImage(null);
      setPreview(null);
      setExplanation('');
      fetchReports();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAppeal = async (e) => {
    e.preventDefault();
    setAppealLoading(true);
    try {
      await submitAppeal(appealModal._id, { appealMessage, action: appealAction });
      showAlert('Appeal submitted! Admin will review again.');
      setAppealModal(null);
      setAppealMessage('');
      fetchReports();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Appeal failed.', 'error');
    } finally {
      setAppealLoading(false);
    }
  };

  const warningConfig = {
    watch: { label: 'Under Watch', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', icon: '🟡' },
    risk: { label: 'At Risk', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.3)', icon: '🟠' },
    hod_review: { label: 'HOD Review Required', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', icon: '🔴' },
    principal_review: { label: 'Principal Review Required', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.3)', icon: '⚫' },
  };

  const pendingCount = reports.filter(r => r.status === 'reported').length;
  const rejectedCount = reports.filter(r => r.status === 'rejected').length;
  const warningLevel = studentInfo?.warningLevel;
  const warningCount = studentInfo?.warningCount || 0;
  const wConfig = warningConfig[warningLevel];

  return (
    <div>
      <Navbar />
      <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">

        {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, fontWeight: 700 }}>My Reports</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              Roll No: <strong style={{ color: '#00d2ff' }}>{user?.rollNo}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {pendingCount > 0 && (
              <div style={{
                padding: '10px 16px', background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10,
                fontSize: 13, color: '#f59e0b', fontWeight: 500,
              }}>
                ⚠️ {pendingCount} need{pendingCount === 1 ? 's' : ''} proof
              </div>
            )}
            {rejectedCount > 0 && (
              <div style={{
                padding: '10px 16px', background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
                fontSize: 13, color: '#ef4444', fontWeight: 500,
              }}>
                ❌ {rejectedCount} rejected
              </div>
            )}
          </div>
        </div>

        {/* Warning Level Card */}
        {warningCount > 0 && wConfig && (
          <div style={{
            marginBottom: 24, padding: '16px 20px', borderRadius: 12,
            border: `1px solid ${wConfig.border}`,
            background: wConfig.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>{wConfig.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e8f4ff' }}>
                  Warning Level: {wConfig.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                  You have {warningCount} active warning{warningCount > 1 ? 's' : ''}.
                  {warningLevel === 'hod_review' && ' You must meet your HOD in person.'}
                  {warningLevel === 'principal_review' && ' You must meet the Principal in person.'}
                  {warningLevel === 'watch' && ' Please follow college rules to avoid further warnings.'}
                  {warningLevel === 'risk' && ' You are at risk of escalation. Please take this seriously.'}
                </div>
              </div>
            </div>
            <div style={{
              fontSize: 32, fontWeight: 700, color: wConfig.color,
              fontFamily: 'DM Serif Display, serif',
            }}>
              {warningCount}
            </div>
          </div>
        )}

        {/* Reports list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading your reports...</div>
        ) : reports.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 56 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontFamily: 'DM Serif Display, serif', marginBottom: 6 }}>No reports filed against you</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Keep following the college rules and regulations!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reports.map(report => (
              <div key={report._id} className="card" style={{
                borderLeft: `4px solid ${
                  report.status === 'resolved' ? 'var(--green)' :
                  report.status === 'rejected' ? '#ef4444' :
                  report.status === 'reported' ? '#f59e0b' : '#3b82f6'
                }`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: '#00d2ff', fontSize: 14 }}>{report.reportId}</span>
                      <span className={`badge badge-${report.severity}`}>{report.severity}</span>
                      <span className={`badge badge-${report.status}`}>{report.status.replace(/_/g, ' ')}</span>
                      {report.appealStatus && report.appealStatus !== 'none' && (
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 999,
                          background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                          border: '1px solid rgba(245,158,11,0.2)', fontWeight: 600,
                        }}>
                          {report.appealStatus === 'resubmitted' ? '📎 Re-submitted' : '✍️ Appealed'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                      {report.category} · {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {(report.status === 'reported' || (report.status === 'under_review' && report.appealStatus === 'resubmitted')) && (
                    <button className="btn btn-primary btn-sm"
                      onClick={() => { setSelected(report); setPreview(null); setExplanation(''); setProofImage(null); }}>
                      📎 {report.appealStatus === 'resubmitted' ? 'Upload New Proof' : 'Upload Proof'}
                    </button>
                  )}
                </div>

                <StatusTracker status={report.status} />

                <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 4 }}>Incident Description</div>
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{report.details}</p>
                </div>

                {report.adminComment && (
                  <div style={{ marginTop: 10, padding: '10px 14px', background: report.status === 'resolved' ? 'var(--green-light)' : 'var(--red-light)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 4 }}>Admin Comment</div>
                    <p style={{ fontSize: 13, color: 'var(--text2)' }}>{report.adminComment}</p>
                  </div>
                )}

                {report.status === 'rejected' && (
                  <div style={{
                    marginTop: 14, padding: '14px 16px',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10, fontWeight: 500 }}>
                      ⚠️ Your proof was rejected. You can appeal or re-submit better proof.
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
                        onClick={() => { setAppealAction('appeal'); setAppealModal(report); setAppealMessage(''); }}>
                        ✍️ Write Appeal
                      </button>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                        onClick={() => { setAppealAction('resubmit'); setAppealModal(report); setAppealMessage(''); }}>
                        📎 Re-submit Proof
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload proof modal */}
        {selected && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 24,
          }} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
            <div style={{
              background: 'var(--surface)', borderRadius: 16, padding: 32,
              width: '100%', maxWidth: 500,
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 700 }}>Submit Proof</h2>
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>{selected.reportId}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
              </div>

              <form onSubmit={handleProofSubmit}>
                <div className="form-group">
                  <label className="form-label">Proof Image *</label>
                  <label style={{
                    display: 'block', border: '2px dashed var(--border)',
                    borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer',
                    background: preview ? 'transparent' : 'var(--bg2)',
                  }}>
                    {preview ? (
                      <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Click to upload image proof</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>JPG, PNG up to 10MB</div>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                  {preview && (
                    <button type="button" onClick={() => { setProofImage(null); setPreview(null); }}
                      style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: 6 }}>
                      Remove image
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Your Explanation *</label>
                  <textarea className="form-input" placeholder="Explain your side of the incident..."
                    value={explanation} onChange={e => setExplanation(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelected(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploadLoading}>
                    {uploadLoading ? 'Uploading...' : '📎 Submit Proof'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Appeal Modal */}
        {appealModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 24,
          }} onClick={e => { if (e.target === e.currentTarget) setAppealModal(null); }}>
            <div style={{
              background: 'var(--surface)', borderRadius: 16, padding: 32,
              width: '100%', maxWidth: 500,
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 700 }}>
                    {appealAction === 'appeal' ? '✍️ Write Appeal' : '📎 Re-submit Proof'}
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>{appealModal.reportId}</p>
                </div>
                <button onClick={() => setAppealModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <button onClick={() => setAppealAction('appeal')} style={{
                  flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${appealAction === 'appeal' ? '#00d2ff' : 'var(--border)'}`,
                  background: appealAction === 'appeal' ? 'rgba(0,210,255,0.1)' : 'transparent',
                  color: appealAction === 'appeal' ? '#00d2ff' : 'var(--muted)',
                }}>✍️ Write Appeal</button>
                <button onClick={() => setAppealAction('resubmit')} style={{
                  flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${appealAction === 'resubmit' ? '#00d2ff' : 'var(--border)'}`,
                  background: appealAction === 'resubmit' ? 'rgba(0,210,255,0.1)' : 'transparent',
                  color: appealAction === 'resubmit' ? '#00d2ff' : 'var(--muted)',
                }}>📎 Re-submit Proof</button>
              </div>

              <form onSubmit={handleAppeal}>
                <div className="form-group">
                  <label className="form-label">
                    {appealAction === 'appeal' ? 'Your Appeal Message *' : 'Explain your new proof *'}
                  </label>
                  <textarea className="form-input"
                    placeholder={appealAction === 'appeal'
                      ? 'Explain why you disagree with the rejection...'
                      : 'Explain what new proof you are providing...'}
                    value={appealMessage}
                    onChange={e => setAppealMessage(e.target.value)}
                    style={{ minHeight: 120 }}
                    required />
                </div>

                {appealAction === 'resubmit' && (
                  <div style={{ padding: '10px 14px', background: 'rgba(0,210,255,0.05)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.2)', borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
                    💡 After submitting, use the Upload Proof button to attach your new image.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }}
                    onClick={() => setAppealModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}
                    disabled={appealLoading}>
                    {appealLoading ? 'Submitting...' : '🚀 Submit'}
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