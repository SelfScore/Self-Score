"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import ButtonSelfScore from "../ui/ButtonSelfScore";
import CodeInput from "./CodeInput";
import ProfileDetailsForm from "./ProfileDetailsForm";
import { authService } from "../../../services/authService";
import { useAppSelector } from "../../../store/hooks";
import { getUserFriendlyError } from "../../../utils/errorMessages";

export type GateStep = "verify" | "profile";

interface AccountGateModalProps {
  open: boolean;
  steps: GateStep[];
  reason?: string;
  onDone: () => void;
  onClose: () => void;
}

const RESEND_SECONDS = 60;

export default function AccountGateModal({ open, steps, reason, onDone, onClose }: AccountGateModalProps) {
  const user = useAppSelector((s) => s.auth.user);
  const [index, setIndex] = useState(0);
  const step = steps[index];

  const goNext = useCallback(() => {
    if (index + 1 < steps.length) setIndex(index + 1);
    else onDone();
  }, [index, steps.length, onDone]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "16px", p: { xs: 2.5, sm: 4 } } } }}
    >
      <IconButton aria-label="Close" onClick={onClose} sx={{ position: "absolute", right: 12, top: 12 }}>
        <CloseIcon />
      </IconButton>

      <Typography
        component="h2"
        sx={{ fontFamily: "Faustina", fontWeight: 700, fontSize: { xs: "24px", sm: "28px" }, mb: 0.5, pr: 4 }}
      >
        {steps.length > 1 ? "Finish setting up your account" : step === "verify" ? "Verify your email" : "Complete your profile"}
      </Typography>
      <Typography sx={{ color: "#6B7280", fontFamily: "Source Sans Pro", fontSize: "16px", mb: 2.5 }}>
        {reason ||
          "A verified email and a complete profile are needed before payments, Level 4 and consultations."}
      </Typography>

      {steps.length > 1 && (
        <Stepper activeStep={index} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((s) => (
            <Step key={s}>
              <StepLabel>{s === "verify" ? "Verify email" : "Profile details"}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {step === "verify" && user && (
        <VerifyEmailStep
          email={user.email}
          isVerified={Boolean(user.isVerified)}
          verificationPending={Boolean(user.verificationPending)}
          onVerified={goNext}
        />
      )}
      {step === "profile" && user && (
        <ProfileDetailsForm
          initial={{ country: user.country, gender: user.gender, ageGroup: user.ageGroup }}
          onSaved={(updated) => {
            if (updated.isProfileComplete) goNext();
          }}
          submitText={index + 1 < steps.length ? "Save and continue" : "Save"}
        />
      )}
    </Dialog>
  );
}

export function VerifyEmailStep({
  email,
  isVerified,
  verificationPending,
  onVerified,
}: {
  email: string;
  isVerified: boolean;
  /** A still-valid email was already sent: don't replace it (that would break its link) */
  verificationPending: boolean;
  onVerified: () => void;
}) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const sentOnce = useRef(false);
  const doneRef = useRef(false);

  const complete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onVerified();
  }, [onVerified]);

  // Verified (by the code below, or by the link in another tab)
  useEffect(() => {
    if (isVerified) complete();
  }, [isVerified, complete]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const send = useCallback(async () => {
    setSending(true);
    setError("");
    try {
      const res = await authService.sendVerificationEmail();
      setInfo(res.message || `We've sent a link and a code to ${email}.`);
      setCountdown(RESEND_SECONDS);
    } catch (err: any) {
      const status = err?.response?.status;
      const serverCode = err?.response?.data?.code;
      if (serverCode === "ALREADY_VERIFIED") {
        await authService.getCurrentUser();
        return;
      }
      if (status === 429) {
        // A code was sent very recently (e.g. right after sign-up) — that one still works
        setInfo(`We recently sent a link and code to ${email}. ${err.response.data.message || ""}`.trim());
        const match = /(\d+) seconds/.exec(err.response.data.message || "");
        setCountdown(match ? Number(match[1]) : RESEND_SECONDS);
      } else {
        setError(getUserFriendlyError(err, "verify"));
      }
    } finally {
      setSending(false);
    }
  }, [email]);

  // Only send automatically when there's no valid email out there already.
  // Re-sending replaces the code/link (breaking the earlier email) and uses
  // up the account's hourly email quota.
  useEffect(() => {
    if (sentOnce.current || isVerified) return;
    sentOnce.current = true;
    if (verificationPending) {
      setInfo(`We've already sent a link and a code to ${email}. Check your inbox (and spam folder).`);
      return;
    }
    void send();
  }, [send, isVerified, verificationPending, email]);

  // Coming back to this tab after clicking the email link: re-check status
  useEffect(() => {
    const onFocus = () => {
      void authService.getCurrentUser();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const submit = async (value?: string) => {
    const full = value ?? code.join("");
    if (full.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await authService.verifyEmailCode(full);
      if (res.success) complete();
      else setError(res.message);
    } catch (err) {
      setError(getUserFriendlyError(err, "verify"));
      setCode(["", "", "", "", "", ""]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <MarkEmailReadIcon sx={{ color: "#005F73" }} />
        <Typography sx={{ fontFamily: "Source Sans Pro", fontSize: "16px" }}>
          Enter the 6-digit code we sent to <strong>{email}</strong>, or click the link in that email.
        </Typography>
      </Box>

      {info && !error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {info}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <CodeInput value={code} onChange={setCode} disabled={submitting} onComplete={(c) => void submit(c)} />
      </Box>

      <ButtonSelfScore
        text={submitting ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Verify email"}
        fullWidth
        disabled={submitting}
        onClick={() => void submit()}
        style={{ height: 48, borderRadius: 12 }}
      />

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography sx={{ color: "#6B7280", fontFamily: "Source Sans Pro", fontSize: "15px" }}>
          Didn&apos;t get it? Check your spam folder, or{" "}
          {countdown > 0 ? (
            <span>resend in {countdown}s</span>
          ) : (
            <Typography
              component="button"
              type="button"
              onClick={() => void send()}
              disabled={sending}
              sx={{
                background: "none",
                border: "none",
                p: 0,
                color: "#FF4F00",
                fontWeight: 600,
                fontFamily: "Source Sans Pro",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              {sending ? "sending…" : "resend the email"}
            </Typography>
          )}
        </Typography>
      </Box>
    </Box>
  );
}
