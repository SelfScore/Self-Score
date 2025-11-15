"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "./hooks";
import { authService } from "../services/authService";
import { usePathname } from "next/navigation";

// Component to initialize auth state from backend
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const initializedRef = useRef(false); // ✅ Track if already initialized
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    // Skip auth initialization for admin routes
    if (isAdminRoute) {
      return;
    }

    // ✅ Only initialize once on mount, not on every pathname change
    if (initializedRef.current) {
      return;
    }

    // Initialize auth state from backend on app start
    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing user authentication...");
        await authService.getCurrentUser();
        initializedRef.current = true; // ✅ Mark as initialized
        console.log("✅ User authentication initialized");
      } catch (_error) {
        console.log("⚠️ User not authenticated or session expired");
        initializedRef.current = true; // ✅ Mark as initialized even on error
        // This is expected if user is not logged in
      }
    };

    initializeAuth();
    // ✅ Only depend on dispatch and isAdminRoute (won't change during session)
  }, [dispatch, isAdminRoute]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
