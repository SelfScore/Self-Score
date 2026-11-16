import { z } from 'zod';

export const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;
export const AGE_GROUP_OPTIONS = ["Under 18", "18-24", "25-34", "35-44", "45-54", "55+"] as const;

export const emailField = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "Invalid email address" }).max(254));

/**
 * NIST SP 800-63B: length matters, composition rules don't.
 * Minimum 8, maximum 72 (bcrypt only uses the first 72 bytes).
 */
export const passwordField = z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
        message: "Password is too long (maximum 72 characters)",
    });

export const usernameField = z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" })
    // Letters from any language (Google names often aren't ASCII), digits, spaces and common punctuation
    .regex(/^[\p{L}\p{M}\p{N}\s@#$%&*()_+\-=\[\]{};':"\\|,.<>\/?!]+$/u, { message: "Name contains invalid characters" });

export const sixDigitCode = z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, { message: "Verification code must be exactly 6 digits" });

export const profileFields = {
    country: z.string().trim().min(1, { message: "Country is required" }).max(60),
    gender: z.enum(GENDER_OPTIONS, { message: "Please select a valid gender option" }),
    ageGroup: z.enum(AGE_GROUP_OPTIONS, { message: "Please select a valid age group" }),
};
