"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import Level1Test from "./Level1Test";
import Level2Test from "./Level2Test";
import Level3Test from "./Level3Test";
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
  const { checkTestAttemptAccess, getRemainingAttempts } = useLevelAccess();

  // State for toast notification
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 🛡️ PAY-PER-USE VALIDATION - Check remaining attempts for Level 4 & 5
  useEffect(() => {
    const checkAttempts = async () => {
      if (level === 4 || level === 5) {
        try {
          // First, check if there's an active interview
          let hasActiveInterview = false;

          if (level === 4) {
            const { aiInterviewService } =
              await import("../../../services/aiInterviewService");
            const activeCheck = await aiInterviewService.checkActiveInterview();
            hasActiveInterview = activeCheck.data.hasActiveInterview;
          } else if (level === 5) {
            // For Level 5, check via API
            const api = (await import("../../../lib/api")).default;
            const activeCheck = await api.get(
              "/api/realtime-interview/check-active",
            );
            hasActiveInterview = activeCheck.data.hasActiveInterview;
          }

          // If there's an active interview, allow continuation (don't check attempts)
          if (hasActiveInterview) {
            console.log(
              `✅ Active Level ${level} interview found - allowing continuation`,
            );
            return;
          }

          // No active interview - check attempts for NEW test
          const remainingAttempts = getRemainingAttempts(level);

          if (remainingAttempts === 0) {
            // Show toast notification
            setToastMessage(
              `You have no remaining attempts for Level ${level}. Please purchase more attempts to continue.`,
            );
            setShowToast(true);

            // Redirect to TestInfo page after a short delay
            setTimeout(() => {
              router.push(`/testInfo?level=${level}`);
            }, 2000);
          }
        } catch (error) {
          console.error("Error checking active interview:", error);
          // On error, fall back to just checking attempts
          const remainingAttempts = getRemainingAttempts(level);
          if (remainingAttempts === 0) {
            setToastMessage(
              `You have no remaining attempts for Level ${level}. Please purchase more attempts to continue.`,
            );
            setShowToast(true);
            setTimeout(() => {
              router.push(`/testInfo?level=${level}`);
            }, 2000);
          }
        }
      }
    };

    checkAttempts();
  }, [level, getRemainingAttempts, router]);

  // 🛡️ PROTECTION LOGIC - Check if user can attempt the test
  const attemptAccess = checkTestAttemptAccess(level);

  if (!attemptAccess.canAttempt) {
    if (attemptAccess.reason === "SUBSCRIPTION_REQUIRED") {
      return <SubscriptionRequired level={level} />;
    }
    if (attemptAccess.reason === "PREVIOUS_LEVEL_NOT_COMPLETED") {
      const missingLevel = attemptAccess.missingLevel || level - 1;
      return <LevelLocked level={level} requiredLevel={missingLevel} />;
    }
  }

  // If Level 4 or 5 has no attempts, show loading state while redirecting
  if ((level === 4 || level === 5) && getRemainingAttempts(level) === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "#005F73" }}>
          Redirecting to purchase page...
        </Typography>
        <Typography variant="body2" sx={{ color: "#666" }}>
          You have no remaining attempts for Level {level}
        </Typography>
      </Box>
    );
  }

  // 🎯 ORIGINAL TEST RENDERING
  const renderTestComponent = () => {
    switch (level.toString()) {
      case "1":
        return <Level1Test />;
      case "2":
        return <Level2Test />;
      case "3":
        return <Level3Test />;
      case "4":
        return (
          <Suspense
            fallback={<Box sx={{ textAlign: "center", p: 4 }}>Loading...</Box>}
          >
            <Level4Test />
          </Suspense>
        );
      case "5":
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
              Please select a valid level from 1-5.
            </Typography>
          </Box>
        );
    }
  };

  const handleBackToInfo = () => {
    router.push("/selfscoretest");
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#fff",
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        mt: { xs: 8, md: 0 },
      }}
    >
      <Box sx={{ mb: 1, ml: { xs: 0, lg: 8 }, mt: { xs: 2, md: 10 } }}>
        <OutLineButton
          startIcon={<ArrowBackIosIcon sx={{ fontSize: { xs: 12, md: 18 } }} />}
          sx={{
            background: "transparent",
            color: "#3A3A3A",
            border: "1px solid #3A3A3A",
            borderRadius: "6px",
            padding: { xs: "2px", md: "3.5px 14px" },
            height: { xs: "20px", md: "auto" },
            minHeight: { xs: "20px", md: "44px" },
            fontWeight: 400,
            fontSize: { xs: "14px", md: "18px" },
            minWidth: { xs: "28px", md: "100px" },
            cursor: "pointer",
            transition: "all 0.2s",
            "& .MuiButton-startIcon": {
              margin: { xs: 0, md: "0 8px 0 -4px" },
            },
          }}
          onClick={handleBackToInfo}
        >
          <Box sx={{ display: { xs: "none", md: "block" } }}>Back</Box>
        </OutLineButton>
      </Box>
      {renderTestComponent()}

      {/* Toast Notification for No Attempts */}
      <Snackbar
        open={showToast}
        autoHideDuration={6000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowToast(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
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
