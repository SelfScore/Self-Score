import {
  Download as DownloadIcon,
  TrendingUp as NextLevelIcon,
  Dashboard as DashboardIcon,
  Lock,
} from "@mui/icons-material";

import { Box, Button, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

interface ActionButtonsProps {
  level: number;
  score: number; // Add score to check unlock status
}

export default function ActionButtons({ level, score }: ActionButtonsProps) {
  const router = useRouter();

  // Define the same unlock criteria as LevelDetector
  const getLevelUnlockCriteria = (level: number) => {
    const criteria = {
      1: { minScore: 0, name: "Foundation Level" },
      2: { minScore: 500, name: "Intermediate Level" },
      3: { minScore: 650, name: "Advanced Level" },
      4: { minScore: 750, name: "Expert Level" },
      5: { minScore: 850, name: "Master Level" },
    };
    return criteria[level as keyof typeof criteria];
  };

  // Check if next level is unlocked
  const nextLevel = level + 1;
  const nextLevelCriteria = getLevelUnlockCriteria(nextLevel);
  const isNextLevelUnlocked = nextLevelCriteria
    ? score >= nextLevelCriteria.minScore
    : false;

  const handleDownloadReport = () => {
    // TODO: Implement PDF report generation
    console.log("Download report for level", level);
    alert("Report download feature coming soon!");
  };

  const handleGoToNextLevel = () => {
    const nextLevel = level + 1;
    // Navigate to next level test
    router.push(`/user/test?level=${nextLevel}`);
  };

  const handleGoToDashboard = () => {
    router.push("/user/dashboard");
  };

  return (
    <Paper elevation={1} sx={{ p: 4 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          textAlign: "center",
          color: "#2B2B2B",
          fontWeight: "600",
        }}
      >
        What would you like to do next?
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          justifyContent: "center",
        }}
      >
        {/* Download Report */}
        <Button
          variant="outlined"
          size="large"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadReport}
          sx={{
            borderColor: "#E87A42",
            color: "#E87A42",
            borderRadius: "25px",
            padding: "12px 24px",
            fontWeight: "600",
            flex: { xs: 1, md: "none" },
            minWidth: { md: "180px" },
            "&:hover": {
              borderColor: "#D16A35",
              backgroundColor: "rgba(232, 122, 66, 0.1)",
            },
          }}
        >
          Download Report
        </Button>

        {/* Next Level - Only show if unlocked and level exists */}
        {nextLevelCriteria && (
          <Button
            variant="contained"
            size="large"
            startIcon={isNextLevelUnlocked ? <NextLevelIcon /> : <Lock />}
            onClick={isNextLevelUnlocked ? handleGoToNextLevel : undefined}
            disabled={!isNextLevelUnlocked}
            sx={{
              background: isNextLevelUnlocked
                ? "linear-gradient(135deg, #E87A42 0%, #D16A35 100%)"
                : "#ccc",
              borderRadius: "25px",
              padding: "12px 24px",
              fontWeight: "600",
              flex: { xs: 1, md: "none" },
              minWidth: { md: "180px" },
              "&:hover": {
                background: isNextLevelUnlocked
                  ? "linear-gradient(135deg, #D16A35 0%, #C05A2E 100%)"
                  : "#ccc",
              },
              "&:disabled": {
                background: "#ccc",
                color: "#666",
              },
            }}
          >
            {isNextLevelUnlocked
              ? `Go to Level ${nextLevel}`
              : `Level ${nextLevel} Locked`}
          </Button>
        )}

        {/* Dashboard */}
        <Button
          variant="outlined"
          size="large"
          startIcon={<DashboardIcon />}
          onClick={handleGoToDashboard}
          sx={{
            borderColor: "#005F73",
            color: "#005F73",
            borderRadius: "25px",
            padding: "12px 24px",
            fontWeight: "600",
            flex: { xs: 1, md: "none" },
            minWidth: { md: "180px" },
            "&:hover": {
              borderColor: "#004A5C",
              backgroundColor: "rgba(0, 95, 115, 0.1)",
            },
          }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Paper>
  );
}
