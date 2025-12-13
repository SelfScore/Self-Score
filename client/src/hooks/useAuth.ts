import { useAppSelector, useAppDispatch } from '../store/hooks';
// import { loginSuccess, logout, setError, clearError } from '../store/slices/authSlice';
import { clearError } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import type {  LoginData, SignUpData, VerifyEmailData } from '../services/authService';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, isInitialized, error, progress, purchasedLevels } = useAppSelector((state) => state.auth);

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      const response = await authService.signUp(data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (data: VerifyEmailData) => {
    try {
      const response = await authService.verifyEmail(data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const response = await authService.resendVerification(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logoutUser = () => {
    authService.logout();
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    progress,
    purchasedLevels,
    
    // Actions
    login,
    signUp,
    verifyEmail,
    resendVerification,
    logout: logoutUser,
    clearError: clearAuthError,
  };
};
