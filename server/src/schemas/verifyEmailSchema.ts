import { z } from 'zod';

export const verifyEmailSchema = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address" }),
    verifyCode: z
        .string()
        .min(6, { message: "Verification code must be 6 digits" })
        .max(6, { message: "Verification code must be 6 digits" })
        .regex(/^[0-9]{6}$/, { message: "Verification code must be exactly 6 digits" })
});
