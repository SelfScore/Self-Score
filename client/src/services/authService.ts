import api from "../lib/api";
import { store } from "../store";
import { loginSuccess, logout, setLoading, setError } from "../store/slices/authSlice";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface UserData {
  userId: string;
  email: string;
  username: string;
  countryCode?: string;
  phoneNumber?: string;
  purchasedLevels?: {
    level2: {
      purchased: boolean;
      purchaseDate?: Date;
      paymentId?: string;
    };
    level3: {
      purchased: boolean;
      purchaseDate?: Date;
      paymentId?: string;
    };
    level4: {
      purchased: boolean;
      purchaseDate?: Date;
      paymentId?: string;
    };
  };
  progress?: {
    completedLevels: number[];
    highestUnlockedLevel: number;
    testScores: {
      level1?: number;
      level2?: number;
      level3?: number;
      level4?: number;
    };
  };
}

export interface SignUpData {
  username: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  verifyCode: string;
}

export const authService = {
  // Sign up new user
  signUp: async (data: SignUpData): Promise<ApiResponse<UserData>> => {
    store.dispatch(setLoading(true));
    store.dispatch(setError(null));
    
    try {
      const response = await api.post("/api/auth/sign-up", data);
      return response as unknown as ApiResponse<UserData>;
    } catch (error) {
      store.dispatch(setError("Failed to create account"));
      throw error;
    } finally {
      store.dispatch(setLoading(false));
    }
  },

  // Login user
  login: async (data: LoginData): Promise<ApiResponse<UserData>> => {
    store.dispatch(setLoading(true));
    store.dispatch(setError(null));

    try {
      const response = await api.post("/api/auth/login", data);
      const result = response as unknown as ApiResponse<UserData>;
      
      if (result.success && result.data) {
        // Save to Redux store only (cookies handle persistence now)
        store.dispatch(loginSuccess({
          user: {
            userId: result.data.userId,
            email: result.data.email,
            username: result.data.username,
            phoneNumber: result.data.phoneNumber
          },
          purchasedLevels: result.data.purchasedLevels,
          progress: result.data.progress
        }));
      }
      
      return result;
    } catch (error) {
      store.dispatch(setError("Login failed"));
      throw error;
    } finally {
      store.dispatch(setLoading(false));
    }
  },

  // Verify email
  verifyEmail: async (data: VerifyEmailData): Promise<ApiResponse<UserData>> => {
    store.dispatch(setLoading(true));
    store.dispatch(setError(null));

    try {
      const response = await api.post("/api/auth/verify-email", data);
      const result = response as unknown as ApiResponse<UserData>;
      
      if (result.success && result.data) {
        // Save to Redux store only (cookies handle persistence now)
        store.dispatch(loginSuccess({
          user: {
            userId: result.data.userId,
            email: result.data.email,
            username: result.data.username,
            phoneNumber: result.data.phoneNumber
          },
          purchasedLevels: result.data.purchasedLevels,
          progress: result.data.progress
        }));
      }
      
      return result;
    } catch (error) {
      store.dispatch(setError("Verification failed"));
      throw error;
    } finally {
      store.dispatch(setLoading(false));
    }
  },

  // Resend verification code
  resendVerification: async (email: string): Promise<ApiResponse> => {
    store.dispatch(setLoading(true));
    store.dispatch(setError(null));

    try {
      const response = await api.post("/api/auth/resend-verification", { email });
      return response as unknown as ApiResponse;
    } catch (error) {
      store.dispatch(setError("Failed to resend verification"));
      throw error;
    } finally {
      store.dispatch(setLoading(false));
    }
  },

  // Get current user from backend (using cookies for auth)
  getCurrentUser: async (): Promise<UserData | null> => {
    store.dispatch(setLoading(true));
    store.dispatch(setError(null));

    try {
      const response = await api.get("/api/auth/me");
      const result = response as unknown as ApiResponse<UserData>;
      
      if (result.success && result.data) {
        store.dispatch(loginSuccess({
          user: {
            userId: result.data.userId,
            email: result.data.email,
            username: result.data.username,
            phoneNumber: result.data.phoneNumber
          },
          purchasedLevels: result.data.purchasedLevels,
          progress: result.data.progress
        }));
        return result.data;
      }
      
      return null;
    } catch (error) {
      // Don't show error for auth failures (user just not logged in)
      console.log("Failed to get current user:", error);
      return null;
    } finally {
      store.dispatch(setLoading(false));
    }
  },

  // Get user from Redux store
  getCurrentUserFromStore: (): UserData | null => {
    const state = store.getState();
    return state.auth.user;
  },

  // Logout user
  logout: async (): Promise<void> => {
    store.dispatch(setLoading(true));
    
    try {
      // Call backend logout endpoint to clear cookies
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if backend fails
    }
    
    // Clear Redux store
    store.dispatch(logout());
    store.dispatch(setLoading(false));
  },

  // Check if user is authenticated using Redux store
  isAuthenticated: (): boolean => {
    const state = store.getState();
    return state.auth.isAuthenticated;
  },
};
