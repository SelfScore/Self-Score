import mongoose, { Document, Schema } from "mongoose";

export interface QuestionsResponse extends Document {
    userId: mongoose.Types.ObjectId;
    level: number;
    questionId: mongoose.Types.ObjectId;
    selectedOptionIndex: number;
    // isCorrect: boolean;
}

const QuestionsResponseSchema: Schema<QuestionsResponse> = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, "User ID is required"]
    },
    level: { 
        type: Number, 
        required: [true, "Level is required"],
        min: [1, "Level must be at least 1"]
    },
    questionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Question', 
        required: [true, "Question ID is required"]
    },
    selectedOptionIndex: { 
        type: Number, 
        required: [true, "Selected option index is required"],
        validate: {
            validator: function(v: number) {
                return v >= 0; // Must be a non-negative index
            },
            message: "Selected option index must be a non-negative integer"
        }
    },
    // isCorrect: { 
    //     type: Boolean, 
    //     required: [true, "isCorrect is required"]
    // }
}, {
    timestamps: true  // Adds createdAt and updatedAt fields
});

const QuestionsResponseModel = mongoose.model<QuestionsResponse>("QuestionsResponse", QuestionsResponseSchema);

export default QuestionsResponseModel;