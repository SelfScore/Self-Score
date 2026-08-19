"use client";

import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
} from "@mui/material";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import StarsIcon from "@mui/icons-material/Stars";
import { adminService, UserDetailResponse } from "@/services/adminService";
import { questionsApi } from "@/services/questionsService";
import { level4ReviewService } from "@/services/level4ReviewService";
import { level5ReviewService } from "@/services/level5ReviewService";

// Helper for formatting date
const formatDate = (date: Date | string | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function ResponsesContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = params.userId as string;
  const level = parseInt(searchParams.get("level") || "1");
  const submissionId = searchParams.get("submissionId") || "";

  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [level123Responses, setLevel123Responses] = useState<any[]>([]);
  const [level4Details, setLevel4Details] = useState<any>(null);
  const [level5Details, setLevel5Details] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, level, submissionId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get user basic details
      const userRes = await adminService.getUserById(userId);
      setUserDetail(userRes);

      if (level >= 1 && level <= 3) {
        // Fetch Level 1-3 responses
        const res = await questionsApi.getUserResponses(userId);
        if (res.success && res.data) {
          // Filter responses for the specific level
          const filtered = res.data.filter((r: any) => r.level === level);
          setLevel123Responses(filtered);
        }
      } else if (level === 4) {
        // Fetch Level 4 interview details
        if (submissionId) {
          const res = await level4ReviewService.getSubmissionDetails(submissionId);
          setLevel4Details(res);
        } else {
          setError("Submission ID is required for Level 4");
        }
      } else if (level === 5) {
        // Fetch Level 5 realtime voice details
        if (submissionId) {
          const res = await level5ReviewService.getSubmissionById(submissionId);
          setLevel5Details(res);
        } else {
          setError("Submission ID is required for Level 5");
        }
      }
    } catch (err: any) {
      console.error("Failed to load response data:", err);
      setError(err?.message || "Failed to load responses");
    } finally {
      setLoading(false);
    }
  };

  const getSubTitle = () => {
    if (!userDetail) return "";
    return `User: ${userDetail.user.username} (${userDetail.user.email})`;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "60vh", gap: 2 }}>
        <CircularProgress sx={{ color: "#FF4F00" }} />
        <Typography sx={{ color: "#6B7280", fontFamily: "Source Sans Pro" }}>Loading user responses...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.back()}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <IconButton onClick={() => router.back()} sx={{ color: "#2B2B2B" }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography
            sx={{
              fontFamily: "Faustina",
              fontSize: "32px",
              fontWeight: 700,
              color: "#2B2B2B",
            }}
          >
            Level {level} Responses Audit
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              color: "#6B7280",
              mt: 0.5,
            }}
          >
            {getSubTitle()}
          </Typography>
        </Box>
      </Box>

      {/* Render Level 1, 2, 3 Multiple Choice Responses */}
      {(level >= 1 && level <= 3) && (
        <Grid container spacing={3}>
          {level123Responses.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 4, textAlign: "center", borderRadius: "16px", border: "1px solid #E0E0E0", boxShadow: "none" }}>
                <Typography sx={{ color: "#6B7280", fontFamily: "Source Sans Pro" }}>
                  No responses recorded for this level attempt.
                </Typography>
              </Paper>
            </Grid>
          ) : (
            level123Responses.map((res: any, idx: number) => {
              const q = res.questionId;
              if (!q) return null;
              return (
                <Grid size={{ xs: 12 }} key={res._id || idx}>
                  <Card sx={{ borderRadius: "16px", border: "1px solid #E0E0E0", boxShadow: "none" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "flex-start" }}>
                        <HelpOutlineIcon sx={{ color: "#FF4F00", mt: 0.3 }} />
                        <Typography sx={{ fontFamily: "Source Sans Pro", fontSize: "18px", fontWeight: 600, color: "#2B2B2B" }}>
                          {idx + 1}. {q.questionText}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ pl: 4 }}>
                        {q.questionType === "slider-scale" || !q.options || q.options.length === 0 ? (
                          <Box sx={{ mt: 1 }}>
                            <Typography sx={{ fontSize: "14px", color: "#6B7280", mb: 1.5, fontFamily: "Source Sans Pro" }}>
                              Selected Rating: <strong style={{ color: "#FF4F00", fontSize: "16px" }}>{res.selectedOptionIndex}</strong> / 10
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              {Array.from({ length: 11 }).map((_, val) => {
                                const isSelected = res.selectedOptionIndex === val;
                                return (
                                  <Box
                                    key={val}
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      border: isSelected ? "2px solid #FF4F00" : "1px solid #E5E7EB",
                                      backgroundColor: isSelected ? "#FF4F00" : "#FFF",
                                      color: isSelected ? "#FFF" : "#4B5563",
                                      fontWeight: isSelected ? 700 : 400,
                                      fontSize: "14px",
                                      fontFamily: "Source Sans Pro",
                                    }}
                                  >
                                    {val}
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {q.options.map((opt: string, oIdx: number) => {
                              const isSelected = res.selectedOptionIndex === oIdx;
                              return (
                                <Box
                                  key={oIdx}
                                  sx={{
                                    p: 1.5,
                                    px: 2,
                                    borderRadius: "8px",
                                    border: isSelected ? "1px solid #FF4F00" : "1px solid #E5E7EB",
                                    backgroundColor: isSelected ? "#FF4F0008" : "#FFF",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontFamily: "Source Sans Pro",
                                      fontSize: "15px",
                                      fontWeight: isSelected ? 600 : 400,
                                      color: isSelected ? "#FF4F00" : "#4B5563",
                                    }}
                                  >
                                    {opt}
                                  </Typography>
                                  {isSelected && (
                                    <Chip
                                      label="Selected Answer"
                                      size="small"
                                      sx={{
                                        backgroundColor: "#FF4F00",
                                        color: "#FFF",
                                        fontWeight: 600,
                                        fontSize: "11px",
                                      }}
                                    />
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}

      {/* Render Level 4 AI Interview Answers */}
      {level === 4 && level4Details && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #E0E0E0", boxShadow: "none", backgroundColor: "#F9FAFB", mb: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography sx={{ fontSize: "13px", color: "#6B7280", fontFamily: "Source Sans Pro" }}>ATTEMPT MODE</Typography>
                  <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#2B2B2B", mt: 0.5 }}>{level4Details.interview?.mode || "N/A"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography sx={{ fontSize: "13px", color: "#6B7280", fontFamily: "Source Sans Pro" }}>SUBMITTED AT</Typography>
                  <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#2B2B2B", mt: 0.5 }}>{formatDate(level4Details.interview?.submittedAt)}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography sx={{ fontSize: "13px", color: "#6B7280", fontFamily: "Source Sans Pro" }}>EVALUATED SCORE</Typography>
                  <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#FF4F00", mt: 0.5 }}>
                    {level4Details.existingReview ? `${level4Details.existingReview.totalScore} / 900` : "PENDING REVIEW"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {level4Details.questionAnswers?.map((qa: any, idx: number) => (
            <Grid size={{ xs: 12 }} key={qa.questionId || idx}>
              <Card sx={{ borderRadius: "16px", border: "1px solid #E0E0E0", boxShadow: "none" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "flex-start" }}>
                    <HelpOutlineIcon sx={{ color: "#005F73", mt: 0.3 }} />
                    <Typography sx={{ fontFamily: "Source Sans Pro", fontSize: "18px", fontWeight: 600, color: "#2B2B2B" }}>
                      Question {qa.questionOrder || idx + 1}: {qa.questionText}
                    </Typography>
                  </Box>

                  <Box sx={{ pl: 4, mb: 3 }}>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280", fontWeight: 600, mb: 1, textTransform: "uppercase" }}>
                      User Answer ({qa.answerMode})
                    </Typography>
                    <Box sx={{ p: 2, borderRadius: "8px", border: "1px dashed #CCCCCC", backgroundColor: "#FAF9F6" }}>
                      <Typography sx={{ fontFamily: "Source Sans Pro", fontSize: "15px", color: "#2B2B2B", whiteSpace: "pre-line" }}>
                        {qa.userAnswer || "(No answer provided)"}
                      </Typography>
                    </Box>
                  </Box>

                  {level4Details.existingReview && (
                    <Box sx={{ pl: 4, pt: 2, borderTop: "1px solid #F3F4F6", display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <Chip
                          icon={<StarsIcon sx={{ fontSize: 16 }} />}
                          label={`Grade: ${qa.existingScore} / 100`}
                          sx={{ backgroundColor: "#FF4F0015", color: "#FF4F00", fontWeight: 600 }}
                        />
                      </Box>
                      {qa.existingRemark && (
                        <Box sx={{ p: 2, borderRadius: "8px", backgroundColor: "#FF4F0004", border: "1px solid #FF4F0015" }}>
                          <Typography sx={{ fontSize: "12px", color: "#FF4F00", fontWeight: 600, mb: 0.5 }}>ADMIN EVALUATION NOTES</Typography>
                          <Typography sx={{ fontFamily: "Source Sans Pro", fontSize: "14px", color: "#4B5563" }}>
                            {qa.existingRemark}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Render Level 5 Voice Transcript Timeline */}
      {level === 5 && level5Details && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #E0E0E0", boxShadow: "none", backgroundColor: "#F9FAFB", mb: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography sx={{ fontSize: "13px", color: "#6B7280", fontFamily: "Source Sans Pro" }}>INTERVIEW DURATION</Typography>
                  <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#2B2B2B", mt: 0.5 }}>
                    {level5Details.interviewMetadata?.totalDuration ? `${Math.round(level5Details.interviewMetadata.totalDuration / 60)} mins` : "N/A"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography sx={{ fontSize: "13px", color: "#6B7280", fontFamily: "Source Sans Pro" }}>SUBMITTED AT</Typography>
                  <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#2B2B2B", mt: 0.5 }}>{formatDate(level5Details.submittedAt)}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography sx={{ fontSize: "13px", color: "#6B7280", fontFamily: "Source Sans Pro" }}>EVALUATED SCORE</Typography>
                  <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#FF4F00", mt: 0.5 }}>
                    {level5Details.status === "REVIEWED" ? `${level5Details.scores?.level5 || userDetail?.user.progress.testScores.level5 || "N/A"} / 900` : "PENDING REVIEW"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Timeline list */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {level5Details.questions?.map((q: any, idx: number) => {
                const ans = level5Details.answers?.find((a: any) => a.questionId === q.questionId);
                const reviewScore = level5Details.reviews?.find((r: any) => r.questionId === q.questionId);

                return (
                  <Card key={q.questionId || idx} sx={{ borderRadius: "16px", border: "1px solid #E0E0E0", boxShadow: "none" }}>
                    <CardContent sx={{ p: 3 }}>
                      {/* Topic title */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1.5 }}>
                        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                          <HelpOutlineIcon sx={{ color: "#005F73" }} />
                          <Typography sx={{ fontFamily: "Source Sans Pro", fontSize: "18px", fontWeight: 600, color: "#2B2B2B" }}>
                            Topic {idx + 1}: {q.questionText}
                          </Typography>
                        </Box>
                        {reviewScore && (
                          <Chip
                            label={`Topic Score: ${reviewScore.score} / 100`}
                            sx={{ backgroundColor: "#FF4F0015", color: "#FF4F00", fontWeight: 600 }}
                          />
                        )}
                      </Box>

                      {/* Transcripts history inside the answer */}
                      <Box sx={{ pl: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                        {ans?.conversationHistory ? (
                          ans.conversationHistory.map((turn: any, tIdx: number) => {
                            const isAI = turn.role === "assistant";
                            return (
                              <Box
                                key={tIdx}
                                sx={{
                                  display: "flex",
                                  gap: 2,
                                  flexDirection: isAI ? "row" : "row-reverse",
                                }}
                              >
                                {/* Chat bubble */}
                                <Box
                                  sx={{
                                    maxWidth: "80%",
                                    p: 2,
                                    borderRadius: "12px",
                                    border: isAI ? "1px solid #E5E7EB" : "1px solid #FF4F0033",
                                    backgroundColor: isAI ? "#F9FAFB" : "#FF4F0005",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      color: isAI ? "#6B7280" : "#FF4F00",
                                      mb: 0.5,
                                    }}
                                  >
                                    {isAI ? "AI ASSISTANT" : "USER RESPONSE"}
                                  </Typography>
                                  <Typography sx={{ fontFamily: "Source Sans Pro", fontSize: "14px", color: "#374151" }}>
                                    {turn.content}
                                  </Typography>
                                </Box>
                              </Box>
                            );
                          })
                        ) : (
                          // Fallback to simple answer transcript
                          <Box sx={{ p: 2, borderRadius: "8px", border: "1px dashed #CCCCCC", backgroundColor: "#FAF9F6" }}>
                            <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 600, mb: 0.5 }}>USER ANSWER TRANSCRIPT</Typography>
                            <Typography sx={{ fontFamily: "Source Sans Pro", fontSize: "14px", color: "#2B2B2B" }}>
                              {ans?.transcript || "(No transcript found)"}
                            </Typography>
                          </Box>
                        )}

                        {reviewScore?.remarks && (
                          <Box sx={{ mt: 2, p: 2, borderRadius: "8px", backgroundColor: "#FF4F0004", border: "1px solid #FF4F0015" }}>
                            <Typography sx={{ fontSize: "12px", color: "#FF4F00", fontWeight: 600, mb: 0.5 }}>ADMIN REMARKS</Typography>
                            <Typography sx={{ fontFamily: "Source Sans Pro", fontSize: "14px", color: "#4B5563" }}>
                              {reviewScore.remarks}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default function UserResponsesPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#FF4F00" }} />
      </Box>
    }>
      <ResponsesContent />
    </Suspense>
  );
}
