import { z } from 'zod';

export const resendVerificationSchema = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address" })
});
