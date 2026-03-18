import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userRaw = params.get('user');

      console.log('token:', token);
      console.log('userRaw:', userRaw);

      if (!token || !userRaw) {
        setError('Missing token or user data');
        return;
      }

      const user = JSON.parse(decodeURIComponent(userRaw));
      console.log('user:', user);

      login(user, token);

      const redirectMap = {
        admin: '/admin',
        reporter: '/reporter',
        student: '/student',
        hod: '/hod',
        principal: '/principal',
      };

      const destination = redirectMap[user.role] || '/login';
      console.log('redirecting to:', destination);
      navigate(destination);

    } catch (err) {
      console.error('AuthCallback error:', err);
      setError(err.message);
    }
  }, []);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Login Failed
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
          <a href="/login" style={{ color: '#00d2ff', fontSize: 13 }}>
            ← Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, fontWeight: 700 }}>
          Signing you in...
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>
          Please wait
        </div>
      </div>
    </div>
  );
}