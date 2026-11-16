"use client";

import { useState } from "react";
import { Box, Button, CircularProgress, Divider, Typography } from "@mui/material";
import { useGoogleLogin, useGoogleOAuth } from "@react-oauth/google";
import { authService, UserData } from "../../../services/authService";
import { getUserFriendlyError } from "../../../utils/errorMessages";
import { GOOGLE_CLIENT_ID } from "../../../lib/config";

interface GoogleSignInButtonProps {
  onSuccess: (user: UserData) => void;
  onError?: (message: string) => void;
  rememberMe?: boolean;
  text?: "signin_with" | "signup_with" | "continue_with";
  /** Show an "or" divider below the button */
  withDivider?: boolean;
  /** Small print shown right under the button (e.g. terms note on sign-up) */
  footnote?: React.ReactNode;
}

const LABELS = {
  signin_with: "Sign in with Google",
  signup_with: "Sign up with Google",
  continue_with: "Continue with Google",
};

/** Official multi-colour "G" mark (Google branding guidelines) */
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * Full-width "Continue with Google" button. Opens Google's popup (auth-code flow);
 * our server swaps the one-time code for Google's ID token, verifies it and sets
 * the normal session cookie. Renders nothing when NEXT_PUBLIC_GOOGLE_CLIENT_ID isn't set.
 */
export default function GoogleSignInButton(props: GoogleSignInButtonProps) {
  // The hooks below need <GoogleOAuthProvider>, which is only mounted when a client ID exists
  if (!GOOGLE_CLIENT_ID) return null;
  return <GoogleSignInButtonInner {...props} />;
}

function GoogleSignInButtonInner({
  onSuccess,
  onError,
  rememberMe = false,
  text = "continue_with",
  withDivider = true,
  footnote,
}: GoogleSignInButtonProps) {
  const { scriptLoadedSuccessfully } = useGoogleOAuth();
  const [busy, setBusy] = useState(false);

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      setBusy(true);
      try {
        const result = await authService.googleAuthCode(code, rememberMe);
        if (result.success && result.data) {
          onSuccess(result.data);
        } else {
          onError?.(result.message || "Google sign-in failed. Please try again.");
        }
      } catch (err) {
        onError?.(getUserFriendlyError(err, "signin"));
      } finally {
        setBusy(false);
      }
    },
    onError: () => onError?.("Google sign-in failed. Please try again."),
    onNonOAuthError: (err) => {
      setBusy(false);
      // Closing the popup is a normal cancel, not an error
      if (err.type === "popup_failed_to_open") {
        onError?.("Couldn't open the Google window. Please allow pop-ups for this site and try again.");
      }
    },
  });

  return (
    <Box>
      <Button
        type="button"
        fullWidth
        disabled={busy || !scriptLoadedSuccessfully}
        onClick={() => login()}
        startIcon={busy ? <CircularProgress size={18} sx={{ color: "#FF5722" }} /> : <GoogleLogo />}
        sx={{
          height: 48,
          borderRadius: "10px",
          border: "1px solid #D1D5DB",
          bgcolor: "#FFFFFF",
          color: "#1F2937",
          fontFamily: "Source Sans Pro",
          fontSize: "16px",
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "none",
          "& .MuiButton-startIcon": { mr: 1.25 },
          "&:hover": { bgcolor: "#F9FAFB", borderColor: "#9CA3AF", boxShadow: "none" },
          "&.Mui-disabled": { bgcolor: "#FFFFFF", color: "#9CA3AF", borderColor: "#E5E7EB" },
        }}
      >
        {LABELS[text]}
      </Button>
      {footnote && (
        <Typography
          sx={{ color: "#6B7280", fontSize: "12px", textAlign: "center", mt: 1, fontFamily: "Source Sans Pro", lineHeight: 1.4 }}
        >
          {footnote}
        </Typography>
      )}
      {withDivider && (
        <Divider sx={{ my: 2.5, "&::before, &::after": { borderColor: "#E5E7EB" } }}>
          <Typography
            component="span"
            sx={{ color: "#9CA3AF", fontSize: "12px", fontFamily: "Source Sans Pro", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            or
          </Typography>
        </Divider>
      )}
    </Box>
  );
}
