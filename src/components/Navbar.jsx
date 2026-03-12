import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    admin: '#c0392b',
    reporter: '#2563eb',
    student: '#16a34a',
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <nav style={{
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 60,
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: 'var(--shadow)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, background: 'var(--accent)',
          borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', fontSize: 16,
        }}>📋</div>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
            OCRS<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.04em' }}>
            Online Compliance Reporting System
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className={`badge badge-${user?.role}`}>
          {user?.role}
        </span>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 12px 4px 4px',
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 999, fontSize: 13, fontWeight: 500,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: roleColors[user?.role] || '#888',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 11, fontWeight: 700,
          }}>{initials}</div>
          <span>{user?.name}</span>
          {user?.rollNo && (
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>· {user.rollNo}</span>
          )}
        </div>

        <button onClick={handleLogout} style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: 7,
          padding: '6px 12px', fontSize: 12, fontWeight: 500,
          color: 'var(--muted)', cursor: 'pointer',
          fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)'; }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}