"use client";

import { Alert, Box, CircularProgress, InputAdornment, Link, TextField, Typography } from "@mui/material";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import NextLink from "next/link";
import EmailIcon from "@mui/icons-material/Email";
import { authService } from "../../../services/authService";
import { getUserFriendlyError } from "../../../utils/errorMessages";
import AuthPageLayout from "../../components/auth/AuthPageLayout";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import { EMAIL_REGEX, authCardSx, authInputSx, authLabelSx, authLinkSx } from "../../components/auth/authStyles";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      setError("Please enter a valid email address");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(normalized);
      setSent(res.message || "If an account exists with this email, we've sent a reset link.");
    } catch (err) {
      setError(getUserFriendlyError(err, "forgot"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPageLayout
      title="Reset Your Password"
      subtitle="Enter your email and we'll send you a link to set a new password. This also works if you've never set one."
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Box sx={authCardSx} component="form" onSubmit={handleSubmit} noValidate>
        {sent ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              {sent}
            </Alert>
            <Typography sx={{ color: "#6B7280", fontFamily: "Source Sans Pro", mb: 2 }}>
              The link expires in 1 hour. Didn&apos;t get it? Check your spam folder, or wait a minute and try again.
            </Typography>
          </>
        ) : (
          <>
            <Typography sx={authLabelSx}>Email Address</Typography>
            <TextField
              placeholder="Enter your email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              fullWidth
              disabled={submitting}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#999" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 3, ...authInputSx() }}
            />
            <ButtonSelfScore
              type="submit"
              text={submitting ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Send reset link"}
              fullWidth
              disabled={submitting}
              style={{ height: 48, borderRadius: 12 }}
            />
          </>
        )}
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Link component={NextLink} href="/auth/signin" sx={{ ...authLinkSx, color: "#005F73" }}>
            Back to sign in
          </Link>
        </Box>
      </Box>
    </AuthPageLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
