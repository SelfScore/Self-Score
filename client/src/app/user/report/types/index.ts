// Report types and interfaces

export interface UserReportData {
  username: string;
  email: string;
  phoneNumber: string;
  reportDate: string;
  level: number;
  score: number;
  maxScore: number;
}

export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface ReportContent {
  level: number;
  characteristics: string[];
  recommendations: Recommendation[];
  proTip: string;
  outcomes: string[];
}
