import mongoose, { Document, Schema } from "mongoose";

export interface User extends Document {
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
    verifyCode: string;
    isVerified: boolean;
    verifyCodeExpiry: Date;
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
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt fields
});

const UserModel = mongoose.model<User>("User", UserSchema);

export default UserModel;
