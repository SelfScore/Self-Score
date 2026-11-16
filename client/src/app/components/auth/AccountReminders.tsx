"use client";

import { useEffect, useState } from "react";
import { Box, Button, Dialog, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ButtonSelfScore from "../ui/ButtonSelfScore";
import { useAuth } from "../../../hooks/useAuth";
import { useAccountGate } from "./AccountGateProvider";
import { useAccountTasks } from "./useAccountTasks";
import type { GateStep } from "./AccountGateModal";

const BANNER_SNOOZE_DAYS = 3;

// localStorage can throw (private mode, blocked storage) — reminders still work, just not remembered
const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
};

/**
 * Dismissible strip on the dashboard listing account to-dos
 * (verify email / complete profile / set password). Comes back after 3 days.
 */
export function AccountReminderBanner() {
  const { user } = useAuth();
  const tasks = useAccountTasks();
  const storageKey = user ? `selfscore:accountBannerDismissedAt:${user.userId}` : "";
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!storageKey) return;
    const dismissedAt = Number(readStorage(storageKey) || 0);
    setHidden(Date.now() - dismissedAt < BANNER_SNOOZE_DAYS * 24 * 60 * 60 * 1000);
  }, [storageKey]);

  if (hidden || tasks.length === 0) return null;

  const dismiss = () => {
    writeStorage(storageKey, String(Date.now()));
    setHidden(true);
  };

  return (
    <Box
      role="status"
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 1.5, md: 2 },
        p: { xs: 2, md: 2.5 },
        pr: { xs: 5, md: 6 },
        mb: 3,
        borderRadius: "12px",
        bgcolor: "#FFF4EC",
        border: "1px solid #F5C9A9",
        position: "relative",
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flex: 1 }}>
        <InfoOutlinedIcon sx={{ color: "#E87A42", mt: 0.25 }} />
        <Box>
          <Typography sx={{ fontFamily: "Source Sans Pro", fontWeight: 700, fontSize: "16px", color: "#2B2B2B" }}>
            Finish setting up your account
          </Typography>
          <Typography sx={{ fontFamily: "Source Sans Pro", fontSize: "15px", color: "#6B7280" }}>
            {tasks.map((t) => t.description).join(" ")}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {tasks.map((task) => (
          <Button
            key={task.key}
            onClick={task.run}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "#E87A42",
              color: "#B34700",
              fontFamily: "Source Sans Pro",
              fontWeight: 600,
              borderRadius: "8px",
              "&:hover": { borderColor: "#B34700", bgcolor: "rgba(232,122,66,0.08)" },
            }}
          >
            {task.label}
          </Button>
        ))}
      </Box>
      <IconButton
        aria-label="Dismiss reminder"
        onClick={dismiss}
        size="small"
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

/**
 * One-time popup (per user, per browser) shown after a natural moment such as
 * the first Level 1 result. Only appears for email/profile to-dos.
 */
export function AccountReminderDialog({ delayMs = 2500 }: { delayMs?: number }) {
  const { user, isAuthenticated } = useAuth();
  const { openGate } = useAccountGate();
  const [open, setOpen] = useState(false);

  const steps: GateStep[] = [];
  if (user && !user.isVerified) steps.push("verify");
  if (user && !user.isProfileComplete) steps.push("profile");
  const needed = isAuthenticated && steps.length > 0;
  const storageKey = user ? `selfscore:accountPopupShown:${user.userId}` : "";

  useEffect(() => {
    if (!needed || !storageKey || readStorage(storageKey)) return;
    const t = setTimeout(() => {
      writeStorage(storageKey, String(Date.now()));
      setOpen(true);
    }, delayMs);
    return () => clearTimeout(t);
  }, [needed, storageKey, delayMs]);

  if (!open) return null;

  return (
    <Dialog
      open
      onClose={() => setOpen(false)}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "16px", p: 3 } } }}
    >
      <IconButton aria-label="Close" onClick={() => setOpen(false)} sx={{ position: "absolute", right: 10, top: 10 }}>
        <CloseIcon />
      </IconButton>
      <Typography sx={{ fontFamily: "Faustina", fontWeight: 700, fontSize: "24px", mb: 1, pr: 4 }}>
        Nice work on Level 1!
      </Typography>
      <Typography sx={{ fontFamily: "Source Sans Pro", color: "#6B7280", fontSize: "16px", mb: 3 }}>
        Take a minute to {steps.includes("verify") ? "verify your email" : ""}
        {steps.length === 2 ? " and " : ""}
        {steps.includes("profile") ? "complete your profile" : ""} so you&apos;re ready for Level 4 and consultations.
      </Typography>
      <ButtonSelfScore
        text="Do it now"
        fullWidth
        onClick={() => {
          setOpen(false);
          void openGate(steps, {
            reason: "This keeps your account secure and lets you unlock Level 4 and consultations later.",
          });
        }}
        style={{ height: 48, borderRadius: 12 }}
      />
      <Button
        onClick={() => setOpen(false)}
        sx={{ mt: 1.5, textTransform: "none", color: "#6B7280", fontFamily: "Source Sans Pro", fontSize: "15px" }}
        fullWidth
      >
        Maybe later
      </Button>
    </Dialog>
  );
}
