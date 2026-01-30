import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { InterviewSession } from "../types/realtimeInterview.types";

/**
 * DeepgramService - Handles real-time speech-to-text transcription
 */
export class DeepgramService {
  private deepgramClient: any;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY || "";

    if (!this.apiKey) {
      throw new Error("DEEPGRAM_API_KEY is not set in environment variables");
    }

    this.deepgramClient = createClient(this.apiKey);
    console.log("✅ Deepgram service initialized");
  }

  /**
   * Create a live transcription connection for a session
   */
  async createLiveTranscription(
    session: InterviewSession,
    onTranscript: (transcript: string, isFinal: boolean) => void,
    onError: (error: any) => void
  ): Promise<any> {
    try {
      const connection = this.deepgramClient.listen.live({
        model: "nova-3",
        language: "multi", // Multi-language detection (supports English, Hindi, etc.)
        smart_format: true,
        interim_results: true,
        punctuate: true,
        utterance_end_ms: 3000, // 3 seconds of silence = utterance end
        vad_events: true, // Voice activity detection
        encoding: "linear16", // Raw PCM audio (Int16) from frontend
        sample_rate: 16000,
        channels: 1,
      });

      // Handle connection open
      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log(
          `🎤 Deepgram connection opened for session: ${session.sessionId}`
        );
        console.log(`📡 Deepgram ready state: ${connection.getReadyState()}`);
        console.log(`✅ Deepgram is ready to receive audio`);
      });

      // Handle transcription results
      connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript;

        if (transcript && transcript.length > 0) {
          const isFinal = data.is_final;

          console.log(
            `📝 Transcript ${isFinal ? "(final)" : "(interim)"}: ${transcript}`
          );
          onTranscript(transcript, isFinal);
        }
      });

      // Handle utterance end (user stopped speaking)
      connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
        console.log("🔇 Utterance ended (silence detected)");
        onTranscript("", true); // Signal utterance end
      });

      // Handle metadata
      connection.on(LiveTranscriptionEvents.Metadata, (data: any) => {
        console.log("📊 Deepgram metadata:", data);
      });

      // Handle errors
      connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error("❌ Deepgram error:", error);
        onError(error);
      });

      // Handle connection close
      connection.on(LiveTranscriptionEvents.Close, (closeEvent: any) => {
        console.log(
          `🔌 Deepgram connection closed for session: ${session.sessionId}`
        );
        console.log(`   Close code: ${closeEvent?.code || "unknown"}`);
        console.log(
          `   Close reason: ${closeEvent?.reason || "No reason provided"}`
        );
      });

      // Handle unhandled events
      connection.on(LiveTranscriptionEvents.Unhandled, (data: any) => {
        console.log(`🔄 Deepgram unhandled event:`, data);
      });

      return connection;
    } catch (error) {
      console.error("❌ Failed to create Deepgram connection:", error);
      throw error;
    }
  }

  /**
   * Send audio data to Deepgram
   */
  sendAudio(connection: any, audioData: Buffer): void {
    try {
      if (connection && connection.getReadyState() === 1) {
        // 1 = OPEN
        connection.send(audioData);
        // Log first few sends to confirm audio is flowing
        if (!connection._audioSent) {
          console.log(
            `🎙️ First audio chunk sent to Deepgram: ${audioData.length} bytes`
          );
          connection._audioSent = true;
        }
      } else {
        console.warn(
          `⚠️ Cannot send audio - Deepgram state: ${connection?.getReadyState()}`
        );
      }
    } catch (error) {
      console.error("❌ Error sending audio to Deepgram:", error);
    }
  }

  /**
   * Close Deepgram connection
   */
  closeConnection(connection: any): void {
    try {
      if (connection) {
        connection.finish();
        console.log("✅ Deepgram connection closed gracefully");
      }
    } catch (error) {
      console.error("❌ Error closing Deepgram connection:", error);
    }
  }
}

// Singleton instance
const deepgramService = new DeepgramService();
export default deepgramService;
