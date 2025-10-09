import mongoose, { Document, Schema } from "mongoose";

export interface User extends Document {
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
    verifyCode: string;
    isVerified: boolean;
    verifyCodeExpiry: Date;
    subscription: {
        isActive: boolean;
        plan: 'free' | 'premium';
        expiresAt?: Date;
    };
    progress: {
        completedLevels: number[];
        highestUnlockedLevel: number;
        testScores: {
            level1?: number;
            level2?: number;
            level3?: number;
            level4?: number;
        };
    };
}

const UserSchema: Schema<User> = new Schema({
    username: { 
        type: String, 
        required: [true, "Username is required"],
        trim: true
    },
    email: { 
        type: String, 
        unique: true,
        required: [true, "Email is required"],  
        match: [/.+\@.+\..+/, "Please fill a valid email address"], 
        trim: true
    },
    password: { 
        type: String, 
        required: [true, "Password is required"] 
    },
    verifyCode: { 
        type: String, 
        required: false  // Not required after verification
    },
    verifyCodeExpiry: { 
        type: Date, 
        required: false  // Not required after verification
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    phoneNumber: { 
        type: String, 
        required: [false, "Phone number is required"] 
    },
    subscription: {
        isActive: { 
            type: Boolean, 
            default: false 
        },
        plan: { 
            type: String, 
            enum: ['free', 'premium'], 
            default: 'free' 
        },
        expiresAt: { 
            type: Date, 
            required: false 
        }
    },
    progress: {
        completedLevels: {
            type: [Number],
            default: []
        },
        highestUnlockedLevel: {
            type: Number,
            default: 1 // Level 1 is always unlocked
        },
        testScores: {
            level1: { type: Number, required: false },
            level2: { type: Number, required: false },
            level3: { type: Number, required: false },
            level4: { type: Number, required: false }
        }
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt fields
});

const UserModel = mongoose.model<User>("User", UserSchema);

export default UserModel;
