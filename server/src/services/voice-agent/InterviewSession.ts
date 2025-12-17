/**
 * Interview Session
 * Main orchestrator for a single interview session
 * Coordinates all components: state machine, audio, OpenAI, STT, analysis, decisions
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

import {
    SessionConfig,
    SessionStatus,
    InterviewPhase,
    AudioFrame,
    ControlInstructionType,
    DecisionAction,
    SessionEventType,
    SessionEvent,
    AnalysisResult,
    DEFAULT_SESSION_CONFIG
} from './types';
import { InterviewStateMachine } from './InterviewStateMachine';
import { AudioRouter } from './AudioRouter';
import { SilenceDetector } from './SilenceDetector';
import { GeminiRealtimeClient, GeminiRealtimeConfig } from './GeminiRealtimeClient';
import { STTService } from './STTService';
import { DeepgramSTTProvider, DeepgramConfig } from './DeepgramSTTProvider';
import { AnalysisPipeline, AnalysisPipelineConfig } from './AnalysisPipeline';
import { DecisionEngine } from './DecisionEngine';
import { QuestionManager } from './QuestionManager';
import { InterviewPersistence } from './InterviewPersistence';

export interface InterviewSessionConfig {
    userId: string;
    geminiApiKey: string;
    sttApiKey: string;
    analysisApiKey: string; // Made required or at least explicit that it's separate
    silenceThresholdMs?: number;
    maxInterviewDurationMs?: number;
    completionConfidenceThreshold?: number;
    questions?: ReturnType<QuestionManager['getAllQuestions']>;
}

export class InterviewSession extends EventEmitter {
    // Core identifiers
    private sessionId: string;
    private userId: string;

    // Components
    private stateMachine: InterviewStateMachine;
    private audioRouter: AudioRouter;
    private silenceDetector: SilenceDetector;
    private voiceClient: GeminiRealtimeClient;
    private sttService: STTService;
    private analysisPipeline: AnalysisPipeline;
    private decisionEngine: DecisionEngine;
    private questionManager: QuestionManager;
    private persistence: InterviewPersistence;

    // State
    private isAISpeaking: boolean = false;
    private lastAnalysisResult: AnalysisResult | null = null;
    private interviewTimeout: NodeJS.Timeout | null = null;
    private config: SessionConfig;

    private constructor(
        sessionId: string,
        config: InterviewSessionConfig
    ) {
        super();
        this.sessionId = sessionId;
        this.userId = config.userId;

        // Initialize question manager
        this.questionManager = config.questions
            ? QuestionManager.createWithQuestions(config.questions)
            : new QuestionManager();

        // Build session config
        this.config = {
            userId: config.userId,
            silenceThresholdMs: config.silenceThresholdMs ?? DEFAULT_SESSION_CONFIG.silenceThresholdMs!,
            maxInterviewDurationMs: config.maxInterviewDurationMs ?? DEFAULT_SESSION_CONFIG.maxInterviewDurationMs!,
            completionConfidenceThreshold: config.completionConfidenceThreshold ?? DEFAULT_SESSION_CONFIG.completionConfidenceThreshold!,
            questions: this.questionManager.getAllQuestions()
        };

        // Initialize state machine
        this.stateMachine = new InterviewStateMachine(
            sessionId,
            config.userId,
            this.config.questions
        );

        // Initialize audio router
        this.audioRouter = new AudioRouter();

        // Initialize silence detector
        this.silenceDetector = new SilenceDetector({
            silenceThresholdMs: this.config.silenceThresholdMs
        });

        // Initialize Gemini client
        this.voiceClient = new GeminiRealtimeClient(sessionId, {
            apiKey: config.geminiApiKey,
            voice: 'Puck',
            model: 'models/gemini-2.0-flash-exp'
        });

        // Initialize STT service (Deepgram)
        this.sttService = new DeepgramSTTProvider(sessionId, {
            apiKey: config.sttApiKey
        });

        // Initialize analysis pipeline
        this.analysisPipeline = new AnalysisPipeline({
            apiKey: config.analysisApiKey
        });

        // Initialize decision engine
        this.decisionEngine = new DecisionEngine({
            completionConfidenceThreshold: this.config.completionConfidenceThreshold
        });

        // Initialize persistence
        this.persistence = new InterviewPersistence();

        // Setup event handlers
        this.setupEventHandlers();
    }

    /**
     * Create a new interview session (factory method)
     */
    static async create(
        sessionId: string,
        userId: string,
        config: Omit<InterviewSessionConfig, 'userId'>
    ): Promise<InterviewSession> {
        const session = new InterviewSession(sessionId, {
            ...config,
            userId
        });

        await session.initialize();
        return session;
    }

    /**
     * Initialize all connections
     */
    private async initialize(): Promise<void> {
        console.log(`[InterviewSession:${this.sessionId}] Initializing...`);

        try {
            // Setup audio routing destinations
            this.audioRouter.addDestination({
                name: 'gemini',
                send: (frame) => this.voiceClient.sendAudio(frame),
                isReady: () => this.voiceClient.isConnected()
            });

            this.audioRouter.addDestination({
                name: 'stt',
                send: (frame) => this.sttService.sendAudio(frame),
                isReady: () => this.sttService.isReady()
            });

            // Connect to services
            await Promise.all([
                this.voiceClient.connect(),
                this.sttService.start()
            ]);

            // Start audio routing
            this.audioRouter.start();

            // Mark as ready
            this.stateMachine.setReady();

            console.log(`[InterviewSession:${this.sessionId}] Initialized successfully`);
            this.emitEvent(SessionEventType.INITIALIZED);

        } catch (error) {
            console.error(`[InterviewSession:${this.sessionId}] Initialization failed:`, error);
            this.stateMachine.setError();
            throw error;
        }
    }

    /**
     * Setup event handlers for all components
     */
    private setupEventHandlers(): void {
        // Audio router events
        this.audioRouter.on('audioReceived', () => {
            this.silenceDetector.onAudioActivity();
        });

        // Silence detector events
        this.silenceDetector.on('silenceDetected', () => {
            this.handleSilenceDetected();
        });

        this.silenceDetector.on('activityDetected', () => {
            this.emitEvent(SessionEventType.USER_SPEAKING);
        });

        // Gemini events
        this.voiceClient.on('audioResponse', (audio: Buffer) => {
            this.isAISpeaking = true;
            this.emitEvent(SessionEventType.AI_SPEAKING);
            // Forward AI audio to frontend via WebRTC
            this.emit('aiAudio', audio);
        });

        this.voiceClient.on('audioResponseComplete', () => {
            this.isAISpeaking = false;
            this.emitEvent(SessionEventType.AI_FINISHED);
        });

        // Gemini might not provide user transcript or VAD events directly in this implementation
        // We rely on Deepgram STT for user transcripts and generic audio activity for silence detection.

        this.voiceClient.on('error', (error) => {
            this.handleError(error);
        });

        // STT events (backup/additional transcription)
        this.sttService.on('partialTranscript', () => {
            this.silenceDetector.onPartialTranscript();
        });

        this.sttService.on('finalTranscript', (event) => {
            // Use STT transcript if OpenAI transcript is not available
            this.silenceDetector.onFinalTranscript();
        });

        this.sttService.on('error', (error) => {
            console.error(`[InterviewSession:${this.sessionId}] STT Error:`, error);
            // STT errors are non-fatal - OpenAI also provides transcription
        });
    }

    /**
     * Start the interview
     */
    async startInterview(): Promise<void> {
        if (this.stateMachine.getPhase() !== InterviewPhase.READY) {
            throw new Error('Session not ready to start');
        }

        console.log(`[InterviewSession:${this.sessionId}] Starting interview`);

        // Start state machine
        this.stateMachine.startInterview();

        // Set max duration timeout
        this.interviewTimeout = setTimeout(() => {
            console.log(`[InterviewSession:${this.sessionId}] Interview timeout reached`);
            this.endInterview('timeout');
        }, this.config.maxInterviewDurationMs);

        // Start persistence checkpointing
        this.persistence.startCheckpointing(
            this.sessionId,
            () => this.stateMachine.getState()
        );

        // Ask first question
        await this.askCurrentQuestion();

        this.emitEvent(SessionEventType.QUESTION_STARTED, {
            questionIndex: 0
        });
    }

    /**
     * Handle incoming audio from WebRTC
     */
    handleIncomingAudio(audio: Buffer): void {
        if (!this.stateMachine.isActive()) return;

        // If AI is speaking and user starts, cancel AI response
        if (this.isAISpeaking) {
            this.voiceClient.cancelResponse();
            this.isAISpeaking = false;
        }

        // Route audio to all destinations
        this.audioRouter.routeRawAudio(audio);
    }

    /**
     * Handle user transcript
     */
    private handleUserTranscript(transcript: string): void {
        if (!this.stateMachine.isActive()) return;

        // Append to current question
        this.stateMachine.appendTranscript(transcript);

        this.emitEvent(SessionEventType.TRANSCRIPT_UPDATE, {
            transcript,
            questionIndex: this.stateMachine.getCurrentQuestionIndex()
        });

        // Trigger analysis (non-blocking)
        this.triggerAnalysis();
    }

    /**
     * Trigger background analysis
     */
    private async triggerAnalysis(): Promise<void> {
        const question = this.stateMachine.getCurrentQuestion();
        if (!question) return;

        try {
            const result = await this.analysisPipeline.analyze({
                questionText: question.questionText,
                userTranscript: question.verbatimTranscript
            });

            this.lastAnalysisResult = result;

            // Update state machine with analysis
            this.stateMachine.updateAnalysis(
                result.completionConfidence,
                result.isOffTopic,
                result.missingAspects
            );

        } catch (error) {
            console.error(`[InterviewSession:${this.sessionId}] Analysis error:`, error);
            // Non-fatal - continue without analysis
        }
    }

    /**
     * Handle silence detected
     */
    private async handleSilenceDetected(): Promise<void> {
        if (!this.stateMachine.isActive()) return;
        if (this.isAISpeaking) return; // Don't act while AI is speaking

        this.emitEvent(SessionEventType.SILENCE_DETECTED);

        const currentQuestion = this.stateMachine.getCurrentQuestion();
        const totalQuestions = this.questionManager.getTotalQuestions();
        const currentIndex = this.stateMachine.getCurrentQuestionIndex();

        // Make decision
        const decision = this.decisionEngine.evaluate(
            currentQuestion,
            this.lastAnalysisResult,
            totalQuestions,
            currentIndex
        );

        console.log(`[InterviewSession:${this.sessionId}] Decision: ${decision.action} - ${decision.reason}`);

        // Execute decision
        await this.executeDecision(decision);
    }

    /**
     * Execute a decision from the decision engine
     */
    private async executeDecision(decision: ReturnType<DecisionEngine['evaluate']>): Promise<void> {
        switch (decision.action) {
            case DecisionAction.STAY_SILENT:
                // Do nothing, wait for more input
                break;

            case DecisionAction.ASK_FOLLOWUP:
            case DecisionAction.REDIRECT:
                if (decision.instruction) {
                    this.voiceClient.sendControlInstruction(decision.instruction);
                }
                break;

            case DecisionAction.NEXT_QUESTION:
                // Complete current question
                this.stateMachine.completeCurrentQuestion();
                this.emitEvent(SessionEventType.QUESTION_COMPLETED, {
                    questionIndex: this.stateMachine.getCurrentQuestionIndex() - 1
                });

                // Clear analysis for new question
                this.lastAnalysisResult = null;
                this.decisionEngine.resetFollowUpCount(this.stateMachine.getCurrentQuestionIndex());

                // Ask next question
                await this.askCurrentQuestion();
                break;

            case DecisionAction.END_INTERVIEW:
                await this.endInterview('completed');
                break;
        }
    }

    /**
     * Ask the current question
     */
    private async askCurrentQuestion(): Promise<void> {
        const question = this.stateMachine.getCurrentQuestion();
        if (!question) {
            await this.endInterview('completed');
            return;
        }

        // Start the question in state machine
        if (question.state === 'NOT_STARTED') {
            this.stateMachine.startCurrentQuestion();
        }

        // Send instruction to AI to ask the question
        this.voiceClient.sendControlInstruction({
            type: ControlInstructionType.ASK_QUESTION,
            content: question.questionText
        });

        this.emitEvent(SessionEventType.QUESTION_STARTED, {
            questionIndex: question.questionIndex
        });
    }

    /**
     * End the interview
     */
    async endInterview(reason: 'completed' | 'abandoned' | 'timeout' | 'error'): Promise<void> {
        console.log(`[InterviewSession:${this.sessionId}] Ending interview: ${reason}`);

        // Clear timeout
        if (this.interviewTimeout) {
            clearTimeout(this.interviewTimeout);
            this.interviewTimeout = null;
        }

        // Update state based on reason
        if (reason === 'completed') {
            // Send end instruction to AI
            this.voiceClient.sendControlInstruction({
                type: ControlInstructionType.END_INTERVIEW,
                content: ''
            });
            this.stateMachine.completeInterview();
            await this.persistence.persistCompleted(this.stateMachine.getState());
        } else if (reason === 'abandoned' || reason === 'timeout') {
            this.stateMachine.abandonInterview();
            await this.persistence.persistAbandoned(this.stateMachine.getState());
        } else {
            this.stateMachine.setError();
            await this.persistence.persistError(this.stateMachine.getState());
        }

        this.emitEvent(
            reason === 'completed'
                ? SessionEventType.INTERVIEW_COMPLETED
                : SessionEventType.INTERVIEW_ABANDONED,
            { reason }
        );
    }

    /**
     * Handle errors
     */
    private handleError(error: Error): void {
        console.error(`[InterviewSession:${this.sessionId}] Error:`, error);
        this.emitEvent(SessionEventType.ERROR, { error: error.message });
    }

    /**
     * Get session status
     */
    getStatus(): SessionStatus {
        const state = this.stateMachine.getState();
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            phase: state.phase,
            currentQuestionIndex: state.currentQuestionIndex,
            totalQuestions: state.totalQuestions,
            startedAt: state.startedAt,
            elapsedTimeMs: Date.now() - state.startedAt.getTime()
        };
    }

    /**
     * Get user ID
     */
    getUserId(): string {
        return this.userId;
    }

    /**
     * Get session ID
     */
    getSessionId(): string {
        return this.sessionId;
    }

    /**
     * Get interview state
     */
    getState() {
        return this.stateMachine.getState();
    }

    /**
     * Emit a session event
     */
    private emitEvent(type: SessionEventType, data?: Record<string, unknown>): void {
        const event: SessionEvent = {
            type,
            sessionId: this.sessionId,
            timestamp: new Date(),
            data
        };
        this.emit('sessionEvent', event);
    }

    /**
     * Cleanup all resources
     */
    async cleanup(): Promise<void> {
        console.log(`[InterviewSession:${this.sessionId}] Cleaning up...`);

        // Stop timeout
        if (this.interviewTimeout) {
            clearTimeout(this.interviewTimeout);
        }

        // Cancel pending analyses
        this.analysisPipeline.cancelAll();

        // Stop silence detector
        this.silenceDetector.destroy();

        // Stop audio routing
        this.audioRouter.destroy();

        // Disconnect services
        await Promise.all([
            this.voiceClient.disconnect(),
            this.sttService.cleanup()
        ]);

        // Stop persistence
        this.persistence.cleanup();

        // Remove all event listeners
        this.removeAllListeners();

        console.log(`[InterviewSession:${this.sessionId}] Cleanup complete`);
    }
}
