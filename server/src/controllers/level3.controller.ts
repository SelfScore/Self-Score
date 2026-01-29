import { Request, Response } from "express";
import mongoose from "mongoose";
import Level3QuestionModel from "../models/level3Question";
import UserModel from "../models/user";
import TestSubmissionModel from "../models/testSubmission";
import {
    sendTestCompletionEmailToUser,
    sendTestCompletionEmailToAdmin,
} from "../lib/email";

// Interface for Level 3 response
interface Level3Response {
    questionId: string;
    selectedOptionIndex: number; // For MC: 0-3, For Slider: 0-10
}

/**
 * Get all Level 3 questions sorted by order
 */
export const getLevel3Questions = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const questions = await Level3QuestionModel.find({}).sort({ order: 1 });

        return res.status(200).json({
            success: true,
            count: questions.length,
            data: questions,
        });
    } catch (error) {
        console.error("Error fetching Level 3 questions:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching Level 3 questions",
            error: error instanceof Error ? error.message : error,
        });
    }
};

/**
 * Submit Level 3 responses with custom scoring logic
 * 
 * Scoring Logic:
 * - Multiple Choice (50 questions): (selectedIndex + 1) × 3.75 = max 15 points each
 * - Slider (10 questions): selectedValue × 1.5 = max 15 points each
 * - Total max: 60 × 15 = 900 points
 */
export const submitLevel3Responses = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { userId, responses, timeSpent } = req.body;

        // Validate userId
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }

        let userObjectId;
        try {
            userObjectId = new mongoose.Types.ObjectId(userId);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId format",
            });
        }

        // Check if user exists
        const user = await UserModel.findById(userObjectId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if Level 3 is purchased
        if (!user.purchasedLevels.level3.purchased) {
            return res.status(403).json({
                success: false,
                message: "Please purchase Level 3 to submit responses",
            });
        }

        // Validate responses
        if (!Array.isArray(responses) || responses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Responses array is required",
            });
        }

        // Fetch all questions to calculate score
        const questionIds = responses.map((r: Level3Response) => r.questionId);
        const questions = await Level3QuestionModel.find({
            questionId: { $in: questionIds },
        });

        if (questions.length !== responses.length) {
            return res.status(400).json({
                success: false,
                message: "Some questions were not found",
            });
        }

        // Create question map for lookup
        const questionMap = new Map(
            questions.map((q) => [q.questionId, q])
        );

        // Calculate score based on question type
        let totalScore = 0;

        for (const response of responses as Level3Response[]) {
            const question = questionMap.get(response.questionId);
            if (!question) continue;

            if (question.questionType === "multiple-choice") {
                // Multiple choice: (selectedIndex + 1) × 3.75
                // Index 0 = 3.75, Index 1 = 7.5, Index 2 = 11.25, Index 3 = 15
                const score = (response.selectedOptionIndex + 1) * 3.75;
                totalScore += score;
            } else if (question.questionType === "slider-scale") {
                // Slider: selectedValue × 1.5
                // Value 0 = 0, Value 1 = 1.5, ... Value 10 = 15
                const score = response.selectedOptionIndex * 1.5;
                totalScore += score;
            }
        }

        // Round the score
        const finalScore = Math.round(totalScore);

        // Create test submission record
        await TestSubmissionModel.create({
            userId: userObjectId,
            level: 3,
            score: finalScore,
            totalQuestions: responses.length,
            timeSpent: timeSpent || 0,
            submittedAt: new Date(),
        });

        // Update user progress
        if (!user.progress.completedLevels.includes(3)) {
            user.progress.completedLevels.push(3);
        }

        // Unlock Level 4
        user.progress.highestUnlockedLevel = Math.max(
            user.progress.highestUnlockedLevel,
            4
        );

        // Save Level 3 score
        user.progress.testScores.level3 = finalScore;

        await user.save();

        console.log(
            `User ${userId} completed Level 3 with score ${finalScore}/${responses.length * 15}`
        );

        // Send email notifications
        try {
            await sendTestCompletionEmailToUser({
                email: user.email,
                username: user.username,
                level: 3,
                score: finalScore,
                totalQuestions: responses.length,
                isPending: false,
            });

            await sendTestCompletionEmailToAdmin({
                username: user.username,
                email: user.email,
                level: 3,
                score: finalScore,
                totalQuestions: responses.length,
                userId: userId,
                isPending: false,
            });

            console.log(`✅ Email notifications sent for Level 3 completion`);
        } catch (emailError) {
            console.error("⚠️  Failed to send email notifications:", emailError);
        }

        return res.status(201).json({
            success: true,
            message: "Level 3 responses submitted successfully",
            data: {
                score: finalScore,
                maxScore: 900,
                totalQuestions: responses.length,
                nextLevelUnlocked: 4,
            },
        });
    } catch (error) {
        console.error("Error submitting Level 3 responses:", error);
        return res.status(500).json({
            success: false,
            message: "Error submitting Level 3 responses",
            error: error instanceof Error ? error.message : error,
        });
    }
};
