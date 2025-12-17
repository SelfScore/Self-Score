/**
 * Audio Router
 * Distributes audio frames to multiple destinations (Gemini Realtime + STT)
 */

import { EventEmitter } from 'events';
import { AudioFrame } from './types';

export interface AudioDestination {
    name: string;
    send: (audioFrame: AudioFrame) => void;
    isReady: () => boolean;
}

export class AudioRouter extends EventEmitter {
    private destinations: Map<string, AudioDestination> = new Map();
    private isActive: boolean = false;

    /**
     * Add an audio destination
     */
    addDestination(destination: AudioDestination): void {
        this.destinations.set(destination.name, destination);
        console.log(`[AudioRouter] Added destination: ${destination.name}`);
    }

    /**
     * Remove an audio destination
     */
    removeDestination(name: string): void {
        this.destinations.delete(name);
        console.log(`[AudioRouter] Removed destination: ${name}`);
    }

    /**
     * Start routing audio
     */
    start(): void {
        this.isActive = true;
        console.log('[AudioRouter] Started');
    }

    /**
     * Stop routing audio
     */
    stop(): void {
        this.isActive = false;
        console.log('[AudioRouter] Stopped');
    }

    /**
     * Route an audio frame to all destinations
     * This is the main method called when audio is received from WebRTC
     */
    routeAudio(audioFrame: AudioFrame): void {
        if (!this.isActive) return;

        // Send to all ready destinations in parallel (non-blocking)
        for (const [name, destination] of this.destinations) {
            if (destination.isReady()) {
                try {
                    destination.send(audioFrame);
                } catch (error) {
                    console.error(`[AudioRouter] Error sending to ${name}:`, error);
                    this.emit('error', { destination: name, error });
                }
            }
        }

        // Emit event for activity tracking
        this.emit('audioReceived', audioFrame);
    }

    /**
     * Route raw audio buffer (convenience method)
     */
    routeRawAudio(
        data: Buffer,
        sampleRate: number = 16000,
        channels: number = 1
    ): void {
        const audioFrame: AudioFrame = {
            data,
            sampleRate,
            channels,
            timestamp: Date.now()
        };
        this.routeAudio(audioFrame);
    }

    /**
     * Get list of destination names
     */
    getDestinationNames(): string[] {
        return Array.from(this.destinations.keys());
    }

    /**
     * Check if a destination exists and is ready
     */
    isDestinationReady(name: string): boolean {
        const destination = this.destinations.get(name);
        return destination ? destination.isReady() : false;
    }

    /**
     * Check if router is active
     */
    isRouterActive(): boolean {
        return this.isActive;
    }

    /**
     * Cleanup
     */
    destroy(): void {
        this.stop();
        this.destinations.clear();
        this.removeAllListeners();
        console.log('[AudioRouter] Destroyed');
    }
}
