"use client";

import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Container,
  Paper,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import NextLink from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/user/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setLocalError("");
    clearError();
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setLocalError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError("Please enter a valid email address");
      return false;
    }
    if (!formData.password.trim()) {
      setLocalError("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.success) {
        // Redirect to dashboard or previous page
        const redirectTo =
          new URLSearchParams(window.location.search).get("redirect") ||
          "/user/dashboard";
        router.push(redirectTo);
      } else {
        setLocalError(response.message || "Login failed");
      }
    } catch (err: any) {
      if (
        err.response?.data?.message ===
        "Please verify your email before logging in"
      ) {
        setLocalError("Please verify your email first");
        setTimeout(() => {
          router.push(
            `/auth/verify-email?email=${encodeURIComponent(formData.email)}`
          );
        }, 2000);
      } else {
        setLocalError(
          err.response?.data?.message || "Login failed. Please try again."
        );
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#005F73", mb: 2 }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ color: "#666" }}>
            Sign in to continue your LifeScore journey
          </Typography>
        </Box>

        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || localError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={isLoading}
          />

          <TextField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={isLoading}
          />

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              background: "#E87A42",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1.1rem",
              "&:hover": { background: "#D16A35" },
              "&:disabled": { background: "#ccc" },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Sign In"
            )}
          </Button>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
              Don't have an account?{" "}
              <Link
                component={NextLink}
                href="/auth/signup"
                sx={{
                  color: "#E87A42",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Create Account
              </Link>
            </Typography>

            <Link
              component={NextLink}
              href="/auth/forgot-password"
              sx={{
                color: "#005F73",
                textDecoration: "none",
                fontSize: "0.9rem",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Forgot your password?
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
