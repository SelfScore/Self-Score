import { z } from "zod";

export const updateProfileSchema = z
  .object({
    username: z
      .string()
      .min(2, "Username must be at least 2 characters")
      .max(50, "Username must not exceed 50 characters")
      .regex(
        /^[a-zA-Z0-9\s@#$%&*()_+\-=\[\]{};':"\\|,.<>\/?!]+$/,
        "Username contains invalid characters"
      )
      .optional(),

    countryCode: z
      .string()
      .regex(/^\+\d{1,4}$/, "Invalid country code format")
      .optional(),

    phoneNumber: z
      .string()
      .min(7, "Phone number must be at least 7 digits")
      .max(15, "Phone number must not exceed 15 digits")
      .regex(/^\d+$/, "Phone number must contain only digits")
      .optional(),

    country: z
      .string()
      .min(1, "Country must be at least 1 character")
      .max(50, "Country must not exceed 50 characters")
      .optional(),

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

    email: z.string().email("Invalid email format").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const verifyEmailUpdateSchema = z.object({
  newEmail: z.string().email("Invalid email format"),
  verifyCode: z.string().length(6, "Verification code must be 6 digits"),
});
