"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Typography,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import { questionsApi } from "../../../../services/questionsService";
import { authService } from "../../../../services/authService";
import { useAppSelector, useAppDispatch } from "../../../../store/hooks";
import { loginSuccess } from "../../../../store/slices/authSlice";
import OutLineButton from "@/app/components/ui/OutLineButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
// import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshIcon from "@mui/icons-material/Refresh";
import SpeedIcon from "@mui/icons-material/Speed";
import DownloadReportButton from "@/app/components/ui/DownloadReportButton";
import ShareModal from "@/app/components/ui/ShareModal";

export default function LevelAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string>("");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [sharingReport, setSharingReport] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");
  const {
    progress: userProgress,
    isAuthenticated,
    user,
  } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

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
          console.log("getCurrentUser response:", user);
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

        // Log user progress data for debugging
        console.log("User Progress from Redux (initial):", userProgress);
        console.log("User data from server:", user);
        console.log("Is Authenticated:", isAuthenticated);

        // Always update Redux with the latest server data to keep in sync
        if (user.progress) {
          console.log("Updating Redux with server progress data...");
          dispatch(
            loginSuccess({
              user: {
                userId: user.userId,
                email: user.email,
                username: user.username,
                countryCode: user.countryCode,
                phoneNumber: user.phoneNumber,
              },
              purchasedLevels: user.purchasedLevels,
              progress: user.progress,
            })
          );
          console.log(
            "Redux updated successfully with progress:",
            user.progress
          );
        }

        // Fetch user's responses for this level
        // Level 3 uses a separate question model, so fetch from test history
        if (levelNumber === 3) {
          // For Level 3, get the score from test history
          const testHistory = await questionsApi.getUserTestHistory(user.userId);

          if (!testHistory.success) {
            setError("Failed to load test results");
            return;
          }

          // Find most recent Level 3 submission
          const level3Submissions = testHistory.data
            .filter((item: any) => item.level === 3)
            .sort(
              (a: any, b: any) =>
                new Date(b.date || b.submittedAt).getTime() -
                new Date(a.date || a.submittedAt).getTime()
            );

          if (level3Submissions.length === 0) {
            setError("No test results found for Level 3");
            return;
          }

          const latestSubmission = level3Submissions[0];

          setAnalysisData({
            level: 3,
            score: latestSubmission.score,
            totalQuestions: latestSubmission.totalQuestions || 60,
            responses: [],
            completedAt: latestSubmission.date || latestSubmission.submittedAt,
            submissionId: latestSubmission._id,
          });

          return;
        }

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

        // Calculate score using level-specific logic
        const validResponses = levelResponses.filter(
          (response: any) =>
            response.questionId && response.selectedOptionIndex !== undefined
        );

        console.log(
          `\n========== LEVEL ${levelNumber} ANALYSIS SCORE CALCULATION ==========`
        );

        let calculatedScore = 0;

        if (levelNumber === 1) {
          // Level 1: All questions use +15 multiplier
          calculatedScore = validResponses.reduce(
            (acc: number, response: any) => {
              return acc + response.selectedOptionIndex * 15;
            },
            0
          );
        } else if (levelNumber === 2) {
          // Level 2: 900 - |Level2Score|
          // Calculate Level 2 raw score (all NEGATIVE_MULTIPLIER questions)
          const level2RawScore = validResponses.reduce(
            (acc: number, response: any, index: number) => {
              const question = response.questionId;
              if (question && question.scoringType) {
                const multiplier =
                  question.scoringType === "NEGATIVE_MULTIPLIER" ? -10 : 15;
                const questionScore = response.selectedOptionIndex * multiplier;

                console.log(`Question ${index + 1}:`);
                console.log(`  - Type: ${question.scoringType}`);
                console.log(
                  `  - Selected Option: ${response.selectedOptionIndex}`
                );
                console.log(`  - Multiplier: ${multiplier}`);
                console.log(
                  `  - Score: ${response.selectedOptionIndex} × ${multiplier} = ${questionScore}`
                );

                return acc + questionScore;
              }
              // Default to negative multiplier for Level 2
              console.log(
                `Question ${index + 1}: Missing scoringType, using default -10`
              );
              return acc + response.selectedOptionIndex * -10;
            },
            0
          );

          console.log(`\nLevel 2 Raw Score: ${level2RawScore}`);

          // Take absolute value of Level 2 score
          const level2AbsoluteScore = Math.abs(level2RawScore);
          console.log(`Level 2 Absolute Score: ${level2AbsoluteScore}`);

          // Final formula: 900 - |level2Score|
          calculatedScore = 900 - level2AbsoluteScore;

          console.log(`\nFinal Score Calculation:`);
          console.log(`  - Formula: 900 - ${level2AbsoluteScore}`);
          console.log(`  - Result: ${calculatedScore}`);
        } else {
          // Level 3+: Use scoringType from each question (original logic)
          calculatedScore = validResponses.reduce(
            (acc: number, response: any, index: number) => {
              // Get scoringType from the populated questionId
              const question = response.questionId;
              if (question && question.scoringType) {
                const multiplier =
                  question.scoringType === "NEGATIVE_MULTIPLIER" ? -10 : 15;
                const questionScore = response.selectedOptionIndex * multiplier;

                console.log(`Question ${index + 1}:`);
                console.log(`  - Type: ${question.scoringType}`);
                console.log(
                  `  - Selected Option: ${response.selectedOptionIndex}`
                );
                console.log(`  - Multiplier: ${multiplier}`);
                console.log(
                  `  - Score: ${response.selectedOptionIndex} × ${multiplier} = ${questionScore}`
                );

                return acc + questionScore;
              }
              // Default to positive multiplier if scoringType not found
              console.log(
                `Question ${index + 1}: Missing scoringType, using default +15`
              );
              return acc + response.selectedOptionIndex * 15;
            },
            0
          );

          console.log(`\nTotal Calculated Score: ${calculatedScore}`);
        }

        // Calculate final score based on level
        let finalScore;
        if (levelNumber === 1) {
          // Level 1: minimum is 350
          finalScore = Math.max(calculatedScore, 350);
        } else if (levelNumber === 2) {
          // Level 2: already calculated with full formula
          finalScore = calculatedScore;
        } else {
          // Level 3+: base 350 + calculated score
          finalScore = 350 + calculatedScore;

          console.log(`\nFinal Score Calculation:`);
          console.log(`  - Base Score: 350`);
          console.log(`  - Calculated Score: ${calculatedScore}`);
          console.log(
            `  - Final Score (before capping): 350 + ${calculatedScore} = ${finalScore}`
          );
        }

        // Ensure score is within 350-900 range
        const score = Math.max(350, Math.min(finalScore, 900));

        console.log(`  - Capped Score (350-900): ${score}`);
        console.log(
          `================================================================\n`
        );

        const totalQuestions = validResponses.length;

        // Get the test submission ID for sharing (most recent for this level)
        const testHistory = await questionsApi.getUserTestHistory(user.userId);
        const currentSubmission = testHistory.success
          ? testHistory.data
            .filter((item: any) => item.level === levelNumber)
            .sort(
              (a: any, b: any) =>
                new Date(b.date || b.submittedAt).getTime() -
                new Date(a.date || a.submittedAt).getTime()
            )[0]
          : null;

        console.log("Current submission for sharing:", currentSubmission);

        setAnalysisData({
          level: levelNumber,
          score,
          totalQuestions,
          responses: levelResponses,
          completedAt: new Date().toISOString(),
          submissionId: currentSubmission?._id || null,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, levelNumber]);

  // Score interpretation based on ranges
  const getScoreInterpretation = (score: number): string => {
    if (score >= 350 && score < 500) {
      return "You're in a calm space, a perfect foundation for growth and self-discovery.";
    } else if (score >= 500 && score < 650) {
      return "You're radiating balance and calm, a beautiful space to grow from here.";
    } else if (score >= 650 && score < 800) {
      return "You're energized and driven, channeling your energy into meaningful action.";
    } else {
      return "You're experiencing high energy levels. Remember to find moments of balance.";
    }
  };

  // Mock distribution data for the bar chart
  const distributionData = [
    { range: "350-450", count: 120, percentage: 15 },
    { range: "450-550", count: 180, percentage: 22 },
    { range: "550-650", count: 210, percentage: 26 },
    { range: "650-750", count: 240, percentage: 30 },
    { range: "750-850", count: 140, percentage: 17 },
    { range: "850-900", count: 110, percentage: 14 },
  ];

  // Find user's position
  const getUserBarIndex = (score: number) => {
    return distributionData.findIndex((d) => {
      const [min, max] = d.range.split("-").map(Number);
      return score >= min && score < max;
    });
  };

  // Calculate position on the scale (350-900 range)
  const getPositionPercentage = (score: number): number => {
    return ((score - 350) / (900 - 350)) * 100;
  };

  const handleRetake = () => {
    router.push(`/user/test?level=${analysisData.level}`);
  };

  const handleDashboard = () => {
    router.push("/user/dashboard");
  };

  // const handleDownload = () => {
  //   console.log("Download report");
  // };

  const handleShare = async () => {
    if (!analysisData?.submissionId) {
      alert("Unable to generate share link. Submission ID not found.");
      return;
    }

    try {
      setSharingReport(true);

      // Generate share link
      const response = await questionsApi.generateShareLink(
        analysisData.submissionId
      );

      if (response.success && response.data?.shareLink) {
        // Open share modal with the generated link
        setShareLink(response.data.shareLink);
        setShareModalOpen(true);
      } else {
        alert("Failed to generate share link. Please try again.");
      }
    } catch (error) {
      console.error("Error generating share link:", error);
      alert("Failed to generate share link. Please try again.");
    } finally {
      setSharingReport(false);
    }
  };

  const handleNextLevel = () => {
    if (analysisData) {
      // Redirect to TestInfo page instead of directly to test
      router.push(`/testInfo?level=${analysisData.level + 1}`);
    }
  };

  const handleBack = () => {
    router.push(`/user`);
  };

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

  if (!analysisData) {
    return null;
  }

  const maxCount = Math.max(...distributionData.map((d) => d.count));
  const userBarIndex = getUserBarIndex(analysisData.score);
  // Score range is 0-900 for circular progress
  const scorePercentage = (analysisData.score / 900) * 100;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container sx={{ mt: 12 }}>
        <OutLineButton
          startIcon={<ArrowBackIosIcon />}
          style={{
            background: "transparent",
            color: "#3A3A3A",
            border: "1px solid #3A3A3A",
            borderRadius: "8px",
            padding: "3.5px 14px",
            fontWeight: 400,
            fontSize: "18px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={handleBack}
        >
          Back
        </OutLineButton>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            sx={{
              fontSize: "40px",
              fontWeight: 700,
              fontFamily: "faustina",
              color: "#005F73",
              mt: -7,
            }}
          >
            Level {analysisData.level} Completed
          </Typography>
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 400,
              fontFamily: "source sans pro",
              color: "#6B7280",
              lineHeight: "26px",
              maxWidth: "700px",
              mx: "auto",
              my: { xs: 2, md: 1 },
            }}
          >
            This test evaluates your self-awareness and understanding of your
            current life situations.
          </Typography>
        </Box>

        {/* Score Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: "16px",
            bgcolor: "#F7F7F7",
            border: "1px solid #3A3A3A4D",
            // maxWidth: { xs: "100%", md: "1280px" }
          }}
        >
          <Typography
            sx={{
              mb: 4,
              fontSize: "32px",
              fontWeight: 700,
              fontFamily: "faustina",
              textAlign: "center",
              color: "#2B2B2B",
            }}
          >
            Your Level {analysisData.level} Score
          </Typography>

          {/* Circular Score Display */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <Box sx={{ position: "relative", width: 243, height: 243 }}>
              <svg
                width="243"
                height="243"
                viewBox="0 0 243 243"
                style={{ transform: "rotate(-90deg)" }}
              >
                {/* Background circle */}
                <circle
                  cx="121.5"
                  cy="121.5"
                  r="100"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                />
                {/* Progress circle */}
                <circle
                  cx="121.5"
                  cy="121.5"
                  r="100"
                  fill="none"
                  stroke="#508B28"
                  strokeWidth="16"
                  strokeDasharray={`${(scorePercentage / 100) * (2 * Math.PI * 100)
                    } ${2 * Math.PI * 100}`}
                  strokeLinecap="round"
                  style={{ transition: "all 1s" }}
                />
              </svg>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "67px",
                    fontFamily: "source sans pro",
                    fontWeight: 700,
                    color: "#1F2937",
                    mt: -2,
                  }}
                >
                  {analysisData.score}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "24px",
                    color: "#6B7280",
                    mt: -3,
                  }}
                >
                  out of 900
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ mb: 3, gap: "20px" }}
          >
            {user && (
              <DownloadReportButton
                userData={{
                  username: user.username,
                  email: user.email,
                  phoneNumber:
                    user.countryCode && user.phoneNumber
                      ? `+${user.countryCode}${user.phoneNumber}`
                      : user.phoneNumber || "",
                  reportDate: new Date().toISOString(),
                  level: levelNumber,
                  score: analysisData.score,
                  maxScore: 900,
                }}
                variant="contained"
                size="large"

              />
            )}
            <ButtonSelfScore
              startIcon={
                sharingReport ? (
                  <CircularProgress size={16} color="inherit" sx={{ color: "#FFF" }} />
                ) : (
                  <FileUploadIcon sx={{ color: "#FFF", }} />
                )
              }
              text={sharingReport ? "Generating..." : "Share"}
              background="#5C5C5C"
              borderRadius="16px"
              padding="12px 12px"
              fontSize="1rem"
              onClick={handleShare}
              disabled={sharingReport || !analysisData?.submissionId}
            />
            <ButtonSelfScore
              startIcon={<ArrowForwardIcon sx={{ color: "#FFF" }} />}
              text="Next Level"
              background="#FF4F00"
              borderRadius="16px"
              padding="12px 12px"
              fontSize="16px"
              onClick={handleNextLevel}
            />
          </Stack>

          {/* Interpretation */}
          <Typography
            // variant="body1"
            textAlign="center"
            fontStyle="normal"
            color="#4B5563"
            fontFamily={"Source Sans Pro"}
            fontSize={"18px"}
          >
            {getScoreInterpretation(analysisData.score)}
          </Typography>
        </Paper>

        {/* Score Scale & Distribution */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: "#f7f7f7",
            border: "1px solid #3A3A3A4D",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
            sx={{ mb: 8 }}
          >
            What do the scores mean?
          </Typography>

          {/* Score Scale */}
          <Box sx={{ mb: 6, width: "75%", mx: "auto" }}>
            <Box sx={{ position: "relative", mb: 2 }}>
              <Box
                sx={{
                  height: 8,
                  background:
                    "linear-gradient(90deg, #E9F3F5 0%, #87D55D 33.33%, #FDE8D5 66.67%, #E88C73 100%)",
                  borderRadius: 1,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "-150%",
                  left: `${getPositionPercentage(analysisData.score)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Box
                  sx={{
                    bgcolor: "#FF4F00",
                    color: "white",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                    mb: 0.5,
                    textAlign: "center",
                  }}
                >
                  {`${analysisData.score}`}
                </Box>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: "#FF4F00",
                    borderRadius: "50%",
                    border: "4px solid white",
                    boxShadow: 2,
                    mx: "auto",
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="body2" fontWeight="600">
                  Seeker
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Score: 350)
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" fontWeight="600">
                  Learner
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Score: 500)
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" fontWeight="600">
                  Evolver
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Score: 750)
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" fontWeight="600">
                  Awakened
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Score: 900)
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Distribution Chart */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="body1"
              textAlign="center"
              fontSize={"20px"}
              fontWeight="400"
              sx={{ mb: 8 }}
            >
              Where do{" "}
              <Box component="span" sx={{ color: "#E87A42" }}>
                you
              </Box>{" "}
              stand?
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                gap: 1.5,
                mb: 2,
              }}
            >
              {distributionData.map((bar, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                    maxWidth: "47px",
                  }}
                >
                  <Box sx={{ position: "relative", width: "100%" }}>
                    {index === userBarIndex && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -32,
                          left: "50%",
                          transform: "translateX(-50%)",
                          color: "#FF4F00",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.875rem",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {analysisData.score}
                      </Box>
                    )}
                    <Box
                      sx={{
                        width: "100%",
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        bgcolor: index === userBarIndex ? "#FF4F00" : "#919191",
                        height: `${(bar.count / maxCount) * 100}px`,
                        maxHeight: "125px",
                        transition: "all 0.5s",
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Bottom Actions */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ gap: "20px" }}
          >
            <ButtonSelfScore
              startIcon={<RefreshIcon sx={{ color: "#FFF" }} />}
              text="Retake"
              background="#FF4F00"
              borderRadius="16px"
              padding="12px 12px"
              fontSize="16px"
              onClick={handleRetake}
            />
            <OutLineButton
              startIcon={<SpeedIcon />}
              style={{
                background: "transparent",
                color: "#374151",
                border: "1px solid #939393",
                borderRadius: "16px",
                padding: "3.5px 14px",
                fontWeight: 400,
                fontSize: "16px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={handleDashboard}
            >
              DashBoard
            </OutLineButton>
          </Stack>
        </Paper>

        {/* Quote */}
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography
            fontStyle="italic"
            color="#000000"
            fontSize={"28px"}
            fontWeight={400}
            fontFamily={"Playfair Display"}
          >
            "Progress is not perfection — it's awareness."
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 400,
              color: "#000000",
              fontFamily: "source sans pro",
            }}
          >
            Explore your next challenge and see how you can improve your
            SelfScore.
          </Typography>
        </Box>
      </Container>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareLink={shareLink}
        level={analysisData?.level}
      />
    </Box>
  );
}
