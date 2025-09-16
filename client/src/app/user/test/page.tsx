"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { Suspense } from "react";
import Level1Test from "./Level1Test";
import Level2Test from "./Level2Test";

function TestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const level = searchParams.get("level");

  const renderTestComponent = () => {
    switch (level) {
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
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="h5" sx={{ color: "#005F73", mb: 2 }}>
              Level 4: Mastery Test
            </Typography>
            <Typography variant="body1" sx={{ color: "#666" }}>
              Coming Soon - This test will evaluate your mastery of life
              management skills.
            </Typography>
          </Box>
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
    router.push("/user");
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#F9F8F6",
        p: 4,
        minHeight: "100vh",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <button
          style={{
            background: "transparent",
            color: "#005F73",
            border: "2px solid #005F73",
            borderRadius: "25px",
            padding: "8px 20px",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={handleBackToInfo}
        >
          ← Back to Levels
        </button>
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
