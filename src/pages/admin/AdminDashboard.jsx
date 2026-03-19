import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import StatusTracker from '../../components/StatusTracker';
import { getAllReports, verifyReport } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend
} from 'recharts';

const COLORS = {
  category: ['#00d2ff', '#0066ff', '#a78bfa', '#22c55e', '#f59e0b', '#ef4444', '#f97316'],
  severity: { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' },
  status: ['#f59e0b', '#3b82f6', '#a78bfa', '#22c55e', '#ef4444'],
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [warningFilter, setWarningFilter] = useState('all');

  const fetchReports = async () => {
    try {
      const res = await getAllReports();
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
    setTimeout(() => setAlert(null), 3000);
  };

  const handleVerify = async (decision) => {
    setActionLoading(true);
    try {
      const res = await verifyReport(selected._id, { decision, adminComment });
      if (res.data) {
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

  // Analytics Data
  const categoryData = Object.entries(
    reports.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const severityData = [
    { name: 'Low', value: reports.filter(r => r.severity === 'low').length, color: '#22c55e' },
    { name: 'Medium', value: reports.filter(r => r.severity === 'medium').length, color: '#f59e0b' },
    { name: 'High', value: reports.filter(r => r.severity === 'high').length, color: '#ef4444' },
  ];

  const statusData = [
    { name: 'Reported', value: reports.filter(r => r.status === 'reported').length },
    { name: 'Proof Submitted', value: reports.filter(r => r.status === 'proof_submitted').length },
    { name: 'Under Review', value: reports.filter(r => r.status === 'under_review').length },
    { name: 'Resolved', value: reports.filter(r => r.status === 'resolved').length },
    { name: 'Rejected', value: reports.filter(r => r.status === 'rejected').length },
  ];

  const monthlyData = (() => {
    const months = {};
    reports.forEach(r => {
      const month = new Date(r.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  })();

  // Warning data (mock based on resolved reports per student)
  const warningData = (() => {
    const studentWarnings = {};
    reports.filter(r => r.status === 'resolved').forEach(r => {
      if (!studentWarnings[r.studentRollNo]) {
        studentWarnings[r.studentRollNo] = {
          rollNo: r.studentRollNo,
          name: r.studentName,
          warnings: 0,
        };
      }
      studentWarnings[r.studentRollNo].warnings += 1;
    });
    return Object.values(studentWarnings).map(s => ({
      ...s,
      level: s.warnings === 0 ? 'clean' :
             s.warnings === 1 ? 'watch' :
             s.warnings === 2 ? 'risk' :
             s.warnings === 3 ? 'hod' : 'principal',
    }));
  })();

  const filteredWarnings = warningFilter === 'all' ? warningData :
    warningData.filter(s => s.level === warningFilter);

  const warningLevelConfig = {
    clean: { label: 'Clean', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    watch: { label: 'Under Watch', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    risk: { label: 'At Risk', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    hod: { label: 'HOD Review', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    principal: { label: 'Principal Review', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  };

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  const counts = {
    all: reports.length,
    reported: reports.filter(r => r.status === 'reported').length,
    proof_submitted: reports.filter(r => r.status === 'proof_submitted').length,
    under_review: reports.filter(r => r.status === 'under_review').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  const tooltipStyle = {
    backgroundColor: '#0c1f38',
    border: '1px solid rgba(0,210,255,0.2)',
    borderRadius: 8,
    color: '#e8f4ff',
    fontSize: 12,
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }} className="page-enter">

        {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, fontWeight: 700 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Review and manage student compliance reports</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Reports', value: counts.all, color: '#00d2ff' },
            { label: 'Awaiting Proof', value: counts.reported, color: '#f59e0b' },
            { label: 'Needs Review', value: counts.proof_submitted + counts.under_review, color: '#a78bfa' },
            { label: 'Resolved', value: counts.resolved, color: '#22c55e' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontFamily: 'DM Serif Display, serif', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
          {[
            { key: 'reports', label: '📋 Reports' },
            { key: 'analytics', label: '📊 Analytics' },
            { key: 'warnings', label: '⚠️ Warning Tracker' },
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

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'reported', label: 'Reported' },
                { key: 'proof_submitted', label: 'Proof Submitted' },
                { key: 'under_review', label: 'Under Review' },
                { key: 'resolved', label: 'Resolved' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
                  padding: '7px 14px', border: '1px solid',
                  borderColor: filter === tab.key ? '#00d2ff' : 'var(--border)',
                  background: filter === tab.key ? 'rgba(0,210,255,0.1)' : 'transparent',
                  borderRadius: 8,
                  fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                  color: filter === tab.key ? '#00d2ff' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}>
                  {tab.label} ({counts[tab.key] ?? filtered.length})
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
                    <tr style={{ background: 'var(--surface2)' }}>
                      {['Report ID', 'Student', 'Category', 'Severity', 'Date', 'Status', 'Action'].map(h => (
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
                    {filtered.map(report => (
                      <tr key={report._id} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#00d2ff' }}>
                          {report.reportId}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
  <div style={{ fontWeight: 500, fontSize: 13 }}>{report.studentName || 'Unknown'}</div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{report.studentRollNo}</span>
    {warningData.find(w => w.rollNo === report.studentRollNo)?.warnings > 0 && (
      <span style={{
        fontSize: 10, padding: '1px 6px', borderRadius: 999, fontWeight: 700,
        background: warningData.find(w => w.rollNo === report.studentRollNo)?.warnings >= 3
          ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
        color: warningData.find(w => w.rollNo === report.studentRollNo)?.warnings >= 3
          ? '#ef4444' : '#f59e0b',
      }}>
        ⚠️ {warningData.find(w => w.rollNo === report.studentRollNo)?.warnings}w
      </span>
    )}
  </div>
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
                            {report.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                        <button className="btn btn-outline btn-sm"
  onClick={async () => {
    await fetchReports();
    setSelected(report);
    setAdminComment('');
  }}>
  View
</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div>
            {/* Row 1 — Category + Severity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              {/* Category Pie */}
              <div className="card">
                <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, marginBottom: 20 }}>
                  Reports by Category
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90}
                      dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false} fontSize={11}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS.category[i % COLORS.category.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Severity Bar */}
              <div className="card">
                <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, marginBottom: 20 }}>
                  Reports by Severity
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={severityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,210,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#8aacc8', fontSize: 12 }} axisLine={false} />
                    <YAxis tick={{ fill: '#8aacc8', fontSize: 12 }} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {severityData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 2 — Status + Monthly */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Status Donut */}
              <div className="card">
                <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, marginBottom: 20 }}>
                  Reports by Status
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                      fontSize={11}>
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={COLORS.status[i % COLORS.status.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Line */}
              <div className="card">
                <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, marginBottom: 20 }}>
                  Reports per Month
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,210,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: '#8aacc8', fontSize: 12 }} axisLine={false} />
                    <YAxis tick={{ fill: '#8aacc8', fontSize: 12 }} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="count" stroke="#00d2ff"
                      strokeWidth={2} dot={{ fill: '#00d2ff', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* WARNING TRACKER TAB */}
        {activeTab === 'warnings' && (
          <div>
            {/* Warning filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All Students' },
                { key: 'watch', label: '🟡 Under Watch' },
                { key: 'risk', label: '🟠 At Risk' },
                { key: 'hod', label: '🔴 HOD Review' },
                { key: 'principal', label: '⚫ Principal Review' },
              ].map(f => (
                <button key={f.key} onClick={() => setWarningFilter(f.key)} style={{
                  padding: '7px 14px', border: '1px solid',
                  borderColor: warningFilter === f.key ? '#00d2ff' : 'var(--border)',
                  background: warningFilter === f.key ? 'rgba(0,210,255,0.1)' : 'transparent',
                  borderRadius: 8,
                  fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                  color: warningFilter === f.key ? '#00d2ff' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}>
                  {f.label}
                </button>
              ))}
            </div>

            {filteredWarnings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <p style={{ color: 'var(--muted)' }}>No students with warnings found!</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)' }}>
                      {['Student', 'Roll No', 'Warnings', 'Level'].map(h => (
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
                    {filteredWarnings.map((student, i) => {
                      const config = warningLevelConfig[student.level];
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500 }}>
                            {student.name || 'Unknown'}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: '#00d2ff', fontWeight: 600 }}>
                            {student.rollNo}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 28, height: 28, borderRadius: '50%',
                              background: config.bg, color: config.color,
                              fontSize: 13, fontWeight: 700,
                            }}>
                              {student.warnings}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '4px 12px', borderRadius: 999,
                              fontSize: 11, fontWeight: 700,
                              background: config.bg, color: config.color,
                            }}>
                              {config.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
        {selected && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 24,
          }} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
            <div style={{
              background: 'var(--surface)', borderRadius: 16, padding: 32,
              width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 700 }}>
                    {selected.reportId}
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>Report Details</p>
                </div>
                <button onClick={() => setSelected(null)} style={{
                  background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)',
                }}>✕</button>
              </div>

              <div style={{ marginBottom: 24 }}>
                <StatusTracker status={selected.status} />
              </div>

              <hr className="divider" />

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
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 6 }}>Incident Details</div>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, padding: '12px 14px', background: 'var(--bg2)', borderRadius: 8 }}>{selected.details}</p>
              </div>

              {selected.evidence && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 8 }}>Student Proof</div>
                  {selected.evidence.imageUrl && (
                    <a href={selected.evidence.imageUrl} target="_blank" rel="noreferrer">
                      <img src={selected.evidence.imageUrl} alt="Proof" style={{
                        width: '100%', maxHeight: 400, objectFit: 'contain',
                        borderRadius: 8, border: '1px solid var(--border)', marginBottom: 10,
                        background: 'var(--bg2)', cursor: 'pointer',
                      }} />
                    </a>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 4 }}>
                    Click image to view full size 🔍
                  </div>
                  {selected.evidence.explanation && (
                    <p style={{ fontSize: 13, color: 'var(--text2)', padding: '10px 14px', background: 'var(--bg2)', borderRadius: 8 }}>
                      {selected.evidence.explanation}
                    </p>
                  )}
                </div>
              )}

              {selected.appealMessage && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 6 }}>
                    Student Appeal —{' '}
                    <span style={{ color: selected.appealStatus === 'resubmitted' ? 'var(--blue)' : 'var(--amber)' }}>
                      {selected.appealStatus === 'resubmitted' ? '📎 Re-submitted Proof' : '✍️ Written Appeal'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text2)', padding: '12px 14px', background: 'var(--amber-light)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
                    {selected.appealMessage}
                  </p>
                </div>
              )}

{(selected.status === 'proof_submitted' || selected.status === 'under_review') && (
  <div>
    <hr className="divider" />

    {/* Show meeting pending warning */}
    {selected.meetingStatus === 'pending' && (
      <div style={{
        padding: '14px 16px', marginBottom: 16,
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 10, fontSize: 13,
      }}>
        <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
          ⏳ {selected.escalatedTo?.toUpperCase()} Meeting Pending
        </div>
        <div style={{ color: 'var(--text2)' }}>
          Student must meet the {selected.escalatedTo === 'hod' ? 'HOD' : 'Principal'} in person before this report can be approved.
        </div>
      </div>
    )}

    {/* Show meeting confirmed */}
    {selected.meetingStatus === 'confirmed' && (
      <div style={{
        padding: '14px 16px', marginBottom: 16,
        background: 'var(--green-light)',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: 10, fontSize: 13,
      }}>
        <div style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>
          ✅ Meeting Confirmed
        </div>
        <div style={{ color: 'var(--text2)' }}>
          {selected.meetingNotes && `Notes: ${selected.meetingNotes}`}
        </div>
      </div>
    )}

    <div className="form-group">
      <label className="form-label">Admin Comment (optional)</label>
      <textarea className="form-input" placeholder="Add a note about your decision..."
        value={adminComment} onChange={e => setAdminComment(e.target.value)} />
    </div>

    {/* Only show approve/reject if meeting is not pending */}
    {selected.meetingStatus !== 'pending' && (
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-success" style={{ flex: 1 }}
          disabled={actionLoading} onClick={() => handleVerify('approve')}>
          ✅ Approve & Resolve
        </button>
        <button className="btn btn-danger" style={{ flex: 1 }}
          disabled={actionLoading} onClick={() => handleVerify('reject')}>
          ❌ Reject Report
        </button>
      </div>
    )}

    {selected.meetingStatus === 'pending' && (
      <div style={{
        padding: '12px 16px', background: 'rgba(239,68,68,0.05)',
        border: '1px solid rgba(239,68,68,0.15)',
        borderRadius: 8, textAlign: 'center',
        fontSize: 13, color: '#ef4444', fontWeight: 500,
      }}>
        🔒 Approval locked until meeting is confirmed
      </div>
    )}
  </div>
)}

              {selected.status === 'resolved' && (
                <div className="alert alert-success">This report has been resolved. ✅</div>
              )}
              {selected.status === 'rejected' && (
                <div style={{ padding: '12px 16px', background: 'var(--red-light)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: '#fca5a5' }}>
                  This report was rejected. ❌
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}