import mongoose, { Document, Schema } from "mongoose";

export interface Level4Question extends Document {
  questionId: string;
  questionText: string;
  level: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const Level4QuestionSchema: Schema<Level4Question> = new Schema(
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
    level: {
      type: Number,
      required: [true, "Level is required"],
      default: 4,
      validate: {
        validator: function (v: number) {
          return v === 4;
        },
        message: "Level must be 4 for Level4Question",
      },
    },
    order: {
      type: Number,
      required: [true, "Order is required"],
      min: [1, "Order must be at least 1"],
      max: [25, "Order cannot exceed 25"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for efficient querying
Level4QuestionSchema.index({ level: 1, order: 1 });

const Level4QuestionModel = mongoose.model<Level4Question>(
  "Level4Question",
  Level4QuestionSchema
);

export default Level4QuestionModel;
