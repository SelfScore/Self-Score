import { z } from 'zod';

export const signUpSchema = z
.object({
    username: z
        .string()
        .min(2, { message: "Username must be at least 2 characters long" })
        .max(20, { message: "Username must be at most 20 characters long" })
        .regex(/^[a-zA-Z0-9_]+$/, { message: "Username must only contain letters, numbers, and underscores" }),
    email: z
        .string()
        .email({ message: "Invalid email address" }),
    phoneNumber: z
        .string()
        .regex(/^[0-9]+$/, { message: "Phone number must only contain numbers" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z
        .string()
        .min(6, { message: "Confirm Password must be at least 6 characters long" }),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
