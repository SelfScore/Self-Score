import { z } from 'zod';
import { emailField } from './common';

export const forgotPasswordSchema = z.object({
    email: emailField,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
