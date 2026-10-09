import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sb_token');
      localStorage.removeItem('sb_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ── Profile ───────────────────────────────────────────
export const profileAPI = {
  get: () => api.get('/profile'),
  save: (data) => api.post('/profile', data),
  update: (data) => api.patch('/profile', data),
};

// ── Assessment ────────────────────────────────────────
export const assessmentAPI = {
  get: () => api.get('/assessment'),
  submit: (data) => api.post('/assessment', data),
  gapAnalysis: () => api.get('/assessment/gap-analysis'),
};

// ── Roadmap ───────────────────────────────────────────
export const roadmapAPI = {
  get: () => api.get('/roadmap'),
  generate: () => api.post('/roadmap/generate'),
  updateItem: (itemId, data) => api.patch(`/roadmap/item/${itemId}`, data),
};

// ── Projects ──────────────────────────────────────────
export const projectsAPI = {
  getRecommended: (params) => api.get('/projects', { params }),
  getAll: (params) => api.get('/projects/all', { params }),
  saveProject: (id, data) => api.post(`/projects/${id}/save`, data),
};

// ── Careers ───────────────────────────────────────────
export const careersAPI = {
  getAll: () => api.get('/careers'),
  getBySlug: (slug) => api.get(`/careers/${slug}`),
};

// ── Resources ─────────────────────────────────────────
export const resourcesAPI = {
  getAll: (params) => api.get('/resources', { params }),
};

// ── Progress / Dashboard ──────────────────────────────
export const progressAPI = {
  getDashboard: () => api.get('/progress'),
  logActivity: (data) => api.post('/progress/activity', data),
};

// ── Goals & Notifications ─────────────────────────────
export const goalsAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.patch(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  getNotifications: () => api.get('/goals/notifications'),
  markAllRead: () => api.patch('/goals/notifications/read-all'),
};
