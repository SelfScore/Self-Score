import { z } from "zod";
import { profileFields, sixDigitCode, emailField, usernameField } from "./common";

export const updateProfileSchema = z
  .object({
    username: usernameField.optional(),

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
      .enum(["Under 18", "18-24", "25-34", "35-44", "45-54", "55+", "Prefer not to say"], {
        message: "Please select a valid age group",
      })
      .optional(),

    email: emailField.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const verifyEmailUpdateSchema = z.object({
  newEmail: emailField,
  verifyCode: sixDigitCode,
});

// Onboarding step right after sign-up: either fill everything in, or skip
export const onboardingSchema = z.union([
  z.object({ skip: z.literal(true) }),
  z.object({
    country: profileFields.country,
    gender: profileFields.gender,
    ageGroup: profileFields.ageGroup,
  }),
]);
