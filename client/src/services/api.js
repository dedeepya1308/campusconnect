import axios from 'axios';

const serverUrl = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: `${serverUrl}/api`,
});

export { serverUrl };
export default api;