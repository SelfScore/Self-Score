/**
 * Gemini Realtime Client
 * WebSocket client for Google's Gemini Multimodal Live API
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import {
    ConnectionState,
    ControlInstruction,
    ControlInstructionType,
    AI_SYSTEM_INSTRUCTIONS,
    AudioFrame
} from './types';

export interface GeminiRealtimeConfig {
    apiKey: string;
    model?: string;
    voice?: string;
    reconnectAttempts?: number;
    reconnectDelayMs?: number;
    systemInstruction?: string;
}

export class GeminiRealtimeClient extends EventEmitter {
    private ws: WebSocket | null = null;
    private config: Required<GeminiRealtimeConfig>;
    private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
    private reconnectCount: number = 0;
    private sessionId: string;

    private readonly HOST = 'generativelanguage.googleapis.com';
    private readonly PATH = '/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';

    constructor(sessionId: string, config: GeminiRealtimeConfig) {
        super();
        this.sessionId = sessionId;
        this.config = {
            apiKey: config.apiKey,
            model: config.model || 'models/gemini-2.0-flash-exp', // Default to 2.0 Flash Experimental
            voice: config.voice || 'Puck', // Default Gemini voice
            reconnectAttempts: config.reconnectAttempts ?? 3,
            reconnectDelayMs: config.reconnectDelayMs ?? 1000,
            systemInstruction: config.systemInstruction || AI_SYSTEM_INSTRUCTIONS
        };
    }

    /**
     * Get current connection state
     */
    getConnectionState(): ConnectionState {
        return this.connectionState;
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.connectionState === ConnectionState.CONNECTED;
    }

    /**
     * Connect to Gemini Multimodal Live API
     */
    async connect(): Promise<void> {
        if (this.connectionState === ConnectionState.CONNECTED) {
            return;
        }

        this.connectionState = ConnectionState.CONNECTING;
        console.log(`[GeminiRealtime:${this.sessionId}] Connecting...`);

        return new Promise((resolve, reject) => {
            try {
                // Construct WebSocket URL
                const url = `wss://${this.HOST}${this.PATH}?key=${this.config.apiKey}`;

                this.ws = new WebSocket(url);

                this.ws.on('open', () => {
                    console.log(`[GeminiRealtime:${this.sessionId}] Connected`);
                    this.connectionState = ConnectionState.CONNECTED;
                    this.reconnectCount = 0;
                    this.initializeSession();
                    this.emit('connected');
                    resolve();
                });

                this.ws.on('message', (data: WebSocket.Data) => {
                    this.handleMessage(data);
                });

                this.ws.on('close', (code, reason) => {
                    console.log(`[GeminiRealtime:${this.sessionId}] Disconnected: ${code} ${reason}`);
                    this.handleDisconnect();
                });

                this.ws.on('error', (error) => {
                    console.error(`[GeminiRealtime:${this.sessionId}] Error:`, error);
                    const wasConnecting = this.connectionState === ConnectionState.CONNECTING;
                    this.connectionState = ConnectionState.ERROR;
                    this.emit('error', error);
                    // Only reject if we haven't connected yet
                    if (wasConnecting) {
                        reject(error);
                    }
                });

            } catch (error) {
                this.connectionState = ConnectionState.ERROR;
                reject(error);
            }
        });
    }

    /**
     * Initialize the session with setup message
     */
    private initializeSession(): void {
        const setupMessage = {
            setup: {
                model: this.config.model,
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: this.config.voice
                            }
                        }
                    }
                },
                systemInstruction: {
                    parts: [
                        { text: this.config.systemInstruction }
                    ]
                }
            }
        };

        this.sendEvent(setupMessage);
        console.log(`[GeminiRealtime:${this.sessionId}] Session initialized`);
    }

    /**
     * Send audio frame to Gemini
     */
    sendAudio(audioFrame: AudioFrame): void {
        if (!this.isConnected() || !this.ws) return;

        // Convert audio to base64
        const base64Audio = audioFrame.data.toString('base64');

        const audioMessage = {
            realtimeInput: {
                mediaChunks: [
                    {
                        mimeType: "audio/pcm;rate=16000", // Assuming 16kHz input
                        data: base64Audio
                    }
                ]
            }
        };

        this.sendEvent(audioMessage);
    }

    /**
     * Send a control instruction to the AI
     */
    sendControlInstruction(instruction: ControlInstruction): void {
        if (!this.isConnected() || !this.ws) return;

        let instructionText = '';

        switch (instruction.type) {
            case ControlInstructionType.ASK_QUESTION:
                instructionText = `[INSTRUCTION] Ask the following question verbatim: "${instruction.content}"`;
                break;
            case ControlInstructionType.ASK_FOLLOWUP:
                instructionText = `[INSTRUCTION] Ask a follow-up question focusing on: ${instruction.content}`;
                break;
            case ControlInstructionType.REDIRECT:
                instructionText = `[INSTRUCTION] Gently redirect the user back to the current topic. The topic is: ${instruction.content}`;
                break;
            case ControlInstructionType.ACKNOWLEDGE:
                instructionText = `[INSTRUCTION] Briefly acknowledge what the user said and wait for them to continue.`;
                break;
            case ControlInstructionType.THANK_AND_WAIT:
                instructionText = `[INSTRUCTION] Thank the user for their answer and wait silently. Do not ask any new questions.`;
                break;
            case ControlInstructionType.END_INTERVIEW:
                instructionText = `[INSTRUCTION] Thank the user for completing the interview. Let them know the interview is now complete and wish them well.`;
                break;
            default:
                instructionText = `[INSTRUCTION] ${instruction.content}`;
        }

        const textMessage = {
            clientContent: {
                turns: [
                    {
                        role: "user",
                        parts: [
                            { text: instructionText }
                        ]
                    }
                ],
                turnComplete: true
            }
        };

        this.sendEvent(textMessage);

        console.log(`[GeminiRealtime:${this.sessionId}] Sent control instruction: ${instruction.type}`);
    }

    /**
     * Cancel any ongoing response
     * Gemini doesn't have a direct "cancel" message in the same way, 
     * but sending new content typically interrupts. 
     * We can also try sending an empty text turn to interrupt.
     */
    cancelResponse(): void {
        if (!this.isConnected() || !this.ws) return;

        // Sending a distinct "interruption" might just be sending new input.
        // For now, we'll send a dummy quiet signal or just rely on the fact 
        // that new audio input usually interrupts.
        // We can also close and reopen if hard cancel is needed, but that's expensive.
        // Official docs say "End Turn" or just new input.
    }

    /**
     * Handle incoming messages from Gemini
     */
    private handleMessage(data: WebSocket.Data): void {
        try {
            let buffer: Buffer;
            if (Buffer.isBuffer(data)) {
                buffer = data;
            } else if (data instanceof ArrayBuffer) {
                buffer = Buffer.from(data);
            } else {
                buffer = Buffer.from(data.toString());
            }

            const message = JSON.parse(buffer.toString());

            // Handle server content
            if (message.serverContent) {
                const content = message.serverContent;

                // Handle model turn (output)
                if (content.modelTurn) {
                    const parts = content.modelTurn.parts;
                    if (parts) {
                        for (const part of parts) {
                            if (part.inlineData && part.inlineData.mimeType.startsWith('audio')) {
                                // Audio data
                                const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
                                this.emit('audioResponse', audioBuffer);
                            } else if (part.text) {
                                // Text transcript
                                this.emit('aiTranscript', part.text); // Partial validation
                            }
                        }
                    }
                }

                // Handle turn completion
                if (content.turnComplete) {
                    this.emit('audioResponseComplete');
                    // If there's a final transcript, it might be in an earlier part
                }
            }

            // Handle tool calls (if we add them later)
            if (message.toolCall) {
                // Not implemented yet
            }

            // Handle errors
            if (message.error) {
                console.error(`[GeminiRealtime:${this.sessionId}] API Error:`, message.error);
                this.emit('error', new Error(message.error.message || 'Unknown error'));
            }

        } catch (error) {
            console.error(`[GeminiRealtime:${this.sessionId}] Error parsing message:`, error);
        }
    }

    /**
     * Handle disconnect
     */
    private handleDisconnect(): void {
        this.connectionState = ConnectionState.DISCONNECTED;
        this.emit('disconnected');

        // Attempt reconnection if configured
        if (this.reconnectCount < this.config.reconnectAttempts) {
            this.connectionState = ConnectionState.RECONNECTING;
            this.reconnectCount++;
            console.log(`[GeminiRealtime:${this.sessionId}] Reconnecting (attempt ${this.reconnectCount})...`);

            setTimeout(() => {
                this.connect().catch(err => {
                    console.error(`[GeminiRealtime:${this.sessionId}] Reconnection failed:`, err);
                });
            }, this.config.reconnectDelayMs);
        }
    }

    /**
     * Send an event to Gemini
     */
    private sendEvent(event: Record<string, unknown>): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify(event));
    }

    /**
     * Disconnect and cleanup
     */
    async disconnect(): Promise<void> {
        if (this.ws) {
            this.ws.terminate(); // terminate is often cleaner for WS
            this.ws = null;
        }
        this.connectionState = ConnectionState.DISCONNECTED;
        this.removeAllListeners();
        console.log(`[GeminiRealtime:${this.sessionId}] Disconnected`);
    }
}
