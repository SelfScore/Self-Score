import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Email-first sign-up lookup ("is this email already registered?")
export const checkEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP address. Please try again after 15 minutes.",
    });
  },
});

/**
 * General Authentication Limiter:
 * Protects login, signup, forgot-password, and admin login against brute-force and spamming.
 * Max 10 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message:
        "Too many authentication attempts from this IP address. Please try again after 15 minutes.",
    });
  },
});

/**
 * Sign-in Limiter (password + Google):
 * Separate counter from sign-up/reset so a few typos don't block other actions.
 * Per-account lockout (5 wrong passwords -> 15 min) is enforced in the controller.
 * Max 20 requests per 15 minutes per IP.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message:
        "Too many sign-in attempts from this IP address. Please try again after 15 minutes.",
    });
  },
});

/**
 * OTP / Verification Code Resend Limiter:
 * Protects OTP email generation endpoints from being spammed.
 * Max 5 resend requests per 15 minutes per IP.
 */
export const otpResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message:
        "Too many verification code requests from this IP. Please wait 15 minutes before requesting more codes.",
    });
  },
});

/**
 * OTP Verification Attempt Limiter:
 * Protects 6-digit OTP verification endpoints from online brute-force attacks.
 * Max 15 verification attempts per 15 minutes per IP.
 */
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message:
        "Too many verification attempts from this IP. Please wait 15 minutes before trying again.",
    });
  },
});

/**
 * Public Form Submission Limiter:
 * Protects public unauthenticated forms like Contact Us and Newsletter Subscription.
 * Max 10 submissions per hour per IP.
 */
export const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message:
        "Too many submissions from this IP address. Please try again in an hour.",
    });
  },
});
