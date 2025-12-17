import api from "../lib/api";

export interface VoiceInterviewSession {
    sessionId: string;
    status: {
        sessionId: string;
        userId: string;
        phase: string;
        currentQuestionIndex: number;
        totalQuestions: number;
        startedAt: string;
        elapsedTimeMs: number;
    };
    signaling: {
        wsUrl: string;
        iceServers: { urls: string }[];
    };
}

export interface VoiceInterviewStatus {
    sessionId: string;
    userId: string;
    phase: 'INITIALIZING' | 'READY' | 'ACTIVE' | 'COMPLETING' | 'COMPLETED' | 'ABANDONED' | 'ERROR';
    currentQuestionIndex: number;
    totalQuestions: number;
    startedAt: string;
    elapsedTimeMs: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export const voiceInterviewService = {
    /**
     * Start a new voice interview session
     */
    startSession: async (userId: string): Promise<ApiResponse<VoiceInterviewSession>> => {
        try {
            const response = await api.post("/api/voice-interview/start", { userId });
            return response as unknown as ApiResponse<VoiceInterviewSession>;
        } catch (error: any) {
            console.error("[VoiceInterviewService] Error starting session:", error);
            return {
                success: false,
                message: error?.response?.data?.message || "Failed to start session",
                error: error?.message
            };
        }
    },

    /**
     * Begin the actual interview (after connection is established)
     */
    beginInterview: async (sessionId: string): Promise<ApiResponse<VoiceInterviewStatus>> => {
        try {
            const response = await api.post(`/api/voice-interview/${sessionId}/begin`);
            return response as unknown as ApiResponse<VoiceInterviewStatus>;
        } catch (error: any) {
            console.error("[VoiceInterviewService] Error beginning interview:", error);
            return {
                success: false,
                message: error?.response?.data?.message || "Failed to begin interview",
                error: error?.message
            };
        }
    },

    /**
     * Get the current status of an interview session
     */
    getStatus: async (sessionId: string): Promise<ApiResponse<VoiceInterviewStatus>> => {
        try {
            const response = await api.get(`/api/voice-interview/${sessionId}/status`);
            return response as unknown as ApiResponse<VoiceInterviewStatus>;
        } catch (error: any) {
            console.error("[VoiceInterviewService] Error getting status:", error);
            return {
                success: false,
                message: error?.response?.data?.message || "Failed to get status",
                error: error?.message
            };
        }
    },

    /**
     * End an interview session
     */
    endSession: async (sessionId: string, reason: 'completed' | 'abandoned' = 'abandoned'): Promise<ApiResponse<void>> => {
        try {
            const response = await api.post(`/api/voice-interview/${sessionId}/end`, { reason });
            return response as unknown as ApiResponse<void>;
        } catch (error: any) {
            console.error("[VoiceInterviewService] Error ending session:", error);
            return {
                success: false,
                message: error?.response?.data?.message || "Failed to end session",
                error: error?.message
            };
        }
    }
};
