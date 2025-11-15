import mongoose, { Document, Schema } from "mongoose";

export enum ReviewStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED"
}

export interface QuestionReview {
    questionId: string;
    questionText: string;
    userAnswer: string;
    answerMode: 'TEXT' | 'VOICE' | 'MIXED'; // Track how user answered
    score: number;
    remark: string;
}

export interface Level4Review extends Document {
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

const QuestionReviewSchema = new Schema({
    questionId: { 
        type: String, 
        required: true 
    },
    questionText: { 
        type: String, 
        required: true 
    },
    userAnswer: { 
        type: String, 
        required: true 
    },
    answerMode: {
        type: String,
        enum: ['TEXT', 'VOICE', 'MIXED'],
        required: true
    },
    score: { 
        type: Number, 
        required: true,
        min: 0
    },
    remark: { 
        type: String, 
        required: true,
        trim: true
    }
}, { _id: false });

const Level4ReviewSchema: Schema<Level4Review> = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, "User ID is required"],
        index: true
    },
    interviewId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AIInterview', 
        required: [true, "Interview ID is required"],
        index: true
    },
    adminId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Admin', 
        required: [true, "Admin ID is required"]
    },
    attemptNumber: {
        type: Number,
        required: true,
        default: 1
    },
    questionReviews: {
        type: [QuestionReviewSchema],
        required: true,
        validate: {
            validator: function(v: QuestionReview[]) {
                return v.length === 8; // Must have exactly 8 question reviews
            },
            message: "Exactly 8 question reviews are required"
        }
    },
    totalScore: { 
        type: Number, 
        required: true,
        min: 350,
        max: 900
    },
    status: { 
        type: String, 
        enum: Object.values(ReviewStatus),
        default: ReviewStatus.DRAFT
    },
    reviewedAt: { 
        type: Date 
    },
    submittedAt: { 
        type: Date 
    }
}, {
    timestamps: true
});

// Indexes for faster queries
Level4ReviewSchema.index({ userId: 1, interviewId: 1 });
Level4ReviewSchema.index({ status: 1 });
Level4ReviewSchema.index({ submittedAt: -1 });

// Ensure total score is within range before saving
Level4ReviewSchema.pre('save', function(next) {
    if (this.totalScore < 350) {
        this.totalScore = 350;
    } else if (this.totalScore > 900) {
        this.totalScore = 900;
    }
    next();
});

const Level4ReviewModel = mongoose.model<Level4Review>("Level4Review", Level4ReviewSchema);

export default Level4ReviewModel;
