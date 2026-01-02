import api from "@/lib/api";

export interface Level5Submission {
  _id: string;
  userId: string;
  sessionId: string;
  status: "COMPLETED" | "PENDING_REVIEW" | "REVIEWED";
  submittedAt: Date;
  user: {
    username: string;
    email: string;
  };
  review?: {
    totalScore: number;
    status: "DRAFT" | "SUBMITTED";
    submittedAt: Date;
  };
  hasReview: boolean;
}

export interface QuestionReview {
  questionId: string;
  questionText: string;
  userAnswer: string;
  answerMode: "VOICE";
  score: number;
  remark: string;
}

export interface Level5Review {
  _id: string;
  userId: string;
  interviewId: string;
  adminId: string;
  attemptNumber: number;
  questionReviews: QuestionReview[];
  totalScore: number;
  status: "DRAFT" | "SUBMITTED";
  reviewedAt?: Date;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Level5Interview {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  sessionId: string;
  level: number;
  status: string;
  questions: {
    questionId: string;
    questionText: string;
    order: number;
  }[];
  answers: {
    questionId: string;
    transcript: string;
    confidence: number;
    isComplete: boolean;
    isOffTopic: boolean;
    missingAspects: string[];
    followUpAsked: boolean;
    audioTimestamp: {
      start: Date;
      end: Date;
    };
  }[];
  interviewMetadata: {
    totalDuration: number;
    averageAnswerLength: number;
    followUpCount: number;
    redirectionCount: number;
  };
  startedAt: Date;
  completedAt?: Date;
  submittedAt?: Date;
}

class Level5ReviewService {
  /**
   * Get all Level 5 submissions for admin
   */
  async getAllSubmissions(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    sortBy: "latest" | "oldest" = "latest",
    status: "all" | "PENDING_REVIEW" | "REVIEWED" = "all"
  ): Promise<{
    success: boolean;
    data: {
      submissions: Level5Submission[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> {
    const response = (await api.get(
      `/api/admin/level5/submissions?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&status=${status}`
    )) as any;
    return response;
  }

  /**
   * Get single Level 5 submission by ID
   */
  async getSubmissionById(interviewId: string): Promise<{
    success: boolean;
    data: {
      interview: Level5Interview;
      review: Level5Review | null;
    };
  }> {
    const response = (await api.get(
      `/api/admin/level5/submissions/${interviewId}`
    )) as any;
    return response;
  }

  /**
   * Save Level 5 review as draft
   */
  async saveReview(
    interviewId: string,
    questionReviews: QuestionReview[],
    totalScore: number
  ): Promise<{
    success: boolean;
    message: string;
    data: { reviewId: string };
  }> {
    const response = (await api.post(
      `/api/admin/level5/submissions/${interviewId}/save`,
      {
        questionReviews,
        totalScore,
      }
    )) as any;
    return response;
  }

  /**
   * Submit Level 5 review (finalize)
   */
  async submitReview(
    interviewId: string,
    questionReviews: QuestionReview[],
    totalScore: number
  ): Promise<{
    success: boolean;
    message: string;
    data: { reviewId: string };
  }> {
    const response = (await api.post(
      `/api/admin/level5/submissions/${interviewId}/submit`,
      {
        questionReviews,
        totalScore,
      }
    )) as any;
    return response;
  }

  /**
   * Get user's Level 5 review (for user dashboard)
   */
  async getUserReview(): Promise<{
    success: boolean;
    data: { review: Level5Review };
  }> {
    const response = (await api.get(`/api/admin/level5/user/review`)) as any;
    return response;
  }
}

export const level5ReviewService = new Level5ReviewService();
