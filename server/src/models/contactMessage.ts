import mongoose, { Document, Schema } from "mongoose";

export interface ContactMessage extends Document {
    name: string;
    email: string;
    message: string;
    status: 'unread' | 'read';
    adminReply?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContactMessageSchema: Schema<ContactMessage> = new Schema({
    name: { 
        type: String, 
        required: [true, "Name is required"],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, "Email is required"],
        match: [/.+\@.+\..+/, "Please fill a valid email address"], 
        trim: true
    },
    message: { 
        type: String, 
        required: [true, "Message is required"],
        trim: true,
        maxlength: [1000, "Message cannot exceed 1000 characters"]
    },
    status: { 
        type: String, 
        enum: ['unread', 'read'],
        default: 'unread'
    },
    adminReply: { 
        type: String, 
        required: false,
        trim: true
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt fields
});

// Index for faster queries
ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ status: 1 });

const ContactMessageModel = mongoose.model<ContactMessage>("ContactMessage", ContactMessageSchema);

export default ContactMessageModel;
