import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) {
    const raw = import.meta.env.VITE_API_URL.trim();
    return raw.endsWith('/') ? raw.slice(0, -1) : raw;
  }
  // In local development, use '/api' to leverage Vite dev proxy
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return '/api';
  }
  // In production (Vercel / live domain), default to live Render backend API
  return 'https://kayal-dental-tourism-treatment.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kayal_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kayal_admin_token');
      localStorage.removeItem('kayal_admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const appointmentsAPI = {
  getAll: (params?: Record<string, string | number>) =>
    api.get('/appointments', { params }),
  getById: (id: string) => api.get(`/appointments/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
  getStats: () => api.get('/appointments/stats'),
};

export default api;
