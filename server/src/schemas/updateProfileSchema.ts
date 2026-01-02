import { z } from "zod";

export const updateProfileSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must not exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
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

    email: z.string().email("Invalid email format").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const verifyEmailUpdateSchema = z.object({
  newEmail: z.string().email("Invalid email format"),
  verifyCode: z.string().length(6, "Verification code must be 6 digits"),
});
