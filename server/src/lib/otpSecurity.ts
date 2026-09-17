/**
 * Security & Rate Limiting constants and helper functions for OTP and Email operations.
 */

export const OTP_CONFIG = {
  COOLDOWN_SECONDS: 60, // 60 seconds between resend requests per account
  MAX_REQUESTS_PER_HOUR: 5, // Maximum 5 OTP requests per hour per account
  MAX_FAILED_ATTEMPTS: 5, // Maximum 5 failed OTP verification attempts before code invalidation
  EXPIRY_MINUTES_USER: 10, // 10 minutes OTP validity for users
  EXPIRY_MINUTES_CONSULTANT: 60, // 60 minutes OTP validity for consultants
};

export interface OtpCooldownCheckResult {
  allowed: boolean;
  remainingSeconds: number;
}

export interface OtpQuotaCheckResult {
  allowed: boolean;
  remainingSecondsInWindow?: number;
}

/**
 * Checks if the 60-second cooldown is active for an account
 */
export function checkOtpCooldown(
  lastOtpSentAt: Date | undefined,
  cooldownSeconds = OTP_CONFIG.COOLDOWN_SECONDS
): OtpCooldownCheckResult {
  if (!lastOtpSentAt) {
    return { allowed: true, remainingSeconds: 0 };
  }

  const elapsedMs = Date.now() - new Date(lastOtpSentAt).getTime();
  const cooldownMs = cooldownSeconds * 1000;

  if (elapsedMs < cooldownMs) {
    const remainingSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
    return { allowed: false, remainingSeconds };
  }

  return { allowed: true, remainingSeconds: 0 };
}

/**
 * Checks and updates the hourly OTP request quota for an account
 */
export function checkAndUpdateOtpQuota(
  record: {
    lastOtpSentAt?: Date;
    otpRequestCount?: number;
    otpRequestCountResetAt?: Date;
    otpFailedAttempts?: number;
  },
  maxPerHour = OTP_CONFIG.MAX_REQUESTS_PER_HOUR
): OtpQuotaCheckResult {
  const now = new Date();

  // Reset counter if window expired or not set
  if (
    !record.otpRequestCountResetAt ||
    now > new Date(record.otpRequestCountResetAt)
  ) {
    record.otpRequestCount = 1;
    record.otpRequestCountResetAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    record.lastOtpSentAt = now;
    record.otpFailedAttempts = 0;
    return { allowed: true };
  }

  // Check if quota exceeded
  const currentCount = record.otpRequestCount || 0;
  if (currentCount >= maxPerHour) {
    const remainingMs =
      new Date(record.otpRequestCountResetAt).getTime() - now.getTime();
    const remainingSecondsInWindow = Math.max(
      1,
      Math.ceil(remainingMs / 1000)
    );
    return { allowed: false, remainingSecondsInWindow };
  }

  // Under quota: increment and set last sent timestamp
  record.otpRequestCount = currentCount + 1;
  record.lastOtpSentAt = now;
  record.otpFailedAttempts = 0; // Fresh OTP resets failed attempts counter
  return { allowed: true };
}
