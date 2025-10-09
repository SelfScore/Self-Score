import { Request, Response } from "express";
import mongoose from "mongoose";
import QuestionsResponseModel from "../models/questionsResponse";
import QuestionModel from "../models/questions";
import UserModel from "../models/user";

// Save a user's question response
export const createQuestionsResponse = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId, level, questionId, selectedOptionIndex } = req.body;

        // Check if question exists
        const question = await QuestionModel.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        // const isCorrect = question.correctOptionIndex === selectedOptionIndex;

        // Save response
        const response = await QuestionsResponseModel.create({
            userId,
            level,
            questionId,
            selectedOptionIndex,
            // isCorrect   <-- uncomment if you decide to include in schema
        });

        return res.status(201).json({
            success: true,
            data: {
                ...response.toObject(),
                // isCorrect,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error saving question response",
            error: error instanceof Error ? error.message : error,
        });
    }
};

// Save a user's question response for Level 1 specifically
export const createLevel1Response = async (req: Request, res: Response): Promise<Response> => {
    try {
        console.log("Received Level 1 submission request:", JSON.stringify(req.body, null, 2)); // Debug incoming data
        
        const { userId, responses } = req.body;

        // Validate and convert userId to ObjectId
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

        // Handle both single response and multiple responses
        let responsesToProcess = [];
        if (Array.isArray(responses)) {
            // Multiple responses
            responsesToProcess = responses;
        } else if (req.body.questionId && req.body.selectedOptionIndex !== undefined) {
            // Single response (backward compatibility)
            responsesToProcess = [{
                questionId: req.body.questionId,
                selectedOptionIndex: req.body.selectedOptionIndex
            }];
        } else {
            return res.status(400).json({
                success: false,
                message: "Either 'responses' array or 'questionId' and 'selectedOptionIndex' are required",
            });
        }

        if (responsesToProcess.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one response is required",
            });
        }

        const savedResponses = [];
        const errors = [];

        // Process each response
        for (const responseData of responsesToProcess) {
            try {
                const { questionId, selectedOptionIndex } = responseData;

                // Validate individual response
                if (!questionId || selectedOptionIndex === undefined) {
                    errors.push({
                        questionId: questionId || 'unknown',
                        error: 'questionId and selectedOptionIndex are required'
                    });
                    continue;
                }

                // Convert questionId to ObjectId
                let questionObjectId;
                try {
                    questionObjectId = new mongoose.Types.ObjectId(questionId);
                } catch (error) {
                    errors.push({
                        questionId,
                        error: 'Invalid questionId format'
                    });
                    continue;
                }

                // Check if question exists and is Level 1
                const question = await QuestionModel.findById(questionObjectId);
                if (!question) {
                    errors.push({
                        questionId,
                        error: 'Question not found'
                    });
                    continue;
                }

                if (question.level !== 1) {
                    errors.push({
                        questionId,
                        error: 'This endpoint is only for Level 1 questions'
                    });
                    continue;
                }

                // Check if user has already answered this Level 1 question
                const existingResponse = await QuestionsResponseModel.findOne({
                    userId: userObjectId,
                    level: 1,
                    questionId: questionObjectId
                });

                if (existingResponse) {
                    // Update existing response instead of creating new one
                    existingResponse.selectedOptionIndex = selectedOptionIndex;
                    const updatedResponse = await existingResponse.save();
                    savedResponses.push(updatedResponse.toObject());
                } else {
                    // Save new response
                    const savedResponse = await QuestionsResponseModel.create({
                        userId: userObjectId,
                        level: 1,
                        questionId: questionObjectId,
                        selectedOptionIndex,
                    });
                    savedResponses.push(savedResponse.toObject());
                }

            } catch (error) {
                errors.push({
                    questionId: responseData.questionId || 'unknown',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        // Return results
        const hasErrors = errors.length > 0;
        const hasSuccesses = savedResponses.length > 0;

        if (hasSuccesses && !hasErrors) {
            // All responses saved successfully
            // Update user progress to unlock Level 2
            try {
                const user = await UserModel.findById(userObjectId);
                if (user) {
                    // Calculate score for Level 1 (same logic as frontend)
                    const totalScore = savedResponses.reduce((sum, response) => {
                        return sum + (response.selectedOptionIndex * 15);
                    }, 0);
                    const finalScore = Math.max(totalScore, 350); // Minimum score 350
                    const cappedScore = Math.min(finalScore, 900); // Maximum score 900

                    // Add Level 1 to completed levels if not already there
                    if (!user.progress.completedLevels.includes(1)) {
                        user.progress.completedLevels.push(1);
                    }
                    
                    // Unlock Level 2 (set highest unlocked level to 2)
                    user.progress.highestUnlockedLevel = Math.max(user.progress.highestUnlockedLevel, 2);
                    
                    // Save the Level 1 test score
                    user.progress.testScores.level1 = cappedScore;
                    
                    await user.save();
                    
                    console.log(`User ${userId} completed Level 1 with score ${cappedScore}. Level 2 unlocked.`);
                }
            } catch (error) {
                console.error("Error updating user progress:", error);
                // Don't fail the response if progress update fails
            }

            return res.status(201).json({
                success: true,
                message: savedResponses.length === 1 
                    ? "Level 1 response saved successfully" 
                    : `All ${savedResponses.length} Level 1 responses saved successfully`,
                data: {
                    savedCount: savedResponses.length,
                    responses: savedResponses
                }
            });
        } else if (hasSuccesses && hasErrors) {
            // Partial success
            return res.status(207).json({
                success: true,
                message: `${savedResponses.length} Level 1 responses saved, ${errors.length} failed`,
                data: {
                    savedCount: savedResponses.length,
                    errorCount: errors.length,
                    responses: savedResponses,
                    errors
                }
            });
        } else {
            // All failed
            return res.status(400).json({
                success: false,
                message: "Failed to save Level 1 responses",
                data: {
                    errorCount: errors.length,
                    errors
                }
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error saving Level 1 question responses",
            error: error instanceof Error ? error.message : error,
        });
    }
};

// Get all responses of a user
export const getUserResponses = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;

        const responses = await QuestionsResponseModel.find({ userId })
            .populate("questionId", "questionText options correctOptionIndex level");

        return res.status(200).json({
            success: true,
            count: responses.length,
            data: responses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching user responses",
            error: error instanceof Error ? error.message : error,
        });
    }
};
