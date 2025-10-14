import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserData {
  userId: string;
  email: string;
  username: string;
  phoneNumber?: string;
}

export interface PurchasedLevelsData {
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
}

export interface ProgressData {
  completedLevels: number[];
  highestUnlockedLevel: number;
  testScores: {
    level1?: number;
    level2?: number;
    level3?: number;
    level4?: number;
  };
}

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  purchasedLevels: PurchasedLevelsData | null;
  progress: ProgressData | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  purchasedLevels: null,
  progress: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Login success
    loginSuccess: (state, action: PayloadAction<{user: UserData, purchasedLevels?: PurchasedLevelsData, progress?: ProgressData}>) => {
      state.user = action.payload.user;
      state.purchasedLevels = action.payload.purchasedLevels || null;
      state.progress = action.payload.progress || null;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.purchasedLevels = null;
      state.progress = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update user data
    updateUser: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Update purchased levels data
    updatePurchasedLevels: (state, action: PayloadAction<PurchasedLevelsData>) => {
      state.purchasedLevels = action.payload;
    },

    // Update progress data
    updateProgress: (state, action: PayloadAction<ProgressData>) => {
      state.progress = action.payload;
    },

    // Initialize auth state from localStorage (for hydration)
    initializeAuth: (state, action: PayloadAction<{user: UserData, purchasedLevels?: PurchasedLevelsData, progress?: ProgressData} | null>) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.purchasedLevels = action.payload.purchasedLevels || null;
        state.progress = action.payload.progress || null;
        state.isAuthenticated = true;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  loginSuccess,
  logout,
  clearError,
  updateUser,
  updatePurchasedLevels,
  updateProgress,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;
