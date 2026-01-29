import { Server as WebSocketServer, WebSocket } from "ws";
import { Server as HTTPServer } from "http";
import sessionRegistry from "../services/sessionManager";
import deepgramService from "../services/deepgramService";
import geminiRealtimeService from "../services/geminiRealtimeService";
import { InterviewController } from "../lib/interviewController";
import { InterviewSession } from "../types/realtimeInterview.types";

/**
 * WebSocket handler for realtime audio streaming
 */
export function setupWebSocketServer(httpServer: HTTPServer): WebSocketServer {
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws/interview",
  });

  console.log("✅ WebSocket server initialized on /ws/interview");

  wss.on("connection", async (ws: WebSocket, req) => {
    console.log("🔌 New WebSocket connection attempt");

    // Extract sessionId from URL
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      console.error("❌ No sessionId provided in WebSocket connection");
      ws.close(1008, "Session ID required");
      return;
    }

    // Get session
    const session = sessionRegistry.getSession(sessionId);

    if (!session) {
      console.error(`❌ Session not found: ${sessionId}`);
      ws.close(1008, "Session not found or expired");
      return;
    }

    console.log(`✅ WebSocket connected for session: ${sessionId}`);

    // Store WebSocket connection in session
    session.wsConnection = ws;

    // Initialize Deepgram and Gemini connections
    try {
      console.log(`🔄 Initializing Deepgram for session: ${sessionId}`);
      await initializeDeepgram(session, ws);
      console.log(`✅ Deepgram initialized successfully`);

      console.log(`🔄 Initializing Gemini for session: ${sessionId}`);
      await initializeGemini(session, ws);
      console.log(`✅ Gemini initialized successfully`);
    } catch (error) {
      console.error("❌ Failed to initialize services:", error);
      sendControlMessage(ws, {
        type: "error",
        message: `Initialization failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      ws.close(1011, "Failed to initialize interview services");
      return;
    }

    // Create interview controller
    const controller = new InterviewController(session);

    // CHANGE 6: Send welcome message combined with first question
    const isNewInterview =
      session.currentQuestionIndex === 0 && session.answers.size === 0;
    const isResuming = session.answers.size > 0;

    if (session.geminiConnection) {
      if (isNewInterview) {
        // New interview - welcome + first question
        const firstQuestion = session.questions[0];
        const welcomeWithQuestion = {
          client_content: {
            turns: [
              {
                role: "user",
                parts: [
                  {
                    text: `Say this welcome message and then ask the first question (do not add anything else):

"Hello! Welcome to your Level 4 Life Assessment Interview. I'll be guiding you through a series of questions to better understand your life management skills. Please take your time with each answer and speak openly. Let's begin.

${firstQuestion.questionText}"

After asking this, stop speaking and wait for the user to respond.`,
                  },
                ],
              },
            ],
            turn_complete: true,
          },
        };

        session.geminiConnection.send(JSON.stringify(welcomeWithQuestion));
        console.log("👋 Sent welcome message + first question to Gemini");
      } else if (isResuming) {
        // Resuming interview - welcome back + current question
        const currentQuestion = session.questions[session.currentQuestionIndex];
        const resumeMessage = {
          client_content: {
            turns: [
              {
                role: "user",
                parts: [
                  {
                    text: `Say this welcome back message and then ask the current question (do not add anything else):

"Welcome back! Let's continue your Level 4 Life Assessment from where we left off. Here's the next question:

${currentQuestion.questionText}"

After asking this, stop speaking and wait for the user to respond.`,
                  },
                ],
              },
            ],
            turn_complete: true,
          },
        };

        session.geminiConnection.send(JSON.stringify(resumeMessage));
        console.log(
          "🔄 Sent welcome back message + current question to Gemini"
        );
      }
    }

    // Note: Silence detection is now handled by Deepgram's utterance_end event
    // This is more reliable than a manual timer

    // Track if audio has been received (for logging)
    let audioReceived = false;

    // Track user speech for interruption detection
    let userSpeechDetectionTimer: NodeJS.Timeout | null = null;
    let lastUserAudioTime = 0;
    const USER_SPEECH_THRESHOLD = 500; // 500ms of continuous audio = user is speaking

    // Global Deepgram keepalive - runs throughout the interview
    // Sends silent audio when user is NOT speaking to prevent timeout (10-12 sec timeout)
    const silentAudio = Buffer.alloc(3200); // 0.1 seconds of silence at 16kHz
    const deepgramKeepalive = setInterval(() => {
      // Send keepalive whenever user is NOT actively speaking
      // This prevents Deepgram timeout during: AI speaking, thinking pauses, idle time
      if (!session.isUserSpeaking && session.deepgramConnection) {
        const readyState = session.deepgramConnection.getReadyState?.();
        if (readyState === 1) {
          // 1 = OPEN
          deepgramService.sendAudio(session.deepgramConnection, silentAudio);
        } else if (readyState === 3) {
          // Connection closed - attempt to reconnect
          console.log(
            "🔄 Deepgram keepalive detected closed connection - reconnecting..."
          );
          initializeDeepgram(session, ws)
            .then(() => {
              console.log("✅ Deepgram reconnected via keepalive");
            })
            .catch((error) => {
              console.error(
                "❌ Failed to reconnect Deepgram via keepalive:",
                error
              );
            });
        }
      }
    }, 5000); // Send keepalive every 5 seconds (well before 10-12s timeout)

    // Handle incoming audio data
    ws.on("message", (data: Buffer) => {
      try {
        // More robust JSON detection: try to parse as JSON first
        let isJSON = false;
        let message: any = null;

        try {
          // Only try to parse if it looks like text (not binary audio)
          const str = data.toString("utf8");
          // Check if it starts and ends with { } and has reasonable length for JSON
          if (str.startsWith("{") && str.endsWith("}") && str.length < 10000) {
            message = JSON.parse(str);
            isJSON = true;
          }
        } catch {
          // Not JSON, treat as audio
          isJSON = false;
        }

        if (isJSON && message) {
          // Handle control message
          handleControlMessage(message, session, controller, ws);
        } else {
          // INTERRUPTION DETECTION: If AI is speaking and user starts speaking, interrupt
          if (session.isAISpeaking) {
            const now = Date.now();
            lastUserAudioTime = now;

            // Clear any existing timer
            if (userSpeechDetectionTimer) {
              clearTimeout(userSpeechDetectionTimer);
            }

            // Start timer to detect sustained user speech (prevents false positives from noise)
            userSpeechDetectionTimer = setTimeout(() => {
              // User has been speaking for 500ms - this is a real interruption
              if (session.isAISpeaking) {
                console.log("🛑 USER INTERRUPTION DETECTED - Stopping AI");

                // Stop AI speaking immediately
                session.isAISpeaking = false;

                // Clear audio queue on frontend
                sendControlMessage(ws, {
                  type: "clear_audio_queue",
                  reason: "user_interrupted",
                });

                // Notify frontend that AI stopped
                sendControlMessage(ws, {
                  type: "ai_speaking",
                  speaking: false,
                });

                // NOTE: Do NOT send interrupt signal to Gemini - it causes error 1007
                // Gemini will naturally stop when it detects user audio
                // Removed: geminiRealtimeService.sendInterruptSignal()
              }
            }, USER_SPEECH_THRESHOLD);

            // Still process the audio (for transcript and Gemini)
            // Don't return here - let it fall through
          }

          // Log first audio chunk to confirm audio is being received
          if (!audioReceived) {
            console.log(
              `🎤 First audio chunk received from frontend: ${data.length} bytes`
            );
            audioReceived = true;
          }

          // Audio data - send ONLY to Deepgram (for STT transcript)
          // We do NOT send to Gemini during user speech to prevent auto-responses
          // Gemini will only speak when explicitly instructed by the backend after analysis
          if (session.deepgramConnection) {
            const readyState = session.deepgramConnection.getReadyState?.();

            // Check if Deepgram connection is closed (state 3) - reconnect if needed
            if (readyState === 3) {
              console.log("🔄 Deepgram connection closed - reconnecting...");

              // Reinitialize Deepgram connection
              initializeDeepgram(session, ws)
                .then(() => {
                  console.log("✅ Deepgram reconnected successfully");
                  // Send the current audio chunk to the new connection
                  if (session.deepgramConnection) {
                    deepgramService.sendAudio(session.deepgramConnection, data);
                  }
                })
                .catch((error) => {
                  console.error("❌ Failed to reconnect Deepgram:", error);
                  sendControlMessage(ws, {
                    type: "error",
                    message:
                      "Speech recognition connection lost. Please refresh.",
                  });
                });
            } else if (readyState === 1) {
              // Connection is open - send audio normally
              deepgramService.sendAudio(session.deepgramConnection, data);
            } else {
              console.warn(
                `⚠️ Deepgram not ready - state: ${readyState} (1=OPEN, 0=CONNECTING, 2=CLOSING, 3=CLOSED)`
              );
            }
          } else {
            console.warn(
              `⚠️ No Deepgram connection available for session ${session.sessionId}`
            );

            // Attempt to initialize if connection doesn't exist
            console.log("🔄 Initializing new Deepgram connection...");
            initializeDeepgram(session, ws)
              .then(() => {
                console.log("✅ Deepgram initialized successfully");
                if (session.deepgramConnection) {
                  deepgramService.sendAudio(session.deepgramConnection, data);
                }
              })
              .catch((error) => {
                console.error("❌ Failed to initialize Deepgram:", error);
              });
          }

          // Update timing
          session.lastAudioTimestamp = Date.now();
          session.isUserSpeaking = true;
        }
      } catch (error) {
        console.error("❌ Error processing WebSocket message:", error);
      }
    });

    // Handle WebSocket close
    ws.on("close", async () => {
      console.log(`🔌 WebSocket closed for session: ${sessionId}`);

      // Stop Deepgram keepalive
      clearInterval(deepgramKeepalive);

      // Clear interruption timer
      if (userSpeechDetectionTimer) {
        clearTimeout(userSpeechDetectionTimer);
      }

      // Cleanup session
      await sessionRegistry.deleteSession(sessionId);
    });

    // Handle WebSocket errors
    ws.on("error", (error) => {
      console.error(`❌ WebSocket error for session ${sessionId}:`, error);
    });

    // Send initial message
    sendControlMessage(ws, {
      type: "connected",
      message: "Connected to interview session",
      sessionId,
    });

    // Initialize answer state for the first question (but don't display it yet)
    const stateMachine = new (
      await import("./interviewStateMachine")
    ).InterviewStateMachine(session);
    const firstQuestion = stateMachine.currentQuestion();

    if (firstQuestion) {
      // Initialize answer state for the first question
      session.answers.set(firstQuestion.questionId, {
        questionId: firstQuestion.questionId,
        transcript: "",
        confidence: 0,
        isComplete: false,
        isOffTopic: false,
        missingAspects: [],
        suggestedFollowUp: "",
        followUpAsked: false,
        followUpCount: 0,
        audioStartTime: Date.now(),
      });
      console.log(
        `✅ Initialized answer state for first question: ${firstQuestion.questionId}`
      );
      // Question will be displayed after Gemini speaks it (handled by initializeGemini)
    }
  });

  return wss;
}

/**
 * Initialize Deepgram connection for a session
 */
async function initializeDeepgram(
  session: InterviewSession,
  ws: WebSocket
): Promise<void> {
  const onTranscript = async (transcript: string, isFinal: boolean) => {
    // Check if user is asking to repeat the question
    const lowerTranscript = transcript.toLowerCase().trim();
    const isRepeatRequest =
      lowerTranscript.includes("repeat") &&
      (lowerTranscript.includes("question") ||
        lowerTranscript.includes("that"));

    if (isFinal && isRepeatRequest) {
      console.log(
        "🔄 User asked to repeat the question - re-asking current question"
      );

      // Send special message to frontend
      sendControlMessage(ws, {
        type: "transcript_final",
        transcript: "[Asked to repeat question]",
      });

      // Re-ask the current question
      const currentQuestion = session.questions[session.currentQuestionIndex];
      if (currentQuestion && session.geminiConnection) {
        await geminiRealtimeService.sendInstruction(session.geminiConnection, {
          type: "ask_question",
          content: currentQuestion.questionText,
        });
      }
      return; // Don't process this as a normal transcript
    }

    // Send transcript to client
    sendControlMessage(ws, {
      type: isFinal ? "transcript_final" : "transcript_interim",
      transcript,
    });

    // Handle in interview controller
    const controller = new InterviewController(session);
    controller.handleTranscript(transcript, isFinal);

    // If this is an utterance end (empty transcript + final), trigger analysis
    if (isFinal && transcript.trim().length === 0) {
      console.log("🔇 Utterance end detected - triggering silence handler...");

      // Mark that user stopped speaking
      session.isUserSpeaking = false;

      // Trigger analysis and decision-making
      await controller.handleSilence();
    }
  };

  const onError = (error: any) => {
    console.error("❌ Deepgram error:", error);
    sendControlMessage(ws, {
      type: "error",
      message: "Speech recognition error",
    });
  };

  const connection = await deepgramService.createLiveTranscription(
    session,
    onTranscript,
    onError
  );

  session.deepgramConnection = connection;
}

/**
 * Initialize Gemini connection for a session
 */
async function initializeGemini(
  session: InterviewSession,
  ws: WebSocket
): Promise<void> {
  const onAudioResponse = (audioData: Buffer) => {
    // Only send AI audio to frontend if AI is still supposed to be speaking
    if (ws.readyState === WebSocket.OPEN && session.isAISpeaking) {
      // Send as binary data (not JSON)
      ws.send(audioData);
      // console.log(`🔊 Sending AI audio to frontend: ${audioData.length} bytes`);
    } else if (!session.isAISpeaking) {
      console.log(
        `⏭️  Skipping AI audio chunk (interrupted): ${audioData.length} bytes`
      );
    }
  };

  const onError = (error: any) => {
    console.error("❌ Gemini error:", error);
    sendControlMessage(ws, {
      type: "error",
      message: "AI voice error",
    });
  };

  const connection = await geminiRealtimeService.createRealtimeConnection(
    session,
    onAudioResponse,
    onError
  );

  session.geminiConnection = connection;

  // Wait a moment for connection to stabilize
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log(`✅ Gemini connection ready for session: ${session.sessionId}`);

  // Note: Welcome message and first question are sent from main WebSocket handler
  // after the controller is created (see lines ~70-100)
}

/**
 * Handle control messages from client
 */
function handleControlMessage(
  message: any,
  session: InterviewSession,
  controller: InterviewController,
  ws: WebSocket
): void {
  console.log(`📨 Control message received:`, message.type);

  switch (message.type) {
    case "get_progress":
      const progress = controller.getProgress();
      sendControlMessage(ws, {
        type: "progress",
        data: progress,
      });
      break;

    case "skip_question":
      // Allow user to skip (mark as incomplete and move on)
      // Implementation depends on requirements
      console.log("⏭️  Skip request received");
      break;

    case "pause":
      session.isUserSpeaking = false;
      console.log("⏸️  Interview paused");
      // Note: Deepgram keepalive will continue running to prevent timeout
      break;

    case "resume":
      console.log("▶️  Interview resumed");

      // Check if Deepgram connection is still alive after resume
      if (session.deepgramConnection) {
        const readyState = session.deepgramConnection.getReadyState?.();
        if (readyState === 3) {
          console.log(
            "🔄 Deepgram connection closed during pause - will reconnect on next audio"
          );
        } else if (readyState === 1) {
          console.log("✅ Deepgram connection still active after resume");
        }
      }
      break;

    default:
      console.warn(`⚠️  Unknown control message type: ${message.type}`);
  }
}

/**
 * Send control message to client
 */
function sendControlMessage(ws: WebSocket, message: any): void {
  try {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  } catch (error) {
    console.error("❌ Error sending control message:", error);
  }
}