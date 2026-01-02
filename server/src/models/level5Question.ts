import mongoose, { Document, Schema } from "mongoose";

export interface Level5Question extends Document {
  questionId: string;
  questionText: string;
  level: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const Level5QuestionSchema: Schema<Level5Question> = new Schema(
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
      default: 5,
    },
    order: {
      type: Number,
      required: [true, "Order is required"],
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
Level5QuestionSchema.index({ level: 1, order: 1 });

const Level5QuestionModel = mongoose.model<Level5Question>(
  "Level5Question",
  Level5QuestionSchema
);

export default Level5QuestionModel;
