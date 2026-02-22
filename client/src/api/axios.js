import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach JWT token on every request if present
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('partify_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
