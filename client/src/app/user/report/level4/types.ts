// Level 4 Report Types

export interface Level4ReportData {
  username: string;
  email: string;
  phoneNumber: string;
  reportDate: string;
  attemptNumber: number;
  totalScore: number;
  interviewMode: 'TEXT' | 'VOICE' | 'MIXED';
  questionReviews: QuestionReviewForReport[];
}

export interface QuestionReviewForReport {
  questionOrder: number;
  questionText: string;
  userAnswer: string;
  answerMode: 'TEXT' | 'VOICE' | 'MIXED';
  score: number;
  expertRemark: string;
}
