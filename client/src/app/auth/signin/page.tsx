"use client";

import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import NextLink from "next/link";
import Image from "next/image";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function SignInPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#FFFFFF",
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          alignItems: { xs: "center", md: "flex-start" },
          gap: { xs: 3, md: 3 },
          marginTop: { xs: 8, md: 12 },
        }}
      >
        {/* Left Side - Image */}
        <Box
          sx={{
            position: "relative",
            display: { xs: "none", md: "block" },
            width: { md: "48%", lg: "50%" },
            minHeight: "798px",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              position: "relative",
              height: "582px",
              width: "100%",
              maxWidth: "690px",
            }}
          >
            <Image
              src="/images/LandingPage/AuthImg.webp"
              alt="Authentication"
              fill
              style={{
                objectFit: "cover",
                borderTopRightRadius: "60px",
                borderBottomRightRadius: "60px",
              }}
              priority
            />
          </Box>
        </Box>

        {/* Right Side - Form */}
        <Box
          sx={{
            width: { xs: "100%", md: "48%", lg: "50%" },
            maxWidth: { xs: "627px", md: "627px" },
            px: { xs: 2, sm: 3, md: 0 },
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <Box sx={{ textAlign: { xs: "center", md: "centre" }, mb: 4 }}>
            <Typography
              sx={{
                fontWeight: "700",
                color: "#000",
                mb: 0,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "40px" },
                fontFamily: "Faustina",
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              sx={{
                color: "#6B7280",
                fontSize: { xs: "16px", md: "18px" },
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
              }}
            >
              Sign in to continue your self-discovery journey
            </Typography>
          </Box>

          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || localError}
            </Alert>
          )}

          <Box
            sx={{
              border: "1px solid #3A3A3A4D",
              borderRadius: "16px",
              py: { xs: 3, md: 4 },
              px: { xs: 2, md: 2.5 },
              width: "100%",
              bgcolor: "#FFFFFF",
            }}
            component="form"
            onSubmit={handleSubmit}
          >
            <Typography
              sx={{
                mb: 1,
                color: "#2C3E50",
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
              }}
            >
              Email Address<span style={{ color: "#FF5722" }}>*</span>
            </Typography>
            <TextField
              placeholder="Enter your email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  "& fieldset": { border: "1px solid #3A3A3A4D" },
                  "&:hover fieldset": { border: "1px solid #3A3A3A4D" },
                  "&.Mui-focused fieldset": { border: "1px solid #FF5722" },
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:hover": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
              }}
            />

            <Typography
              sx={{
                mb: 1,
                color: "#2C3E50",
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
              }}
            >
              Password<span style={{ color: "#FF5722" }}>*</span>
            </Typography>
            <TextField
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  "& fieldset": { border: "1px solid #3A3A3A4D" },
                  "&:hover fieldset": { border: "1px solid #3A3A3A4D" },
                  "&.Mui-focused fieldset": { border: "1px solid #FF5722" },
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:hover": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: "#999",
                      "&.Mui-checked": { color: "#FF5722" },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Remember me
                  </Typography>
                }
              />
              <Link
                component={NextLink}
                href="/auth/forgot-password"
                sx={{
                  color: "#0066cc",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              sx={{
                py: 1.5,
                background: "#FF5722",
                color: "#fff",
                fontWeight: "600",
                fontSize: "1.1rem",
                borderRadius: "12px",
                textTransform: "none",
                height: "40px",
                fontFamily: "Source Sans Pro",
                "&:hover": { background: "#E64A19" },
                "&:disabled": { background: "#ccc", opacity: 0.7 },
                mb: 2,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : (
                "Login"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Don't have an account?{" "}
                <Link
                  component={NextLink}
                  href="/auth/signup"
                  sx={{
                    color: "#0066cc",
                    fontWeight: "600",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
