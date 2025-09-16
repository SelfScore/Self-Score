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
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import NextLink from "next/link";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendVerification, isLoading, error, clearError } =
    useAuth();

  const [verifyCode, setVerifyCode] = useState("");
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verifyCode.trim()) {
      setLocalError("Verification code is required");
      return;
    }

    if (!email.trim()) {
      setLocalError("Email is required");
      return;
    }

    try {
      clearError();
      const response = await verifyEmail({
        email: email.trim().toLowerCase(),
        verifyCode: verifyCode.trim(),
      });

      if (response.success) {
        setSuccess("Email verified successfully! Redirecting to sign in...");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        setLocalError(response.message || "Invalid verification code");
      }
    } catch (err: any) {
      setLocalError(
        err.response?.data?.message || "Verification failed. Please try again."
      );
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      setLocalError("Email is required to resend verification code");
      return;
    }

    try {
      setResendLoading(true);
      clearError();
      setLocalError("");

      const response = await resendVerification(email.trim().toLowerCase());

      if (response.success) {
        setSuccess("Verification code sent! Please check your email.");
      } else {
        setLocalError(response.message || "Failed to resend verification code");
      }
    } catch (err: any) {
      setLocalError(
        err.response?.data?.message ||
          "Failed to resend verification code. Please try again."
      );
    } finally {
      setResendLoading(false);
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
            Verify Your Email
          </Typography>
          <Typography variant="body1" sx={{ color: "#666", mb: 1 }}>
            We've sent a verification code to:
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", color: "#E87A42" }}
          >
            {email || "your email address"}
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

        <Box component="form" onSubmit={handleVerifyCode}>
          {!email && (
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              disabled={isLoading}
            />
          )}

          <TextField
            label="Verification Code"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={isLoading}
            placeholder="Enter 6-digit code"
            helperText="For testing, you can use: 1111"
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
              "Verify Email"
            )}
          </Button>

          <Button
            onClick={handleResendCode}
            fullWidth
            variant="outlined"
            disabled={resendLoading || !email}
            sx={{
              mb: 2,
              color: "#005F73",
              borderColor: "#005F73",
              "&:hover": {
                borderColor: "#004A5C",
                backgroundColor: "rgba(0, 95, 115, 0.04)",
              },
            }}
          >
            {resendLoading ? (
              <CircularProgress size={24} sx={{ color: "#005F73" }} />
            ) : (
              "Resend Code"
            )}
          </Button>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Link
              component={NextLink}
              href="/auth/signup"
              sx={{
                color: "#E87A42",
                fontWeight: "bold",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              ← Back to Sign Up
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Loading...</Typography>
            </Box>
          </Paper>
        </Container>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
