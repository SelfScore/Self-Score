import { z } from 'zod';

export const signUpSchema = z
.object({
    username: z
        .string()
        .min(2, { message: "Username must be at least 2 characters long" })
        .max(20, { message: "Username must be at most 20 characters long" })
        .regex(/^[a-zA-Z0-9\s@#$%&*()_+\-=\[\]{};':"\\|,.<>\/?!]+$/, { message: "Username contains invalid characters" }),
    email: z
        .string()
        .email({ message: "Invalid email address" }),
    countryCode: z
        .string()
        .regex(/^\d{1,4}$/, { message: "Country code must be 1-4 digits" }),
    phoneNumber: z
        .string()
        .regex(/^\d{7,15}$/, { message: "Phone number must be 7-15 digits" }),
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
