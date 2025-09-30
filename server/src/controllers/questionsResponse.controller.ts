import { Request, Response } from "express";
import QuestionsResponseModel from "../models/questionsResponse";
import QuestionModel from "../models/questions";

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
        const { userId, responses } = req.body;

        // Validate request structure - can handle single response or multiple responses
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
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

                // Check if question exists and is Level 1
                const question = await QuestionModel.findById(questionId);
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
                    userId,
                    level: 1,
                    questionId
                });

                if (existingResponse) {
                    errors.push({
                        questionId,
                        error: 'User has already answered this Level 1 question'
                    });
                    continue;
                }

                // Save the response
                const savedResponse = await QuestionsResponseModel.create({
                    userId,
                    level: 1,
                    questionId,
                    selectedOptionIndex,
                });

                savedResponses.push(savedResponse.toObject());

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
