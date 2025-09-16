import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/config';

// Types for questions and responses
export interface Question {
  _id: string;
  questionText: string;
  options: string[];
  level: number;
  correctOptionIndex?: number;
  questionType?: string; // "multiple-choice" or "slider-scale"
  userResponse?: {
    selectedOptionIndex: number;
    answeredAt: string;
    responseId?: string;
  } | null;
}

export interface QuestionResponse {
  userId: string;
  level: number;
  questionId: string;
  selectedOptionIndex: number;
}

export interface QuestionsApiResponse {
  success: boolean;
  count?: number;
  data: Question[];
  hasUserResponses?: boolean;
  message?: string;
  error?: string;
}

export interface ResponseApiResponse {
  success: boolean;
  data: any;
  message?: string;
  error?: string;
}

// Questions API functions
export const questionsApi = {
  // Get all questions
  getAllQuestions: async (): Promise<QuestionsApiResponse> => {
    return await api.get(API_ENDPOINTS.QUESTIONS.GET_ALL);
  },

  // Get questions by level
  getQuestionsByLevel: async (level: number, userId?: string): Promise<QuestionsApiResponse> => {
    const url = userId 
      ? `${API_ENDPOINTS.QUESTIONS.GET_BY_LEVEL(level)}?userId=${userId}`
      : API_ENDPOINTS.QUESTIONS.GET_BY_LEVEL(level);
    return await api.get(url);
  },

  // Get questions with user responses
  getQuestionsWithResponses: async (userId: string, level?: number): Promise<QuestionsApiResponse> => {
    const url = level 
      ? `${API_ENDPOINTS.QUESTIONS.GET_WITH_RESPONSES(userId)}?level=${level}`
      : API_ENDPOINTS.QUESTIONS.GET_WITH_RESPONSES(userId);
    return await api.get(url);
  },

  // Submit question response
  submitResponse: async (response: QuestionResponse): Promise<ResponseApiResponse> => {
    return await api.post(API_ENDPOINTS.RESPONSES.CREATE, response);
  },

  // Get user responses
  getUserResponses: async (userId: string): Promise<ResponseApiResponse> => {
    return await api.get(API_ENDPOINTS.RESPONSES.GET_USER_RESPONSES(userId));
  },
};
