import { Request, Response } from "express";
import ContactMessageModel from "../models/contactMessage";
import { checkDatabaseConnection } from "../lib/dbUtils";
import { sendContactNotificationEmail } from "../lib/email";
import { ApiResponse } from "../types/api";
import { z } from "zod";

// Validation schema
const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address").trim(),
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message cannot exceed 1000 characters")
    .trim(),
});

export class ContactController {
  // Send contact message (public endpoint)
  static async sendMessage(req: Request, res: Response): Promise<void> {
    if (!checkDatabaseConnection()) {
      const response: ApiResponse = {
        success: false,
        message: "Database connection not available. Please try again later.",
      };
      res.status(503).json(response);
      return;
    }

    try {
      const validationResult = contactMessageSchema.safeParse(req.body);

      if (!validationResult.success) {
        const response: ApiResponse = {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues,
        };
        res.status(400).json(response);
        return;
      }

      const { name, email, message } = validationResult.data;

      // Create new contact message
      const newMessage = new ContactMessageModel({
        name,
        email,
        message,
        status: "unread",
      });

      await newMessage.save();

      // Send email notification to admin
      const emailSent = await sendContactNotificationEmail({
        name,
        email,
        message,
        messageId: (newMessage._id as string).toString(),
      });

      if (!emailSent) {
        console.warn("⚠️  Failed to send notification email to admin");
      }

      const response: ApiResponse = {
        success: true,
        message: "Message sent successfully! We'll get back to you soon.",
        data: {
          messageId: newMessage._id,
        },
      };
      res.status(201).json(response);
    } catch (error) {
      console.error("Error sending contact message:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to send message. Please try again later.",
      };
      res.status(500).json(response);
    }
  }
}
