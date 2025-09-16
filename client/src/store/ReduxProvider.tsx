"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { authService } from "../services/authService";

// Component to initialize auth state from backend
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth state from backend on app start
    const initializeAuth = async () => {
      try {
        await authService.getCurrentUser();
      } catch (error) {
        console.log("User not authenticated or session expired : ", error);
        // This is expected if user is not logged in
      }
    };

    initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
