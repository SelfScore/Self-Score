import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client, TokenPayload as TokenPayloadGoogle } from "google-auth-library";
import UserModel, { User as UserDoc, isProfileComplete } from "../models/user";
import { signUpSchema } from "../schemas/signUpSchema";
import {
  loginSchema,
  requestLoginCodeSchema,
  verifyLoginCodeSchema,
  googleAuthSchema,
  checkEmailSchema,
} from "../schemas/loginSchema";
import {
  verifyEmailCodeSchema,
  verifyEmailLinkSchema,
} from "../schemas/emailVerificationSchema";
import { forgotPasswordSchema } from "../schemas/forgotPasswordSchema";
import { resetPasswordSchema, setPasswordSchema } from "../schemas/resetPasswordSchema";
import {
  updateProfileSchema,
  verifyEmailUpdateSchema,
  onboardingSchema,
} from "../schemas/updateProfileSchema";
import { checkDatabaseConnection } from "../lib/dbUtils";
import { generateToken, getCookieOptions } from "../lib/jwt";
import {
  sendVerificationEmail,
  sendAccountVerificationEmail,
  sendLoginOtpEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  verifyPromotionalUnsubscribeToken,
} from "../lib/email";
import {
  OTP_CONFIG,
  checkOtpCooldown,
  checkAndUpdateOtpQuota,
} from "../lib/otpSecurity";
import {
  generateSixDigitCode,
  generateUrlToken,
  hashCode,
  hashUrlToken,
  safeEqualHex,
  normalizeEmail,
} from "../lib/authCodes";
import { ApiResponse, UserResponse } from "../types/api";

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;
const VERIFICATION_EXPIRY_HOURS = 24;

// Used to keep "unknown email" responses as slow as real password checks
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), BCRYPT_ROUNDS);

// Separate from the consultant Google Calendar client so they can differ
const GOOGLE_AUTH_CLIENT_ID =
  process.env.GOOGLE_AUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "";
// Only needed for the custom-button (auth code) flow. Must belong to the same client as the ID.
const GOOGLE_AUTH_CLIENT_SECRET = process.env.GOOGLE_AUTH_CLIENT_ID
  ? process.env.GOOGLE_AUTH_CLIENT_SECRET || ""
  : process.env.GOOGLE_CLIENT_SECRET || "";
// "postmessage" is the redirect URI Google uses for popup auth-code flows
const googleClient = new OAuth2Client(GOOGLE_AUTH_CLIENT_ID, GOOGLE_AUTH_CLIENT_SECRET || undefined, "postmessage");
if (!process.env.GOOGLE_AUTH_CLIENT_ID && process.env.GOOGLE_CLIENT_ID) {
  console.warn(
    "⚠️  GOOGLE_AUTH_CLIENT_ID not set — Google sign-in falls back to GOOGLE_CLIENT_ID. It must equal the client's NEXT_PUBLIC_GOOGLE_CLIENT_ID."
  );
}

type CodeField = "loginCode" | "emailVerification" | "emailChange";

/**
 * Atomically reserves one verification attempt for a pending code.
 * Returns the attempt number (1..MAX), or null when the code is missing or
 * already used up. Being atomic, parallel guesses can't exceed the cap.
 */
const reserveCodeAttempt = async (userId: unknown, field: CodeField): Promise<number | null> => {
  const updated = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      [`${field}.codeHash`]: { $exists: true, $ne: null },
      $or: [
        { [`${field}.failedAttempts`]: { $exists: false } },
        { [`${field}.failedAttempts`]: { $lt: OTP_CONFIG.MAX_FAILED_ATTEMPTS } },
      ],
    },
    { $inc: { [`${field}.failedAttempts`]: 1 } },
    { new: true, projection: { [`${field}.failedAttempts`]: 1 } }
  ).lean();
  if (!updated) return null;
  return ((updated as any)[field]?.failedAttempts as number) ?? 1;
};

const clearCode = (userId: unknown, field: CodeField) =>
  UserModel.updateOne({ _id: userId }, { $unset: { [field]: 1 } });

/** Public shape of a user returned by every auth endpoint */
export const toUserResponse = (user: UserDoc): UserResponse => ({
  userId: String(user._id),
  email: user.email,
  username: user.username,
  country: user.country,
  gender: user.gender,
  ageGroup: user.ageGroup,
  countryCode: user.countryCode,
  phoneNumber: user.phoneNumber,
  createdAt: (user as any).createdAt,
  purchasedLevels: user.purchasedLevels,
  progress: user.progress,
  isVerified: user.isVerified === true,
  isProfileComplete: isProfileComplete(user),
  hasPassword: Boolean(user.password),
  authProviders: user.authProviders || [],
  avatarUrl: user.avatarUrl,
  onboardingSkipped: Boolean(user.onboardingSkippedAt),
  // An unexpired verification email is out there (so the client needn't send another)
  verificationPending:
    user.isVerified !== true &&
    Boolean(user.emailVerification?.expiresAt && user.emailVerification.expiresAt > new Date()),
});

