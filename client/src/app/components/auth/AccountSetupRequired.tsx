"use client";

import { Box, Typography } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ButtonSelfScore from "../ui/ButtonSelfScore";
import { useAccountGate } from "./AccountGateProvider";
import { useAuth } from "../../../hooks/useAuth";

/** Shown in place of Level 4/5 when the email isn't verified or the profile is incomplete */
export default function AccountSetupRequired({ level }: { level: number }) {
  const { ensureAccountReady } = useAccountGate();
  const { isEmailVerified, isProfileComplete } = useAuth();

  const missing = [
    !isEmailVerified && "verify your email",
    !isProfileComplete && "complete your profile",
  ].filter(Boolean);

  return (
    <Box
      sx={{
        maxWidth: 560,
        mx: "auto",
        mt: { xs: 12, md: 16 },
        mb: 8,
        p: { xs: 3, md: 5 },
        textAlign: "center",
        border: "1px solid #3A3A3A4D",
        borderRadius: "16px",
      }}
    >
      <VerifiedUserIcon sx={{ fontSize: 56, color: "#005F73", mb: 2 }} />
      <Typography sx={{ fontFamily: "Faustina", fontWeight: 700, fontSize: { xs: "24px", md: "30px" }, mb: 1 }}>
        One more step before Level {level}
      </Typography>
      <Typography sx={{ fontFamily: "Source Sans Pro", color: "#6B7280", fontSize: "17px", mb: 3 }}>
        Please {missing.join(" and ")} to continue. It only takes a minute.
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <ButtonSelfScore
          text="Finish account setup"
          onClick={() => void ensureAccountReady()}
          style={{ height: 48, borderRadius: 12 }}
        />
      </Box>
    </Box>
  );
}
