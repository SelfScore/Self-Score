import { Request, Response } from "express";
import AIInterviewModel, { InterviewMode, InterviewStatus } from "../models/aiInterview";
import AIFeedbackModel from "../models/aiFeedback";
import Level4QuestionModel from "../models/level4Question";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Start a new AI interview session for Level 4
 */
export const startInterview = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { mode } = req.body; // TEXT or VOICE

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
            return;
        }

        if (!mode || !Object.values(InterviewMode).includes(mode)) {
            res.status(400).json({
                success: false,
                message: "Invalid interview mode. Must be TEXT or VOICE"
            });
            return;
        }

        // Check if user has an active interview
        const existingInterview = await AIInterviewModel.findOne({
            userId,
            level: 4,
            status: InterviewStatus.IN_PROGRESS
        });

        if (existingInterview) {
            // If mode doesn't match, allow mode switching while preserving answers
            if (existingInterview.mode !== mode) {
                console.log(`Mode switch detected: ${existingInterview.mode} -> ${mode}. Updating interview mode while preserving answers.`);
                
                // Update the mode to the new one
                existingInterview.mode = mode;
                
                // Initialize transcript array if switching to VOICE mode and it doesn't exist
                if (mode === InterviewMode.VOICE && !existingInterview.transcript) {
                    existingInterview.transcript = [];
                }
                
                await existingInterview.save();
                
                // Return the updated interview with preserved answers
                res.status(200).json({
                    success: true,
                    message: `Switched to ${mode} mode. Your previous answers are preserved.`,
                    data: {
                        interviewId: existingInterview._id,
                        mode: existingInterview.mode,
                        questions: existingInterview.questions,
                        answers: existingInterview.answers,
                        transcript: existingInterview.transcript,
                        progress: existingInterview.answers.length
                    }
                });
                return;
            } else {
                // Same mode, resume existing interview
                res.status(200).json({
                    success: true,
                    message: "Resuming existing interview",
                    data: {
                        interviewId: existingInterview._id,
                        mode: existingInterview.mode,
                        questions: existingInterview.questions,
                        answers: existingInterview.answers,
                        transcript: existingInterview.transcript,
                        progress: existingInterview.answers.length
                    }
                });
                return;
            }
        }

        // Fetch Level 4 questions from database
        const dbQuestions = await Level4QuestionModel.find({ level: 4 }).sort({ order: 1 });
        
        if (!dbQuestions || dbQuestions.length === 0) {
            res.status(500).json({
                success: false,
                message: "Level 4 questions not found in database. Please contact administrator."
            });
            return;
        }

        // Transform questions to match the expected format
        const questions = dbQuestions.map(q => ({
            questionId: q.questionId,
            questionText: q.questionText,
            questionOrder: q.order
        }));

        // Calculate attempt number for this user
        const previousAttempts = await AIInterviewModel.countDocuments({
            userId,
            level: 4,
            status: { $in: [InterviewStatus.PENDING_REVIEW, InterviewStatus.REVIEWED] }
        });
        const attemptNumber = previousAttempts + 1;

        // Create new interview session
        const interview = await AIInterviewModel.create({
            userId,
            level: 4,
            mode,
            status: InterviewStatus.IN_PROGRESS,
            attemptNumber,
            questions: questions,
            answers: [],
            transcript: mode === InterviewMode.VOICE ? [] : undefined,
            startedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: "Interview started successfully",
            data: {
                interviewId: interview._id,
                mode: interview.mode,
                questions: interview.questions,
                progress: 0
            }
        });

    } catch (error: any) {
        console.error("Error starting interview:", error);
        res.status(500).json({
            success: false,
            message: "Failed to start interview",
            error: error.message
        });
    }
};

/**
 * Submit an answer for text mode
 */
export const submitTextAnswer = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { interviewId, questionId, answerText } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
            return;
        }

        if (!interviewId || !questionId || !answerText) {
            res.status(400).json({
                success: false,
                message: "Interview ID, question ID, and answer text are required"
            });
            return;
        }

        const interview = await AIInterviewModel.findOne({
            _id: interviewId,
            userId,
            status: InterviewStatus.IN_PROGRESS
        });

        if (!interview) {
            res.status(404).json({
                success: false,
                message: "Interview not found or already completed"
            });
            return;
        }

        // Check if answer already exists
        const existingAnswerIndex = interview.answers.findIndex(
            a => a.questionId === questionId
        );

        if (existingAnswerIndex >= 0) {
            // Update existing answer
            interview.answers[existingAnswerIndex] = {
                questionId,
                answerText,
                timestamp: new Date()
            };
        } else {
            // Add new answer
            interview.answers.push({
                questionId,
                answerText,
                timestamp: new Date()
            });
        }

        await interview.save();

        const isComplete = interview.answers.length === interview.questions.length;

        res.status(200).json({
            success: true,
            message: "Answer submitted successfully",
            data: {
                progress: interview.answers.length,
                totalQuestions: interview.questions.length,
                isComplete
            }
        });

    } catch (error: any) {
        console.error("Error submitting answer:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit answer",
            error: error.message
        });
    }
};

