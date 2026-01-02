import mongoose, { Document, Schema } from "mongoose";

export enum ReviewStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
}

export interface QuestionReview {
  questionId: string;
  questionText: string;
  userAnswer: string;
  answerMode: "VOICE"; // Level 5 is always voice
  score: number;
  remark: string;
}

export interface Level5Review extends Document {
  userId: mongoose.Types.ObjectId;
  interviewId: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  attemptNumber: number; // Track which attempt this is
  questionReviews: QuestionReview[];
  totalScore: number; // Sum of all question scores (350-900 range)
  status: ReviewStatus;
  reviewedAt?: Date;
  submittedAt?: Date;
}

const QuestionReviewSchema = new Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    userAnswer: {
      type: String,
      required: true,
    },
    answerMode: {
      type: String,
      enum: ["VOICE"],
      required: true,
      default: "VOICE",
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    remark: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const Level5ReviewSchema: Schema<Level5Review> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RealtimeInterview",
      required: [true, "Interview ID is required"],
      index: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Admin ID is required"],
    },
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    questionReviews: {
      type: [QuestionReviewSchema],
      required: true,
      validate: {
        validator: function (v: QuestionReview[]) {
          return v.length >= 1 && v.length <= 25; // Must have 1-25 question reviews
        },
        message: "Question reviews must contain between 1 and 25 questions",
      },
    },
    totalScore: {
      type: Number,
      required: true,
      min: 350,
      max: 900,
    },
    status: {
      type: String,
      enum: Object.values(ReviewStatus),
      default: ReviewStatus.DRAFT,
    },
    reviewedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
Level5ReviewSchema.index({ userId: 1, interviewId: 1 });
Level5ReviewSchema.index({ status: 1 });
Level5ReviewSchema.index({ submittedAt: -1 });

// Ensure total score is within range before saving
Level5ReviewSchema.pre("save", function (next) {
  if (this.totalScore < 350) {
    this.totalScore = 350;
  } else if (this.totalScore > 900) {
    this.totalScore = 900;
  }
  next();
});

const Level5ReviewModel = mongoose.model<Level5Review>(
  "Level5Review",
  Level5ReviewSchema
);

export default Level5ReviewModel;
