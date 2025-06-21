export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    timeout: 10000,
  },
  auth: {
    tokenKey: 'wanderlust_token',
    userKey: 'wanderlust_user',
  },
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  },
}; 