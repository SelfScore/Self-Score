"use client";

import { useState } from "react";
import { Alert, Box, CircularProgress, InputAdornment, MenuItem, TextField, Typography } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import WcIcon from "@mui/icons-material/Wc";
import CakeIcon from "@mui/icons-material/Cake";
import { getNames } from "country-list";
import ButtonSelfScore from "../ui/ButtonSelfScore";
import { authService, UserData } from "../../../services/authService";
import { getUserFriendlyError } from "../../../utils/errorMessages";
import { AGE_GROUP_OPTIONS, GENDER_OPTIONS, authInputSx, authLabelSx } from "./authStyles";

const COUNTRY_NAMES = getNames().sort((a, b) => a.localeCompare(b));

/** renderValue for selects: show a grey placeholder while empty */
function placeholder(text: string) {
  return function renderPlaceholder(selected: unknown) {
    return selected ? (selected as string) : <span style={{ color: "#999", fontFamily: "Source Sans Pro" }}>{text}</span>;
  };
}

interface ProfileDetailsFormProps {
  initial?: { country?: string; gender?: string; ageGroup?: string };
  onSaved: (user: UserData) => void;
  /** When provided, shows a "Skip for now" button */
  onSkip?: () => void;
  submitText?: string;
}

/** Country / gender / age group — used on onboarding, in the sign-up modal and the account gate */
export default function ProfileDetailsForm({
  initial,
  onSaved,
  onSkip,
  submitText = "Save and continue",
}: ProfileDetailsFormProps) {
  const [country, setCountry] = useState(initial?.country || "");
  const [gender, setGender] = useState(initial?.gender || "");
  const [ageGroup, setAgeGroup] = useState(initial?.ageGroup || "");
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [error, setError] = useState("");


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country || !gender || !ageGroup) {
      setError("Please fill in all three fields, or skip for now.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = await authService.completeOnboarding({ country, gender, ageGroup });
      if (result.success && result.data) onSaved(result.data);
      else setError(result.message || "Couldn't save your details. Please try again.");
    } catch (err) {
      setError(getUserFriendlyError(err, "profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!onSkip) return;
    setSkipping(true);
    try {
      await authService.skipOnboarding();
    } catch {
      // Skipping is best-effort; the reminders still work without it
    } finally {
      setSkipping(false);
      onSkip();
    }
  };

  const busy = saving || skipping;

  return (
    <Box component="form" onSubmit={handleSave} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography sx={authLabelSx}>Country</Typography>
      <TextField
        select
        value={country}
        onChange={(e) => {
          setCountry(e.target.value);
          setError("");
        }}
        fullWidth
        disabled={busy}
        slotProps={{
          select: {
            displayEmpty: true,
            renderValue: placeholder("Select your country"),
            MenuProps: { PaperProps: { style: { maxHeight: 300 } } },
          },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <PublicIcon sx={{ color: "#999" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2, ...authInputSx() }}
      >
        {COUNTRY_NAMES.map((name) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </TextField>

      <Typography sx={authLabelSx}>Gender</Typography>
      <TextField
        select
        value={gender}
        onChange={(e) => {
          setGender(e.target.value);
          setError("");
        }}
        fullWidth
        disabled={busy}
        slotProps={{
          select: { displayEmpty: true, renderValue: placeholder("Select your gender") },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <WcIcon sx={{ color: "#999" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2, ...authInputSx() }}
      >
        {GENDER_OPTIONS.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      <Typography sx={authLabelSx}>Age Group</Typography>
      <TextField
        select
        value={ageGroup}
        onChange={(e) => {
          setAgeGroup(e.target.value);
          setError("");
        }}
        fullWidth
        disabled={busy}
        slotProps={{
          select: { displayEmpty: true, renderValue: placeholder("Select your age group") },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <CakeIcon sx={{ color: "#999" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3, ...authInputSx() }}
      >
        {AGE_GROUP_OPTIONS.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      <ButtonSelfScore
        type="submit"
        text={saving ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : submitText}
        fullWidth
        disabled={busy}
        style={{ height: 48, borderRadius: 12 }}
      />

      {onSkip && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography
            component="button"
            type="button"
            onClick={handleSkip}
            disabled={busy}
            sx={{
              background: "none",
              border: "none",
              color: "#6B7280",
              fontFamily: "Source Sans Pro",
              fontSize: "16px",
              cursor: busy ? "default" : "pointer",
              textDecoration: "underline",
            }}
          >
            {skipping ? "Skipping…" : "Skip for now"}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
