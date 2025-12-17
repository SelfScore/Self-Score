/**
 * Deepgram STT Provider
 * Streaming speech-to-text using Deepgram API
 */

import WebSocket from 'ws';
import { STTService } from './STTService';
import { TranscriptEvent, AudioFrame } from './types';

export interface DeepgramConfig {
    apiKey: string;
    language?: string;
    model?: string;
    sampleRate?: number;
    channels?: number;
    encoding?: string;
    punctuate?: boolean;
    interimResults?: boolean;
    vadEvents?: boolean;
}

export class DeepgramSTTProvider extends STTService {
    private ws: WebSocket | null = null;
    private config: Required<DeepgramConfig>;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 3;

    constructor(sessionId: string, config: DeepgramConfig) {
        super(sessionId);
        this.config = {
            apiKey: config.apiKey,
            language: config.language || 'en-US',
            model: config.model || 'nova-2',
            sampleRate: config.sampleRate || 16000,
            channels: config.channels || 1,
            encoding: config.encoding || 'linear16',
            punctuate: config.punctuate ?? true,
            interimResults: config.interimResults ?? true,
            vadEvents: config.vadEvents ?? true
        };
    }

    /**
     * Get service name
     */
    getServiceName(): string {
        return 'deepgram';
    }

    /**
     * Check if ready to receive audio
     */
    isReady(): boolean {
        return this.isActive && this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Start the STT connection
     */
    async start(): Promise<void> {
        if (this.isActive) return;

        console.log(`[DeepgramSTT:${this.sessionId}] Starting...`);

        return new Promise((resolve, reject) => {
            try {
                // Build Deepgram WebSocket URL with parameters
                const params = new URLSearchParams({
                    model: this.config.model,
                    language: this.config.language,
                    punctuate: String(this.config.punctuate),
                    interim_results: String(this.config.interimResults),
                    vad_events: String(this.config.vadEvents),
                    encoding: this.config.encoding,
                    sample_rate: String(this.config.sampleRate),
                    channels: String(this.config.channels)
                });

                const url = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

                this.ws = new WebSocket(url, {
                    headers: {
                        'Authorization': `Token ${this.config.apiKey}`
                    }
                });

                this.ws.on('open', () => {
                    console.log(`[DeepgramSTT:${this.sessionId}] Connected`);
                    this.isActive = true;
                    this.reconnectAttempts = 0;
                    this.emit('ready');
                    resolve();
                });

                this.ws.on('message', (data: WebSocket.Data) => {
                    this.handleMessage(data);
                });

                this.ws.on('close', (code, reason) => {
                    console.log(`[DeepgramSTT:${this.sessionId}] Disconnected: ${code} ${reason}`);
                    this.isActive = false;
                    this.emit('disconnected');
                    this.attemptReconnect();
                });

                this.ws.on('error', (error) => {
                    console.error(`[DeepgramSTT:${this.sessionId}] Error:`, error);
                    this.emit('error', error);
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Stop the STT connection
     */
    async stop(): Promise<void> {
        console.log(`[DeepgramSTT:${this.sessionId}] Stopping...`);

        if (this.ws) {
            // Send close message to Deepgram
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'CloseStream' }));
            }
            this.ws.close();
            this.ws = null;
        }

        this.isActive = false;
        console.log(`[DeepgramSTT:${this.sessionId}] Stopped`);
    }

    /**
     * Send audio for transcription
     */
    sendAudio(audioFrame: AudioFrame): void {
        if (!this.isReady() || !this.ws) return;

        // Send raw audio bytes
        this.ws.send(audioFrame.data);
    }

    /**
     * Handle messages from Deepgram
     */
    private handleMessage(data: WebSocket.Data): void {
        try {
            const message = JSON.parse(data.toString());

            switch (message.type) {
                case 'Results':
                    this.handleTranscriptResult(message);
                    break;

                case 'SpeechStarted':
                    this.emit('speechStart');
                    break;

                case 'UtteranceEnd':
                    this.emit('speechEnd');
                    break;

                case 'Metadata':
                    // Connection metadata
                    console.log(`[DeepgramSTT:${this.sessionId}] Metadata received`);
                    break;

                case 'Error':
                    console.error(`[DeepgramSTT:${this.sessionId}] API Error:`, message.error);
                    this.emit('error', new Error(message.error?.message || 'Unknown Deepgram error'));
                    break;
            }
        } catch (error) {
            console.error(`[DeepgramSTT:${this.sessionId}] Error parsing message:`, error);
        }
    }

    /**
     * Handle transcript result
     */
    private handleTranscriptResult(message: any): void {
        const channel = message.channel;
        if (!channel?.alternatives?.[0]) return;

        const alternative = channel.alternatives[0];
        const transcript = alternative.transcript;

        if (!transcript) return;

        const event: TranscriptEvent = {
            type: message.is_final ? 'final' : 'partial',
            text: transcript,
            confidence: alternative.confidence || 0,
            startTime: message.start || 0,
            endTime: (message.start || 0) + (message.duration || 0),
            isFinal: message.is_final || false
        };

        if (event.isFinal) {
            this.emit('finalTranscript', event);
        } else {
            this.emit('partialTranscript', event);
        }
    }

    /**
     * Attempt to reconnect
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log(`[DeepgramSTT:${this.sessionId}] Max reconnect attempts reached`);
            return;
        }

        this.reconnectAttempts++;
        console.log(`[DeepgramSTT:${this.sessionId}] Reconnecting (attempt ${this.reconnectAttempts})...`);

        setTimeout(() => {
            this.start().catch(err => {
                console.error(`[DeepgramSTT:${this.sessionId}] Reconnection failed:`, err);
            });
        }, 1000 * this.reconnectAttempts);
    }

    /**
     * Send keepalive
     */
    sendKeepAlive(): void {
        if (!this.isReady() || !this.ws) return;
        this.ws.send(JSON.stringify({ type: 'KeepAlive' }));
    }
}
