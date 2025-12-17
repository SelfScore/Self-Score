/**
 * Voice Agent Type Definitions
 * Core types for the real-time voice interview system
 */

// =============================================================================
// Question & Interview States
// =============================================================================

/**
 * State of an individual question within the interview
 */
export enum QuestionState {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINAL_COMPLETE = 'FINAL_COMPLETE'
}

/**
 * Overall interview phase
 */
export enum InterviewPhase {
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  ACTIVE = 'ACTIVE',
  COMPLETING = 'COMPLETING',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
  ERROR = 'ERROR'
}

/**
 * Data tracked for each question
 */
export interface QuestionData {
  questionId: string;
  questionIndex: number;
  questionText: string;
  state: QuestionState;
  verbatimTranscript: string;
  completionConfidence: number;
  isOffTopic: boolean;
  missingAspects: string[];
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Full interview state machine structure
 */
export interface InterviewState {
  sessionId: string;
  userId: string;
  currentQuestionIndex: number;
  questions: QuestionData[];
  phase: InterviewPhase;
  startedAt: Date;
  completedAt?: Date;
  totalQuestions: number;
}

// =============================================================================
// Control Instructions (Backend → OpenAI)
// =============================================================================

/**
 * Types of control instructions sent to Gemini Realtime API
 */
export enum ControlInstructionType {
  ASK_QUESTION = 'ASK_QUESTION',
  ASK_FOLLOWUP = 'ASK_FOLLOWUP',
  REDIRECT = 'REDIRECT',
  ACKNOWLEDGE = 'ACKNOWLEDGE',
  THANK_AND_WAIT = 'THANK_AND_WAIT',
  END_INTERVIEW = 'END_INTERVIEW'
}

/**
 * Control instruction sent to the AI
 */
export interface ControlInstruction {
  type: ControlInstructionType;
  content: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Decision Engine
// =============================================================================

/**
 * Actions the decision engine can choose
 */
export enum DecisionAction {
  STAY_SILENT = 'STAY_SILENT',
  ASK_FOLLOWUP = 'ASK_FOLLOWUP',
  REDIRECT = 'REDIRECT',
  NEXT_QUESTION = 'NEXT_QUESTION',
  END_INTERVIEW = 'END_INTERVIEW'
}

/**
 * Result from the decision engine
 */
export interface DecisionResult {
  action: DecisionAction;
  instruction?: ControlInstruction;
  reason: string;
}

// =============================================================================
// Analysis Pipeline
// =============================================================================

/**
 * Result from the LLM analysis pipeline
 */
export interface AnalysisResult {
  completionConfidence: number; // 0-1
  isOffTopic: boolean;
  missingAspects: string[];
  suggestedFollowUp?: string;
}

/**
 * Input to the analysis pipeline
 */
export interface AnalysisInput {
  questionText: string;
  userTranscript: string;
  questionContext?: string;
}

// =============================================================================
// Audio & Transcription
// =============================================================================

/**
 * Audio frame received from WebRTC
 */
export interface AudioFrame {
  data: Buffer;
  sampleRate: number;
  channels: number;
  timestamp: number;
}

/**
 * Transcript event from STT service
 */
export interface TranscriptEvent {
  type: 'partial' | 'final';
  text: string;
  confidence: number;
  startTime: number;
  endTime: number;
  isFinal: boolean;
}

/**
 * STT service events
 */
export interface STTEvents {
  onPartialTranscript: (transcript: TranscriptEvent) => void;
  onFinalTranscript: (transcript: TranscriptEvent) => void;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  onError: (error: Error) => void;
}

// =============================================================================
// Session Configuration
// =============================================================================

/**
 * Configuration for an interview session
 */
export interface SessionConfig {
  userId: string;
  interviewId?: string;
  silenceThresholdMs: number;
  maxInterviewDurationMs: number;
  completionConfidenceThreshold: number;
  questions: InterviewQuestion[];
}

/**
 * Interview question definition
 */
export interface InterviewQuestion {
  id: string;
  text: string;
  order: number;
  category?: string;
  expectedAspects?: string[];
}

/**
 * Default session configuration
 */
export const DEFAULT_SESSION_CONFIG: Partial<SessionConfig> = {
  silenceThresholdMs: 4000, // 4 seconds
  maxInterviewDurationMs: 60 * 60 * 1000, // 1 hour
  completionConfidenceThreshold: 0.7
};

// =============================================================================
// Session Registry
// =============================================================================

/**
 * Session status for external queries
 */
export interface SessionStatus {
  sessionId: string;
  userId: string;
  phase: InterviewPhase;
  currentQuestionIndex: number;
  totalQuestions: number;
  startedAt: Date;
  elapsedTimeMs: number;
}

// =============================================================================
// Gemini Realtime API Types
// =============================================================================

/**
 * Realtime connection state
 */
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}



/**
 * System instructions for the AI
 */
export const AI_SYSTEM_INSTRUCTIONS = `You are a calm, neutral interviewer conducting a structured interview.

CRITICAL RULES:
1. Do NOT diagnose or analyze the user
2. Do NOT ask questions unless specifically instructed
3. ONLY speak when you receive an instruction to generate a response
4. NEVER interrupt the user while they are speaking
5. Be warm and empathetic but professional
6. Keep responses concise and focused
7. Do NOT track question numbers or interview progress
8. Follow instructions exactly as given

You will receive instructions telling you what to say. Obey these instructions precisely.`;

// =============================================================================
// Persistence Types
// =============================================================================

/**
 * Data to persist after interview completion
 */
export interface InterviewPersistenceData {
  sessionId: string;
  userId: string;
  interviewId: string;
  startedAt: Date;
  completedAt: Date;
  status: 'completed' | 'abandoned' | 'error';
  questions: PersistedQuestionData[];
  metadata?: Record<string, unknown>;
}

/**
 * Per-question data to persist
 */
export interface PersistedQuestionData {
  questionId: string;
  questionIndex: number;
  questionText: string;
  verbatimAnswer: string;
  completionConfidence: number;
  wasOffTopic: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

// =============================================================================
// Event Types
// =============================================================================

/**
 * Events emitted by the interview session
 */
export enum SessionEventType {
  INITIALIZED = 'INITIALIZED',
  QUESTION_STARTED = 'QUESTION_STARTED',
  QUESTION_COMPLETED = 'QUESTION_COMPLETED',
  TRANSCRIPT_UPDATE = 'TRANSCRIPT_UPDATE',
  AI_SPEAKING = 'AI_SPEAKING',
  AI_FINISHED = 'AI_FINISHED',
  SILENCE_DETECTED = 'SILENCE_DETECTED',
  USER_SPEAKING = 'USER_SPEAKING',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  INTERVIEW_ABANDONED = 'INTERVIEW_ABANDONED',
  ERROR = 'ERROR'
}

/**
 * Session event payload
 */
export interface SessionEvent {
  type: SessionEventType;
  sessionId: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}