/**
 * Add transcript entry for voice mode
 */
export const addTranscript = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { interviewId, role, content, questionId } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
            return;
        }

        if (!interviewId || !role || !content) {
            res.status(400).json({
                success: false,
                message: "Interview ID, role, and content are required"
            });
            return;
        }

        const interview = await AIInterviewModel.findOne({
            _id: interviewId,
            userId,
            status: InterviewStatus.IN_PROGRESS
        });

        if (!interview) {
            res.status(404).json({
                success: false,
                message: "Interview not found or already completed"
            });
            return;
        }

        if (!interview.transcript) {
            interview.transcript = [];
        }

        interview.transcript.push({
            role,
            content,
            questionId, // Include questionId to link voice answers to questions
            timestamp: new Date()
        });

        await interview.save();

        res.status(200).json({
            success: true,
            message: "Transcript added successfully"
        });

    } catch (error: any) {
        console.error("Error adding transcript:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add transcript",
            error: error.message
        });
    }
};

/**
 * Complete interview and generate feedback
 */
export const completeInterview = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { interviewId } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
            return;
        }

        const interview = await AIInterviewModel.findOne({
            _id: interviewId,
            userId,
            status: InterviewStatus.IN_PROGRESS
        });

        if (!interview) {
            res.status(404).json({
                success: false,
                message: "Interview not found or already completed"
            });
            return;
        }

        // Debug logging
        console.log(`Interview mode: ${interview.mode}`);
        console.log(`Answers count: ${interview.answers.length}`);
        console.log(`Transcript count: ${interview.transcript?.length || 0}`);

        // Check if enough content is provided
        // For mixed mode (mode switching), check total answered questions across both text and voice
        const totalQuestions = interview.questions.length;
        
        // Count text answers
        const textAnsweredQuestions = interview.answers.length;
        
        // Count voice answers from transcript (count user responses only)
        const voiceAnsweredQuestions = interview.transcript
            ? interview.transcript.filter((entry: any) => entry.role === 'user').length
            : 0;
        
        // Get question IDs that have been answered
        const answeredQuestionIds = new Set<string>();
        
        // Add text answer question IDs
        interview.answers.forEach((answer: any) => {
            answeredQuestionIds.add(answer.questionId);
        });
        
        // Add voice answer question IDs from transcript
        // Match user responses to questions based on order
        if (interview.transcript) {
            let questionIndex = 0;
            for (const entry of interview.transcript) {
                if (entry.role === 'user' && questionIndex < interview.questions.length) {
                    answeredQuestionIds.add(interview.questions[questionIndex].questionId);
                    questionIndex++;
                }
            }
        }
        
        const totalAnsweredQuestions = answeredQuestionIds.size;
        
        console.log(`Text answers: ${textAnsweredQuestions}, Voice answers: ${voiceAnsweredQuestions}, Total unique: ${totalAnsweredQuestions}`);
        
        // Check if all questions have been answered (either via text or voice)
        if (totalAnsweredQuestions < totalQuestions) {
            res.status(400).json({
                success: false,
                message: `Please answer all questions. ${totalAnsweredQuestions}/${totalQuestions} answered.`
            });
            return;
        }

        // Mark interview as pending review (no longer auto-generating AI feedback)
        interview.status = InterviewStatus.PENDING_REVIEW;
        interview.completedAt = new Date();
        interview.submittedAt = new Date();
        await interview.save();

        console.log(`User ${userId} submitted Level 4 interview ${interviewId} (Attempt #${interview.attemptNumber}). Status: PENDING_REVIEW`);

        res.status(200).json({
            success: true,
            message: "Interview submitted successfully. Your submission is now under review by our team.",
            data: {
                interviewId: interview._id,
                status: interview.status,
                attemptNumber: interview.attemptNumber,
                submittedAt: interview.submittedAt
            }
        });

    } catch (error: any) {
        console.error("Error completing interview:", error);
        res.status(500).json({
            success: false,
            message: "Failed to complete interview",
            error: error.message
        });
    }
};

/**
 * Generate AI feedback using Google Gemini
 * NOTE: This function is deprecated - Admin now provides manual reviews instead
 * Keeping for reference/backward compatibility only
 */
