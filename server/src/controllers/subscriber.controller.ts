import { Request, Response } from "express";
import { SubscriberModel } from "../models/subscriber";
import { sendSubscriberWelcomeEmail } from "../lib/email";
import { ApiResponse } from "../types/api";

export const SubscriberController = {
  // POST /api/newsletter/subscribe
  subscribe: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email } = req.body;

      // Basic validation
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        const response: ApiResponse = {
          success: false,
          message: "Please enter a valid name (at least 2 characters).",
        };
        res.status(400).json(response);
        return;
      }

      if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        const response: ApiResponse = {
          success: false,
          message: "Please enter a valid email address.",
        };
        res.status(400).json(response);
        return;
      }

      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();

      // Check if already subscribed
      const existing = await SubscriberModel.findOne({ email: trimmedEmail });

      if (existing) {
        if (existing.isSubscribed) {
          const response: ApiResponse = {
            success: false,
            message: "This email is already subscribed!",
          };
          res.status(409).json(response);
          return;
        }

        // Re-subscribe
        existing.isSubscribed = true;
        existing.name = trimmedName;
        existing.subscribedAt = new Date();
        existing.unsubscribedAt = undefined;
        await existing.save();
      } else {
        // New subscriber
        await SubscriberModel.create({
          name: trimmedName,
          email: trimmedEmail,
          source: "homepage-popup",
        });
      }

      // Send welcome email (non-blocking — don't fail if email fails)
      sendSubscriberWelcomeEmail({
        name: trimmedName,
        email: trimmedEmail,
      }).catch((err) => {
        console.error("Failed to send subscriber welcome email:", err);
      });

      const response: ApiResponse = {
        success: true,
        message: "You're subscribed! Check your inbox for a welcome message.",
      };
      res.status(201).json(response);
    } catch (error) {
      console.error("Error in subscribe route:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  },
};
