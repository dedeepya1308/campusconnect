import axios from 'axios';

const serverBaseUrl = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/api\/?$/, '');

export const serverUrl = (path = '') => `${serverBaseUrl}${path}`;

const api = axios.create({
  baseURL: `${serverBaseUrl}/api`,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
