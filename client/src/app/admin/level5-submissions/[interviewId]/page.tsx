"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import {
  level5ReviewService,
  QuestionReview,
  Level5Interview,
} from "@/services/level5ReviewService";

export default function Level5ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.interviewId as string;

  const [interview, setInterview] = useState<Level5Interview | null>(null);
  const [questionReviews, setQuestionReviews] = useState<QuestionReview[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSubmission();
  }, [interviewId]);

  useEffect(() => {
    // Calculate total score whenever question reviews change
    const total = questionReviews.reduce((sum, qr) => sum + qr.score, 0);
    setTotalScore(total);
  }, [questionReviews]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await level5ReviewService.getSubmissionById(interviewId);

      if (response.success) {
        setInterview(response.data.interview);

        // Initialize question reviews
        if (response.data.review) {
          // Load existing review
          setQuestionReviews(response.data.review.questionReviews);
        } else {
          // Create new review structure
          const newReviews: QuestionReview[] =
            response.data.interview.questions.map((q) => {
              const answer = response.data.interview.answers.find(
                (a) => a.questionId === q.questionId
              );

              return {
                questionId: q.questionId,
                questionText: q.questionText,
                userAnswer: answer?.transcript || "[No answer provided]",
                answerMode: "VOICE" as const,
                score: 0,
                remark: "",
              };
            });

          setQuestionReviews(newReviews);
        }
      } else {
        setError("Failed to load submission");
      }
    } catch (err: any) {
      console.error("Error fetching submission:", err);
      setError("Failed to load submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (index: number, value: string) => {
    const score = parseInt(value) || 0;
    const clamped = Math.max(0, score); // No max limit, just ensure non-negative

    const updated = [...questionReviews];
    updated[index].score = clamped;
    setQuestionReviews(updated);
  };

  const handleRemarkChange = (index: number, value: string) => {
    const updated = [...questionReviews];
    updated[index].remark = value;
    setQuestionReviews(updated);
  };

  const validateReview = (): boolean => {
    // Check all questions have remarks
    for (let i = 0; i < questionReviews.length; i++) {
      if (!questionReviews[i].remark.trim()) {
        setError(`Please provide a remark for Question ${i + 1}`);
        return false;
      }
    }

    // Check total score is in valid range
    if (totalScore < 350 || totalScore > 900) {
      setError("Total score must be between 350 and 900");
      return false;
    }

    return true;
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await level5ReviewService.saveReview(
        interviewId,
        questionReviews,
        totalScore
      );

      if (response.success) {
        setSuccess("Draft saved successfully");
        alert("Draft saved successfully! You can continue editing later.");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.message || "Failed to save draft");
        alert("Failed to save draft. Please try again.");
      }
    } catch (err: any) {
      console.error("Error saving draft:", err);
      setError("Failed to save draft. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!validateReview()) {
        return;
      }

      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await level5ReviewService.submitReview(
        interviewId,
        questionReviews,
        totalScore
      );

      if (response.success) {
        setSuccess(
          "Review submitted successfully! User has been notified via email."
        );
        alert(
          "Review submitted successfully! User has been notified via email."
        );
        setTimeout(() => {
          router.push("/admin/level5-submissions");
        }, 2000);
      } else {
        setError(response.message || "Failed to submit review");
        alert("Failed to submit review. Please try again.");
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 30) return "#2E7D32"; // Green
    if (score >= 20) return "#F57C00"; // Orange
    return "#C62828"; // Red
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress sx={{ color: "#005F73" }} />
      </Box>
    );
  }

  if (!interview) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Interview not found</Alert>
      </Box>
    );
  }

  const isReviewed = interview.status === "REVIEWED";

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin/level5-submissions")}
          sx={{ mb: 2, color: "#005F73" }}
        >
          Back to Submissions
        </Button>

        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#005F73", mb: 1 }}
        >
          Review Level 5 AI Interview
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Interview Info Card */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: "12px" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="body1" sx={{ color: "#666" }}>
              User: <strong>{interview.userId.username}</strong> (
              {interview.userId.email})
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Submitted
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {interview.submittedAt
                ? new Date(interview.submittedAt).toLocaleString()
                : "-"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Duration
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {Math.floor(interview.interviewMetadata.totalDuration / 60)} min
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>
            <Box>
              <Chip
                label={isReviewed ? "Reviewed" : "Pending Review"}
                color={isReviewed ? "success" : "warning"}
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Score Summary */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: "12px", textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Total Score
        </Typography>
        <Typography
          variant="h2"
          sx={{ fontWeight: 700, color: getScoreColor(totalScore / 25) }}
        >
          {totalScore}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Range: 350-900
        </Typography>
      </Paper>

      {/* Question Reviews */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Question-by-Question Review
      </Typography>

      {questionReviews.map((qr, index) => (
        <Card key={qr.questionId} sx={{ mb: 3, borderRadius: "12px" }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                Question {index + 1}
              </Typography>
              <Chip
                label={`Score: ${qr.score}`}
                sx={{
                  backgroundColor: getScoreColor(qr.score),
                  color: "#FFF",
                  fontWeight: 600,
                }}
              />
            </Box>

            <Typography
              variant="body1"
              sx={{ mb: 2, color: "#005F73", fontWeight: 500 }}
            >
              {qr.questionText}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              User's Voice Response:
            </Typography>
            <Paper
              sx={{
                p: 2,
                backgroundColor: "#F5F5F5",
                borderRadius: "8px",
                mb: 3,
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {qr.userAnswer}
              </Typography>
            </Paper>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "200px 1fr" },
                gap: 2,
              }}
            >
              <Box>
                <TextField
                  label="Score"
                  type="number"
                  value={qr.score}
                  onChange={(e) => handleScoreChange(index, e.target.value)}
                  fullWidth
                  inputProps={{ min: 0 }}
                  disabled={isReviewed}
                />
              </Box>
              <Box>
                <TextField
                  label="Remark / Feedback"
                  multiline
                  rows={3}
                  value={qr.remark}
                  onChange={(e) => handleRemarkChange(index, e.target.value)}
                  fullWidth
                  disabled={isReviewed}
                  placeholder="Provide detailed feedback on the user's response..."
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons */}
      {!isReviewed && (
        <Box
          sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 4 }}
        >
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveDraft}
            disabled={saving || submitting}
            sx={{ borderColor: "#005F73", color: "#005F73" }}
          >
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={saving || submitting}
            sx={{
              backgroundColor: "#E87A42",
              "&:hover": { backgroundColor: "#D66A32" },
            }}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </Box>
      )}

      {isReviewed && (
        <Alert severity="info" sx={{ mt: 4 }}>
          This review has been submitted and the user has been notified.
        </Alert>
      )}
    </Box>
  );
}
