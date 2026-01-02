import mongoose, { Document, Schema } from "mongoose";

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  certificateFile?: string; // Base64 or file path
}

export interface Service {
  sessionType: "30min" | "60min" | "90min";
  duration: number; // in minutes
  enabled: boolean;
  isFree?: boolean;
  price?: number; // in USD
}

// export interface CalcomIntegration {
//     isConnected: boolean;
//     accessToken?: string;
//     refreshToken?: string;
//     username?: string;
//     userId?: string; // Cal.com user ID
//     eventTypes?: {
//         duration30?: {
//             id: number;
//             slug: string;
//             link: string;
//         };
//         duration60?: {
//             id: number;
//             slug: string;
//             link: string;
//         };
//         duration90?: {
//             id: number;
//             slug: string;
//             link: string;
//         };
//     };
//     webhookId?: string;
//     connectedAt?: Date;
//     lastSyncedAt?: Date;
// }

export interface Consultant extends Document {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  countryCode: string;
  phoneNumber: string;
  location: string; // City, State
  profilePhoto?: string; // Base64 or file path

  // Email Verification
  verifyCode: string;
  isVerified: boolean;
  verifyCodeExpiry: Date;

  // Password Reset & Email Change
  resetPasswordToken?: string; // Used for pending email changes

  // Professional Information
  coachingSpecialties: string[]; // Array of selected specialties
  yearsOfExperience: number;
  professionalBio: string;
  languagesSpoken: string[]; // Array of languages

  // Certifications & Credentials
  certifications: Certification[];
  resume?: string; // Base64 or file path (NOT optional as per requirement)

  // Services
  hourlyRate: number; // in USD
  services: Service[];
  generalAvailability?: string; // e.g., "Weekdays 9 AM - 5 PM EST"
  introductionVideoLink?: string;

  // Application Status
  applicationStatus: "draft" | "pending" | "approved" | "rejected";
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId; // Admin who reviewed
  rejectionReason?: string;

  // Registration Progress
  registrationStep: number; // 1-5, tracks which step they're on (added Step 5 for calendar)

  // Google Calendar Integration
  googleCalendar?: {
    isConnected: boolean;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: Date;
    email?: string; // Google account email
    calendarId?: string; // Primary calendar ID
    connectedAt?: Date;
    lastSyncedAt?: Date;
  };

  // Booking Settings (Calendly-style)
  bookingSettings?: {
    // Availability schedule (per day of week)
    availability: Array<{
      dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
      timeRanges: Array<{
        startTime: string; // HH:mm format (e.g., "09:00")
        endTime: string; // HH:mm format (e.g., "17:00")
      }>;
      isAvailable: boolean;
    }>;

    // Slot configuration
    bufferBetweenSessions: number; // in minutes (5, 10, 15)

    // Booking window
    minAdvanceBookingHours: number; // default: 3 hours
    maxAdvanceBookingMonths: number; // default: 6 months

    // Meeting preferences
    autoCreateMeetLink: boolean;
    meetingLocation?: string;

    // Timezone
    timezone: string; // e.g., "America/New_York"
  };

  // Cal.com Integration (deprecated, keeping for backward compatibility)
  // calcom?: CalcomIntegration;

  createdAt: Date;
  updatedAt: Date;
}

const CertificationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Certification name is required"],
      trim: true,
    },
    issuingOrganization: {
      type: String,
      required: [true, "Issuing organization is required"],
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, "Issue date is required"],
    },
    certificateFile: {
      type: String,
      required: false,
      // Now stores S3 URL instead of base64
    },
  },
  { _id: false }
);

const ServiceSchema = new Schema(
  {
    sessionType: {
      type: String,
      enum: ["30min", "60min", "90min"],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: false,
      min: 0,
    },
  },
  { _id: false }
);

