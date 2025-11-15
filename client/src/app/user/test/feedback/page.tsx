"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import { Suspense } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import { aiInterviewService, AIFeedback } from "@/services/aiInterviewService";
import {
  level4ReviewService,
  Level4Review,
} from "@/services/level4ReviewService";
import { generatePDFFromHTML } from "@/app/user/report/utils/pdfGenerator";
import {
  generateLevel4ReportHTML,
  generateLevel4ReportFilename,
} from "@/app/user/report/level4";
import { Level4ReportData } from "@/app/user/report/level4/types";
import { useAppSelector } from "@/store/hooks";

function FeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("interviewId");
  const level = searchParams.get("level");
  const user = useAppSelector((state) => state.auth.user);

  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [adminReview, setAdminReview] = useState<Level4Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPendingReview, setIsPendingReview] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!interviewId) {
        setError("No interview ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Try to fetch admin review first (new system for Level 4)
        try {
          const reviewResponse = await level4ReviewService.getUserReview(
            interviewId
          );

          // Check if submission is pending review
          if (reviewResponse.success && reviewResponse.pending === true) {
            setIsPendingReview(true);
            setLoading(false);
            return;
          }

          // If review is complete and data exists
          if (reviewResponse.success && reviewResponse.data) {
            setAdminReview(reviewResponse.data);
            setLoading(false);
            return;
          }
        } catch (reviewErr: any) {
          console.error("Error fetching admin review:", reviewErr);
          // If error occurred, try old AI feedback system (backward compatibility)
        }

        // Fallback to AI feedback (old system or non-Level 4)
        const response = await aiInterviewService.getFeedback(interviewId);
        if (response.success && response.data) {
          setFeedback(response.data);
        } else {
          setError("Failed to load feedback");
        }
      } catch (err: any) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [interviewId]);

  const handleDownloadPDF = async () => {
    if (!adminReview || !user) return;

    try {
      setDownloadingPDF(true);
      setPdfProgress(0);

      // Prepare report data
      const reportData: Level4ReportData = {
        username: user.username,
        email: user.email,
        phoneNumber:
          user.countryCode && user.phoneNumber
            ? `+${user.countryCode}${user.phoneNumber}`
            : user.phoneNumber || "N/A",
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

      // Generate HTML
      const htmlContent = generateLevel4ReportHTML(reportData);
      const filename = generateLevel4ReportFilename(reportData);

      // Generate PDF
      await generatePDFFromHTML(htmlContent, filename, setPdfProgress);

      setPdfProgress(100);
      setTimeout(() => {
        setDownloadingPDF(false);
        setPdfProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
      setDownloadingPDF(false);
      setPdfProgress(0);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "#4CAF50"; // Green
    if (score >= 60) return "#FF9800"; // Orange
    return "#F44336"; // Red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Satisfactory";
    if (score >= 50) return "Needs Improvement";
    return "Requires Attention";
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          gap: 3,
        }}
      >
        <CircularProgress size={80} sx={{ color: "#005F73" }} />
        <Typography variant="h5" sx={{ color: "#005F73", fontWeight: 600 }}>
          Loading Your Feedback...
        </Typography>
      </Box>
    );
  }

  // Pending review state
  if (isPendingReview) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          gap: 3,
          p: 4,
        }}
      >
        <HourglassEmptyIcon sx={{ fontSize: 80, color: "#E65100" }} />
        <Typography variant="h4" sx={{ color: "#005F73", fontWeight: 700 }}>
          Submission Under Review
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "#666", textAlign: "center", maxWidth: 600 }}
        >
          Your Level 4 test submission is currently being reviewed by our expert
          team. You'll receive an email notification once the review is
          complete.
        </Typography>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" sx={{ color: "#999", mb: 2 }}>
            Expected review time: 24-48 hours
          </Typography>
          <ButtonSelfScore
            text="Back to Dashboard"
            onClick={() => router.push("/user/dashboard")}
          />
        </Box>
      </Box>
    );
  }

  // Admin review display (new system for Level 4)
  if (adminReview) {
    const totalScore = adminReview.totalScore;
    const scoreColor =
      totalScore >= 700 ? "#4CAF50" : totalScore >= 550 ? "#FF9800" : "#F44336";
    const scoreLabel =
      totalScore >= 700
        ? "Excellent"
        : totalScore >= 550
        ? "Good"
        : "Needs Improvement";

    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          p: { xs: 2, md: 4 },
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box
            sx={{ display: "inline-flex", alignItems: "center", gap: 2, mb: 2 }}
          >
            <EmojiEventsIcon sx={{ fontSize: 48, color: "#FFD700" }} />
            <Typography variant="h3" sx={{ color: "#005F73", fontWeight: 700 }}>
              Your Level 4 Report
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: "#666", mb: 3 }}>
            Expert Review & Feedback
          </Typography>

          {/* Total Score Card */}
          <Card
            sx={{
              maxWidth: 400,
              margin: "0 auto",
              background: `linear-gradient(135deg, ${scoreColor}15 0%, ${scoreColor}30 100%)`,
              border: `3px solid ${scoreColor}`,
              borderRadius: "20px",
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#005F73", fontWeight: 600, mb: 2 }}
            >
              Total Score
            </Typography>
            <Typography
              variant="h1"
              sx={{
                color: scoreColor,
                fontWeight: 800,
                fontSize: "72px",
                lineHeight: 1,
                mb: 1,
              }}
            >
              {totalScore}
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: scoreColor, fontWeight: 600 }}
            >
              {scoreLabel}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#666", display: "block", mt: 1 }}
            >
              Score Range: 350 - 900
            </Typography>
          </Card>
        </Box>

        {/* Question Reviews */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{ color: "#005F73", fontWeight: 700, mb: 3 }}
          >
            Detailed Question Review
          </Typography>
          {adminReview.questionReviews.map((qr, index) => (
            <Card
              key={qr.questionId}
              sx={{
                mb: 3,
                borderRadius: "16px",
                border: "2px solid #E0E0E0",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Chip
                      label={`Question ${index + 1}`}
                      size="small"
                      sx={{ backgroundColor: "#005F73", color: "#fff", mb: 1 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ color: "#005F73", fontWeight: 600 }}
                    >
                      {qr.questionText}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Score: ${qr.score}`}
                    sx={{
                      backgroundColor: "#E0F2F1",
                      color: "#00695C",
                      fontWeight: 700,
                      fontSize: "16px",
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    backgroundColor: "#F9F9F9",
                    p: 2,
                    borderRadius: "8px",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#666",
                      fontWeight: 600,
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Your Answer:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#333", whiteSpace: "pre-wrap" }}
                  >
                    {qr.userAnswer}
                  </Typography>
                </Box>

                <Box
                  sx={{ backgroundColor: "#FFF3E0", p: 2, borderRadius: "8px" }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#E65100",
                      fontWeight: 600,
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Expert Remark:
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#333" }}>
                    {qr.remark}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Actions */}
        <Box
          sx={{
            textAlign: "center",
            mt: 4,
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ position: "relative" }}>
            <ButtonSelfScore
              text={
                downloadingPDF
                  ? `Generating PDF... ${pdfProgress}%`
                  : "📄 Download Report (PDF)"
              }
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              background="#E65100"
            />
          </Box>
          <ButtonSelfScore
            text="Back to Dashboard"
            onClick={() => router.push("/user/dashboard")}
          />
        </Box>
      </Box>
    );
  }

  // Old AI feedback display (backward compatibility or error state)
  if (error || !feedback) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          gap: 2,
          p: 4,
        }}
      >
        <Alert severity="error" sx={{ mb: 2, maxWidth: 600 }}>
          {error || "No feedback available"}
        </Alert>
        <ButtonSelfScore
          text="Back to Dashboard"
          onClick={() => router.push("/user/dashboard")}
        />
      </Box>
    );
  }

  const totalScore = feedback.totalScore;
  const scoreColor = getScoreColor(totalScore);
  const scoreLabel = getScoreLabel(totalScore);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          textAlign: "center",
          mb: 6,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 48, color: "#FFD700" }} />
          <Typography
            variant="h3"
            sx={{
              color: "#005F73",
              fontWeight: 700,
            }}
          >
            Your Assessment Results
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ color: "#666", mb: 3 }}>
          Level {level}: Mastery Test Feedback
        </Typography>

        {/* Overall Score Card */}
        <Card
          sx={{
            maxWidth: 400,
            margin: "0 auto",
            background: `linear-gradient(135deg, ${scoreColor}15 0%, ${scoreColor}30 100%)`,
            border: `3px solid ${scoreColor}`,
            borderRadius: "20px",
            p: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#005F73",
              fontWeight: 600,
              mb: 2,
            }}
          >
            Overall Score
          </Typography>
          <Typography
            variant="h1"
            sx={{
              color: scoreColor,
              fontWeight: 800,
              fontSize: "72px",
              lineHeight: 1,
              mb: 1,
            }}
          >
            {totalScore}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: scoreColor,
              fontWeight: 600,
            }}
          >
            {scoreLabel}
          </Typography>
        </Card>
      </Box>

      {/* Final Assessment */}
      <Card
        sx={{
          mb: 4,
          borderRadius: "16px",
          border: "2px solid #E0E0E0",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{
              color: "#005F73",
              fontWeight: 700,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CheckCircleIcon sx={{ color: "#4CAF50" }} />
            Overall Assessment
          </Typography>
          <Typography
            sx={{
              color: "#666",
              fontSize: "16px",
              lineHeight: 1.8,
            }}
          >
            {feedback.finalAssessment}
          </Typography>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            color: "#005F73",
            fontWeight: 700,
            mb: 3,
          }}
        >
          Detailed Category Analysis
        </Typography>

        {feedback.categoryScores.map((category, index) => (
          <Card
            key={index}
            sx={{
              mb: 3,
              borderRadius: "16px",
              border: "2px solid #E0E0E0",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0, 95, 115, 0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "#005F73",
                    fontWeight: 600,
                  }}
                >
                  {category.name}
                </Typography>
                <Chip
                  label={`${category.score}/100`}
                  sx={{
                    backgroundColor: getScoreColor(category.score),
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "16px",
                    height: "36px",
                  }}
                />
              </Box>

              <LinearProgress
                variant="determinate"
                value={category.score}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  mb: 2,
                  backgroundColor: "#E0E0E0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getScoreColor(category.score),
                    borderRadius: 5,
                  },
                }}
              />

              <Typography
                sx={{
                  color: "#666",
                  fontSize: "15px",
                  lineHeight: 1.6,
                }}
              >
                {category.comment}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Strengths */}
      <Card
        sx={{
          mb: 4,
          borderRadius: "16px",
          border: "2px solid #4CAF50",
          background: "linear-gradient(135deg, #4CAF5015 0%, #4CAF5030 100%)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{
              color: "#4CAF50",
              fontWeight: 700,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <TrendingUpIcon />
            Your Strengths
          </Typography>
          <Box component="ul" sx={{ pl: 2, color: "#666" }}>
            {feedback.strengths.map((strength, index) => (
              <Typography
                component="li"
                key={index}
                sx={{
                  mb: 1.5,
                  fontSize: "16px",
                  lineHeight: 1.6,
                }}
              >
                {strength}
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card
        sx={{
          mb: 4,
          borderRadius: "16px",
          border: "2px solid #FF9800",
          background: "linear-gradient(135deg, #FF980015 0%, #FF980030 100%)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{
              color: "#FF9800",
              fontWeight: 700,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LightbulbIcon />
            Areas for Improvement
          </Typography>
          <Box component="ul" sx={{ pl: 2, color: "#666" }}>
            {feedback.areasForImprovement.map((area, index) => (
              <Typography
                component="li"
                key={index}
                sx={{
                  mb: 1.5,
                  fontSize: "16px",
                  lineHeight: 1.6,
                }}
              >
                {area}
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card
        sx={{
          mb: 4,
          borderRadius: "16px",
          border: "2px solid #005F73",
          background: "linear-gradient(135deg, #005F7315 0%, #005F7330 100%)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{
              color: "#005F73",
              fontWeight: 700,
              mb: 3,
            }}
          >
            📋 Personalized Recommendations
          </Typography>
          <Box component="ol" sx={{ pl: 2, color: "#666" }}>
            {feedback.recommendations.map((recommendation, index) => (
              <Typography
                component="li"
                key={index}
                sx={{
                  mb: 2,
                  fontSize: "16px",
                  lineHeight: 1.6,
                }}
              >
                {recommendation}
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
          mt: 4,
        }}
      >
        <ButtonSelfScore
          text="View Full Report"
          onClick={() => router.push("/user/report")}
          style={{
            minWidth: "200px",
          }}
        />
        <ButtonSelfScore
          text="Back to Dashboard"
          onClick={() => router.push("/user/dashboard")}
          style={{
            minWidth: "200px",
            background: "#666",
          }}
        />
      </Box>

      {/* Footer Note */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography
          variant="body2"
          sx={{
            color: "#999",
            fontStyle: "italic",
          }}
        >
          🎯 This assessment was generated by AI based on your responses. Use
          these insights to guide your personal development journey.
        </Typography>
      </Box>
    </Box>
  );
}

export default function Level4FeedbackPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress size={60} sx={{ color: "#005F73" }} />
        </Box>
      }
    >
      <FeedbackContent />
    </Suspense>
  );
}
