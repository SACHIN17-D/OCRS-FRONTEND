import { useState, useEffect } from 'react';
import { getAllUsers, addUser, editUser, toggleUserStatus, resetWarning } from '../services/api';

const DEPARTMENTS = [
  'AGRI', 'AIDS', 'AIML', 'BM', 'BT',
  'CIVIL', 'CSBS', 'CSD', 'CSE', 'CT',
  'ECE', 'EEE', 'EIE', 'FD', 'FT',
  'ISE', 'IT', 'MECH', 'MTRS', 'Administration',
];

const ROLES = ['student', 'reporter', 'hod', 'principal'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [alert, setAlert] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'reporter', department: 'CSE' });
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await addUser(form);
      showAlert('User created successfully! ✅');
      setAddModal(false);
      setForm({ name: '', email: '', password: '', role: 'reporter', department: 'CSE' });
      fetchUsers();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to create user.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await editUser(editModal._id, editForm);
      showAlert('User updated successfully! ✅');
      setEditModal(null);
      fetchUsers();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update user.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (userId, name, isActive) => {
    try {
      await toggleUserStatus(userId);
      showAlert(`${name} ${isActive ? 'deactivated' : 'activated'} successfully!`);
      fetchUsers();
    } catch (err) {
      showAlert('Failed to toggle user status.', 'error');
    }
  };

  const handleResetWarning = async (userId, name) => {
    try {
      await resetWarning(userId);
      showAlert(`Warning reset for ${name}! ✅`);
      fetchUsers();
    } catch (err) {
      showAlert('Failed to reset warning.', 'error');
    }
  };

  const filtered = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);

  const counts = {
    all: users.length,
    student: users.filter(u => u.role === 'student').length,
    reporter: users.filter(u => u.role === 'reporter').length,
    hod: users.filter(u => u.role === 'hod').length,
    principal: users.filter(u => u.role === 'principal').length,
  };

  const roleColor = {
    student: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
    reporter: { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa' },
    hod: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    principal: { bg: 'rgba(124,58,237,0.1)', color: '#a78bfa' },
  };

  const warningColor = {
    clean: '#22c55e',
    watch: '#f59e0b',
    risk: '#f97316',
    hod_review: '#ef4444',
    principal_review: '#7c3aed',
  };

  return (
    <div>
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All (${counts.all})` },
            { key: 'student', label: `Students (${counts.student})` },
            { key: 'reporter', label: `Reporters (${counts.reporter})` },
            { key: 'hod', label: `HODs (${counts.hod})` },
            { key: 'principal', label: `Principals (${counts.principal})` },
          ].map(f => (
            <button key={f.key} onClick={() => setRoleFilter(f.key)} style={{
              padding: '7px 14px', border: '1px solid',
              borderColor: roleFilter === f.key ? '#00d2ff' : 'var(--border)',
              background: roleFilter === f.key ? 'rgba(0,210,255,0.1)' : 'transparent',
              borderRadius: 8, fontFamily: 'DM Sans, sans-serif',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              color: roleFilter === f.key ? '#00d2ff' : 'var(--muted)',
              transition: 'all 0.15s',
            }}>
              {f.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setAddModal(true)}>
          + Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Loading users...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
            No users found
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface2)' }}>
                {['Name', 'Email', 'Role', 'Department', 'Warning', 'Status', 'Actions'].map(h => (
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
              {filtered.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border)', opacity: user.isActive ? 1 : 0.5 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                    {user.rollNo && <div style={{ fontSize: 11, color: '#00d2ff' }}>{user.rollNo}</div>}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text2)' }}>{user.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999,
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      background: roleColor[user.role]?.bg,
                      color: roleColor[user.role]?.color,
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text2)' }}>
                    {user.department || '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {user.role === 'student' ? (
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: warningColor[user.warningLevel] || '#22c55e',
                      }}>
                        {user.warningCount || 0} ⚠️
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999,
                      fontSize: 11, fontWeight: 700,
                      background: user.isActive ? 'var(--green-light)' : 'var(--red-light)',
                      color: user.isActive ? 'var(--green)' : '#ef4444',
                    }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm"
                        onClick={() => { setEditModal(user); setEditForm({ name: user.name, email: user.email, department: user.department, rollNo: user.rollNo }); }}>
                        ✏️
                      </button>
                      <button className="btn btn-outline btn-sm"
                        onClick={() => handleToggle(user._id, user.name, user.isActive)}
                        style={{ color: user.isActive ? '#ef4444' : '#22c55e', borderColor: user.isActive ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)' }}>
                        {user.isActive ? '🔒' : '🔓'}
                      </button>
                      {user.role === 'student' && user.warningCount > 0 && (
                        <button className="btn btn-outline btn-sm"
                          onClick={() => handleResetWarning(user._id, user.name)}
                          style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}>
                          🔄
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {addModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24,
        }} onClick={e => { if (e.target === e.currentTarget) setAddModal(false); }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 480,
            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 700 }}>
                + Add New User
              </h2>
              <button onClick={() => setAddModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" type="text" placeholder="e.g. Dr. John"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" placeholder="e.g. john@bitsathy.ac.in"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" placeholder="Set a password"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-input" value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-input" value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }}
                  onClick={() => setAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}
                  disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : '+ Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24,
        }} onClick={e => { if (e.target === e.currentTarget) setEditModal(null); }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 480,
            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 700 }}>
                  ✏️ Edit User
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>{editModal.role} — {editModal.email}</p>
              </div>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>

            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" type="text"
                  value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email"
                  value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              {editModal.role === 'student' && (
                <div className="form-group">
                  <label className="form-label">Roll No</label>
                  <input className="form-input" type="text"
                    value={editForm.rollNo || ''} onChange={e => setEditForm(f => ({ ...f, rollNo: e.target.value.toUpperCase() }))} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-input" value={editForm.department}
                  onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }}
                  onClick={() => setEditModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}
                  disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}