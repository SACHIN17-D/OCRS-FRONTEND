import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/register';
import AuthCallback from './pages/AuthCallback';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReporterDashboard from './pages/reporter/ReporterDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import HodDashboard from './pages/hod/HodDashboard';
import PrincipalDashboard from './pages/principal/PrincipalDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/reporter" element={
            <ProtectedRoute allowedRoles={['reporter']}>
              <ReporterDashboard />
            </ProtectedRoute>
          } />

          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/hod" element={
            <ProtectedRoute allowedRoles={['hod']}>
              <HodDashboard />
            </ProtectedRoute>
          } />

          <Route path="/principal" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}