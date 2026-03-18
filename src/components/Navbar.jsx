import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleColors = {
    admin: { bg: 'rgba(245,197,24,0.15)', color: '#f5c518' },
    reporter: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
    student: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  };

  const roleStyle = roleColors[user?.role] || roleColors.student;

  return (
    <nav style={{
      background: 'rgba(10, 15, 30, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(245, 197, 24, 0.12)',
      padding: '0 32px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, #f5c518, #e6a800)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: '#0a0f1e',
          boxShadow: '0 2px 12px rgba(245,197,24,0.3)',
        }}>📋</div>
        <div>
          <span style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: 18, fontWeight: 700, color: '#f0f4ff',
          }}>OCRS<span style={{ color: '#f5c518' }}>.</span></span>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Role badge */}
        <span style={{
          padding: '4px 12px', borderRadius: 999,
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em',
          background: roleStyle.bg, color: roleStyle.color,
        }}>
          {user?.role}
        </span>

        {/* User name */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(245,197,24,0.12)',
          borderRadius: 999,
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f5c518, #e6a800)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#0a0f1e',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#f0f4ff' }}>
            {user?.name}
          </span>
        </div>

        {/* Logout */}
        <button onClick={() => { logout(); navigate('/login'); }} style={{
          background: 'transparent',
          border: '1px solid rgba(245,197,24,0.2)',
          color: '#a8b4d0',
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#f5c518'; e.currentTarget.style.color = '#f5c518'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,197,24,0.2)'; e.currentTarget.style.color = '#a8b4d0'; }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}