import { Server as WebSocketServer, WebSocket } from "ws";
import { Server as HTTPServer } from "http";
import { IncomingMessage } from "http";
import deepgramService from "../services/deepgramService";
import { verifyToken } from "./jwt";

// Environment check for logging
const isDev = process.env.NODE_ENV !== "production";
const log = isDev ? console.log.bind(console) : () => { };
const logError = console.error.bind(console); // Always log errors

/**
 * Lightweight WebSocket handler for transcription-only use cases
 * Used by Level4TextTest for voice-to-text functionality
 *
 * Protocol:
 * 1. Client connects with auth token → Server validates token
 * 2. Server initializes Deepgram → Waits for OPEN state
 * 3. Deepgram ready → Server sends { type: "ready" }
 * 4. Client starts sending audio (binary data)
 * 5. Server sends { type: "transcript_interim/final", transcript: "..." }
 * 6. Client sends { type: "stop_recording" } (JSON) when done
 * 7. Server waits for final transcripts, sends { type: "complete" }
 * 8. Client closes connection
 */
export function setupTranscriptionWebSocket(
    httpServer: HTTPServer
): WebSocketServer {
    // Use noServer mode to avoid conflicts with other WebSocket servers
    const wss = new WebSocketServer({ noServer: true });

    // Handle HTTP upgrade manually for /ws/transcribe path
    httpServer.on("upgrade", (request, socket, head) => {
        const pathname = new URL(
            request.url || "",
            `http://${request.headers.host}`
        ).pathname;

        if (pathname === "/ws/transcribe") {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit("connection", ws, request);
            });
        }
        // Let other paths be handled by other WebSocket servers
    });

    log("✅ Transcription WebSocket initialized on /ws/transcribe");

    wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
        log("🎤 New transcription connection");

        // ===== AUTHENTICATION =====
        try {
            const url = new URL(req.url || "", `http://${req.headers.host}`);
            const token = url.searchParams.get("token");

            if (!token) {
                logError("❌ No auth token provided for transcription");
                ws.send(
                    JSON.stringify({
                        type: "error",
                        message: "Authentication required. Please log in again.",
                    })
                );
                ws.close(1008, "Unauthorized");
                return;
            }

            // Verify the token
            try {
                const decoded = verifyToken(token);
                log(`✅ Authenticated user: ${decoded.email}`);
            } catch (tokenError: any) {
                logError("❌ Invalid auth token:", tokenError.message);
                ws.send(
                    JSON.stringify({
                        type: "error",
                        message: "Session expired. Please log in again.",
                    })
                );
                ws.close(1008, "Unauthorized");
                return;
            }
        } catch (authError) {
            logError("❌ Authentication error:", authError);
            ws.send(
                JSON.stringify({
                    type: "error",
                    message: "Authentication failed. Please try again.",
                })
            );
            ws.close(1008, "Unauthorized");
            return;
        }

        // ===== CONNECTION STATE =====
        let deepgramConnection: any = null;
        let isConnected = true;
        let isStopRequested = false;
        let lastTranscriptTime = 0;

        const sessionId = `transcribe-${Date.now()}`;
        const minimalSession = { sessionId } as any;

        // Function to send complete signal
        const sendComplete = () => {
            if (isConnected && ws.readyState === WebSocket.OPEN) {
                log("✅ Sending complete signal to client");
                ws.send(JSON.stringify({ type: "complete" }));
            }
        };

        // Function to check if we should send complete
        const checkAndSendComplete = () => {
            if (isStopRequested) {
                const timeSinceLastTranscript = Date.now() - lastTranscriptTime;
                if (timeSinceLastTranscript > 500) {
                    sendComplete();
                } else {
                    setTimeout(checkAndSendComplete, 500);
                }
            }
        };

        // ===== INITIALIZE DEEPGRAM =====
        try {
            deepgramConnection = await deepgramService.createLiveTranscription(
                minimalSession,
                // On transcript received
                (transcript: string, isFinal: boolean) => {
                    lastTranscriptTime = Date.now();

                    if (isConnected && ws.readyState === WebSocket.OPEN) {
                        ws.send(
                            JSON.stringify({
                                type: isFinal ? "transcript_final" : "transcript_interim",
                                transcript,
                            })
                        );

                        if (isStopRequested && isFinal) {
                            setTimeout(checkAndSendComplete, 500);
                        }
                    }
                },
                // On error
                (error: any) => {
                    logError("❌ Deepgram transcription error:", error);
                    if (isConnected && ws.readyState === WebSocket.OPEN) {
                        ws.send(
                            JSON.stringify({
                                type: "error",
                                message: "Voice recognition service error. Please try again.",
                            })
                        );
                    }
                }
            );

            // Wait for Deepgram to be fully ready
            let readyCheckAttempts = 0;
            const maxAttempts = 50; // 5 seconds max (50 * 100ms)

            const waitForReady = setInterval(() => {
                readyCheckAttempts++;

                if (deepgramConnection && deepgramConnection.getReadyState() === 1) {
                    clearInterval(waitForReady);
                    log("✅ Deepgram fully ready, sending ready signal to client");
                    ws.send(JSON.stringify({ type: "ready" }));
                } else if (readyCheckAttempts >= maxAttempts) {
                    clearInterval(waitForReady);
                    logError("❌ Deepgram connection timeout");
                    ws.send(
                        JSON.stringify({
                            type: "error",
                            message:
                                "Voice service is taking too long to respond. Please try again.",
                        })
                    );
                    ws.close();
                }
            }, 100);
        } catch (error) {
            logError("❌ Failed to initialize Deepgram:", error);
            ws.send(
                JSON.stringify({
                    type: "error",
                    message: "Failed to start voice recognition. Please try again later.",
                })
            );
            ws.close();
            return;
        }

        // ===== MESSAGE HANDLING =====
        ws.on("message", (data: Buffer | string) => {
            // Check if it's a JSON control message
            if (
                typeof data === "string" ||
                (Buffer.isBuffer(data) && data[0] === 123)
            ) {
                try {
                    const message = JSON.parse(data.toString());

                    if (message.type === "stop_recording") {
                        log("🛑 Stop recording requested, waiting for final transcripts...");
                        isStopRequested = true;
                        lastTranscriptTime = Date.now();

                        if (deepgramConnection) {
                            deepgramService.closeConnection(deepgramConnection);
                        }

                        setTimeout(checkAndSendComplete, 1000);
                    }
                    return;
                } catch (e) {
                    // Not JSON, treat as audio
                }
            }

            // It's audio data
            if (
                !isStopRequested &&
                deepgramConnection &&
                deepgramConnection.getReadyState() === 1
            ) {
                deepgramService.sendAudio(deepgramConnection, data as Buffer);
            }
        });

        // ===== CONNECTION CLOSE =====
        ws.on("close", () => {
            log("🔌 Transcription connection closed");
            isConnected = false;
            if (deepgramConnection) {
                deepgramService.closeConnection(deepgramConnection);
            }
        });

        // ===== ERROR HANDLING =====
        ws.on("error", (error) => {
            logError("❌ Transcription WebSocket error:", error);
            isConnected = false;
            if (deepgramConnection) {
                deepgramService.closeConnection(deepgramConnection);
            }
        });
    });

    return wss;
}
