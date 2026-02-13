import { Request, Response } from "express";
import AIInterviewModel, { InterviewStatus } from "../models/aiInterview";
import Level4ReviewModel, { ReviewStatus } from "../models/level4Review";
import { sendLevel4ReviewCompleteEmail } from "../lib/email";

/**
 * Get all Level 4 submissions for admin review
 * Supports search by name/email and pagination
 * Pending reviews shown first
 */
export const getAllLevel4Submissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      search = "",
      page = "1",
      limit = "10",
      sortBy = "latest",
      status = "all",
    } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build match stage for aggregation
    const matchStage: any = {
      level: 4,
      status: {
        $in: [InterviewStatus.PENDING_REVIEW, InterviewStatus.REVIEWED],
      },
    };

    // Filter by status if not 'all'
    if (status === "PENDING_REVIEW") {
      matchStage.status = InterviewStatus.PENDING_REVIEW;
    } else if (status === "REVIEWED") {
      matchStage.status = InterviewStatus.REVIEWED;
    }

    // Aggregation pipeline to join with User data
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "level4reviews",
          localField: "_id",
          foreignField: "interviewId",
          as: "review",
        },
      },
      {
        $addFields: {
          review: { $arrayElemAt: ["$review", 0] },
          hasReview: { $gt: [{ $size: "$review" }, 0] },
        },
      },
    ];

    // Add search filter if provided
    const searchStr = typeof search === "string" ? search.trim() : "";
    if (searchStr !== "") {
      pipeline.push({
        $match: {
          $or: [
            { "user.username": { $regex: searchStr, $options: "i" } },
            { "user.email": { $regex: searchStr, $options: "i" } },
          ],
        },
      });
    }

    // Determine sort order based on sortBy parameter
    const sortOrder = sortBy === "oldest" ? 1 : -1;

    // Sort: If filtering by status, just sort by date; otherwise pending reviews first
    if (status === "all") {
      pipeline.push({
        $sort: {
          status: 1, // PENDING_REVIEW comes before REVIEWED alphabetically
          submittedAt: sortOrder,
        },
      });
    } else {
      pipeline.push({
        $sort: {
          submittedAt: sortOrder,
        },
      });
    }

    // Count total before pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await AIInterviewModel.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    // Project final fields
    pipeline.push({
      $project: {
        _id: 1,
        userId: 1,
        attemptNumber: 1,
        mode: 1,
        status: 1,
        submittedAt: 1,
        "user.username": 1,
        "user.email": 1,
        "review.totalScore": 1,
        "review.status": 1,
        "review.submittedAt": 1,
        hasReview: 1,
      },
    });

    const submissions = await AIInterviewModel.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching Level 4 submissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Level 4 submissions",
      error: error.message,
    });
  }
};

/**
 * Get single Level 4 submission details for admin review
 */
export const getLevel4SubmissionDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { interviewId } = req.params;

    const interview = await AIInterviewModel.findById(interviewId)
      .populate("userId", "username email phoneNumber")
      .lean();

    if (!interview) {
      res.status(404).json({
        success: false,
        message: "Interview not found",
      });
      return;
    }

    // Check if there's an existing review (draft or submitted)
    const existingReview = await Level4ReviewModel.findOne({
      interviewId,
    }).lean();

    // Prepare question-answer pairs with proper mode tracking
    const questionAnswers = interview.questions.map((q: any) => {
      // Find text answer
      const textAnswer = interview.answers?.find(
        (a: any) => a.questionId === q.questionId
      );

      // Find voice answer from transcript using questionId
      let voiceAnswer = "";
      if (interview.transcript && interview.transcript.length > 0) {
        const voiceResponse = interview.transcript.find(
          (t: any) => t.role === "user" && t.questionId === q.questionId
        );
        if (voiceResponse) {
          voiceAnswer = voiceResponse.content;
        }
      }

      // Determine answer mode and combined answer
      let answerMode: "TEXT" | "VOICE" | "MIXED" = "TEXT";
      let combinedAnswer = "";

      if (textAnswer && voiceAnswer) {
        answerMode = "MIXED";
        combinedAnswer = `[Text Answer]\n${textAnswer.answerText}\n\n[Voice Answer]\n${voiceAnswer}`;
      } else if (textAnswer) {
        answerMode = "TEXT";
        combinedAnswer = textAnswer.answerText;
      } else if (voiceAnswer) {
        answerMode = "VOICE";
        combinedAnswer = voiceAnswer;
      } else {
        combinedAnswer = "No answer provided";
      }

      // Find existing review for this question if any
      const existingQuestionReview = existingReview?.questionReviews.find(
        (qr: any) => qr.questionId === q.questionId
      );

      return {
        questionId: q.questionId,
        questionText: q.questionText,
        questionOrder: q.questionOrder,
        userAnswer: combinedAnswer,
        answerMode,
        existingScore: existingQuestionReview?.score || 0,
        existingRemark: existingQuestionReview?.remark || "",
      };
    });

    res.status(200).json({
      success: true,
      data: {
        interview: {
          _id: interview._id,
          userId: interview.userId,
          attemptNumber: interview.attemptNumber,
          mode: interview.mode,
          status: interview.status,
          submittedAt: interview.submittedAt,
          user: interview.userId,
        },
        questionAnswers,
        existingReview: existingReview
          ? {
            _id: existingReview._id,
            totalScore: existingReview.totalScore,
            status: existingReview.status,
            reviewedAt: existingReview.reviewedAt,
          }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Error fetching Level 4 submission details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission details",
      error: error.message,
    });
  }
};

