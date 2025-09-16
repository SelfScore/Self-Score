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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import NextLink from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setLocalError("");
    clearError();
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setLocalError("Username is required");
      return false;
    }
    if (!formData.email.trim()) {
      setLocalError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError("Please enter a valid email address");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setLocalError("Phone number is required");
      return false;
    }
    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await signUp({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        setSuccess(
          "Account created successfully! Please check your email for verification."
        );
        // Redirect to verification page with email
        setTimeout(() => {
          router.push(
            `/auth/verify-email?email=${encodeURIComponent(formData.email)}`
          );
        }, 2000);
      } else {
        setLocalError(response.message || "Failed to create account");
      }
    } catch (err: any) {
      setLocalError(
        err.response?.data?.message ||
          "Failed to create account. Please try again."
      );
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
            Create Account
          </Typography>
          <Typography variant="body1" sx={{ color: "#666" }}>
            Join LifeScore to track your personal development journey
          </Typography>
        </Box>

        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || localError}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={isLoading}
          />

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
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
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
            helperText="Minimum 6 characters"
          />

          <TextField
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
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
              "Create Account"
            )}
          </Button>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Already have an account?{" "}
              <Link
                component={NextLink}
                href="/auth/signin"
                sx={{
                  color: "#E87A42",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
