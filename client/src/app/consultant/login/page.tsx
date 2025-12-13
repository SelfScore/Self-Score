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
  Chip,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import Image from "next/image";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { consultantAuthService } from "@/services/consultantAuthService";

export default function ConsultantLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setLocalError("");
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

    setIsLoading(true);
    try {
      const response = await consultantAuthService.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.success && response.data?.consultant) {
        const { consultant } = response.data;

        // Check if registration is incomplete (registrationStep < 4)
        if (consultant.registrationStep && consultant.registrationStep < 4) {
          // Store consultant data for resume
          sessionStorage.setItem("consultantId", consultant.consultantId);
          sessionStorage.setItem(
            "consultantCurrentStep",
            consultant.registrationStep.toString()
          );

          // Redirect to the step where they left off
          router.push(
            `/consultant/register?step=${consultant.registrationStep}`
          );
        } else {
          // Registration complete, go to dashboard
          router.push("/consultant/dashboard");
        }
      } else {
        setLocalError(response.message || "Login failed");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setLocalError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
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
              Sign in to access your consultant portal
            </Typography>
          </Box>

          {localError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {localError}
            </Alert>
          )}

          {/* Login Type Chips */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              justifyContent: "center",
            }}
          >
            <Chip
              label="User"
              onClick={() => router.push("/auth/signin")}
              sx={{
                backgroundColor: "transparent",
                color: "#666",
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
                fontWeight: 500,
                px: 3,
                py: 0.5,
                height: "auto",
                borderRadius: "24px",
                border: "1px solid #E0E0E0",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#F5F5F5",
                },
              }}
            />
            <Chip
              label="Consultant"
              onClick={() => router.push("/consultant/login")}
              sx={{
                backgroundColor: "#FF5722",
                color: "#fff",
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
                fontWeight: 600,
                px: 3,
                py: 0.5,
                height: "auto",
                borderRadius: "24px",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#E64A19",
                },
              }}
            />
          </Box>

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
                href="/consultant/forgot-password"
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
                  href="/consultant/register"
                  sx={{
                    color: "#0066cc",
                    fontWeight: "600",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Register as a Consultant
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
