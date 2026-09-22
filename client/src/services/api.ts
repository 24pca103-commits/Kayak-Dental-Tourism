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

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kayal_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kayal_admin_token');
      localStorage.removeItem('kayal_admin_user');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// ── Doctors ───────────────────────────────────────────
export const doctorsAPI = {
  getAll: () => api.get('/doctors'),
  getAllAdmin: () => api.get('/doctors/admin/all'),
  getById: (id: string) => api.get(`/doctors/${id}`),
  create: (data: FormData) =>
    api.post('/doctors', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/doctors/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/doctors/${id}`),
};

// ── Services ──────────────────────────────────────────
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getAllAdmin: () => api.get('/services/admin/all'),
  getBySlug: (slug: string) => api.get(`/services/slug/${slug}`),
  create: (data: FormData) =>
    api.post('/services', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/services/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// ── Appointments ──────────────────────────────────────
export const appointmentsAPI = {
  getAll: (params?: Record<string, string | number>) => api.get('/appointments', { params }),
  getStats: () => api.get('/appointments/stats'),
  getBookedSlots: (date: string) => api.get('/appointments/booked-slots', { params: { date } }),
  uploadAttachments: (formData: FormData, onProgress?: (percent: number) => void) =>
    api.post('/appointments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onProgress) onProgress(percent);
        }
      },
    }),
  create: (data: Record<string, unknown>) => api.post('/appointments', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// ── Testimonials ──────────────────────────────────────
export const testimonialsAPI = {
  getAll: () => api.get('/testimonials'),
  getAllAdmin: () => api.get('/testimonials/admin/all'),
  create: (data: FormData) =>
    api.post('/testimonials', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/testimonials/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/testimonials/${id}`),
};

// ── FAQs ──────────────────────────────────────────────
export const faqsAPI = {
  getAll: () => api.get('/faqs'),
  getAllAdmin: () => api.get('/faqs/admin/all'),
  create: (data: Record<string, unknown>) => api.post('/faqs', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/faqs/${id}`, data),
  delete: (id: string) => api.delete(`/faqs/${id}`),
};

// ── Feedback ──────────────────────────────────────────
export const feedbackAPI = {
  getAll: () => api.get('/feedback'),
  create: (data: Record<string, unknown>) => api.post('/feedback', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/feedback/${id}`, data),
  delete: (id: string) => api.delete(`/feedback/${id}`),
};

export default api;
