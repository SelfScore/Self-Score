/**
 * Analysis Pipeline
 * Non-blocking LLM analysis for interview responses
 */

import axios, { CancelTokenSource } from 'axios';
import { AnalysisResult, AnalysisInput } from './types';

export interface AnalysisPipelineConfig {
    apiKey: string;
    model?: string;
    maxTokens?: number;
    timeout?: number;
}

/**
 * Analysis Pipeline using cheap/fast LLM
 * Analyzes user responses for completion, off-topic detection, and missing aspects
 */
export class AnalysisPipeline {
    private config: Required<AnalysisPipelineConfig>;
    private pendingAnalysis: Map<string, CancelTokenSource> = new Map();

    constructor(config: AnalysisPipelineConfig) {
        this.config = {
            apiKey: config.apiKey,
            model: config.model || 'gemini-2.0-flash-exp',
            maxTokens: config.maxTokens || 200,
            timeout: config.timeout || 5000
        };
    }

    /**
     * Analyze a user response (async, non-blocking)
     */
    async analyze(input: AnalysisInput): Promise<AnalysisResult> {
        const analysisId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const cancelSource = axios.CancelToken.source();
        this.pendingAnalysis.set(analysisId, cancelSource);

        try {
            const result = await this.performAnalysis(input, cancelSource);
            return result;
        } finally {
            this.pendingAnalysis.delete(analysisId);
        }
    }

    /**
     * Perform the actual LLM analysis
     */
    private async performAnalysis(
        input: AnalysisInput,
        cancelSource: CancelTokenSource
    ): Promise<AnalysisResult> {
        const prompt = this.buildAnalysisPrompt(input);

        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
                {
                    contents: [{
                        parts: [{ text: `System: You are an analysis assistant. Analyze interview responses and return JSON only.\n\nUser: ${prompt}` }]
                    }],
                    generationConfig: {
                        response_mime_type: "application/json"
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: this.config.timeout,
                    cancelToken: cancelSource.token
                }
            );

            // Gemini response structure: candidates[0].content.parts[0].text
            const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!content) {
                return this.getDefaultResult();
            }

            return this.parseAnalysisResponse(content);

        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('[AnalysisPipeline] Analysis cancelled');
            } else {
                console.error('[AnalysisPipeline] Error:', error);
            }
            return this.getDefaultResult();
        }
    }

    /**
     * Build the analysis prompt
     */
    private buildAnalysisPrompt(input: AnalysisInput): string {
        return `Analyze this interview response and return a JSON object with the analysis.

QUESTION: ${input.questionText}

USER'S RESPONSE: ${input.userTranscript}

${input.questionContext ? `CONTEXT: ${input.questionContext}` : ''}

Analyze and return JSON with these exact fields:
{
  "completionConfidence": <number 0-1, how completely the user answered the question>,
  "isOffTopic": <boolean, true if response is irrelevant to the question>,
  "missingAspects": <array of strings, key aspects not addressed>,
  "suggestedFollowUp": <string or null, suggested follow-up question if needed>
}

Guidelines:
- completionConfidence 0.8+ means the answer is thorough
- completionConfidence 0.5-0.8 means partial answer
- completionConfidence <0.5 means minimal or no real answer
- isOffTopic is only true if response has nothing to do with the question
- missingAspects should list 0-3 key missing points
- suggestedFollowUp should be a specific follow-up question or null`;
    }

    /**
     * Parse the LLM response
     */
    private parseAnalysisResponse(content: string): AnalysisResult {
        try {
            const parsed = JSON.parse(content);

            return {
                completionConfidence: this.clamp(parsed.completionConfidence ?? 0.5, 0, 1),
                isOffTopic: Boolean(parsed.isOffTopic),
                missingAspects: Array.isArray(parsed.missingAspects)
                    ? parsed.missingAspects.slice(0, 3)
                    : [],
                suggestedFollowUp: parsed.suggestedFollowUp || undefined
            };
        } catch {
            console.error('[AnalysisPipeline] Failed to parse response:', content);
            return this.getDefaultResult();
        }
    }

    /**
     * Get default result for errors
     */
    private getDefaultResult(): AnalysisResult {
        return {
            completionConfidence: 0.5,
            isOffTopic: false,
            missingAspects: [],
            suggestedFollowUp: undefined
        };
    }

    /**
     * Clamp a number to a range
     */
    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Cancel all pending analyses
     */
    cancelAll(): void {
        for (const [id, cancelSource] of this.pendingAnalysis) {
            cancelSource.cancel('Analysis cancelled');
        }
        this.pendingAnalysis.clear();
    }

    /**
     * Check if there are pending analyses
     */
    hasPendingAnalysis(): boolean {
        return this.pendingAnalysis.size > 0;
    }
}
