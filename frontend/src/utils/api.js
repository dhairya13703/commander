// frontend/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Debug function to check token
const checkToken = () => {
  const token = localStorage.getItem('token');
  console.log('Current token in localStorage:', token ? `${token.substring(0, 20)}...` : 'No token');
  return token;
};

// Request interceptor with detailed logging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('Request method:', config.method);
    
    const token = checkToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added token to request headers');
    } else {
      console.log('No token available for request');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with detailed logging
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('Unauthorized access detected');
      const token = checkToken();
      if (token) {
        console.log('Clearing invalid token');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;