"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Alert,
  Autocomplete,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PublicIcon from "@mui/icons-material/Public";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { getName, getNames } from "country-list";
import LogoWithText from "../../../public/images/logos/LogoWithText.png";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import { getUserFriendlyError } from "../../utils/errorMessages";
import ButtonSelfScore from "../components/ui/ButtonSelfScore";
import {
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  authInputSx,
  safeNextPath,
} from "../components/auth/authStyles";

const COUNTRY_NAMES = getNames().sort((a, b) => a.localeCompare(b));
const BRAND = "#FF4F00";
const TEAL = "#005F73";
/** Short pause so the user sees their choice highlighted before the next question */
const ADVANCE_DELAY_MS = 280;

type StepKey = "country" | "gender" | "ageGroup";

const STEPS: { key: StepKey; title: string; why: string }[] = [
  {
    key: "country",
    title: "Where are you based?",
    why: "We use this to put your score in context with people in your region.",
  },
  {
    key: "gender",
    title: "How do you identify?",
    why: "This helps us compare your results fairly. Choose whichever fits best.",
  },
  {
    key: "ageGroup",
    title: "What's your age group?",
    why: "Life stage shapes how we read your results, so this makes them more relevant.",
  },
];

/**
 * Best guess at the user's country from the browser's language settings
 * (e.g. "en-IN" → India). Only uses an explicit region, never a guess from
 * the language alone, and returns "" when nothing matches our list.
 */
function guessCountry(): string {
  if (typeof navigator === "undefined") return "";
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of languages) {
    const match = /[-_]([A-Za-z]{2})(?:$|[-_])/.exec(lang || "");
    if (!match) continue;
    const name = getName(match[1].toUpperCase());
    if (name && COUNTRY_NAMES.includes(name)) return name;
  }
  return "";
}

/** Large tappable choice (radio semantics) — faster than a dropdown for short lists */
function OptionCard({
  label,
  selected,
  loading,
  disabled,
  onSelect,
  fullRow,
}: {
  label: string;
  selected: boolean;
  loading?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  /** Span the whole grid row (used for "Prefer not to say") */
  fullRow?: boolean;
}) {
  return (
    <Box
      component="button"
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      sx={{
        ...(fullRow && { gridColumn: "1 / -1" }),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        width: "100%",
        minHeight: 60,
        px: 2.5,
        py: 1.75,
        borderRadius: "14px",
        border: selected ? `2px solid ${BRAND}` : "1px solid #D1D5DB",
        bgcolor: selected ? "#FFF4EE" : "#FFFFFF",
        color: "#1F2937",
        fontFamily: "Source Sans Pro",
        fontSize: "17px",
        fontWeight: selected ? 700 : 600,
        textAlign: "left",
        cursor: disabled ? "default" : "pointer",
        transition: "border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease",
        // Keep the card the same size when the border thickens
        m: selected ? 0 : "1px",
        "&:hover:not(:disabled)": { borderColor: selected ? BRAND : "#9CA3AF", bgcolor: selected ? "#FFF4EE" : "#F9FAFB" },
        "&:active:not(:disabled)": { transform: "scale(0.99)" },
        "&:focus-visible": { outline: `3px solid rgba(255,79,0,0.35)`, outlineOffset: 2 },
        "&:disabled": { opacity: selected ? 1 : 0.6 },
      }}
    >
      <span>{label}</span>
      {loading ? (
        <CircularProgress size={20} sx={{ color: BRAND }} />
      ) : (
        <CheckCircleIcon
          aria-hidden
          sx={{ fontSize: 22, color: BRAND, opacity: selected ? 1 : 0, transition: "opacity 0.15s ease" }}
        />
      )}
    </Box>
  );
}

/**
 * Shown once right after sign-up: country → gender → age group, one question
 * per screen, with a progress bar and "Skip for now" always available.
 * The answers are saved together on the last step.
 */
