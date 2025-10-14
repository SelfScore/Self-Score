import mongoose, { Document, Schema } from "mongoose";

export interface Payment extends Document {
    userId: mongoose.Types.ObjectId;
    level: number;
    amount: number;
    currency: string;
    stripeSessionId: string;
    stripePaymentIntentId?: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema<Payment> = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, "User ID is required"]
    },
    level: { 
        type: Number, 
        required: [true, "Level is required"],
        min: [2, "Only levels 2-4 require payment"],
        max: [4, "Maximum level is 4"]
    },
    amount: { 
        type: Number, 
        required: [true, "Amount is required"]
    },
    currency: { 
        type: String, 
        required: [true, "Currency is required"],
        default: 'usd'
    },
    stripeSessionId: { 
        type: String, 
        required: [true, "Stripe session ID is required"],
        unique: true
    },
    stripePaymentIntentId: { 
        type: String, 
        required: false
    },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: { 
        type: String, 
        required: false
    }
}, {
    timestamps: true
});

const PaymentModel = mongoose.model<Payment>("Payment", PaymentSchema);

export default PaymentModel;
