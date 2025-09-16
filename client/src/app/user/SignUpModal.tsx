"use client";

import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Link,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useState } from "react";
import { authService, UserData } from "../../services/authService";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (userData: any) => void;
}

type AuthStep = "login" | "signup" | "verify" | "password";

export default function SignUpModal({
  open,
  onClose,
  onSuccess,
}: SignUpModalProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    verifyCode: "",
    password: "",
    confirmPassword: "",
  });

  const [_tempUserData, setTempUserData] = useState<UserData | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(""); // Clear error when user types
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6; // Minimum 6 characters
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError("");

      // Validation
      if (!formData.username.trim()) {
        setError("Username is required");
        return;
      }
      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }
      if (!formData.phoneNumber.trim()) {
        setError("Phone number is required");
        return;
      }
      if (!validatePassword(formData.password)) {
        setError("Password must be at least 6 characters long");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const response = await authService.signUp({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        setTempUserData(response.data || null);
        setSuccess(
          "Account created! Please check your email for verification code."
        );
        setCurrentStep("verify");
      } else {
        setError(response.message || "Failed to create account");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setLoading(true);
      setError("");

      if (!formData.verifyCode.trim()) {
        setError("Verification code is required");
        return;
      }

      // For testing purposes, accept "1111" as valid code
      let verifyCode = formData.verifyCode.trim();
      if (verifyCode === "111111") {
        // Use a default valid code for testing
        verifyCode = "111111";
      }

      const response = await authService.verifyEmail({
        email: formData.email.trim().toLowerCase(),
        verifyCode: verifyCode,
      });

      if (response.success) {
        setSuccess("Email verified successfully! You can now log in.");
        // Auto login after verification
        await handleLogin(true);
      } else {
        setError(response.message || "Invalid verification code");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to verify email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (autoLogin = false) => {
    try {
      setLoading(true);
      if (!autoLogin) setError("");

      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }
      if (!formData.password.trim()) {
        setError("Password is required");
        return;
      }

      const response = await authService.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.success && response.data) {
        setSuccess("Login successful!");

        // Store user data in localStorage
        // authService.saveUser(response.data);

        // Call success callback
        if (onSuccess) {
          onSuccess(response.data);
        }

        // Close modal after a brief delay
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      if (
        err.response?.data?.message ===
        "Please verify your email before logging in"
      ) {
        setError("Please verify your email first");
        setCurrentStep("verify");
      } else {
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authService.resendVerification(
        formData.email.trim().toLowerCase()
      );

      if (response.success) {
        setSuccess("Verification code sent! Please check your email.");
      } else {
        setError(response.message || "Failed to resend verification code");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to resend verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      phoneNumber: "",
      verifyCode: "",
      password: "",
      confirmPassword: "",
    });
    setCurrentStep("signup");
    setError("");
    setSuccess("");
    setTempUserData(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderSignUpStep = () => (
    <Box>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          textAlign: "center",
          fontWeight: "bold",
          color: "#005F73",
        }}
      >
        Create Account
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Username"
          value={formData.username}
          onChange={(e) => handleInputChange("username", e.target.value)}
          fullWidth
          variant="outlined"
        />

        <TextField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          fullWidth
          variant="outlined"
        />

        <TextField
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          fullWidth
          variant="outlined"
        />

        <TextField
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          fullWidth
          variant="outlined"
          helperText="Minimum 6 characters"
        />

        <TextField
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          fullWidth
          variant="outlined"
        />

        <Button
          onClick={handleSignUp}
          disabled={loading}
          fullWidth
          sx={{
            mt: 2,
            py: 1.5,
            background: "#E87A42",
            color: "#fff",
            fontWeight: "bold",
            "&:hover": { background: "#D16A35" },
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            "Create Account"
          )}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Already have an account?
        </Typography>
        <Link
          component="button"
          onClick={() => setCurrentStep("login")}
          sx={{ color: "#E87A42", fontWeight: "bold", textDecoration: "none" }}
        >
          Sign In
        </Link>
      </Box>
    </Box>
  );

  const renderLoginStep = () => (
    <Box>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          textAlign: "center",
          fontWeight: "bold",
          color: "#005F73",
        }}
      >
        Sign In
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          fullWidth
          variant="outlined"
        />

        <TextField
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          fullWidth
          variant="outlined"
        />

        <Button
          onClick={() => handleLogin()}
          disabled={loading}
          fullWidth
          sx={{
            mt: 2,
            py: 1.5,
            background: "#E87A42",
            color: "#fff",
            fontWeight: "bold",
            "&:hover": { background: "#D16A35" },
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            "Sign In"
          )}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Don't have an account?
        </Typography>
        <Link
          component="button"
          onClick={() => setCurrentStep("signup")}
          sx={{ color: "#E87A42", fontWeight: "bold", textDecoration: "none" }}
        >
          Create Account
        </Link>
      </Box>
    </Box>
  );

  const renderVerifyStep = () => (
    <Box>
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          textAlign: "center",
          fontWeight: "bold",
          color: "#005F73",
        }}
      >
        Verify Email
      </Typography>

      <Typography
        variant="body2"
        sx={{ mb: 3, textAlign: "center", color: "#666" }}
      >
        We've sent a verification code to {formData.email}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Verification Code"
          value={formData.verifyCode}
          onChange={(e) => handleInputChange("verifyCode", e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="Enter 6-digit code"
          helperText="For testing, use: 1111"
        />

        <Button
          onClick={handleVerifyEmail}
          disabled={loading}
          fullWidth
          sx={{
            mt: 2,
            py: 1.5,
            background: "#E87A42",
            color: "#fff",
            fontWeight: "bold",
            "&:hover": { background: "#D16A35" },
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            "Verify Email"
          )}
        </Button>

        <Button
          onClick={handleResendVerification}
          disabled={loading}
          variant="outlined"
          fullWidth
          sx={{
            color: "#005F73",
            borderColor: "#005F73",
            "&:hover": {
              borderColor: "#004A5C",
              backgroundColor: "rgba(0, 95, 115, 0.04)",
            },
          }}
        >
          Resend Code
        </Button>
      </Box>

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Link
          component="button"
          onClick={() => setCurrentStep("signup")}
          sx={{ color: "#E87A42", fontWeight: "bold", textDecoration: "none" }}
        >
          ← Back to Sign Up
        </Link>
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
        },
      }}
    >
      <DialogContent>
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: -16,
              top: -16,
              color: "#666",
            }}
          >
            <CloseIcon />
          </IconButton>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {currentStep === "signup" && renderSignUpStep()}
          {currentStep === "login" && renderLoginStep()}
          {currentStep === "verify" && renderVerifyStep()}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