function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const { user, isAuthenticated, isInitialized } = useAuth();

  const [step, setStep] = useState(0);
  const [country, setCountry] = useState("");
  const [countryGuessed, setCountryGuessed] = useState(false);
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const prefilled = useRef(false);
  // Guards against a double tap firing two saves before the cards disable
  const savingRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Signed out → sign in first, then come back here
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace(
        `/auth/signin?next=${encodeURIComponent(`/onboarding?next=${encodeURIComponent(next)}`)}`
      );
    }
  }, [isInitialized, isAuthenticated, router, next]);

  // Nothing left to ask (e.g. opened this page again later)
  useEffect(() => {
    if (user?.isProfileComplete && !saving && !leaving) {
      setLeaving(true);
      router.replace(next);
    }
  }, [user?.isProfileComplete, saving, leaving, router, next]);

  // Prefill anything already on the account; otherwise guess the country
  useEffect(() => {
    if (!user || prefilled.current) return;
    prefilled.current = true;
    if (user.gender) setGender(user.gender);
    if (user.ageGroup) setAgeGroup(user.ageGroup);
    if (user.country) {
      setCountry(user.country);
    } else {
      const guess = guessCountry();
      if (guess) {
        setCountry(guess);
        setCountryGuessed(true);
      }
    }
  }, [user]);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  // Move keyboard / screen-reader focus to the new question when the step changes
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const busy = saving || skipping || leaving;
  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const goTo = (index: number) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setError("");
    setStep(index);
  };

  const advanceSoon = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => goTo(step + 1), ADVANCE_DELAY_MS);
  };

  const save = async (finalAgeGroup: string) => {
    if (!country || !gender || !finalAgeGroup) {
      // Shouldn't happen, but send the user to whatever is missing
      goTo(!country ? 0 : !gender ? 1 : 2);
      return;
    }
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const result = await authService.completeOnboarding({ country, gender, ageGroup: finalAgeGroup });
      if (result.success) {
        setLeaving(true);
        router.replace(next);
        return;
      }
      setError(result.message || "Couldn't save your details. Please try again.");
    } catch (err) {
      setError(getUserFriendlyError(err, "profile"));
    }
    savingRef.current = false;
    setSaving(false);
  };

  const skip = async () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setSkipping(true);
    try {
      await authService.skipOnboarding();
    } catch {
      // Best effort: reminders still work if this fails
    }
    setLeaving(true);
    router.replace(next);
  };

  const continueFromCountry = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!country) {
      setError("Please choose your country, or skip for now.");
      return;
    }
    goTo(1);
  };

  const firstName = useMemo(() => user?.username?.trim().split(/\s+/)[0] || "", [user?.username]);

  if (!isInitialized || !user) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: BRAND }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column", bgcolor: "#FFFFFF" }}>
      {/* Top bar: back · logo · skip */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          bgcolor: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            px: { xs: 1, sm: 3 },
            height: { xs: 60, sm: 72 },
          }}
        >
          <Box>
            {step > 0 && (
              <IconButton
                aria-label="Previous question"
                onClick={() => goTo(step - 1)}
                disabled={busy}
                sx={{ color: "#374151" }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
          </Box>
          <Image
            src={LogoWithText}
            alt="Self Score"
            priority
            style={{ height: "auto", width: "clamp(110px, 28vw, 150px)" }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Box
              component="button"
              type="button"
              onClick={skip}
              disabled={busy}
              sx={{
                background: "none",
                border: "none",
                px: { xs: 1, sm: 1.5 },
                py: 1,
                borderRadius: "8px",
                color: "#4B5563",
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "15px", sm: "16px" },
                fontWeight: 600,
                cursor: busy ? "default" : "pointer",
                whiteSpace: "nowrap",
                "&:hover:not(:disabled)": { bgcolor: "#F3F4F6", color: "#111827" },
                "&:focus-visible": { outline: `3px solid rgba(255,79,0,0.35)` },
              }}
            >
              {skipping ? "Skipping…" : "Skip for now"}
            </Box>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          aria-label={`Step ${step + 1} of ${STEPS.length}`}
          sx={{
            height: 4,
            bgcolor: "#F1E4DC",
            "& .MuiLinearProgress-bar": { bgcolor: BRAND, transition: "transform 0.35s ease" },
          }}
        />
      </Box>

      {/* Question */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          px: { xs: 2, sm: 3 },
          pt: { xs: 4, sm: 8, md: 10 },
          pb: 6,
        }}
      >
        <Box
          key={current.key}
          sx={{
            width: "100%",
            maxWidth: 560,
            "@keyframes onboardingIn": {
              from: { opacity: 0, transform: "translateY(12px)" },
              to: { opacity: 1, transform: "none" },
            },
            animation: "onboardingIn 0.3s ease both",
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        >
          <Typography
            sx={{ color: TEAL, fontFamily: "Source Sans Pro", fontWeight: 700, fontSize: "14px", letterSpacing: "0.06em", textTransform: "uppercase", mb: 1 }}
          >
            Step {step + 1} of {STEPS.length}
            {step === 0 && firstName ? ` · Welcome, ${firstName}` : ""}
          </Typography>
          <Typography
            component="h1"
            ref={headingRef}
            tabIndex={-1}
            sx={{ fontFamily: "Faustina", fontWeight: 700, color: "#111827", fontSize: { xs: "28px", sm: "34px" }, lineHeight: 1.2, mb: 1, outline: "none" }}
          >
            {current.title}
          </Typography>
          <Typography sx={{ color: "#6B7280", fontFamily: "Source Sans Pro", fontSize: { xs: "16px", sm: "17px" }, mb: 3.5 }}>
            {current.why}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          {current.key === "country" && (
            <Box component="form" onSubmit={continueFromCountry} noValidate>
              <Autocomplete
                options={COUNTRY_NAMES}
                value={country || null}
                onChange={(_e, value, reason) => {
                  setCountry(value || "");
                  setCountryGuessed(false);
                  setError("");
                  // Picking from the list is a clear answer: move on
                  if (value && reason === "selectOption") advanceSoon();
                }}
                autoHighlight
                openOnFocus={!country}
                disabled={busy}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    autoFocus={!country}
                    placeholder="Search for your country"
                    slotProps={{
                      htmlInput: { ...params.inputProps, "aria-label": "Country" },
                      input: {
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <PublicIcon sx={{ color: "#9CA3AF" }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={[
                      authInputSx() as Record<string, unknown>,
                      { "& .MuiOutlinedInput-root": { minHeight: 56, fontSize: "17px" } },
                    ]}
                  />
                )}
              />
              {countryGuessed && country && (
                <Typography sx={{ color: "#6B7280", fontFamily: "Source Sans Pro", fontSize: "14px", mt: 1 }}>
                  We filled this in from your browser settings. Change it if it&apos;s not right.
                </Typography>
              )}
              <ButtonSelfScore
                type="submit"
                text="Continue"
                fullWidth
                disabled={busy || !country}
                style={{ height: 52, borderRadius: 12, marginTop: 24, opacity: busy || !country ? 0.5 : 1 }}
              />
            </Box>
          )}

          {current.key === "gender" && (
            <Box role="radiogroup" aria-label="Gender" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              {GENDER_OPTIONS.map((option) => (
                <OptionCard
                  key={option}
                  label={option}
                  selected={gender === option}
                  disabled={busy}
                  onSelect={() => {
                    setGender(option);
                    setError("");
                    advanceSoon();
                  }}
                />
              ))}
            </Box>
          )}
          {/* Came back to this step: let them keep their earlier answer */}
          {current.key === "gender" && gender && (
            <ButtonSelfScore
              type="button"
              text="Continue"
              fullWidth
              disabled={busy}
              onClick={() => goTo(2)}
              style={{ height: 52, borderRadius: 12, marginTop: 24 }}
            />
          )}

          {current.key === "ageGroup" && (
            <Box role="radiogroup" aria-label="Age group" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 1.5 }}>
              {AGE_GROUP_OPTIONS.map((option) => (
                <OptionCard
                  key={option}
                  label={option}
                  selected={ageGroup === option}
                  loading={saving && ageGroup === option}
                  fullRow={option === "Prefer not to say"}
                  disabled={busy}
                  onSelect={() => {
                    setAgeGroup(option);
                    void save(option);
                  }}
                />
              ))}
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mt: 4, color: "#6B7280" }}>
            <LockOutlinedIcon sx={{ fontSize: 18, mt: "2px" }} />
            <Typography sx={{ fontFamily: "Source Sans Pro", fontSize: "14px", lineHeight: 1.5 }}>
              Private to you, and you can change it any time in your profile. It&apos;s needed before Level 4 or a
              consultation.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
