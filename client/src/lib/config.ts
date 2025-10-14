// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// API Endpoints
export const API_ENDPOINTS = {
  // Questions endpoints
  QUESTIONS: {
    GET_ALL: '/api/questions',
    GET_BY_LEVEL: (level: number) => `/api/questions/level/${level}`,
    GET_WITH_RESPONSES: (userId: string) => `/api/questions/user/${userId}`,
  },
  
  // Question responses endpoints  
  RESPONSES: {
    CREATE: '/api/questions-response',
    CREATE_LEVEL1: '/api/questions-response/level1',
    SUBMIT_LEVEL: '/api/questions-response/submit-level',
    GET_USER_RESPONSES: (userId: string) => `/api/questions-response/user/${userId}`,
  },
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_EMAIL: '/api/auth/verify-email',
  }
};
