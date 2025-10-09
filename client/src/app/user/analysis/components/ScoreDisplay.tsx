"use client";

import { Box, Typography, Paper, LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

interface ScoreDisplayProps {
  score: number;
  maxScore: number;
  percentage: number;
  level: number;
}

const ScoreCircle = styled(Box)(() => ({
  width: 150,
  height: 150,
  borderRadius: "50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #E87A42 0%, #D16A35 100%)",
  color: "white",
  margin: "0 auto",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: "8px",
    borderRadius: "50%",
    background: "white",
    zIndex: 1,
  },
  "& > *": {
    position: "relative",
    zIndex: 2,
    color: "#E87A42",
  },
}));

const StyledLinearProgress = styled(LinearProgress)(() => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: "#f0f0f0",
  "& .MuiLinearProgress-bar": {
    background: "linear-gradient(90deg, #E87A42 0%, #D16A35 100%)",
    borderRadius: 5,
  },
}));

export default function ScoreDisplay({
  score,
  maxScore,
  percentage,
  level,
}: ScoreDisplayProps) {
  // Determine score level and message
  const getScoreLevel = (percentage: number) => {
    if (percentage >= 90)
      return { level: "Excellent", color: "#4CAF50", emoji: "🌟" };
    if (percentage >= 80)
      return { level: "Very Good", color: "#8BC34A", emoji: "⭐" };
    if (percentage >= 70)
      return { level: "Good", color: "#FFC107", emoji: "👍" };
    if (percentage >= 60)
      return { level: "Fair", color: "#FF9800", emoji: "👌" };
    return { level: "Needs Improvement", color: "#F44336", emoji: "💪" };
  };

  const scoreLevel = getScoreLevel(percentage);

  return (
    <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          color: "#2B2B2B",
          fontWeight: "600",
        }}
      >
        Your Level {level} Score
      </Typography>

      {/* Score Circle */}
      <ScoreCircle sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", lineHeight: 1 }}>
          {score}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          / {maxScore}
        </Typography>
      </ScoreCircle>

      {/* Percentage Score */}
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          color: scoreLevel.color,
          fontWeight: "bold",
        }}
      >
        {percentage}%
      </Typography>

      {/* Score Level */}
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          color: scoreLevel.color,
          fontWeight: "500",
        }}
      >
        {scoreLevel.emoji} {scoreLevel.level}
      </Typography>

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <StyledLinearProgress variant="determinate" value={percentage} />
      </Box>

      <Typography variant="body2" color="text.secondary">
        Progress: {percentage}% of maximum score achieved
      </Typography>
    </Paper>
  );
}
