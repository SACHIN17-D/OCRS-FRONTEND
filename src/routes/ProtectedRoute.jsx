import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎓</div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap = {
      admin: '/admin',
      reporter: '/reporter',
      student: '/student',
      hod: '/hod',
      principal: '/principal',
    };
    return <Navigate to={redirectMap[user.role] || '/login'} replace />;
  }

  return children;
}