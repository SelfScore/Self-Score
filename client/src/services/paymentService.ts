import api from '../lib/api';

export interface CreateCheckoutSessionRequest {
  level: number;
}

export interface CreateCheckoutSessionResponse {
  success: boolean;
  message: string;
  data?: {
    sessionId: string;
    url: string;
  };
}

export interface VerifyPaymentRequest {
  sessionId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    level: number;
    status: string;
    purchaseDate: Date;
  };
}

export interface PaymentHistory {
  _id: string;
  userId: string;
  level: number;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const paymentService = {
  // Create checkout session for a level
  createCheckoutSession: async (level: number): Promise<CreateCheckoutSessionResponse> => {
    try {
      const response = await api.post('/api/payment/create-checkout', { level });
      return response as unknown as CreateCheckoutSessionResponse;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  },

  // Verify payment after redirect
  verifyPayment: async (sessionId: string): Promise<VerifyPaymentResponse> => {
    try {
      const response = await api.post('/api/payment/verify', { sessionId });
      return response as unknown as VerifyPaymentResponse;
    } catch (error) {
      console.error('Failed to verify payment:', error);
      throw error;
    }
  },

  // Get payment history
  getPaymentHistory: async (): Promise<PaymentHistory[]> => {
    try {
      const response = await api.get('/api/payment/history');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      throw error;
    }
  },
};
