import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { createReport, getReporterReports, lookupStudent as lookupStudentApi, uploadEvidence } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Attendance', 'Behavior', 'Dress Code', 'Cheating', 'Property Damage', 'Harassment', 'Other'];
const SEVERITIES = [
  { key: 'low', label: '🟡 Low', desc: 'Minor violation' },
  { key: 'medium', label: '🟠 Medium', desc: 'Reported or moderate' },
  { key: 'high', label: '🔴 High', desc: 'Serious misconduct' },
];

const warningConfig = {
  clean: { label: 'Clean Record', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  watch: { label: 'Under Watch', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  risk: { label: 'At Risk', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  hod_review: { label: 'HOD Review', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  principal_review: { label: 'Principal Review', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
};

export default function ReporterDashboard() {
  const { user } = useAuth();
  const [form, setForm] = useState({ studentRollNo: '', category: '', severity: 'low', date: '', details: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('file');
  const [proofImage, setProofImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [explanation, setExplanation] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const fetchMyReports = async () => {
    try {
      const res = await getReporterReports();
      setMyReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => { fetchMyReports(); }, []);

  const lookupStudent = async (rollNo) => {
    if (!rollNo || rollNo.length < 5) { setStudentInfo(null); return; }
    setStudentLoading(true);
    try {
      const res = await lookupStudentApi(rollNo);
      setStudentInfo(res.data);
    } catch (err) {
      setStudentInfo(null);
    } finally {
      setStudentLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createReport(form);
      const reportId = res.data._id;

      // Upload proof image if provided
      if (proofImage) {
        const formData = new FormData();
        formData.append('image', proofImage);
        formData.append('explanation', explanation || 'Proof submitted by reporter');
        formData.append('submittedAs', 'reporter');
        await uploadEvidence(reportId, formData);
      }

      setSubmitted(res.data);
      setForm({ studentRollNo: '', category: '', severity: 'low', date: '', details: '' });
      setStudentInfo(null);
      setProofImage(null);
      setPreview(null);
      setExplanation('');
      showAlert(`Report ${res.data.reportId} filed successfully!`);
      fetchMyReports();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to submit report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalReports = myReports.length;
  const resolvedReports = myReports.filter(r => r.status === 'resolved').length;
  const pendingReports = myReports.filter(r => r.status === 'reported' || r.status === 'under_review').length;
  const rejectedReports = myReports.filter(r => r.status === 'rejected').length;

  return (
    <div>
      <Navbar />
      <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">

        {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, fontWeight: 700 }}>Reporter Dashboard</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Filing as <strong style={{ color: '#00d2ff' }}>{user?.name}</strong>
            {user?.department && <> · {user.department}</>}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Filed', value: totalReports, color: '#00d2ff' },
            { label: 'Resolved', value: resolvedReports, color: '#22c55e' },
            { label: 'Pending', value: pendingReports, color: '#f59e0b' },
            { label: 'Rejected', value: rejectedReports, color: '#ef4444' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontFamily: 'DM Serif Display, serif', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
          {[
            { key: 'file', label: '📋 File Report' },
            { key: 'reports', label: `📄 My Reports (${totalReports})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '10px 20px', border: 'none', background: 'none',
              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === tab.key ? '#00d2ff' : 'var(--muted)',
              borderBottom: `2px solid ${activeTab === tab.key ? '#00d2ff' : 'transparent'}`,
              marginBottom: -1, transition: 'all 0.15s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* FILE REPORT TAB */}
        {activeTab === 'file' && (
          <>
            {submitted && (
              <div className="card" style={{ marginBottom: 24, border: '1px solid rgba(34,197,94,0.2)', background: 'var(--green-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--green)' }}>Report Filed Successfully</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
                      Report ID: <strong>{submitted.reportId}</strong>
                    </div>
                  </div>
                  <button onClick={() => setSubmitted(null)} style={{
                    marginLeft: 'auto', background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--muted)', fontSize: 18,
                  }}>✕</button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

                <div className="form-group">
                  <label className="form-label">Student Roll No. *</label>
                  <input className="form-input" type="text" placeholder="e.g. 7376231CS290"
                    value={form.studentRollNo}
                    onChange={e => {
                      set('studentRollNo', e.target.value.toUpperCase());
                      lookupStudent(e.target.value);
                    }} required />

                  {studentLoading && (
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Looking up student...</div>
                  )}
                  {studentInfo && (
                    <div style={{
                      marginTop: 8, padding: '10px 14px', borderRadius: 8,
                      background: 'var(--bg2)', border: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#e8f4ff' }}>{studentInfo.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{studentInfo.department}</div>
                        </div>
                        {studentInfo.warningLevel && (
                          <span style={{
                            padding: '3px 10px', borderRadius: 999,
                            fontSize: 11, fontWeight: 700,
                            background: warningConfig[studentInfo.warningLevel]?.bg,
                            color: warningConfig[studentInfo.warningLevel]?.color,
                          }}>
                            ⚠️ {warningConfig[studentInfo.warningLevel]?.label} ({studentInfo.warningCount || 0})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {form.studentRollNo.length >= 5 && !studentInfo && !studentLoading && (
                    <div style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>
                      ⚠️ Student not found in system
                    </div>
                  )}
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
                        fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600,
                        border: `1.5px solid ${form.severity === s.key ? '#00d2ff' : 'var(--border)'}`,
                        background: form.severity === s.key ? 'rgba(0,210,255,0.1)' : 'transparent',
                        color: form.severity === s.key ? '#00d2ff' : 'var(--muted)',
                        transition: 'all 0.15s', textAlign: 'center',
                      }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {/* Severity info */}
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                    {form.severity === 'low' && '🟡 Low — Admin will handle directly'}
                    {form.severity === 'medium' && '🟠 Medium — Will be escalated to HOD'}
                    {form.severity === 'high' && '🔴 High — Will be escalated to Principal'}
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Incident Details *</label>
                  <textarea className="form-input"
                    placeholder="Describe the incident clearly — what happened, where, when, and any witnesses..."
                    value={form.details} onChange={e => set('details', e.target.value)}
                    style={{ minHeight: 120 }} required />
                </div>

                {/* Proof Image Upload */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Proof Image (optional)</label>
                  <label style={{
                    display: 'block', border: '2px dashed var(--border)',
                    borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer',
                    background: preview ? 'transparent' : 'var(--bg2)',
                    transition: 'all 0.15s',
                  }}>
                    {preview ? (
                      <img src={preview} alt="Preview" style={{
                        maxWidth: '100%', maxHeight: 200,
                        borderRadius: 8, objectFit: 'cover',
                      }} />
                    ) : (
                      <div>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Click to upload proof image</div>
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

                {proofImage && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Proof Explanation</label>
                    <textarea className="form-input"
                      placeholder="Explain the proof you are submitting..."
                      value={explanation} onChange={e => setExplanation(e.target.value)}
                      style={{ minHeight: 80 }} />
                  </div>
                )}
              </div>

              <hr className="divider" />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline"
                  onClick={() => {
                    setForm({ studentRollNo: '', category: '', severity: 'low', date: '', details: '' });
                    setStudentInfo(null);
                    setProofImage(null);
                    setPreview(null);
                    setExplanation('');
                  }}>
                  Clear
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : '📋 Submit Report'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* MY REPORTS TAB */}
        {activeTab === 'reports' && (
          <div>
            {reportsLoading ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading reports...</div>
            ) : myReports.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 56 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <h3 style={{ fontFamily: 'DM Serif Display, serif', marginBottom: 6 }}>No reports filed yet</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>You haven't filed any reports yet.</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)' }}>
                      {['Report ID', 'Student', 'Category', 'Severity', 'Date', 'Status'].map(h => (
                        <th key={h} style={{
                          padding: '12px 16px', textAlign: 'left',
                          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.06em', color: 'var(--muted)',
                          borderBottom: '1px solid var(--border)',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {myReports.map(report => (
                      <tr key={report._id} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#00d2ff' }}>
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span className={`badge badge-${report.status}`}>
                              {report.status.replace(/_/g, ' ')}
                            </span>
                            {report.escalatedTo && report.escalatedTo !== 'none' && (
                              <span style={{
                                fontSize: 10, padding: '1px 6px', borderRadius: 999, fontWeight: 700,
                                background: report.meetingStatus === 'confirmed' ? 'var(--green-light)' : 'rgba(239,68,68,0.1)',
                                color: report.meetingStatus === 'confirmed' ? 'var(--green)' : '#ef4444',
                              }}>
                                {report.meetingStatus === 'confirmed' ? '✅ Meeting Done' : `⏳ ${report.escalatedTo.toUpperCase()} Meeting`}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}