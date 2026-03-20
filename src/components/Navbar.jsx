import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const roleColors = {
    admin: { bg: 'rgba(0, 210, 255, 0.15)', color: '#00d2ff' },
    reporter: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' },
    student: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' },
    hod: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
    principal: { bg: 'rgba(124, 58, 237, 0.15)', color: '#a78bfa' },
  };

  const roleStyle = roleColors[user?.role] || roleColors.student;

  return (
    <nav style={{
      background: 'rgba(4, 13, 26, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0, 210, 255, 0.12)',
      padding: '0 20px',
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
          background: 'linear-gradient(135deg, #00d2ff, #0066ff)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: '#040d1a',
          boxShadow: '0 2px 12px rgba(0, 210, 255, 0.3)',
          flexShrink: 0,
        }}>📋</div>
        <span style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: 18, fontWeight: 700, color: '#e8f4ff',
        }}>OCRS<span style={{ color: '#00d2ff' }}>.</span></span>
      </div>

      {/* Desktop Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        className="navbar-desktop">
        <span style={{
          padding: '4px 12px', borderRadius: 999,
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em',
          background: roleStyle.bg, color: roleStyle.color,
        }}>
          {user?.role}
        </span>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px',
          background: 'rgba(0, 210, 255, 0.05)',
          border: '1px solid rgba(0, 210, 255, 0.12)',
          borderRadius: 999,
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00d2ff, #0066ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#040d1a',
            flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#e8f4ff' }}>
            {user?.name}
          </span>
        </div>

        <button onClick={() => { logout(); navigate('/login'); }} style={{
          background: 'transparent',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          color: '#8aacc8',
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#00d2ff'; e.currentTarget.style.color = '#00d2ff'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0, 210, 255, 0.2)'; e.currentTarget.style.color = '#8aacc8'; }}
        >
          Sign out
        </button>
      </div>

      {/* Mobile menu button */}
      <button onClick={() => setMenuOpen(!menuOpen)} style={{
        display: 'none',
        background: 'none', border: 'none',
        color: '#e8f4ff', fontSize: 22, cursor: 'pointer',
      }} className="navbar-mobile-btn">
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 60, left: 0, right: 0,
          background: 'rgba(4, 13, 26, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 210, 255, 0.12)',
          padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: 12,
          zIndex: 99,
        }} className="navbar-mobile-menu">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #00d2ff, #0066ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#040d1a',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e8f4ff' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#00d2ff', textTransform: 'uppercase', fontWeight: 700 }}>{user?.role}</div>
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(0,210,255,0.1)' }} />
          <button onClick={() => { logout(); navigate('/login'); setMenuOpen(false); }} style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444',
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            textAlign: 'left',
          }}>
            🚪 Sign out
          </button>
        </div>
      )}
    </nav>
  );
}