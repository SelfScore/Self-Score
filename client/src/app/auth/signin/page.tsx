"use client";

import {
  Box,
  Typography,
  TextField,
  Link,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  // Chip, // used by the hidden User / Consultant chips below
} from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import EmailIcon from "@mui/icons-material/Email";
import { useAuth } from "../../../hooks/useAuth";
import { authService, UserData } from "../../../services/authService";
import { getUserFriendlyError } from "../../../utils/errorMessages";
import AuthPageLayout from "../../components/auth/AuthPageLayout";
import PasswordField from "../../components/auth/PasswordField";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import { getPostAuthPath } from "../../components/auth/postAuthRedirect";
import {
  EMAIL_REGEX,
  authCardSx,
  authInputSx,
  authLabelSx,
  authLinkSx,
} from "../../components/auth/authStyles";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { isAuthenticated, isInitialized, user } = useAuth();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  // Sent here from email-first sign-up because the account already exists
  const [notice, setNotice] = useState<React.ReactNode>(
    searchParams.get("exists") === "1"
      ? "You already have an account with this email. Sign in below — or use Google if that's how you signed up."
      : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Already signed in (e.g. opened /auth/signin in a new tab)
  useEffect(() => {
    if (isInitialized && isAuthenticated && user && !redirecting) {
      router.replace(getPostAuthPath(user, next));
    }
  }, [isInitialized, isAuthenticated, user, next, router, redirecting]);

  const finish = (signedIn: UserData) => {
    setRedirecting(true);
    router.push(getPostAuthPath(signedIn, next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    const normalized = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalized)) {
      setError("Please enter a valid email address (e.g., name@example.com)");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setSubmitting(true);
    try {
      const result = await authService.login({ email: normalized, password, rememberMe });
      if (result.success && result.data) finish(result.data);
      else setError(result.message);
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === "PASSWORD_NOT_SET") {
        // Account from before passwords existed (or Google-only)
        setNotice(err.response.data.message);
      } else {
        setError(getUserFriendlyError(err, "signin"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailCode = async () => {
    setError("");
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      setError("Enter your email address above first, then we'll send you a code.");
      return;
    }
    setSendingCode(true);
    try {
      await authService.requestLoginCode(normalized);
      const params = new URLSearchParams({ email: normalized, mode: "login" });
      if (rememberMe) params.set("rememberMe", "true");
      if (next) params.set("next", next);
      router.push(`/auth/verify-email?${params.toString()}`);
    } catch (err) {
      setError(getUserFriendlyError(err, "signin"));
    } finally {
      setSendingCode(false);
    }
  };

  const busy = submitting || sendingCode || redirecting;

  return (
    <AuthPageLayout title="Welcome Back" subtitle="Sign in to continue your SelfScore journey">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {notice}
        </Alert>
      )}

      {/* User / Consultant chips hidden — this page is user sign-in only.
          Consultants sign in at /consultant/login.
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Chip
          label="User"
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
            "&:hover": { backgroundColor: "#E64A19" },
          }}
        />
        <Chip
          label="Consultant"
          onClick={() => router.push("/consultant/login")}
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
            "&:hover": { backgroundColor: "#F5F5F5" },
          }}
        />
      </Box>
      */}

      <Box sx={authCardSx} component="form" onSubmit={handleSubmit} noValidate>
        <GoogleSignInButton
          text="signin_with"
          rememberMe={rememberMe}
          onSuccess={finish}
          onError={setError}
        />

        <Typography sx={authLabelSx}>Email Address</Typography>
        <TextField
          placeholder="Enter your email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          fullWidth
          disabled={busy}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "#999" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2, ...authInputSx() }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Typography sx={authLabelSx}>Password</Typography>
          <Link
            component={NextLink}
            href={`/auth/forgot-password${email ? `?email=${encodeURIComponent(email.trim())}` : ""}`}
            sx={{ ...authLinkSx, fontSize: "14px" }}
          >
            Forgot password?
          </Link>
        </Box>
        <PasswordField
          value={password}
          onChange={(v) => {
            setPassword(v);
            setError("");
          }}
          disabled={busy}
          autoComplete="current-password"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              sx={{ color: "#999", "&.Mui-checked": { color: "#FF5722" } }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: "#666" }}>
              Remember me (30 days)
            </Typography>
          }
          sx={{ mb: 2 }}
        />

        <ButtonSelfScore
          type="submit"
          text={submitting || redirecting ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Sign In"}
          fullWidth
          disabled={busy}
          style={{ height: 48, borderRadius: 12 }}
        />

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography
            component="button"
            type="button"
            onClick={handleEmailCode}
            disabled={busy}
            sx={{
              background: "none",
              border: "none",
              color: "#005F73",
              fontFamily: "Source Sans Pro",
              fontSize: "15px",
              fontWeight: 600,
              cursor: busy ? "default" : "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {sendingCode ? "Sending code…" : "Email me a login code instead"}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Don&apos;t have an account?{" "}
            <Link
              component={NextLink}
              href={`/auth/signup${
                email || next
                  ? `?${new URLSearchParams({
                      ...(email ? { email: email.trim() } : {}),
                      ...(next ? { next } : {}),
                    }).toString()}`
                  : ""
              }`}
              sx={{ ...authLinkSx, color: "#005F73" }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthPageLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
