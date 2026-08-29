import axios from 'axios';

const serverUrl = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: `${serverUrl}/api`,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { serverUrl };
export default api;