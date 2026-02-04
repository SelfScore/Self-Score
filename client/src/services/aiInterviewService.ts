import api from '../lib/api';

export interface AIInterviewQuestion {
    questionId: string;
    questionText: string;
    questionOrder: number;
}

export interface AIInterviewAnswer {
    questionId: string;
    answerText: string;
    timestamp: Date;
}

export interface TranscriptEntry {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface AIInterview {
    _id: string;
    userId: string;
    level: number;
    mode: 'TEXT' | 'VOICE';
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    questions: AIInterviewQuestion[];
    answers: AIInterviewAnswer[];
    transcript?: TranscriptEntry[];
    startedAt: Date;
    completedAt?: Date;
    feedbackId?: string;
}

export interface CategoryScore {
    name: string;
    score: number;
    comment: string;
}

export interface AIFeedback {
    _id: string;
    userId: string;
    interviewId: string;
    level: number;
    totalScore: number;
    categoryScores: CategoryScore[];
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
    recommendations: string[];
    createdAt: Date;
}

export interface StartInterviewResponse {
    success: boolean;
    message: string;
    data: {
        interviewId: string;
        mode: 'TEXT' | 'VOICE';
        questions: AIInterviewQuestion[];
        answers?: AIInterviewAnswer[];
        transcript?: TranscriptEntry[];
        progress: number;
    };
}

export interface SubmitAnswerResponse {
    success: boolean;
    message: string;
    data: {
        progress: number;
        totalQuestions: number;
        isComplete: boolean;
    };
}

export interface CompleteInterviewResponse {
    success: boolean;
    message: string;
    data: {
        feedbackId: string;
    };
}

class AIInterviewService {
    /**
     * Start a new AI interview or resume existing one
     */
    async startInterview(mode: 'TEXT' | 'VOICE'): Promise<StartInterviewResponse> {
        const response = await api.post('/api/ai-interview/start', { mode }) as any;
        return response; // api interceptor already returns response.data
    }

    /**
     * Submit an answer for text mode
     */
    async submitTextAnswer(
        interviewId: string,
        questionId: string,
        answerText: string
    ): Promise<SubmitAnswerResponse> {
        const response = await api.post('/api/ai-interview/submit-answer', {
            interviewId,
            questionId,
            answerText
        }) as any;
        return response; // api interceptor already returns response.data
    }

    /**
     * Add transcript entry for voice mode
     */
    async addTranscript(
        interviewId: string,
        role: 'user' | 'assistant',
        content: string,
        questionId?: string
    ): Promise<{ success: boolean; message: string }> {
        const response = await api.post('/api/ai-interview/add-transcript', {
            interviewId,
            role,
            content,
            questionId
        }) as any;
        return response; // api interceptor already returns response.data
    }

    /**
     * Complete the interview and generate feedback
     */
    async completeInterview(interviewId: string): Promise<CompleteInterviewResponse> {
        const response = await api.post('/api/ai-interview/complete', { interviewId }) as any;
        return response; // api interceptor already returns response.data
    }

    /**
     * Get interview feedback
     */
    async getFeedback(interviewId: string): Promise<{ success: boolean; data: AIFeedback }> {
        const response = await api.get(`/api/ai-interview/feedback/${interviewId}`) as any;
        return response; // api interceptor already returns response.data
    }

    /**
     * Get interview details
     */
    async getInterview(interviewId: string): Promise<{ success: boolean; data: AIInterview }> {
        const response = await api.get(`/api/ai-interview/${interviewId}`) as any;
        return response; // api interceptor already returns response.data
    }

    /**
     * Get user's interview history
     */
    async getInterviewHistory(): Promise<{ success: boolean; data: AIInterview[] }> {
        const response = await api.get('/api/ai-interview/history/all') as any;
        return response; // api interceptor already returns response.data
    }

    /**
     * Check if user has an active Level 4 interview
     */
    async checkActiveInterview(): Promise<{ success: boolean; data: { hasActiveInterview: boolean; interviewId: string | null; mode: string | null; progress: number } }> {
        const response = await api.get('/api/ai-interview/check-active') as any;
        return response; // api interceptor already returns response.data
    }
}

export const aiInterviewService = new AIInterviewService();
