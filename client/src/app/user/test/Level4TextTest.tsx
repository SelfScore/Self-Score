"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  LinearProgress,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import OutLineButton from "@/app/components/ui/OutLineButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import MicIcon from "@mui/icons-material/Mic";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import {
  aiInterviewService,
  AIInterviewQuestion,
} from "@/services/aiInterviewService";

interface Level4TextTestProps {
  onBack?: () => void;
  onSwitchMode?: () => void;
}

export default function Level4TextTest({
  onBack,
  onSwitchMode,
}: Level4TextTestProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [interviewId, setInterviewId] = useState<string>("");
  const [questions, setQuestions] = useState<AIInterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savingAnswer, setSavingAnswer] = useState(false);

  // Speech recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordingError, setRecordingError] = useState("");
  const recognitionRef = useRef<any>(null);

  const STORAGE_KEY = "level4_text_test_answers";

  // ✅ Load current question from URL query params on mount (1-indexed)
  useEffect(() => {
    const questionParam = searchParams.get("currentQuestion");
    if (questionParam) {
      const questionNumber = parseInt(questionParam, 10);
      if (!isNaN(questionNumber) && questionNumber >= 1) {
        setCurrentQuestionIndex(questionNumber - 1); // Convert to 0-indexed
      }
    }
  }, [searchParams]);

  // Load answers from session storage
  useEffect(() => {
    const savedAnswers = sessionStorage.getItem(STORAGE_KEY);
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        setAnswers(parsedAnswers);
      } catch (err) {
        console.error("Error parsing saved answers:", err);
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [STORAGE_KEY]);

  // Save answers to session storage whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers, STORAGE_KEY]);

  // ✅ Update URL query params whenever current question changes (1-indexed)
  useEffect(() => {
    if (questions.length > 0) {
      const params = new URLSearchParams(window.location.search);
      params.set("level", "4");
      params.set("mode", "text");
      params.set("currentQuestion", (currentQuestionIndex + 1).toString()); // Convert to 1-indexed

      // Update URL without reload
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [currentQuestionIndex, questions.length]);

  // Initialize interview
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await aiInterviewService.startInterview("TEXT");

        if (response.success) {
          setInterviewId(response.data.interviewId);
          setQuestions(response.data.questions);

          // If resuming, populate existing answers
          if (response.data.answers && response.data.answers.length > 0) {
            const existingAnswers: { [key: string]: string } = {};
            response.data.answers.forEach((answer) => {
              existingAnswers[answer.questionId] = answer.answerText;
            });
            setAnswers(existingAnswers);

            // Start from first unanswered question
            const firstUnansweredIndex = response.data.questions.findIndex(
              (q: any) => !existingAnswers[q.questionId]
            );
            if (firstUnansweredIndex !== -1) {
              setCurrentQuestionIndex(firstUnansweredIndex);
            } else {
              // All questions answered, start from last question
              setCurrentQuestionIndex(response.data.questions.length - 1);
            }
          }
        } else {
          setError(response.message || "Failed to start interview");
        }
      } catch (err: any) {
        console.error("Error initializing interview:", err);
        setError("Failed to initialize interview. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initializeInterview();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.questionId] || ""
    : "";
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const allQuestionsAnswered = questions.every((q) =>
    answers[q.questionId]?.trim()
  );

  const handleAnswerChange = (value: string) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.questionId]: value,
    }));
  };

  const saveAnswer = async () => {
    if (!currentQuestion || !currentAnswer.trim()) {
      return;
    }

    try {
      setSavingAnswer(true);
      await aiInterviewService.submitTextAnswer(
        interviewId,
        currentQuestion.questionId,
        currentAnswer
      );
    } catch (err: any) {
      console.error("Error saving answer:", err);
      // Don't show error to user, just log it
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      await saveAnswer();
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allQuestionsAnswered) {
      setError("Please answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Save current answer
      await saveAnswer();

      // Complete the interview
      const response = await aiInterviewService.completeInterview(interviewId);

      if (response.success) {
        // Clear ALL Level 4 session storage on successful submission
        sessionStorage.removeItem(STORAGE_KEY); // Text mode answers
        sessionStorage.removeItem("level4_interview_answers"); // Voice mode answers (if switched)
        sessionStorage.removeItem("level4_interview_id"); // Interview ID
        sessionStorage.removeItem("level4_interview_mode"); // Mode preference

        // Redirect to feedback page
        router.push(`/user/test/feedback?interviewId=${interviewId}&level=4`);
      } else {
        setError("Failed to complete interview. Please try again.");
      }
    } catch (err: any) {
      console.error("Error submitting interview:", err);
      setError("Failed to submit interview. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Speech recognition handlers
  const startRecording = () => {
    setRecordingError("");
    setShowRecordingModal(true);

    // Check if browser supports Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecordingError(
        "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = "";

      recognition.onresult = (event: any) => {
        let _interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            _interimTranscript += transcript;
          }
        }

        // Update the answer with the transcribed text
        if (finalTranscript) {
          const currentAnswer =
            answers[currentQuestion?.questionId || ""] || "";
          const newAnswer = currentAnswer
            ? `${currentAnswer} ${finalTranscript}`.trim()
            : finalTranscript.trim();
          handleAnswerChange(newAnswer);
          finalTranscript = "";
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
          setRecordingError(
            "No speech detected. Please speak clearly and try again."
          );
        } else if (event.error === "not-allowed") {
          setRecordingError(
            "Microphone permission denied. Please allow microphone access."
          );
        } else {
          setRecordingError("Speech recognition error. Please try again.");
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      setIsRecording(true);
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setRecordingError("Failed to start recording. Please try again.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setShowRecordingModal(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          mx: "auto",
          p: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress sx={{ color: "#005F73" }} />
      </Box>
    );
  }

  if (error && !questions.length) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          mx: "auto",
          p: 4,
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <ButtonSelfScore text="Go Back" onClick={onBack} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1280px",
        mx: "auto",
        p: 4,
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        mt: 4,
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <OutLineButton
            startIcon={<ArrowBackIosIcon />}
            onClick={onBack}
            style={{
              background: "transparent",
              color: "#3A3A3A",
              border: "1px solid #3A3A3A",
              borderRadius: "8px",
              padding: "3.5px 14px",
              fontWeight: 400,
              fontSize: "18px",
            }}
          >
            Back
          </OutLineButton>

          {onSwitchMode && (
            <OutLineButton
              onClick={onSwitchMode}
              style={{
                background: "transparent",
                color: "#005F73",
                border: "1px solid #005F73",
                borderRadius: "8px",
                padding: "3.5px 14px",
                fontWeight: 400,
                fontSize: "18px",
              }}
            >
              Switch to Voice Mode
            </OutLineButton>
          )}
        </Box>

        <Typography
          sx={{
            fontWeight: "700",
            fontSize: "32px",
            color: "#005F73",
            textAlign: "center",
            mb: 3,
          }}
        >
          Level 4: Mastery Test - Text Mode
        </Typography>

        <Box
          sx={{
            border: "1px solid #E0E0E0",
            borderRadius: "16px",
            p: 3,
            backgroundColor: "#F7F7F7",
          }}
        >
          <Typography
            sx={{
              fontWeight: "700",
              fontSize: "18px",
              color: "#2B2B2B",
              fontFamily: "source sans pro",
            }}
          >
            Instructions
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              color: "#2B2B2B",
              fontWeight: 400,
              fontSize: "18px",
              lineHeight: "140%",
              mt: 1,
            }}
          >
            This comprehensive assessment evaluates your mastery of life
            management, emotional intelligence, and decision-making skills
            through 8 subjective questions. Please answer each question
            thoughtfully and in detail.
          </Typography>

          <Typography
            sx={{
              fontWeight: "700",
              fontSize: "18px",
              color: "#2B2B2B",
              fontFamily: "source sans pro",
              mt: 2,
            }}
          >
            Hints
          </Typography>

          <Typography
            component="ul"
            sx={{
              fontFamily: "Source Sans Pro",
              color: "#2B2B2B",
              fontWeight: 400,
              fontSize: "18px",
              lineHeight: "140%",
              mt: 1,
              mb: 2,
              pl: 3,
            }}
          >
            <li>Take your time to reflect on each question</li>
            <li>Be honest and specific in your responses</li>
            <li>
              Aim for at least 50 characters per answer for meaningful analysis
            </li>
            <li>
              Your answers will be analyzed by AI to provide personalized
              feedback
            </li>
          </Typography>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: "14px",
            borderRadius: "11998.8px",
            backgroundColor: "#E0E0E0",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#005F73",
              borderRadius: "11998.8px",
            },
          }}
        />
        <Typography
          variant="body2"
          sx={{
            mb: 0,
            mt: 4,
            textAlign: "left",
            color: "#6B7280",
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          Question {currentQuestionIndex + 1}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Current Question */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontFamily: "faustina",
            color: "#2B2B2B",
            fontWeight: "500",
            textAlign: "left",
            fontSize: "22px",
          }}
        >
          {currentQuestion?.questionText}
        </Typography>

        {/* Multiline Text Input with Voice-to-Text */}
        <Box sx={{ position: "relative" }}>
          <TextField
            multiline
            rows={8}
            fullWidth
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here... Be as detailed and thoughtful as possible."
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                fontSize: "16px",
                fontFamily: "Source Sans Pro",
                "& fieldset": {
                  borderColor: "#E0E0E0",
                  borderWidth: "2px",
                },
                "&:hover fieldset": {
                  borderColor: "#005F73",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#005F73",
                  borderWidth: "2px",
                },
              },
            }}
          />
          {/* Microphone Button - Top Right */}
          <IconButton
            onClick={startRecording}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#005F73",
              backgroundColor: "#E8F4F5",
              "&:hover": {
                backgroundColor: "#D0EBF0",
              },
            }}
          >
            <MicIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: currentAnswer.length < 50 ? "#E65100" : "#4CAF50",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            {currentAnswer.length} characters
            {currentAnswer.length < 50 && " (minimum 50 recommended)"}
          </Typography>

          {savingAnswer && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" sx={{ color: "#666" }}>
                Saving...
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 4,
          gap: 2,
        }}
      >
        <OutLineButton
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          startIcon={<ArrowBackIosIcon />}
          sx={{
            padding: "1.5px 14px",
            fontSize: "20px",
            fontWeight: 400,
            minWidth: "140px",
            "&:disabled": {
              borderColor: "#ccc",
              color: "#ccc",
            },
          }}
        >
          Previous
        </OutLineButton>

        {isLastQuestion ? (
          <ButtonSelfScore
            text={
              submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: "#fff" }} />
                  Submitting...
                </>
              ) : (
                "Submit Test"
              )
            }
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered || submitting}
            textStyle={{
              fontFamily: "source sans pro",
              fontSize: "20px",
              fontWeight: 400,
            }}
            background="#FF4F00"
            borderRadius="12px"
            padding="12px 32px"
            style={{
              opacity: !allQuestionsAnswered || submitting ? 0.5 : 1,
              cursor:
                !allQuestionsAnswered || submitting ? "not-allowed" : "pointer",
            }}
          />
        ) : (
          <ButtonSelfScore
            text="Next"
            endIcon={<ArrowForwardIosIcon />}
            onClick={handleNext}
            disabled={!currentAnswer.trim()}
            background={currentAnswer.trim() ? "#FF4F00" : "#ccc"}
            padding="10px 4px"
            style={{
              cursor: currentAnswer.trim() ? "pointer" : "not-allowed",
            }}
          />
        )}
      </Box>

      {/* Voice Recording Modal */}
      <Dialog
        open={showRecordingModal}
        onClose={stopRecording}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: "#005F73",
            textAlign: "center",
            pb: 1,
          }}
        >
          Recording Your Answer
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 3,
            }}
          >
            {recordingError ? (
              <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                {recordingError}
              </Alert>
            ) : (
              <>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: isRecording ? "#FFE8E0" : "#E8F4F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                    animation: isRecording ? "pulse 1.5s infinite" : "none",
                    "@keyframes pulse": {
                      "0%": {
                        boxShadow: "0 0 0 0 rgba(255, 79, 0, 0.4)",
                      },
                      "70%": {
                        boxShadow: "0 0 0 20px rgba(255, 79, 0, 0)",
                      },
                      "100%": {
                        boxShadow: "0 0 0 0 rgba(255, 79, 0, 0)",
                      },
                    },
                  }}
                >
                  <MicIcon
                    sx={{
                      fontSize: 40,
                      color: isRecording ? "#FF4F00" : "#005F73",
                    }}
                  />
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    color: "#2B2B2B",
                    fontWeight: 500,
                    mb: 1,
                    textAlign: "center",
                  }}
                >
                  Speak clearly and loud
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    mb: 3,
                    textAlign: "center",
                  }}
                >
                  Your speech will be converted to text and added to your answer
                </Typography>

                <ButtonSelfScore
                  text="Stop Recording"
                  startIcon={<StopCircleIcon />}
                  onClick={stopRecording}
                  background="#E65100"
                  padding="12px 32px"
                  borderRadius="8px"
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                  }}
                />
              </>
            )}

            {recordingError && (
              <ButtonSelfScore
                text="Close"
                onClick={stopRecording}
                background="#666"
                padding="12px 32px"
                borderRadius="8px"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  marginTop: "16px",
                }}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
