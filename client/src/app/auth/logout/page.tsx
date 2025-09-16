"use client";

import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        logout();
        // Add a small delay to show the logout message
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } catch (error) {
        console.error("Logout error:", error);
        router.push("/");
      }
    };

    performLogout();
  }, [logout, router]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <CircularProgress size={60} sx={{ color: "#E87A42", mb: 3 }} />
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", mb: 2, color: "#005F73" }}
      >
        Logging you out...
      </Typography>
      <Typography variant="body1" sx={{ color: "#666" }}>
        Thank you for using LifeScore Assessment
      </Typography>
    </Box>
  );
}
