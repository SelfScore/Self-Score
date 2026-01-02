import { Request, Response } from "express";
import mongoose from "mongoose";
import QuestionsResponseModel from "../models/questionsResponse";
import QuestionModel from "../models/questions";
import UserModel from "../models/user";
import TestSubmissionModel from "../models/testSubmission";
import {
  sendTestCompletionEmailToUser,
  sendTestCompletionEmailToAdmin,
} from "../lib/email";

// Save a user's question response
export const createQuestionsResponse = async (
  req: Request,
  res: Response
): Promise<Response> => {
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
export const createLevel1Response = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    console.log(
      "Received Level 1 submission request:",
      JSON.stringify(req.body, null, 2)
    ); // Debug incoming data

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
    } else if (
      req.body.questionId &&
      req.body.selectedOptionIndex !== undefined
    ) {
      // Single response (backward compatibility)
      responsesToProcess = [
        {
          questionId: req.body.questionId,
          selectedOptionIndex: req.body.selectedOptionIndex,
        },
      ];
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Either 'responses' array or 'questionId' and 'selectedOptionIndex' are required",
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
            questionId: questionId || "unknown",
            error: "questionId and selectedOptionIndex are required",
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
            error: "Invalid questionId format",
          });
          continue;
        }

        // Check if question exists and is Level 1
        const question = await QuestionModel.findById(questionObjectId);
        if (!question) {
          errors.push({
            questionId,
            error: "Question not found",
          });
          continue;
        }

        if (question.level !== 1) {
          errors.push({
            questionId,
            error: "This endpoint is only for Level 1 questions",
          });
          continue;
        }

        // Check if user has already answered this Level 1 question
        const existingResponse = await QuestionsResponseModel.findOne({
          userId: userObjectId,
          level: 1,
          questionId: questionObjectId,
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
          questionId: responseData.questionId || "unknown",
          error: error instanceof Error ? error.message : "Unknown error",
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
            return sum + response.selectedOptionIndex * 15;
          }, 0);
          const finalScore = Math.max(totalScore, 350); // Minimum score 350
          const cappedScore = Math.min(finalScore, 900); // Maximum score 900

          // Create test submission record for this attempt
          await TestSubmissionModel.create({
            userId: userObjectId,
            level: 1,
            score: cappedScore,
            totalQuestions: savedResponses.length,
            timeSpent: req.body.timeSpent, // Time spent in seconds
            submittedAt: new Date(),
          });

          // Add Level 1 to completed levels if not already there
          if (!user.progress.completedLevels.includes(1)) {
            user.progress.completedLevels.push(1);
          }

          // Unlock Level 2 (set highest unlocked level to 2)
          user.progress.highestUnlockedLevel = Math.max(
            user.progress.highestUnlockedLevel,
            2
          );

          // Save the Level 1 test score (latest score)
          user.progress.testScores.level1 = cappedScore;

          await user.save();

          console.log(
            `User ${userId} completed Level 1 with score ${cappedScore}. Level 2 unlocked.`
          );

          // Send email notifications to user and admin
          try {
            // Send to user
            await sendTestCompletionEmailToUser({
              email: user.email,
              username: user.username,
              level: 1,
              score: cappedScore,
              totalQuestions: savedResponses.length,
              isPending: false,
            });

            // Send to admin
            await sendTestCompletionEmailToAdmin({
              username: user.username,
              email: user.email,
              level: 1,
              score: cappedScore,
              totalQuestions: savedResponses.length,
              userId: userId,
              isPending: false,
            });

            console.log(
              `✅ Email notifications sent for Level 1 completion (User: ${user.email})`
            );
          } catch (emailError) {
            console.error(
              "⚠️  Failed to send email notifications for Level 1:",
              emailError
            );
            // Don't fail the response if email fails
          }
        }
      } catch (error) {
        console.error("Error updating user progress:", error);
        // Don't fail the response if progress update fails
      }

      return res.status(201).json({
        success: true,
        message:
          savedResponses.length === 1
            ? "Level 1 response saved successfully"
            : `All ${savedResponses.length} Level 1 responses saved successfully`,
        data: {
          savedCount: savedResponses.length,
          responses: savedResponses,
        },
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
          errors,
        },
      });
    } else {
      // All failed
      return res.status(400).json({
        success: false,
        message: "Failed to save Level 1 responses",
        data: {
          errorCount: errors.length,
          errors,
        },
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
export const submitLevelResponses = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    console.log(
      "Received level submission request:",
      JSON.stringify(req.body, null, 2)
    );

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
      const levelKey = `level${level}` as "level2" | "level3" | "level4";
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
            questionId: questionId || "unknown",
            error: "questionId and selectedOptionIndex are required",
          });
          continue;
        }

        let questionObjectId;
        try {
          questionObjectId = new mongoose.Types.ObjectId(questionId);
        } catch (error) {
          errors.push({
            questionId,
            error: "Invalid questionId format",
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
          questionId: responseData.questionId || "unknown",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // If all responses saved, calculate score and update user progress
    if (savedResponses.length > 0 && errors.length === 0) {
      try {
        // Fetch all questions to get their scoringType
        const questionIds = savedResponses.map((r) => r.questionId);
        const questions = await QuestionModel.find({
          _id: { $in: questionIds },
        });

        // Create a map for quick lookup
        const questionMap = new Map(
          questions.map((q) => [(q._id as any).toString(), q])
        );

        // Calculate score based on level-specific logic
        let calculatedScore = 0;

        if (level === 1) {
          // Level 1: All questions use +15 multiplier
          calculatedScore = savedResponses.reduce((sum, response) => {
            return sum + response.selectedOptionIndex * 15;
          }, 0);
        } else if (level === 2) {
          // Level 2: 900 - |Level2Score|
          // Calculate Level 2 raw score (all NEGATIVE_MULTIPLIER questions)
          const level2RawScore = savedResponses.reduce((sum, response) => {
            const questionId = response.questionId.toString();
            const question = questionMap.get(questionId);
            if (!question) return sum;

            const multiplier =
              question.scoringType === "NEGATIVE_MULTIPLIER" ? -10 : 15;
            return sum + response.selectedOptionIndex * multiplier;
          }, 0);

          // Take absolute value of Level 2 score
          const level2AbsoluteScore = Math.abs(level2RawScore);

          // Final formula: 900 - |level2Score|
          calculatedScore = 900 - level2AbsoluteScore;

          // Note: calculatedScore will be used below to calculate finalScore
          // For Level 2, we don't add 350 again since it's already in the formula
        } else {
          // Level 3+: Use scoringType from each question (original logic)
          calculatedScore = savedResponses.reduce((sum, response) => {
            const questionId = response.questionId.toString();
            const question = questionMap.get(questionId);
            if (!question) return sum;

            // Apply multiplier based on scoringType
            const multiplier =
              question.scoringType === "NEGATIVE_MULTIPLIER" ? -10 : 15;
            return sum + response.selectedOptionIndex * multiplier;
          }, 0);
        }

        // Calculate final score
        let finalScore;
        if (level === 1) {
          finalScore = Math.max(calculatedScore, 350); // Level 1: minimum is 350
        } else if (level === 2) {
          finalScore = calculatedScore; // Level 2: already calculated with full formula
        } else {
          finalScore = 350 + calculatedScore; // Level 3+: base 350 + calculated score
        }

        const cappedScore = Math.max(350, Math.min(finalScore, 900)); // Ensure within 350-900 range

        // Create test submission record for this attempt
        await TestSubmissionModel.create({
          userId: userObjectId,
          level: level,
          score: cappedScore,
          totalQuestions: savedResponses.length,
          timeSpent: req.body.timeSpent, // Time spent in seconds
          submittedAt: new Date(),
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
        const levelKey = `level${level}` as
          | "level1"
          | "level2"
          | "level3"
          | "level4";
        user.progress.testScores[levelKey] = cappedScore;

        await user.save();

        console.log(
          `User ${userId} completed Level ${level} with score ${cappedScore} (calculated: ${calculatedScore})`
        );

        // Send email notifications to user and admin
        try {
          // Send to user
          await sendTestCompletionEmailToUser({
            email: user.email,
            username: user.username,
            level: level,
            score: cappedScore,
            totalQuestions: savedResponses.length,
            isPending: false,
          });

          // Send to admin
          await sendTestCompletionEmailToAdmin({
            username: user.username,
            email: user.email,
            level: level,
            score: cappedScore,
            totalQuestions: savedResponses.length,
            userId: userId,
            isPending: false,
          });

          console.log(
            `✅ Email notifications sent for Level ${level} completion (User: ${user.email})`
          );
        } catch (emailError) {
          console.error(
            `⚠️  Failed to send email notifications for Level ${level}:`,
            emailError
          );
          // Don't fail the response if email fails
        }

        return res.status(201).json({
          success: true,
          message: `Level ${level} responses saved successfully`,
          data: {
            savedCount: savedResponses.length,
            responses: savedResponses,
            score: cappedScore,
            nextLevelUnlocked: nextLevel <= 4 ? nextLevel : null,
          },
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
          errors,
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: "Failed to save responses",
      data: {
        errorCount: errors.length,
        errors,
      },
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
export const getUserResponses = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;

    const responses = await QuestionsResponseModel.find({ userId }).populate(
      "questionId",
      "questionText options correctOptionIndex level scoringType questionType"
    );

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
export const getUserTestHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
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

    // Get all test submissions for Levels 1, 2, 3
    const testSubmissions = await TestSubmissionModel.find({
      userId: userObjectId,
    })
      .sort({ submittedAt: -1 }) // Most recent first
      .lean();

    // Transform Level 1-3 data
    const level123History = testSubmissions.map((submission: any) => ({
      _id: submission._id.toString(),
      level: submission.level,
      score: submission.score,
      totalQuestions: submission.totalQuestions,
      timeSpent: submission.timeSpent,
      submittedAt: submission.submittedAt,
      date: submission.submittedAt,
    }));

    // Get Level 4 submissions (AI Interviews that are reviewed)
    const AIInterviewModel = (await import("../models/aiInterview")).default;
    const Level4ReviewModel = (await import("../models/level4Review")).default;

    const level4Interviews = await AIInterviewModel.find({
      userId: userObjectId,
      level: 4,
      status: { $in: ["REVIEWED", "PENDING_REVIEW"] }, // Include both reviewed and pending
    })
      .sort({ submittedAt: -1 })
      .lean();

    // Get reviews for Level 4 interviews
    const level4InterviewIds = level4Interviews.map(
      (interview) => interview._id
    );
    const level4Reviews = await Level4ReviewModel.find({
      interviewId: { $in: level4InterviewIds },
      status: "SUBMITTED",
    }).lean();

    // Create a map of interviewId to review
    const reviewMap = new Map();
    level4Reviews.forEach((review) => {
      reviewMap.set(review.interviewId.toString(), review);
    });

    // Transform Level 4 data
    const level4History = level4Interviews.map((interview: any) => {
      const review = reviewMap.get(interview._id.toString());

      return {
        _id: interview._id.toString(),
        level: 4,
        score: review ? review.totalScore : null, // null if pending review
        totalQuestions: 8, // Level 4 always has 8 questions
        timeSpent: null, // Level 4 doesn't track time the same way
        submittedAt: interview.submittedAt || interview.completedAt,
        date: interview.submittedAt || interview.completedAt,
        status: interview.status, // PENDING_REVIEW or REVIEWED
        attemptNumber: interview.attemptNumber,
      };
    });

    // Get Level 5 submissions (Realtime Voice Interviews that are reviewed)
    const RealtimeInterviewModel = (await import("../models/realtimeInterview"))
      .default;
    const Level5ReviewModel = (await import("../models/level5Review")).default;

    const level5Interviews = await RealtimeInterviewModel.find({
      userId: userObjectId,
      status: { $in: ["COMPLETED", "PENDING_REVIEW", "REVIEWED"] }, // Include completed, pending, and reviewed
    })
      .sort({ submittedAt: -1 })
      .lean();

    // Get reviews for Level 5 interviews
    const level5InterviewIds = level5Interviews.map(
      (interview) => interview._id
    );
    const level5Reviews = await Level5ReviewModel.find({
      interviewId: { $in: level5InterviewIds },
      status: "SUBMITTED",
    }).lean();

    // Create a map of interviewId to review for Level 5
    const level5ReviewMap = new Map();
    level5Reviews.forEach((review) => {
      level5ReviewMap.set(review.interviewId.toString(), review);
    });

    // Transform Level 5 data
    const level5History = level5Interviews.map((interview: any) => {
      const review = level5ReviewMap.get(interview._id.toString());

      return {
        _id: interview._id.toString(),
        level: 5,
        score: review ? review.totalScore : null, // null if pending review
        totalQuestions: 25, // Level 5 always has 25 questions
        timeSpent: null, // Level 5 doesn't track time the same way
        submittedAt: interview.submittedAt || interview.completedAt,
        date: interview.submittedAt || interview.completedAt,
        status: review ? "REVIEWED" : "PENDING_REVIEW",
        attemptNumber: interview.attemptNumber || 1,
      };
    });

    // Combine and sort all history by date (most recent first)
    const allHistory = [
      ...level123History,
      ...level4History,
      ...level5History,
    ].sort((a, b) => {
      const dateA = new Date(a.date || a.submittedAt).getTime();
      const dateB = new Date(b.date || b.submittedAt).getTime();
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      count: allHistory.length,
      data: allHistory,
    });
  } catch (error) {
    console.error("Error fetching user test history:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user test history",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Generate a shareable link for a test submission
export const generateShareLink = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { submissionId } = req.body;
    const userId = (req as any).user?.userId;

    console.log("Generate share link request:");
    console.log("  - Submission ID:", submissionId);
    console.log("  - User from token:", (req as any).user);
    console.log("  - User ID:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID in token",
      });
    }

    // Find the test submission
    const submission = await TestSubmissionModel.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Test submission not found",
      });
    }

    // Verify ownership
    if (submission.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to share this report",
      });
    }

    // Generate shareId if it doesn't exist
    let shareId = submission.shareId;
    if (!shareId) {
      shareId = new mongoose.Types.ObjectId().toString();
      submission.shareId = shareId;
      await submission.save();
    }

    // Construct the shareable link
    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const shareLink = `${baseUrl}/shared-report/${shareId}`;

    return res.status(200).json({
      success: true,
      data: {
        shareId,
        shareLink,
      },
    });
  } catch (error) {
    console.error("Error generating share link:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating share link",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Get shared report data (public endpoint)
export const getSharedReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { shareId } = req.params;

    // Find the test submission by shareId
    const submission = await TestSubmissionModel.findOne({ shareId })
      .populate("userId", "username email countryCode phoneNumber")
      .lean();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Shared report not found",
      });
    }

    // Get user responses for this level and submission
    const responses = await QuestionsResponseModel.find({
      userId: submission.userId,
      level: submission.level,
    })
      .populate("questionId")
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        level: submission.level,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        submittedAt: submission.submittedAt,
        user: submission.userId,
        responses,
      },
    });
  } catch (error) {
    console.error("Error fetching shared report:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching shared report",
      error: error instanceof Error ? error.message : error,
    });
  }
};