async function generateFeedback(interview: any) {
    try {
        console.log("Starting feedback generation...");
        // Use gemini-2.5-flash - the latest model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Prepare the content for analysis
        let contentToAnalyze = "";
        
        if (interview.mode === InterviewMode.TEXT) {
            // For text mode, format Q&A pairs
            contentToAnalyze = interview.questions.map((q: any) => {
                const answer = interview.answers.find((a: any) => a.questionId === q.questionId);
                return `Question: ${q.questionText}\nAnswer: ${answer?.answerText || 'No answer provided'}\n`;
            }).join('\n');
        } else {
            // For voice mode, use transcript
            contentToAnalyze = interview.transcript?.map((t: any) => 
                `${t.role.toUpperCase()}: ${t.content}`
            ).join('\n') || '';
        }

        console.log(`Content length: ${contentToAnalyze.length} characters`);

        const prompt = `You are an expert life coach and psychologist evaluating a Level 4 "Mastery Test" for life management and emotional intelligence. 
        
Analyze the following responses and provide a comprehensive assessment:

${contentToAnalyze}

Evaluate the candidate across these 5 categories and provide scores (0-100) and detailed comments:

1. **Emotional Intelligence**: Ability to recognize, understand, and manage emotions
2. **Decision-Making Skills**: Quality of decision-making process and strategic thinking
3. **Life Balance & Management**: Ability to balance different life aspects effectively
4. **Self-Awareness & Growth**: Level of self-reflection and commitment to personal development
5. **Resilience & Stress Management**: Ability to handle challenges and maintain well-being

Provide your response in the following JSON format:
{
  "totalScore": <number 0-100>,
  "categoryScores": [
    {"name": "Emotional Intelligence", "score": <number>, "comment": "<detailed comment>"},
    {"name": "Decision-Making Skills", "score": <number>, "comment": "<detailed comment>"},
    {"name": "Life Balance & Management", "score": <number>, "comment": "<detailed comment>"},
    {"name": "Self-Awareness & Growth", "score": <number>, "comment": "<detailed comment>"},
    {"name": "Resilience & Stress Management", "score": <number>, "comment": "<detailed comment>"}
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "finalAssessment": "<comprehensive 200-300 word assessment>",
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>", "<actionable recommendation 4>"]
}

Be thorough, honest, and constructive in your evaluation.`;

        console.log("Sending request to Gemini AI...");
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        console.log("Received response from Gemini AI");
        
        // Parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Failed to extract JSON from AI response:", response);
            throw new Error("Failed to parse AI response - no JSON found");
        }
        
        console.log("Parsing JSON response...");
        const feedbackData = JSON.parse(jsonMatch[0]);
        console.log("Feedback data parsed successfully");

        // Save feedback to database
        console.log("Saving feedback to database...");
        const feedback = await AIFeedbackModel.create({
            userId: interview.userId,
            interviewId: interview._id,
            level: 4,
            totalScore: feedbackData.totalScore,
            categoryScores: feedbackData.categoryScores,
            strengths: feedbackData.strengths,
            areasForImprovement: feedbackData.areasForImprovement,
            finalAssessment: feedbackData.finalAssessment,
            recommendations: feedbackData.recommendations
        });

        console.log("Feedback saved successfully, ID:", feedback._id);

        // Update interview with feedback reference
        interview.feedbackId = feedback._id;
        await interview.save();

        return feedback;

    } catch (error: any) {
        console.error("Error generating feedback - Details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw new Error("Failed to generate feedback: " + error.message);
    }
}

/**
 * Get interview feedback
 */
export const getFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { interviewId } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
            return;
        }

        const feedback = await AIFeedbackModel.findOne({
            interviewId,
            userId
        });

        if (!feedback) {
            res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: feedback
        });

    } catch (error: any) {
        console.error("Error getting feedback:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get feedback",
            error: error.message
        });
    }
};

/**
 * Get interview details
 */
export const getInterview = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { interviewId } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
            return;
        }

        const interview = await AIInterviewModel.findOne({
            _id: interviewId,
            userId
        });

        if (!interview) {
            res.status(404).json({
                success: false,
                message: "Interview not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: interview
        });

    } catch (error: any) {
        console.error("Error getting interview:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get interview",
            error: error.message
        });
    }
};

/**
 * Get user's interview history
 */
export const getInterviewHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
            return;
        }

        const interviews = await AIInterviewModel.find({
            userId,
            level: 4,
            status: InterviewStatus.COMPLETED
        }).sort({ completedAt: -1 });

        res.status(200).json({
            success: true,
            data: interviews
        });

    } catch (error: any) {
        console.error("Error getting interview history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get interview history",
            error: error.message
        });
    }
};
