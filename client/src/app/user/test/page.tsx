"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { Suspense } from "react";
import Level1Test from "./Level1Test";
import Level2Test from "./Level2Test";
import Level4Test from "./Level4Test";
import { useLevelAccess } from "../../../hooks/useLevelAccess";
import SubscriptionRequired from "../../components/ui/SubscriptionRequired";
import LevelLocked from "../../components/ui/LevelLocked";
import OutLineButton from "@/app/components/ui/OutLineButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

function TestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const level = parseInt(searchParams.get("level") || "1");
  const { checkTestAttemptAccess } = useLevelAccess();

  // 🛡️ PROTECTION LOGIC - Check if user can attempt the test
  const attemptAccess = checkTestAttemptAccess(level);

  if (!attemptAccess.canAttempt) {
    if (attemptAccess.reason === "SUBSCRIPTION_REQUIRED") {
      return <SubscriptionRequired level={level} />;
    }
    if (attemptAccess.reason === "PREVIOUS_LEVEL_NOT_COMPLETED") {
      return <LevelLocked level={level} />;
    }
  }

  // 🎯 ORIGINAL TEST RENDERING
  const renderTestComponent = () => {
    switch (level.toString()) {
      case "1":
        return <Level1Test />;
      case "2":
        return <Level2Test />;
      case "3":
        return (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="h5" sx={{ color: "#005F73", mb: 2 }}>
              Level 3: Action Test
            </Typography>
            <Typography variant="body1" sx={{ color: "#666" }}>
              Coming Soon - This test will focus on implementing positive
              changes in your life.
            </Typography>
          </Box>
        );
      case "4":
        return (
          <Suspense
            fallback={<Box sx={{ textAlign: "center", p: 4 }}>Loading...</Box>}
          >
            <Level4Test />
          </Suspense>
        );
      default:
        return (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="h5" sx={{ color: "#005F73", mb: 2 }}>
              Invalid Level
            </Typography>
            <Typography variant="body1" sx={{ color: "#666" }}>
              Please select a valid level from 1-4.
            </Typography>
          </Box>
        );
    }
  };

  const handleBackToInfo = () => {
    router.push("/testInfo");
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#fff",
        p: 4,
        minHeight: "100vh",
      }}
    >
      <Box sx={{ mb: 1, ml: { xs: 0, lg: 8 }, mt: 10 }}>
        <OutLineButton
          startIcon={<ArrowBackIosIcon />}
          style={{
            background: "transparent",
            color: "#3A3A3A",
            border: "1px solid #3A3A3A",
            borderRadius: "8px",
            padding: "3.5px 14px",
            fontWeight: 400,
            fontSize: "18px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={handleBackToInfo}
        >
          Back
        </OutLineButton>
      </Box>
      {renderTestComponent()}
    </Box>
  );
}

export default function TestsPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#F9F8F6",
          }}
        >
          <Typography>Loading test...</Typography>
        </Box>
      }
    >
      <TestContent />
    </Suspense>
  );
}
