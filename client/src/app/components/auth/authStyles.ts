import type { SxProps, Theme } from "@mui/material";

/** Shared look for auth form inputs (matches the existing sign-in/sign-up pages) */
export const authInputSx = (hasError = false): SxProps<Theme> => ({
  "& .MuiOutlinedInput-root": {
    minHeight: "48px",
    borderRadius: "10px",
    bgcolor: "#FFFFFF",
    fontSize: "15px",
    transition: "box-shadow 0.15s ease",
    "& input": { py: "12px" },
    "& input::placeholder": { color: "#9CA3AF", opacity: 1 },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": { fontSize: "20px", color: "#9CA3AF" },
    "& fieldset": { border: hasError ? "1px solid #d32f2f" : "1px solid #D1D5DB" },
    "&:hover fieldset": { border: hasError ? "1px solid #d32f2f" : "1px solid #9CA3AF" },
    "&.Mui-focused": { boxShadow: hasError ? "0 0 0 3px rgba(211,47,47,0.12)" : "0 0 0 3px rgba(255,87,34,0.12)" },
    "&.Mui-focused fieldset": { border: hasError ? "2px solid #d32f2f" : "2px solid #FF5722" },
  },
});

export const authLabelSx: SxProps<Theme> = {
  mb: 0.75,
  color: "#1F2937",
  fontWeight: 600,
  fontFamily: "Source Sans Pro",
  fontSize: "14px",
};

export const authCardSx: SxProps<Theme> = {
  border: "1px solid #E5E7EB",
  borderRadius: "16px",
  boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.06)",
  py: { xs: 3, md: 3.5 },
  px: { xs: 2.5, md: 3 },
  width: "100%",
  bgcolor: "#FFFFFF",
};

export const authLinkSx: SxProps<Theme> = {
  color: "#FF4F00",
  textDecoration: "none",
  fontWeight: 600,
  fontFamily: "Source Sans Pro",
  cursor: "pointer",
  "&:hover": { textDecoration: "underline" },
};

export const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;
export const AGE_GROUP_OPTIONS = ["Under 18", "18-24", "25-34", "35-44", "45-54", "55+"] as const;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

/** Mirrors the server rule (NIST 800-63B): 8+ characters, max 72 bytes for bcrypt */
export const validatePassword = (password: string): string => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (new TextEncoder().encode(password).length > 72) {
    return "Password is too long (maximum 72 characters)";
  }
  return "";
};

/**
 * Only allow same-origin paths in ?next= (prevents open redirects).
 * Parsed with URL so tricks like "/\t/evil.com" or "/\\evil.com" are normalised first.
 */
export const safeNextPath = (next: string | null | undefined, fallback = "/user/dashboard"): string => {
  if (!next || !next.startsWith("/")) return fallback;
  try {
    const base = typeof window !== "undefined" ? window.location.origin : "https://selfscore.invalid";
    const url = new URL(next, base);
    if (url.origin !== base) return fallback;
    const path = url.pathname + url.search + url.hash;
    // Belt and braces: never hand back something a browser could read as protocol-relative
    return path.startsWith("//") || path.startsWith("/\\") ? fallback : path;
  } catch {
    return fallback;
  }
};
