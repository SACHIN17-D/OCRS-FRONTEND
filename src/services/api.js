import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ocrs-backend-8fgs.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// Reports
export const createReport = (data) => api.post('/reports', data);
export const getAllReports = () => api.get('/reports');
export const getMyReports = () => api.get('/reports/mine');
export const submitAppeal = (reportId, data) => api.post(`/reports/appeal/${reportId}`, data);

// Evidence
export const uploadEvidence = (reportId, formData) =>
  api.post(`/evidence/${reportId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Admin
export const verifyReport = (reportId, data) => api.put(`/admin/verify/${reportId}`, data);
export const getWarnings = () => api.get('/admin/warnings');

// HOD
export const getHodReports = () => api.get('/hod/reports');
export const confirmHodMeeting = (reportId, data) => api.put(`/hod/confirm/${reportId}`, data);

// Principal
export const getPrincipalReports = () => api.get('/principal/reports');
export const confirmPrincipalMeeting = (reportId, data) => api.put(`/principal/confirm/${reportId}`, data);

export default api;