"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import ButtonSelfScore from "../ui/ButtonSelfScore";
import PasswordField from "./PasswordField";
import { authService } from "../../../services/authService";
import { useAuth } from "../../../hooks/useAuth";
import { getUserFriendlyError } from "../../../utils/errorMessages";
import { authLabelSx, validatePassword } from "./authStyles";

/** Profile page card: set a first password, or change the current one */
export default function PasswordSection() {
  const { user, hasPassword } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [success, setSuccess] = useState("");

  // Deep link from "Set a password" reminders: /user/profile#password
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#password") {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  }, []);

  if (!user) return null;

  const usesGoogle = (user.authProviders || []).includes("google");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const pw = validatePassword(newPassword);
    if (pw) {
      setFieldError(pw);
      return;
    }
    if (newPassword !== confirm) {
      setError("New passwords do not match");
      return;
    }
    if (hasPassword && !currentPassword) {
      setError("Please enter your current password");
      return;
    }
    setSaving(true);
    try {
      const res = await authService.setPassword(newPassword, hasPassword ? currentPassword : undefined);
      setSuccess(
        `${res.message} You've been signed out on other devices.`
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setError(getUserFriendlyError(err, "profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      id="password"
      ref={ref}
      sx={{ mt: { xs: 2, md: 3 }, borderRadius: "16px", boxShadow: "none", border: "1px solid #3A3A3A4D" }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontFamily: "Faustina" }}>
          {hasPassword ? "Change password" : "Set a password"}
        </Typography>
        <Typography sx={{ color: "#6B7280", fontFamily: "Source Sans Pro", mb: 2.5 }}>
          {hasPassword
            ? "Use at least 8 characters."
            : usesGoogle
              ? "You sign in with Google. Add a password if you'd also like to sign in with your email."
              : "Your account doesn't have a password yet. Set one so you can sign in without waiting for an email code."}
        </Typography>

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

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ maxWidth: 480 }}>
          {/* Hidden username helps password managers save the right account */}
          <input type="email" name="username" autoComplete="username" value={user.email} readOnly hidden />
          {hasPassword && (
            <>
              <Typography sx={authLabelSx}>Current password</Typography>
              <PasswordField
                value={currentPassword}
                onChange={setCurrentPassword}
                autoComplete="current-password"
                disabled={saving}
                name="current-password"
              />
            </>
          )}
          <Typography sx={authLabelSx}>New password</Typography>
          <PasswordField
            value={newPassword}
            onChange={(v) => {
              setNewPassword(v);
              setFieldError("");
            }}
            placeholder="Create a password"
            autoComplete="new-password"
            disabled={saving}
            error={fieldError}
            name="new-password"
          />
          <Typography sx={authLabelSx}>Confirm new password</Typography>
          <PasswordField
            value={confirm}
            onChange={setConfirm}
            placeholder="Re-enter the new password"
            autoComplete="new-password"
            showStrength={false}
            disabled={saving}
            name="confirm-password"
          />
          <ButtonSelfScore
            type="submit"
            text={saving ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : hasPassword ? "Change password" : "Set password"}
            disabled={saving}
            style={{ height: 46, borderRadius: 12 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