/** Google display names can be empty or very long */
const sanitizeDisplayName = (name: unknown, email: string): string => {
  const cleaned = typeof name === "string" ? name.replace(/[\u0000-\u001F<>]/g, "").trim() : "";
  const fallback = email.split("@")[0] || "Self Score User";
  const value = cleaned.length >= 2 ? cleaned : fallback;
  return value.slice(0, 50);
};

export class AuthController {
  private static renderUnsubscribeResponsePage(options: {
    title: string;
    message: string;
    success?: boolean;
  }): string {
    const { title, message, success = true } = options;
    const accent = success ? "#005F73" : "#C04A3A";
    const publicSiteUrl =
      process.env.PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_CLIENT_URL ||
      "https://www.selfscore.net";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="margin:0; padding:0; background:#ECE9E2; color:#2B2B2B; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding:48px 16px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;">
                  <tr>
                    <td style="padding:0 0 18px 0;">
                      <img src="${publicSiteUrl}/images/logos/LogoWithText.png" alt="Self Score" width="257" style="display:block; width:257px; max-width:100%; height:auto; border:0;">
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#FFFFFF; border:1px solid #D8D2C8; border-radius:24px; padding:36px 32px;">
                      <h1 style="margin:0 0 14px 0; color:${accent}; font-family:'Faustina', Georgia, 'Times New Roman', serif; font-size:34px; line-height:1.2;">${title}</h1>
                      <p style="margin:0; color:#6F6F6F; font-size:18px; line-height:1.7;">${message}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private static validationError(res: Response, issues: unknown[]): void {
    const response: ApiResponse = {
      success: false,
      message: "Validation failed",
      errors: issues as any[],
    };
    res.status(400).json(response);
  }

  private static serverError(res: Response, where: string, error: unknown): void {
    console.error(`Error in ${where}:`, error);
    const response: ApiResponse = {
      success: false,
      message: "Internal Server Error",
    };
    res.status(500).json(response);
  }

  /** Issue the session cookie for a user */
  private static startSession(res: Response, user: UserDoc, rememberMe = false): void {
    const token = generateToken(
      {
        userId: String(user._id),
        email: user.email,
        username: user.username,
      },
      { tokenVersion: user.tokenVersion ?? 0, rememberMe }
    );
    res.cookie("authToken", token, getCookieOptions(rememberMe));
  }

  private static clearSessionCookie(res: Response): void {
    const { httpOnly, secure, sameSite, path } = getCookieOptions();
    res.clearCookie("authToken", { httpOnly, secure, sameSite, path });
  }

  /**
   * Generates a fresh email-verification link + code, stores their hashes and
   * sends one email containing both. Does NOT apply cooldown/quota checks.
   */
  static async issueVerificationEmail(
    user: UserDoc,
    options: { reminder?: boolean } = {}
  ): Promise<boolean> {
    const code = generateSixDigitCode();
    const linkToken = generateUrlToken();
    user.emailVerification = {
      codeHash: hashCode(String(user._id), "email-verify", code),
      tokenHash: hashUrlToken(linkToken),
      expiresAt: new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000),
      failedAttempts: 0,
    };
    await user.save();

    return sendAccountVerificationEmail(user.email, user.username, code, linkToken, {
      reminder: options.reminder,
      expiryHours: VERIFICATION_EXPIRY_HOURS,
    });
  }

  /** Marks the email as verified and clears any pending verification secrets */
  private static markEmailVerified(user: UserDoc): boolean {
    const wasUnverified = !user.isVerified;
    user.isVerified = true;
    if (!user.emailVerifiedAt) user.emailVerifiedAt = new Date();
    user.emailVerification = undefined;
    return wasUnverified;
  }

  /**
   * Someone just proved they own this inbox (login code / Google) on an account
   * whose email was never verified. Whoever created that account may not be the
   * inbox owner, so remove the password they set and end all of their sessions.
   * The real owner can set a new password afterwards.
   */
  private static secureUnverifiedTakeover(user: UserDoc): void {
    if (user.isVerified) return;
    if (user.password) {
      user.password = undefined;
      user.authProviders = (user.authProviders || []).filter(
        (provider) => provider !== "password"
      ) as UserDoc["authProviders"];
    }
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
  }

  private static addProvider(user: UserDoc, provider: "password" | "google"): void {
    const providers = new Set(user.authProviders || []);
    providers.add(provider);
    user.authProviders = Array.from(providers) as UserDoc["authProviders"];
  }

  private static syncProfileCompletion(user: UserDoc): void {
    if (isProfileComplete(user)) {
      if (!user.profileCompletedAt) user.profileCompletedAt = new Date();
    } else {
      user.profileCompletedAt = undefined;
    }
  }

