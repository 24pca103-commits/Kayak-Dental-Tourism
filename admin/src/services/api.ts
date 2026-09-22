import axios from 'axios';

const getBaseURL = () => {
  let url = '';
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) {
    url = import.meta.env.VITE_API_URL.trim();
  } else if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return '/api';
  } else {
    url = 'https://kayal-dental-tourism-treatment.onrender.com/api';
  }

  if (url.endsWith('/')) url = url.slice(0, -1);
  if ((url.startsWith('http://') || url.startsWith('https://')) && !url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
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

export const testimonialsAPI = {
  getAll: () => api.get('/testimonials'),
  getAllAdmin: () => api.get('/testimonials/admin/all'),
  create: (data: FormData) =>
    api.post('/testimonials', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/testimonials/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/testimonials/${id}`),
};

export const feedbackAPI = {
  getAll: () => api.get('/feedback'),
  create: (data: Record<string, unknown>) => api.post('/feedback', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/feedback/${id}`, data),
  delete: (id: string) => api.delete(`/feedback/${id}`),
};

export default api;

