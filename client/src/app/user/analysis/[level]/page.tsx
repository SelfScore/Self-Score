"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Typography,
  Button,
} from "@mui/material";
import TestAnalysis from "../components/TestAnalysis";
import { questionsApi } from "../../../../services/questionsService";
import { authService } from "../../../../services/authService";

export default function LevelAnalysisPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string>("");
  const [analysisData, setAnalysisData] = useState<any>(null);

  const level = params.level as string;
  const levelNumber = parseInt(level.split("-")[1]); // Extract number from "level-1"

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        setCheckingAuth(true);
        setError("");

        // Try to get current user from server (this will check cookies)
        let user;
        try {
          user = await authService.getCurrentUser();
        } catch (_err) {
          console.log("Failed to check authentication status");
        }

        setCheckingAuth(false);

        // If no user found, check Redux store as fallback
        if (!user) {
          if (!authService.isAuthenticated()) {
            setError("Please log in to view your test analysis");
            return;
          }
          user = authService.getCurrentUserFromStore();
        }

        if (!user?.userId) {
          setError("User data not found");
          return;
        }

        // Fetch user's responses for this level
        const responsesResult = await questionsApi.getUserResponses(
          user.userId
        );

        if (!responsesResult.success) {
          setError("Failed to load test results");
          return;
        }

        // Filter responses for current level
        const levelResponses = responsesResult.data.filter(
          (response: any) => response.level === levelNumber
        );

        if (levelResponses.length === 0) {
          setError(`No test results found for Level ${levelNumber}`);
          return;
        }

        // Calculate score using the same logic as Level1Test.tsx
        const validResponses = levelResponses.filter(
          (response: any) =>
            response.questionId && response.selectedOptionIndex !== undefined
        );

        // Calculate raw score: each response (0-10) multiplied by 15
        const totalRawScore = validResponses.reduce(
          (acc: number, response: any) => {
            return acc + response.selectedOptionIndex * 15;
          },
          0
        );

        // Apply minimum score logic: if below 350, show 350
        const finalScore = Math.max(totalRawScore, 350);

        // Ensure we don't exceed maximum score of 900
        const score = Math.min(finalScore, 900);

        // Level 1 always has 6 questions
        const totalQuestions = 6;

        setAnalysisData({
          level: levelNumber,
          score,
          totalQuestions,
          responses: levelResponses,
          completedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error fetching analysis data:", err);
        setError("Failed to load analysis data");
      } finally {
        setLoading(false);
        setCheckingAuth(false);
      }
    };

    fetchAnalysisData();
  }, [level, levelNumber]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
          gap={2}
        >
          <CircularProgress size={50} sx={{ color: "#E87A42" }} />
          <Typography variant="h6" color="text.secondary">
            {checkingAuth
              ? "Verifying authentication..."
              : "Loading your analysis..."}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert
            severity="error"
            action={
              error.includes("log in") ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => (window.location.href = "/auth/signin")}
                >
                  Login
                </Button>
              ) : undefined
            }
          >
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <TestAnalysis data={analysisData} />
    </Container>
  );
}
