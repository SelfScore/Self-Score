"use client";

import { Box, Typography, Paper, Chip } from "@mui/material";
import { CheckCircle, Lock, TrendingUp } from "@mui/icons-material";

interface LevelDetectorProps {
  currentLevel: number;
  score: number;
}

export default function LevelDetector({
  currentLevel,
  score,
}: LevelDetectorProps) {
  // Define level unlock criteria (based on Level 1 scoring: 350-900 range)
  const getLevelUnlockCriteria = (level: number) => {
    const criteria = {
      1: { minScore: 0, name: "Foundation Level" },
      2: { minScore: 500, name: "Intermediate Level" }, // 55% of 900 (Good performance)
      3: { minScore: 650, name: "Advanced Level" }, // 72% of 900 (Very good performance)
      4: { minScore: 750, name: "Expert Level" }, // 83% of 900 (Excellent performance)
      5: { minScore: 850, name: "Master Level" }, // 94% of 900 (Near perfect)
    };
    return (
      criteria[level as keyof typeof criteria] || {
        minScore: 0,
        name: "Unknown Level",
      }
    );
  };

  // Determine next available level
  const getNextAvailableLevel = () => {
    const nextLevel = currentLevel + 1;
    const criteria = getLevelUnlockCriteria(nextLevel);

    if (!criteria) return null;

    const isUnlocked = score >= criteria.minScore;

    return {
      level: nextLevel,
      name: criteria.name,
      minScore: criteria.minScore,
      isUnlocked,
      currentScore: score,
      scoreNeeded: Math.max(0, criteria.minScore - score),
    };
  };

  const nextLevel = getNextAvailableLevel();

  if (!nextLevel) {
    return (
      <Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" sx={{ color: "#4CAF50", mb: 1 }}>
          🎉 Congratulations!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You have completed all available levels!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          color: "#2B2B2B",
          fontWeight: "600",
        }}
      >
        🔓 Next Level Status
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {nextLevel.isUnlocked ? (
            <CheckCircle sx={{ color: "#4CAF50" }} />
          ) : (
            <Lock sx={{ color: "#FF9800" }} />
          )}
          <Typography
            variant="h6"
            sx={{ color: nextLevel.isUnlocked ? "#4CAF50" : "#FF9800" }}
          >
            Level {nextLevel.level}
          </Typography>
        </Box>

        <Chip
          label={nextLevel.name}
          variant="outlined"
          size="small"
          sx={{
            borderColor: nextLevel.isUnlocked ? "#4CAF50" : "#FF9800",
            color: nextLevel.isUnlocked ? "#4CAF50" : "#FF9800",
          }}
        />
      </Box>

      {nextLevel.isUnlocked ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TrendingUp sx={{ color: "#4CAF50", fontSize: 20 }} />
          <Typography variant="body1" sx={{ color: "#4CAF50" }}>
            Unlocked! You can now proceed to Level {nextLevel.level}.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Score needed:</strong> {nextLevel.minScore} points
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You need {nextLevel.scoreNeeded} more points to unlock Level{" "}
            {nextLevel.level}. Keep practicing and improve your score!
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
