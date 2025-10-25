"use client";
import React from "react";
import { Box, Typography, Container, Chip } from "@mui/material";
import { useRouter } from "next/navigation";
import { useLevelAccess } from "../../../hooks/useLevelAccess";
import TestCard from "../../components/ui/TestCard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import OutLineButton from "@/app/components/ui/OutLineButton";

export default function JourneyProgress() {
  const router = useRouter();
  const {
    getHighestUnlockedLevel,
    isLevelCompleted,
    getTestScore,
    hasActiveSubscription,
  } = useLevelAccess();

  const highestUnlockedLevel = getHighestUnlockedLevel();
  const isSubscribed = hasActiveSubscription();

  // Level configuration with names
  const levels = [
    { id: 1, name: "Awareness" },
    { id: 2, name: "Exploration" },
    { id: 3, name: "Action" },
    { id: 4, name: "Mastery" },
  ];

  // Determine card status for each level
  const getCardStatus = (
    levelId: number
  ): "unlocked" | "locked" | "completed" => {
    if (isLevelCompleted(levelId)) return "completed";
    if (levelId <= highestUnlockedLevel) return "unlocked";
    return "locked";
  };

  // Handle Start Test
  const handleStartTest = (level: number) => {
    router.push(`/user/test?level=${level}`);
  };

  // Handle Retake Test
  const handleRetakeTest = (level: number) => {
    router.push(`/user/test?level=${level}`);
  };

  // Handle Unlock (Navigate to subscription page)
  const handleUnlock = () => {
    router.push("/user/subscription");
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#FAFAFA",
        py: { xs: 4, sm: 6, md: 10 },
        px: { xs: 2, sm: 3, md: 6 },
        maxHeight: { xs: "none", md: "880px" },
        mb: { xs: 8, sm: 12, md: 20 },
        minHeight: { xs: "100vh", md: "auto" },
      }}
    >
      {/* last update chip */}
      <Box
        sx={{
          mb: { xs: 3, md: 2 },
          textAlign: "center",
          mt: { xs: -8, sm: -10, md: -12.5 },
        }}
      >
        <Chip
          sx={{
            bgcolor: "#FFFFFF",
            color: "#000000",
            border: "1px solid #3A3A3A66",
            borderRadius: { xs: "8px", md: "12px" },
            fontFamily: "Source Sans Pro",
            fontWeight: 400,
            fontSize: { xs: "12px", sm: "14px", md: "18px" },
            height: { xs: "auto", md: "24px" },
            px: { xs: "16px", sm: "20px", md: "28px" },
            py: { xs: "12px", sm: "16px", md: "19px" },
          }}
          icon={
            <AccessTimeIcon
              sx={{
                fontSize: { xs: "18px", sm: "20px", md: "24px" },
                fontWeight: 400,
                color: "#307E8D",
              }}
            />
          }
          label="Last Updated: 2 days ago"
        />
      </Box>
      <Container maxWidth="lg">
        {/* Title Section */}
        <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 5, md: 6 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "700",
              fontFamily: "Faustina",
              color: "#000",
              mb: { xs: 1.5, md: 2 },
              mt: { xs: 2, sm: 3, md: 4 },
              fontSize: { xs: "1.5rem", sm: "2rem", md: "28px" },
              lineHeight: { xs: 1.3, md: 1.2 },
            }}
          >
            Your Journey Progress
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#2B2B2B",
              fontFamily: "Source Sans Pro",
              fontSize: { xs: "0.875rem", sm: "1rem", md: "18px" },
              px: { xs: 2, sm: 0 },
              lineHeight: { xs: 1.5, md: 1.6 },
            }}
          >
            You've Unlocked {highestUnlockedLevel} out of 4 happiness
            assessment levels
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: { xs: 0.5, md: 1 },
            maxWidth: { xs: "100%", sm: "450px", md: "500px" },
            mx: "auto",
            px: { xs: 1, sm: 0 },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: "Source Sans Pro",
              fontWeight: 600,
              color: "#2B2B2B",
              fontSize: { xs: "0.875rem", sm: "0.95rem", md: "16px" },
            }}
          >
            Overall progress
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "Source Sans Pro",
              fontWeight: 600,
              color: "#FB7D45",
              fontSize: { xs: "0.875rem", sm: "0.95rem", md: "16px" },
            }}
          >
            {Math.round((highestUnlockedLevel / 4) * 100)}%
          </Typography>
        </Box>
        {/* Level names below progress bar */}

        <Box
          sx={{
            width: "100%",
            height: { xs: "8px", sm: "10px", md: "12px" },
            backgroundColor: "#E5E7EB",
            borderRadius: { xs: "4px", sm: "5px", md: "6px" },
            mb: { xs: 5, sm: 6, md: 8 },
            overflow: "hidden",
            maxWidth: { xs: "100%", sm: "450px", md: "500px" },
            mx: "auto",
            px: { xs: 1, sm: 0 },
          }}
        >
          <Box
            sx={{
              width: `${(highestUnlockedLevel / 4) * 100}%`,
              height: "100%",
              backgroundColor: "#FB7D45",
              transition: "width 0.5s ease-in-out",
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: { xs: "100%", sm: "450px", md: "500px" },
            mx: "auto",
            mb: { xs: 6, sm: 8, md: 12 },
            mt: { xs: -4, sm: -5, md: -6 },
            px: { xs: 1, sm: 0 },
          }}
        >
          {levels.map((level) => (
            <Typography
              key={level.id}
              variant="caption"
              sx={{
                fontFamily: "Source Sans Pro",
                fontWeight: 400,
                color: "#9CA3AF",
                fontSize: { xs: "0.65rem", sm: "0.75rem", md: "12px" },
                textAlign: "center",
                flex: 1,
                whiteSpace: { xs: "nowrap", sm: "normal" },
              }}
            >
              {level.name}
            </Typography>
          ))}
        </Box>

        {/* Test Cards Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: { xs: 2.5, sm: 3, md: 4 },
            justifyItems: "center",
            px: { xs: 0, sm: 2, md: 0 },
          }}
        >
          {levels.map((level) => {
            const status = getCardStatus(level.id);
            const score = getTestScore(level.id);

            return (
              <TestCard
                key={level.id}
                level={level.id}
                levelName={level.name}
                status={status}
                isFree={level.id === 1}
                score={score}
                maxScore={900}
                onStartTest={() => handleStartTest(level.id)}
                onRetakeTest={() => handleRetakeTest(level.id)}
                onUnlock={handleUnlock}
              />
            );
          })}
        </Box>

        {/* Subscription CTA for non-subscribers */}
        {!isSubscribed && (
          <Box
            sx={{
              mt: { xs: 6, sm: 8, md: 12 },
              p: { xs: 3, sm: 3.5, md: 4 },
              background:
                "linear-gradient(360deg, #006E83 -36.03%, #B0D8E0 247.63%)",
              borderRadius: { xs: "12px", md: "16px" },
              textAlign: "center",
              border: "1px solid #3A3A3A4D",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                fontFamily: "Source Sans Pro",
                color: "#fff",
                mb: { xs: 1.5, md: 2 },
                fontSize: { xs: "1.25rem", sm: "1.4rem", md: "24px" },
                lineHeight: { xs: 1.3, md: 1.2 },
                px: { xs: 1, sm: 2, md: 0 },
              }}
            >
              Ready to Unlock Your Full Potential?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#DBEAFE",
                fontFamily: "Source Sans Pro",
                mb: { xs: 2.5, sm: 3, md: 3 },
                fontSize: { xs: "0.875rem", sm: "0.95rem", md: "16px" },
                lineHeight: { xs: "1.5", sm: "1.6", md: "24px" },
                maxWidth: { xs: "100%", sm: "90%", md: "600px" },
                mx: "auto",
                px: { xs: 1, sm: 2, md: 0 },
              }}
            >
              Get access to all 4 levels of happiness assessment and discover
              deeper insights about yourself with personalized recommendations.
            </Typography>

            {/* Buttons */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1.5, sm: 2 },
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                px: { xs: 1, sm: 0 },
              }}
            >
              <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                <ButtonSelfScore
                  text={<> Unlock Level {highestUnlockedLevel} Test</>}
                  onClick={handleUnlock}
                  fontSize={"16px"}
                  fullWidth={true}
                  style={{
                    backgroundColor: "#fff",
                    padding: "10px 20px",
                  }}
                  textStyle={{
                    color: "#FF4F00",
                    fontWeight: 600,
                  }}
                />
              </Box>

              <OutLineButton
                sx={{
                  padding: { xs: "8px 16px", sm: "5px 14px" },
                  fontSize: { xs: "14px", sm: "15px", md: "16px" },
                  borderRadius: { xs: "10px", md: "12px" },
                  color: "#fff",
                  fontWeight: 600,
                  border: "1px solid #FFFFFF",
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { xs: "100%", sm: "auto" },
                }}
              >
                Retake Level 1 Test
              </OutLineButton>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
