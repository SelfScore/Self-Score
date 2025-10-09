"use client";

import { Box, Typography, Paper, Divider } from "@mui/material";
import ScoreDisplay from "./ScoreDisplay";
import ActionButtons from "./ActionButtons";
import LevelDetector from "./LevelDetector";

interface AnalysisData {
  level: number;
  score: number;
  totalQuestions: number;
  responses: any[];
  completedAt: string;
}

interface TestAnalysisProps {
  data: AnalysisData;
}

export default function TestAnalysis({ data }: TestAnalysisProps) {
  if (!data) {
    return null;
  }

  const { level, score, totalQuestions, completedAt } = data;

  // Calculate percentage score using the same logic as Level1Test
  // Level 1: 6 questions × 10 max points × 15 multiplier = 900 max score
  const maxScore = 900; // Fixed max score for Level 1
  const percentageScore = Math.round((score / maxScore) * 100);

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mb: 4,
          textAlign: "center",
          background: "linear-gradient(135deg, #E87A42 0%, #D16A35 100%)",
          color: "white",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            mb: 1,
          }}
        >
          🎉 Test Completed!
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Level {level} Analysis Results
        </Typography>
      </Paper>

      {/* Score Display */}
      <ScoreDisplay
        score={score}
        maxScore={maxScore}
        percentage={percentageScore}
        level={level}
      />

      <Divider sx={{ my: 4 }} />

      {/* Test Summary */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#2B2B2B" }}>
          📊 Test Summary
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Questions Answered
            </Typography>
            <Typography variant="h6" sx={{ color: "#E87A42" }}>
              {totalQuestions}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Completed On
            </Typography>
            <Typography variant="h6" sx={{ color: "#E87A42" }}>
              {new Date(completedAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <ActionButtons level={level} score={score} />

      {/* Next Level Detection */}
      <LevelDetector currentLevel={level} score={score} />
    </Box>
  );
}
