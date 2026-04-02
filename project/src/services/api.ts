import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const auth = {
  loginWithGoogle: () => window.location.href = `${API_URL}/auth/google`,
  register: (data: { name: string; email: string; password: string; phone: string }) => 
    api.post('/users/register', data),
  getCurrentUser: () => api.get('/users/current'),
  logout: () => api.post('/auth/logout'),
};

export const items = {
  register: (data: FormData) => api.post('/items/register', data),
  scan: (itemId: string) => api.post('/items/scan', { itemId }),
  getAll: () => api.get('/admin/items'),
};

export const reports = {
  create: (data: FormData) => api.post('/items/report', data),
};

export default api;