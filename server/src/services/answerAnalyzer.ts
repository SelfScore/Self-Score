import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../types/realtimeInterview.types";

/**
 * AnswerAnalyzer - Uses Gemini Flash to analyze interview answers
 * Determines completeness, confidence, and relevance
 */
export class AnswerAnalyzer {
  private genAI: GoogleGenerativeAI;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";

    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
    console.log("✅ Answer Analyzer initialized");
  }

  /**
   * Analyze an interview answer
   */
  async analyzeAnswer(
    question: string,
    answer: string,
    currentQuestionIndex?: number
  ): Promise<AnalysisResult> {
    try {
      // Don't analyze very short answers
      if (answer.length < 20) {
        return {
          confidence: 10,
          isComplete: false,
          isOffTopic: false,
          missingAspects: ["Answer is too short"],
          suggestedFollowUp:
            "Could you please provide more detail in your answer?",
        };
      }

      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      const prompt = `You are analyzing a user's answer to an interview question for a professional life assessment.

**Question ${currentQuestionIndex !== undefined ? currentQuestionIndex + 1 : ""
        }:** ${question}

**User's Answer:** ${answer}

**Context:** This is a Level 4 life assessment interview. The user is expected to provide thoughtful, genuine responses.

Analyze the answer and provide a structured evaluation with the following:

1. **confidence** (number 0-100): How well the answer addresses the question
2. **isComplete** (boolean): Whether the answer sufficiently covers the question
3. **isOffTopic** (boolean): Whether the user stayed on topic
4. **missingAspects** (array of strings): Specific aspects that are missing or need clarification
5. **suggestedFollowUp** (string): A natural, empathetic follow-up question to ask (ONLY if confidence < 60%)

**Scoring Guidelines:**
- **80-100**: Comprehensive, thoughtful, addresses all aspects with depth
- **60-79**: Good answer but could use more depth, examples, or emotional context
- **40-59**: Basic answer provided but needs significant follow-up or clarification
- **0-39**: Off-topic, minimal response, or completely unclear

**Follow-Up Guidelines:**
- If confidence >= 60%, leave suggestedFollowUp as empty string
- If confidence < 60%, provide ONE specific, natural follow-up question
- Focus on the MOST important missing aspect
- Be empathetic and encouraging in tone
- Examples:
  * "Can you share a specific example of when you felt that way?"
  * "How did that experience affect you emotionally?"
  * "What would you say is the biggest impact of that on your daily life?"

Return ONLY valid JSON with this EXACT structure (no markdown, no extra text):
{
  "confidence": 75,
  "isComplete": true,
  "isOffTopic": false,
  "missingAspects": ["emotional depth", "specific examples"],
  "suggestedFollowUp": "Can you share a specific moment when you experienced that feeling?"
}`;

      console.log(`🔍 Sending analysis request to Gemini Flash...`);
      const startTime = Date.now();

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const analysisTime = Date.now() - startTime;
      console.log(`✅ Analysis completed in ${analysisTime}ms`);

      // Parse JSON response
      let analysis: AnalysisResult;
      try {
        // Clean up response (remove markdown code blocks if present)
        const cleanedText = responseText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        analysis = JSON.parse(cleanedText);

        // Validate structure
        if (
          typeof analysis.confidence !== "number" ||
          typeof analysis.isComplete !== "boolean" ||
          typeof analysis.isOffTopic !== "boolean" ||
          !Array.isArray(analysis.missingAspects) ||
          typeof analysis.suggestedFollowUp !== "string"
        ) {
          throw new Error("Invalid analysis structure");
        }

        console.log(`📊 Analysis result:`, {
          confidence: analysis.confidence,
          isComplete: analysis.isComplete,
          isOffTopic: analysis.isOffTopic,
          missingAspectsCount: analysis.missingAspects.length,
          hasFollowUp: analysis.suggestedFollowUp.length > 0,
        });

        return analysis;
      } catch (parseError) {
        console.error("❌ Failed to parse analysis response:", responseText);
        throw new Error(`Invalid analysis response format: ${parseError}`);
      }
    } catch (error) {
      console.error("❌ Error analyzing answer:", error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Quick analysis for real-time decision making (faster, less detailed)
   */
  async quickAnalyze(
    answer: string
  ): Promise<{ isSubstantial: boolean; wordCount: number }> {
    const wordCount = answer.split(/\s+/).length;
    const isSubstantial = wordCount >= 20 && answer.length >= 100;

    return {
      isSubstantial,
      wordCount,
    };
  }

  /**
   * Default analysis when API fails
   */
  private getDefaultAnalysis(): AnalysisResult {
    return {
      confidence: 50,
      isComplete: false,
      isOffTopic: false,
      missingAspects: ["Unable to analyze - technical issue"],
      suggestedFollowUp: "Could you please elaborate on your answer?",
    };
  }
}

// Singleton instance
const answerAnalyzer = new AnswerAnalyzer();
export default answerAnalyzer;