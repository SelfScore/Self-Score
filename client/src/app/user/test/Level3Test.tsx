"use client";

import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  LinearProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "../../../services/authService";
import Slider from "@/app/components/ui/Slider";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import OutLineButton from "@/app/components/ui/OutLineButton";
import { useAppDispatch } from "../../../store/hooks";
import { updateProgress } from "../../../store/slices/authSlice";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import api from "../../../lib/api";

// API Response interface
interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  count?: number;
}

// Level 3 Question interface
interface Level3Question {
  _id: string;
  questionId: string;
  questionText: string;
  questionType: "multiple-choice" | "slider-scale";
  options?: string[];
  order: number;
}

export default function Level3Test() {
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [questions, setQuestions] = useState<Level3Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startTime] = useState<number>(Date.now());

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const STORAGE_KEY = "level3_test_answers";

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

    const questionParam = searchParams.get("question");
    if (questionParam) {
      const questionIndex = parseInt(questionParam, 10) - 1;
      if (questionIndex >= 0) {
        setCurrentQuestionIndex(questionIndex);
      }
    }
  }, [searchParams]);

  // Save answers to session storage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers]);

  // Update URL when question index changes
  useEffect(() => {
    if (questions.length > 0) {
      const questionNumber = currentQuestionIndex + 1;
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set("level", "3");
      currentParams.set("question", questionNumber.toString());
      router.replace(`?${currentParams.toString()}`, { scroll: false });
    }
  }, [currentQuestionIndex, questions.length, router]);

  // Fetch Level 3 questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");
        const response = (await api.get(
          "/api/level3/questions",
        )) as ApiResponse;

        if (response.success) {
          setQuestions(response.data);
        } else {
          setError(response.message || "Failed to fetch questions");
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: typeof value === "string" ? parseInt(value, 10) : value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const user = authService.getCurrentUserFromStore();
      if (!user || !user.userId) {
        throw new Error("User not authenticated");
      }

      // Convert answers to responses format
      const responses = Object.entries(answers).map(
        ([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex: Number(selectedOptionIndex),
        }),
      );

      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

      const response = (await api.post("/api/level3/submit", {
        userId: user.userId,
        responses,
        timeSpent: timeSpentSeconds,
      })) as ApiResponse;

      if (response.success) {
        // Update Redux store
        dispatch(
          updateProgress({
            completedLevels: [3],
            highestUnlockedLevel: 4,
            testScores: {
              level3: response.data.score,
            },
          }),
        );

        // Clear session storage
        sessionStorage.removeItem(STORAGE_KEY);

        // Navigate to analysis page
        router.push("/user/analysis/level-3");
      } else {
        throw new Error(response.message || "Failed to submit test");
      }
    } catch (err: any) {
      console.error("Error submitting test:", err);
      alert(err.message || "Failed to submit test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
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
        <CircularProgress sx={{ color: "#E87A42" }} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ width: "100%", maxWidth: "800px", mx: "auto", p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (questions.length === 0) {
    return (
      <Box sx={{ width: "100%", maxWidth: "800px", mx: "auto", p: 4 }}>
        <Alert severity="info">
          No questions available for Level 3. Please contact support.
        </Alert>
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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontWeight: "700",
            fontSize: "32px",
            color: "#005F73",
            textAlign: "center",
            mt: -6,
          }}
        >
          Level 3 Assessment
        </Typography>

        <Box
          sx={{
            mt: 3,
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
            This reflection is designed to help you understand yourself more
            deeply. Take your time, answer honestly, and choose what feels
            closest to your current understanding. There are no right or wrong
            answers, this is simply a mirror for self-awareness.
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
            Question Types
          </Typography>

          <Typography
            component="ul"
            sx={{
              fontFamily: "Source Sans Pro",
              color: "#2B2B2B",
              fontWeight: 400,
              fontSize: "18px",
              lineHeight: "140%",
              mt: 0,
              mb: 2,
              pl: 3,
            }}
          >
            <li>
              Multiple Choice: Choose the option that feels most true for you
              right now
            </li>
            <li>
              Scale (0–10): Gently rate yourself (0 = least aligned, 10 = most
              aligned)
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
              backgroundColor: "#E87A42",
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
          Question {currentQuestionIndex + 1} of {questions.length}
        </Typography>
      </Box>

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
            whiteSpace: "pre-line",
          }}
        >
          {currentQuestion.questionText}
        </Typography>

        {currentQuestion.questionType === "slider-scale" ? (
          <Slider
            value={answers[currentQuestion.questionId] ?? 0}
            onChange={(value) =>
              handleAnswerChange(currentQuestion.questionId, value)
            }
            label="Rate your response (0-10)"
            min={0}
            max={10}
          />
        ) : (
          <RadioGroup
            value={answers[currentQuestion.questionId]?.toString() || ""}
            onChange={(e) =>
              handleAnswerChange(currentQuestion.questionId, e.target.value)
            }
          >
            {currentQuestion.options?.map((option, optionIndex) => (
              <FormControlLabel
                key={optionIndex}
                value={optionIndex.toString()}
                control={
                  <Radio
                    sx={{
                      color: "#E87A42",
                      "&.Mui-checked": {
                        color: "#E87A42",
                      },
                    }}
                  />
                }
                label={option}
                sx={{
                  mb: 1,
                  "& .MuiFormControlLabel-label": {
                    fontSize: "1.1rem",
                  },
                }}
              />
            ))}
          </RadioGroup>
        )}
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
            fontFamily: "source sans pro",
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
            disabled={
              Object.keys(answers).length < questions.length || submitting
            }
            textStyle={{
              fontFamily: "source sans pro",
              fontSize: "20px",
              fontWeight: 400,
            }}
            background="#FF4F00"
            borderRadius="12px"
            padding="12px 32px"
            style={{
              opacity:
                Object.keys(answers).length < questions.length || submitting
                  ? 0.5
                  : 1,
              cursor:
                Object.keys(answers).length < questions.length || submitting
                  ? "not-allowed"
                  : "pointer",
            }}
          />
        ) : (
          <ButtonSelfScore
            text="Next"
            endIcon={
              <ArrowForwardIosIcon sx={{ color: "#FFF", fontSize: "20px" }} />
            }
            onClick={handleNext}
            disabled={
              !currentQuestion || !(currentQuestion.questionId in answers)
            }
            background={
              currentQuestion && currentQuestion.questionId in answers
                ? "#FF4F00"
                : "#ccc"
            }
            padding="10px 4px"
            style={{
              cursor:
                currentQuestion && currentQuestion.questionId in answers
                  ? "pointer"
                  : "not-allowed",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
