import axios from 'axios';
import { API_BASE_URL } from './config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds - increased for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // No need to manually add tokens - cookies are sent automatically
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle 401 errors (unauthorized) - could mean token expired
    if (error.response?.status === 401) {
      // Don't automatically redirect here as some 401s are expected
      console.log('Authentication required or token expired');
    }
    
    return Promise.reject(error);
  }
);

export default api;
