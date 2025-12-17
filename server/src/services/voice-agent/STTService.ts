/**
 * STT Service Interface
 * Abstract interface for speech-to-text providers
 */

import { EventEmitter } from 'events';
import { TranscriptEvent, AudioFrame } from './types';

/**
 * Abstract STT service interface
 */
export abstract class STTService extends EventEmitter {
    protected isActive: boolean = false;
    protected sessionId: string;

    constructor(sessionId: string) {
        super();
        this.sessionId = sessionId;
    }

    /**
     * Start the STT service
     */
    abstract start(): Promise<void>;

    /**
     * Stop the STT service
     */
    abstract stop(): Promise<void>;

    /**
     * Send audio for transcription
     */
    abstract sendAudio(audioFrame: AudioFrame): void;

    /**
     * Check if service is ready
     */
    abstract isReady(): boolean;

    /**
     * Get service name
     */
    abstract getServiceName(): string;

    /**
     * Check if service is active
     */
    isServiceActive(): boolean {
        return this.isActive;
    }

    /**
     * Cleanup
     */
    async cleanup(): Promise<void> {
        await this.stop();
        this.removeAllListeners();
    }
}

// STT events for type safety
export interface STTServiceEvents {
    partialTranscript: (event: TranscriptEvent) => void;
    finalTranscript: (event: TranscriptEvent) => void;
    speechStart: () => void;
    speechEnd: () => void;
    error: (error: Error) => void;
    ready: () => void;
    disconnected: () => void;
}
