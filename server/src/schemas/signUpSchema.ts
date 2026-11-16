import { z } from 'zod';
import { emailField, passwordField, usernameField } from './common';

// Country / gender / age group are collected later on the onboarding step
export const signUpSchema = z.object({
    username: usernameField,
    email: emailField,
    password: passwordField,
    rememberMe: z.boolean().optional().default(false),
});
