// import mongoose, { Document, Schema } from "mongoose";

// export interface Attendee {
//     name: string;
//     email: string;
//     timeZone: string;
//     locale?: string;
// }

// export interface Booking extends Document {
//     // Cal.com booking details
//     calcomBookingId: number;
//     calcomBookingUid: string;
    
//     // Consultant & User
//     consultantId: mongoose.Types.ObjectId;
//     userId?: mongoose.Types.ObjectId; // Optional - for registered users
    
//     // Attendee info (guest or user)
//     attendee: Attendee;
    
//     // Booking details
//     title: string;
//     description?: string;
//     startTime: Date;
//     endTime: Date;
//     duration: number; // in minutes
//     status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
    
//     // Event type
//     eventTypeId: number;
//     eventTypeSlug: string;
    
//     // Meeting details
//     meetingUrl?: string;
//     location?: string;
    
//     // Cancellation
//     cancellationReason?: string;
//     cancelledAt?: Date;
//     cancelledBy?: 'consultant' | 'user' | 'system';
    
//     // Rescheduling
//     rescheduledFrom?: mongoose.Types.ObjectId; // Reference to original booking
//     rescheduledTo?: mongoose.Types.ObjectId; // Reference to new booking
    
//     // Metadata
//     metadata?: Record<string, any>;
    
//     // Timestamps
//     createdAt: Date;
//     updatedAt: Date;
// }

// const AttendeeSchema = new Schema({
//     name: {
//         type: String,
//         required: [true, "Attendee name is required"]
//     },
//     email: {
//         type: String,
//         required: [true, "Attendee email is required"],
//         match: [/.+\@.+\..+/, "Please provide a valid email"]
//     },
//     timeZone: {
//         type: String,
//         required: [true, "Time zone is required"]
//     },
//     locale: {
//         type: String,
//         required: false
//     }
// }, { _id: false });

// const BookingSchema: Schema<Booking> = new Schema({
//     // Cal.com booking details
//     calcomBookingId: {
//         type: Number,
//         required: [true, "Cal.com booking ID is required"],
//         unique: true,
//         index: true
//     },
//     calcomBookingUid: {
//         type: String,
//         required: [true, "Cal.com booking UID is required"],
//         unique: true,
//         index: true
//     },
    
//     // Consultant & User
//     consultantId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Consultant',
//         required: [true, "Consultant ID is required"],
//         index: true
//     },
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: false,
//         index: true
//     },
    
//     // Attendee info
//     attendee: {
//         type: AttendeeSchema,
//         required: [true, "Attendee information is required"]
//     },
    
//     // Booking details
//     title: {
//         type: String,
//         required: [true, "Booking title is required"]
//     },
//     description: {
//         type: String,
//         required: false
//     },
//     startTime: {
//         type: Date,
//         required: [true, "Start time is required"],
//         index: true
//     },
//     endTime: {
//         type: Date,
//         required: [true, "End time is required"]
//     },
//     duration: {
//         type: Number,
//         required: [true, "Duration is required"],
//         min: 0
//     },
//     status: {
//         type: String,
//         enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no-show'],
//         default: 'scheduled',
//         index: true
//     },
    
//     // Event type
//     eventTypeId: {
//         type: Number,
//         required: [true, "Event type ID is required"]
//     },
//     eventTypeSlug: {
//         type: String,
//         required: [true, "Event type slug is required"]
//     },
    
//     // Meeting details
//     meetingUrl: {
//         type: String,
//         required: false
//     },
//     location: {
//         type: String,
//         required: false
//     },
    
//     // Cancellation
//     cancellationReason: {
//         type: String,
//         required: false
//     },
//     cancelledAt: {
//         type: Date,
//         required: false
//     },
//     cancelledBy: {
//         type: String,
//         enum: ['consultant', 'user', 'system'],
//         required: false
//     },
    
//     // Rescheduling
//     rescheduledFrom: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Booking',
//         required: false
//     },
//     rescheduledTo: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Booking',
//         required: false
//     },
    
//     // Metadata
//     metadata: {
//         type: Schema.Types.Mixed,
//         required: false
//     }
// }, {
//     timestamps: true
// });

// // Indexes for common queries
// BookingSchema.index({ consultantId: 1, startTime: -1 });
// BookingSchema.index({ userId: 1, startTime: -1 });
// BookingSchema.index({ status: 1, startTime: -1 });
// BookingSchema.index({ createdAt: -1 });

// const BookingModel = mongoose.model<Booking>("Booking", BookingSchema);

// export default BookingModel;