/**
 * Save draft review (admin can save progress without submitting)
 */
export const saveDraftReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.admin?.adminId;
    const { interviewId } = req.params;
    const { questionReviews } = req.body;

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
      return;
    }

    // Validate questionReviews
    if (
      !questionReviews ||
      !Array.isArray(questionReviews) ||
      questionReviews.length !== 25
    ) {
      res.status(400).json({
        success: false,
        message: "Exactly 25 question reviews are required",
      });
      return;
    }

    // Validate question scores are within 0-100 range
    const invalidScores = questionReviews.filter(
      (qr: any) => qr.score < 0 || qr.score > 100
    );
    if (invalidScores.length > 0) {
      res.status(400).json({
        success: false,
        message: "All question scores must be between 0 and 100",
      });
      return;
    }

    // Get interview details
    const interview = await AIInterviewModel.findById(interviewId);
    if (!interview) {
      res.status(404).json({
        success: false,
        message: "Interview not found",
      });
      return;
    }

    // Calculate raw score (sum of all question scores)
    const rawScore = questionReviews.reduce(
      (sum: number, qr: any) => sum + (qr.score || 0),
      0
    );

    // Apply Level 4 formula: rawScore * (900/2500)
    const calculatedScore = rawScore * (900 / 2500);

    // Clamp total score to 350-900 range
    const clampedTotalScore = Math.min(Math.max(calculatedScore, 350), 900);

    // Check if review already exists
    let review = await Level4ReviewModel.findOne({ interviewId });

    if (review) {
      // Update existing draft
      review.questionReviews = questionReviews;
      review.totalScore = clampedTotalScore;
      review.adminId = adminId as any;
      review.status = ReviewStatus.DRAFT;
      review.reviewedAt = new Date();
      await review.save();
    } else {
      // Create new draft
      review = await Level4ReviewModel.create({
        userId: interview.userId,
        interviewId,
        adminId,
        attemptNumber: interview.attemptNumber,
        questionReviews,
        totalScore: clampedTotalScore,
        status: ReviewStatus.DRAFT,
        reviewedAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Draft saved successfully",
      data: {
        reviewId: review._id,
        totalScore: clampedTotalScore,
      },
    });
  } catch (error: any) {
    console.error("Error saving draft review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save draft review",
      error: error.message,
    });
  }
};

/**
 * Submit final review (admin completes review)
 */
