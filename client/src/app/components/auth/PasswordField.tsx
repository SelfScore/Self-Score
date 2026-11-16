"use client";

import { useState } from "react";
import { Box, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { authInputSx, MIN_PASSWORD_LENGTH } from "./authStyles";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  /** "new-password" shows the strength hint; "current-password" doesn't */
  autoComplete?: "new-password" | "current-password";
  id?: string;
  name?: string;
  /** Defaults to true for new passwords; turn off for "confirm password" fields */
  showStrength?: boolean;
}

/** Simple strength estimate for the hint only — the server enforces the real rule */
const getStrength = (password: string): { label: string; color: string; pct: number } => {
  if (!password) return { label: "", color: "transparent", pct: 0 };
  if (password.length < MIN_PASSWORD_LENGTH) return { label: "Too short", color: "#d32f2f", pct: 20 };
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: "Okay", color: "#E87A42", pct: 45 };
  if (score <= 3) return { label: "Good", color: "#0A9396", pct: 75 };
  return { label: "Strong", color: "#2e7d32", pct: 100 };
};

export default function PasswordField({
  value,
  onChange,
  placeholder = "Enter your password",
  disabled,
  error,
  autoComplete = "current-password",
  id,
  name = "password",
  showStrength: showStrengthProp,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const showStrength = showStrengthProp ?? autoComplete === "new-password";
  const strength = getStrength(value);

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        disabled={disabled}
        error={!!error}
        autoComplete={autoComplete}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: "#999" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={visible ? "Hide password" : "Show password"}
                  onClick={() => setVisible((v) => !v)}
                  edge="end"
                  size="small"
                >
                  {visible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={authInputSx(!!error)}
      />
      {error ? (
        <Typography sx={{ color: "#d32f2f", fontSize: "13px", mt: 0.5 }}>{error}</Typography>
      ) : showStrength ? (
        <Box sx={{ mt: 0.75 }}>
          {/* Only show the meter once they start typing */}
          <Box sx={{ height: 4, bgcolor: "#EEE", borderRadius: 2, overflow: "hidden", display: value ? "block" : "none", mb: 0.5 }}>
            <Box
              sx={{
                height: "100%",
                width: `${strength.pct}%`,
                bgcolor: strength.color,
                transition: "width 0.2s ease",
              }}
            />
          </Box>
          <Typography sx={{ color: strength.label ? strength.color : "#6B7280", fontSize: "13px", fontFamily: "Source Sans Pro" }}>
            {strength.label
              ? `${strength.label} · at least ${MIN_PASSWORD_LENGTH} characters`
              : `Use at least ${MIN_PASSWORD_LENGTH} characters.`}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
