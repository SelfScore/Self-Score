import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserData {
  userId: string;
  email: string;
  username: string;
  phoneNumber?: string;
}

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
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
    loginSuccess: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    // Logout
    logout: (state) => {
      state.user = null;
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

    // Initialize auth state from localStorage (for hydration)
    initializeAuth: (state, action: PayloadAction<UserData | null>) => {
      if (action.payload) {
        state.user = action.payload;
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
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;
