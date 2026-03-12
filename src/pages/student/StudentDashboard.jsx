import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import StatusTracker from '../../components/StatusTracker';
import { getMyReports, uploadEvidence, submitAppeal } from '../../services/api';
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

  useEffect(() => { fetchReports(); }, []);

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
      await submitAppeal(appealModal._id, {
        appealMessage,
        action: appealAction,
      });
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

  const pendingCount = reports.filter(r => r.status === 'reported').length;
  const rejectedCount = reports.filter(r => r.status === 'rejected').length;

  return (
    <div>
      <Navbar />
      <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">

        {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700 }}>My Reports</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              Roll No: <strong>{user?.rollNo}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {pendingCount > 0 && (
              <div style={{
                padding: '10px 16px', background: 'var(--accent-light)',
                border: '1px solid #f5c6c2', borderRadius: 10,
                fontSize: 13, color: 'var(--accent)', fontWeight: 500,
              }}>
                ⚠️ {pendingCount} need{pendingCount === 1 ? 's' : ''} proof
              </div>
            )}
            {rejectedCount > 0 && (
              <div style={{
                padding: '10px 16px', background: '#fff8f8',
                border: '1px solid #f5c6c2', borderRadius: 10,
                fontSize: 13, color: 'var(--accent)', fontWeight: 500,
              }}>
                ❌ {rejectedCount} rejected — appeal now
              </div>
            )}
          </div>
        </div>

        {/* Reports list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading your reports...</div>
        ) : reports.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 56 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>No reports filed against you</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Keep following the college rules and regulations!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reports.map(report => (
              <div key={report._id} className="card" style={{
                borderLeft: `4px solid ${
                  report.status === 'resolved' ? 'var(--green)' :
                  report.status === 'rejected' ? 'var(--accent)' :
                  report.status === 'reported' ? 'var(--amber)' : 'var(--blue)'
                }`,
              }}>
                {/* Report header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 14 }}>{report.reportId}</span>
                      <span className={`badge badge-${report.severity}`}>{report.severity}</span>
                      <span className={`badge badge-${report.status}`}>{report.status.replace(/_/g, ' ')}</span>
                      {report.appealStatus && report.appealStatus !== 'none' && (
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 999,
                          background: 'var(--amber-light)', color: 'var(--amber)',
                          border: '1px solid #fde68a', fontWeight: 600,
                        }}>
                          {report.appealStatus === 'resubmitted' ? '📎 Re-submitted' : '✍️ Appealed'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                      {report.category} · {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {report.status === 'reported' && (
                    <button className="btn btn-primary btn-sm"
                      onClick={() => { setSelected(report); setPreview(null); setExplanation(''); setProofImage(null); }}>
                      📎 Upload Proof
                    </button>
                  )}
                </div>

                {/* Status Tracker */}
                <StatusTracker status={report.status} />

                {/* Details */}
                <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 4 }}>Incident Description</div>
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{report.details}</p>
                </div>

                {/* Admin comment */}
                {report.adminComment && (
                  <div style={{ marginTop: 10, padding: '10px 14px', background: report.status === 'resolved' ? 'var(--green-light)' : '#fff8f8', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 4 }}>Admin Comment</div>
                    <p style={{ fontSize: 13, color: 'var(--text2)' }}>{report.adminComment}</p>
                  </div>
                )}

                {/* Rejected — Appeal options */}
                {report.status === 'rejected' && (
                  <div style={{
                    marginTop: 14, padding: '14px 16px',
                    background: '#fff8f8', border: '1px solid #f5c6c2',
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
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 24,
          }} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
            <div style={{
              background: 'var(--white)', borderRadius: 16, padding: 32,
              width: '100%', maxWidth: 500,
              boxShadow: 'var(--shadow-lg)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700 }}>Submit Proof</h2>
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
                    background: preview ? 'transparent' : 'var(--bg)',
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
                      style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 6 }}>
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
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 24,
          }} onClick={e => { if (e.target === e.currentTarget) setAppealModal(null); }}>
            <div style={{
              background: 'var(--white)', borderRadius: 16, padding: 32,
              width: '100%', maxWidth: 500,
              boxShadow: 'var(--shadow-lg)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700 }}>
                    {appealAction === 'appeal' ? '✍️ Write Appeal' : '📎 Re-submit Proof'}
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>{appealModal.reportId}</p>
                </div>
                <button onClick={() => setAppealModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
              </div>

              {/* Toggle */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <button onClick={() => setAppealAction('appeal')} style={{
                  flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${appealAction === 'appeal' ? 'var(--accent)' : 'var(--border)'}`,
                  background: appealAction === 'appeal' ? 'var(--accent-light)' : 'var(--white)',
                  color: appealAction === 'appeal' ? 'var(--accent)' : 'var(--muted)',
                }}>✍️ Write Appeal</button>
                <button onClick={() => setAppealAction('resubmit')} style={{
                  flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${appealAction === 'resubmit' ? 'var(--accent)' : 'var(--border)'}`,
                  background: appealAction === 'resubmit' ? 'var(--accent-light)' : 'var(--white)',
                  color: appealAction === 'resubmit' ? 'var(--accent)' : 'var(--muted)',
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
                  <div style={{ padding: '10px 14px', background: 'var(--blue-light)', color: 'var(--blue)', border: '1px solid #bfdbfe', borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
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