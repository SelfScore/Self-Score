import { Request, Response } from "express";
import mongoose from "mongoose";
import QuestionsResponseModel from "../models/questionsResponse";
import QuestionModel from "../models/questions";
import UserModel from "../models/user";
import TestSubmissionModel from "../models/testSubmission";

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

                    // Create test submission record for this attempt
                    await TestSubmissionModel.create({
                        userId: userObjectId,
                        level: 1,
                        score: cappedScore,
                        totalQuestions: savedResponses.length,
                        submittedAt: new Date()
                    });

                    // Add Level 1 to completed levels if not already there
                    if (!user.progress.completedLevels.includes(1)) {
                        user.progress.completedLevels.push(1);
                    }
                    
                    // Unlock Level 2 (set highest unlocked level to 2)
                    user.progress.highestUnlockedLevel = Math.max(user.progress.highestUnlockedLevel, 2);
                    
                    // Save the Level 1 test score (latest score)
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

// Generic function to submit responses for any level (2, 3, 4)
export const submitLevelResponses = async (req: Request, res: Response): Promise<Response> => {
    try {
        console.log("Received level submission request:", JSON.stringify(req.body, null, 2));
        
        const { userId, level, responses } = req.body;

        // Validate userId
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }

        // Validate level
        if (!level || ![2, 3, 4].includes(level)) {
            return res.status(400).json({
                success: false,
                message: "Valid level (2, 3, or 4) is required",
            });
        }

        // Convert userId to ObjectId
        let userObjectId;
        try {
            userObjectId = new mongoose.Types.ObjectId(userId);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId format",
            });
        }

        // Check if user exists and has purchased this level
        const user = await UserModel.findById(userObjectId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if level is purchased (for levels 2-4)
        if (level > 1) {
            const levelKey = `level${level}` as 'level2' | 'level3' | 'level4';
            if (!user.purchasedLevels[levelKey].purchased) {
                return res.status(403).json({
                    success: false,
                    message: `Please purchase Level ${level} to submit responses`,
                });
            }
        }

        // Validate responses
        if (!Array.isArray(responses) || responses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one response is required",
            });
        }

        const savedResponses = [];
        const errors = [];

        // Process each response
        for (const responseData of responses) {
            try {
                const { questionId, selectedOptionIndex } = responseData;

                if (!questionId || selectedOptionIndex === undefined) {
                    errors.push({
                        questionId: questionId || 'unknown',
                        error: 'questionId and selectedOptionIndex are required'
                    });
                    continue;
                }

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

                // Check for existing response
                const existingResponse = await QuestionsResponseModel.findOne({
                    userId: userObjectId,
                    questionId: questionObjectId,
                });

                if (existingResponse) {
                    existingResponse.selectedOptionIndex = selectedOptionIndex;
                    const updatedResponse = await existingResponse.save();
                    savedResponses.push(updatedResponse.toObject());
                } else {
                    const savedResponse = await QuestionsResponseModel.create({
                        userId: userObjectId,
                        level,
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

        // If all responses saved, calculate score and update user progress
        if (savedResponses.length > 0 && errors.length === 0) {
            try {
                // Fetch all questions to get their scoringType
                const questionIds = savedResponses.map(r => r.questionId);
                const questions = await QuestionModel.find({ _id: { $in: questionIds } });
                
                // Create a map for quick lookup
                const questionMap = new Map(
                    questions.map(q => [(q._id as string).toString(), q])
                );

                // Calculate score based on level-specific logic
                let calculatedScore = 0;
                
                if (level === 1) {
                    // Level 1: All questions use +15 multiplier
                    calculatedScore = savedResponses.reduce((sum, response) => {
                        return sum + (response.selectedOptionIndex * 15);
                    }, 0);
                } else if (level === 2) {
                    // Level 2: Level1Score - |Level2Score|
                    // Get Level 1 score from user's progress
                    const level1Score = user.progress.testScores.level1 || 350;
                    
                    // Calculate Level 2 raw score (all NEGATIVE_MULTIPLIER questions)
                    const level2RawScore = savedResponses.reduce((sum, response) => {
                        const questionId = response.questionId.toString();
                        const question = questionMap.get(questionId);
                        if (!question) return sum;
                        
                        const multiplier = question.scoringType === 'NEGATIVE_MULTIPLIER' ? -10 : 15;
                        return sum + (response.selectedOptionIndex * multiplier);
                    }, 0);
                    
                    // Take absolute value of Level 2 score
                    const level2AbsoluteScore = Math.abs(level2RawScore);
                    
                    // Final formula: level1Score - |level2Score|
                    calculatedScore = level1Score - level2AbsoluteScore;
                    
                    // Note: calculatedScore will be used below to calculate finalScore
                    // For Level 2, we don't add 350 again since it's already in the formula
                } else {
                    // Level 3+: Use scoringType from each question (original logic)
                    calculatedScore = savedResponses.reduce((sum, response) => {
                        const questionId = response.questionId.toString();
                        const question = questionMap.get(questionId);
                        if (!question) return sum;
                        
                        // Apply multiplier based on scoringType
                        const multiplier = question.scoringType === 'NEGATIVE_MULTIPLIER' ? -10 : 15;
                        return sum + (response.selectedOptionIndex * multiplier);
                    }, 0);
                }
                
                // Calculate final score
                let finalScore;
                if (level === 1) {
                    finalScore = Math.max(calculatedScore, 350);  // Level 1: minimum is 350
                } else if (level === 2) {
                    finalScore = calculatedScore;  // Level 2: already calculated with full formula
                } else {
                    finalScore = 350 + calculatedScore;  // Level 3+: base 350 + calculated score
                }
                
                const cappedScore = Math.max(350, Math.min(finalScore, 900)); // Ensure within 350-900 range

                // Create test submission record for this attempt
                await TestSubmissionModel.create({
                    userId: userObjectId,
                    level: level,
                    score: cappedScore,
                    totalQuestions: savedResponses.length,
                    submittedAt: new Date()
                });

                // Update user progress
                if (!user.progress.completedLevels.includes(level)) {
                    user.progress.completedLevels.push(level);
                }

                // Unlock next level if exists
                const nextLevel = level + 1;
                if (nextLevel <= 4) {
                    user.progress.highestUnlockedLevel = Math.max(
                        user.progress.highestUnlockedLevel, 
                        nextLevel
                    );
                }

                // Save score (latest score)
                const levelKey = `level${level}` as 'level1' | 'level2' | 'level3' | 'level4';
                user.progress.testScores[levelKey] = cappedScore;

                await user.save();

                console.log(`User ${userId} completed Level ${level} with score ${cappedScore} (calculated: ${calculatedScore})`);

                return res.status(201).json({
                    success: true,
                    message: `Level ${level} responses saved successfully`,
                    data: {
                        savedCount: savedResponses.length,
                        responses: savedResponses,
                        score: cappedScore,
                        nextLevelUnlocked: nextLevel <= 4 ? nextLevel : null
                    }
                });
            } catch (error) {
                console.error("Error updating user progress:", error);
            }
        }

        // Partial or failed responses
        if (savedResponses.length > 0 && errors.length > 0) {
            return res.status(207).json({
                success: true,
                message: `${savedResponses.length} responses saved, ${errors.length} failed`,
                data: {
                    savedCount: savedResponses.length,
                    errorCount: errors.length,
                    responses: savedResponses,
                    errors
                }
            });
        }

        return res.status(400).json({
            success: false,
            message: "Failed to save responses",
            data: {
                errorCount: errors.length,
                errors
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error saving level responses",
            error: error instanceof Error ? error.message : error,
        });
    }
};

// Get all responses of a user
export const getUserResponses = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;

        const responses = await QuestionsResponseModel.find({ userId })
            .populate("questionId", "questionText options correctOptionIndex level scoringType questionType");

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

// Get user's test history with scores and dates (all attempts)
export const getUserTestHistory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;

        // Validate userId
        let userObjectId;
        try {
            userObjectId = new mongoose.Types.ObjectId(userId);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId format",
            });
        }

        // Get all test submissions for this user
        const testSubmissions = await TestSubmissionModel
            .find({ userId: userObjectId })
            .sort({ submittedAt: -1 }) // Most recent first
            .lean();

        // Transform the data to match expected format
        const testHistory = testSubmissions.map((submission: any) => ({
            _id: submission._id.toString(),
            level: submission.level,
            score: submission.score,
            totalQuestions: submission.totalQuestions,
            timeSpent: submission.timeSpent,
            submittedAt: submission.submittedAt,
            date: submission.submittedAt,
        }));

        return res.status(200).json({
            success: true,
            count: testHistory.length,
            data: testHistory,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching user test history",
            error: error instanceof Error ? error.message : error,
        });
    }
};
