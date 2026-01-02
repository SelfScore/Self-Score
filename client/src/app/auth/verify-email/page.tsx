"use client";

import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import NextLink from "next/link";
import Image from "next/image";
import EmailIcon from "@mui/icons-material/Email";
import {
  getUserFriendlyError,
  getSuccessMessage,
} from "../../../utils/errorMessages";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendVerification, isLoading, error, clearError } =
    useAuth();

  const [verifyCode, setVerifyCode] = useState(["", "", "", "", "", ""]);
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

    const code = verifyCode.join("");
    if (!code || code.length !== 6) {
      setLocalError("Please enter all 6 digits of the verification code");
      return;
    }

    if (!email.trim()) {
      setLocalError("Email address is required for verification");
      return;
    }

    try {
      clearError();
      const response = await verifyEmail({
        email: email.trim().toLowerCase(),
        verifyCode: code,
      });

      if (response.success) {
        setSuccess(getSuccessMessage("verify"));
        setTimeout(() => {
          router.push("/user/dashboard");
        }, 2000);
      } else {
        setLocalError(
          getUserFriendlyError(
            { response: { data: { message: response.message } } },
            "verify"
          )
        );
      }
    } catch (err: any) {
      setLocalError(getUserFriendlyError(err, "verify"));
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...verifyCode];
    newCode[index] = value;
    setVerifyCode(newCode);
    setLocalError("");
    clearError();

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !verifyCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData
        .split("")
        .concat(Array(6).fill(""))
        .slice(0, 6);
      setVerifyCode(newCode);
      // Focus the last filled input or the next empty one
      const nextEmptyIndex = newCode.findIndex((val) => !val);
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      const input = document.getElementById(`code-input-${focusIndex}`);
      input?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      setLocalError(
        "Please enter your email address to resend the verification code"
      );
      return;
    }

    try {
      setResendLoading(true);
      clearError();
      setLocalError("");

      const response = await resendVerification(email.trim().toLowerCase());

      if (response.success) {
        setSuccess(getSuccessMessage("resend"));
      } else {
        setLocalError(
          getUserFriendlyError(
            { response: { data: { message: response.message } } },
            "verify"
          )
        );
      }
    } catch (err: any) {
      setLocalError(getUserFriendlyError(err, "verify"));
    } finally {
      setResendLoading(false);
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
            minHeight: "582px",
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
                mb: 1,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "40px" },
                fontFamily: "Faustina",
              }}
            >
              Verify Your Email
            </Typography>
            <Typography
              sx={{
                color: "#6B7280",
                fontSize: { xs: "14px", md: "18px" },
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
              }}
            >
              We've sent a 6-digit verification code to your email address
            </Typography>
            <Typography
              sx={{
                fontWeight: "700",
                color: "#6B7280",
                fontSize: { xs: "16px", md: "18px" },
                fontFamily: "Source Sans Pro",
              }}
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
            onSubmit={handleVerifyCode}
          >
            {!email && (
              <>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                      "&.Mui-focused fieldset": {
                        border: "1px solid #FF5722",
                      },
                    },
                  }}
                />
              </>
            )}

            <Typography
              sx={{
                mb: 2,
                textAlign: "center",
                color: "#141414",
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
              }}
            >
              Enter Verification Code
            </Typography>

            {/* 6-digit code input boxes */}
            <Box
              sx={{
                display: "flex",
                gap: { xs: 1, sm: 1.5 },
                justifyContent: "center",
                mb: 3,
              }}
            >
              {verifyCode.map((digit, index) => (
                <TextField
                  key={index}
                  id={`code-input-${index}`}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) =>
                    handleKeyDown(
                      index,
                      e as React.KeyboardEvent<HTMLInputElement>
                    )
                  }
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  inputProps={{
                    maxLength: 1,
                    style: {
                      textAlign: "center",
                      fontSize: "24px",
                      fontWeight: "600",
                      padding: "0",
                    },
                  }}
                  sx={{
                    width: { xs: "45px", sm: "56px" },
                    "& .MuiOutlinedInput-root": {
                      height: { xs: "45px", sm: "56px" },
                      borderRadius: "8px",
                      bgcolor: "#FFFFFF",
                      "& fieldset": { border: "1px solid #E5E7EB" },
                      "&:hover fieldset": { border: "1px solid #9CA3AF" },
                      "&.Mui-focused fieldset": {
                        border: "2px solid #FF5722",
                      },
                    },
                    "& input": {
                      fontFamily: "Source Sans Pro",
                    },
                  }}
                />
              ))}
            </Box>

            <Typography
              sx={{
                textAlign: "center",
                mb: 3,
                color: "#6B7280",
                fontSize: "16px",
                fontFamily: "Source Sans Pro",
              }}
            >
              Didn't receive the code?{" "}
              <Link
                component="button"
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading || !email}
                sx={{
                  color: "#005F73",
                  fontWeight: "400",
                  fontFamily: "Source Sans Pro",
                  textDecoration: "none",
                  cursor: resendLoading || !email ? "not-allowed" : "pointer",
                  opacity: resendLoading || !email ? 0.5 : 1,
                  "&:hover": {
                    textDecoration:
                      !resendLoading && email ? "underline" : "none",
                  },
                }}
              >
                Resend
              </Link>
            </Typography>

            <Button
              type="submit"
              fullWidth
              disabled={isLoading || verifyCode.join("").length !== 6}
              sx={{
                py: 1.5,
                background: "#FF5722",
                color: "#fff",
                fontWeight: "600",
                fontSize: "1.1rem",
                borderRadius: "12px",
                textTransform: "none",
                height: "48px",
                fontFamily: "Source Sans Pro",
                "&:hover": { background: "#E64A19" },
                "&:disabled": { background: "#ccc", opacity: 0.7 },
                mb: 2,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : (
                "Verify"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Wrong Email? Back to{" "}
                <Link
                  component={NextLink}
                  href="/auth/signup"
                  sx={{
                    color: "#6B7280",
                    fontWeight: "400",
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#FFFFFF",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress sx={{ color: "#FF5722" }} />
            <Typography
              sx={{
                mt: 2,
                fontFamily: "Source Sans Pro",
                color: "#6B7280",
              }}
            >
              Loading...
            </Typography>
          </Box>
        </Box>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
