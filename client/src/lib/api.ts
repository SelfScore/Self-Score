import axios from 'axios';
import { API_BASE_URL } from './config';

export const ACCOUNT_GATE_EVENT = 'selfscore:account-gate-required';

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
    
    // Server says the account must be verified / completed first (payments,
    // Level 4+, bookings). The AccountGateProvider listens and opens the modal.
    const code = error.response?.data?.code;
    if (
      error.response?.status === 403 &&
      (code === 'EMAIL_UNVERIFIED' || code === 'PROFILE_INCOMPLETE') &&
      typeof window !== 'undefined'
    ) {
      window.dispatchEvent(new CustomEvent(ACCOUNT_GATE_EVENT, { detail: { code } }));
    }

    // Handle 401 errors (unauthorized) - could mean token expired
    if (error.response?.status === 401) {
      // Don't automatically redirect here as some 401s are expected
      console.log('Authentication required or token expired');
    }
    
    return Promise.reject(error);
  }
);

export default api;
