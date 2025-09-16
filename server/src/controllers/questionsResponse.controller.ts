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
