import api from "../lib/api";

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
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const paymentService = {
  // Create checkout session for a level
  createCheckoutSession: async (
    level: number
  ): Promise<CreateCheckoutSessionResponse> => {
    try {
      const response = await api.post("/api/payment/create-checkout", {
        level,
      });
      return response as unknown as CreateCheckoutSessionResponse;
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      throw error;
    }
  },

  // Verify payment after redirect
  verifyPayment: async (sessionId: string): Promise<VerifyPaymentResponse> => {
    try {
      const response = await api.post("/api/payment/verify", { sessionId });
      return response as unknown as VerifyPaymentResponse;
    } catch (error) {
      console.error("Failed to verify payment:", error);
      throw error;
    }
  },

  // Get payment history
  getPaymentHistory: async (): Promise<PaymentHistory[]> => {
    try {
      const response = await api.get("/api/payment/history");
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      throw error;
    }
  },

  // Download invoice
  downloadInvoice: async (sessionId: string): Promise<void> => {
    try {
      // Use fetch with credentials to include cookies
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
        }/api/payment/invoice/${sessionId}`,
        {
          method: "GET",
          credentials: "include", // Include cookies for authentication
          headers: {
            Accept: "application/pdf",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to download invoice" }));
        throw new Error(errorData.message || "Failed to download invoice");
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "invoice.pdf";
      if (contentDisposition) {
        const matches = /filename="(.+)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      // Get the blob and create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice:", error);
      throw error;
    }
  },
};
