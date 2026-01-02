import mongoose, { Document, Schema } from "mongoose";

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  countryCode: string;
  phoneNumber: string;
  verifyCode: string;
  isVerified: boolean;
  verifyCodeExpiry: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  purchasedLevels: {
    level2: {
      purchased: boolean;
      purchaseDate?: Date;
      paymentId?: string;
    };
    level3: {
      purchased: boolean;
      purchaseDate?: Date;
      paymentId?: string;
    };
    level4: {
      purchased: boolean;
      purchaseDate?: Date;
      paymentId?: string;
    };
  };
  progress: {
    completedLevels: number[];
    highestUnlockedLevel: number;
    level5?: "NOT_STARTED" | "IN_PROGRESS" | "PENDING_REVIEW" | "REVIEWED";
    testScores: {
      level1?: number;
      level2?: number;
      level3?: number;
      level4?: number;
      level5?: number;
    };
  };
  scores?: {
    level5?: number;
  };
}

const UserSchema: Schema<User> = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    verifyCode: {
      type: String,
      required: false, // Not required after verification
    },
    verifyCodeExpiry: {
      type: Date,
      required: false, // Not required after verification
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    countryCode: {
      type: String,
      required: [true, "Country code is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpiry: {
      type: Date,
      required: false,
    },
    purchasedLevels: {
      level2: {
        purchased: {
          type: Boolean,
          default: false,
        },
        purchaseDate: {
          type: Date,
          required: false,
        },
        paymentId: {
          type: String,
          required: false,
        },
      },
      level3: {
        purchased: {
          type: Boolean,
          default: false,
        },
        purchaseDate: {
          type: Date,
          required: false,
        },
        paymentId: {
          type: String,
          required: false,
        },
      },
      level4: {
        purchased: {
          type: Boolean,
          default: false,
        },
        purchaseDate: {
          type: Date,
          required: false,
        },
        paymentId: {
          type: String,
          required: false,
        },
      },
    },
    progress: {
      completedLevels: {
        type: [Number],
        default: [],
      },
      highestUnlockedLevel: {
        type: Number,
        default: 1, // Level 1 is always unlocked
      },
      level5: {
        type: String,
        enum: ["NOT_STARTED", "IN_PROGRESS", "PENDING_REVIEW", "REVIEWED"],
        default: "NOT_STARTED",
      },
      testScores: {
        level1: { type: Number, required: false },
        level2: { type: Number, required: false },
        level3: { type: Number, required: false },
        level4: { type: Number, required: false },
        level5: { type: Number, required: false },
      },
    },
    scores: {
      level5: { type: Number, required: false },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const UserModel = mongoose.model<User>("User", UserSchema);

export default UserModel;
