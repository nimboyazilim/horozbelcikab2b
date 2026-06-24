import axios from 'axios';
import Cookies from 'js-cookie';
import { API_ENDPOINTS } from '@/config/api';
import { addLog, generateActionMessage } from '@/lib/activityLogger';

// Axios instance'ı oluşturuyoruz
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
  (response) => {
    try {
      // Özel log mesajı varsa doğrudan kullan
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const custom = (response.config as any)._logAction as { action: string; category: string } | undefined;
      if (custom) {
        addLog(custom.action, custom.category, 'basarili');
        return response;
      }

      const method = response.config.method || '';
      const url = response.config.url || '';
      let requestData: Record<string, unknown> | undefined = undefined;
      if (response.config.data) {
        if (response.config.data instanceof FormData) {
          requestData = {};
          response.config.data.forEach((value, key) => {
            if (typeof value === 'string') {
              (requestData as Record<string, unknown>)[key] = value;
            }
          });
        } else if (typeof response.config.data === 'string') {
          try { requestData = JSON.parse(response.config.data); } catch { /* non-JSON */ }
        } else if (typeof response.config.data === 'object') {
          requestData = response.config.data as Record<string, unknown>;
        }
      }
      const result = generateActionMessage(method, url, requestData);
      if (result) {
        addLog(result.action, result.category, 'basarili');
      }
    } catch { /* log hatası asıl isteği etkilemesin */ }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Refresh token'ı al
      const refreshToken = Cookies.get('refreshToken');

      if (refreshToken) {
        try {
          // Refresh token ile yeni accessToken al
          const refreshResponse = await axios.post(API_ENDPOINTS.refreshToken, { refreshToken });
          
          const newAccessToken = refreshResponse.data.accessToken;
          Cookies.set('accessToken', newAccessToken, { expires:  1/24  });

          // Yenilenen token'ı header'a ekleyip isteği tekrar yap
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (err) {
          console.error('Refresh token ile yeni token alınamadı', err);
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }
    }

    try {
      const method = error.config?.method || '';
      const url = error.config?.url || '';
      if (error.response?.status !== 401) {
        const result = generateActionMessage(method, url, undefined);
        if (result) {
          const msg = error.response?.data?.message || error.message || 'Bilinmeyen hata';
          addLog(result.action, result.category, 'basarisiz', msg);
        }
      }
    } catch { /* log hatası asıl isteği etkilemesin */ }

    return Promise.reject(error);
  }
);

export default api;