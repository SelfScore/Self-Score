"use client";

import {
  Dialog,
  Box,
  Typography,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Link,
  Checkbox,
  FormControlLabel,
  InputAdornment,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import { authService, UserData } from "../../services/authService";
import ButtonSelfScore from "../components/ui/ButtonSelfScore";
import PasswordField from "../components/auth/PasswordField";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import CodeInput from "../components/auth/CodeInput";
import ProfileDetailsForm from "../components/auth/ProfileDetailsForm";
import { EMAIL_REGEX, authInputSx, authLabelSx, authLinkSx, validatePassword } from "../components/auth/authStyles";
import { getUserFriendlyError } from "../../utils/errorMessages";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Called once the user is signed in (after the optional profile step).
   * When provided, the parent is responsible for closing the modal.
   */
  onSuccess?: (userData: UserData) => void;
  initialStep?: "signup" | "login";
}

type AuthStep = "signup" | "login" | "code" | "profile";

const EMPTY_CODE = ["", "", "", "", "", ""];

export default function SignUpModal({ open, onClose, onSuccess, initialStep = "signup" }: SignUpModalProps) {
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode>("");
  const [notice, setNotice] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [code, setCode] = useState(EMPTY_CODE);
  const [countdown, setCountdown] = useState(0);
  const [signedInUser, setSignedInUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (open) setStep(initialStep);
  }, [open, initialStep]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setAgreedToTerms(false);
    setCode(EMPTY_CODE);
    setError("");
    setNotice("");
    setSignedInUser(null);
    setStep(initialStep);
  };

  // When onSuccess is given the parent hides the modal itself (calling onClose
  // here too would run the parent's "cancelled" logic with stale state).
  const complete = (user: UserData) => {
    resetForm();
    if (onSuccess) onSuccess(user);
    else onClose();
  };

  /** After any successful sign-in: offer the profile step once, then finish */
  const afterSignIn = (user: UserData) => {
    setSignedInUser(user);
    setError("");
    setNotice("");
    if (!user.isProfileComplete && !user.onboardingSkipped) {
      setStep("profile");
    } else {
      complete(user);
    }
  };

  const handleClose = () => {
    // Closing on the profile step counts as "skip" — the user is already signed in
    if (step === "profile" && signedInUser) {
      void authService.skipOnboarding().catch(() => undefined);
      complete(signedInUser);
      return;
    }
    resetForm();
    onClose();
  };

  const switchTo = (next: AuthStep) => {
    setError("");
    setNotice("");
    setStep(next);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const name = username.trim();
    const normalized = email.trim().toLowerCase();
    if (name.length < 2 || name.length > 50) {
      setError("Please enter your full name (2–50 characters)");
      return;
    }
    if (!EMAIL_REGEX.test(normalized)) {
      setError("Please enter a valid email address (e.g., name@example.com)");
      return;
    }
    const pw = validatePassword(password);
    if (pw) {
      setError(pw);
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.signUp({ username: name, email: normalized, password });
      if (res.success && res.data) afterSignIn(res.data);
      else setError(res.message);
    } catch (err: any) {
      if (err?.response?.data?.code === "EMAIL_IN_USE") {
        setError(
          <>
            An account with this email already exists.{" "}
            <Link component="button" type="button" onClick={() => switchTo("login")} sx={authLinkSx}>
              Sign in instead
            </Link>
          </>
        );
      } else {
        setError(getUserFriendlyError(err, "signup"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
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
    setLoading(true);
    try {
      const res = await authService.login({ email: normalized, password });
      if (res.success && res.data) afterSignIn(res.data);
      else setError(res.message);
    } catch (err: any) {
      if (err?.response?.data?.code === "PASSWORD_NOT_SET") setNotice(err.response.data.message);
      else setError(getUserFriendlyError(err, "signin"));
    } finally {
      setLoading(false);
    }
  };

  const requestCode = async () => {
    setError("");
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      setError("Enter your email address first, then we'll send you a code.");
      return;
    }
    setLoading(true);
    try {
      await authService.requestLoginCode(normalized);
      setNotice(`If an account exists for ${normalized}, we've sent it a 6-digit code.`);
      setCode(EMPTY_CODE);
      setCountdown(60);
      setStep("code");
    } catch (err) {
      setError(getUserFriendlyError(err, "signin"));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (value?: string) => {
    const full = value ?? code.join("");
    if (full.length !== 6) {
      setError("Please enter all 6 digits of the code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authService.verifyLoginCode(email.trim().toLowerCase(), full);
      if (res.success && res.data) afterSignIn(res.data);
      else setError(res.message);
    } catch (err) {
      setError(getUserFriendlyError(err, "verify"));
      setCode(EMPTY_CODE);
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<AuthStep, { title: string; subtitle: string }> = {
    signup: { title: "Create your account", subtitle: "Save your results and continue your journey" },
    login: { title: "Welcome back", subtitle: "Sign in to continue" },
    code: { title: "Enter your login code", subtitle: "Check your inbox for a 6-digit code" },
    profile: {
      title: "Tell us a little about you",
      subtitle: "Optional for now — you'll need it before Level 4 or a consultation.",
    },
  };

  const emailField = (
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
        disabled={loading}
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
    </>
  );

  const submitButton = (text: string) => (
    <ButtonSelfScore
      type="submit"
      text={loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : text}
      fullWidth
      disabled={loading}
      style={{ height: 48, borderRadius: 12 }}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: "16px", sm: "24px" },
            width: { xs: "95%", sm: "500px", md: "550px" },
            maxWidth: "95vw",
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: "95vh", sm: "90vh" },
          },
        },
      }}
    >
      <IconButton
        aria-label="Close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: { xs: 8, sm: 12 },
          top: { xs: 8, sm: 12 },
          zIndex: 10,
          bgcolor: "#F5F5F5",
          "&:hover": { bgcolor: "#E0E0E0" },
          width: { xs: 32, sm: 36 },
          height: { xs: 32, sm: 36 },
        }}
      >
        <CloseIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
      </IconButton>

      <Box sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 5, sm: 5.5 }, overflowY: "auto" }}>
        <Typography
          component="h2"
          sx={{ fontFamily: "Faustina", fontWeight: 700, fontSize: { xs: "24px", sm: "28px" }, mb: 0.5 }}
        >
          {titles[step].title}
        </Typography>
        <Typography sx={{ color: "#6B7280", fontFamily: "Source Sans Pro", fontSize: "16px", mb: 2.5 }}>
          {titles[step].subtitle}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {notice && !error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {notice}
          </Alert>
        )}

        {step === "signup" && (
          <Box component="form" onSubmit={handleSignUp} noValidate>
            <GoogleSignInButton text="signup_with" onSuccess={afterSignIn} onError={(m) => setError(m)} />

            <Typography sx={authLabelSx}>Full Name</Typography>
            <TextField
              placeholder="Enter your full name"
              autoComplete="name"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              fullWidth
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#999" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2, ...authInputSx() }}
            />
            {emailField}
            <Typography sx={authLabelSx}>Password</Typography>
            <PasswordField
              value={password}
              onChange={(v) => {
                setPassword(v);
                setError("");
              }}
              placeholder="Create a password"
              autoComplete="new-password"
              disabled={loading}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  sx={{ color: "#999", "&.Mui-checked": { color: "#FF5722" } }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "#666" }}>
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
              sx={{ mb: 2 }}
            />
            {submitButton("Create Account")}
            <Typography sx={{ textAlign: "center", mt: 2, color: "#666", fontSize: "14px" }}>
              Already have an account?{" "}
              <Link component="button" type="button" onClick={() => switchTo("login")} sx={{ ...authLinkSx, color: "#005F73" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        )}

        {step === "login" && (
          <Box component="form" onSubmit={handleLogin} noValidate>
            <GoogleSignInButton text="signin_with" onSuccess={afterSignIn} onError={(m) => setError(m)} />
            {emailField}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <Typography sx={authLabelSx}>Password</Typography>
              <Link component={NextLink} href="/auth/forgot-password" target="_blank" sx={{ ...authLinkSx, fontSize: "14px" }}>
                Forgot password?
              </Link>
            </Box>
            <PasswordField
              value={password}
              onChange={(v) => {
                setPassword(v);
                setError("");
              }}
              autoComplete="current-password"
              disabled={loading}
            />
            {submitButton("Sign In")}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link component="button" type="button" onClick={requestCode} disabled={loading} sx={{ ...authLinkSx, color: "#005F73", fontSize: "15px" }}>
                Email me a login code instead
              </Link>
            </Box>
            <Typography sx={{ textAlign: "center", mt: 2, color: "#666", fontSize: "14px" }}>
              New here?{" "}
              <Link component="button" type="button" onClick={() => switchTo("signup")} sx={{ ...authLinkSx, color: "#005F73" }}>
                Create an account
              </Link>
            </Typography>
          </Box>
        )}

        {step === "code" && (
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              void verifyCode();
            }}
            noValidate
          >
            <Box sx={{ mb: 3 }}>
              <CodeInput value={code} onChange={setCode} disabled={loading} onComplete={(c) => void verifyCode(c)} />
            </Box>
            {submitButton("Sign In")}
            <Typography sx={{ textAlign: "center", mt: 2, color: "#666", fontSize: "14px" }}>
              Didn&apos;t get it?{" "}
              {countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <Link component="button" type="button" onClick={requestCode} sx={authLinkSx}>
                  Resend code
                </Link>
              )}
              {" · "}
              <Link component="button" type="button" onClick={() => switchTo("login")} sx={{ ...authLinkSx, color: "#005F73" }}>
                Back
              </Link>
            </Typography>
          </Box>
        )}

        {step === "profile" && signedInUser && (
          <ProfileDetailsForm
            initial={{ country: signedInUser.country, gender: signedInUser.gender, ageGroup: signedInUser.ageGroup }}
            onSaved={complete}
            onSkip={() => complete(authService.getCurrentUserFromStore() as UserData)}
            submitText="Continue"
          />
        )}
      </Box>
    </Dialog>
  );
}
