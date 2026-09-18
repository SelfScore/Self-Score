"use client";

import { Box, CircularProgress } from "@mui/material";
import AdminSidebar from "../components/admin/AdminSidebar";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getCurrentAdmin } from "@/services/adminAuthService";
import SupportHubWidget from "../components/admin/SupportHubWidget";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const checkedAuthRef = useRef(false); // ✅ Track if auth was already checked

  // Skip auth check for login page (handle both with and without trailing slash)
  const isLoginPage =
    pathname === "/admin/login" || pathname === "/admin/login/";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    // ✅ Only check auth once, not on every pathname change
    if (checkedAuthRef.current) {
      return;
    }

    const checkAdminAuth = async () => {
      try {
        console.log("🔄 Checking admin authentication...");
        await getCurrentAdmin();
        setIsAdminAuthenticated(true);
        checkedAuthRef.current = true; // ✅ Mark as checked
        console.log("✅ Admin authenticated");
      } catch (_error) {
        console.log("⚠️ Admin not authenticated, redirecting to login");
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
    // ✅ Only depend on router and isLoginPage (won't change during session)
  }, [router, isLoginPage]);

  // Show login page without auth check
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}
    >
      <AdminSidebar />
      <Box
        sx={{
          flex: 1,
          marginLeft: "280px",
          p: 4,
        }}
      >
        {children}
      </Box>
      <SupportHubWidget />
    </Box>
  );
}
