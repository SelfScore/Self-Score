/**
 * Interview State Machine
 * Deterministic state tracking for the interview
 */

import {
    QuestionState,
    InterviewPhase,
    QuestionData,
    InterviewState,
    InterviewQuestion,
    SessionConfig
} from './types';

export class InterviewStateMachine {
    private state: InterviewState;

    constructor(sessionId: string, userId: string, questions: InterviewQuestion[]) {
        this.state = {
            sessionId,
            userId,
            currentQuestionIndex: 0,
            phase: InterviewPhase.INITIALIZING,
            startedAt: new Date(),
            totalQuestions: questions.length,
            questions: questions.map((q, index) => ({
                questionId: q.id,
                questionIndex: index,
                questionText: q.text,
                state: QuestionState.NOT_STARTED,
                verbatimTranscript: '',
                completionConfidence: 0,
                isOffTopic: false,
                missingAspects: q.expectedAspects || []
            }))
        };
    }

    // ==========================================================================
    // State Getters (Read-Only Access)
    // ==========================================================================

    /**
     * Get a readonly snapshot of the current state
     */
    getState(): Readonly<InterviewState> {
        return { ...this.state };
    }

    /**
     * Get current question index
     */
    getCurrentQuestionIndex(): number {
        return this.state.currentQuestionIndex;
    }

    /**
     * Get current question data
     */
    getCurrentQuestion(): Readonly<QuestionData> | null {
        if (this.state.currentQuestionIndex >= this.state.totalQuestions) {
            return null;
        }
        return { ...this.state.questions[this.state.currentQuestionIndex] };
    }

    /**
     * Get question data by index
     */
    getQuestion(index: number): Readonly<QuestionData> | null {
        if (index < 0 || index >= this.state.totalQuestions) {
            return null;
        }
        return { ...this.state.questions[index] };
    }

    /**
     * Get interview phase
     */
    getPhase(): InterviewPhase {
        return this.state.phase;
    }

    /**
     * Check if interview is active
     */
    isActive(): boolean {
        return this.state.phase === InterviewPhase.ACTIVE;
    }

    /**
     * Check if interview is complete
     */
    isComplete(): boolean {
        return this.state.phase === InterviewPhase.COMPLETED;
    }

    /**
     * Get number of completed questions
     */
    getCompletedQuestionsCount(): number {
        return this.state.questions.filter(
            q => q.state === QuestionState.FINAL_COMPLETE
        ).length;
    }

    // ==========================================================================
    // State Transitions
    // ==========================================================================

    /**
     * Mark interview as ready to start
     */
    setReady(): void {
        if (this.state.phase !== InterviewPhase.INITIALIZING) {
            throw new Error(`Cannot set ready from phase: ${this.state.phase}`);
        }
        this.state.phase = InterviewPhase.READY;
    }

    /**
     * Start the interview
     */
    startInterview(): void {
        if (this.state.phase !== InterviewPhase.READY) {
            throw new Error(`Cannot start interview from phase: ${this.state.phase}`);
        }
        this.state.phase = InterviewPhase.ACTIVE;
        this.state.startedAt = new Date();
    }

    /**
     * Start the current question
     */
    startCurrentQuestion(): void {
        const question = this.state.questions[this.state.currentQuestionIndex];
        if (!question) {
            throw new Error(`No question at index: ${this.state.currentQuestionIndex}`);
        }
        if (question.state !== QuestionState.NOT_STARTED) {
            throw new Error(`Question ${this.state.currentQuestionIndex} already started`);
        }
        question.state = QuestionState.IN_PROGRESS;
        question.startedAt = new Date();
    }

    /**
     * Append transcript to current question
     */
    appendTranscript(text: string): void {
        const question = this.state.questions[this.state.currentQuestionIndex];
        if (!question) {
            throw new Error(`No question at index: ${this.state.currentQuestionIndex}`);
        }
        if (question.state === QuestionState.NOT_STARTED) {
            // Auto-start question on first transcript
            question.state = QuestionState.IN_PROGRESS;
            question.startedAt = new Date();
        }
        question.verbatimTranscript += (question.verbatimTranscript ? ' ' : '') + text;
    }

    /**
     * Update analysis results for current question
     */
    updateAnalysis(
        completionConfidence: number,
        isOffTopic: boolean,
        missingAspects: string[]
    ): void {
        const question = this.state.questions[this.state.currentQuestionIndex];
        if (!question) {
            throw new Error(`No question at index: ${this.state.currentQuestionIndex}`);
        }
        question.completionConfidence = completionConfidence;
        question.isOffTopic = isOffTopic;
        question.missingAspects = missingAspects;
    }

    /**
     * Complete the current question and move to next
     */
    completeCurrentQuestion(): void {
        const question = this.state.questions[this.state.currentQuestionIndex];
        if (!question) {
            throw new Error(`No question at index: ${this.state.currentQuestionIndex}`);
        }
        question.state = QuestionState.FINAL_COMPLETE;
        question.completedAt = new Date();
        this.state.currentQuestionIndex++;

        // Check if interview is complete
        if (this.state.currentQuestionIndex >= this.state.totalQuestions) {
            this.state.phase = InterviewPhase.COMPLETING;
        }
    }

    /**
     * Move to a specific question index
     */
    goToQuestion(index: number): void {
        if (index < 0 || index >= this.state.totalQuestions) {
            throw new Error(`Invalid question index: ${index}`);
        }
        this.state.currentQuestionIndex = index;
    }

    /**
     * Complete the interview
     */
    completeInterview(): void {
        if (
            this.state.phase !== InterviewPhase.ACTIVE &&
            this.state.phase !== InterviewPhase.COMPLETING
        ) {
            throw new Error(`Cannot complete interview from phase: ${this.state.phase}`);
        }
        this.state.phase = InterviewPhase.COMPLETED;
        this.state.completedAt = new Date();
    }

    /**
     * Abandon the interview
     */
    abandonInterview(): void {
        this.state.phase = InterviewPhase.ABANDONED;
        this.state.completedAt = new Date();
    }

    /**
     * Set error state
     */
    setError(): void {
        this.state.phase = InterviewPhase.ERROR;
        this.state.completedAt = new Date();
    }

    // ==========================================================================
    // Serialization
    // ==========================================================================

    /**
     * Serialize state for persistence
     */
    toJSON(): InterviewState {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Restore state from persisted data
     */
    static fromJSON(data: InterviewState): InterviewStateMachine {
        const machine = Object.create(InterviewStateMachine.prototype);
        machine.state = {
            ...data,
            startedAt: new Date(data.startedAt),
            completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
            questions: data.questions.map(q => ({
                ...q,
                startedAt: q.startedAt ? new Date(q.startedAt) : undefined,
                completedAt: q.completedAt ? new Date(q.completedAt) : undefined
            }))
        };
        return machine;
    }
}
