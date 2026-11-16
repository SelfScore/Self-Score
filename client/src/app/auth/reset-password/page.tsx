"use client";

import { Alert, Box, CircularProgress, Link, Typography } from "@mui/material";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { authService } from "../../../services/authService";
import { getUserFriendlyError } from "../../../utils/errorMessages";
import AuthPageLayout from "../../components/auth/AuthPageLayout";
import PasswordField from "../../components/auth/PasswordField";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import { getPostAuthPath } from "../../components/auth/postAuthRedirect";
import { authCardSx, authLabelSx, authLinkSx, validatePassword } from "../../components/auth/authStyles";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const pw = validatePassword(password);
    if (pw) {
      setFieldError(pw);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authService.resetPassword(token, password, confirmPassword);
      if (res.success && res.data) {
        setDone(true);
        router.push(getPostAuthPath(res.data));
        return;
      }
      setError(res.message);
    } catch (err) {
      setError(getUserFriendlyError(err, "reset"));
    }
    setSubmitting(false);
  };

  if (!token) {
    return (
      <AuthPageLayout title="Set a New Password">
        <Alert severity="error">
          This reset link is incomplete.{" "}
          <Link component={NextLink} href="/auth/forgot-password" sx={authLinkSx}>
            Request a new link
          </Link>
        </Alert>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout title="Set a New Password" subtitle="Choose a password with at least 8 characters.">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}{" "}
          {/expired|invalid/i.test(error) && (
            <Link component={NextLink} href="/auth/forgot-password" sx={authLinkSx}>
              Request a new link
            </Link>
          )}
        </Alert>
      )}
      {done && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Password updated. Signing you in…
        </Alert>
      )}
      <Box sx={authCardSx} component="form" onSubmit={handleSubmit} noValidate>
        <Typography sx={authLabelSx}>New password</Typography>
        <PasswordField
          value={password}
          onChange={(v) => {
            setPassword(v);
            setFieldError("");
          }}
          placeholder="Create a password"
          autoComplete="new-password"
          disabled={submitting || done}
          error={fieldError}
          name="new-password"
        />
        <Typography sx={authLabelSx}>Confirm new password</Typography>
        <PasswordField
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          showStrength={false}
          disabled={submitting || done}
          name="confirm-password"
        />
        <ButtonSelfScore
          type="submit"
          text={submitting ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Save password"}
          fullWidth
          disabled={submitting || done}
          style={{ height: 48, borderRadius: 12, marginTop: 8 }}
        />
      </Box>
    </AuthPageLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
