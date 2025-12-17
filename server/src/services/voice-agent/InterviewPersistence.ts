/**
 * Interview Persistence
 * Handles saving interview data to the database
 */

import {
    InterviewPersistenceData,
    PersistedQuestionData,
    InterviewState,
    QuestionData,
    InterviewPhase
} from './types';

export interface PersistenceConfig {
    enableCheckpointing?: boolean;
    checkpointIntervalMs?: number;
}

/**
 * Interview Persistence Layer
 * Handles incremental and final persistence of interview data
 */
export class InterviewPersistence {
    private config: Required<PersistenceConfig>;
    private checkpointTimer: NodeJS.Timeout | null = null;

    constructor(config: PersistenceConfig = {}) {
        this.config = {
            enableCheckpointing: config.enableCheckpointing ?? false,
            checkpointIntervalMs: config.checkpointIntervalMs ?? 60000 // 1 minute
        };
    }

    /**
     * Start periodic checkpointing
     */
    startCheckpointing(sessionId: string, getState: () => InterviewState): void {
        if (!this.config.enableCheckpointing) return;

        this.checkpointTimer = setInterval(async () => {
            try {
                const state = getState();
                await this.checkpoint(sessionId, state);
            } catch (error) {
                console.error(`[InterviewPersistence] Checkpoint failed for ${sessionId}:`, error);
            }
        }, this.config.checkpointIntervalMs);

        console.log(`[InterviewPersistence] Started checkpointing for session ${sessionId}`);
    }

    /**
     * Stop checkpointing
     */
    stopCheckpointing(): void {
        if (this.checkpointTimer) {
            clearInterval(this.checkpointTimer);
            this.checkpointTimer = null;
        }
    }

    /**
     * Save a checkpoint (partial state)
     */
    async checkpoint(sessionId: string, state: InterviewState): Promise<void> {
        console.log(`[InterviewPersistence] Saving checkpoint for session ${sessionId}`);

        // TODO: Implement actual database persistence
        // For now, just log
        const data = this.stateToPersistedData(state);

        // Example: Save to MongoDB or PostgreSQL
        // await db.interviewCheckpoints.upsert({
        //   sessionId,
        //   data,
        //   updatedAt: new Date()
        // });
    }

    /**
     * Persist completed interview
     */
    async persistCompleted(state: InterviewState): Promise<string> {
        console.log(`[InterviewPersistence] Persisting completed interview: ${state.sessionId}`);

        const data = this.stateToPersistedData(state);

        // TODO: Implement actual database persistence
        // Example:
        // const result = await db.completedInterviews.create({
        //   ...data,
        //   createdAt: new Date()
        // });
        // return result._id.toString();

        // For now, return session ID
        return state.sessionId;
    }

    /**
     * Persist abandoned interview
     */
    async persistAbandoned(state: InterviewState): Promise<string> {
        console.log(`[InterviewPersistence] Persisting abandoned interview: ${state.sessionId}`);

        const data = this.stateToPersistedData(state);
        data.status = 'abandoned';

        // TODO: Implement actual database persistence
        return state.sessionId;
    }

    /**
     * Persist error state
     */
    async persistError(state: InterviewState, error?: Error): Promise<string> {
        console.log(`[InterviewPersistence] Persisting error interview: ${state.sessionId}`);

        const data = this.stateToPersistedData(state);
        data.status = 'error';
        data.metadata = {
            ...data.metadata,
            errorMessage: error?.message,
            errorStack: error?.stack
        };

        // TODO: Implement actual database persistence
        return state.sessionId;
    }

    /**
     * Convert interview state to persistence format
     */
    private stateToPersistedData(state: InterviewState): InterviewPersistenceData {
        return {
            sessionId: state.sessionId,
            userId: state.userId,
            interviewId: state.sessionId, // Can be different if needed
            startedAt: state.startedAt,
            completedAt: state.completedAt || new Date(),
            status: this.phaseToStatus(state.phase),
            questions: state.questions.map(q => this.questionToPersistedData(q)),
            metadata: {
                totalQuestions: state.totalQuestions,
                completedQuestions: state.currentQuestionIndex,
                phase: state.phase
            }
        };
    }

    /**
     * Convert question data to persistence format
     */
    private questionToPersistedData(question: QuestionData): PersistedQuestionData {
        return {
            questionId: question.questionId,
            questionIndex: question.questionIndex,
            questionText: question.questionText,
            verbatimAnswer: question.verbatimTranscript,
            completionConfidence: question.completionConfidence,
            wasOffTopic: question.isOffTopic,
            startedAt: question.startedAt,
            completedAt: question.completedAt
        };
    }

    /**
     * Convert phase to status
     */
    private phaseToStatus(phase: InterviewPhase): 'completed' | 'abandoned' | 'error' {
        switch (phase) {
            case InterviewPhase.COMPLETED:
                return 'completed';
            case InterviewPhase.ABANDONED:
                return 'abandoned';
            case InterviewPhase.ERROR:
                return 'error';
            default:
                return 'abandoned'; // Default for incomplete
        }
    }

    /**
     * Load interview from persistence (for recovery)
     */
    async loadInterview(sessionId: string): Promise<InterviewState | null> {
        console.log(`[InterviewPersistence] Loading interview: ${sessionId}`);

        // TODO: Implement actual database loading
        // const data = await db.interviewCheckpoints.findOne({ sessionId });
        // if (data) return this.persistedDataToState(data);

        return null;
    }

    /**
     * Delete interview data
     */
    async deleteInterview(sessionId: string): Promise<void> {
        console.log(`[InterviewPersistence] Deleting interview: ${sessionId}`);

        // TODO: Implement actual database deletion
        // await db.interviewCheckpoints.deleteOne({ sessionId });
        // await db.completedInterviews.deleteOne({ sessionId });
    }

    /**
     * Cleanup
     */
    cleanup(): void {
        this.stopCheckpointing();
    }
}