export const submitFinalReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.admin?.adminId;
    const { interviewId } = req.params;
    const { questionReviews } = req.body;

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
      return;
    }

    // Validate questionReviews
    if (
      !questionReviews ||
      !Array.isArray(questionReviews) ||
      questionReviews.length !== 25
    ) {
      res.status(400).json({
        success: false,
        message: "Exactly 25 question reviews are required",
      });
      return;
    }

    // Validate all questions have scores (0-100) and remarks
    const invalidReviews = questionReviews.filter(
      (qr: any) =>
        qr.score == null ||
        qr.score < 0 ||
        qr.score > 100 ||
        !qr.remark ||
        qr.remark.trim() === ""
    );

    if (invalidReviews.length > 0) {
      res.status(400).json({
        success: false,
        message: "All questions must have a score (0-100) and a remark",
      });
      return;
    }

    // Get interview details
    const interview = await AIInterviewModel.findById(interviewId).populate(
      "userId",
      "username email"
    );

    if (!interview) {
      res.status(404).json({
        success: false,
        message: "Interview not found",
      });
      return;
    }

    // Calculate raw score (sum of all question scores)
    const rawScore = questionReviews.reduce(
      (sum: number, qr: any) => sum + qr.score,
      0
    );

    // Apply Level 4 formula: rawScore * (900/2500)
    const calculatedScore = rawScore * (900 / 2500);

    // Clamp total score to 350-900 range
    const clampedTotalScore = Math.min(Math.max(calculatedScore, 350), 900);

    // Check if review already exists
    let review = await Level4ReviewModel.findOne({ interviewId });

    if (review) {
      // Update existing review to submitted
      review.questionReviews = questionReviews;
      review.totalScore = clampedTotalScore;
      review.adminId = adminId as any;
      review.status = ReviewStatus.SUBMITTED;
      review.submittedAt = new Date();
      review.reviewedAt = new Date();
      await review.save();
    } else {
      // Create new submitted review
      review = await Level4ReviewModel.create({
        userId: interview.userId,
        interviewId,
        adminId,
        attemptNumber: interview.attemptNumber,
        questionReviews,
        totalScore: clampedTotalScore,
        status: ReviewStatus.SUBMITTED,
        reviewedAt: new Date(),
        submittedAt: new Date(),
      });
    }

    // Update interview status and link to review
    interview.status = InterviewStatus.REVIEWED;
    interview.reviewId = review._id as any;
    await interview.save();

    // Update user progress
    try {
      const UserModel = (await import("../models/user")).default;
      const user = await UserModel.findById(interview.userId);

      if (user) {
        // Add Level 4 to completed levels if not already there
        if (!user.progress.completedLevels.includes(4)) {
          user.progress.completedLevels.push(4);
        }

        // Update highest unlocked level
        user.progress.highestUnlockedLevel = Math.max(
          user.progress.highestUnlockedLevel,
          4
        );

        // Save the Level 4 test score (use latest score if retaken)
        user.progress.testScores.level4 = clampedTotalScore;

        await user.save();

        console.log(
          `User ${interview.userId} Level 4 review completed with score ${clampedTotalScore}`
        );
      }
    } catch (error: any) {
      console.error("Error updating user progress:", error);
    }

    // Send email notification to user
    try {
      const userEmail = (interview.userId as any).email;
      const userName = (interview.userId as any).username;

      if (userEmail) {
        await sendLevel4ReviewCompleteEmail(
          userEmail,
          userName,
          clampedTotalScore
        );
        console.log(
          `Email sent to ${userEmail} about Level 4 review completion`
        );
      }
    } catch (error: any) {
      console.error("Error sending email notification:", error);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Review submitted successfully. User has been notified.",
      data: {
        reviewId: review._id,
        totalScore: clampedTotalScore,
        status: review.status,
      },
    });
  } catch (error: any) {
    console.error("Error submitting final review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

/**
 * Get review details (for user to view their feedback)
 */
export const getReviewByInterviewId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { interviewId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    // Get interview and verify ownership
    const interview = await AIInterviewModel.findOne({
      _id: interviewId,
      userId,
    });

    if (!interview) {
      res.status(404).json({
        success: false,
        message: "Interview not found",
      });
      return;
    }

    // Get review
    const review = await Level4ReviewModel.findOne({
      interviewId,
      status: ReviewStatus.SUBMITTED, // Only show submitted reviews to users
    });

    if (!review) {
      // Return 200 with pending status instead of 404
      if (interview.status === InterviewStatus.PENDING_REVIEW) {
        res.status(200).json({
          success: true,
          pending: true,
          message: "Your submission is still under review",
          data: null,
        });
        return;
      }

      res.status(404).json({
        success: false,
        message: "Review not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      pending: false,
      data: review,
    });
  } catch (error: any) {
    console.error("Error fetching review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch review",
      error: error.message,
    });
  }
};
