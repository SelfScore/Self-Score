"use client";

import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  CheckCircle,
  TrendingUp,
  Assessment as AssessmentIcon,
  Layers,
} from "@mui/icons-material";
import { questionsApi } from "../../../services/questionsService";
import {
  paymentService,
  PaymentHistory,
} from "../../../services/paymentService";
import BrainIMG from "../../../../public/images/DashBoard/Mind.png";
import Image from "next/image";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import OutLineButton from "@/app/components/ui/OutLineButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DownloadReportButton from "@/app/components/ui/DownloadReportButton";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import { level4ReviewService } from "@/services/level4ReviewService";
import { level5ReviewService } from "@/services/level5ReviewService";
import { generatePDFFromHTML } from "@/app/user/report/utils/pdfGenerator";
import {
  generateLevel4ReportHTML,
  generateLevel4ReportFilename,
} from "@/app/user/report/level4";
import { Level4ReportData } from "@/app/user/report/level4/types";
import {
  generateLevel5ReportHTML,
  generateLevel5ReportFilename,
} from "@/app/user/report/level5";
import { Level5ReportData } from "@/app/user/report/level5/types";
import ShareModal from "@/app/components/ui/ShareModal";

interface TestHistoryItem {
  _id: string;
  level: number;
  score: number | null; // null for pending Level 4 reviews
  date: string; // Formatted date for display
  time: string; // Formatted time for display
  rawDate: string; // Raw ISO date for report generation
  timeSpent?: string;
  attemptNumber?: number;
  status?: string; // For Level 4: PENDING_REVIEW or REVIEWED
}

