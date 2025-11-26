import mongoose, { Document, Schema } from "mongoose";

export interface Certification {
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    certificateFile?: string; // Base64 or file path
}

export interface Service {
    sessionType: '30min' | '60min' | '90min';
    duration: number; // in minutes
    enabled: boolean;
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
    applicationStatus: 'pending' | 'approved' | 'rejected';
    appliedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId; // Admin who reviewed
    rejectionReason?: string;
    
    // Registration Progress
    registrationStep: number; // 1-4, tracks which step they're on
    
    // Cal.com Integration
    // calcom?: CalcomIntegration;
    
    createdAt: Date;
    updatedAt: Date;
}

const CertificationSchema = new Schema({
    name: { 
        type: String, 
        required: [true, "Certification name is required"],
        trim: true
    },
    issuingOrganization: { 
        type: String, 
        required: [true, "Issuing organization is required"],
        trim: true
    },
    issueDate: { 
        type: Date, 
        required: [true, "Issue date is required"]
    },
    certificateFile: { 
        type: String, 
        required: false,
        validate: {
            validator: function(v: string) {
                // Check if base64 string is under 1MB
                if (v && v.startsWith('data:')) {
                    const sizeInBytes = (v.length * 3) / 4;
                    return sizeInBytes <= 1048576; // 1MB = 1048576 bytes
                }
                return true;
            },
            message: "Certificate file must be under 1MB"
        }
    }
}, { _id: false });

const ServiceSchema = new Schema({
    sessionType: { 
        type: String, 
        enum: ['30min', '60min', '90min'],
        required: true
    },
    duration: { 
        type: Number, 
        required: true
    },
    enabled: { 
        type: Boolean, 
        default: true
    }
}, { _id: false });

const ConsultantSchema: Schema<Consultant> = new Schema({
    // Personal Information
    firstName: { 
        type: String, 
        required: [true, "First name is required"],
        trim: true
    },
    lastName: { 
        type: String, 
        required: [true, "Last name is required"],
        trim: true
    },
    email: { 
        type: String, 
        unique: true,
        required: [true, "Email is required"],
        match: [/.+\@.+\..+/, "Please fill a valid email address"], 
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: [true, "Password is required"] 
    },
    countryCode: {
        type: String,
        required: [true, "Country code is required"]
    },
    phoneNumber: { 
        type: String, 
        required: [true, "Phone number is required"] 
    },
    location: { 
        type: String, 
        required: [true, "Location is required"],
        trim: true
    },
    profilePhoto: { 
        type: String, 
        required: false,
        validate: {
            validator: function(v: string) {
                if (v && v.startsWith('data:')) {
                    const sizeInBytes = (v.length * 3) / 4;
                    return sizeInBytes <= 1048576; // 1MB
                }
                return true;
            },
            message: "Profile photo must be under 1MB"
        }
    },
    
    // Email Verification
    verifyCode: { 
        type: String, 
        required: false
    },
    verifyCodeExpiry: { 
        type: Date, 
        required: false
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    
    // Professional Information
    coachingSpecialties: {
        type: [String],
        required: false,
        default: []
    },
    yearsOfExperience: {
        type: Number,
        required: false,
        min: 0
    },
    professionalBio: {
        type: String,
        required: false,
        trim: true,
        minlength: [200, "Professional bio must be at least 200 characters"],
        maxlength: [2000, "Professional bio cannot exceed 2000 characters"]
    },
    languagesSpoken: {
        type: [String],
        required: false,
        default: []
    },
    
    // Certifications
    certifications: {
        type: [CertificationSchema],
        required: false,
        default: []
    },
    resume: { 
        type: String, 
        required: false,
        validate: {
            validator: function(v: string) {
                if (v && v.startsWith('data:')) {
                    const sizeInBytes = (v.length * 3) / 4;
                    return sizeInBytes <= 1048576; // 1MB
                }
                return true;
            },
            message: "Resume must be under 1MB"
        }
    },
    
    // Services
    hourlyRate: {
        type: Number,
        required: false,
        min: 0
    },
    services: {
        type: [ServiceSchema],
        required: false,
        default: []
    },
    generalAvailability: {
        type: String,
        required: false,
        trim: true
    },
    introductionVideoLink: {
        type: String,
        required: false,
        trim: true
    },
    
    // Application Status
    applicationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    appliedAt: {
        type: Date,
        required: false
    },
    reviewedAt: {
        type: Date,
        required: false
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false
    },
    rejectionReason: {
        type: String,
        required: false,
        trim: true
    },
    
    // Registration Progress
    registrationStep: {
        type: Number,
        default: 1,
        min: 1,
        max: 4
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
}, {
    timestamps: true
});

// Index for faster queries
ConsultantSchema.index({ email: 1 });
ConsultantSchema.index({ applicationStatus: 1 });
ConsultantSchema.index({ createdAt: -1 });
// ConsultantSchema.index({ 'calcom.isConnected': 1 });

const ConsultantModel = mongoose.model<Consultant>("Consultant", ConsultantSchema);

export default ConsultantModel;
