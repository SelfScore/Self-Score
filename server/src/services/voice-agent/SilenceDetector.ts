/**
 * Silence Detector
 * Detects when user stops speaking based on audio activity and transcripts
 */

import { EventEmitter } from 'events';

export interface SilenceDetectorConfig {
    silenceThresholdMs: number; // Time of silence before triggering
    activityDebounceMs: number; // Debounce for activity detection
}

export interface SilenceDetectorEvents {
    silenceDetected: () => void;
    activityDetected: () => void;
}

export class SilenceDetector extends EventEmitter {
    private lastActivityTimestamp: number = Date.now();
    private silenceTimer: NodeJS.Timeout | null = null;
    private isUserSpeaking: boolean = false;
    private config: SilenceDetectorConfig;

    constructor(config: Partial<SilenceDetectorConfig> = {}) {
        super();
        this.config = {
            silenceThresholdMs: config.silenceThresholdMs ?? 4000,
            activityDebounceMs: config.activityDebounceMs ?? 200
        };
    }

    /**
     * Called when audio activity is detected (from VAD or audio level)
     */
    onAudioActivity(): void {
        this.resetSilenceTimer();
        if (!this.isUserSpeaking) {
            this.isUserSpeaking = true;
            this.emit('activityDetected');
        }
    }

    /**
     * Called when a partial transcript is received
     */
    onPartialTranscript(): void {
        this.resetSilenceTimer();
        if (!this.isUserSpeaking) {
            this.isUserSpeaking = true;
            this.emit('activityDetected');
        }
    }

    /**
     * Called when a final transcript is received
     */
    onFinalTranscript(): void {
        this.resetSilenceTimer();
    }

    /**
     * Called when speech end is detected by STT service
     */
    onSpeechEnd(): void {
        // Start the silence timer - but don't immediately trigger
        this.startSilenceTimer();
    }

    /**
     * Check if user is currently speaking
     */
    isCurrentlySpeaking(): boolean {
        return this.isUserSpeaking;
    }

    /**
     * Get milliseconds since last activity
     */
    getTimeSinceLastActivity(): number {
        return Date.now() - this.lastActivityTimestamp;
    }

    /**
     * Reset the silence timer (user is speaking)
     */
    private resetSilenceTimer(): void {
        this.lastActivityTimestamp = Date.now();

        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
    }

    /**
     * Start the silence timer
     */
    private startSilenceTimer(): void {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
        }

        this.silenceTimer = setTimeout(() => {
            this.isUserSpeaking = false;
            this.emit('silenceDetected');
        }, this.config.silenceThresholdMs);
    }

    /**
     * Force trigger silence (for testing or manual control)
     */
    forceSilence(): void {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
        this.isUserSpeaking = false;
        this.emit('silenceDetected');
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<SilenceDetectorConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Cleanup
     */
    destroy(): void {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
        this.removeAllListeners();
    }
}
