import { z } from 'zod';
import { passwordField } from './common';

export const resetPasswordSchema = z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/, { message: "Invalid or expired reset link" }),
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const setPasswordSchema = z.object({
    // Required only when the account already has a password
    currentPassword: z.string().max(1024).optional(),
    newPassword: passwordField,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
