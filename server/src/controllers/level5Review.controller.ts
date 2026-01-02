import { Request, Response } from "express";
import RealtimeInterviewModel, {
  RealtimeInterviewStatus,
} from "../models/realtimeInterview";
import Level5ReviewModel, { ReviewStatus } from "../models/level5Review";
import { sendLevel5ReviewCompleteEmail } from "../lib/email";

/**
 * Get all Level 5 submissions for admin review
 * Supports search by name/email and pagination
 * Pending reviews shown first
 */
export const getAllLevel5Submissions = async (
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
      level: 5,
      status: {
        $in: [RealtimeInterviewStatus.COMPLETED, "PENDING_REVIEW", "REVIEWED"],
      },
    };

    // Filter by status if not 'all'
    if (status === "PENDING_REVIEW") {
      matchStage.status = "PENDING_REVIEW";
    } else if (status === "REVIEWED") {
      matchStage.status = "REVIEWED";
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
          from: "level5reviews",
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
    const countResult = await RealtimeInterviewModel.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    // Project final fields
    pipeline.push({
      $project: {
        _id: 1,
        userId: 1,
        sessionId: 1,
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

    const submissions = await RealtimeInterviewModel.aggregate(pipeline);

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
    console.error("Error fetching Level 5 submissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Level 5 submissions",
      error: error.message,
    });
  }
};

/**
 * Get single Level 5 submission details
 */
export const getLevel5SubmissionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { interviewId } = req.params;

    const interview = await RealtimeInterviewModel.findById(interviewId)
      .populate("userId", "username email")
      .lean();

    if (!interview) {
      res.status(404).json({
        success: false,
        message: "Interview not found",
      });
      return;
    }

    // Get existing review if any
    const existingReview = await Level5ReviewModel.findOne({
      interviewId,
    }).lean();

    res.status(200).json({
      success: true,
      data: {
        interview,
        review: existingReview || null,
      },
    });
  } catch (error: any) {
    console.error("Error fetching Level 5 submission:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission details",
      error: error.message,
    });
  }
};

/**
 * Create or update Level 5 review (draft)
 */
export const saveLevel5Review = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = (req as any).admin?.adminId;
    const { interviewId } = req.params;
    const { questionReviews, totalScore } = req.body;

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
      return;
    }

    // Validate interview exists
    const interview = await RealtimeInterviewModel.findById(interviewId);

    if (!interview) {
      res.status(404).json({
        success: false,
        message: "Interview not found",
      });
      return;
    }

    // Check for existing review
    let review = await Level5ReviewModel.findOne({ interviewId });

    if (review) {
      // Update existing review
      review.questionReviews = questionReviews;
      review.totalScore = totalScore;
      review.adminId = adminId;
      review.reviewedAt = new Date();
      await review.save();
    } else {
      // Count previous attempts for this user
      const previousAttempts = await Level5ReviewModel.countDocuments({
        userId: interview.userId,
      });

      // Create new review
      review = await Level5ReviewModel.create({
        userId: interview.userId,
        interviewId,
        adminId,
        attemptNumber: previousAttempts + 1,
        questionReviews,
        totalScore,
        status: ReviewStatus.DRAFT,
        reviewedAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Review saved as draft",
      data: { reviewId: review._id },
    });
  } catch (error: any) {
    console.error("Error saving Level 5 review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save review",
      error: error.message,
    });
  }
};

/**
 * Submit Level 5 review (finalize)
 */
export const submitLevel5Review = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = (req as any).admin?.adminId;
    const { interviewId } = req.params;
    const { questionReviews, totalScore } = req.body;

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
      return;
    }

    // Validate interview exists
    const interview = await RealtimeInterviewModel.findById(interviewId);

    if (!interview) {
      res.status(404).json({
        success: false,
        message: "Interview not found",
      });
      return;
    }

    // Check for existing review
    let review = await Level5ReviewModel.findOne({ interviewId });

    if (review) {
      // Update existing review and submit
      review.questionReviews = questionReviews;
      review.totalScore = totalScore;
      review.adminId = adminId;
      review.status = ReviewStatus.SUBMITTED;
      review.reviewedAt = new Date();
      review.submittedAt = new Date();
      await review.save();
    } else {
      // Count previous attempts for this user
      const previousAttempts = await Level5ReviewModel.countDocuments({
        userId: interview.userId,
      });

      // Create new review and submit
      review = await Level5ReviewModel.create({
        userId: interview.userId,
        interviewId,
        adminId,
        attemptNumber: previousAttempts + 1,
        questionReviews,
        totalScore,
        status: ReviewStatus.SUBMITTED,
        reviewedAt: new Date(),
        submittedAt: new Date(),
      });
    }

    // Update interview status to REVIEWED
    interview.status = "REVIEWED" as any;
    await interview.save();

    // Update user's Level 5 score and status
    const UserModel = (await import("../models/user")).default;
    const user = await UserModel.findById(interview.userId);

    if (user) {
      // Update scores
      if (!user.scores) {
        user.scores = {};
      }
      user.scores.level5 = totalScore;

      // Update progress
      if (!user.progress) {
        user.progress = {
          completedLevels: [],
          highestUnlockedLevel: 1,
          testScores: {},
        };
      }

      // Add to testScores
      if (!user.progress.testScores) {
        user.progress.testScores = {};
      }
      user.progress.testScores.level5 = totalScore;

      // Add to completedLevels if not already there
      if (!user.progress.completedLevels.includes(5)) {
        user.progress.completedLevels.push(5);
      }

      // Update level5 status
      user.progress.level5 = "REVIEWED";

      await user.save();
    }

    // Send email notification to user
    try {
      await sendLevel5ReviewCompleteEmail(
        interview.userId.toString(),
        totalScore
      );
    } catch (emailError) {
      console.error("Failed to send review email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      data: { reviewId: review._id },
    });
  } catch (error: any) {
    console.error("Error submitting Level 5 review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

/**
 * Get user's Level 5 review (for user dashboard)
 */
export const getUserLevel5Review = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    // Get latest submitted review
    const review = await Level5ReviewModel.findOne({
      userId,
      status: ReviewStatus.SUBMITTED,
    })
      .sort({ submittedAt: -1 })
      .lean();

    if (!review) {
      res.status(404).json({
        success: false,
        message: "No review found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { review },
    });
  } catch (error: any) {
    console.error("Error fetching user Level 5 review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch review",
      error: error.message,
    });
  }
};
