import axios from 'axios';
import { API_ENDPOINTS } from '@/services/api';

// Server-side axios instance
const serverApi = axios.create({
  baseURL: API_ENDPOINTS.baseURL,
});

// Request interceptor for server-side
serverApi.interceptors.request.use(
  async (config) => {
    // Cookie'leri header üzerinden almak
    const headers = config.headers || {};
    if (headers['x-access-token']) {
      config.headers['Authorization'] = `Bearer ${headers['x-access-token']}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default serverApi; 