import mongoose, { Document, Schema } from "mongoose";

export interface Subscriber extends Document {
  name: string;
  email: string;
  isSubscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source: string;
}

const SubscriberSchema = new Schema<Subscriber>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"],
    },
    isSubscribed: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    source: {
      type: String,
      default: "homepage-popup",
    },
  },
  {
    timestamps: true,
  }
);

export const SubscriberModel = mongoose.model<Subscriber>(
  "Subscriber",
  SubscriberSchema
);
