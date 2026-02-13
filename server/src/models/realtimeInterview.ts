import mongoose, { Document, Schema } from "mongoose";

export enum RealtimeInterviewStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  PENDING_REVIEW = "PENDING_REVIEW",
  REVIEWED = "REVIEWED",
  ABANDONED = "ABANDONED",
}

export interface ConversationTurn {
  type: "main_answer" | "follow_up_question" | "follow_up_answer" | "redirect";
  content: string;
  timestamp: Date;
  confidence?: number; // Only for answers
}

export interface AnswerState {
  questionId: string;
  transcript: string; // Verbatim answer (full conversation merged for backward compatibility)
  conversationHistory: ConversationTurn[]; // Structured conversation flow
  confidence: number; // 0-100 (from Gemini Flash)
  isComplete: boolean;
  isOffTopic: boolean;
  missingAspects: string[];
  followUpAsked: boolean;
  followUpCount?: number; // Optional for backward compatibility
  audioTimestamp: {
    start: Date;
    end: Date;
  };
}

export interface RealtimeInterview extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string; // UUID for WebRTC session
  level: number; // Always 4
  status: RealtimeInterviewStatus;

  questions: {
    questionId: string;
    questionText: string;
    order: number;
  }[];

  answers: AnswerState[];

  interviewMetadata: {
    totalDuration: number; // seconds
    averageAnswerLength: number; // seconds
    followUpCount: number;
    redirectionCount: number;
  };

  startedAt: Date;
  completedAt?: Date;
  submittedAt?: Date;
}

const AnswerStateSchema = new Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    transcript: {
      type: String,
      required: true,
    },
    conversationHistory: {
      type: [
        {
          type: {
            type: String,
            enum: [
              "main_answer",
              "follow_up_question",
              "follow_up_answer",
              "redirect",
            ],
            required: true,
          },
          content: {
            type: String,
            required: true,
          },
          timestamp: {
            type: Date,
            required: true,
          },
          confidence: {
            type: Number,
            min: 0,
            max: 100,
          },
        },
      ],
      default: [],
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    isOffTopic: {
      type: Boolean,
      default: false,
    },
    missingAspects: {
      type: [String],
      default: [],
    },
    followUpAsked: {
      type: Boolean,
      default: false,
    },
    audioTimestamp: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
  },
  { _id: false },
);

const RealtimeInterviewSchema: Schema<RealtimeInterview> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      unique: true, // unique: true automatically creates an index
    },
    level: {
      type: Number,
      required: [true, "Level is required"],
      default: 4,
    },
    status: {
      type: String,
      enum: Object.values(RealtimeInterviewStatus),
      default: RealtimeInterviewStatus.IN_PROGRESS,
    },
    questions: [
      {
        questionId: {
          type: String,
          required: true,
        },
        questionText: {
          type: String,
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],
    answers: [AnswerStateSchema],
    interviewMetadata: {
      totalDuration: {
        type: Number,
        default: 0,
      },
      averageAnswerLength: {
        type: Number,
        default: 0,
      },
      followUpCount: {
        type: Number,
        default: 0,
      },
      redirectionCount: {
        type: Number,
        default: 0,
      },
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient querying
RealtimeInterviewSchema.index({ userId: 1, status: 1 });
// Note: sessionId index is created automatically because unique: true is set in the field definition

const RealtimeInterviewModel = mongoose.model<RealtimeInterview>(
  "RealtimeInterview",
  RealtimeInterviewSchema,
);

export default RealtimeInterviewModel;
