import api from "../lib/api";
import { store } from "../store";
import {
  loginSuccess,
  logout,
  setLoading,
  setError,
  setInitialized,
} from "../store/slices/authSlice";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  /** Machine-readable error code from the server, e.g. EMAIL_UNVERIFIED */
  code?: string;
}

export interface UserData {
  userId: string;
  email: string;
  username: string;
  country?: string;
  gender?: string;
  ageGroup?: string;
  countryCode?: string;
  phoneNumber?: string;
  createdAt?: string | Date;
  isVerified?: boolean;
  isProfileComplete?: boolean;
  hasPassword?: boolean;
  authProviders?: string[];
  avatarUrl?: string;
  onboardingSkipped?: boolean;
  verificationPending?: boolean;
  /** Only returned by Google sign-in */
  isNewUser?: boolean;
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
      remainingAttempts: number;
      purchaseDate?: Date;
      paymentId?: string;
    };
    level5: {
      remainingAttempts: number;
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
      level5?: number;
    };
  };
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface OnboardingData {
  country: string;
  gender: string;
  ageGroup: string;
}

/** Store a user returned by any auth endpoint in Redux */
const storeUser = (data: UserData): void => {
  store.dispatch(
    loginSuccess({
      user: {
        userId: data.userId,
        email: data.email,
        username: data.username,
        country: data.country,
        gender: data.gender,
        ageGroup: data.ageGroup,
        countryCode: data.countryCode,
        phoneNumber: data.phoneNumber,
        createdAt: data.createdAt,
        isVerified: data.isVerified,
        isProfileComplete: data.isProfileComplete,
        hasPassword: data.hasPassword,
        authProviders: data.authProviders,
        avatarUrl: data.avatarUrl,
        onboardingSkipped: data.onboardingSkipped,
        verificationPending: data.verificationPending,
      },
      purchasedLevels: data.purchasedLevels as any,
      progress: data.progress,
    })
  );
};

/** POST helper: stores the returned user in Redux when present */
const postAndStoreUser = async <T extends UserData>(
  url: string,
  body: unknown,
  method: "post" | "patch" = "post"
): Promise<ApiResponse<T>> => {
  store.dispatch(setLoading(true));
  store.dispatch(setError(null));
  try {
    const result = (await api[method](url, body)) as unknown as ApiResponse<T>;
    if (result.success && result.data?.userId) {
      storeUser(result.data);
    }
    return result;
  } finally {
    store.dispatch(setLoading(false));
  }
};

const post = async (url: string, body?: unknown): Promise<ApiResponse> =>
  (await api.post(url, body)) as unknown as ApiResponse;

export const authService = {
  // ---- Sign up / sign in ----

  /** Email + password sign-up. Signs the user in immediately. */
  signUp: (data: SignUpData) => postAndStoreUser<UserData>("/api/auth/sign-up", data),

  /** Email + password sign-in */
  login: (data: LoginData) => postAndStoreUser<UserData>("/api/auth/login", data),

  /** Google Identity Services credential (ID token) */
  googleAuth: (credential: string, rememberMe = false) =>
    postAndStoreUser<UserData>("/api/auth/google", { credential, rememberMe }),

  /** Custom Google button: one-time auth code from the popup, exchanged by the server */
  googleAuthCode: (code: string, rememberMe = false) =>
    postAndStoreUser<UserData>("/api/auth/google", { code, rememberMe }),

  /** Email-first sign-up: is there already an account for this email? */
  checkEmail: (email: string) =>
    post("/api/auth/check-email", { email }) as Promise<ApiResponse<{ exists: boolean }>>,

  /** Fallback: email me a one-time login code */
  requestLoginCode: (email: string) => post("/api/auth/login/code", { email }),

  verifyLoginCode: (email: string, code: string, rememberMe = false) =>
    postAndStoreUser<UserData>("/api/auth/login/code/verify", { email, code, rememberMe }),

  // ---- Email verification ----

  /** (Re)send the verification link + code to the signed-in user */
  sendVerificationEmail: () => post("/api/auth/verify-email/send"),

  /** Signed-in user enters the 6-digit code */
  verifyEmailCode: (code: string) =>
    postAndStoreUser<UserData>("/api/auth/verify-email", { code }),

  /** Token from the link in the email (works when signed out) */
  verifyEmailLink: (token: string) => post("/api/auth/verify-email/link", { token }),

  // ---- Passwords ----

  forgotPassword: (email: string) => post("/api/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string, confirmPassword: string) =>
    postAndStoreUser<UserData>("/api/auth/reset-password", { token, password, confirmPassword }),

  /** Set a first password, or change it (currentPassword required then) */
  setPassword: (newPassword: string, currentPassword?: string) =>
    postAndStoreUser<UserData>("/api/auth/password", { newPassword, currentPassword }),

  // ---- Onboarding ----

  completeOnboarding: (data: OnboardingData) =>
    postAndStoreUser<UserData>("/api/auth/onboarding", data, "patch"),

  skipOnboarding: () =>
    postAndStoreUser<UserData>("/api/auth/onboarding", { skip: true }, "patch"),

  // ---- Session ----

  // Get current user from backend (using cookies for auth)
  getCurrentUser: async (): Promise<UserData | null> => {
    store.dispatch(setLoading(true));
    store.dispatch(setError(null));

    try {
      const result = (await api.get("/api/auth/me")) as unknown as ApiResponse<UserData>;

      if (result.success && result.data) {
        storeUser(result.data);
        return result.data;
      }

      // No user but auth check is complete
      store.dispatch(setInitialized());
      return null;
    } catch (error: any) {
      // A 401 means the session is gone (expired / revoked): clear any stale state
      if (error?.response?.status === 401 && store.getState().auth.isAuthenticated) {
        store.dispatch(logout());
      }
      store.dispatch(setInitialized());
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

    store.dispatch(logout());
    store.dispatch(setLoading(false));
  },

  // Check if user is authenticated using Redux store
  isAuthenticated: (): boolean => {
    const state = store.getState();
    return state.auth.isAuthenticated;
  },

  // ---- Profile ----

  updateProfile: async (data: {
    username?: string;
    email?: string;
    country?: string;
    gender?: string;
    ageGroup?: string;
    countryCode?: string;
    phoneNumber?: string;
  }): Promise<ApiResponse<UserData>> => {
    store.dispatch(setLoading(true));

    try {
      const response: ApiResponse<UserData> = await api.patch("/api/auth/profile", data);

      // If an email change is pending, the user hasn't changed yet
      if (response.success && response.data?.userId) {
        storeUser(response.data);
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      store.dispatch(setError(errorMessage));
      throw error;
    } finally {
      store.dispatch(setLoading(false));
    }
  },

  verifyEmailUpdate: async (data: {
    newEmail: string;
    verifyCode: string;
  }): Promise<ApiResponse<UserData>> => {
    store.dispatch(setLoading(true));

    try {
      const response: ApiResponse<UserData> = await api.post(
        "/api/auth/verify-email-update",
        data
      );

      if (response.success && response.data?.userId) {
        storeUser(response.data);
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to verify email";
      store.dispatch(setError(errorMessage));
      throw error;
    } finally {
      store.dispatch(setLoading(false));
    }
  },
};
