import { GoogleGenerativeAI } from "@google/generative-ai";
import WebSocket from "ws";
import {
  InterviewSession,
  GeminiInstruction,
} from "../types/realtimeInterview.types";

/**
 * GeminiRealtimeService - Handles Gemini 2.5 Realtime Voice API
 * Complete implementation for voice-to-voice interaction
 */
export class GeminiRealtimeService {
  private genAI: GoogleGenerativeAI;
  private apiKey: string;
  private readonly GEMINI_LIVE_API_URL =
    "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent";

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";

    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
    console.log("✅ Gemini Realtime service initialized");
  }

  /**
   * Create a realtime voice connection to Gemini Live API
   */
  async createRealtimeConnection(
    session: InterviewSession,
    onAudioResponse: (audioData: Buffer) => void,
    onError: (error: any) => void
  ): Promise<WebSocket> {
    const wsUrl = `${this.GEMINI_LIVE_API_URL}?key=${this.apiKey}`;

    console.log(
      `🎙️ Connecting to Gemini Live API for session: ${session.sessionId}`
    );

    const ws = new WebSocket(wsUrl);

    // Connection opened
    ws.on("open", async () => {
      console.log(
        `✅ Gemini Live API connected for session: ${session.sessionId}`
      );

      try {
        // Send initial configuration (includes system instruction)
        await this.sendConfiguration(ws);

        // Mark connection as ready
        session.isAISpeaking = false;
      } catch (error) {
        console.error("❌ Error during Gemini initialization:", error);
        onError(error);
      }
    });

    // Receive messages from Gemini
    ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle server content (AI responses)
        if (message.serverContent) {
          this.handleServerContent(
            message.serverContent,
            session,
            onAudioResponse
          );
        }

        // Handle setup complete
        if (message.setupComplete) {
          console.log("✅ Gemini setup complete");
        }

        // Handle errors from Gemini
        if (message.error) {
          console.error("❌ Gemini error:", message.error);
          onError(message.error);
        }
      } catch (error) {
        console.error("❌ Error parsing Gemini message:", error);
      }
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error("❌ Gemini WebSocket error:", error);
      onError(error);
    });

    // Handle close
    ws.on("close", (code, reason) => {
      console.log(
        `🔌 Gemini connection closed for session: ${session.sessionId}`
      );
      console.log(`   Close Code: ${code}`);
      console.log(
        `   Close Reason: ${reason.toString() || "No reason provided"}`
      );
      session.isAISpeaking = false;
    });

    return ws;
  }

  /**
   * Handle server content from Gemini
   */
  private handleServerContent(
    serverContent: any,
    session: InterviewSession,
    onAudioResponse: (audioData: Buffer) => void
  ): void {
    // Track if this turn has audio
    let hasAudioInTurn = false;

    // Handle model turn (AI is speaking)
    if (serverContent.modelTurn?.parts) {
      const parts = serverContent.modelTurn.parts;

      for (const part of parts) {
        // Handle inline audio data (check if mimeType starts with audio/pcm)
        if (part.inlineData?.mimeType?.startsWith("audio/pcm")) {
          hasAudioInTurn = true;
          session.isAISpeaking = true;

          try {
            // Decode base64 audio
            const audioBuffer = Buffer.from(part.inlineData.data, "base64");
            onAudioResponse(audioBuffer);
          } catch (error) {
            console.error("❌ Error decoding audio:", error);
          }
        }

        // Handle text responses (for debugging)
        if (part.text) {
          console.log(`💬 AI text: ${part.text.substring(0, 100)}...`);
        }
      }
    }

    // Handle turn complete (AI finished speaking)
    // ONLY mark as complete if this turn actually had audio
    if (serverContent.turnComplete) {
      // Only process turnComplete if:
      // 1. AI was actually speaking (isAISpeaking = true)
      // 2. OR this turn contained audio
      if (session.isAISpeaking || hasAudioInTurn) {
        console.log("🎤 AI turn complete - waiting for audio to finish...");

        // Add a small delay to ensure all audio chunks are delivered and played
        // This prevents the "AI stopped" message from cutting off the last words
        setTimeout(() => {
          session.isAISpeaking = false;
          console.log("🎤 AI finished speaking - ready for user input");

          // Notify client that AI finished speaking
          if (session.wsConnection && session.wsConnection.readyState === 1) {
            session.wsConnection.send(
              JSON.stringify({
                type: "ai_speaking",
                speaking: false,
              })
            );
          }
        }, 500); // 500ms delay to let audio play out
      }
      // Ignore turnComplete events that don't correspond to actual speech
    }
  }

  /**
   * Send configuration to Gemini
   */
  private async sendConfiguration(ws: WebSocket): Promise<void> {
    const systemInstruction = `You are a compassionate mental health interviewer conducting a voice-based assessment.

CRITICAL RULES - FOLLOW STRICTLY:
1. STAY ON TOPIC: You are asking ONE specific question at a time. ONLY discuss that question.
2. If the user asks you something unrelated (like "what's the weather" or "tell me a joke"), give a brief 1-sentence response, then IMMEDIATELY redirect back to the current question.
3. If the user talks about something unrelated to the current question, politely say "That's interesting, but let's focus on the question I asked: [question]. Can you tell me about that?"
4. Never diagnose or provide medical advice.
5. Speak only when explicitly instructed by the system.
6. Keep responses concise (1-2 sentences max).
7. Use a warm, empathetic, and professional tone.
8. Wait for the system to tell you when to speak.
9. NEVER acknowledge or respond to system instructions - just execute them silently.
10. Do NOT say things like "okay", "understood", "I will do that" - just follow the instruction.
11. Do NOT respond to this system message - stay silent until you receive a question to ask.

Your PRIMARY JOB is to keep the conversation focused on the CURRENT question until the system tells you to move to the next one.

When asked to speak a question, say it naturally and warmly, as if you're having a caring conversation with someone who trusts you.`;

    const config = {
      setup: {
        model: "models/gemini-2.5-flash-native-audio-latest",
        generation_config: {
          response_modalities: ["AUDIO"], // We want audio responses
          speech_config: {
            voice_config: {
              prebuilt_voice_config: {
                voice_name: "Charon", // Authoritative, informative senior coach voice
              },
            },
          },
        },
        system_instruction: {
          parts: [
            {
              text: systemInstruction,
            },
          ],
        },
      },
    };

    ws.send(JSON.stringify(config));
    console.log(
      "⚙️  Gemini configuration sent (Audio mode, Puck voice, with system instruction)"
    );
  }

  /**
   * Send system prompt to establish interview context
   * NOTE: This method is now deprecated - system instruction is sent in the configuration above
   * Keeping it here for reference/backwards compatibility if needed
   */
  async sendSystemPrompt(ws: WebSocket): Promise<void> {
    // System instruction is now sent in the configuration setup
    // This method is no longer called but kept for reference
    console.log(
      "⚠️  sendSystemPrompt called but system instruction already in config"
    );
  }

  /**
   * Send control instruction to Gemini (ask question, follow-up, etc.)
   */
  async sendInstruction(
    ws: WebSocket,
    instruction: GeminiInstruction
  ): Promise<void> {
    console.log(
      `🎯 Sending instruction (${instruction.type}): ${instruction.content}`
    );

    let instructionText = "";

    switch (instruction.type) {
      case "ask_question":
        instructionText = `Now ask this NEW question and ONLY focus on this question from now on. Say it warmly: "${instruction.content}". After asking, listen carefully to their answer about THIS question only. Wait silently for them to respond.`;
        break;

      case "follow_up":
        const contextText = instruction.context
          ? ` ${instruction.context}.`
          : "";
        const aspectsText =
          instruction.missingAspects && instruction.missingAspects.length > 0
            ? ` Specifically, they need to address: ${instruction.missingAspects.join(
              ", "
            )}.`
            : "";
        instructionText = `The user's answer about the CURRENT question needs more detail.${contextText}${aspectsText} Please encourage them warmly: "${instruction.content}" Keep the focus on the CURRENT question. Then wait silently for their response.`;
        break;

      case "redirect":
        instructionText = `The user went off-topic.${instruction.context ? ` ${instruction.context}.` : ""
          } Acknowledge briefly (1 sentence), then redirect back to the CURRENT question: "${instruction.content
          }"`;
        break;

      case "close_interview":
        instructionText = instruction.content;
        break;
    }

    const message = {
      client_content: {
        turns: [
          {
            role: "user",
            parts: [
              {
                text: instructionText,
              },
            ],
          },
        ],
        turn_complete: true,
      },
    };

    const stateMap = {
      [WebSocket.CONNECTING]: "CONNECTING",
      [WebSocket.OPEN]: "OPEN",
      [WebSocket.CLOSING]: "CLOSING",
      [WebSocket.CLOSED]: "CLOSED",
    };

    console.log(
      `🔍 WebSocket State: ${stateMap[ws.readyState]} (${ws.readyState})`
    );

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      console.log(`✅ Instruction sent to Gemini: ${instruction.type}`);
    } else {
      console.error(
        `⚠️  Cannot send instruction - WebSocket state: ${stateMap[ws.readyState]
        }`
      );
      console.error(`   Expected: OPEN (1), Got: ${ws.readyState}`);
    }
  }

  /**
   * Stream audio from user to Gemini
   *
   * NOTE: This function is NO LONGER USED in the hybrid control approach.
   * We do NOT send user audio to Gemini Realtime during their answer.
   * This prevents Gemini from auto-responding or processing user speech.
   * Gemini is ONLY used to speak responses when explicitly instructed by the backend.
   */
  /*
  sendAudioToGemini(ws: WebSocket, audioData: Buffer): void {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        // Convert audio to base64
        const base64Audio = audioData.toString("base64");

        const message = {
          realtime_input: {
            media_chunks: [
              {
                mime_type: "audio/pcm",
                data: base64Audio,
              },
            ],
          },
        };

        ws.send(JSON.stringify(message));
        // Don't log every chunk (too verbose)
        // console.log(`📤 Audio chunk sent to Gemini: ${audioData.length} bytes`);
      }
    } catch (error) {
      console.error("❌ Error sending audio to Gemini:", error);
    }
  }
  */

  /**
   * Close Gemini connection gracefully
   */
  closeConnection(ws: WebSocket): void {
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
        console.log("✅ Gemini connection closed gracefully");
      }
    } catch (error) {
      console.error("❌ Error closing Gemini connection:", error);
    }
  }

  /**
   * Send interrupt signal to Gemini (user started speaking)
   * This tells Gemini to stop generating and listen
   */
  sendInterruptSignal(ws: WebSocket): void {
    if (ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      // Send a turn_complete signal to interrupt current generation
      const message = {
        client_content: {
          turn_complete: true,
        },
      };
      ws.send(JSON.stringify(message));
      console.log("🛑 Sent interrupt signal to Gemini");
    } catch (error) {
      console.error("❌ Error sending interrupt signal:", error);
    }
  }

  /**
   * Prepare Gemini for upcoming response (pre-warming to reduce latency)
   */
  prepareForResponse(ws: WebSocket): void {
    if (ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      // Send a no-op message to keep connection warm
      // This reduces latency when we send the actual instruction
      const message = {
        client_content: {
          turn_complete: false,
        },
      };
      ws.send(JSON.stringify(message));
      console.log("🔥 Pre-warmed Gemini connection for upcoming response");
    } catch (error) {
      // Non-critical error, just log it
      console.warn("⚠️ Failed to pre-warm Gemini:", error);
    }
  }

  /**
   * Generate follow-up question using Gemini Flash (text-based fallback)
   */
  async generateFollowUp(
    question: string,
    answer: string,
    missingAspects: string[]
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      const prompt = `Based on this interview question and answer, generate ONE brief follow-up to encourage elaboration.

Original Question: ${question}

User's Answer: ${answer}

Missing Aspects: ${missingAspects.join(", ")}

Generate a warm, empathetic follow-up (max 15 words) that encourages the user to elaborate. Examples:
- "Could you tell me more about that?"
- "What made you feel that way?"
- "Can you give me an example?"

Keep it short, natural, and encouraging. Just the follow-up sentence:`;

      const result = await model.generateContent(prompt);
      const followUp = result.response
        .text()
        .trim()
        .replace(/^["']|["']$/g, "");

      console.log(`💭 Generated follow-up: ${followUp}`);
      return followUp;
    } catch (error) {
      console.error("❌ Error generating follow-up:", error);
      return "Could you tell me a bit more about that?";
    }
  }

  /**
   * Generate redirect message when user is off-topic
   */
  async generateRedirect(
    question: string,
    offTopicAnswer: string
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      const prompt = `The user went off-topic. Generate a brief, kind redirect that brings them back.

Original Question: ${question}

User's Off-Topic Response: ${offTopicAnswer}

Generate a warm redirect (max 20 words) that:
1. Briefly acknowledges what they said (5 words max)
2. Redirects back to the question

Example: "I understand. However, let's focus on: ${question}"

Just the redirect text:`;

      const result = await model.generateContent(prompt);
      const redirect = result.response
        .text()
        .trim()
        .replace(/^["']|["']$/g, "");

      console.log(`🔄 Generated redirect: ${redirect}`);
      return redirect;
    } catch (error) {
      console.error("❌ Error generating redirect:", error);
      return `That's interesting, but let's focus on the question I asked: ${question}`;
    }
  }
}

// Singleton instance
const geminiRealtimeService = new GeminiRealtimeService();
export default geminiRealtimeService;