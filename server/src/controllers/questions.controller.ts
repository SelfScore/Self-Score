import { Request, Response } from "express";
import QuestionModel from "../models/questions";
import QuestionsResponseModel from "../models/questionsResponse";

// Fetch all questions
export const getAllQuestions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  console.log("Fetching all questions");
  try {
    const questions = await QuestionModel.find().sort({ order: 1 });
    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Fetch questions by level
export const getQuestionsByLevel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { level } = req.params;
    const { userId } = req.query; // Optional userId to include user responses

    const questions = await QuestionModel.find({ level: Number(level) }).sort({ order: 1 });

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: `No questions found for level ${level}`,
      });
    }

    // If userId is provided, fetch user responses for these questions
    if (userId) {
      const responses = await QuestionsResponseModel.find({
        userId: userId,
        level: Number(level),
      });

      // Map responses to questions
      const questionsWithResponses = questions.map((question) => {
        const response = responses.find(
          (r) => r.questionId.toString() === (question._id as any).toString()
        );
        return {
          ...question.toObject(),
          userResponse: response
            ? {
              selectedOptionIndex: response.selectedOptionIndex,
              answeredAt: (response as any).createdAt,
            }
            : null,
        };
      });

      return res.status(200).json({
        success: true,
        count: questions.length,
        data: questionsWithResponses,
        hasUserResponses: true,
      });
    }

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
      hasUserResponses: false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching questions by level",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Fetch questions with user responses for a specific user
export const getQuestionsWithResponses = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const { level } = req.query;

    // Build query for questions
    const questionQuery = level ? { level: Number(level) } : {};
    const questions = await QuestionModel.find(questionQuery).sort({ order: 1 });

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: level
          ? `No questions found for level ${level}`
          : "No questions found",
      });
    }

    // Fetch user responses
    const responseQuery = level ? { userId, level: Number(level) } : { userId };
    const responses = await QuestionsResponseModel.find(responseQuery);

    // Map responses to questions
    const questionsWithResponses = questions.map((question) => {
      const response = responses.find(
        (r) => r.questionId.toString() === (question._id as any).toString()
      );
      return {
        ...question.toObject(),
        userResponse: response
          ? {
            selectedOptionIndex: response.selectedOptionIndex,
            answeredAt: (response as any).createdAt,
            responseId: response._id,
          }
          : null,
      };
    });

    // Calculate completion stats
    const totalQuestions = questions.length;
    const answeredQuestions = responses.length;
    const completionPercentage =
      totalQuestions > 0
        ? Math.round((answeredQuestions / totalQuestions) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      data: questionsWithResponses,
      stats: {
        totalQuestions,
        answeredQuestions,
        completionPercentage,
        level: level ? Number(level) : "all",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching questions with responses",
      error: error instanceof Error ? error.message : error,
    });
  }
};
