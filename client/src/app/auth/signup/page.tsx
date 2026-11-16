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
} from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
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
  validatePassword,
} from "../../components/auth/authStyles";

type FieldErrors = { username?: string; email?: string; password?: string };

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { isAuthenticated, isInitialized, user } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<React.ReactNode>("");
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  // Email-first: step 1 = Google or email, step 2 = name + password
  const [step, setStep] = useState<"email" | "details">("email");
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Already signed in
  useEffect(() => {
    if (isInitialized && isAuthenticated && user && !redirecting) {
      router.replace(getPostAuthPath(user, next));
    }
  }, [isInitialized, isAuthenticated, user, next, router, redirecting]);

  // Old versions of this page saved a draft (incl. profile fields) — remove it
  useEffect(() => {
    try {
      localStorage.removeItem("signupFormData");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const finish = (created: UserData) => {
    setRedirecting(true);
    router.push(getPostAuthPath(created, next));
  };

  const signInHref = (withEmail: boolean, exists = false) => {
    const params = new URLSearchParams();
    if (withEmail && email.trim()) params.set("email", email.trim().toLowerCase());
    if (exists) params.set("exists", "1");
    if (next) params.set("next", next);
    const qs = params.toString();
    return `/auth/signin${qs ? `?${qs}` : ""}`;
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      setFieldErrors({ email: "Please enter a valid email address" });
      return;
    }
    setCheckingEmail(true);
    try {
      const res = await authService.checkEmail(normalized);
      if (res.success && res.data?.exists) {
        setRedirecting(true);
        router.push(signInHref(true, true));
        return;
      }
    } catch {
      // Lookup failed (offline / rate limited): carry on — sign-up itself reports EMAIL_IN_USE
    } finally {
      setCheckingEmail(false);
    }
    setEmail(normalized);
    setStep("details");
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    const name = username.trim();
    if (name.length < 2) errors.username = "Please enter your full name (at least 2 characters)";
    else if (name.length > 50) errors.username = "Name must not exceed 50 characters";
    if (!EMAIL_REGEX.test(email.trim())) errors.email = "Please enter a valid email address";
    const pw = validatePassword(password);
    if (pw) errors.password = pw;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return false;
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await authService.signUp({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      if (result.success && result.data) finish(result.data);
      else setError(result.message);
    } catch (err: any) {
      if (err?.response?.data?.code === "EMAIL_IN_USE") {
        setError(
          <>
            An account with this email already exists.{" "}
            <Link component={NextLink} href={signInHref(true)} sx={authLinkSx}>
              Sign in instead
            </Link>
          </>
        );
      } else {
        setError(getUserFriendlyError(err, "signup"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || redirecting || checkingEmail;

  return (
    <AuthPageLayout title="Create Your Account" subtitle="Start your journey to self-discovery today">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {step === "email" ? (
        <Box sx={authCardSx} component="form" onSubmit={handleContinue} noValidate>
          <GoogleSignInButton
            text="continue_with"
            onSuccess={finish}
            onError={(m) => setError(m)}
          />

          <Typography sx={authLabelSx}>Email Address</Typography>
          <TextField
            placeholder="name@example.com"
            type="email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((f) => ({ ...f, email: undefined }));
            }}
            fullWidth
            disabled={busy}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2.5, ...authInputSx(!!fieldErrors.email) }}
          />

          <ButtonSelfScore
            type="submit"
            text={busy ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Continue with email"}
            fullWidth
            disabled={busy}
            style={{ height: 48, borderRadius: 12 }}
          />

          <Typography
            sx={{ color: "#6B7280", fontSize: "13px", textAlign: "center", mt: 2, fontFamily: "Source Sans Pro", lineHeight: 1.5 }}
          >
            By continuing, you agree to our{" "}
            <Link component={NextLink} href="/terms-conditions" target="_blank" sx={{ ...authLinkSx, fontSize: "13px" }}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link component={NextLink} href="/privacy-policy" target="_blank" sx={{ ...authLinkSx, fontSize: "13px" }}>
              Privacy Policy
            </Link>
            .
          </Typography>

          <Box sx={{ textAlign: "center", mt: 2.5 }}>
            <Typography sx={{ color: "#4B5563", fontSize: "14px", fontFamily: "Source Sans Pro" }}>
              Already have an account?{" "}
              <Link component={NextLink} href={signInHref(false)} sx={{ ...authLinkSx, color: "#005F73" }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={authCardSx} component="form" onSubmit={handleSubmit} noValidate>
          {/* Lets password managers save the new password against this email */}
          <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              mb: 2.5,
              px: 2,
              py: 1.25,
              bgcolor: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <EmailIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
              <Typography
                sx={{ fontFamily: "Source Sans Pro", fontSize: "15px", color: "#1F2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {email}
              </Typography>
            </Box>
            <Link
              component="button"
              type="button"
              disabled={busy}
              onClick={() => {
                setStep("email");
                setError("");
                setFieldErrors({});
              }}
              sx={{ ...authLinkSx, fontSize: "14px", flexShrink: 0 }}
            >
              Change
            </Link>
          </Box>

          <Typography sx={authLabelSx}>
            Full Name<span style={{ color: "#FF5722" }}>*</span>
          </Typography>
          <TextField
            placeholder="Enter your full name"
            name="name"
            autoComplete="name"
            autoFocus
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFieldErrors((f) => ({ ...f, username: undefined }));
            }}
            fullWidth
            disabled={busy}
            error={!!fieldErrors.username}
            helperText={fieldErrors.username}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2, ...authInputSx(!!fieldErrors.username) }}
          />

          <Typography sx={authLabelSx}>
            Password<span style={{ color: "#FF5722" }}>*</span>
          </Typography>
          <PasswordField
            value={password}
            onChange={(v) => {
              setPassword(v);
              setFieldErrors((f) => ({ ...f, password: undefined }));
            }}
            placeholder="Create a password"
            autoComplete="new-password"
            disabled={busy}
            error={fieldErrors.password}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  setError("");
                }}
                size="small"
                sx={{ color: "#9CA3AF", "&.Mui-checked": { color: "#FF5722" } }}
              />
            }
            label={
              <Typography sx={{ color: "#4B5563", fontSize: "14px", fontFamily: "Source Sans Pro" }}>
                I agree to the{" "}
                <Link component={NextLink} href="/terms-conditions" target="_blank" sx={authLinkSx}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link component={NextLink} href="/privacy-policy" target="_blank" sx={authLinkSx}>
                  Privacy Policy
                </Link>
              </Typography>
            }
            sx={{ mb: 2.5, mt: 0.5, ml: -0.75, alignItems: "center" }}
          />

          <ButtonSelfScore
            type="submit"
            text={busy ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Create Account"}
            fullWidth
            disabled={busy}
            style={{ height: 48, borderRadius: 12 }}
          />
        </Box>
      )}
    </AuthPageLayout>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  );
}
