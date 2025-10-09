import {
  Box,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  LinearProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { questionsApi, Question } from "../../../services/questionsService";
import { authService } from "../../../services/authService";
import SignUpModal from "../SignUpModal";
import Slider from "@/app/components/ui/Slider";
import { useAppDispatch } from "../../../store/hooks";
import { updateProgress } from "../../../store/slices/authSlice";

export default function Level1Test() {
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const STORAGE_KEY = "level1_test_answers";

  // Load answers from session storage and question index from URL
  useEffect(() => {
    // Load saved answers from session storage
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

    // Get question index from URL parameters
    const questionParam = searchParams.get("question");
    if (questionParam) {
      const questionIndex = parseInt(questionParam, 10) - 1; // Convert to 0-based index
      if (questionIndex >= 0) {
        setCurrentQuestionIndex(questionIndex);
      }
    }
  }, [searchParams]);

  // Validate and adjust question index when questions are loaded
  useEffect(() => {
    if (questions.length > 0) {
      const questionParam = searchParams.get("question");
      if (questionParam) {
        const questionIndex = parseInt(questionParam, 10) - 1;
        // Ensure question index is within valid range
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
  }, [answers]);

  // Update URL when question index changes
  useEffect(() => {
    if (questions.length > 0) {
      const questionNumber = currentQuestionIndex + 1;
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("question", questionNumber.toString());

      // Use replace to avoid adding to browser history for every question
      router.replace(`?${currentParams.toString()}`, { scroll: false });
    }
  }, [currentQuestionIndex, questions.length, router, searchParams]);

  // Fetch Level 1 questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await questionsApi.getQuestionsByLevel(1);

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

      // Check if user is already logged in
      if (authService.isAuthenticated()) {
        // User is logged in, proceed with test submission
        await submitTestAnswers();
      } else {
        // User not logged in, show sign up modal
        setShowSignUpModal(true);
      }
    } catch (err) {
      console.error("Error submitting test:", err);
      alert("Failed to submit test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitTestAnswers = async () => {
    try {
      // Get the authenticated user
      const user = authService.getCurrentUserFromStore();
      console.log("Current user from store:", user); // Debug user data

      if (!user || !user.userId) {
        throw new Error("User not authenticated");
      }

      // Calculate the score before submission
      const calculatedScore = calculateUserScore();

      // Convert answers object to responses array format
      const responses = Object.entries(answers).map(
        ([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex: Number(selectedOptionIndex), // Ensure it's a number
        })
      );

      if (responses.length === 0) {
        throw new Error("No responses to submit");
      }

      console.log("Submitting Level 1 responses:", {
        userId: user.userId,
        responses,
        calculatedScore,
      });

      console.log("Sample response data:", responses[0]); // Debug first response

      // Submit all Level 1 responses in one API call
      const response = await questionsApi.submitLevel1Response(
        user.userId,
        responses
      );

      if (response.success) {
        // Update Redux store with new progress
        const calculatedScore = calculateUserScore();
        dispatch(
          updateProgress({
            completedLevels: [1], // Add level 1 to completed (backend handles merging)
            highestUnlockedLevel: 2, // Unlock level 2
            testScores: {
              level1: calculatedScore,
            },
          })
        );

        // Clear answers from session storage after successful submission
        sessionStorage.removeItem(STORAGE_KEY);

        console.log("Level 1 Test submitted successfully:", response.data);

        // Navigate to Level 1 analysis page
        router.push("/user/analysis/level-1");
      } else {
        throw new Error(response.message || "Failed to submit test");
      }
    } catch (err: any) {
      console.error("Error submitting test:", err);

      // Extract server error message if available
      let errorMessage = "Failed to submit test. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
        console.error("Server error details:", err.response.data);
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      // Keep data in session storage if submission fails
      alert(errorMessage);
      throw err; // Re-throw to handle in calling function
    }
  };

  // Calculate user score based on slider responses
  const calculateUserScore = (): number => {
    // Each response is multiplied by 15
    // With 6 questions, max possible raw score = 6 * 10 * 15 = 900
    // Min possible raw score = 6 * 0 * 15 = 0

    const totalRawScore = Object.values(answers).reduce((sum, response) => {
      return sum + response * 15;
    }, 0);

    // Apply minimum score logic: if below 350, show 350
    const finalScore = Math.max(totalRawScore, 350);

    // Ensure we don't exceed maximum score of 900
    return Math.min(finalScore, 900);
  };

  const handleAuthSuccess = async (userData: any) => {
    console.log("User authenticated:", userData);
    setShowSignUpModal(false);

    try {
      // Now submit the test answers
      await submitTestAnswers();
    } catch (err) {
      // Error already handled in submitTestAnswers
      console.error("Failed to submit test after authentication:", err);
    }
  };

  // Clear saved data function (useful for testing or reset)
  // const clearSavedData = () => {
  //   sessionStorage.removeItem(STORAGE_KEY);
  //   setAnswers({});
  //   setCurrentQuestionIndex(0);
  //   router.replace("/user/test?question=1", { scroll: false });
  // };

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
        <CircularProgress size={60} sx={{ color: "#E87A42" }} />
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
        <Button
          onClick={() => window.location.reload()}
          sx={{
            background: "#E87A42",
            color: "#fff",
            "&:hover": {
              background: "#D16A35",
            },
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // If no questions or no current question, show loading
  if (!questions.length || !currentQuestion) {
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
        <CircularProgress size={60} sx={{ color: "#E87A42" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        mx: "auto",
        p: 4,
        backgroundColor: "#F9F8F6",
        borderRadius: "16px",
        mt: 4,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontFamily:"Faustina",
          color: "#005F73",
          fontWeight: "bold",
          fontSize: "40px",
          textAlign: "left",
          mb: 2,
        }}
      >
        Level 1: Awareness Test
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontFamily: "Source Sans Pro",
          fontSize: "20px",
          lineHeight: 1.2,
          mb: 3,
          textAlign: "left",
          color: "#6B7280",
        }}
      >
        This test evaluates your self-awareness and understanding of your
        current life situation. Rate each statement from 0-10 to calculate your
        awareness score (350-900 points).
      </Typography>

      {/* Progress Bar */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            textAlign: "left",
            color: "#6B7280",
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          Question {currentQuestionIndex + 1}
        </Typography>
        <Typography
          sx={{
            mb: 2,
            textAlign: "left",
            color: "#000",
            fontSize: "20px",
            fontWeight: "600",
            fontFamily: "Source Sans Pro",
          }}
        >
          Here's an overview of your journey so far. Keep going to unlock deeper
          insights about your happiness.
        </Typography>
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
      </Box>

      {/* Current Question */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontFamily: "Source Sans Pro",
            color: "#2B2B2B",
            fontWeight: "600",
            textAlign: "left",
          }}
        >
          {currentQuestion.questionText}
        </Typography>

        {/* Conditional rendering based on question type */}
        {currentQuestion.questionType === "slider-scale" ? (
          /* Slider for slider-scale questions */
          <Slider
            value={answers[currentQuestion._id] || 0} // Default to 0
            onChange={(value) => handleAnswerChange(currentQuestion._id, value)}
            label="Rate your response (0-10)"
            min={0}
            max={10}
          />
        ) : (
          /* Radio buttons for multiple-choice questions (default) */
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
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
        }}
      >
        <Button
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          sx={{
            background: isFirstQuestion ? "#ccc" : "#005F73",
            color: "#fff",
            borderRadius: "25px",
            padding: "10px 24px",
            fontWeight: "bold",
            "&:hover": {
              background: isFirstQuestion ? "#ccc" : "#004A5C",
            },
            "&:disabled": {
              background: "#ccc",
              color: "#666",
            },
          }}
        >
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={
              Object.keys(answers).length < questions.length || submitting
            }
            sx={{
              background: "#E87A42",
              color: "#fff",
              borderRadius: "25px",
              padding: "12px 32px",
              fontWeight: "bold",
              fontSize: "1rem",
              "&:hover": {
                background: "#D16A35",
              },
              "&:disabled": {
                background: "#ccc",
              },
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "#fff" }} />
                Submitting...
              </>
            ) : (
              "Submit Test"
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!currentQuestion || !(currentQuestion._id in answers)}
            sx={{
              background:
                currentQuestion && currentQuestion._id in answers
                  ? "#E87A42"
                  : "#ccc",
              color: "#fff",
              borderRadius: "25px",
              padding: "10px 24px",
              fontWeight: "bold",
              "&:hover": {
                background:
                  currentQuestion && currentQuestion._id in answers
                    ? "#D16A35"
                    : "#ccc",
              },
              "&:disabled": {
                background: "#ccc",
                color: "#666",
              },
            }}
          >
            Next
          </Button>
        )}
      </Box>

      {/* Sign Up Modal */}
      <SignUpModal
        open={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </Box>
  );
}
