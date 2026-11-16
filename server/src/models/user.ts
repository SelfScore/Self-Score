import mongoose, { Document, Schema } from "mongoose";

export interface User extends Document {
  username: string;
  email: string;
  password?: string;
  countryCode?: string;
  phoneNumber?: string;
  country?: string;
  gender?: "Male" | "Female" | "Non-binary" | "Prefer not to say";
  ageGroup?: "Under 18" | "18-24" | "25-34" | "35-44" | "45-54" | "55+";
  /** @deprecated legacy OTP fields — kept so old documents still load */
  verifyCode?: string;
  isVerified: boolean;
  /** @deprecated */
  verifyCodeExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  // ---- Auth (password + Google) ----
  authProviders: ("password" | "google")[];
  googleId?: string;
  avatarUrl?: string;
  // Incremented to revoke every existing session (password reset, account takeover, etc.)
  tokenVersion: number;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  emailVerifiedAt?: Date;
  // Email verification (link + code sent together)
  emailVerification?: {
    codeHash?: string;
    tokenHash?: string;
    expiresAt?: Date;
    failedAttempts?: number;
  };
  // Passwordless login code (fallback sign-in method)
  loginCode?: {
    codeHash?: string;
    expiresAt?: Date;
    failedAttempts?: number;
  };
  // Pending email change from the profile page
  emailChange?: {
    newEmail?: string;
    codeHash?: string;
    expiresAt?: Date;
    failedAttempts?: number;
  };
  // ---- Profile completion / onboarding ----
  profileCompletedAt?: Date;
  onboardingSkippedAt?: Date;
  verificationReminderSentAt?: Date;
  lastOtpSentAt?: Date;
  otpRequestCount?: number;
  otpRequestCountResetAt?: Date;
  otpFailedAttempts?: number;
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
      remainingAttempts: number;  // 0 = no attempts, 1+ = can take test
      purchaseDate?: Date;
      paymentId?: string;
    };
    level5: {
      remainingAttempts: number;  // 0 = no attempts, 1+ = can take test
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
  emailPreferences?: {
    promotional: boolean;
    unsubscribedAt?: Date;
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
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Non-binary", "Prefer not to say"],
      required: false,
    },
    ageGroup: {
      type: String,
      enum: ["Under 18", "18-24", "25-34", "35-44", "45-54", "55+"],
      required: false,
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
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false, // Optional to not break existing users missing this field
      trim: true,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpiry: {
      type: Date,
      required: false,
    },
    authProviders: {
      type: [{ type: String, enum: ["password", "google"] }],
      default: [],
    },
    googleId: {
      type: String,
      required: false,
    },
    avatarUrl: {
      type: String,
      required: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      required: false,
    },
    emailVerifiedAt: {
      type: Date,
      required: false,
    },
    emailVerification: {
      codeHash: { type: String, required: false },
      tokenHash: { type: String, required: false },
      expiresAt: { type: Date, required: false },
      failedAttempts: { type: Number, default: 0 },
    },
    loginCode: {
      codeHash: { type: String, required: false },
      expiresAt: { type: Date, required: false },
      failedAttempts: { type: Number, default: 0 },
    },
    emailChange: {
      newEmail: { type: String, required: false, lowercase: true, trim: true },
      codeHash: { type: String, required: false },
      expiresAt: { type: Date, required: false },
      failedAttempts: { type: Number, default: 0 },
    },
    profileCompletedAt: {
      type: Date,
      required: false,
    },
    onboardingSkippedAt: {
      type: Date,
      required: false,
    },
    verificationReminderSentAt: {
      type: Date,
      required: false,
    },
    lastOtpSentAt: {
      type: Date,
      required: false,
    },
    otpRequestCount: {
      type: Number,
      default: 0,
    },
    otpRequestCountResetAt: {
      type: Date,
      required: false,
    },
    otpFailedAttempts: {
      type: Number,
      default: 0,
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
        remainingAttempts: {
          type: Number,
          default: 0,
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
      level5: {
        remainingAttempts: {
          type: Number,
          default: 0,
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
    emailPreferences: {
      promotional: {
        type: Boolean,
        default: true,
      },
      unsubscribedAt: {
        type: Date,
        required: false,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Google account id must be unique when present
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
// Lookups for email-verification links and the reminder job
UserSchema.index({ "emailVerification.tokenHash": 1 }, { sparse: true });
UserSchema.index({ isVerified: 1, verificationReminderSentAt: 1, createdAt: 1 });

/** Country, gender and age group are all filled in */
export const isProfileComplete = (user: Pick<User, "country" | "gender" | "ageGroup">): boolean =>
  Boolean(user.country && user.gender && user.ageGroup);

const UserModel = mongoose.model<User>("User", UserSchema);

export default UserModel;
