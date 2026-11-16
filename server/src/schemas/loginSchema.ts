import { z } from 'zod';
import { emailField, sixDigitCode } from './common';

export const loginSchema = z.object({
    email: emailField,
    // Don't apply strength rules on login: only check that something was sent
    password: z.string().min(1, { message: "Password is required" }).max(1024),
    rememberMe: z.boolean().optional().default(false),
});

export const requestLoginCodeSchema = z.object({
    email: emailField,
});

export const verifyLoginCodeSchema = z.object({
    email: emailField,
    code: sixDigitCode,
    rememberMe: z.boolean().optional().default(false),
});

// Either a GIS ID token (`credential`) or a popup auth code (`code`, custom button)
export const googleAuthSchema = z
    .object({
        credential: z.string().min(20).max(4096).optional(),
        code: z.string().min(10).max(2048).optional(),
        rememberMe: z.boolean().optional().default(false),
    })
    .refine((d) => Boolean(d.credential) !== Boolean(d.code), {
        message: "Missing Google credential",
    });

export const checkEmailSchema = z.object({
    email: emailField,
});
