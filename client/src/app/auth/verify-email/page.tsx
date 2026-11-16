"use client";

import { Alert, Box, CircularProgress, Link, Typography } from "@mui/material";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useAuth } from "../../../hooks/useAuth";
import { authService } from "../../../services/authService";
import { getUserFriendlyError } from "../../../utils/errorMessages";
import AuthPageLayout from "../../components/auth/AuthPageLayout";
import CodeInput from "../../components/auth/CodeInput";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import { VerifyEmailStep } from "../../components/auth/AccountGateModal";
import { getPostAuthPath } from "../../components/auth/postAuthRedirect";
import { authCardSx, authLinkSx, safeNextPath } from "../../components/auth/authStyles";

/**
 * Three uses:
 *  1. ?token=...                    link from the verification email
 *  2. ?mode=login&email=...         enter a passwordless login code
 *  3. (signed in, no params)        enter the email verification code
 */
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const mode = searchParams.get("mode");

  if (token) return <LinkVerification token={token} />;
  if (mode === "login") return <LoginCodeEntry />;
  return <SignedInVerification />;
}

function LinkVerification({ token }: { token: string }) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<"loading" | "done" | "error" | "signin" | "other-account">("loading");
  const [message, setMessage] = useState("");
  // Come back to this same link after signing in
  const signInHref = `/auth/signin?next=${encodeURIComponent(`/auth/verify-email?token=${token}`)}`;
  const started = useRef(false);

  useEffect(() => {
    // Strict Mode runs effects twice in dev; the token is single-use
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        await authService.verifyEmailLink(token);
        setState("done");
        // Refresh the signed-in user (if this browser is signed in)
        void authService.getCurrentUser();
      } catch (err: any) {
        const code = err?.response?.data?.code;
        setMessage(err?.response?.data?.message || getUserFriendlyError(err, "verify"));
        // The link only works while signed in to the account it belongs to
        if (code === "SIGN_IN_REQUIRED") setState("signin");
        else if (code === "SIGNED_IN_AS_OTHER") setState("other-account");
        else setState("error");
      }
    })();
  }, [token]);

  return (
    <AuthPageLayout title="Verify Your Email">
      <Box sx={authCardSx}>
        {state === "loading" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={24} sx={{ color: "#FF5722" }} />
            <Typography sx={{ fontFamily: "Source Sans Pro" }}>Verifying your email…</Typography>
          </Box>
        )}
        {state === "done" && (
          <Box sx={{ textAlign: "center" }}>
            <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 56, mb: 1 }} />
            <Typography sx={{ fontFamily: "Faustina", fontWeight: 700, fontSize: "24px", mb: 1 }}>
              Your email is verified
            </Typography>
            <Typography sx={{ color: "#6B7280", fontFamily: "Source Sans Pro", mb: 3 }}>
              You can now unlock Level 4, book consultations and make payments.
            </Typography>
            <NextLink href={isAuthenticated ? "/user/dashboard" : "/auth/signin"} style={{ textDecoration: "none" }}>
              <ButtonSelfScore
                text={isAuthenticated ? "Go to dashboard" : "Sign in"}
                fullWidth
                style={{ height: 48, borderRadius: 12 }}
              />
            </NextLink>
          </Box>
        )}
        {state === "signin" && (
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontFamily: "Faustina", fontWeight: 700, fontSize: "24px", mb: 1 }}>
              Sign in to finish verifying
            </Typography>
            <Typography sx={{ color: "#6B7280", fontFamily: "Source Sans Pro", mb: 3 }}>
              For your security, please sign in to the account this email belongs to. We&apos;ll finish
              verifying it straight after.
            </Typography>
            <NextLink href={signInHref} style={{ textDecoration: "none" }}>
              <ButtonSelfScore text="Sign in" fullWidth style={{ height: 48, borderRadius: 12 }} />
            </NextLink>
          </Box>
        )}
        {state === "other-account" && (
          <Alert severity="warning">
            {message}{" "}
            <Link component={NextLink} href="/auth/logout" sx={authLinkSx}>
              Sign out
            </Link>
          </Alert>
        )}
        {state === "error" && (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              {message || "This verification link is invalid or has expired."}
            </Alert>
            <Typography sx={{ fontFamily: "Source Sans Pro", color: "#6B7280" }}>
              Links expire after 24 hours and stop working once a newer one is sent.{" "}
              {isAuthenticated ? (
                <Link component={NextLink} href="/auth/verify-email" sx={authLinkSx}>
                  Send a new one
                </Link>
              ) : (
                <Link component={NextLink} href="/auth/signin?next=%2Fauth%2Fverify-email" sx={authLinkSx}>
                  Sign in to get a new one
                </Link>
              )}
            </Typography>
          </Box>
        )}
      </Box>
    </AuthPageLayout>
  );
}

function LoginCodeEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") || "").trim().toLowerCase();
  const rememberMe = searchParams.get("rememberMe") === "true";
  const next = searchParams.get("next");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const submit = useCallback(
    async (value?: string) => {
      const full = value ?? code.join("");
      if (full.length !== 6) {
        setError("Please enter all 6 digits of the code");
        return;
      }
      setSubmitting(true);
      setError("");
      try {
        const res = await authService.verifyLoginCode(email, full, rememberMe);
        if (res.success && res.data) {
          setSuccess("Signed in! Redirecting…");
          router.push(getPostAuthPath(res.data, next));
          return;
        }
        setError(res.message);
      } catch (err) {
        setError(getUserFriendlyError(err, "verify"));
        setCode(["", "", "", "", "", ""]);
      }
      setSubmitting(false);
    },
    [code, email, rememberMe, next, router]
  );

  const resend = async () => {
    setResending(true);
    setError("");
    try {
      await authService.requestLoginCode(email);
      setSuccess("We've sent a new code.");
      setCountdown(60);
    } catch (err) {
      setError(getUserFriendlyError(err, "verify"));
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <AuthPageLayout title="Enter Login Code">
        <Alert severity="warning">
          Missing email address.{" "}
          <Link component={NextLink} href="/auth/signin" sx={authLinkSx}>
            Back to sign in
          </Link>
        </Alert>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title="Enter Login Code"
      subtitle={
        <>
          If an account exists for <strong>{email}</strong>, we&apos;ve sent it a 6-digit code. It expires in 10 minutes.
        </>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && !error && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      <Box sx={authCardSx}>
        <Box sx={{ mb: 3 }}>
          <CodeInput value={code} onChange={setCode} disabled={submitting} onComplete={(c) => void submit(c)} />
        </Box>
        <ButtonSelfScore
          text={submitting ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Sign In"}
          fullWidth
          disabled={submitting}
          onClick={() => void submit()}
          style={{ height: 48, borderRadius: 12 }}
        />
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Didn&apos;t get it?{" "}
            {countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <Typography
                component="button"
                type="button"
                onClick={resend}
                disabled={resending}
                sx={{ background: "none", border: "none", p: 0, ...authLinkSx, fontSize: "14px" }}
              >
                {resending ? "Sending…" : "Resend code"}
              </Typography>
            )}
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
            <Link component={NextLink} href={`/auth/signin?email=${encodeURIComponent(email)}`} sx={{ ...authLinkSx, color: "#005F73" }}>
              Back to sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthPageLayout>
  );
}

function SignedInVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const { user, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace(`/auth/signin?next=${encodeURIComponent("/auth/verify-email")}`);
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !user) {
    return (
      <AuthPageLayout title="Verify Your Email">
        <CircularProgress sx={{ color: "#FF5722" }} />
      </AuthPageLayout>
    );
  }

  if (user.isVerified) {
    return (
      <AuthPageLayout title="Verify Your Email">
        <Box sx={{ ...authCardSx, textAlign: "center" }}>
          <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 56, mb: 1 }} />
          <Typography sx={{ fontFamily: "Faustina", fontWeight: 700, fontSize: "24px", mb: 3 }}>
            Your email is verified
          </Typography>
          <NextLink href={next} style={{ textDecoration: "none" }}>
            <ButtonSelfScore text="Continue" fullWidth style={{ height: 48, borderRadius: 12 }} />
          </NextLink>
        </Box>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title="Verify Your Email"
      subtitle="A verified email is needed before Level 4, consultations and payments."
    >
      <Box sx={authCardSx}>
        <VerifyEmailStep
          email={user.email}
          isVerified={false}
          verificationPending={Boolean(user.verificationPending)}
          onVerified={() => undefined}
        />
      </Box>
    </AuthPageLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
