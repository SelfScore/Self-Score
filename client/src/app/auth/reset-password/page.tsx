"use client";

import {
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import api from "../../../lib/api";
import { Suspense } from "react";
import {
  getUserFriendlyError,
  getSuccessMessage,
} from "../../../utils/errorMessages";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(
        "Invalid or missing reset link. Please request a new password reset from the forgot password page."
      );
    }
  }, [token]);

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!token) {
      setError("Invalid password reset link. Please request a new one.");
      return;
    }

    if (!formData.password.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must be at least 6 characters long for security");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(
        "Passwords do not match. Please enter the same password in both fields"
      );
      return;
    }

    setLoading(true);

    try {
      const response: any = await api.post("/api/auth/reset-password", {
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        setSuccess(true);
        setFormData({ password: "", confirmPassword: "" });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        setError(
          getUserFriendlyError(
            { response: { data: { message: response.message } } },
            "reset"
          )
        );
      }
    } catch (err: any) {
      setError(getUserFriendlyError(err, "reset"));
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
          Reset Password
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
          Enter your new password below
        </Typography>

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {getSuccessMessage("reset")}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit}>
            {/* Password Field */}
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
                New Password<span style={{ color: "#E87A42" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setError("");
                }}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#9CA3AF" }} />
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

            {/* Confirm Password Field */}
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
                Confirm Password<span style={{ color: "#E87A42" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setError("");
                }}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
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
                  "Reset Password"
                )
              }
              disabled={loading || !token}
              fullWidth
              background="#E87A42"
              style={{
                marginBottom: "20px",
                opacity: loading || !token ? 0.7 : 1,
                cursor: loading || !token ? "not-allowed" : "pointer",
              }}
            />
          </form>
        )}
      </Box>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
