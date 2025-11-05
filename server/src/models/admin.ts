import mongoose, { Document, Schema } from "mongoose";

export interface Admin extends Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema: Schema<Admin> = new Schema({
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
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: [true, "Password is required"] 
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt fields
});

const AdminModel = mongoose.model<Admin>("Admin", AdminSchema);

export default AdminModel;
