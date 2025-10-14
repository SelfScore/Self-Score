import mongoose, { Document, Schema } from "mongoose";

export interface TestSubmission extends Document {
    userId: mongoose.Types.ObjectId;
    level: number;
    score: number;
    totalQuestions: number;
    timeSpent?: number; // in seconds
    submittedAt: Date;
}

const TestSubmissionSchema: Schema<TestSubmission> = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, "User ID is required"]
    },
    level: { 
        type: Number, 
        required: [true, "Level is required"],
        min: [1, "Level must be at least 1"],
        max: [4, "Level must be at most 4"]
    },
    score: { 
        type: Number, 
        required: [true, "Score is required"],
        min: [0, "Score must be non-negative"]
    },
    totalQuestions: {
        type: Number,
        required: [true, "Total questions is required"]
    },
    timeSpent: {
        type: Number,
        required: false
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt fields
});

// Index for faster queries
TestSubmissionSchema.index({ userId: 1, level: 1, submittedAt: -1 });

const TestSubmissionModel = mongoose.model<TestSubmission>("TestSubmission", TestSubmissionSchema);

export default TestSubmissionModel;
