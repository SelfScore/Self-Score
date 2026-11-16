import crypto from "crypto";
import { JWT_SECRET } from "./jwt";

/**
 * Helpers for one-time codes and tokens sent by email.
 *
 * Codes/tokens are never stored in plain text. They are stored as an HMAC
 * bound to the user id and the purpose, so a database leak doesn't expose
 * usable codes, and a code issued for one purpose can't be replayed for another.
 */

export type CodePurpose = "email-verify" | "login" | "email-change";

const HMAC_SECRET = process.env.OTP_HMAC_SECRET || JWT_SECRET;

/** Cryptographically secure 6-digit code (100000-999999) */
export const generateSixDigitCode = (): string =>
  crypto.randomInt(100000, 1000000).toString();

/** Random URL-safe token for email links */
export const generateUrlToken = (): string =>
  crypto.randomBytes(32).toString("hex");

export const hashCode = (
  userId: string,
  purpose: CodePurpose,
  code: string
): string =>
  crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(`${userId}:${purpose}:${code}`)
    .digest("hex");

/** Link tokens are looked up directly, so they are hashed without the user id */
export const hashUrlToken = (token: string): string =>
  crypto.createHmac("sha256", HMAC_SECRET).update(`link:${token}`).digest("hex");

/** Constant-time comparison of two hex digests */
export const safeEqualHex = (a?: string, b?: string): boolean => {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
};

export const normalizeEmail = (email: unknown): string =>
  typeof email === "string" ? email.trim().toLowerCase() : "";
