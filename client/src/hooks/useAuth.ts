import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearError } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import type { LoginData, SignUpData } from '../services/authService';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, isInitialized, error, progress, purchasedLevels } = useAppSelector((state) => state.auth);

  const isEmailVerified = Boolean(user?.isVerified);
  const isProfileComplete = Boolean(user?.isProfileComplete);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    progress,
    purchasedLevels,

    // Account status
    isEmailVerified,
    isProfileComplete,
    /** Ready for payments / Level 4+ / bookings */
    isAccountReady: isAuthenticated && isEmailVerified && isProfileComplete,
    hasPassword: Boolean(user?.hasPassword),

    // Actions
    login: (data: LoginData) => authService.login(data),
    signUp: (data: SignUpData) => authService.signUp(data),
    logout: () => authService.logout(),
    clearError: () => {
      dispatch(clearError());
    },
  };
};
