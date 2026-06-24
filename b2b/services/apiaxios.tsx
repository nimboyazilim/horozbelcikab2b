import axios from 'axios';
import Cookies from 'js-cookie';
import { API_ENDPOINTS } from '@/services/api';

// Client-side axios instance
const api = axios.create({
  baseURL: API_ENDPOINTS.baseURL,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refreshToken');

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(API_ENDPOINTS.refreshToken, { refreshToken });
          
          const newAccessToken = refreshResponse.data.accessToken;
          Cookies.set('accessToken', newAccessToken, { expires: 5/24 });

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (err) {
          console.error('Token yenilenemedi', err);
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;