"use client";

import { Box, CircularProgress } from "@mui/material";
import AdminSidebar from "../components/admin/AdminSidebar";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentAdmin } from "@/services/adminAuthService";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Skip auth check for login page (handle both with and without trailing slash)
  const isLoginPage =
    pathname === "/admin/login" || pathname === "/admin/login/";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkAdminAuth = async () => {
      try {
        await getCurrentAdmin();
        setIsAdminAuthenticated(true);
      } catch (_error) {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [router, isLoginPage, pathname]);

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
    </Box>
  );
}
