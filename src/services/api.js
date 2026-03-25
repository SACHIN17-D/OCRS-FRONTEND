import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ocrs-backend-8fgs.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // If sending FormData, let the browser set Content-Type (with boundary)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
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
export const getReporterReports = () => api.get('/reports/mine/reporter');
export const lookupStudent = (rollNo) => api.get(`/reports/student/${rollNo}`);

// Evidence
export const uploadEvidence = (reportId, formData) =>
  api.post(`/evidence/${reportId}`, formData);

// Admin
export const verifyReport = (reportId, data) => api.put(`/admin/verify/${reportId}`, data);
export const getWarnings = () => api.get('/admin/warnings');
export const getAllUsers = () => api.get('/admin/all-users');
export const addUser = (data) => api.post('/admin/add-user', data);
export const editUser = (userId, data) => api.put(`/admin/edit-user/${userId}`, data);
export const toggleUserStatus = (userId) => api.put(`/admin/toggle-user/${userId}`);
export const resetWarning = (userId) => api.put(`/admin/reset-warning/${userId}`);

// HOD
export const getHodReports = () => api.get('/hod/reports');
export const confirmHodMeeting = (reportId, data) => api.put(`/hod/confirm/${reportId}`, data);

// Principal
export const getPrincipalReports = () => api.get('/principal/reports');
export const confirmPrincipalMeeting = (reportId, data) => api.put(`/principal/confirm/${reportId}`, data);

export default api;