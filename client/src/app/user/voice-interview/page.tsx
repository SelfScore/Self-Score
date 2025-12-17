"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
} from "@mui/material";
import {
    Mic,
    MicOff,
    Phone,
    PhoneDisabled,
    VolumeUp,
} from "@mui/icons-material";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import {
    voiceInterviewService,
    VoiceInterviewStatus,
} from "../../../services/voiceInterviewService";

type InterviewPhase =
    | "IDLE"
    | "CONNECTING"
    | "READY"
    | "ACTIVE"
    | "COMPLETING"
    | "COMPLETED"
    | "ERROR";

export default function VoiceInterviewPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    // State
    const [phase, setPhase] = useState<InterviewPhase>("IDLE");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [status, setStatus] = useState<VoiceInterviewStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isMicActive, setIsMicActive] = useState(false);
    const [isAISpeaking, setIsAISpeaking] = useState(false);

    // Refs
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/signin");
        }
    }, [isAuthenticated, router]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            // End session if active
            if (sessionId && phase !== "COMPLETED" && phase !== "IDLE") {
                voiceInterviewService.endSession(sessionId, "abandoned");
            }
        };
    }, [sessionId, phase]);

    // Poll for status updates
    const startStatusPolling = useCallback((sid: string) => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        pollingIntervalRef.current = setInterval(async () => {
            const response = await voiceInterviewService.getStatus(sid);
            if (response.success && response.data) {
                setStatus(response.data);

                // Update phase based on backend status
                if (response.data.phase === "COMPLETED") {
                    setPhase("COMPLETED");
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                    }
                } else if (response.data.phase === "ACTIVE") {
                    setPhase("ACTIVE");
                } else if (response.data.phase === "READY") {
                    setPhase("READY");
                }
            }
        }, 2000);
    }, []);

    // Start a new interview session
    const handleStartSession = async () => {
        if (!user?.userId) {
            setError("User not authenticated");
            return;
        }

        setPhase("CONNECTING");
        setError(null);

        const response = await voiceInterviewService.startSession(user.userId);

        if (response.success && response.data) {
            setSessionId(response.data.sessionId);
            setStatus(response.data.status);
            setPhase("READY");
            startStatusPolling(response.data.sessionId);
        } else {
            setError(response.message || "Failed to start session");
            setPhase("ERROR");
        }
    };

    // Begin the actual interview
    const handleBeginInterview = async () => {
        if (!sessionId) return;

        setPhase("CONNECTING");

        // Request microphone permission
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsMicActive(true);
        } catch (err) {
            setError("Microphone access is required for the voice interview");
            setPhase("READY");
            return;
        }

        const response = await voiceInterviewService.beginInterview(sessionId);

        if (response.success) {
            setPhase("ACTIVE");
        } else {
            setError(response.message || "Failed to begin interview");
            setPhase("ERROR");
        }
    };

    // End the interview
    const handleEndInterview = async () => {
        if (!sessionId) return;

        setPhase("COMPLETING");

        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        const response = await voiceInterviewService.endSession(
            sessionId,
            "completed"
        );

        if (response.success) {
            setPhase("COMPLETED");
            setIsMicActive(false);
        } else {
            setError(response.message || "Failed to end interview");
            setPhase("ERROR");
        }
    };

    // Reset to start a new interview
    const handleReset = () => {
        setPhase("IDLE");
        setSessionId(null);
        setStatus(null);
        setError(null);
        setIsMicActive(false);
        setIsAISpeaking(false);
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    borderRadius: 4,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    minHeight: "60vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* Header */}
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Voice Interview
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                    AI-powered interview experience
                </Typography>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, width: "100%", maxWidth: 400 }}>
                        {error}
                    </Alert>
                )}

                {/* Status Display */}
                <Box
                    sx={{
                        mb: 4,
                        p: 3,
                        borderRadius: 3,
                        backgroundColor: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        width: "100%",
                        maxWidth: 400,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
                        Status
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {phase === "IDLE" && "Ready to Start"}
                        {phase === "CONNECTING" && "Connecting..."}
                        {phase === "READY" && "Session Ready - Click Begin"}
                        {phase === "ACTIVE" && "Interview in Progress"}
                        {phase === "COMPLETING" && "Ending Interview..."}
                        {phase === "COMPLETED" && "Interview Completed"}
                        {phase === "ERROR" && "Error Occurred"}
                    </Typography>

                    {status && phase === "ACTIVE" && (
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                            Question {status.currentQuestionIndex + 1} of{" "}
                            {status.totalQuestions}
                        </Typography>
                    )}
                </Box>

                {/* Microphone Indicator */}
                {phase === "ACTIVE" && (
                    <Box
                        sx={{
                            mb: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <IconButton
                                sx={{
                                    width: 80,
                                    height: 80,
                                    backgroundColor: isMicActive
                                        ? "rgba(76, 175, 80, 0.3)"
                                        : "rgba(255, 255, 255, 0.1)",
                                    "&:hover": {
                                        backgroundColor: isMicActive
                                            ? "rgba(76, 175, 80, 0.4)"
                                            : "rgba(255, 255, 255, 0.2)",
                                    },
                                }}
                            >
                                {isMicActive ? (
                                    <Mic sx={{ fontSize: 40, color: "#4CAF50" }} />
                                ) : (
                                    <MicOff sx={{ fontSize: 40, color: "#f44336" }} />
                                )}
                            </IconButton>
                            <Typography variant="caption" sx={{ mt: 1 }}>
                                {isMicActive ? "Mic Active" : "Mic Off"}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <IconButton
                                sx={{
                                    width: 80,
                                    height: 80,
                                    backgroundColor: isAISpeaking
                                        ? "rgba(33, 150, 243, 0.3)"
                                        : "rgba(255, 255, 255, 0.1)",
                                }}
                            >
                                <VolumeUp
                                    sx={{
                                        fontSize: 40,
                                        color: isAISpeaking ? "#2196F3" : "white",
                                    }}
                                />
                            </IconButton>
                            <Typography variant="caption" sx={{ mt: 1 }}>
                                {isAISpeaking ? "AI Speaking" : "AI Silent"}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                    {phase === "IDLE" && (
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleStartSession}
                            startIcon={<Phone />}
                            sx={{
                                backgroundColor: "white",
                                color: "#667eea",
                                fontWeight: 600,
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                "&:hover": {
                                    backgroundColor: "rgba(255,255,255,0.9)",
                                },
                            }}
                        >
                            Start Interview
                        </Button>
                    )}

                    {phase === "CONNECTING" && (
                        <CircularProgress sx={{ color: "white" }} />
                    )}

                    {phase === "READY" && (
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleBeginInterview}
                            startIcon={<Mic />}
                            sx={{
                                backgroundColor: "#4CAF50",
                                color: "white",
                                fontWeight: 600,
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                "&:hover": {
                                    backgroundColor: "#45a049",
                                },
                            }}
                        >
                            Begin Interview
                        </Button>
                    )}

                    {phase === "ACTIVE" && (
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleEndInterview}
                            startIcon={<PhoneDisabled />}
                            sx={{
                                backgroundColor: "#f44336",
                                color: "white",
                                fontWeight: 600,
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                "&:hover": {
                                    backgroundColor: "#d32f2f",
                                },
                            }}
                        >
                            End Interview
                        </Button>
                    )}

                    {phase === "COMPLETING" && (
                        <CircularProgress sx={{ color: "white" }} />
                    )}

                    {(phase === "COMPLETED" || phase === "ERROR") && (
                        <>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleReset}
                                sx={{
                                    backgroundColor: "white",
                                    color: "#667eea",
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    "&:hover": {
                                        backgroundColor: "rgba(255,255,255,0.9)",
                                    },
                                }}
                            >
                                Start New Interview
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => router.push("/user/dashboard")}
                                sx={{
                                    borderColor: "white",
                                    color: "white",
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    "&:hover": {
                                        borderColor: "white",
                                        backgroundColor: "rgba(255,255,255,0.1)",
                                    },
                                }}
                            >
                                Back to Dashboard
                            </Button>
                        </>
                    )}
                </Box>

                {/* Instructions */}
                {phase === "IDLE" && (
                    <Box sx={{ mt: 4, textAlign: "center", opacity: 0.8 }}>
                        <Typography variant="body2">
                            Click "Start Interview" to begin your AI-powered voice interview.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            You will need to grant microphone access.
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    );
}
