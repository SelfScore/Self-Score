"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
  TextField,
  IconButton,
  Chip,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import OutLineButton from "@/app/components/ui/OutLineButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import {
  aiInterviewService,
  AIInterviewQuestion,
} from "@/services/aiInterviewService";
import { useAuth } from "@/hooks/useAuth";

interface Level4VoiceTestProps {
  onBack: () => void;
  onSwitchMode?: () => void;
}

type InterviewState =
  | "IDLE"
  | "SPEAKING"
  | "LISTENING"
  | "PROCESSING"
  | "COMPLETED"
  | "EDITING";

interface TranscriptEntry {
  role: "user" | "assistant";
  content: string;
  questionId?: string;
}

export default function Level4VoiceTest({
  onBack,
  onSwitchMode,
}: Level4VoiceTestProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<AIInterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewState, setInterviewState] = useState<InterviewState>("IDLE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [editingAnswers, setEditingAnswers] = useState<{
    [questionId: string]: string;
  }>({});
  const [editMode, setEditMode] = useState(false);

  // Web Speech API references
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const interviewIdRef = useRef<string>("");
  const questionsRef = useRef<AIInterviewQuestion[]>([]);
  const currentQuestionIndexRef = useRef<number>(0);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Load current question from URL query params on mount (1-indexed)
  useEffect(() => {
    const questionParam = searchParams.get("currentQuestion");
    if (questionParam) {
      const questionNumber = parseInt(questionParam, 10);
      if (!isNaN(questionNumber) && questionNumber >= 1) {
        const questionIndex = questionNumber - 1; // Convert to 0-indexed
        setCurrentQuestionIndex(questionIndex);
        currentQuestionIndexRef.current = questionIndex;
      }
    }
  }, [searchParams]);

  // ✅ Update URL query params whenever current question changes (1-indexed)
  useEffect(() => {
    if (questions.length > 0) {
      const params = new URLSearchParams(window.location.search);
      params.set("level", "4");
      params.set("mode", "voice");
      params.set("currentQuestion", (currentQuestionIndex + 1).toString()); // Convert to 1-indexed

      // Update URL without reload
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [currentQuestionIndex, questions.length]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop =
        transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  // Initialize interview
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await aiInterviewService.startInterview("VOICE");

        if (response.success) {
          const newInterviewId = response.data.interviewId;
          interviewIdRef.current = newInterviewId;

          setQuestions(response.data.questions);
          questionsRef.current = response.data.questions;

          // If resuming with existing answers from text mode or previous voice session
          if (response.data.answers && response.data.answers.length > 0) {
            // Populate editing answers for display after completion
            const existingAnswers: { [questionId: string]: string } = {};
            response.data.answers.forEach((answer) => {
              existingAnswers[answer.questionId] = answer.answerText;
            });
            setEditingAnswers(existingAnswers);

            // Find first unanswered question
            const firstUnansweredIndex = response.data.questions.findIndex(
              (q: any) => !existingAnswers[q.questionId]
            );
            if (firstUnansweredIndex !== -1) {
              setCurrentQuestionIndex(firstUnansweredIndex);
              currentQuestionIndexRef.current = firstUnansweredIndex;
            } else {
              // All questions answered
              setCurrentQuestionIndex(response.data.questions.length - 1);
              currentQuestionIndexRef.current =
                response.data.questions.length - 1;
            }
          }

          // Load existing transcript if available
          if (response.data.transcript && response.data.transcript.length > 0) {
            setTranscript(response.data.transcript);
            transcriptRef.current = response.data.transcript;
          }

          // Initialize speech synthesis
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            synthRef.current = window.speechSynthesis;
          }

          // Initialize speech recognition
          if (typeof window !== "undefined") {
            const SpeechRecognition =
              (window as any).SpeechRecognition ||
              (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
              const recognition = new SpeechRecognition();
              recognition.continuous = false;
              recognition.interimResults = false;
              recognition.lang = "en-US";

              recognition.onresult = (event: any) => {
                const speechResult = event.results[0][0].transcript;
                setIsUserSpeaking(false);
                handleUserSpeech(speechResult);
              };

              recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsUserSpeaking(false);
                if (event.error !== "no-speech") {
                  setError("Error with speech recognition. Please try again.");
                  setInterviewState("IDLE");
                }
              };

              recognition.onstart = () => {
                setIsUserSpeaking(true);
              };

              recognition.onend = () => {
                setIsUserSpeaking(false);
              };

              recognitionRef.current = recognition;
            } else {
              setError(
                "Speech recognition is not supported in your browser. Please use Chrome or Edge."
              );
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

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speakText = async (text: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!synthRef.current) {
        reject(new Error("Speech synthesis not available"));
        return;
      }

      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = synthRef.current.getVoices();
      const femaleVoice = voices.find(
        (voice) =>
          voice.name.toLowerCase().includes("female") ||
          voice.name.toLowerCase().includes("samantha") ||
          voice.name.toLowerCase().includes("victoria")
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => {
        setIsAISpeaking(true);
      };

      utterance.onend = () => {
        setIsAISpeaking(false);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsAISpeaking(false);
        console.error("Speech synthesis error:", event);
        reject(event);
      };

      synthRef.current.speak(utterance);
    });
  };

  const handleUserSpeech = async (speechText: string) => {
    try {
      setInterviewState("PROCESSING");

      const currentQuestion =
        questionsRef.current[currentQuestionIndexRef.current];
      const userTranscript: TranscriptEntry = {
        role: "user",
        content: speechText,
        questionId: currentQuestion.questionId,
      };
      setTranscript((prev) => [...prev, userTranscript]);
      transcriptRef.current = [...transcriptRef.current, userTranscript];

      // Add to editingAnswers immediately so it's available for submission
      setEditingAnswers((prev) => ({
        ...prev,
        [currentQuestion.questionId]: speechText,
      }));

      // Save to backend with questionId
      await aiInterviewService.addTranscript(
        interviewIdRef.current,
        "user",
        speechText,
        currentQuestion.questionId
      );

      // Move to next question
      if (currentQuestionIndexRef.current < questionsRef.current.length - 1) {
        const nextIndex = currentQuestionIndexRef.current + 1;
        setCurrentQuestionIndex(nextIndex);
        currentQuestionIndexRef.current = nextIndex;
        setTimeout(() => askNextQuestion(), 1000);
      } else {
        // Interview complete - show edit option
        setInterviewState("COMPLETED");
        const closingMessage =
          "Thank you for completing the interview. You can now review and edit your answers before final submission.";
        await speakText(closingMessage);

        // Prepare editing answers from transcript (already added above, but ensure all are there)
        const answerMap: { [questionId: string]: string } = {};
        transcriptRef.current.forEach((entry) => {
          if (entry.role === "user" && entry.questionId) {
            answerMap[entry.questionId] = entry.content;
          }
        });
        setEditingAnswers((prev) => ({ ...prev, ...answerMap }));
      }
    } catch (err: any) {
      console.error("Error processing speech:", err);
      setError("Error processing your response. Please try again.");
      setInterviewState("IDLE");
    }
  };

  const askNextQuestion = async () => {
    if (currentQuestionIndexRef.current >= questionsRef.current.length) {
      return;
    }

    const question = questionsRef.current[currentQuestionIndexRef.current];
    const questionText = question.questionText;

    try {
      setInterviewState("SPEAKING");

      const assistantTranscript: TranscriptEntry = {
        role: "assistant",
        content: questionText,
        questionId: question.questionId,
      };
      setTranscript((prev) => [...prev, assistantTranscript]);
      transcriptRef.current = [...transcriptRef.current, assistantTranscript];

      await aiInterviewService.addTranscript(
        interviewIdRef.current,
        "assistant",
        questionText,
        question.questionId
      );

      await speakText(questionText);

      setInterviewState("LISTENING");
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (err: any) {
      console.error("Error asking question:", err);
      setError("Error during interview. Please try again.");
      setInterviewState("IDLE");
    }
  };

  const startInterview = async () => {
    setError("");
    const intro =
      "Hello! Welcome to your Level 4 Mastery Test. I'll be asking you 8 questions about your life management, emotional intelligence, and decision-making skills. Please speak clearly and take your time to answer. Let's begin.";

    try {
      setInterviewState("SPEAKING");

      const introTranscript: TranscriptEntry = {
        role: "assistant",
        content: intro,
      };
      setTranscript([introTranscript]);
      transcriptRef.current = [introTranscript];

      await aiInterviewService.addTranscript(
        interviewIdRef.current,
        "assistant",
        intro,
        undefined // No questionId for intro
      );
      await speakText(intro);

      await askNextQuestion();
    } catch (err: any) {
      console.error("Error starting interview:", err);
      setError("Error starting interview. Please try again.");
      setInterviewState("IDLE");
    }
  };

  const handleEditAnswer = (questionId: string, newValue: string) => {
    setEditingAnswers((prev) => ({
      ...prev,
      [questionId]: newValue,
    }));
  };

  const handleSaveEdits = () => {
    setEditMode(false);
  };

  const handleSubmitFinal = async () => {
    try {
      setInterviewState("PROCESSING");

      // Submit ALL voice answers to backend (including both original and edited)
      // This ensures voice answers are saved in the answers array, not just transcript
      for (const [questionId, answer] of Object.entries(editingAnswers)) {
        if (answer && answer.trim()) {
          await aiInterviewService.submitTextAnswer(
            interviewIdRef.current,
            questionId,
            answer
          );
        }
      }

      const response = await aiInterviewService.completeInterview(
        interviewIdRef.current
      );

      if (response.success) {
        // Clear ALL Level 4 session storage on successful submission
        sessionStorage.removeItem("level4_interview_answers"); // Voice mode answers
        sessionStorage.removeItem("level4_text_answers"); // Text mode answers (if switched)
        sessionStorage.removeItem("level4_interview_id"); // Interview ID
        sessionStorage.removeItem("level4_interview_mode"); // Mode preference

        router.push(
          `/user/test/feedback?interviewId=${interviewIdRef.current}&level=4`
        );
      } else {
        setError(
          response.message || "Failed to complete interview. Please try again."
        );
        setInterviewState("COMPLETED");
      }
    } catch (err: any) {
      console.error("Error completing interview:", err);
      setError("Failed to complete interview. Please try again.");
      setInterviewState("COMPLETED");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setInterviewState("IDLE");
  };

  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

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
        <CircularProgress sx={{ color: "#E65100" }} />
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
        maxWidth: "1600px",
        mx: "auto",
        p: 4,
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        mt: 4,
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          {interviewState === "IDLE" && (
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
          )}
          {!interviewState.match(/IDLE/) && <Box />}

          {onSwitchMode && interviewState === "IDLE" && (
            <OutLineButton
              onClick={onSwitchMode}
              style={{
                background: "transparent",
                color: "#E65100",
                border: "1px solid #E65100",
                borderRadius: "8px",
                padding: "3.5px 14px",
                fontWeight: 400,
                fontSize: "18px",
              }}
            >
              Switch to Text Mode
            </OutLineButton>
          )}
        </Box>

        <Typography
          sx={{
            fontWeight: "700",
            fontSize: "32px",
            color: "#E65100",
            textAlign: "center",
            mb: 2,
          }}
        >
          Level 4: Mastery Test - Voice Mode
        </Typography>

        {/* Progress Bar */}
        {interviewState !== "IDLE" && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: "14px",
                borderRadius: "11998.8px",
                backgroundColor: "#E0E0E0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#E65100",
                  borderRadius: "11998.8px",
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                textAlign: "left",
                color: "#6B7280",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Content - Video Tiles Side by Side */}
      {interviewState !== "COMPLETED" && (
        <Box
          sx={{
            display: "flex",
            gap: 3,
            minHeight: "500px",
            mb: 3,
          }}
        >
          {/* AI Tile - Left */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: "#1E1E1E",
              borderRadius: "12px",
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              border: isAISpeaking
                ? "4px solid #E65100"
                : "4px solid transparent",
              transition: "border 0.3s ease",
            }}
          >
            {/* AI Avatar */}
            <Box
              sx={{
                width: 150,
                height: 150,
                borderRadius: "50%",
                backgroundColor: isAISpeaking ? "#FF6F00" : "#E65100",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                transition: "all 0.3s ease",
                animation: isAISpeaking
                  ? "pulse 1.5s ease-in-out infinite"
                  : "none",
                "@keyframes pulse": {
                  "0%, 100%": {
                    transform: "scale(1)",
                    boxShadow: "0 0 0 0 rgba(230, 81, 0, 0.7)",
                  },
                  "50%": {
                    transform: "scale(1.05)",
                    boxShadow: "0 0 0 30px rgba(230, 81, 0, 0)",
                  },
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "64px",
                  color: "#FFFFFF",
                }}
              >
                🤖
              </Typography>
            </Box>

            <Typography
              sx={{
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: 600,
                mb: 2,
              }}
            >
              AI Interviewer
            </Typography>

            {isAISpeaking && (
              <Chip
                label="Speaking..."
                sx={{
                  backgroundColor: "#E65100",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "16px",
                  padding: "8px 16px",
                }}
              />
            )}
          </Box>

          {/* User Tile - Right */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: "#1E1E1E",
              borderRadius: "12px",
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              border: isUserSpeaking
                ? "4px solid #4CAF50"
                : "4px solid transparent",
              transition: "border 0.3s ease",
            }}
          >
            {/* User Avatar */}
            <Box
              sx={{
                width: 150,
                height: 150,
                borderRadius: "50%",
                backgroundColor: isUserSpeaking ? "#66BB6A" : "#4CAF50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                transition: "all 0.3s ease",
                animation: isUserSpeaking
                  ? "pulse 1.5s ease-in-out infinite"
                  : "none",
                "@keyframes pulse": {
                  "0%, 100%": {
                    transform: "scale(1)",
                    boxShadow: "0 0 0 0 rgba(76, 175, 80, 0.7)",
                  },
                  "50%": {
                    transform: "scale(1.05)",
                    boxShadow: "0 0 0 30px rgba(76, 175, 80, 0)",
                  },
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "64px",
                  color: "#FFFFFF",
                }}
              >
                👤
              </Typography>
            </Box>

            <Typography
              sx={{
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: 600,
                mb: 2,
              }}
            >
              {user?.username || "You"}
            </Typography>

            {isUserSpeaking && (
              <Chip
                label="Speaking..."
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "16px",
                  padding: "8px 16px",
                }}
              />
            )}

            {interviewState === "LISTENING" && !isUserSpeaking && (
              <Chip
                icon={<MicIcon />}
                label="Listening..."
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "16px",
                  padding: "8px 16px",
                  animation: "blink 1s ease-in-out infinite",
                  "@keyframes blink": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                  },
                }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Transcript Section - Only shown after completion */}
      {interviewState === "COMPLETED" && (
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              backgroundColor: "#F7F7F7",
              borderRadius: "12px",
              p: 2,
              mb: 2,
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "20px",
                color: "#2B2B2B",
              }}
            >
              Interview Transcript
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                color: "#666",
                mt: 0.5,
              }}
            >
              Review your conversation and edit your answers below
            </Typography>
          </Box>

          <Box
            ref={transcriptContainerRef}
            sx={{
              backgroundColor: "#FFFFFF",
              border: "2px solid #E0E0E0",
              borderRadius: "12px",
              p: 3,
              overflowY: "auto",
              maxHeight: "400px",
              mb: 3,
            }}
          >
            {transcript.map((entry, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  pb: 2,
                  borderBottom:
                    index < transcript.length - 1
                      ? "1px solid #E0E0E0"
                      : "none",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: entry.role === "assistant" ? "#E65100" : "#4CAF50",
                    mb: 0.5,
                    fontSize: "14px",
                  }}
                >
                  {entry.role === "assistant"
                    ? "AI Interviewer"
                    : user?.username || "You"}
                  :
                </Typography>
                <Typography
                  sx={{
                    color: "#2B2B2B",
                    fontSize: "15px",
                    lineHeight: 1.6,
                  }}
                >
                  {entry.content}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Control Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mt: 3,
          flexWrap: "wrap",
        }}
      >
        {interviewState === "IDLE" && (
          <ButtonSelfScore
            text="Start Voice Interview"
            startIcon={<MicIcon />}
            onClick={startInterview}
            textStyle={{
              fontSize: "18px",
              fontWeight: 600,
            }}
            background="#E65100"
            borderRadius="12px"
            padding="16px 32px"
          />
        )}

        {interviewState === "LISTENING" && (
          <OutLineButton
            startIcon={<MicOffIcon />}
            onClick={stopListening}
            style={{
              minWidth: "200px",
              padding: "16px 32px",
              background: "#FFFFFF",
              color: "#E65100",
              border: "2px solid #E65100",
              borderRadius: "12px",
              fontSize: "16px",
            }}
          >
            Stop Listening
          </OutLineButton>
        )}

        {(interviewState === "SPEAKING" || interviewState === "PROCESSING") && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: "16px 32px",
            }}
          >
            <CircularProgress size={24} sx={{ color: "#E65100" }} />
            <Typography variant="body1" sx={{ color: "#666" }}>
              {interviewState === "SPEAKING"
                ? "AI is speaking..."
                : "Processing your response..."}
            </Typography>
          </Box>
        )}

        {interviewState === "COMPLETED" && !editMode && (
          <>
            <ButtonSelfScore
              text="Edit My Answers"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
              textStyle={{
                fontSize: "18px",
                fontWeight: 600,
              }}
              background="#FF9800"
              borderRadius="12px"
              padding="16px 32px"
            />
            <ButtonSelfScore
              text="Submit & Get Feedback"
              onClick={handleSubmitFinal}
              textStyle={{
                fontSize: "18px",
                fontWeight: 600,
              }}
              background="#4CAF50"
              borderRadius="12px"
              padding="16px 32px"
            />
          </>
        )}
      </Box>

      {/* Edit Answers Modal */}
      {editMode && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              p: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#2B2B2B",
                }}
              >
                Edit Your Answers
              </Typography>
              <IconButton onClick={() => setEditMode(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            {questions.map((question, index) => (
              <Box key={question.questionId} sx={{ mb: 4 }}>
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#2B2B2B",
                    mb: 2,
                  }}
                >
                  Question {index + 1}: {question.questionText}
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  value={editingAnswers[question.questionId] || ""}
                  onChange={(e) =>
                    handleEditAnswer(question.questionId, e.target.value)
                  }
                  placeholder="Your answer..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F7F7F7",
                      fontSize: "16px",
                    },
                  }}
                />
              </Box>
            ))}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
              }}
            >
              <OutLineButton
                onClick={() => setEditMode(false)}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                }}
              >
                Cancel
              </OutLineButton>
              <ButtonSelfScore
                text="Save Changes"
                startIcon={<SaveIcon />}
                onClick={handleSaveEdits}
                textStyle={{
                  fontSize: "16px",
                  fontWeight: 600,
                }}
                background="#4CAF50"
                borderRadius="8px"
                padding="12px 24px"
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Instructions */}
      {interviewState === "IDLE" && (
        <Box
          sx={{
            mt: 4,
            backgroundColor: "#F7F7F7",
            borderRadius: "12px",
            p: 3,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "18px",
              color: "#2B2B2B",
              mb: 2,
            }}
          >
            How it works:
          </Typography>
          <Typography
            component="ul"
            sx={{
              color: "#2B2B2B",
              fontSize: "16px",
              lineHeight: 2,
              pl: 3,
            }}
          >
            <li>
              The AI will ask you 8 questions about your life management skills
            </li>
            <li>Listen carefully to each question</li>
            <li>When the microphone activates, speak your answer clearly</li>
            <li>Take your time - there's no rush</li>
            <li>
              After all questions, you can edit your answers before submission
            </li>
            <li>You'll receive detailed AI-powered feedback</li>
          </Typography>
        </Box>
      )}
    </Box>
  );
}
