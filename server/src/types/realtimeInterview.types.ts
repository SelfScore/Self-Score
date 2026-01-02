import { Readable } from "stream";

export interface Question {
  questionId: string;
  questionText: string;
  order: number;
}

export interface AnswerState {
  questionId: string;
  transcript: string;
  confidence: number;
  isComplete: boolean;
  isOffTopic: boolean;
  missingAspects: string[];
  suggestedFollowUp: string; // AI-generated follow-up question from analysis
  followUpAsked: boolean; // Keep for backward compatibility
  followUpCount: number; // Track number of follow-ups asked (max 3)
  redirectCount?: number; // Track number of redirects given (max 2)
  audioStartTime: number;
}

export interface InterviewSession {
  sessionId: string;
  userId: string;
  interviewId: string;

  // State machine
  currentQuestionIndex: number;
  questions: Question[];
  answers: Map<string, AnswerState>;

  // Connections
  wsConnection: any; // WebSocket connection
  deepgramConnection: any; // Deepgram live transcription
  geminiConnection: any; // Gemini Realtime connection

  // Timing & control
  lastAudioTimestamp: number;
  silenceTimer: NodeJS.Timeout | null;
  isAISpeaking: boolean;
  isUserSpeaking: boolean;

  // Audio buffers
  audioBuffer: Buffer[];
  currentTranscript: string;

  // Analysis
  pendingAnalysis: Promise<AnalysisResult> | null;

  // Metadata
  startTime: number;
  lastActivityTime: number;
}

export interface AnalysisResult {
  confidence: number; // 0-100
  isComplete: boolean;
  isOffTopic: boolean;
  missingAspects: string[];
  suggestedFollowUp: string; // AI-generated follow-up question
}

export interface GeminiInstruction {
  type: "ask_question" | "follow_up" | "redirect" | "close_interview";
  content: string;
  context?: string;
  missingAspects?: string[];
}

export enum InterviewAction {
  CONTINUE = "CONTINUE",
  FOLLOW_UP = "FOLLOW_UP",
  REDIRECT = "REDIRECT",
  NEXT_QUESTION = "NEXT_QUESTION",
  END_INTERVIEW = "END_INTERVIEW",
}
