"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import OutLineButton from "@/app/components/ui/OutLineButton";
import {
  level4ReviewService,
  SubmissionDetails,
} from "@/services/level4ReviewService";

interface QuestionReviewData {
  questionId: string;
  questionText: string;
  userAnswer: string;
  answerMode: "TEXT" | "VOICE" | "MIXED";
  score: number;
  remark: string;
}

export default function ReviewSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.interviewId as string;

  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [reviews, setReviews] = useState<{
    [questionId: string]: QuestionReviewData;
  }>({});
  const [showOverview, setShowOverview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const fetchSubmissionDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await level4ReviewService.getSubmissionDetails(
        interviewId
      );

      if (response.success) {
        setSubmission(response.data);

        // Initialize reviews with existing data if any
        const initialReviews: { [questionId: string]: QuestionReviewData } = {};
        response.data.questionAnswers.forEach((qa) => {
          initialReviews[qa.questionId] = {
            questionId: qa.questionId,
            questionText: qa.questionText,
            userAnswer: qa.userAnswer,
            answerMode: qa.answerMode,
            score: qa.existingScore || 0,
            remark: qa.existingRemark || "",
          };
        });
        setReviews(initialReviews);
      } else {
        setError("Failed to fetch submission details");
      }
    } catch (err: any) {
      console.error("Error fetching submission details:", err);
      setError("Failed to fetch submission details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    fetchSubmissionDetails();
  }, [fetchSubmissionDetails]);

  const handleScoreChange = (questionId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setReviews((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        score: Math.max(0, numValue), // Ensure non-negative
      },
    }));
  };

  const handleRemarkChange = (questionId: string, value: string) => {
    setReviews((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        remark: value,
      },
    }));
  };

  const calculateTotalScore = (): number => {
    const total = Object.values(reviews).reduce(
      (sum, review) => sum + review.score,
      0
    );
    // Clamp to 350-900 range
    return Math.min(Math.max(total, 350), 900);
  };

  const validateReviews = (): boolean => {
    const errors: string[] = [];

    Object.entries(reviews).forEach(([, review], index) => {
      if (review.score < 0) {
        errors.push(`Question ${index + 1}: Score must be non-negative`);
      }
      if (!review.remark || review.remark.trim() === "") {
        errors.push(`Question ${index + 1}: Remark is required`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError("");

      const questionReviews = Object.values(reviews);
      const response = await level4ReviewService.saveDraft(
        interviewId,
        questionReviews
      );

      if (response.success) {
        alert("Draft saved successfully!");
      } else {
        setError("Failed to save draft");
      }
    } catch (err: any) {
      console.error("Error saving draft:", err);
      setError("Failed to save draft. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenOverview = () => {
    if (validateReviews()) {
      setShowOverview(true);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);
      setError("");

      const questionReviews = Object.values(reviews);
      const response = await level4ReviewService.submitReview(
        interviewId,
        questionReviews
      );

      if (response.success) {
        alert("Review submitted successfully! User has been notified.");
        router.push("/admin/level4-submissions");
      } else {
        setError(response.message || "Failed to submit review");
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
      setShowOverview(false);
    }
  };

  const getModeChip = (mode: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      TEXT: { bg: "#E3F2FD", text: "#1565C0" },
      VOICE: { bg: "#F3E5F5", text: "#6A1B9A" },
      MIXED: { bg: "#FFF9C4", text: "#F57F17" },
    };
    const color = colors[mode] || { bg: "#E0E0E0", text: "#424242" };
    return (
      <Chip
        label={mode}
        size="small"
        sx={{
          backgroundColor: color.bg,
          color: color.text,
          fontWeight: 600,
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <CircularProgress sx={{ color: "#005F73" }} />
      </Box>
    );
  }

  if (error && !submission) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <OutLineButton
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          style={{
            background: "transparent",
            color: "#3A3A3A",
            border: "1px solid #3A3A3A",
            borderRadius: "8px",
            padding: "8px 16px",
          }}
        >
          Go Back
        </OutLineButton>
      </Box>
    );
  }

  if (!submission) return null;

  const totalScore = calculateTotalScore();

  return (
    <Box sx={{ p: 4, maxWidth: "1400px", mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <OutLineButton
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          style={{
            background: "transparent",
            color: "#3A3A3A",
            border: "1px solid #3A3A3A",
            borderRadius: "8px",
            padding: "8px 16px",
            marginBottom: "16px",
          }}
        >
          Back to Submissions
        </OutLineButton>

        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#005F73", mb: 2 }}
        >
          Review Level 4 Submission
        </Typography>

        {/* User Info Card */}
        <Paper
          sx={{
            p: 3,
            backgroundColor: "#F9F9F9",
            borderRadius: "12px",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="caption" sx={{ color: "#666" }}>
                User Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {submission.interview.user.username}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Email
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {submission.interview.user.email}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Attempt Number
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                #{submission.interview.attemptNumber}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Mode
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {getModeChip(submission.interview.mode)}
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Submitted At
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {new Date(submission.interview.submittedAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Total Score Display */}
        <Paper
          sx={{
            p: 3,
            backgroundColor: "#E0F2F1",
            borderRadius: "12px",
            textAlign: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#00695C", textTransform: "uppercase" }}
          >
            Current Total Score
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, color: "#00695C", my: 1 }}
          >
            {totalScore}
          </Typography>
          <Typography variant="caption" sx={{ color: "#666" }}>
            Range: 350 - 900
          </Typography>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Please fix the following errors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Questions and Answers */}
      <Box sx={{ mb: 4 }}>
        {submission.questionAnswers.map((qa, index) => (
          <Paper
            key={qa.questionId}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "12px",
              border: "2px solid #E0E0E0",
            }}
          >
            {/* Question Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Chip
                    label={`Q${index + 1}`}
                    size="small"
                    sx={{ backgroundColor: "#005F73", color: "#fff" }}
                  />
                  {getModeChip(qa.answerMode)}
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#005F73" }}
                >
                  {qa.questionText}
                </Typography>
              </Box>
            </Box>

            {/* User Answer */}
            <Box
              sx={{
                backgroundColor: "#F9F9F9",
                p: 2,
                borderRadius: "8px",
                mb: 3,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#666", fontWeight: 600, display: "block", mb: 1 }}
              >
                User's Answer:
              </Typography>
              <Typography
                variant="body1"
                sx={{ whiteSpace: "pre-wrap", color: "#333" }}
              >
                {qa.userAnswer}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Review Inputs */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {/* Score Input */}
              <Box sx={{ flex: "0 0 150px" }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#666",
                    fontWeight: 600,
                    display: "block",
                    mb: 1,
                  }}
                >
                  Score *
                </Typography>
                <TextField
                  type="number"
                  value={reviews[qa.questionId]?.score || 0}
                  onChange={(e) =>
                    handleScoreChange(qa.questionId, e.target.value)
                  }
                  fullWidth
                  inputProps={{ min: 0 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Box>

              {/* Remark Input */}
              <Box sx={{ flex: 1, minWidth: "300px" }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#666",
                    fontWeight: 600,
                    display: "block",
                    mb: 1,
                  }}
                >
                  Remark *
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  value={reviews[qa.questionId]?.remark || ""}
                  onChange={(e) =>
                    handleRemarkChange(qa.questionId, e.target.value)
                  }
                  fullWidth
                  placeholder="Provide detailed feedback on the user's answer..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
          position: "sticky",
          bottom: 20,
          backgroundColor: "#fff",
          p: 2,
          borderRadius: "12px",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <OutLineButton
          startIcon={<SaveIcon />}
          onClick={handleSaveDraft}
          disabled={saving || submitting}
          style={{
            background: "transparent",
            color: "#666",
            border: "1px solid #666",
            borderRadius: "8px",
            padding: "12px 24px",
          }}
        >
          {saving ? "Saving..." : "Save Draft"}
        </OutLineButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ButtonSelfScore
            text="Review & Submit"
            onClick={handleOpenOverview}
            disabled={saving || submitting}
            background="#E65100"
            padding="12px 32px"
            borderRadius="8px"
          />
        </Box>
      </Box>

      {/* Overview Modal */}
      <Dialog
        open={showOverview}
        onClose={() => setShowOverview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ fontWeight: 600, color: "#005F73", fontSize: "24px" }}
        >
          Review Overview
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ color: "#666", mb: 2 }}>
              Please review the scores and remarks before final submission. The
              user will be notified via email once you submit.
            </Typography>

            {/* Total Score */}
            <Paper
              sx={{
                p: 2,
                backgroundColor: "#E0F2F1",
                borderRadius: "8px",
                textAlign: "center",
                mb: 3,
              }}
            >
              <Typography variant="caption" sx={{ color: "#00695C" }}>
                TOTAL SCORE
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#00695C" }}
              >
                {totalScore}
              </Typography>
            </Paper>

            {/* Questions Summary Table */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Question</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Score
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Remark Preview
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submission.questionAnswers.map((qa, index) => (
                    <TableRow key={qa.questionId}>
                      <TableCell>Q{index + 1}</TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 600, color: "#005F73" }}
                      >
                        {reviews[qa.questionId]?.score || 0}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "300px",
                          }}
                        >
                          {reviews[qa.questionId]?.remark || "No remark"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setShowOverview(false)}
            sx={{ color: "#666" }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <ButtonSelfScore
            text={submitting ? "Submitting..." : "Submit Review"}
            onClick={handleSubmitReview}
            disabled={submitting}
            background="#E65100"
            padding="10px 24px"
            borderRadius="8px"
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
}
