"use client";

import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Chip,
} from "@mui/material";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  TrendingUp,
  Assessment as AssessmentIcon,
  Layers,
} from "@mui/icons-material";
import { questionsApi } from "../../../services/questionsService";
import BrainIMG from "../../../../public/images/DashBoard/Mind.png";
import Image from "next/image";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import OutLineButton from "@/app/components/ui/OutLineButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DownloadReportButton from "@/app/components/ui/DownloadReportButton";

interface TestHistoryItem {
  _id: string;
  level: number;
  score: number;
  date: string;
  timeSpent?: string;
  attemptNumber?: number;
}

export default function UserDashboard() {
  const { user, isAuthenticated, progress, purchasedLevels } = useAuth();
  const router = useRouter();
  const [testHistory, setTestHistory] = useState<TestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchTestHistory = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await questionsApi.getUserTestHistory(user.userId);
        if (response.success && response.data) {
          // First, sort by level and date (oldest first) to calculate attempt numbers correctly
          const sortedData = [...response.data].sort((a: any, b: any) => {
            if (a.level !== b.level) {
              return a.level - b.level; // Sort by level first
            }
            return new Date(a.date).getTime() - new Date(b.date).getTime(); // Then by date (oldest first)
          });

          // Count attempts per level
          const levelAttemptCount: { [key: number]: number } = {};
          sortedData.forEach((item: any) => {
            if (!levelAttemptCount[item.level]) {
              levelAttemptCount[item.level] = 0;
            }
            levelAttemptCount[item.level]++;
          });

          // Reset counters for assigning attempt numbers
          const levelCurrentAttempt: { [key: number]: number } = {};

          // Create a map of item._id to attempt number
          const attemptMap: { [key: string]: number } = {};
          sortedData.forEach((item: any) => {
            if (!levelCurrentAttempt[item.level]) {
              levelCurrentAttempt[item.level] = 0;
            }
            levelCurrentAttempt[item.level]++;
            attemptMap[item._id] = levelCurrentAttempt[item.level];
          });

          // Now transform the original data (sorted by most recent first)
          const history: TestHistoryItem[] = response.data.map(
            (item: any, index: number) => {
              return {
                _id: item._id || `${user.userId}-level-${item.level}-${index}`,
                level: item.level,
                score: item.score,
                date: new Date(item.date).toLocaleDateString(),
                timeSpent: item.timeSpent
                  ? `${Math.floor(item.timeSpent / 60)}m ${
                      item.timeSpent % 60
                    }s`
                  : "N/A",
                attemptNumber: attemptMap[item._id],
              };
            }
          );
          setTestHistory(history);
        }
      } catch (error) {
        console.error("Error fetching test history:", error);
        // Fallback to building from progress data if API fails
        if (progress?.testScores) {
          const history: TestHistoryItem[] = [];
          Object.entries(progress.testScores).forEach(([key, score]) => {
            if (score !== undefined) {
              const level = parseInt(key.replace("level", ""));
              history.push({
                _id: `${user.userId}-level-${level}`,
                level: level,
                score: score,
                date: new Date().toLocaleDateString(),
                timeSpent: "N/A",
              });
            }
          });
          history.sort((a, b) => b.level - a.level);
          setTestHistory(history);
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchTestHistory();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, progress]);

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  // Determine subscription plan
  const hasAnyPurchase =
    purchasedLevels?.level2.purchased ||
    purchasedLevels?.level3.purchased ||
    purchasedLevels?.level4.purchased;
  const planType = hasAnyPurchase ? "PREMIUM" : "FREE";

  // Get next available level
  const nextLevel = progress?.highestUnlockedLevel || 1;
  const completedLevels = progress?.completedLevels || [];
  const totalLevels = 4;

  // Get last test information (most recent test from history)
  const lastTest = testHistory.length > 0 ? testHistory[0] : null;
  const lastCompletedLevel =
    lastTest?.level || completedLevels[completedLevels.length - 1] || 1;
  const lastTestScore =
    lastTest?.score ||
    progress?.testScores?.[
      `level${lastCompletedLevel}` as keyof typeof progress.testScores
    ] ||
    0;
  const lastTestDate = lastTest?.date || new Date().toLocaleDateString();

  // Calculate score percentage
  const scorePercentage = Math.round((lastTestScore / 900) * 100);

  return (
    <Container maxWidth="xl" sx={{ backgroundColor: "#ffffff", py: 14 }}>
      <Box sx={{ maxWidth: "1280px", mx: "auto" }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            p: 3,
            backgroundColor: "#FFF",
            borderRadius: "16px",
            border: "1px solid #3A3A3A4D",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#0C677A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
                fontWeight: 400,
              }}
            >
              {user.username.substring(0, 2).toUpperCase()}
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                color: "#2B2B2B",
                fontSize: "24px",
                fontFamily: "source Sans Pro",
              }}
            >
              Welcome back, {user.username}
            </Typography>
          </Box>
          <Chip
            label={`CURRENT ACTIVE PLAN - ${planType}`}
            sx={{
              backgroundColor: "#f1f5f9",
              color: "#475569",
              fontWeight: 600,
              px: 2,
              py: 2.5,
              fontSize: "0.875rem",
            }}
          />
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Level 1 Test Card */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper
              sx={{
                p: 4,
                height: "100%",
                maxHeight: "204px",
                background: "#FF4F00",
                color: "white",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image src={BrainIMG.src} alt="Brain" width={48} height={48} />
              </Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 400, fontSize: "20px" }}
              >
                Level {nextLevel} Test
              </Typography>
              <ButtonSelfScore
                text="Start Assessment"
                textStyle={{ color: "#FF4F00", fontSize: "20px" }}
                background="#F7F7F7"
                borderRadius="16px"
                padding="12px 24px"
                fontSize="1rem"
                onClick={() => router.push(`/user/test/level-${nextLevel}`)}
              />
            </Paper>
          </Grid>

          {/* Levels Completed Card */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box
              sx={{
                p: 4,
                backgroundColor: "#F7F7F7",
                border: "1px solid #3A3A3A4D",
                height: "100%",
                maxHeight: "204px",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "#FF4F00",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 1,
                }}
              >
                <Layers sx={{ fontSize: 32, color: "white" }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 400, color: "#2B2B2B", fontSize: "20px" }}
              >
                Levels Completed ({completedLevels.length}/{totalLevels})
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                {[1, 2, 3, 4].map((level) => (
                  <Box
                    key={level}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {completedLevels.includes(level) ? (
                      <CheckCircle sx={{ fontSize: 40, color: "#51BB00E5" }} />
                    ) : (
                      <CheckCircle sx={{ fontSize: 40, color: "#D9D9D9" }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Last Test Score Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 4,
                height: "100%",
                maxHeight: "204px",
                borderRadius: 4,
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                border: "1px solid #3A3A3A4D",
                backgroundColor: "#F7F7F7",
              }}
            >
              {/* Left Side - Info and Buttons */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 1, color: "#1e293b" }}
                >
                  Your Last Test Score
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    mb: 4,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Test Date: {lastTestDate}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <AssessmentIcon sx={{ color: "#64748b", fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Level {lastCompletedLevel}
                      {/* {lastTest?.attemptNumber &&
                        lastTest.attemptNumber > 1 &&
                        ` (Attempt ${lastTest.attemptNumber})`} */}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 2,
                    mt: "auto",
                  }}
                >
                  <DownloadReportButton
                    userData={{
                      username: user.username,
                      email: user.email,
                      phoneNumber: user.phoneNumber || "",
                      reportDate: lastTestDate,
                      level: lastCompletedLevel,
                      score: lastTestScore,
                      maxScore: 900,
                    }}
                  />
                  <OutLineButton
                    startIcon={<RefreshIcon />}
                    style={{
                      background: "transparent",
                      color: "#374151",
                      border: "1px solid #939393",
                      borderRadius: "16px",
                      padding: "3.5px 14px",
                      fontWeight: 400,
                      fontSize: "18px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onClick={() =>
                      router.push(`/user/test?level=${lastCompletedLevel}`)
                    }
                  >
                    Retake
                  </OutLineButton>
                </Box>
              </Box>

              {/* Right Side - Circular Progress */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ml: 4,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-flex",
                  }}
                >
                  <Box
                    sx={{
                      width: 140,
                      height: 140,
                      borderRadius: "50%",
                      background: `conic-gradient(#508B28 ${
                        scorePercentage * 3.6
                      }deg, #e5e7eb 0deg)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        backgroundColor: "white",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: "#1e293b",
                          fontSize: "32px",
                        }}
                      >
                        {lastTestScore}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        out of 900
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Test History Section */}
        <Box
          sx={{
            p: 4,
            mt: 4,
            borderRadius: 4,
            border: "1px solid #3A3A3A4D",
            backgroundColor: "#FFF",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: "28px",
              color: "#000",
              fontFamily: "Faustina",
            }}
          >
            Your Test History
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" sx={{ color: "#64748b" }}>
                Loading test history...
              </Typography>
            </Box>
          ) : testHistory.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" sx={{ color: "#64748b", mb: 2 }}>
                No test history yet
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push("/user/test")}
                sx={{
                  backgroundColor: "#ff6b35",
                  "&:hover": { backgroundColor: "#ff8c42" },
                }}
              >
                Take Your First Test
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {testHistory.map((test) => {
                const testScorePercentage = Math.round(
                  (test.score / 900) * 100
                );
                return (
                  <Box
                    key={test._id}
                    sx={{
                      display: "flex",
                      borderBottom: "1px solid #E0E0E0",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 3,
                      backgroundColor: "#FFF",
                      // borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "#FFF",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 2,
                          backgroundColor: "#005F73",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <TrendingUp sx={{ fontSize: 28, color: "white" }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 400,
                              fontSize: "20px",
                              fontFamily: "Source Sans Pro",
                              color: "#3B3B3B",
                            }}
                          >
                            Level {test.level} Assessment
                          </Typography>
                          {/* {test.attemptNumber && test.attemptNumber > 1 && (
                            <Chip
                              label={`Attempt ${test.attemptNumber}`}
                              size="small"
                              sx={{
                                backgroundColor: "#FF4F0020",
                                color: "#FF4F00",
                                fontWeight: 600,
                                fontSize: "12px",
                              }}
                            />
                          )} */}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#3B3B3B99",
                            fontWeight: 400,
                            fontSize: "14px",
                            fontFamily: "source Sans Pro",
                          }}
                        >
                          {test.date}
                        </Typography>
                      </Box>
                    </Box>

                    {/* verticsl line  */}
                    <Box
                      sx={{
                        width: "1px",
                        height: "40px",
                        backgroundColor: "#3B3B3B4D",
                        mx: 10,
                      }}
                    />

                    {/* Right Side - Score and Actions */}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Box sx={{ minWidth: 200 }}>
                        <Typography
                          // variant="h6"
                          sx={{
                            color: "#FF4F00",
                            fontWeight: 400,
                            mb: 0.5,
                            fontSize: "20px",
                            fontFamily: "Source Sans Pro",
                          }}
                        >
                          Score: {test.score}/900 ({testScorePercentage}%)
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#3B3B3B99",
                            fontWeight: 400,
                            fontSize: "14px",
                            fontFamily: "Source Sans Pro",
                          }}
                        >
                          Time: {test.timeSpent}
                        </Typography>
                      </Box>

                      {/* vertical line  */}
                      <Box
                        sx={{
                          width: "1px",
                          height: "40px",
                          backgroundColor: "#3B3B3B4D",
                          mx: 2,
                        }}
                      />

                      {/* Progress Bar Icon */}
                      <Box
                        sx={{
                          width: 100,
                          height: 8,
                          backgroundColor: "#e2e8f0",
                          borderRadius: 4,
                        }}
                      >
                        <Box
                          sx={{
                            width: `${testScorePercentage}%`,
                            height: "100%",
                            backgroundColor: "#FF4F00",
                            borderRadius: 4,
                          }}
                        />
                      </Box>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <DownloadReportButton
                          userData={{
                            username: user.username,
                            email: user.email,
                            phoneNumber: user.phoneNumber || "",
                            reportDate: test.date,
                            level: test.level,
                            score: test.score,
                            maxScore: 900,
                          }}
                        />
                        <OutLineButton
                          startIcon={<FileUploadIcon />}
                          style={{
                            background: "transparent",
                            color: "#FF4F00",
                            border: "1px solid #FF4F00",
                            borderRadius: "16px",
                            padding: "3.5px 14px",
                            fontWeight: 400,
                            fontSize: "18px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          // onClick={handleDashboard}
                        >
                          Share
                        </OutLineButton>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
