"use client";

import {
  Box,
  Typography,
  Container,
  Grid,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  TrendingUp,
  Assessment as AssessmentIcon,
  Layers,
} from "@mui/icons-material";
import { PaymentHistory } from "../../../../services/paymentService";
import OutLineButton from "@/app/components/ui/OutLineButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileUploadIcon from "@mui/icons-material/FileUploadOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import DownloadReportButton from "@/app/components/ui/DownloadReportButton";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import {
  adminService,
  UserDetailResponse,
} from "../../../../services/adminService";
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

interface TestHistoryItem {
  _id: string;
  level: number;
  score: number;
  date: string;
  timeSpent?: string;
  attemptNumber?: number;
}

export default function AdminUserDetail() {
  const params = useParams();
  const userId = params.userId as string;

  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [testHistory, setTestHistory] = useState<TestHistoryItem[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<
    PaymentHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUserById(userId);
      setUserDetail(response);

      // Transform test history
      if (response.testHistory) {
        const history: TestHistoryItem[] = response.testHistory.map(
          (item: any, index: number) => {
            return {
              _id: item._id || `${userId}-level-${item.level}-${index}`,
              level: item.level,
              score: item.score,
              date: new Date(item.submittedAt).toLocaleDateString(),
              timeSpent: item.timeSpent
                ? `${Math.floor(item.timeSpent / 60)}m ${item.timeSpent % 60}s`
                : "N/A",
            };
          },
        );
        setTestHistory(history);
      }

      // Set transaction history
      if (response.paymentHistory) {
        const completedTransactions = response.paymentHistory.filter(
          (payment: any) => payment.status === "completed",
        );
        setTransactionHistory(completedTransactions);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for downloading Level 4 PDF report (ADMIN VERSION)
  const handleDownloadLevel4PDF = async (interviewId: string) => {
    if (!userDetail?.user) return;

    try {
      setGeneratingPDF(interviewId);

      // Use ADMIN endpoint to fetch submission details (includes review)
      const response =
        await level4ReviewService.getSubmissionDetails(interviewId);

      if (!response.success || !response.data?.existingReview) {
        alert(
          "Review not found. Please ensure the interview has been reviewed.",
        );
        return;
      }

      const interview = response.data.interview;
      const review = response.data.existingReview;
      const questionAnswers = response.data.questionAnswers;
      const user = userDetail.user;

      // Format phone number with country code
      const formattedPhone =
        user.countryCode && user.phoneNumber
          ? `+${user.countryCode}${user.phoneNumber}`
          : user.phoneNumber || "N/A";

      const reportData: Level4ReportData = {
        username: user.username,
        email: user.email,
        phoneNumber: formattedPhone,
        reportDate: new Date(interview.submittedAt).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        ),
        attemptNumber: interview.attemptNumber,
        totalScore: review.totalScore,
        interviewMode: questionAnswers.every((qa) => qa.answerMode === "TEXT")
          ? "TEXT"
          : questionAnswers.every((qa) => qa.answerMode === "VOICE")
            ? "VOICE"
            : "MIXED",
        questionReviews: questionAnswers.map((qa) => ({
          questionOrder: qa.questionOrder,
          questionText: qa.questionText,
          userAnswer: qa.userAnswer,
          answerMode: qa.answerMode,
          score: qa.existingScore,
          expertRemark: qa.existingRemark,
        })),
      };

      // Generate HTML and PDF
      const htmlContent = generateLevel4ReportHTML(reportData);
      const filename = generateLevel4ReportFilename(reportData);

      await generatePDFFromHTML(htmlContent, filename);
    } catch (error) {
      console.error("Error generating Level 4 PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setGeneratingPDF(null);
    }
  };

  // Handler for downloading Level 5 PDF report (ADMIN VERSION)
  const handleDownloadLevel5PDF = async (interviewId: string) => {
    if (!userDetail?.user) return;

    try {
      setGeneratingPDF(interviewId);

      // Use ADMIN endpoint to fetch submission details (includes review)
      const response = await level5ReviewService.getSubmissionById(interviewId);

      if (!response.success || !response.data?.review) {
        alert(
          "Review not found. Please ensure the interview has been reviewed.",
        );
        return;
      }

      const interview = response.data.interview;
      const review = response.data.review;
      const user = userDetail.user;

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
          interview.submittedAt || interview.completedAt || new Date(),
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        attemptNumber: review.attemptNumber || 1,
        totalScore: review.totalScore,
        questionReviews: review.questionReviews.map((qr, index) => ({
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
      console.error("Error generating Level 5 PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setGeneratingPDF(null);
    }
  };

  if (loading || !userDetail) {
    return (
      <Container maxWidth="xl" sx={{ backgroundColor: "#ffffff", py: 14 }}>
        <Typography sx={{ textAlign: "center", color: "#6B7280" }}>
          Loading user details...
        </Typography>
      </Container>
    );
  }

  const user = userDetail.user;
  const completedLevels = user.progress?.completedLevels || [];
  const totalLevels = 4;

  // Get last test information
  const lastTest = testHistory.length > 0 ? testHistory[0] : null;
  const lastCompletedLevel =
    lastTest?.level || completedLevels[completedLevels.length - 1] || 1;
  const lastTestScore =
    lastTest?.score ||
    user.progress?.testScores?.[
      `level${lastCompletedLevel}` as keyof typeof user.progress.testScores
    ] ||
    0;
  const lastTestDate = lastTest?.date || new Date().toLocaleDateString();
  const scorePercentage = Math.round((lastTestScore / 900) * 100);

  // Format total revenue
  const totalRevenue = `$${(userDetail.totalRevenue / 100).toFixed(2)}`;

  return (
    <Container
      maxWidth="xl"
      sx={{ backgroundColor: "#ffffff", py: { xs: 4, md: 6 } }}
    >
      <Box sx={{ maxWidth: "1440px", mx: "auto", px: { xs: 2, md: 3 } }}>
        {/* Header Section - User Details */}
        <Box
          sx={{
            mb: { xs: 3, md: 4 },
            p: { xs: 3, md: 4 },
            backgroundColor: "#FFF",
            borderRadius: "16px",
            border: "1px solid #3A3A3A4D",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              color: "#2B2B2B",
              fontSize: { xs: "22px", md: "26px", lg: "28px" },
              fontFamily: "Faustina",
              mb: { xs: 2, md: 3 },
            }}
          >
            User Details
          </Typography>

          <Grid container spacing={{ xs: 2, md: 3, lg: 4 }}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Box sx={{ mb: { xs: 2, lg: 0 } }}>
                <Typography
                  sx={{
                    fontSize: { xs: "13px", md: "14px" },
                    color: "#6B7280",
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  Username
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "15px", md: "16px" },
                    fontWeight: 600,
                    color: "#2B2B2B",
                  }}
                >
                  {user.username}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Box sx={{ mb: { xs: 2, lg: 0 } }}>
                <Typography
                  sx={{
                    fontSize: { xs: "13px", md: "14px" },
                    color: "#6B7280",
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  Email
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "15px", md: "16px" },
                    fontWeight: 600,
                    color: "#2B2B2B",
                  }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Box sx={{ mb: { xs: 2, lg: 0 } }}>
                <Typography
                  sx={{
                    fontSize: { xs: "13px", md: "14px" },
                    color: "#6B7280",
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  Phone Number
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "15px", md: "16px" },
                    fontWeight: 600,
                    color: "#2B2B2B",
                  }}
                >
                  +{user.countryCode} {user.phoneNumber}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: "13px", md: "14px" },
                    color: "#6B7280",
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  Status
                </Typography>
                <Chip
                  label={user.isVerified ? "Verified" : "Pending"}
                  sx={{
                    backgroundColor: user.isVerified
                      ? "#51BB0020"
                      : "#FFA50020",
                    color: user.isVerified ? "#51BB00" : "#FFA500",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: "13px", md: "14px" },
                    color: "#6B7280",
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  Registration Date
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "15px", md: "16px" },
                    fontWeight: 600,
                    color: "#2B2B2B",
                  }}
                >
                  {new Date(user.createdAt || "").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: "13px", md: "14px" },
                    color: "#6B7280",
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  Last Active
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "15px", md: "16px" },
                    fontWeight: 600,
                    color: "#2B2B2B",
                  }}
                >
                  {new Date(user.lastActive).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: "13px", md: "14px" },
                    color: "#6B7280",
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  Total Revenue
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "15px", md: "16px" },
                    fontWeight: 600,
                    color: "#51BB00",
                  }}
                >
                  {totalRevenue}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Levels Completed Card */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                backgroundColor: "#F7F7F7",
                border: "1px solid #3A3A3A4D",
                height: "100%",
                minHeight: { xs: "180px", md: "220px" },
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 1.5, md: 2 },
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Box
                sx={{
                  width: { xs: 44, md: 52 },
                  height: { xs: 44, md: 52 },
                  borderRadius: "50%",
                  backgroundColor: "#FF4F00",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 1,
                }}
              >
                <Layers sx={{ fontSize: { xs: 28, md: 34 }, color: "white" }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: "#2B2B2B",
                  fontSize: { xs: "18px", md: "20px" },
                  textAlign: "center",
                }}
              >
                Levels Completed
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#FF4F00",
                  fontSize: { xs: "22px", md: "26px" },
                }}
              >
                {completedLevels.length}/{totalLevels}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: { xs: 1.5, md: 2 },
                  mt: 1,
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
                      <CheckCircle
                        sx={{
                          fontSize: { xs: 32, md: 38 },
                          color: "#51BB00E5",
                        }}
                      />
                    ) : (
                      <CheckCircle
                        sx={{ fontSize: { xs: 32, md: 38 }, color: "#D9D9D9" }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Last Test Score Card */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                height: "100%",
                minHeight: { xs: "180px", md: "220px" },
                borderRadius: "16px",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                border: "1px solid #3A3A3A4D",
                backgroundColor: "#F7F7F7",
                gap: { xs: 2, sm: 0 },
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Box sx={{ flex: 1, width: { xs: "100%", sm: "auto" } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: { xs: 1, md: 1.5 },
                    color: "#1e293b",
                    fontSize: { xs: "18px", md: "20px" },
                  }}
                >
                  Last Test Score
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 2, md: 4 },
                    mb: { xs: 2, md: 3 },
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      fontSize: { xs: "13px", md: "14px" },
                    }}
                  >
                    {lastTestDate}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AssessmentIcon
                      sx={{ color: "#64748b", fontSize: { xs: 18, md: 20 } }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        fontSize: { xs: "13px", md: "14px" },
                      }}
                    >
                      Level {lastCompletedLevel}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1.5, md: 2 },
                    mt: "auto",
                  }}
                >
                  {lastCompletedLevel === 4 && lastTest ? (
                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={
                        generatingPDF === lastTest._id ? (
                          <CircularProgress size={20} sx={{ color: "white" }} />
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
                        : "Download"}
                    </Button>
                  ) : lastCompletedLevel === 5 && lastTest ? (
                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={
                        generatingPDF === lastTest._id ? (
                          <CircularProgress size={20} sx={{ color: "white" }} />
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
                        : "Download"}
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
                        reportDate: lastTestDate,
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
                      cursor: "not-allowed",
                      opacity: 0.6,
                    }}
                    disabled
                  >
                    Retake
                  </OutLineButton>
                </Box>
              </Box>

              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  justifyContent: "center",
                  ml: { sm: 3, md: 4 },
                }}
              >
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <Box
                    sx={{
                      width: { sm: 120, md: 140, lg: 160 },
                      height: { sm: 120, md: 140, lg: 160 },
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
                        width: { sm: 100, md: 120, lg: 140 },
                        height: { sm: 100, md: 120, lg: 140 },
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
                          fontSize: { sm: "28px", md: "32px", lg: "36px" },
                        }}
                      >
                        {lastTestScore}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          fontSize: { sm: "12px", md: "13px" },
                        }}
                      >
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
            p: { xs: 3, md: 4 },
            mt: { xs: 3, md: 4 },
            borderRadius: "16px",
            border: "1px solid #3A3A3A4D",
            backgroundColor: "#FFF",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: { xs: 2, md: 3 },
              fontSize: { xs: "22px", md: "26px", lg: "28px" },
              color: "#000",
              fontFamily: "Faustina",
            }}
          >
            Test History
          </Typography>

          {testHistory.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" sx={{ color: "#64748b" }}>
                No test history yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {testHistory.map((test) => {
                const testScorePercentage = Math.round(
                  (test.score / 900) * 100,
                );
                return (
                  <Box
                    key={test._id}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", lg: "row" },
                      borderBottom: "1px solid #E0E0E0",
                      alignItems: { xs: "flex-start", lg: "center" },
                      justifyContent: "space-between",
                      p: { xs: 2, md: 3 },
                      backgroundColor: "#FFF",
                      gap: { xs: 2, lg: 0 },
                      "&:hover": {
                        backgroundColor: "#F9FAFB",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 2, md: 3 },
                        flex: { xs: "0 0 auto", lg: 1 },
                        width: { xs: "100%", lg: "auto" },
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 44, md: 50 },
                          height: { xs: 44, md: 50 },
                          borderRadius: 2,
                          backgroundColor: "#005F73",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <TrendingUp
                          sx={{ fontSize: { xs: 24, md: 28 }, color: "white" }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: { xs: "16px", md: "18px", lg: "20px" },
                            fontFamily: "Source Sans Pro",
                            color: "#3B3B3B",
                          }}
                        >
                          Level {test.level} Assessment
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#3B3B3B99",
                            fontWeight: 400,
                            fontSize: { xs: "13px", md: "14px" },
                            fontFamily: "source Sans Pro",
                          }}
                        >
                          {test.date}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: { xs: "none", lg: "block" },
                        width: "1px",
                        height: "40px",
                        backgroundColor: "#3B3B3B4D",
                        mx: { lg: 4, xl: 6 },
                      }}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: { xs: "flex-start", lg: "center" },
                        gap: { xs: 2, md: 3, lg: 4 },
                        flexWrap: { xs: "wrap", lg: "nowrap" },
                        width: { xs: "100%", lg: "auto" },
                      }}
                    >
                      <Box
                        sx={{ minWidth: { xs: "100%", sm: "auto", lg: 200 } }}
                      >
                        <Typography
                          sx={{
                            color: "#FF4F00",
                            fontWeight: 500,
                            mb: 0.5,
                            fontSize: { xs: "16px", md: "18px", lg: "20px" },
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
                            fontSize: { xs: "13px", md: "14px" },
                            fontFamily: "Source Sans Pro",
                          }}
                        >
                          Time: {test.timeSpent}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: { xs: "none", lg: "block" },
                          width: "1px",
                          height: "40px",
                          backgroundColor: "#3B3B3B4D",
                          mx: 1,
                        }}
                      />

                      <Box
                        sx={{
                          display: { xs: "none", md: "block" },
                          width: { md: 80, lg: 100 },
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

                      <Box
                        sx={{
                          display: "flex",
                          gap: { xs: 1.5, md: 2 },
                          flexDirection: { xs: "column", sm: "row" },
                          width: { xs: "100%", sm: "auto" },
                        }}
                      >
                        {test.level === 4 ? (
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
                            onClick={() => handleDownloadLevel4PDF(test._id)}
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
                              : "Download"}
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
                            onClick={() => handleDownloadLevel5PDF(test._id)}
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
                              : "Download"}
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
                              reportDate: test.date,
                              level: test.level,
                              score: test.score,
                              maxScore: 900,
                            }}
                          />
                        )}
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

        {/* Transaction History Section */}
        {transactionHistory.length > 0 && (
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
              Transaction History
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {transactionHistory.map((transaction) => {
                const transactionDate = new Date(transaction.createdAt);
                const formattedDate = transactionDate.toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                );
                const formattedTime = transactionDate.toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  },
                );
                const fullDateTime = `${formattedDate}, ${formattedTime}`;
                const formattedAmount = `$${(transaction.amount / 100).toFixed(
                  2,
                )}`;

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
                      borderBottom: "1px solid #E0E0E0",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 3,
                      backgroundColor: "#FFF",
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
                          backgroundColor: "#0C677A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PaymentIcon sx={{ fontSize: 28, color: "white" }} />
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

                    <Box
                      sx={{
                        width: "1px",
                        height: "40px",
                        backgroundColor: "#3B3B3B4D",
                        mx: 10,
                      }}
                    />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Box sx={{ minWidth: 120 }}>
                        <Typography
                          sx={{
                            color: "#0C677A",
                            fontWeight: 600,
                            mb: 0.5,
                            fontSize: "20px",
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
                            fontSize: "14px",
                            fontFamily: "Source Sans Pro",
                          }}
                        >
                          Transaction ID: {transaction._id.slice(-8)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: "1px",
                          height: "40px",
                          backgroundColor: "#3B3B3B4D",
                          mx: 2,
                        }}
                      />

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
    </Container>
  );
}