const ConsultantSchema: Schema<Consultant> = new Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
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
      required: [true, "Password is required"],
    },
    countryCode: {
      type: String,
      required: [true, "Country code is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    profilePhoto: {
      type: String,
      required: false,
      // Now stores S3 URL instead of base64
      // No size validation needed as S3 handles storage
    },

    // Email Verification
    verifyCode: {
      type: String,
      required: false,
    },
    verifyCodeExpiry: {
      type: Date,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Password Reset & Email Change
    resetPasswordToken: {
      type: String,
      required: false,
    },

    // Professional Information
    coachingSpecialties: {
      type: [String],
      required: false,
      default: [],
    },
    yearsOfExperience: {
      type: Number,
      required: false,
      min: 0,
    },
    professionalBio: {
      type: String,
      required: false,
      trim: true,
      maxlength: [250, "Professional bio cannot exceed 250 characters"],
    },
    languagesSpoken: {
      type: [String],
      required: false,
      default: [],
    },

    // Certifications
    certifications: {
      type: [CertificationSchema],
      required: false,
      default: [],
    },
    resume: {
      type: String,
      required: false,
      // Now stores S3 URL instead of base64
    },

    // Services
    hourlyRate: {
      type: Number,
      required: false,
      min: 0,
    },
    services: {
      type: [ServiceSchema],
      required: false,
      default: [],
    },
    generalAvailability: {
      type: String,
      required: false,
      trim: true,
    },
    introductionVideoLink: {
      type: String,
      required: false,
      trim: true,
    },

    // Application Status
    applicationStatus: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },
    appliedAt: {
      type: Date,
      required: false,
    },
    reviewedAt: {
      type: Date,
      required: false,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    rejectionReason: {
      type: String,
      required: false,
      trim: true,
    },

    // Registration Progress
    registrationStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 5, // Updated to 5 (added calendar connection step)
    },

    // Google Calendar Integration
    googleCalendar: {
      isConnected: {
        type: Boolean,
        default: false,
      },
      accessToken: {
        type: String,
        required: false,
        select: false, // Don't include in queries by default (security)
      },
      refreshToken: {
        type: String,
        required: false,
        select: false, // Don't include in queries by default (security)
      },
      tokenExpiry: {
        type: Date,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      calendarId: {
        type: String,
        required: false,
      },
      connectedAt: {
        type: Date,
        required: false,
      },
      lastSyncedAt: {
        type: Date,
        required: false,
      },
    },

    // Booking Settings (Calendly-style)
    bookingSettings: {
      availability: [
        {
          dayOfWeek: {
            type: Number,
            required: true,
            min: 0,
            max: 6,
          },
          timeRanges: [
            {
              startTime: {
                type: String,
                required: true,
                match: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:mm format
              },
              endTime: {
                type: String,
                required: true,
                match: /^([01]\d|2[0-3]):([0-5]\d)$/,
              },
            },
          ],
          isAvailable: {
            type: Boolean,
            default: true,
          },
        },
      ],
      bufferBetweenSessions: {
        type: Number,
        enum: [5, 10, 15],
        default: 10,
      },
      minAdvanceBookingHours: {
        type: Number,
        default: 3,
      },
      maxAdvanceBookingMonths: {
        type: Number,
        default: 6,
      },
      autoCreateMeetLink: {
        type: Boolean,
        default: true,
      },
      meetingLocation: {
        type: String,
        default: "Google Meet",
      },
      timezone: {
        type: String,
        required: false,
        default: "UTC",
      },
    },

    // Cal.com Integration
    // calcom: {
    //     isConnected: {
    //         type: Boolean,
    //         default: false
    //     },
    //     accessToken: {
    //         type: String,
    //         required: false
    //     },
    //     refreshToken: {
    //         type: String,
    //         required: false
    //     },
    //     username: {
    //         type: String,
    //         required: false
    //     },
    //     userId: {
    //         type: String,
    //         required: false
    //     },
    //     eventTypes: {
    //         duration30: {
    //             id: { type: Number, required: false },
    //             slug: { type: String, required: false },
    //             link: { type: String, required: false }
    //         },
    //         duration60: {
    //             id: { type: Number, required: false },
    //             slug: { type: String, required: false },
    //             link: { type: String, required: false }
    //         },
    //         duration90: {
    //             id: { type: Number, required: false },
    //             slug: { type: String, required: false },
    //             link: { type: String, required: false }
    //         }
    //     },
    //     webhookId: {
    //         type: String,
    //         required: false
    //     },
    //     connectedAt: {
    //         type: Date,
    //         required: false
    //     },
    //     lastSyncedAt: {
    //         type: Date,
    //         required: false
    //     }
    // }
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// Note: email index is created automatically because unique: true is set in the field definition
ConsultantSchema.index({ applicationStatus: 1 });
ConsultantSchema.index({ createdAt: -1 });
// ConsultantSchema.index({ 'calcom.isConnected': 1 });

const ConsultantModel = mongoose.model<Consultant>(
  "Consultant",
  ConsultantSchema
);

export default ConsultantModel;
