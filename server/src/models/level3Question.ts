import mongoose, { Document, Schema } from "mongoose";

export interface Level3Question extends Document {
    questionId: string;
    questionText: string;
    questionType: "multiple-choice" | "slider-scale";
    options?: string[]; // Only for multiple-choice questions
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const Level3QuestionSchema: Schema<Level3Question> = new Schema(
    {
        questionId: {
            type: String,
            required: [true, "Question ID is required"],
            unique: true,
            trim: true,
        },
        questionText: {
            type: String,
            required: [true, "Question text is required"],
            trim: true,
        },
        questionType: {
            type: String,
            required: [true, "Question type is required"],
            enum: ["multiple-choice", "slider-scale"],
            default: "multiple-choice",
        },
        options: {
            type: [String],
            required: function (this: Level3Question) {
                return this.questionType === "multiple-choice";
            },
            validate: {
                validator: function (this: Level3Question, v: string[]) {
                    if (this.questionType === "multiple-choice") {
                        return v && v.length === 4; // Must have exactly 4 options
                    }
                    return true; // Slider questions don't need options
                },
                message: "Multiple choice questions must have exactly 4 options",
            },
        },
        order: {
            type: Number,
            required: [true, "Order is required"],
            min: [1, "Order must be at least 1"],
            max: [60, "Order cannot exceed 60"],
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
Level3QuestionSchema.index({ order: 1 });
Level3QuestionSchema.index({ questionType: 1 });

const Level3QuestionModel = mongoose.model<Level3Question>(
    "Level3Question",
    Level3QuestionSchema
);

export default Level3QuestionModel;
