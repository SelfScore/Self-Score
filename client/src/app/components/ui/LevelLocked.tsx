"use client";

import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import {
  Lock as LockIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface LevelLockedProps {
  level: number;
}

export default function LevelLocked({ level }: LevelLockedProps) {
  const router = useRouter();

  const handleGoToPreviousLevel = () => {
    const previousLevel = level - 1;
    router.push(`/user/test?level=${previousLevel}`);
  };

  const handleGoToLevelSelection = () => {
    router.push("/user");
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "600px",
        mx: "auto",
        pt: 14,
        textAlign: "center",
      }}
    >
      <Card
        elevation={3}
        sx={{
          p: 4,
          borderRadius: "16px",
          background: "linear-gradient(135deg, #F5F5F5 0%, #E8E8E8 100%)",
          border: "2px solid #CACACA",
        }}
      >
        <CardContent>
          {/* Lock Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#CACACA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <LockIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#005F73",
              mb: 2,
              fontFamily: "Faustina",
            }}
          >
            Level {level} Locked
          </Typography>

          {/* Message */}
          <Typography
            variant="body1"
            sx={{
              fontSize: "1.1rem",
              color: "#2B2B2B",
              mb: 3,
              lineHeight: 1.6,
              fontFamily: "Source Sans Pro",
            }}
          >
            To unlock Level {level}, you need to complete Level {level - 1}{" "}
            first. Our assessment is designed to build progressively on your
            insights.
          </Typography>

          {/* Progress Info */}
          <Box
            sx={{
              background: "rgba(232, 122, 66, 0.1)",
              borderRadius: "12px",
              p: 3,
              mb: 4,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#E87A42",
                fontWeight: "600",
                mb: 1,
              }}
            >
              Next Step:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
              }}
            >
              Complete Level {level - 1} to unlock this assessment and continue
              your journey.
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={handleGoToPreviousLevel}
              endIcon={<ArrowForwardIcon />}
              sx={{
                background: "#E87A42",
                color: "#fff",
                borderRadius: "25px",
                padding: "12px 32px",
                fontWeight: "bold",
                fontSize: "1rem",
                "&:hover": {
                  background: "#D16A35",
                },
              }}
            >
              Take Level {level - 1} Test
            </Button>
            <Button
              onClick={handleGoToLevelSelection}
              variant="outlined"
              sx={{
                borderColor: "#005F73",
                color: "#005F73",
                borderRadius: "25px",
                padding: "12px 32px",
                fontWeight: "bold",
                fontSize: "1rem",
                "&:hover": {
                  borderColor: "#004A5C",
                  color: "#004A5C",
                  background: "rgba(0, 95, 115, 0.04)",
                },
              }}
            >
              Back to Levels
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
