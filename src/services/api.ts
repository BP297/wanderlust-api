import axios from 'axios';
import { AuthResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 如果是 401 錯誤且不是重試的請求
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });

        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (error) {
        // 重新整理 token 失敗，登出用戶
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: any) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: any) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: FormData) => {
    const response = await api.patch('/auth/me', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export const hotelAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/hotels', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  },

  create: async (data: FormData) => {
    const response = await api.post('/hotels', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  update: async (id: string, data: FormData) => {
    const response = await api.patch(`/hotels/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/hotels/${id}`);
    return response.data;
  },

  addToFavorites: async (id: string) => {
    const response = await api.post(`/hotels/${id}/favorites`);
    return response.data;
  },

  removeFromFavorites: async (id: string) => {
    const response = await api.delete(`/hotels/${id}/favorites`);
    return response.data;
  },

  getFavorites: async () => {
    const response = await api.get('/hotels/favorites');
    return response.data;
  }
};

export const messageAPI = {
  getAll: async () => {
    const response = await api.get('/messages');
    return response.data;
  },

  send: async (data: any) => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  }
};

export default api; 