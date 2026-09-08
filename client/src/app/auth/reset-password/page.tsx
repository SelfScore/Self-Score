"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    // Passwords are deprecated for users in favor of OTP passwordless login
    router.replace("/auth/signin");
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        bgcolor: "#FFFFFF",
      }}
    >
      <CircularProgress sx={{ color: "#FF5722" }} />
      <Typography sx={{ color: "#666", fontFamily: "Source Sans Pro" }}>
        Redirecting to Passwordless Sign In...
      </Typography>
    </Box>
  );
}
