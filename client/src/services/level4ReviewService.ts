import api from '../lib/api';

export interface QuestionReview {
    questionId: string;
    questionText: string;
    userAnswer: string;
    answerMode: 'TEXT' | 'VOICE' | 'MIXED';
    score: number;
    remark: string;
}

export interface Level4Review {
    _id: string;
    userId: string;
    interviewId: string;
    adminId: string;
    attemptNumber: number;
    questionReviews: QuestionReview[];
    totalScore: number;
    status: 'DRAFT' | 'SUBMITTED';
    reviewedAt?: Date;
    submittedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Level4Submission {
    _id: string;
    userId: string;
    attemptNumber: number;
    mode: 'TEXT' | 'VOICE';
    status: 'PENDING_REVIEW' | 'REVIEWED';
    submittedAt: Date;
    user: {
        username: string;
        email: string;
    };
    review?: {
        totalScore: number;
        status: string;
        submittedAt: Date;
    };
    hasReview: boolean;
}

export interface QuestionAnswer {
    questionId: string;
    questionText: string;
    questionOrder: number;
    userAnswer: string;
    answerMode: 'TEXT' | 'VOICE' | 'MIXED';
    existingScore: number;
    existingRemark: string;
}

export interface SubmissionDetails {
    interview: {
        _id: string;
        userId: any;
        attemptNumber: number;
        mode: 'TEXT' | 'VOICE';
        status: string;
        submittedAt: Date;
        user: {
            username: string;
            email: string;
            phoneNumber: string;
        };
    };
    questionAnswers: QuestionAnswer[];
    existingReview: {
        _id: string;
        totalScore: number;
        status: string;
        reviewedAt: Date;
    } | null;
}

export interface GetSubmissionsResponse {
    success: boolean;
    data: {
        submissions: Level4Submission[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}

export interface GetSubmissionDetailsResponse {
    success: boolean;
    data: SubmissionDetails;
}

export interface SaveDraftResponse {
    success: boolean;
    message: string;
    data: {
        reviewId: string;
        totalScore: number;
    };
}

export interface SubmitReviewResponse {
    success: boolean;
    message: string;
    data: {
        reviewId: string;
        totalScore: number;
        status: string;
    };
}

export interface GetReviewResponse {
    success: boolean;
    pending?: boolean;
    message?: string;
    data: Level4Review | null;
}

class Level4ReviewService {
    /**
     * Admin: Get all Level 4 submissions with pagination and search
     */
    async getAllSubmissions(page: number = 1, limit: number = 10, search: string = ''): Promise<GetSubmissionsResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search
        });
        const response = await api.get(`/api/admin/level4/submissions?${params.toString()}`) as any;
        return response;
    }

    /**
     * Admin: Get single submission details for review
     */
    async getSubmissionDetails(interviewId: string): Promise<GetSubmissionDetailsResponse> {
        const response = await api.get(`/api/admin/level4/submissions/${interviewId}`) as any;
        return response;
    }

    /**
     * Admin: Save draft review (can continue later)
     */
    async saveDraft(interviewId: string, questionReviews: QuestionReview[]): Promise<SaveDraftResponse> {
        const response = await api.patch(`/api/admin/level4/submissions/${interviewId}/draft`, {
            questionReviews
        }) as any;
        return response;
    }

    /**
     * Admin: Submit final review (completes review and notifies user)
     */
    async submitReview(interviewId: string, questionReviews: QuestionReview[]): Promise<SubmitReviewResponse> {
        const response = await api.post(`/api/admin/level4/submissions/${interviewId}/submit`, {
            questionReviews
        }) as any;
        return response;
    }

    /**
     * User: Get their review for a specific interview
     */
    async getUserReview(interviewId: string): Promise<GetReviewResponse> {
        const response = await api.get(`/api/ai-interview/review/${interviewId}`) as any;
        return response;
    }
}

export const level4ReviewService = new Level4ReviewService();
