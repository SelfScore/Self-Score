"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  // LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  // Paper,
  Chip,
  Avatar,
} from "@mui/material";
import { useRouter } from "next/navigation";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
// import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useAuth } from "@/hooks/useAuth";
import CallEndIcon from "@mui/icons-material/CallEnd";

interface Level4VoiceTestProps {
  onBack?: () => void;
  onSwitchMode?: () => void;
}

type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

interface TranscriptEntry {
  type: "interim" | "final" | "question";
  text: string;
  timestamp: number;
}

export default function Level4VoiceTest({
  onBack,
}: // onSwitchMode,
Level4VoiceTestProps) {
  const router = useRouter();
  const { user } = useAuth();

  // State management
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const [isRecording, setIsRecording] = useState(false);
  const [_currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(25);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCCEnabled, setIsCCEnabled] = useState(true);

  // Refs for WebSocket and MediaRecorder
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const aiAudioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const initializingRef = useRef<boolean>(false);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop =
        transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts]);

  // Define callback functions before useEffects that use them
  const addTranscript = useCallback(
    (type: TranscriptEntry["type"], text: string) => {
      setTranscripts((prev) => [
        ...prev,
        { type, text, timestamp: Date.now() },
      ]);
    },
    []
  );

  const stopAudioCapture = useCallback(() => {
    if (mediaRecorderRef.current) {
      const ref = mediaRecorderRef.current as any;

      // Disconnect audio nodes
      if (ref.source) {
        ref.source.disconnect();
      }
      if (ref.processor) {
        ref.processor.disconnect();
      }

      // Stop media stream tracks
      if (ref.stream) {
        ref.stream
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    setIsRecording(false);
  }, []);

  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    const audioContext = aiAudioContextRef.current;
    if (!audioContext) return;

    isPlayingRef.current = true;
    setIsAISpeaking(true);

    const audioBuffer = audioQueueRef.current.shift();
    if (!audioBuffer) {
      isPlayingRef.current = false;
      setIsAISpeaking(false);
      return;
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    source.onended = () => {
      console.log("🎵 Audio chunk finished");
      isPlayingRef.current = false;

      // Check if there are more chunks to play
      if (audioQueueRef.current.length > 0) {
        playNextAudio();
      } else {
        setIsAISpeaking(false);
        console.log("🎤 AI finished speaking");
      }
    };

    console.log("▶️ Playing audio chunk...");
    source.start();
  }, []);

  const playAIAudio = useCallback(
    async (arrayBuffer: ArrayBuffer) => {
      try {
        console.log("🎵 Attempting to play AI audio...");

        if (!aiAudioContextRef.current) {
          aiAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
          console.log("🎵 Audio context created with sample rate: 24000");
        }

        const audioContext = aiAudioContextRef.current;

        // Resume context if suspended (browser autoplay policy)
        if (audioContext.state === "suspended") {
          await audioContext.resume();
          console.log("🎵 Audio context resumed");
        }

        console.log("🎵 Processing raw PCM audio data...");

        // Gemini sends raw PCM data (16-bit signed integers)
        // We need to convert it to Float32Array for Web Audio API
        const int16Array = new Int16Array(arrayBuffer);
        const numSamples = int16Array.length;

        console.log(
          `📊 Samples: ${numSamples}, Duration: ${(numSamples / 24000).toFixed(
            2
          )}s`
        );

        // Create AudioBuffer manually
        const audioBuffer = audioContext.createBuffer(1, numSamples, 24000);
        const channelData = audioBuffer.getChannelData(0);

        // Convert Int16 to Float32 (normalize from -32768/32767 to -1.0/1.0)
        for (let i = 0; i < numSamples; i++) {
          channelData[i] = int16Array[i] / 32768.0;
        }

        console.log(
          "✅ Audio buffer created successfully. Duration:",
          audioBuffer.duration.toFixed(2),
          "seconds"
        );

        // Add to queue instead of playing immediately
        audioQueueRef.current.push(audioBuffer);
        console.log(
          `📥 Added to queue. Queue length: ${audioQueueRef.current.length}`
        );

        // Start playing if not already playing
        playNextAudio();
      } catch (error) {
        console.error("❌ Error playing AI audio:", error);
        setIsAISpeaking(false);
      }
    },
    [playNextAudio]
  );

  const handleInterviewComplete = useCallback(() => {
    stopAudioCapture();
    setShowEndDialog(true);
  }, [stopAudioCapture]);

  const handleWebSocketMessage = useCallback(
    (message: any) => {
      console.log("📨 WebSocket message received:", message);
      switch (message.type) {
        case "connected":
          console.log("✅ WebSocket connected:", message.message);
          setConnectionState("connected");
          break;

        case "transcript_interim":
          addTranscript("interim", message.transcript);
          break;

        case "transcript_final":
          addTranscript("final", message.transcript);
          break;

        case "progress":
          setCurrentQuestionNumber(message.currentQuestion);
          setTotalQuestions(message.totalQuestions);
          break;

        case "ai_speaking":
          setIsAISpeaking(message.speaking);
          // If AI stopped speaking, also clear audio queue
          if (!message.speaking) {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            console.log("🔇 AI stopped speaking - audio queue cleared");
          }
          break;

        case "ai_processing":
          console.log("💭 AI is analyzing response...");
          setIsProcessing(true);
          break;

        case "clear_audio_queue":
          console.log("🛑 Clearing audio queue - user interrupted");
          audioQueueRef.current = [];
          isPlayingRef.current = false;
          setIsAISpeaking(false);
          break;

        case "next_question":
          setIsProcessing(false);
          setCurrentQuestion(message.questionText);
          addTranscript(
            "question",
            `Question ${message.questionNumber}: ${message.questionText}`
          );
          break;

        case "follow_up":
          setIsProcessing(false);
          if (message.questionText) {
            addTranscript("question", `Follow-up: ${message.questionText}`);
          }
          break;

        case "redirect":
          setIsProcessing(false);
          if (message.message) {
            addTranscript("question", `Redirect: ${message.message}`);
          }
          break;

        case "interview_complete":
          handleInterviewComplete();
          break;

        case "error":
          console.error("❌ Server error:", message.message);
          setError(message.message);
          setConnectionState("error");
          break;

        default:
          console.log("⚠️ Unknown message type:", message.type);
      }
    },
    [addTranscript, handleInterviewComplete]
  );

  const startAudioCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      // Create AudioContext for processing
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);

          // Convert Float32Array to Int16Array (PCM)
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          // Send as raw PCM buffer
          wsRef.current.send(pcmData.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Store references for cleanup
      mediaRecorderRef.current = { stream, processor, source } as any;

      setIsRecording(true);
    } catch (err: any) {
      console.error("Failed to capture audio:", err);
      setError("Failed to access microphone");
    }
  }, []);

  // Initialize interview session
  useEffect(() => {
    const startSession = async () => {
      // Prevent duplicate initialization (React Strict Mode)
      if (initializingRef.current || sessionId) {
        console.log("⏭️ Skipping duplicate session initialization");
        return;
      }

      initializingRef.current = true;

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        const response = await fetch(
          `${API_URL}/api/realtime-interview/start`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ userId: user?.userId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to start interview session");
        }

        const data = await response.json();
        console.log("✅ Interview session started:", data);

        // The response structure is: { success: true, data: { sessionId, interviewId, ... } }
        if (data.success && data.data) {
          setSessionId(data.data.sessionId);
          setTotalQuestions(data.data.totalQuestions);
          console.log("📝 SessionId set:", data.data.sessionId);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err: any) {
        console.error("❌ Failed to start session:", err);
        setError(err.message || "Failed to start interview");
        setConnectionState("error");
        initializingRef.current = false;
      }
    };

    if (user && !sessionId && !initializingRef.current) {
      startSession();
    }
  }, [user, sessionId]);

  // Connect WebSocket when sessionId is ready
  useEffect(() => {
    if (!sessionId) return;

    console.log(
      "🔌 Attempting WebSocket connection with sessionId:",
      sessionId
    );
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5001";
    const wsUrl = `${WS_URL}/ws/interview?sessionId=${sessionId}`;
    console.log("🔌 WebSocket URL:", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnectionState("connected");
      startAudioCapture();
    };

    ws.onmessage = async (event) => {
      try {
        // Check if it's binary data (AI audio) or text (JSON)
        if (event.data instanceof Blob) {
          // Binary audio from AI
          console.log("🔊 Received audio blob:", event.data.size, "bytes");
          const arrayBuffer = await event.data.arrayBuffer();
          console.log(
            "🔊 Converting to ArrayBuffer:",
            arrayBuffer.byteLength,
            "bytes"
          );
          await playAIAudio(arrayBuffer);
        } else {
          // JSON control message
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        }
      } catch (err) {
        console.error("Failed to process WebSocket message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      // Only set error state if we're not already connected
      // (React Strict Mode can cause duplicate connection attempts)
      if (connectionState !== "connected") {
        setConnectionState("error");
        setError(
          "Failed to establish voice connection. Please check your network and try again."
        );
      }
    };

    ws.onclose = (event) => {
      console.log(
        "🔌 WebSocket disconnected. Code:",
        event.code,
        "Reason:",
        event.reason
      );
      setConnectionState("disconnected");
      if (event.code !== 1000 && event.code !== 1005) {
        // Abnormal closure
        setError(`Connection closed: ${event.reason || "Unknown reason"}`);
      }
      stopAudioCapture();
    };

    return () => {
      // Only close if the connection is actually open
      // This prevents React Strict Mode from prematurely closing valid connections
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        console.log("🧹 Cleaning up WebSocket connection");
        ws.close();
        stopAudioCapture();
      }
    };
  }, [
    sessionId,
    handleWebSocketMessage,
    startAudioCapture,
    stopAudioCapture,
    playAIAudio,
  ]);

  const toggleRecording = () => {
    if (isRecording) {
      stopAudioCapture();
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "pause" }));
      }
    } else {
      startAudioCapture();
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "resume" }));
      }
    }
  };

  const handleEndInterview = () => {
    setShowEndDialog(true);
  };

  const confirmEndInterview = async () => {
    setIsCompleting(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      await fetch(`${API_URL}/api/realtime-interview/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });

      wsRef.current?.close();
      router.push("/user/dashboard");
    } catch (err: any) {
      console.error("Failed to complete interview:", err);
      setError("Failed to complete interview");
    } finally {
      setIsCompleting(false);
      setShowEndDialog(false);
    }
  };

  // const progress =
  //   totalQuestions > 0 ? (currentQuestionNumber / totalQuestions) * 100 : 0;

  return (
    <Box
      sx={{
        minHeight: "50vh",
        bgcolor: "#F5F5F5",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        width: "91%",
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #E0E0E0",
          px: 3,
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {onBack && (
              <IconButton
                onClick={onBack}
                sx={{
                  color: "#E8EAED",
                  "&:hover": { bgcolor: "rgba(232, 234, 237, 0.08)" },
                }}
              >
                <ArrowBackIosIcon />
              </IconButton>
            )}
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "20px", md: "24px" },
                  fontWeight: "700",
                  color: "#1A1A1A",
                  mb: 0.5,
                }}
              >
                Level 5: AI Voice Interview
              </Typography>
              {/* <Typography
                sx={{
                  fontSize: { xs: "13px", md: "14px" },
                  color: "#666666",
                }}
              >
                Question {currentQuestionNumber} of {totalQuestions}
              </Typography> */}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* <Typography
              sx={{
                fontSize: { xs: "13px", md: "14px" },
                color: "#666666",
                fontWeight: 500,
              }}
            >
              {Math.round(progress)}% Complete
            </Typography> */}

            {/* {onSwitchMode && (
              <Button
                variant="outlined"
                startIcon={<SwapHorizIcon />}
                onClick={onSwitchMode}
                sx={{
                  borderColor: "#005F73",
                  color: "#005F73",
                  fontSize: "13px",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#004A5A",
                    bgcolor: "rgba(0, 95, 115, 0.08)",
                  },
                }}
              >
                Switch to Text
              </Button>
            )} */}
          </Box>
        </Box>

        {/* Progress Bar */}
        {/* <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mt: 1.5,
            height: 6,
            borderRadius: 3,
            bgcolor: "#E0E0E0",
            "& .MuiLinearProgress-bar": {
              bgcolor: "#E87A42",
              borderRadius: 3,
            },
          }}
        /> */}
      </Box>

      {/* Error Alert */}
      {error && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{
              bgcolor: "rgba(211, 47, 47, 0.1)",
              color: "#D32F2F",
              "& .MuiAlert-icon": { color: "#D32F2F" },
            }}
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Main Video Grid */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 4 },
          gap: { xs: 2, md: 3 },
          flexDirection: { xs: "column", md: "row" },
          flex: 1,
        }}
      >
        {/* AI Interviewer Tile */}
        <Box
          sx={{
            position: "relative",
            width: { xs: "100%", md: "calc(50% - 12px)" },
            height: { xs: "186px", md: "330px" },
            maxHeight: "500px",
            background: "linear-gradient(135deg, #3b5998 0%, #192f6a 100%)",
            borderRadius: { xs: 2, md: 3 },
            overflow: "hidden",
            border: isAISpeaking ? "3px solid #005F73" : "none",
            transition: "border 0.3s ease",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {/* Video Content */}
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Avatar
              sx={{
                width: { xs: 120, md: 160 },
                height: { xs: 120, md: 160 },
                bgcolor: "rgba(66, 133, 244, 0.9)",
                animation: isAISpeaking
                  ? "pulse 1.5s ease-in-out infinite"
                  : "none",
                "@keyframes pulse": {
                  "0%, 100%": {
                    transform: "scale(1)",
                    boxShadow: "0 0 0 0 rgba(66, 133, 244, 0.7)",
                  },
                  "50%": {
                    transform: "scale(1.05)",
                    boxShadow: "0 0 0 30px rgba(66, 133, 244, 0)",
                  },
                },
              }}
            >
              <SmartToyIcon
                sx={{ fontSize: { xs: 60, md: 80 }, color: "white" }}
              />
            </Avatar>

            {/* Status Badge on Avatar */}
            {isProcessing && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: "35%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CircularProgress
                  size={16}
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                />
                <CircularProgress
                  size={16}
                  sx={{ color: "rgba(255,255,255,0.5)" }}
                />
                <CircularProgress
                  size={16}
                  sx={{ color: "rgba(255,255,255,0.3)" }}
                />
              </Box>
            )}
          </Box>

          {/* Name Tag - Bottom Left */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              bgcolor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <SmartToyIcon sx={{ fontSize: 18, color: "white" }} />
            <Typography
              sx={{
                color: "white",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              AI Interviewer
            </Typography>
          </Box>
        </Box>

        {/* User Tile */}
        <Box
          sx={{
            position: "relative",
            width: { xs: "100%", md: "calc(50% - 12px)" },
            height: { xs: "186px", md: "330px" },
            maxHeight: "500px",
            bgcolor: "#2C2C2E",
            borderRadius: { xs: 2, md: 3 },
            overflow: "hidden",
            border: isRecording ? "3px solid #E87A42" : "none",
            transition: "border 0.3s ease",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {/* Video Content */}
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar
              sx={{
                width: { xs: 120, md: 160 },
                height: { xs: 120, md: 160 },
                bgcolor: "#E87A42",
              }}
            >
              <PersonIcon
                sx={{ fontSize: { xs: 60, md: 80 }, color: "white" }}
              />
            </Avatar>
          </Box>

          {/* Name Tag - Bottom Left */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              bgcolor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <PersonIcon sx={{ fontSize: 18, color: "white" }} />
            <Typography
              sx={{
                color: "white",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              You ({user?.username || "Guest"})
            </Typography>
          </Box>

          {/* LIVE Indicator - Top Right */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
            }}
          >
            <Chip
              label="LIVE"
              size="small"
              sx={{
                bgcolor: "#E87A42",
                color: "white",
                fontWeight: 700,
                fontSize: "11px",
                height: 24,
                animation: isRecording
                  ? "pulse 2s ease-in-out infinite"
                  : "none",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.7 },
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Live Captions */}
      <Box
        sx={{
          mx: "auto",
          width: { xs: "calc(100% - 32px)", md: "95%" },
          maxWidth: "100%",
          maxHeight: { xs: "100px", md: "120px" },
          overflowY: "auto",
          bgcolor: "#5E5E5E",
          backdropFilter: "blur(10px)",
          borderRadius: 2,
          p: 2.5,
          display: transcripts.length > 0 && isCCEnabled ? "flex" : "none",
          flexDirection: "column",
          gap: 1.5,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          mb: 3,
          // Custom scrollbar
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(255, 255, 255, 0.3)",
            borderRadius: "3px",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.5)",
            },
          },
        }}
        ref={transcriptContainerRef}
      >
        {transcripts.map((entry, index) => {
          const isAIMessage = entry.type === "question";
          const speakerName = isAIMessage ? "AI INTERVIEW" : "You";

          return (
            <Box key={index} sx={{ mb: 0 }}>
              <Typography
                sx={{
                  color: "white",
                  fontSize: { xs: "14px", md: "16px" },
                  lineHeight: 1.5,
                  opacity: entry.type === "interim" ? 0.7 : 1,
                  fontStyle: entry.type === "interim" ? "italic" : "normal",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 700,
                    color: isAIMessage ? "#4285F4" : "#E87A42",
                    mr: 1,
                  }}
                >
                  {speakerName}:
                </Typography>
                {entry.text}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Control Bar */}
      <Box
        sx={{
          bgcolor: "transparent",
          // borderTop: "1px solid #333333",
          py: 3,
          px: 3,
          mt: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            bgcolor: "#242831",
            py: 2,
            px: 3,
            height: { xs: "68px", md: "68px" },
            borderRadius: "7199.28px",
            width: { xs: "100%", md: "fit-content" },
            mx: "auto",
          }}
        >
          {/* Microphone Button */}
          <IconButton
            onClick={toggleRecording}
            disabled={connectionState !== "connected"}
            sx={{
              width: { xs: 48, md: 48 },
              height: { xs: 48, md: 48 },
              bgcolor: "#374151",
              color: "white",
              borderRadius: "50%",
              "&:disabled": {
                bgcolor: "#374151",
                // color: "#666666",
              },
              transition: "all 0.2s ease",
            }}
          >
            {isRecording ? (
              <MicIcon sx={{ fontSize: { xs: 26, md: 18 }, color: "white" }} />
            ) : (
              <MicOffIcon
                sx={{ fontSize: { xs: 26, md: 24 }, color: "white" }}
              />
            )}
          </IconButton>

          {/* End Call Button */}
          <IconButton
            onClick={handleEndInterview}
            disabled={connectionState !== "connected"}
            sx={{
              width: { xs: 48, md: 65 },
              height: { xs: 48, md: 48 },
              bgcolor: "#DC2626",
              color: "white",
              borderRadius: "7199.28px",
              "&:hover": {
                bgcolor: "#B71C1C",
              },
              "&:disabled": {
                bgcolor: "#DC2626",
                color: "#666666",
              },
            }}
          >
            <CallEndIcon
              sx={{ fontSize: { xs: 26, md: 28 }, color: "white" }}
            />
          </IconButton>

          {/* CC Button */}
          <IconButton
            onClick={() => setIsCCEnabled(!isCCEnabled)}
            sx={{
              width: { xs: 48, md: 48 },
              height: { xs: 48, md: 48 },
              bgcolor: isCCEnabled ? "#4A90E2" : "#3A3B3D",
              color: "white",
              borderRadius: "50%",
              "&:hover": {
                bgcolor: isCCEnabled ? "#357ABD" : "#4A4B4D",
              },
              transition: "all 0.2s ease",
            }}
          >
            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
              CC
            </Typography>
          </IconButton>
        </Box>
      </Box>

      {/* End Interview Dialog */}
      <Dialog
        open={showEndDialog}
        onClose={() => !isCompleting && setShowEndDialog(false)}
      >
        <DialogTitle>End Interview</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to end the interview? Your progress will be
            saved.
          </Typography>
          {currentQuestionNumber < totalQuestions && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You have only completed {currentQuestionNumber} out of{" "}
              {totalQuestions} questions.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowEndDialog(false)}
            disabled={isCompleting}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmEndInterview}
            variant="contained"
            color="error"
            disabled={isCompleting}
          >
            {isCompleting ? <CircularProgress size={24} /> : "End Interview"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
