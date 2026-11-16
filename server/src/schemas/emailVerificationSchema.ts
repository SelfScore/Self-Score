import { z } from 'zod';
import { sixDigitCode } from './common';

export const verifyEmailCodeSchema = z.object({
    code: sixDigitCode,
});

export const verifyEmailLinkSchema = z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/, { message: "Invalid verification link" }),
});
