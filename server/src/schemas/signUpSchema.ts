import { z } from 'zod';

export const signUpSchema = z.object({
    username: z
        .string()
        .min(2, { message: "Username must be at least 2 characters long" })
        .max(50, { message: "Username must be at most 50 characters long" })
        .regex(/^[a-zA-Z0-9\s@#$%&*()_+\-=\[\]{};':"\\|,.<>\/?!]+$/, { message: "Username contains invalid characters" }),
    email: z
        .string()
        .email({ message: "Invalid email address" }),
    country: z
        .string()
        .min(1, { message: "Country is required" }),
    gender: z
        .enum(["Male", "Female", "Non-binary", "Prefer not to say"], {
            message: "Please select a valid gender option",
        })
        .optional(),
    ageGroup: z
        .enum(["Under 18", "18-24", "25-34", "35-44", "45-54", "55+"], {
            message: "Please select a valid age group",
        })
        .optional(),
    countryCode: z
        .string()
        .regex(/^\d{1,4}$/, { message: "Country code must be 1-4 digits" })
        .optional(),
    phoneNumber: z
        .string()
        .regex(/^\d{7,15}$/, { message: "Phone number must be 7-15 digits" })
        .optional(),
});
