"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "./hooks";
import { authService } from "../services/authService";
import { usePathname } from "next/navigation";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "../lib/config";
import { AccountGateProvider } from "../app/components/auth/AccountGateProvider";

// Component to initialize auth state from backend
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const initializedRef = useRef(false); // ✅ Track if already initialized
  const isAdminRoute = pathname?.startsWith("/admin");
  const isConsultantRoute = pathname?.startsWith("/consultant");

  useEffect(() => {
    // Skip auth initialization for admin and consultant routes
    if (isAdminRoute || isConsultantRoute) {
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
    // ✅ Only depend on dispatch, isAdminRoute, and isConsultantRoute (won't change during session)
  }, [dispatch, isAdminRoute, isConsultantRoute]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const content = (
    <Provider store={store}>
      <AccountGateProvider>
        <AuthInitializer>{children}</AuthInitializer>
      </AccountGateProvider>
    </Provider>
  );

  // Google Identity Services script is only loaded when a client id is configured
  return GOOGLE_CLIENT_ID ? (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{content}</GoogleOAuthProvider>
  ) : (
    content
  );
}
