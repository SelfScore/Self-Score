import mongoose, { Document, Schema } from "mongoose";

export interface Question extends Document {
    level: number;
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    questionType?: string; // e.g., "multiple-choice", "true-false"
}

const QuestionSchema: Schema<Question> = new Schema({
    level: { 
        type: Number, 
        required: [true, "Level is required"],
        min: [1, "Level must be at least 1"]
    },
    questionText: { 
        type: String, 
        required: [true, "Question text is required"],
        trim: true
    },
    options: { 
        type: [String], 
        required: [true, "Options are required"],
        validate: {
            validator: function(v: string[]) {
                return v.length >= 2; // At least two options
            },
            message: "At least two options are required"
        }
    },
    correctOptionIndex: { 
        type: Number, 
        required: [true, "Correct option index is required"],
        validate: {
            validator: function(v: number) {
                return v >= 0; // Must be a non-negative index
            },
            message: "Correct option index must be a non-negative integer"
        }
    },
    questionType: { 
        type: String, 
        enum: ["multiple-choice", "slider-scale"],
        default: "multiple-choice"
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt fields
});

const QuestionModel = mongoose.model<Question>("Question", QuestionSchema);

export default QuestionModel;