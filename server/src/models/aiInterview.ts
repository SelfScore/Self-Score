import mongoose, { Document, Schema } from "mongoose";

export enum InterviewMode {
    TEXT = "TEXT",
    VOICE = "VOICE"
}

export enum InterviewStatus {
    IN_PROGRESS = "IN_PROGRESS",
    PENDING_REVIEW = "PENDING_REVIEW",
    REVIEWED = "REVIEWED",
    COMPLETED = "COMPLETED", // Keep for backward compatibility
    ABANDONED = "ABANDONED"
}

export interface AIInterview extends Document {
    userId: mongoose.Types.ObjectId;
    level: number; // Will be 4 for Level 4
    mode: InterviewMode; // TEXT or VOICE
    status: InterviewStatus;
    attemptNumber: number; // Track which attempt this is for the user
    questions: {
        questionId: string;
        questionText: string;
        questionOrder: number;
    }[];
    answers: {
        questionId: string;
        answerText: string;
        timestamp: Date;
    }[];
    transcript?: {
        role: 'user' | 'assistant';
        content: string;
        questionId?: string; // Added to link voice answers to questions
        timestamp: Date;
    }[];
    startedAt: Date;
    completedAt?: Date;
    submittedAt?: Date;
    feedbackId?: mongoose.Types.ObjectId; // Keep for backward compatibility
    reviewId?: mongoose.Types.ObjectId; // Link to Level4Review
}

const AIInterviewSchema: Schema<AIInterview> = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, "User ID is required"],
        index: true
    },
    level: { 
        type: Number, 
        required: [true, "Level is required"],
        default: 4
    },
    mode: { 
        type: String, 
        enum: Object.values(InterviewMode),
        required: [true, "Interview mode is required"]
    },
    status: { 
        type: String, 
        enum: Object.values(InterviewStatus),
        default: InterviewStatus.IN_PROGRESS
    },
    attemptNumber: {
        type: Number,
        required: true,
        default: 1
    },
    questions: [{
        questionId: { 
            type: String, 
            required: true 
        },
        questionText: { 
            type: String, 
            required: true 
        },
        questionOrder: { 
            type: Number, 
            required: true 
        }
    }],
    answers: [{
        questionId: { 
            type: String, 
            required: true 
        },
        answerText: { 
            type: String, 
            required: true 
        },
        timestamp: { 
            type: Date, 
            default: Date.now 
        }
    }],
    transcript: [{
        role: { 
            type: String, 
            enum: ['user', 'assistant'],
            required: true 
        },
        content: { 
            type: String, 
            required: true 
        },
        questionId: {
            type: String,
            required: false // Optional for backward compatibility
        },
        timestamp: { 
            type: Date, 
            default: Date.now 
        }
    }],
    startedAt: { 
        type: Date, 
        default: Date.now 
    },
    completedAt: { 
        type: Date 
    },
    submittedAt: {
        type: Date
    },
    feedbackId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AIFeedback' // Keep for backward compatibility
    },
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Level4Review'
    }
}, {
    timestamps: true
});

// Index for faster queries
AIInterviewSchema.index({ userId: 1, level: 1, status: 1 });

const AIInterviewModel = mongoose.model<AIInterview>("AIInterview", AIInterviewSchema);

export default AIInterviewModel;