export default function UserDashboard() {
  const { user, isAuthenticated, isInitialized, progress, purchasedLevels } =
    useAuth();
  const router = useRouter();
  const [testHistory, setTestHistory] = useState<TestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionHistory, setTransactionHistory] = useState<
    PaymentHistory[]
  >([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null); // Store interviewId being generated
  const [sharingReport, setSharingReport] = useState<string | null>(null); // Store submissionId being shared
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [shareLevel, setShareLevel] = useState<number>(1);

  // Filter and sort state
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [levelFilter, setLevelFilter] = useState<
    "all" | "1" | "2" | "3" | "4" | "5"
  >("all");

  // ✅ Track which user we've fetched data for (to prevent duplicate fetches for same user)
  const fetchedUserIdForHistory = useRef<string | null>(null);
  const fetchedUserIdForTransactions = useRef<string | null>(null);

  // ✅ Wait for auth to initialize before redirecting
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    const fetchTestHistory = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      // ✅ Prevent duplicate fetches for the same user
      if (fetchedUserIdForHistory.current === user.userId) {
        // console.log(
        //   "📊 Test history already fetched for this user, skipping..."
        // );
        return;
      }

      fetchedUserIdForHistory.current = user.userId;
      // console.log("📊 Fetching test history...");

      try {
        const response = await questionsApi.getUserTestHistory(user.userId);
        // console.log("📊 Raw API response:", response.data);
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
              // Use date or submittedAt as fallback
              const rawDateValue = item.date || item.submittedAt;
              const dateObj = rawDateValue
                ? new Date(rawDateValue)
                : new Date();

              // console.log(
              //   `Item ${index} timeSpent:`,
              //   item.timeSpent,
              //   typeof item.timeSpent
              // );

              return {
                _id: item._id || `${user.userId}-level-${item.level}-${index}`,
                level: item.level,
                score: item.score,
                date: dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                time: dateObj.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }),
                rawDate: rawDateValue || new Date().toISOString(), // Keep raw ISO date for report generation
                timeSpent:
                  item.timeSpent && typeof item.timeSpent === "number"
                    ? `${Math.floor(item.timeSpent / 60)}m ${item.timeSpent % 60
                    }s`
                    : "N/A",
                attemptNumber: attemptMap[item._id],
                status: item.status, // ✅ Include status for Level 4 pending/reviewed check
              };
            }
          );
          setTestHistory(history);
          // console.log("📊 Test history loaded:", history);
        }
      } catch (error) {
        // console.error("Error fetching test history:", error);
        // Fallback to building from progress data if API fails
        if (progress?.testScores) {
          const history: TestHistoryItem[] = [];
          const now = new Date();
          Object.entries(progress.testScores).forEach(([key, score]) => {
            if (score !== undefined) {
              const level = parseInt(key.replace("level", ""));
              history.push({
                _id: `${user.userId}-level-${level}`,
                level: level,
                score: score,
                date: now.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                time: now.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }),
                rawDate: now.toISOString(),
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
    // ✅ Remove 'progress' from dependencies - it causes unnecessary re-fetches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.userId]);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!user?.userId) {
        setLoadingTransactions(false);
        return;
      }

      // ✅ Prevent duplicate fetches for the same user
      if (fetchedUserIdForTransactions.current === user.userId) {
        // console.log(
        //   "💳 Transaction history already fetched for this user, skipping..."
        // );
        return;
      }

      fetchedUserIdForTransactions.current = user.userId;
      // console.log("💳 Fetching transaction history...");

      try {
        const response = await paymentService.getPaymentHistory();
        if (response && Array.isArray(response)) {
          // Filter only completed transactions
          const completedTransactions = response.filter(
            (payment) => payment.status === "completed"
          );
          setTransactionHistory(completedTransactions);
        }
      } catch (error) {
        // console.error("Error fetching transaction history:", error);
      } finally {
        setLoadingTransactions(false);
      }
    };

    if (isAuthenticated && user) {
      fetchTransactionHistory();
    } else {
      setLoadingTransactions(false);
    }
    // ✅ Use user.userId instead of user object to prevent re-fetches on user object changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.userId]);

  // Handler for sharing a test report
  const handleShareReport = async (submissionId: string, level: number) => {
    if (!submissionId) {
      alert("Unable to generate share link. Please try again later.");
      return;
    }

    try {
      setSharingReport(submissionId);

      // Generate share link
      const response = await questionsApi.generateShareLink(submissionId);

      if (response.success && response.data?.shareLink) {
        // Open share modal with the generated link
        setShareLink(response.data.shareLink);
        setShareLevel(level);
        setShareModalOpen(true);
      } else {
        alert("Failed to generate share link. Please try again.");
      }
    } catch (error) {
      // console.error("Error generating share link:", error);
      alert("Failed to generate share link. Please try again.");
    } finally {
      setSharingReport(null);
    }
  };

  // Handler for downloading Level 4 PDF report
  const handleDownloadLevel4PDF = async (interviewId: string) => {
    if (!user) return;

    try {
      setGeneratingPDF(interviewId);

      // Fetch the Level 4 review data
      const reviewResponse = await level4ReviewService.getUserReview(
        interviewId
      );

      if (!reviewResponse.success || !reviewResponse.data) {
        alert("Failed to fetch review data. Please try again.");
        return;
      }

      const adminReview = reviewResponse.data;

      // Prepare report data
      // Format phone number with country code
      const formattedPhone =
        user.countryCode && user.phoneNumber
          ? `+${user.countryCode}${user.phoneNumber}`
          : user.phoneNumber || "N/A";

      const reportData: Level4ReportData = {
        username: user.username,
        email: user.email,
        phoneNumber: formattedPhone,
        reportDate: new Date(
          adminReview.submittedAt || adminReview.createdAt
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        attemptNumber: adminReview.attemptNumber,
        totalScore: adminReview.totalScore,
        interviewMode: adminReview.questionReviews.every(
          (qr) => qr.answerMode === "TEXT"
        )
          ? "TEXT"
          : adminReview.questionReviews.every((qr) => qr.answerMode === "VOICE")
            ? "VOICE"
            : "MIXED",
        questionReviews: adminReview.questionReviews.map((qr) => ({
          questionOrder: adminReview.questionReviews.indexOf(qr) + 1,
          questionText: qr.questionText,
          userAnswer: qr.userAnswer,
          answerMode: qr.answerMode,
          score: qr.score,
          expertRemark: qr.remark,
        })),
      };

      // Generate HTML and PDF
      const htmlContent = generateLevel4ReportHTML(reportData);
      const filename = generateLevel4ReportFilename(reportData);

      await generatePDFFromHTML(htmlContent, filename);
    } catch (error) {
      // console.error("Error generating Level 4 PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setGeneratingPDF(null);
    }
  };

  // Handler for downloading Level 5 PDF report
  const handleDownloadLevel5PDF = async (interviewId: string) => {
    if (!user) return;

    try {
      setGeneratingPDF(interviewId);

      // Fetch the Level 5 review data
      const reviewResponse = await level5ReviewService.getUserReview();

      if (!reviewResponse.success || !reviewResponse.data?.review) {
        alert("Failed to fetch review data. Please try again.");
        return;
      }

      const adminReview = reviewResponse.data.review;

      // Format phone number with country code
      const formattedPhone =
        user.countryCode && user.phoneNumber
          ? `+${user.countryCode}${user.phoneNumber}`
          : user.phoneNumber || "N/A";

      const reportData: Level5ReportData = {
        username: user.username,
        email: user.email,
        phoneNumber: formattedPhone,
        reportDate: new Date(
          adminReview.submittedAt || adminReview.createdAt
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        attemptNumber: adminReview.attemptNumber || 1,
        totalScore: adminReview.totalScore,
        questionReviews: adminReview.questionReviews.map((qr, index) => ({
          questionOrder: index + 1,
          questionText: qr.questionText,
          userAnswer: qr.userAnswer,
          score: qr.score,
          expertRemark: qr.remark,
        })),
      };

      // Generate HTML and PDF
      const htmlContent = generateLevel5ReportHTML(reportData);
      const filename = generateLevel5ReportFilename(reportData);

      await generatePDFFromHTML(htmlContent, filename);
    } catch (error) {
      // console.error("Error generating Level 5 PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setGeneratingPDF(null);
    }
  };

  // ✅ Show loading spinner while auth is initializing
  if (!isInitialized) {
    return (
      <Container maxWidth="xl" sx={{ backgroundColor: "#ffffff", py: 14 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: 2,
          }}
        >
          <CircularProgress size={60} sx={{ color: "#FF4F00" }} />
          <Typography
            sx={{
              color: "#64748b",
              fontSize: "18px",
              fontFamily: "Source Sans Pro",
            }}
          >
            Loading your dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  // ✅ Redirect if not authenticated (after initialization)
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
  const totalLevels = 5;

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
  const lastTestRawDate = lastTest?.rawDate || new Date().toISOString();

  // Calculate score percentage
  const scorePercentage = Math.round((lastTestScore / 900) * 100);

  // Filter and sort test history
  const getFilteredAndSortedHistory = () => {
    let filtered = [...testHistory];

    // Apply level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter(
        (test) => test.level === parseInt(levelFilter)
      );
    }

    // Apply sort order
    filtered.sort((a, b) => {
      const dateA = new Date(a.rawDate || a.date).getTime();
      const dateB = new Date(b.rawDate || b.date).getTime();

      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredTestHistory = getFilteredAndSortedHistory();

  return (
    <Container maxWidth="xl" sx={{ backgroundColor: "#ffffff", py: { xs: 10, md: 14 }, px: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: "1280px", mx: "auto" }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            mb: 3,
            p: { xs: 2, md: 3 },
            backgroundColor: "#FFF",
            borderRadius: "16px",
            border: "1px solid #3A3A3A4D",
            gap: { xs: 2, md: 0 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: { xs: 32, md: 40 },
                height: { xs: 32, md: 40 },
                borderRadius: "50%",
                backgroundColor: "#0C677A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: { xs: "14px", md: "18px" },
                fontWeight: 400,
              }}
            >
              {user.username.substring(0, 2).toUpperCase()}
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                color: "#2B2B2B",
                fontSize: { xs: "18px", md: "24px" },
                fontFamily: "source Sans Pro",
              }}
            >
              Welcome, {user.username}
            </Typography>
          </Box>
          <Chip
            label={`CURRENT ACTIVE PLAN - ${planType}`}
            sx={{
              backgroundColor: "#f1f5f9",
              color: "#475569",
              fontWeight: 600,
              px: { xs: 1, md: 2 },
              py: { xs: 1.5, md: 2.5 },
              fontSize: { xs: "0.75rem", md: "0.875rem" },
            }}
          />
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Level 1 Test Card */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper
              sx={{
                p: { xs: 2, md: 4 },
                height: "100%",
                maxHeight: { xs: "180px", md: "204px" },
                background: "#FF4F00",
                color: "white",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 1.5, md: 2 },
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
                sx={{ fontWeight: 400, fontSize: { xs: "16px", md: "20px" } }}
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
                onClick={() => router.push(`/testInfo?level=${nextLevel}`)}
              />
            </Paper>
          </Grid>

          {/* Levels Completed Card */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box
              sx={{
                p: { xs: 2, md: 4 },
                backgroundColor: "#F7F7F7",
                border: "1px solid #3A3A3A4D",
                height: "100%",
                maxHeight: { xs: "180px", md: "204px" },
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 1.5, md: 2 },
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
                sx={{ fontWeight: 400, color: "#2B2B2B", fontSize: { xs: "14px", md: "20px" }, textAlign: "center" }}
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
                {[1, 2, 3, 4, 5].map((level) => (
                  <Box
                    key={level}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {completedLevels.includes(level) ? (
                      <CheckCircle sx={{ fontSize: { xs: 28, md: 40 }, color: "#51BB00E5" }} />
                    ) : (
                      <CheckCircle sx={{ fontSize: { xs: 28, md: 40 }, color: "#D9D9D9" }} />
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
                p: { xs: 2, md: 4 },
                height: "100%",
                maxHeight: { xs: "none", md: "204px" },
                borderRadius: 4,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "center", md: "flex-start" },
                justifyContent: "space-between",
                border: "1px solid #3A3A3A4D",
                backgroundColor: "#F7F7F7",
                gap: { xs: 2, md: 0 },
              }}
            >
              {/* Left Side - Info and Buttons */}
              {testHistory.length > 0 ? (
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
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      gap: 2,
                      mt: "auto",
                      width: { xs: "100%", md: "auto" },
                    }}
                  >
                    {lastCompletedLevel === 4 && lastTest ? (
                      // Level 4 - Use special PDF download handler
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={
                          generatingPDF === lastTest._id ? (
                            <CircularProgress
                              size={20}
                              sx={{ color: "white" }}
                            />
                          ) : (
                            <DownloadIcon />
                          )
                        }
                        onClick={() => handleDownloadLevel4PDF(lastTest._id)}
                        disabled={generatingPDF === lastTest._id}
                        sx={{
                          background: "#005F73",
                          color: "white",
                          borderRadius: "16px",
                          padding: "12px 12px",
                          fontSize: "16px",
                          fontWeight: "400",
                          height: "40px",
                          textTransform: "none",
                          "&:hover": {
                            background: "#004A5C",
                          },
                          "&:disabled": {
                            background: "#CCCCCC",
                            color: "#666666",
                          },
                        }}
                      >
                        {generatingPDF === lastTest._id
                          ? "Generating..."
                          : "Download Report"}
                      </Button>
                    ) : lastCompletedLevel === 5 && lastTest ? (
                      // Level 5 - Use Level 5 PDF download handler
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={
                          generatingPDF === lastTest._id ? (
                            <CircularProgress
                              size={20}
                              sx={{ color: "white" }}
                            />
                          ) : (
                            <DownloadIcon />
                          )
                        }
                        onClick={() => handleDownloadLevel5PDF(lastTest._id)}
                        disabled={generatingPDF === lastTest._id}
                        sx={{
                          background: "#005F73",
                          color: "white",
                          borderRadius: "16px",
                          padding: "12px 12px",
                          fontSize: "16px",
                          fontWeight: "400",
                          height: "40px",
                          textTransform: "none",
                          "&:hover": {
                            background: "#004A5C",
                          },
                          "&:disabled": {
                            background: "#CCCCCC",
                            color: "#666666",
                          },
                        }}
                      >
                        {generatingPDF === lastTest._id
                          ? "Generating..."
                          : "Download Report"}
                      </Button>
                    ) : (
                      // Levels 1, 2, 3 - Use standard report download
                      <DownloadReportButton
                        userData={{
                          username: user.username,
                          email: user.email,
                          phoneNumber:
                            user.countryCode && user.phoneNumber
                              ? `+${user.countryCode}${user.phoneNumber}`
                              : user.phoneNumber || "",
                          reportDate: lastTestRawDate,
                          level: lastCompletedLevel,
                          score: lastTestScore,
                          maxScore: 900,
                        }}
                      />
                    )}
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
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: "#1e293b" }}
                  >
                    Take Your First Test!
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
                    Start with Level 1 to begin your journey.
                  </Typography>
                  <ButtonSelfScore
                    text="Start Level 1 Test"
                    textStyle={{ color: "#FFF", fontSize: "20px" }}
                    background="#FF4F00"
                    borderRadius="16px"
                    padding="12px 24px"
                    fontSize="1rem"
                    onClick={() => router.push(`/testInfo?level=1`)}
                  />
                </Box>
              )}

              {/* Right Side - Circular Progress */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ml: { xs: 0, md: 4 },
                  mt: { xs: 2, md: 0 },
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
                      width: { xs: 100, md: 140 },
                      height: { xs: 100, md: 140 },
                      borderRadius: "50%",
                      background: `conic-gradient(#508B28 ${scorePercentage * 3.6
                        }deg, #e5e7eb 0deg)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 80, md: 120 },
                        height: { xs: 80, md: 120 },
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
                          fontSize: { xs: "24px", md: "32px" },
                        }}
                      >
                        {lastTestScore}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b", fontSize: { xs: "12px", md: "14px" } }}>
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
            p: { xs: 2, md: 4 },
            mt: { xs: 2, md: 4 },
            borderRadius: 4,
            border: "1px solid #3A3A3A4D",
            backgroundColor: "#FFF",
          }}
        >
          {/* Header with filters */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              mb: 3,
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "20px", md: "28px" },
                color: "#000",
                fontFamily: "Faustina",
              }}
            >
              Your Test History
            </Typography>

            {/* Filter dropdowns */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              {/* Sort by date dropdown */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "latest" | "oldest")
                  }
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#E0E0E0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#005F73",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#005F73",
                    },
                  }}
                >
                  <MenuItem value="latest">Latest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                </Select>
              </FormControl>

              {/* Filter by level dropdown */}
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={levelFilter}
                  onChange={(e) =>
                    setLevelFilter(
                      e.target.value as "all" | "1" | "2" | "3" | "4" | "5"
                    )
                  }
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#E0E0E0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#005F73",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#005F73",
                    },
                  }}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="1">Level 1</MenuItem>
                  <MenuItem value="2">Level 2</MenuItem>
                  <MenuItem value="3">Level 3</MenuItem>
                  <MenuItem value="4">Level 4</MenuItem>
                  <MenuItem value="5">Level 5</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

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
              {/* <Button
                variant="contained"
                onClick={() => router.push("/user/test")}
                sx={{
                  backgroundColor: "#ff6b35",
                  "&:hover": { backgroundColor: "#ff8c42" },
                }}
              >
                Take Your First Test
              </Button> */}
            </Box>
          ) : filteredTestHistory.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" sx={{ color: "#64748b", mb: 2 }}>
                No tests found for the selected filter
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Try changing the level filter or take a new test
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {filteredTestHistory.map((test) => {
                const isPendingReview =
                  (test.level === 4 || test.level === 5) &&
                  test.status === "PENDING_REVIEW";
                const testScorePercentage = test.score
                  ? Math.round((test.score / 900) * 100)
                  : 0;
                return (
                  <Box
                    key={test._id}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      borderBottom: "1px solid #E0E0E0",
                      alignItems: { xs: "flex-start", md: "center" },
                      justifyContent: "space-between",
                      p: { xs: 2, md: 3 },
                      backgroundColor: "#FFF",
                      gap: { xs: 2, md: 0 },
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
                          width: { xs: 36, md: 50 },
                          height: { xs: 36, md: 50 },
                          borderRadius: 2,
                          backgroundColor: "#005F73",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <TrendingUp sx={{ fontSize: { xs: 20, md: 28 }, color: "white" }} />
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
                              fontSize: { xs: "16px", md: "20px" },
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
                          {test.date} at {test.time}
                        </Typography>
                      </Box>
                    </Box>

                    {/* verticsl line  */}
                    <Box
                      sx={{
                        width: "1px",
                        height: "40px",
                        backgroundColor: "#3B3B3B4D",
                        mx: { xs: 0, md: 10 },
                        display: { xs: "none", md: "block" },
                      }}
                    />

                    {/* Right Side - Score and Actions */}

                    <Box sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, gap: { xs: 2, md: 4 }, flexDirection: { xs: "column", md: "row" }, width: { xs: "100%", md: "auto" } }}>
                      <Box sx={{ minWidth: 200 }}>
                        {isPendingReview ? (
                          <>
                            <Typography
                              sx={{
                                color: "#FF9800",
                                fontWeight: 600,
                                mb: 0.5,
                                fontSize: "18px",
                                fontFamily: "Source Sans Pro",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              ⏳ Under Review
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#666",
                                fontWeight: 400,
                                fontSize: "13px",
                                fontFamily: "Source Sans Pro",
                              }}
                            >
                              Expert review in progress
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography
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
                              Time Taken: {test.timeSpent || "N/A"}
                            </Typography>
                          </>
                        )}
                      </Box>

                      {/* vertical line  */}
                      <Box
                        sx={{
                          width: "1px",
                          height: "40px",
                          backgroundColor: "#3B3B3B4D",
                          mx: 2,
                          display: { xs: "none", md: "block" },
                        }}
                      />

                      {/* Progress Bar Icon */}
                      <Box
                        sx={{
                          width: 100,
                          height: 8,
                          backgroundColor: "#e2e8f0",
                          borderRadius: 4,
                          display: { xs: "none", md: "block" },
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

                      {/* ✅ Action Buttons or Pending Status */}
                      <Box sx={{ display: "flex", gap: 1, flexDirection: { xs: "column", md: "row" }, width: { xs: "100%", md: "auto" } }}>
                        {isPendingReview ? (
                          // ✅ Show "Report Not Ready" message for pending Level 4 reviews
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              padding: "12px 20px",
                              borderRadius: "16px",
                              backgroundColor: "#FFF4E6",
                              border: "1px solid #FFB84D",
                            }}
                          >
                            <Box
                              sx={{
                                fontSize: "20px",
                              }}
                            >
                              🕒
                            </Box>
                            <Typography
                              sx={{
                                color: "#E65100",
                                fontSize: "14px",
                                fontWeight: 500,
                              }}
                            >
                              Awaiting Admin Review
                            </Typography>
                          </Box>
                        ) : (
                          // ✅ Show Download and Share buttons when report is ready
                          <>
                            {test.score !== null &&
                              (test.level === 4 ? (
                                <Button
                                  variant="outlined"
                                  size="medium"
                                  startIcon={
                                    generatingPDF === test._id ? (
                                      <CircularProgress
                                        size={20}
                                        sx={{ color: "white" }}
                                      />
                                    ) : (
                                      <DownloadIcon />
                                    )
                                  }
                                  onClick={() =>
                                    handleDownloadLevel4PDF(test._id)
                                  }
                                  disabled={generatingPDF === test._id}
                                  sx={{
                                    background: "#005F73",
                                    color: "white",
                                    borderRadius: "16px",
                                    padding: "12px 12px",
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    height: "40px",
                                    textTransform: "none",
                                    "&:hover": {
                                      background: "#004A5C",
                                    },
                                    "&:disabled": {
                                      background: "#CCCCCC",
                                      color: "#666666",
                                    },
                                  }}
                                >
                                  {generatingPDF === test._id
                                    ? "Generating..."
                                    : "Download Report"}
                                </Button>
                              ) : test.level === 5 ? (
                                <Button
                                  variant="outlined"
                                  size="medium"
                                  startIcon={
                                    generatingPDF === test._id ? (
                                      <CircularProgress
                                        size={20}
                                        sx={{ color: "white" }}
                                      />
                                    ) : (
                                      <DownloadIcon />
                                    )
                                  }
                                  onClick={() =>
                                    handleDownloadLevel5PDF(test._id)
                                  }
                                  disabled={generatingPDF === test._id}
                                  sx={{
                                    background: "#005F73",
                                    color: "white",
                                    borderRadius: "16px",
                                    padding: "12px 12px",
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    height: "40px",
                                    textTransform: "none",
                                    "&:hover": {
                                      background: "#004A5C",
                                    },
                                    "&:disabled": {
                                      background: "#CCCCCC",
                                      color: "#666666",
                                    },
                                  }}
                                >
                                  {generatingPDF === test._id
                                    ? "Generating..."
                                    : "Download Report"}
                                </Button>
                              ) : (
                                <DownloadReportButton
                                  userData={{
                                    username: user.username,
                                    email: user.email,
                                    phoneNumber:
                                      user.countryCode && user.phoneNumber
                                        ? `+${user.countryCode}${user.phoneNumber}`
                                        : user.phoneNumber || "",
                                    reportDate: test.rawDate,
                                    level: test.level,
                                    score: test.score,
                                    maxScore: 900,
                                  }}
                                />
                              ))}
                            <OutLineButton
                              startIcon={
                                sharingReport === test._id ? (
                                  <CircularProgress
                                    size={16}
                                    sx={{ color: "#FF4F00" }}
                                  />
                                ) : (
                                  <FileUploadIcon />
                                )
                              }
                              style={{
                                background: "transparent",
                                color: "#FF4F00",
                                border: "1px solid #FF4F00",
                                borderRadius: "16px",
                                padding: "3.5px 14px",
                                fontWeight: 400,
                                fontSize: "18px",
                                cursor:
                                  sharingReport === test._id
                                    ? "not-allowed"
                                    : "pointer",
                                transition: "all 0.2s",
                                opacity: sharingReport === test._id ? 0.6 : 1,
                              }}
                              onClick={() =>
                                handleShareReport(test._id, test.level)
                              }
                              disabled={sharingReport === test._id}
                            >
                              {sharingReport === test._id
                                ? "Sharing..."
                                : "Share"}
                            </OutLineButton>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Transaction History Section - Only show if user has transactions */}
        {!loadingTransactions && transactionHistory.length > 0 && (
          <Box
            sx={{
              p: { xs: 2, md: 4 },
              mt: { xs: 2, md: 4 },
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
                fontSize: { xs: "20px", md: "28px" },
                color: "#000",
                fontFamily: "Faustina",
              }}
            >
              Transaction History
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {transactionHistory.map((transaction) => {
                // Format date and time: Nov 4, 2025, 2:30 PM
                const transactionDate = new Date(transaction.createdAt);
                const formattedDate = transactionDate.toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                );
                const formattedTime = transactionDate.toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }
                );
                const fullDateTime = `${formattedDate}, ${formattedTime}`;

                // Format amount: $5.00
                const formattedAmount = `$${(transaction.amount / 100).toFixed(
                  2
                )}`;

                // Determine levels unlocked based on purchase
                let levelsUnlocked = "";
                if (transaction.level === 2) {
                  levelsUnlocked = "Level 2";
                } else if (transaction.level === 3) {
                  levelsUnlocked = "Levels 2 & 3";
                } else if (transaction.level === 4) {
                  levelsUnlocked = "Levels 2, 3 & 4";
                }

                return (
                  <Box
                    key={transaction._id}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      borderBottom: "1px solid #E0E0E0",
                      alignItems: { xs: "flex-start", md: "center" },
                      justifyContent: "space-between",
                      p: { xs: 2, md: 3 },
                      backgroundColor: "#FFF",
                      gap: { xs: 2, md: 0 },
                      "&:hover": {
                        backgroundColor: "#FFF",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 2, md: 3 },
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 36, md: 50 },
                          height: { xs: 36, md: 50 },
                          borderRadius: 2,
                          backgroundColor: "#0C677A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <PaymentIcon sx={{ fontSize: { xs: 20, md: 28 }, color: "white" }} />
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
                              fontSize: { xs: "16px", md: "20px" },
                              fontFamily: "Source Sans Pro",
                              color: "#3B3B3B",
                            }}
                          >
                            {levelsUnlocked} Purchase
                          </Typography>
                          <Chip
                            label="PAID"
                            size="small"
                            sx={{
                              backgroundColor: "#51BB0020",
                              color: "#51BB00",
                              fontWeight: 600,
                              fontSize: "12px",
                            }}
                          />
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
                          {fullDateTime}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Vertical line */}
                    <Box
                      sx={{
                        width: "1px",
                        height: "40px",
                        backgroundColor: "#3B3B3B4D",
                        mx: { xs: 0, md: 10 },
                        display: { xs: "none", md: "block" },
                      }}
                    />

                    {/* Amount */}
                    <Box sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, gap: { xs: 2, md: 4 }, flexDirection: { xs: "column", md: "row" }, width: { xs: "100%", md: "auto" } }}>
                      <Box sx={{ minWidth: { xs: "auto", md: 120 } }}>
                        <Typography
                          sx={{
                            color: "#0C677A",
                            fontWeight: 600,
                            mb: 0.5,
                            fontSize: { xs: "18px", md: "20px" },
                            fontFamily: "Source Sans Pro",
                          }}
                        >
                          {formattedAmount}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#3B3B3B99",
                            fontWeight: 400,
                            fontSize: { xs: "12px", md: "14px" },
                            fontFamily: "Source Sans Pro",
                          }}
                        >
                          Transaction ID: {transaction._id.slice(-8)}
                        </Typography>
                      </Box>

                      {/* Vertical line */}
                      <Box
                        sx={{
                          width: "1px",
                          height: "40px",
                          backgroundColor: "#3B3B3B4D",
                          mx: 2,
                          display: { xs: "none", md: "block" },
                        }}
                      />

                      {/* Download Receipt Button */}
                      <OutLineButton
                        startIcon={<ReceiptIcon />}
                        style={{
                          background: "transparent",
                          color: "#0C677A",
                          border: "1px solid #0C677A",
                          borderRadius: "16px",
                          padding: "3.5px 14px",
                          fontWeight: 400,
                          fontSize: "18px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onClick={() => {
                          // Open Stripe receipt in new tab (user can download from there)
                          if (transaction.receiptUrl) {
                            window.open(transaction.receiptUrl, "_blank");
                          } else {
                            alert("Receipt not available");
                          }
                        }}
                      >
                        Receipt
                      </OutLineButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareLink={shareLink}
        level={shareLevel}
      />
    </Container>
  );
}
