"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Container, Chip } from "@mui/material";
import { useRouter } from "next/navigation";
import { useLevelAccess } from "../../../hooks/useLevelAccess";
import { questionsApi } from "../../../services/questionsService";
import TestCard from "../../components/ui/TestCard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MicIcon from "@mui/icons-material/Mic";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import OutLineButton from "@/app/components/ui/OutLineButton";
import Image from "next/image";

export default function JourneyProgress() {
  const router = useRouter();
  const {
    getHighestUnlockedLevel,
    isLevelCompleted,
    getTestScore,
    isLevelPurchased,
    user,
    progress,
  } = useLevelAccess();

  const [lastTestDate, setLastTestDate] = useState<string | null>(null);

  const highestUnlockedLevel = getHighestUnlockedLevel();
  const isLevel4Purchased = isLevelPurchased(4);

  // Calculate completed levels count for progress bar
  const completedLevelsCount = progress?.completedLevels?.length || 0;

  // Fetch last test date
  useEffect(() => {
    const fetchLastTestDate = async () => {
      if (!user?.userId) return;

      try {
        const response = await questionsApi.getUserTestHistory(user.userId);
        if (response.success && response.data?.length > 0) {
          // Get the most recent test date
          const sortedTests = response.data.sort(
            (a: { submittedAt: string }, b: { submittedAt: string }) =>
              new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          );
          setLastTestDate(sortedTests[0].submittedAt);
        }
      } catch (error) {
        console.error("Failed to fetch test history:", error);
      }
    };

    fetchLastTestDate();
  }, [user?.userId]);

  // Format the last test date as relative time
  const formatLastTestDate = (dateString: string | null): string => {
    if (!dateString) return "No tests taken yet";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Level configuration with names
  const levels = [
    { id: 1, name: "Awareness" },
    { id: 2, name: "Exploration" },
    { id: 3, name: "Action" },
    { id: 4, name: "Mastery" },
    { id: 5, name: "Excellence" },
  ];

  // Get the highest completed level
  const getHighestCompletedLevel = () => {
    for (let i = levels.length; i >= 1; i--) {
      if (isLevelCompleted(i)) {
        return i;
      }
    }
    return 0; // No level completed
  };

  const highestCompletedLevel = getHighestCompletedLevel();
  const hasCompletedLevel1 = isLevelCompleted(1);

  // Determine card status for each level
  const getCardStatus = (
    levelId: number
  ): "unlocked" | "locked" | "completed" => {
    if (isLevelCompleted(levelId)) return "completed";
    if (levelId <= highestUnlockedLevel) return "unlocked";
    return "locked";
  };

  // Handle Start Test - Navigate to test page
  const handleStartTest = (level: number) => {
    router.push(`/user/test?level=${level}`);
  };

  // Handle Retake Test - Navigate to test page (same as start)
  const handleRetakeTest = (level: number) => {
    router.push(`/user/test?level=${level}`);
  };

  // Handle Unlock - Navigate to TestInfo page for that level (which has payment UI)
  const handleUnlock = (level: number) => {
    router.push(`/testInfo?level=${level}`);
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#FAFAFA",
        py: { xs: 4, sm: 6, md: 10 },
        px: { xs: 2, sm: 3, md: 6 },
        maxHeight: { xs: "none", md: "1400px" },
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
          label={`Last Updated: ${formatLastTestDate(lastTestDate)}`}
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
          {/* <Typography
            variant="body1"
            sx={{
              color: "#2B2B2B",
              fontFamily: "Source Sans Pro",
              fontSize: { xs: "0.875rem", sm: "1rem", md: "18px" },
              px: { xs: 2, sm: 0 },
              lineHeight: { xs: 1.5, md: 1.6 },
            }}
          >
            You've Unlocked {highestUnlockedLevel} out of 4 happiness assessment
            levels
          </Typography> */}
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
            {Math.round((completedLevelsCount / 5) * 100)}%
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
              width: `${(completedLevelsCount / 5) * 100}%`,
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
          {levels.slice(0, 4).map((level) => {
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
                onUnlock={() => handleUnlock(level.id)}
              />
            );
          })}
        </Box>

        {/* AI Voice Interview Card - Full Width */}
        <Box
          sx={{
            mt: { xs: 6, sm: 8, md: 10 },
            borderRadius: { xs: "12px", md: "16px" },
            overflow: "hidden",
            border: "2px solid #E0E0E0",
            background: isLevel4Purchased
              ? "linear-gradient(135deg, #FEF3EE 0%, #FFFFFF 100%)"
              : "#F9FAFB",
            opacity: isLevel4Purchased ? 1 : 0.7,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: isLevel4Purchased
                ? "0 8px 24px rgba(232,122,66,0.15)"
                : "none",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: { xs: 3, md: 4 },
              p: { xs: 3, sm: 4, md: 5 },
            }}
          >
            {/* Left Content Section */}
            <Box
              sx={{
                flex: 1,
                order: { xs: 2, md: 1 },
              }}
            >
              {/* Badge */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: "20px",
                  backgroundColor: isLevel4Purchased ? "#E87A42" : "#9CA3AF",
                  mb: 2,
                }}
              >
                <MicIcon sx={{ fontSize: "16px", color: "#fff" }} />
                <Typography
                  sx={{
                    fontSize: { xs: "12px", md: "14px" },
                    fontWeight: 600,
                    color: "#fff",
                    fontFamily: "Source Sans Pro",
                  }}
                >
                  {isLevel4Purchased ? "Premium Feature" : "Locked"}
                </Typography>
              </Box>

              {/* Title */}
              <Typography
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "32px" },
                  fontWeight: 700,
                  fontFamily: "Faustina",
                  color: isLevel4Purchased ? "#E87A42" : "#6B7280",
                  mb: 2,
                  lineHeight: 1.2,
                }}
              >
                AI Voice Interview - Level 5
              </Typography>

              {/* Description */}
              <Typography
                sx={{
                  fontSize: { xs: "0.875rem", sm: "1rem", md: "16px" },
                  color: isLevel4Purchased ? "#2B2B2B" : "#6B7280",
                  fontFamily: "Source Sans Pro",
                  lineHeight: 1.6,
                  mb: 3,
                }}
              >
                {isLevel4Purchased
                  ? "Experience a conversational AI-powered voice interview. Speak naturally, and our AI will analyze your responses in real-time for deeper insights."
                  : "Unlock Level 4 bundle to access this premium Level 5 voice interview feature with AI-powered analysis."}
              </Typography>

              {/* Features List */}
              {isLevel4Purchased && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircleIcon
                      sx={{ fontSize: "20px", color: "#4CAF50" }}
                    />
                    <Typography
                      sx={{
                        fontSize: { xs: "14px", md: "15px" },
                        color: "#2B2B2B",
                        fontFamily: "Source Sans Pro",
                      }}
                    >
                      Natural conversation with AI
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircleIcon
                      sx={{ fontSize: "20px", color: "#4CAF50" }}
                    />
                    <Typography
                      sx={{
                        fontSize: { xs: "14px", md: "15px" },
                        color: "#2B2B2B",
                        fontFamily: "Source Sans Pro",
                      }}
                    >
                      Real-time voice interaction
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircleIcon
                      sx={{ fontSize: "20px", color: "#4CAF50" }}
                    />
                    <Typography
                      sx={{
                        fontSize: { xs: "14px", md: "15px" },
                        color: "#2B2B2B",
                        fontFamily: "Source Sans Pro",
                      }}
                    >
                      Comprehensive AI analysis
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  alignItems: { xs: "stretch", sm: "center" },
                }}
              >
                {!isLevel4Purchased ? (
                  <ButtonSelfScore
                    text={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LockIcon sx={{ fontSize: "18px" }} />
                        <span>Unlock Level 4</span>
                      </Box>
                    }
                    onClick={() => handleUnlock(4)}
                    fontSize={"16px"}
                    fullWidth={false}
                    style={{
                      backgroundColor: "#E87A42",
                      padding: "12px 24px",
                    }}
                    textStyle={{
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  />
                ) : (
                  <>
                    <ButtonSelfScore
                      text={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <MicIcon sx={{ fontSize: "18px" }} />
                          <span>Start Voice Interview</span>
                        </Box>
                      }
                      onClick={() =>
                        router.push("/user/test?level=5&mode=voice")
                      }
                      fontSize={"16px"}
                      fullWidth={false}
                      style={{
                        backgroundColor: "#E87A42",
                        padding: "12px 24px",
                      }}
                      textStyle={{
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    />
                    <OutLineButton
                      onClick={() => router.push("/user/test?level=4")}
                      sx={{
                        padding: { xs: "10px 20px", md: "12px 24px" },
                        fontSize: "16px",
                        borderRadius: "12px",
                        color: "#E87A42",
                        fontWeight: 600,
                        border: "2px solid #E87A42",
                        "&:hover": {
                          backgroundColor: "#FEF3EE",
                          borderColor: "#E87A42",
                        },
                      }}
                    >
                      Try Text Mode Instead
                    </OutLineButton>
                  </>
                )}
              </Box>
            </Box>

            {/* Right Image Section */}
            <Box
              sx={{
                flex: { xs: "0 0 auto", md: "0 0 400px" },
                order: { xs: 1, md: 2 },
                width: { xs: "100%", sm: "300px", md: "400px" },
                height: { xs: "250px", sm: "300px", md: "350px" },
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                filter: isLevel4Purchased ? "none" : "grayscale(100%)",
                opacity: isLevel4Purchased ? 1 : 0.5,
              }}
            >
              <Image
                src="/images/LandingPage/Ai-Coach.webp"
                alt="AI Voice Interview"
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                priority
              />
              {!isLevel4Purchased && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderRadius: "50%",
                    p: 3,
                  }}
                >
                  <LockIcon sx={{ fontSize: "48px", color: "#fff" }} />
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Unlock Your Full Potential section - Only show after Level 1 is completed */}
        {hasCompletedLevel1 && (
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
                  text={<> Unlock Level {highestUnlockedLevel + 1} Test</>}
                  onClick={() => handleUnlock(highestUnlockedLevel + 1)}
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
                onClick={() => handleRetakeTest(highestCompletedLevel)}
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
                Retake Level {highestCompletedLevel} Test
              </OutLineButton>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
