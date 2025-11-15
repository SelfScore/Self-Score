import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { questionsApi, Question } from "../../../services/questionsService";
import { authService } from "../../../services/authService";
import Slider from "@/app/components/ui/Slider";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import OutLineButton from "@/app/components/ui/OutLineButton";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateProgress } from "../../../store/slices/authSlice";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function Level2Test() {
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { progress: userProgress } = useAppSelector((state) => state.auth);

  const STORAGE_KEY = "level2_test_answers";
  const level = 2;

  // Section configuration
  const SECTION_1_COUNT = 5; // General Vices
  const SECTION_2_COUNT = 4; // Four Gateways to Hell

  // Determine current section
  const getCurrentSection = () => {
    if (currentQuestionIndex < SECTION_1_COUNT) {
      return {
        number: 1,
        name: "General Vices",
        questionInSection: currentQuestionIndex + 1,
        totalInSection: SECTION_1_COUNT,
      };
    } else {
      return {
        number: 2,
        name: "Four Gateways to Hell",
        questionInSection: currentQuestionIndex - SECTION_1_COUNT + 1,
        totalInSection: SECTION_2_COUNT,
      };
    }
  };

  const currentSection = getCurrentSection();

  // Load answers from session storage and question index from URL
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
  }, [searchParams, STORAGE_KEY]);

  // Validate and adjust question index when questions are loaded
  useEffect(() => {
    if (questions.length > 0) {
      const questionParam = searchParams.get("question");
      if (questionParam) {
        const questionIndex = parseInt(questionParam, 10) - 1;
        if (questionIndex >= questions.length) {
          setCurrentQuestionIndex(0);
        } else if (questionIndex < 0) {
          setCurrentQuestionIndex(0);
        }
      }
    }
  }, [questions, searchParams]);

  // Save answers to session storage whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers, STORAGE_KEY]);

  // Update URL when question index changes
  useEffect(() => {
    if (questions.length > 0) {
      const questionNumber = currentQuestionIndex + 1;
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("question", questionNumber.toString());
      router.replace(`?${currentParams.toString()}`, { scroll: false });
    }
  }, [currentQuestionIndex, questions.length, router, searchParams]);

  // Fetch questions for Level 2
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await questionsApi.getQuestionsByLevel(level);

        if (response.success) {
          // Sort questions by order field (1, 2, 3...9)
          const sortedQuestions = [...response.data].sort((a, b) => {
            return (a.order || 0) - (b.order || 0);
          });
          setQuestions(sortedQuestions);
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
  }, [level]);

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

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await submitTestAnswers();
    } catch (err) {
      console.error("Error submitting test:", err);
      alert("Failed to submit test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitTestAnswers = async () => {
    try {
      const user = authService.getCurrentUserFromStore();

      if (!user || !user.userId) {
        throw new Error("User not authenticated");
      }

      // Calculate the score before submission
      const calculatedScore = calculateUserScore();

      // Convert answers object to responses array format
      const responses = Object.entries(answers).map(
        ([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex: Number(selectedOptionIndex),
        })
      );

      if (responses.length === 0) {
        throw new Error("No responses to submit");
      }

      const response = await questionsApi.submitLevelResponse(
        user.userId,
        level,
        responses
      );

      if (response.success) {
        // Update Redux store with new progress
        const nextLevel = level + 1;
        dispatch(
          updateProgress({
            completedLevels: [level],
            highestUnlockedLevel: nextLevel <= 4 ? nextLevel : level,
            testScores: {
              level2: calculatedScore,
            },
          })
        );

        // Clear answers from session storage after successful submission
        sessionStorage.removeItem(STORAGE_KEY);

        // Navigate to level analysis page
        router.push(`/user/analysis/level-${level}`);
      } else {
        throw new Error(response.message || "Failed to submit test");
      }
    } catch (err: any) {
      console.error("Error submitting test:", err);

      let errorMessage = "Failed to submit test. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      alert(errorMessage);
      throw err;
    }
  };

  // Calculate user score for Level 2
  const calculateUserScore = (): number => {
    // Level 2: Level1Score - |Level2Score|
    const level1Score = userProgress?.testScores?.level1 || 350;

    // Calculate Level 2 raw score (all NEGATIVE_MULTIPLIER questions)
    let level2RawScore = 0;
    Object.entries(answers).forEach(([questionId, selectedOptionIndex]) => {
      const question = questions.find((q) => q._id === questionId);
      if (question) {
        const multiplier =
          question.scoringType === "NEGATIVE_MULTIPLIER" ? -10 : 15;
        level2RawScore += selectedOptionIndex * multiplier;
      }
    });

    // Take absolute value of Level 2 score
    const level2AbsoluteScore = Math.abs(level2RawScore);

    // Final formula: level1Score - |level2Score|
    const finalScore = level1Score - level2AbsoluteScore;

    // Cap between 350-900
    return Math.max(350, Math.min(finalScore, 900));
  };

  // Show loading state
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

  // Show error state
  if (error) {
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
      </Box>
    );
  }

  // Show empty state
  if (questions.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          mx: "auto",
          p: 4,
        }}
      >
        <Alert severity="info">
          No questions available for Level 2. Please contact support.
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
      {/* Header Section */}
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
          Level 2 Assessment
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
            This level focuses on identifying the subtle disturbances of the
            mind and ego. Here, the scale is reversed: 0 = Positive state, 10 =
            Negative state. It helps you recognise moments of restlessness,
            anger, or attachment that affect your peace.
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
              mt: 0,
              mb: 2,
              pl: 3,
            }}
          >
            <li>
              Be calm and reflective while answering, and notice your emotional
              responses
            </li>
            <li>
              Treat this as an honest mirror - not judgment, but gentle
              self-understanding
            </li>
            <li>
              Remember: Higher numbers indicate greater disturbance or negative
              patterns
            </li>
          </Typography>
        </Box>
      </Box>

      {/* Section Label */}
      <Typography
        sx={{
          fontFamily: "Source Sans Pro",
          fontSize: "16px",
          fontWeight: "600",
          color: "#005F73",
          mb: 1,
        }}
      >
        Section {currentSection.number}: {currentSection.name}
      </Typography>

      {/* Segmented Progress Bar */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Section 1 Progress */}
          <Box sx={{ flex: SECTION_1_COUNT, position: "relative" }}>
            <Box
              sx={{
                height: "14px",
                borderRadius: "11998.8px",
                backgroundColor: "#E0E0E0",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${
                    currentQuestionIndex < SECTION_1_COUNT
                      ? ((currentQuestionIndex + 1) / SECTION_1_COUNT) * 100
                      : 100
                  }%`,
                  backgroundColor: "#E87A42",
                  borderRadius: "11998.8px",
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Box>

          {/* Section 2 Progress */}
          <Box sx={{ flex: SECTION_2_COUNT, position: "relative" }}>
            <Box
              sx={{
                height: "14px",
                borderRadius: "11998.8px",
                backgroundColor: "#E0E0E0",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${
                    currentQuestionIndex >= SECTION_1_COUNT
                      ? ((currentQuestionIndex - SECTION_1_COUNT + 1) /
                          SECTION_2_COUNT) *
                        100
                      : 0
                  }%`,
                  backgroundColor: "#E87A42",
                  borderRadius: "11998.8px",
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Box>
        </Box>

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
          }}
        >
          {currentQuestion.questionText}
        </Typography>

        {/* Conditional rendering based on question type */}
        {currentQuestion.questionType === "slider-scale" ? (
          <Slider
            value={answers[currentQuestion._id] ?? 0}
            onChange={(value) => handleAnswerChange(currentQuestion._id, value)}
            label="Rate your response (0-10)"
            min={0}
            max={10}
          />
        ) : (
          <RadioGroup
            value={answers[currentQuestion._id]?.toString() || ""}
            onChange={(e) =>
              handleAnswerChange(currentQuestion._id, e.target.value)
            }
          >
            {currentQuestion.options.map((option, optionIndex) => (
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
              fontSize: "20px ",
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
            endIcon={<ArrowForwardIosIcon />}
            onClick={handleNext}
            disabled={!currentQuestion || !(currentQuestion._id in answers)}
            background={
              currentQuestion && currentQuestion._id in answers
                ? "#FF4F00"
                : "#ccc"
            }
            padding="10px 4px"
            style={{
              cursor:
                currentQuestion && currentQuestion._id in answers
                  ? "pointer"
                  : "not-allowed",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
