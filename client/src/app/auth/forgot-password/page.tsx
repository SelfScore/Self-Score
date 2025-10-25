"use client";

import {
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import NextLink from "next/link";
import EmailIcon from "@mui/icons-material/Email";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import api from "../../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response: any = await api.post("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      if (response.success) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(response.message || "Failed to send reset link");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset link. Please try again."
      );
    } finally {
      setLoading(false);
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
        py: { xs: 4, sm: 6, md: 8 },
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "500px",
          bgcolor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          padding: { xs: "30px 20px", sm: "40px 30px" },
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: "Faustina",
            fontSize: { xs: "28px", sm: "32px" },
            fontWeight: 700,
            color: "#000000",
            textAlign: "center",
            mb: 1,
          }}
        >
          Forgot Password?
        </Typography>

        {/* Subtitle */}
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", sm: "16px" },
            fontWeight: 400,
            color: "#6B7280",
            textAlign: "center",
            mb: 4,
          }}
        >
          No worries, we'll send you reset instructions
        </Typography>

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Password reset link has been sent to your email. Please check your
            inbox.
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                mb: 1,
              }}
            >
              Email Address<span style={{ color: "#E87A42" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setSuccess(false);
              }}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#F9FAFB",
                  "& fieldset": {
                    borderColor: "#E5E7EB",
                  },
                  "&:hover fieldset": {
                    borderColor: "#E87A42",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#E87A42",
                  },
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 100px #F9FAFB inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:hover": {
                  WebkitBoxShadow: "0 0 0 100px #F9FAFB inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 100px #F9FAFB inset",
                  WebkitTextFillColor: "#000000",
                },
              }}
            />
          </Box>

          {/* Submit Button */}
          <ButtonSelfScore
            type="submit"
            text={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Send Reset Link"
              )
            }
            disabled={loading}
            fullWidth
            background="#E87A42"
            style={{
              marginBottom: "20px",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          />

          {/* Login Link */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                color: "#6B7280",
              }}
            >
              Have your password?{" "}
              <Link
                component={NextLink}
                href="/auth/signin"
                sx={{
                  color: "#E87A42",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
