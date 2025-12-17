/**
 * Decision Engine
 * Deterministic action selection based on interview state and analysis
 */

import {
    DecisionAction,
    DecisionResult,
    ControlInstruction,
    ControlInstructionType,
    AnalysisResult,
    QuestionData,
    QuestionState
} from './types';

export interface DecisionEngineConfig {
    completionConfidenceThreshold: number;
    minTranscriptLength: number;
    maxFollowUpsPerQuestion: number;
}

const DEFAULT_CONFIG: DecisionEngineConfig = {
    completionConfidenceThreshold: 0.7,
    minTranscriptLength: 20,
    maxFollowUpsPerQuestion: 2
};

/**
 * Decision Engine
 * Makes deterministic decisions about what action to take
 */
export class DecisionEngine {
    private config: DecisionEngineConfig;
    private followUpCounts: Map<number, number> = new Map();

    constructor(config: Partial<DecisionEngineConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Evaluate and decide the next action
     * Called when silence is detected
     */
    evaluate(
        currentQuestion: QuestionData | null,
        analysis: AnalysisResult | null,
        totalQuestions: number,
        currentQuestionIndex: number
    ): DecisionResult {
        // No current question means interview is ending
        if (!currentQuestion) {
            return this.createDecision(
                DecisionAction.END_INTERVIEW,
                {
                    type: ControlInstructionType.END_INTERVIEW,
                    content: ''
                },
                'All questions completed'
            );
        }

        // Get follow-up count for current question
        const followUpCount = this.followUpCounts.get(currentQuestionIndex) || 0;

        // Evaluate conditions in order of priority
        const transcript = currentQuestion.verbatimTranscript.trim();

        // 1. Check if user has said anything
        if (transcript.length < this.config.minTranscriptLength) {
            // User hasn't really answered yet - stay silent
            return this.createDecision(
                DecisionAction.STAY_SILENT,
                undefined,
                'User has not provided a substantial response yet'
            );
        }

        // 2. Check if user is off-topic
        if (analysis?.isOffTopic) {
            return this.createDecision(
                DecisionAction.REDIRECT,
                {
                    type: ControlInstructionType.REDIRECT,
                    content: currentQuestion.questionText
                },
                'User response is off-topic'
            );
        }

        // 3. Check completion confidence
        const confidence = analysis?.completionConfidence ?? 0.5;

        if (confidence >= this.config.completionConfidenceThreshold) {
            // High confidence - move to next question
            if (currentQuestionIndex >= totalQuestions - 1) {
                // This was the last question
                return this.createDecision(
                    DecisionAction.END_INTERVIEW,
                    {
                        type: ControlInstructionType.END_INTERVIEW,
                        content: ''
                    },
                    'Final question answered with high confidence'
                );
            }

            return this.createDecision(
                DecisionAction.NEXT_QUESTION,
                {
                    type: ControlInstructionType.THANK_AND_WAIT,
                    content: ''
                },
                `High confidence (${confidence.toFixed(2)}) - moving to next question`
            );
        }

        // 4. Check if we can ask follow-up
        if (followUpCount < this.config.maxFollowUpsPerQuestion) {
            // Determine what to follow up on
            const followUpContent = this.determineFollowUp(analysis, currentQuestion);

            if (followUpContent) {
                this.followUpCounts.set(currentQuestionIndex, followUpCount + 1);

                return this.createDecision(
                    DecisionAction.ASK_FOLLOWUP,
                    {
                        type: ControlInstructionType.ASK_FOLLOWUP,
                        content: followUpContent
                    },
                    `Low confidence (${confidence.toFixed(2)}) - asking follow-up`
                );
            }
        }

        // 5. Max follow-ups reached or no clear follow-up needed
        // Move to next question even with lower confidence
        if (currentQuestionIndex >= totalQuestions - 1) {
            return this.createDecision(
                DecisionAction.END_INTERVIEW,
                {
                    type: ControlInstructionType.END_INTERVIEW,
                    content: ''
                },
                'Final question - max follow-ups reached'
            );
        }

        return this.createDecision(
            DecisionAction.NEXT_QUESTION,
            {
                type: ControlInstructionType.THANK_AND_WAIT,
                content: ''
            },
            `Max follow-ups reached - moving to next question`
        );
    }

    /**
     * Create a decision for asking a new question
     */
    createAskQuestionDecision(questionText: string): DecisionResult {
        return this.createDecision(
            DecisionAction.NEXT_QUESTION,
            {
                type: ControlInstructionType.ASK_QUESTION,
                content: questionText
            },
            'Asking new question'
        );
    }

    /**
     * Determine what to follow up on
     */
    private determineFollowUp(
        analysis: AnalysisResult | null,
        question: QuestionData
    ): string | null {
        // Use suggested follow-up from analysis if available
        if (analysis?.suggestedFollowUp) {
            return analysis.suggestedFollowUp;
        }

        // Use missing aspects if available
        if (analysis?.missingAspects && analysis.missingAspects.length > 0) {
            const missing = analysis.missingAspects[0];
            return `Please tell me more about ${missing}`;
        }

        // Use question's expected aspects
        if (question.missingAspects && question.missingAspects.length > 0) {
            const aspect = question.missingAspects[0];
            return `Could you elaborate on ${aspect}?`;
        }

        return null;
    }

    /**
     * Create a decision result
     */
    private createDecision(
        action: DecisionAction,
        instruction: ControlInstruction | undefined,
        reason: string
    ): DecisionResult {
        return { action, instruction, reason };
    }

    /**
     * Reset follow-up counts (for new question)
     */
    resetFollowUpCount(questionIndex: number): void {
        this.followUpCounts.delete(questionIndex);
    }

    /**
     * Reset all state
     */
    reset(): void {
        this.followUpCounts.clear();
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<DecisionEngineConfig>): void {
        this.config = { ...this.config, ...config };
    }
}
