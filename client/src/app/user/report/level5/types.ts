// Level 5 Report Types

export interface Level5ReportData {
  username: string;
  email: string;
  phoneNumber: string;
  reportDate: string;
  attemptNumber: number;
  totalScore: number;
  questionReviews: QuestionReviewForReport[];
  interviewMetadata?: {
    totalDuration: number;
    averageAnswerLength: number;
    followUpCount: number;
  };
}

export interface QuestionReviewForReport {
  questionOrder: number;
  questionText: string;
  userAnswer: string;
  score: number;
  expertRemark: string;
}
