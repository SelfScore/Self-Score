import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address" }),
    rememberMe: z
        .boolean()
        .optional()
        .default(false)
});