  /** Cooldown + hourly quota for anything that sends an email to the account */
  private static checkEmailRateLimit(
    user: UserDoc
  ): { allowed: true } | { allowed: false; message: string } {
    const cooldown = checkOtpCooldown(user.lastOtpSentAt);
    if (!cooldown.allowed) {
      return {
        allowed: false,
        message: `Please wait ${cooldown.remainingSeconds} seconds before requesting another email.`,
      };
    }
    const quota = checkAndUpdateOtpQuota(user);
    if (!quota.allowed) {
      const minutes = Math.ceil((quota.remainingSecondsInWindow || 60) / 60);
      return {
        allowed: false,
        message: `Too many email requests for this account. Please try again in ${minutes} minutes.`,
      };
    }
    return { allowed: true };
  }

  // ---------------------------------------------------------------------------
  // Sign up (email + password) — no verification required to start
  // ---------------------------------------------------------------------------

  static async signUp(req: Request, res: Response): Promise<void> {
    if (!checkDatabaseConnection()) {
      const response: ApiResponse = {
        success: false,
        message: "Database connection not available. Please try again later.",
      };
      res.status(503).json(response);
      return;
    }

    try {
      const parsed = signUpSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }
      const { username, email, password, rememberMe } = parsed.data;

      const existingUser = await UserModel.findOne({ email }).select(
        "_id isVerified password authProviders"
      );
      // Abandoned sign-up from the old code-only flow: never verified, never
      // signed in, no password. Safe to replace with the new account.
      const isAbandonedLegacySignup =
        existingUser &&
        !existingUser.isVerified &&
        !existingUser.password &&
        (existingUser.authProviders?.length ?? 0) === 0;
      if (isAbandonedLegacySignup) {
        await UserModel.deleteOne({ _id: existingUser._id, isVerified: false });
      } else if (existingUser) {
        const response: ApiResponse = {
          success: false,
          code: "EMAIL_IN_USE",
          message:
            "An account with this email already exists. Please sign in instead.",
        } as ApiResponse;
        res.status(409).json(response);
        return;
      }

      const now = new Date();
      const newUser = new UserModel({
        username,
        email,
        password: await bcrypt.hash(password, BCRYPT_ROUNDS),
        authProviders: ["password"],
        isVerified: false,
        tokenVersion: 0,
        lastOtpSentAt: now,
        otpRequestCount: 1,
        otpRequestCountResetAt: new Date(now.getTime() + 60 * 60 * 1000),
        purchasedLevels: {
          level2: { purchased: false },
          level3: { purchased: false },
          level4: { remainingAttempts: 0 },
          level5: { remainingAttempts: 0 },
        },
        progress: {
          completedLevels: [],
          highestUnlockedLevel: 1,
          testScores: {},
        },
      });

      try {
        await newUser.save();
      } catch (error: any) {
        // Two sign-ups for the same email at the same time
        if (error?.code === 11000) {
          res.status(409).json({
            success: false,
            code: "EMAIL_IN_USE",
            message:
              "An account with this email already exists. Please sign in instead.",
          });
          return;
        }
        throw error;
      }

      // Log in straight away; verification happens in the background
      AuthController.startSession(res, newUser, rememberMe);

      let emailSent = false;
      try {
        emailSent = await AuthController.issueVerificationEmail(newUser);
      } catch (emailError) {
        console.error("Failed to send verification email at sign-up:", emailError);
      }

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: emailSent
          ? "Account created. We've sent a verification link to your email."
          : "Account created. We couldn't send the verification email right now — you can resend it from your profile.",
        data: toUserResponse(newUser),
      };
      res.status(201).json(response);
    } catch (error) {
      AuthController.serverError(res, "sign-up", error);
    }
  }

  // ---------------------------------------------------------------------------
  // Login (email + password)
  // ---------------------------------------------------------------------------

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }
      const { email, password, rememberMe } = parsed.data;

      const user = await UserModel.findOne({ email });

      if (!user) {
        // Same work as a real check so response time doesn't reveal whether the email exists
        await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
        res.status(401).json({
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "Incorrect email or password.",
        });
        return;
      }

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        res.status(429).json({
          success: false,
          code: "ACCOUNT_LOCKED",
          message: `Too many failed sign-in attempts. Try again in ${minutes} minute(s), or sign in with an email code or Google.`,
        });
        return;
      }

      if (!user.password) {
        // Accounts created before passwords existed, or Google-only accounts
        await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
        const googleOnly = (user.authProviders || []).includes("google");
        res.status(400).json({
          success: false,
          code: "PASSWORD_NOT_SET",
          message: googleOnly
            ? "This account uses Google sign-in. Continue with Google, or sign in with an email code and then set a password."
            : "This account doesn't have a password yet. Sign in with an email code, then set a password from your profile.",
        });
        return;
      }

      const passwordOk = await bcrypt.compare(password, user.password);
      if (!passwordOk) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
          user.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
          user.failedLoginAttempts = 0;
        }
        await user.save();
        res.status(401).json({
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "Incorrect email or password.",
        });
        return;
      }

      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;
      AuthController.addProvider(user, "password");
      await user.save();

      AuthController.startSession(res, user, rememberMe);

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: "Logged in successfully.",
        data: toUserResponse(user),
      };
      res.status(200).json(response);
    } catch (error) {
      AuthController.serverError(res, "login", error);
    }
  }

  // ---------------------------------------------------------------------------
  // Email-first sign-up: does an account already exist for this email?
  // (Sign-up already reveals this via EMAIL_IN_USE; this endpoint is rate limited.)
  // ---------------------------------------------------------------------------

  static async checkEmail(req: Request, res: Response): Promise<void> {
    try {
      const parsed = checkEmailSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }
      const email = normalizeEmail(parsed.data.email);
      const user = await UserModel.findOne({ email }).select("isVerified authProviders password").lean();
      // Abandoned legacy unverified records (no password, no provider) can be signed up over
      const exists = Boolean(
        user && (user.isVerified || user.password || (user.authProviders && user.authProviders.length > 0))
      );
      res.status(200).json({ success: true, message: "OK", data: { exists } });
    } catch (error) {
      console.error("checkEmail error:", error);
      res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
  }

  // ---------------------------------------------------------------------------
  // Fallback: passwordless login code (mainly for accounts without a password)
  // ---------------------------------------------------------------------------

  static async requestLoginCode(req: Request, res: Response): Promise<void> {
    try {
      const parsed = requestLoginCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }
      const { email } = parsed.data;

      // Same answer whether or not the account exists (no email enumeration)
      const uniform: ApiResponse = {
        success: true,
        message: "If an account exists for this email, we've sent a 6-digit login code.",
        data: { email },
      };

      const user = await UserModel.findOne({ email });
      if (!user) {
        res.status(200).json(uniform);
        return;
      }

      const limit = AuthController.checkEmailRateLimit(user);
      if (!limit.allowed) {
        // Same answer as for unknown emails, so the limit doesn't reveal the account exists
        res.status(200).json(uniform);
        return;
      }

      const code = generateSixDigitCode();
      user.loginCode = {
        codeHash: hashCode(String(user._id), "login", code),
        expiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES_USER * 60 * 1000),
        failedAttempts: 0,
      };
      await user.save();

      const sent = await sendLoginOtpEmail(user.email, user.username, code);
      if (!sent) console.warn("⚠️ Failed to send login code email");

      res.status(200).json(uniform);
    } catch (error) {
      AuthController.serverError(res, "request login code", error);
    }
  }

  static async verifyLoginCode(req: Request, res: Response): Promise<void> {
    try {
      const parsed = verifyLoginCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }
      const { email, code, rememberMe } = parsed.data;

      const invalid = () =>
        res.status(400).json({
          success: false,
          message: "Invalid or expired code. Please request a new one.",
        });

      const user = await UserModel.findOne({ email });
      if (!user || !user.loginCode?.codeHash || !user.loginCode.expiresAt) {
        invalid();
        return;
      }

      if (user.loginCode.expiresAt < new Date()) {
        user.loginCode = undefined;
        await user.save();
        invalid();
        return;
      }

      const attempts = await reserveCodeAttempt(user._id, "loginCode");
      if (attempts === null) {
        await clearCode(user._id, "loginCode");
        res.status(400).json({
          success: false,
          message:
            "Too many incorrect attempts. This code has been cancelled — please request a new one.",
        });
        return;
      }

      const ok = safeEqualHex(
        hashCode(String(user._id), "login", code),
        user.loginCode.codeHash
      );

      if (!ok) {
        if (attempts >= OTP_CONFIG.MAX_FAILED_ATTEMPTS) {
          await clearCode(user._id, "loginCode");
          res.status(400).json({
            success: false,
            message:
              "Too many incorrect attempts. This code has been cancelled — please request a new one.",
          });
          return;
        }
        res.status(400).json({
          success: false,
          message: `Incorrect code. ${OTP_CONFIG.MAX_FAILED_ATTEMPTS - attempts} attempt(s) remaining.`,
        });
        return;
      }

      // Code proves inbox ownership
      AuthController.secureUnverifiedTakeover(user);
      const firstVerification = AuthController.markEmailVerified(user);
      user.loginCode = undefined;
      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;
      await user.save();

      if (firstVerification) {
        sendWelcomeEmail(user.email, user.username).catch((e) =>
          console.error("Failed to send welcome email:", e)
        );
      }

      AuthController.startSession(res, user, rememberMe);

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: "Logged in successfully.",
        data: toUserResponse(user),
      };
      res.status(200).json(response);
    } catch (error) {
      AuthController.serverError(res, "verify login code", error);
    }
  }

  // ---------------------------------------------------------------------------
  // Google sign-in (Google Identity Services ID token)
  // ---------------------------------------------------------------------------

  static async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      if (!GOOGLE_AUTH_CLIENT_ID) {
        res.status(503).json({
          success: false,
          message: "Google sign-in is not configured.",
        });
        return;
      }

      const parsed = googleAuthSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }
      const { credential, code, rememberMe } = parsed.data;

      if (code && !GOOGLE_AUTH_CLIENT_SECRET) {
        console.error("Google auth code received but GOOGLE_AUTH_CLIENT_SECRET is not set");
        res.status(503).json({ success: false, message: "Google sign-in is not configured." });
        return;
      }

      let payload: TokenPayloadGoogle | undefined;
      try {
        // Custom button: swap the one-time code for tokens server-side, then verify the ID token
        let idToken = credential;
        if (code) {
          const { tokens } = await googleClient.getToken({ code, redirect_uri: "postmessage" });
          idToken = tokens.id_token || undefined;
        }
        if (!idToken) throw new Error("No ID token returned by Google");
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: GOOGLE_AUTH_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (verifyError) {
        console.warn("Google ID token verification failed:", verifyError);
      }

      if (!payload?.sub || !payload.email) {
        res.status(401).json({
          success: false,
          message: "Google sign-in failed. Please try again.",
        });
        return;
      }

      if (payload.email_verified !== true) {
        res.status(401).json({
          success: false,
          message: "Your Google account email isn't verified. Please verify it with Google, or sign up with email and password.",
        });
        return;
      }

      const googleId = payload.sub;
      const email = normalizeEmail(payload.email);
      const avatarUrl = typeof payload.picture === "string" ? payload.picture : undefined;

      let user = await UserModel.findOne({ googleId });
      let isNewUser = false;

      if (!user) {
        const byEmail = await UserModel.findOne({ email });

        if (byEmail) {
          if (byEmail.googleId && byEmail.googleId !== googleId) {
            res.status(409).json({
              success: false,
              message:
                "This email is already linked to a different Google account. Please sign in with email and password.",
            });
            return;
          }
          // Link Google to the existing account. Google has verified the inbox,
          // so an unverified account is secured against takeover first.
          AuthController.secureUnverifiedTakeover(byEmail);
          byEmail.googleId = googleId;
          if (!byEmail.avatarUrl && avatarUrl) byEmail.avatarUrl = avatarUrl;
          user = byEmail;
        } else {
          const now = new Date();
          user = new UserModel({
            username: sanitizeDisplayName(payload.name, email),
            email,
            googleId,
            avatarUrl,
            authProviders: ["google"],
            isVerified: true,
            emailVerifiedAt: now,
            tokenVersion: 0,
            purchasedLevels: {
              level2: { purchased: false },
              level3: { purchased: false },
              level4: { remainingAttempts: 0 },
              level5: { remainingAttempts: 0 },
            },
            progress: {
              completedLevels: [],
              highestUnlockedLevel: 1,
              testScores: {},
            },
          });
          isNewUser = true;
        }
      }

      const firstVerification = AuthController.markEmailVerified(user);
      AuthController.addProvider(user, "google");
      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;

      try {
        await user.save();
      } catch (error: any) {
        if (error?.code === 11000) {
          // Raced with another request creating/linking the same account
          res.status(409).json({
            success: false,
            message: "Please try signing in with Google again.",
          });
          return;
        }
        throw error;
      }

      if (isNewUser || firstVerification) {
        sendWelcomeEmail(user.email, user.username).catch((e) =>
          console.error("Failed to send welcome email:", e)
        );
      }

      AuthController.startSession(res, user, rememberMe);

      const response: ApiResponse<UserResponse & { isNewUser: boolean }> = {
        success: true,
        message: isNewUser ? "Account created with Google." : "Logged in with Google.",
        data: { ...toUserResponse(user), isNewUser },
      };
      res.status(isNewUser ? 201 : 200).json(response);
    } catch (error) {
      AuthController.serverError(res, "google auth", error);
    }
  }

  // ---------------------------------------------------------------------------
  // Email verification (logged-in code, or link from the email)
  // ---------------------------------------------------------------------------

  static async sendVerification(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserModel.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      if (user.isVerified) {
        res.status(400).json({
          success: false,
          code: "ALREADY_VERIFIED",
          message: "Your email is already verified.",
        });
        return;
      }

      const limit = AuthController.checkEmailRateLimit(user);
      if (!limit.allowed) {
        res.status(429).json({ success: false, message: limit.message });
        return;
      }

      const sent = await AuthController.issueVerificationEmail(user);
      if (!sent) {
        res.status(502).json({
          success: false,
          message: "We couldn't send the email right now. Please try again in a minute.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `We've sent a verification link and code to ${user.email}.`,
      });
    } catch (error) {
      AuthController.serverError(res, "send verification", error);
    }
  }

  static async verifyEmailCode(req: Request, res: Response): Promise<void> {
    try {
      const parsed = verifyEmailCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }
      const { code } = parsed.data;

      const user = await UserModel.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      if (user.isVerified) {
        res.status(200).json({
          success: true,
          message: "Your email is already verified.",
          data: toUserResponse(user),
        });
        return;
      }

      const pending = user.emailVerification;
      if (!pending?.codeHash || !pending.expiresAt || pending.expiresAt < new Date()) {
        res.status(400).json({
          success: false,
          code: "CODE_EXPIRED",
          message: "This code has expired. Please request a new one.",
        });
        return;
      }

      const attempts = await reserveCodeAttempt(user._id, "emailVerification");
      const tooMany = {
        success: false,
        code: "CODE_EXPIRED",
        message:
          "Too many incorrect attempts. This code has been cancelled — please request a new one.",
      };
      if (attempts === null) {
        await clearCode(user._id, "emailVerification");
        res.status(400).json(tooMany);
        return;
      }

      const ok = safeEqualHex(
        hashCode(String(user._id), "email-verify", code),
        pending.codeHash
      );

      if (!ok) {
        if (attempts >= OTP_CONFIG.MAX_FAILED_ATTEMPTS) {
          await clearCode(user._id, "emailVerification");
          res.status(400).json(tooMany);
          return;
        }
        res.status(400).json({
          success: false,
          message: `Incorrect code. ${OTP_CONFIG.MAX_FAILED_ATTEMPTS - attempts} attempt(s) remaining.`,
        });
        return;
      }

      AuthController.markEmailVerified(user);
      await user.save();

      sendWelcomeEmail(user.email, user.username).catch((e) =>
        console.error("Failed to send welcome email:", e)
      );

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: "Your email is verified.",
        data: toUserResponse(user),
      };
      res.status(200).json(response);
    } catch (error) {
      AuthController.serverError(res, "verify email code", error);
    }
  }

  /** Link from the email. Must be opened while signed in to the same account. */
  static async verifyEmailLink(req: Request, res: Response): Promise<void> {
    try {
      const parsed = verifyEmailLinkSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          code: "LINK_INVALID",
          message: "This verification link is invalid or has expired.",
        });
        return;
      }

      const user = await UserModel.findOne({
        "emailVerification.tokenHash": hashUrlToken(parsed.data.token),
      });

      if (!user || !user.emailVerification?.expiresAt || user.emailVerification.expiresAt < new Date()) {
        res.status(400).json({
          success: false,
          code: "LINK_INVALID",
          message: "This verification link is invalid or has expired. Sign in and request a new one.",
        });
        return;
      }

      // Sign-up doesn't prove inbox ownership, so whoever created the account may
      // not own this inbox. The link only counts when it's opened while signed in
      // to this same account; otherwise the inbox owner could unknowingly verify
      // an account someone else controls. (The link stays valid — not consumed.)
      if (!req.user || req.user.userId !== String(user._id)) {
        res.status(401).json({
          success: false,
          code: req.user ? "SIGNED_IN_AS_OTHER" : "SIGN_IN_REQUIRED",
          message: req.user
            ? "This link belongs to a different account. Sign out, then sign in to the account you're verifying."
            : "Please sign in to finish verifying your email.",
        });
        return;
      }

      const firstVerification = AuthController.markEmailVerified(user);
      await user.save();

      if (firstVerification) {
        sendWelcomeEmail(user.email, user.username).catch((e) =>
          console.error("Failed to send welcome email:", e)
        );
      }

      res.status(200).json({
        success: true,
        message: "Your email is verified.",
        data: { email: user.email },
      });
    } catch (error) {
      AuthController.serverError(res, "verify email link", error);
    }
  }

  // ---------------------------------------------------------------------------
  // Session
  // ---------------------------------------------------------------------------

  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserModel.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: "Current user retrieved successfully",
        data: toUserResponse(user),
      };
      res.status(200).json(response);
    } catch (error) {
      AuthController.serverError(res, "get current user", error);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      AuthController.clearSessionCookie(res);
      res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      AuthController.serverError(res, "logout", error);
    }
  }

  // ---------------------------------------------------------------------------
  // Passwords
  // ---------------------------------------------------------------------------

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }
      const { email } = parsed.data;

      // Always the same answer — never reveal whether the account exists
      const uniform: ApiResponse = {
        success: true,
        message:
          "If an account exists with this email, we've sent a link to reset your password.",
      };

      const user = await UserModel.findOne({ email });
      if (!user) {
        res.status(200).json(uniform);
        return;
      }

      const limit = AuthController.checkEmailRateLimit(user);
      if (!limit.allowed) {
        // Don't send another email, but don't reveal anything either
        res.status(200).json(uniform);
        return;
      }

      const resetToken = generateUrlToken();
      user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const sent = await sendPasswordResetEmail(user.email, user.username, resetToken);
      if (!sent) console.warn("⚠️ Failed to send password reset email");

      res.status(200).json(uniform);
    } catch (error) {
      AuthController.serverError(res, "forgot password", error);
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }
      const { token, password } = parsed.data;

      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const user = await UserModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: new Date() },
      });

      if (!user) {
        res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
        return;
      }

      user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
      AuthController.addProvider(user, "password");
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;
      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;
      // The reset link proves inbox ownership
      const firstVerification = AuthController.markEmailVerified(user);
      // Sign out every other device
      user.tokenVersion = (user.tokenVersion ?? 0) + 1;
      await user.save();

      if (firstVerification) {
        sendWelcomeEmail(user.email, user.username).catch((e) =>
          console.error("Failed to send welcome email:", e)
        );
      }

      AuthController.startSession(res, user, false);

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: "Your password has been reset and you're now signed in.",
        data: toUserResponse(user),
      };
      res.status(200).json(response);
    } catch (error) {
      AuthController.serverError(res, "reset password", error);
    }
  }

  /** Set a first password (no current password needed) or change an existing one */
  static async setPassword(req: Request, res: Response): Promise<void> {
    try {
      const parsed = setPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }
      const { currentPassword, newPassword } = parsed.data;

      const user = await UserModel.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      if (user.password) {
        if (!currentPassword) {
          res.status(400).json({
            success: false,
            message: "Please enter your current password.",
          });
          return;
        }
        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) {
          res.status(400).json({
            success: false,
            message: "Your current password is incorrect.",
          });
          return;
        }
      }

      const hadPassword = Boolean(user.password);
      user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
      AuthController.addProvider(user, "password");
      // Sign out other devices; keep this one signed in with a fresh cookie
      user.tokenVersion = (user.tokenVersion ?? 0) + 1;
      await user.save();
      AuthController.startSession(res, user, false);

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: hadPassword ? "Your password has been changed." : "Your password has been set.",
        data: toUserResponse(user),
      };
      res.status(200).json(response);
    } catch (error) {
      AuthController.serverError(res, "set password", error);
    }
  }

  // ---------------------------------------------------------------------------
  // Onboarding (country / gender / age group right after sign-up)
  // ---------------------------------------------------------------------------

  static async completeOnboarding(req: Request, res: Response): Promise<void> {
    try {
      const parsed = onboardingSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }

      const user = await UserModel.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      if ("skip" in parsed.data) {
        user.onboardingSkippedAt = new Date();
      } else {
        user.country = parsed.data.country;
        user.gender = parsed.data.gender;
        user.ageGroup = parsed.data.ageGroup;
      }
      AuthController.syncProfileCompletion(user);
      await user.save();

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: "skip" in parsed.data ? "You can complete your profile any time." : "Profile saved.",
        data: toUserResponse(user),
      };
      res.status(200).json(response);
    } catch (error) {
      AuthController.serverError(res, "complete onboarding", error);
    }
  }

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }

      const { username, countryCode, phoneNumber, email, country, gender, ageGroup } =
        parsed.data;

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      // Email change: send a code to the NEW address; nothing changes until it's verified
      if (email && email !== user.email) {
        const existingUser = await UserModel.findOne({ email, _id: { $ne: userId } }).select("_id");
        if (existingUser) {
          res.status(400).json({
            success: false,
            message: "Email already in use by another account",
          });
          return;
        }

        const limit = AuthController.checkEmailRateLimit(user);
        if (!limit.allowed) {
          res.status(429).json({ success: false, message: limit.message });
          return;
        }

        const verifyCode = generateSixDigitCode();
        user.emailChange = {
          newEmail: email,
          codeHash: hashCode(String(user._id), "email-change", verifyCode),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          failedAttempts: 0,
        };
        await user.save();

        const emailSent = await sendVerificationEmail(email, user.username, verifyCode);

        res.status(emailSent ? 200 : 502).json({
          success: emailSent,
          message: emailSent
            ? "Verification code sent to new email address. Please verify to complete the change."
            : "Failed to send verification email. Please try again.",
          data: {
            emailVerificationPending: true,
            newEmail: email,
          },
        });
        return;
      }

      if (username) user.username = username;
      if (countryCode) user.countryCode = countryCode;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (country) user.country = country;
      if (gender) user.gender = gender;
      if (ageGroup) user.ageGroup = ageGroup;
      AuthController.syncProfileCompletion(user);

      await user.save();

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: "Profile updated successfully",
        data: toUserResponse(user),
      };
      res.status(200).json(response);
    } catch (error) {
      AuthController.serverError(res, "update profile", error);
    }
  }

  static async verifyEmailUpdate(req: Request, res: Response): Promise<void> {
    try {
      const parsed = verifyEmailUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        AuthController.validationError(res, parsed.error.issues);
        return;
      }
      const { newEmail, verifyCode } = parsed.data;

      const user = await UserModel.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      const pending = user.emailChange;
      if (!pending?.newEmail || pending.newEmail !== newEmail || !pending.codeHash) {
        res.status(400).json({
          success: false,
          message: "No pending email change for this address",
        });
        return;
      }

      if (!pending.expiresAt || pending.expiresAt < new Date()) {
        user.emailChange = undefined;
        await user.save();
        res.status(400).json({ success: false, message: "Verification code has expired" });
        return;
      }

      const attempts = await reserveCodeAttempt(user._id, "emailChange");
      const cancelled = {
        success: false,
        message: "Too many failed attempts. Email change request cancelled. Please try again.",
      };
      if (attempts === null) {
        await clearCode(user._id, "emailChange");
        res.status(400).json(cancelled);
        return;
      }

      const ok = safeEqualHex(
        hashCode(String(user._id), "email-change", verifyCode),
        pending.codeHash
      );

      if (!ok) {
        if (attempts >= OTP_CONFIG.MAX_FAILED_ATTEMPTS) {
          await clearCode(user._id, "emailChange");
          res.status(400).json(cancelled);
          return;
        }
        res.status(400).json({
          success: false,
          message: `Invalid verification code. ${OTP_CONFIG.MAX_FAILED_ATTEMPTS - attempts} attempt(s) remaining.`,
        });
        return;
      }

      // Someone may have taken the address since the code was sent
      const taken = await UserModel.findOne({ email: newEmail, _id: { $ne: user._id } }).select("_id");
      if (taken) {
        user.emailChange = undefined;
        await user.save();
        res.status(400).json({ success: false, message: "Email already in use by another account" });
        return;
      }

      user.email = newEmail;
      user.emailChange = undefined;
      // The new address was just proven
      user.isVerified = true;
      user.emailVerifiedAt = new Date();
      user.emailVerification = undefined;
      try {
        await user.save();
      } catch (error: any) {
        if (error?.code === 11000) {
          // Someone registered this address at the same moment
          await clearCode(user._id, "emailChange");
          res.status(409).json({ success: false, message: "Email already in use by another account" });
          return;
        }
        throw error;
      }

      AuthController.startSession(res, user, false);

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: "Email updated successfully",
        data: toUserResponse(user),
      };
      res.status(200).json(response);
    } catch (error) {
      AuthController.serverError(res, "verify email update", error);
    }
  }

  static async unsubscribePromotional(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const token =
        typeof req.query.token === "string" ? req.query.token : undefined;

      if (!token) {
        res
          .status(400)
          .send(
            AuthController.renderUnsubscribeResponsePage({
              title: "Invalid Link",
              message:
                "This unsubscribe link is missing required information. Please try again from a valid email.",
              success: false,
            })
          );
        return;
      }

      const { email } = verifyPromotionalUnsubscribeToken(token);
      const user = await UserModel.findOne({ email });

      if (!user) {
        res
          .status(404)
          .send(
            AuthController.renderUnsubscribeResponsePage({
              title: "Subscription Not Found",
              message:
                "We could not find a matching account for this unsubscribe request.",
              success: false,
            })
          );
        return;
      }

      if (!user.emailPreferences) {
        user.emailPreferences = {
          promotional: true,
        };
      }

      user.emailPreferences.promotional = false;
      user.emailPreferences.unsubscribedAt = new Date();
      await user.save();

      res.status(200).send(
        AuthController.renderUnsubscribeResponsePage({
          title: "You're Unsubscribed",
          message:
            "You will no longer receive promotional emails from Self Score. Important transactional emails like password resets, booking updates, and assessment notifications will still be sent when needed.",
        })
      );
    } catch (error) {
      console.error("Error unsubscribing promotional emails:", error);
      res
        .status(400)
        .send(
          AuthController.renderUnsubscribeResponsePage({
            title: "Link Expired",
            message:
              "This unsubscribe link is invalid or has expired. Please use the latest link from one of our emails.",
            success: false,
          })
        );
    }
  }

  // Get WebSocket authentication token
  static async getWsToken(req: Request, res: Response): Promise<void> {
    try {
      // Token is already validated by authMiddleware
      const token = req.cookies?.authToken;

      if (!token) {
        const response: ApiResponse = {
          success: false,
          message: "No authentication token found",
        };
        res.status(401).json(response);
        return;
      }

      const response: ApiResponse<{ token: string }> = {
        success: true,
        message: "WebSocket token retrieved",
        data: { token },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error in getWsToken route:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }
}
