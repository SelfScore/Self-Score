/**
 * Voice Agent - Main Index
 * Exports all voice agent components
 */

// Types
export * from './types';

// Core Components
export { InterviewStateMachine } from './InterviewStateMachine';
export { SessionRegistry } from './SessionRegistry';
export { InterviewSession, InterviewSessionConfig } from './InterviewSession';

// Audio & Detection
export { AudioRouter, AudioDestination } from './AudioRouter';
export { SilenceDetector, SilenceDetectorConfig } from './SilenceDetector';

// External Services
export { GeminiRealtimeClient, GeminiRealtimeConfig } from './GeminiRealtimeClient';
export { STTService, STTServiceEvents } from './STTService';
export { DeepgramSTTProvider, DeepgramConfig } from './DeepgramSTTProvider';

// Analysis & Decision
export { AnalysisPipeline, AnalysisPipelineConfig } from './AnalysisPipeline';
export { DecisionEngine, DecisionEngineConfig } from './DecisionEngine';

// Questions & Persistence
export { QuestionManager, DEFAULT_INTERVIEW_QUESTIONS } from './QuestionManager';
export { InterviewPersistence, PersistenceConfig } from './InterviewPersistence';
