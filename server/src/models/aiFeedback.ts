import mongoose, { Document, Schema } from "mongoose";

export interface CategoryScore {
    name: string;
    score: number; // 0-100
    comment: string;
}

export interface AIFeedback extends Document {
    userId: mongoose.Types.ObjectId;
    interviewId: mongoose.Types.ObjectId;
    level: number;
    totalScore: number; // 0-100
    categoryScores: CategoryScore[];
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
    recommendations: string[];
    createdAt: Date;
}

const CategoryScoreSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    score: { 
        type: Number, 
        required: true,
        min: 0,
        max: 100
    },
    comment: { 
        type: String, 
        required: true 
    }
}, { _id: false });

const AIFeedbackSchema: Schema<AIFeedback> = new Schema({
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
        unique: true // One feedback per interview
    },
    level: { 
        type: Number, 
        required: [true, "Level is required"],
        default: 4
    },
    totalScore: { 
        type: Number, 
        required: [true, "Total score is required"],
        min: 0,
        max: 100
    },
    categoryScores: {
        type: [CategoryScoreSchema],
        required: true,
        validate: {
            validator: function(v: CategoryScore[]) {
                return v.length >= 5; // At least 5 categories
            },
            message: "At least 5 category scores are required"
        }
    },
    strengths: {
        type: [String],
        required: true,
        validate: {
            validator: function(v: string[]) {
                return v.length >= 2; // At least 2 strengths
            },
            message: "At least 2 strengths are required"
        }
    },
    areasForImprovement: {
        type: [String],
        required: true,
        validate: {
            validator: function(v: string[]) {
                return v.length >= 2; // At least 2 areas for improvement
            },
            message: "At least 2 areas for improvement are required"
        }
    },
    finalAssessment: { 
        type: String, 
        required: [true, "Final assessment is required"],
        minlength: [50, "Final assessment must be at least 50 characters"]
    },
    recommendations: {
        type: [String],
        required: true,
        validate: {
            validator: function(v: string[]) {
                return v.length >= 3; // At least 3 recommendations
            },
            message: "At least 3 recommendations are required"
        }
    }
}, {
    timestamps: true
});

// Index for faster queries
AIFeedbackSchema.index({ userId: 1, level: 1 });
AIFeedbackSchema.index({ interviewId: 1 });

const AIFeedbackModel = mongoose.model<AIFeedback>("AIFeedback", AIFeedbackSchema);

export default AIFeedbackModel;
