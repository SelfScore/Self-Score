import fs from "node:fs";
import path from "node:path";
import { Resend, type Attachment } from "resend";
import jwt from "jsonwebtoken";
import { formatBookingTimeForEmail } from "./timezoneHelpers";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    "⚠️  RESEND_API_KEY not found in environment variables. Email features will not work."
  );
}

export const resend = new Resend(resendApiKey || "dummy-key");

// Email sender configuration
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const APP_NAME = "SelfScore";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const PUBLIC_SITE_URL =
  process.env.PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_CLIENT_URL ||
  "https://www.selfscore.net";
const API_BASE_URL =
  process.env.API_URL ||
  process.env.SERVER_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  CLIENT_URL;
const EMAIL_TOKEN_SECRET =
  process.env.EMAIL_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  "lifescore-email-secret-change-in-production";
const LOGO_URL = `${PUBLIC_SITE_URL}/images/logos/LogoWithText.png`;
const WELCOME_IMAGE_URL = `${PUBLIC_SITE_URL}/images/emails/welcome.png`;
const CUP_IMAGE_URL = `${PUBLIC_SITE_URL}/images/emails/cup.png`;
const GIFT_IMAGE_URL = `${PUBLIC_SITE_URL}/images/emails/Gift.png`;
const TERMS_URL = `${PUBLIC_SITE_URL}/terms-conditions`;
const PRIVACY_URL = `${PUBLIC_SITE_URL}/privacy-policy`;
const BRAND_COLORS = {
  page: "#ECE9E2",
  panel: "#FFFFFF",
  panelBorder: "#D8D2C8",
  text: "#2B2B2B",
  muted: "#6F6F6F",
  subtle: "#8A8A8A",
  teal: "#005F73",
  tealSoft: "#0A9396",
  orange: "#E87A42",
  orangeStrong: "#FF8D23",
};

type EmailAudience = "user" | "admin" | "consultant";

interface PromotionalUnsubscribePayload {
  email: string;
  type: "promotional-unsubscribe";
}

interface EmailLayoutOptions {
  previewText?: string;
  bodyHtml: string;
  recipientEmail?: string;
  audience?: EmailAudience;
  emailType?: "transactional" | "promotional";
  showUnsubscribe?: boolean;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const resolveLocalAssetPath = (relativePath: string): string | null => {
  const candidates = [
    path.resolve(process.cwd(), relativePath),
    path.resolve(process.cwd(), "..", relativePath),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
};

const formatEmailDateOnly = (value: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);

const renderLevelProgress = (
  completedLevel: number,
  isPending: boolean
): string => {
  const activeLevel = isPending
    ? Math.min(completedLevel, 4)
    : Math.min(completedLevel + 1, 4);

  const stages = [1, 2, 3, 4];

  const stageCell = (stage: number): string => {
    const isCompleted = stage < activeLevel;
    const isActive = stage === activeLevel;
    const background = isActive
      ? "#F7931E"
      : isCompleted
        ? "#F7EFE8"
        : "#F1F1F1";
    const color = "#111111";

    return `
      <td align="center" valign="middle" style="width:132px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
          <tr>
            <td
              style="
                background:${background};
                color:${color};
                font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
                font-size:18px;
                line-height:1.2;
                font-weight:400;
                padding:16px 18px;
                text-align:center;
                min-width:132px;
              "
            >
              Level ${stage}
            </td>
          </tr>
        </table>
      </td>
    `;
  };

  const connectorCell = (stage: number): string => {
    const isUnlocked = stage < activeLevel;
    const borderColor = isUnlocked ? "#F7931E" : "#2F2F2F";
    const symbol = isUnlocked ? "&#10003;" : "&#128274;";

    return `
      <td align="center" valign="middle" style="width:82px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="82">
          <tr>
            <td style="height:26px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td align="center" style="padding:0; font-size:0; line-height:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="82">
                <tr>
                  <td style="border-top:2px dashed ${borderColor}; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0; font-size:0; line-height:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-top:-18px;">
                <tr>
                  <td
                    align="center"
                    valign="middle"
                    style="
                      width:34px;
                      height:34px;
                      border-radius:17px;
                      background:#D9D9D9;
                      color:#111111;
                      font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
                      font-size:18px;
                      line-height:34px;
                      text-align:center;
                    "
                  >${symbol}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="height:26px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    `;
  };

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 auto 36px auto;">
      <tr>
        ${stages
          .map((stage, index) =>
            index === stages.length - 1
              ? stageCell(stage)
              : `${stageCell(stage)}${connectorCell(stage)}`
          )
          .join("")}
      </tr>
    </table>
  `;
};

const generatePromotionalUnsubscribeToken = (email: string): string =>
  jwt.sign(
    {
      email,
      type: "promotional-unsubscribe",
    } satisfies PromotionalUnsubscribePayload,
    EMAIL_TOKEN_SECRET,
    {
      expiresIn: "365d",
      issuer: "lifescore-email",
      audience: "lifescore-promotional-unsubscribe",
    } as jwt.SignOptions
  );

export const verifyPromotionalUnsubscribeToken = (
  token: string
): PromotionalUnsubscribePayload => {
  const decoded = jwt.verify(token, EMAIL_TOKEN_SECRET, {
    issuer: "lifescore-email",
    audience: "lifescore-promotional-unsubscribe",
  }) as PromotionalUnsubscribePayload;

  if (decoded.type !== "promotional-unsubscribe") {
    throw new Error("Invalid unsubscribe token");
  }

  return decoded;
};

export const canSendPromotionalEmail = async (
  email: string
): Promise<boolean> => {
  const UserModel = (await import("../models/user")).default;
  const user = await UserModel.findOne({ email }).select("emailPreferences");

  if (!user) {
    return false;
  }

  return user.emailPreferences?.promotional !== false;
};

const buildPromotionalUnsubscribeUrl = (email: string): string => {
  const token = generatePromotionalUnsubscribeToken(email);
  return `${API_BASE_URL}/api/auth/unsubscribe-promotional?token=${encodeURIComponent(
    token
  )}`;
};

const renderEmailLayout = ({
  previewText,
  bodyHtml,
  recipientEmail,
  audience = "user",
  emailType = "transactional",
  showUnsubscribe = audience === "user" && emailType === "promotional",
}: EmailLayoutOptions): string => {
  const unsubscribeUrl =
    showUnsubscribe && recipientEmail
      ? buildPromotionalUnsubscribeUrl(recipientEmail)
      : null;
  const leftColumnLinks =
    audience === "user"
      ? `
        <p style="margin:0 0 14px 0;">
          <a href="${TERMS_URL}" style="color:${BRAND_COLORS.muted}; text-decoration:none;">Terms of Service</a>
        </p>
        <p style="margin:0;">
          <a href="${PRIVACY_URL}" style="color:${BRAND_COLORS.muted}; text-decoration:none;">Privacy Policy</a>
        </p>
      `
      : `
        <p style="margin:0 0 18px 0; color:${BRAND_COLORS.muted};">SelfScore Communications</p>
        <p style="margin:0; color:${BRAND_COLORS.muted};">Support and notifications</p>
      `;
  const unsubscribeBlock = unsubscribeUrl
    ? `
      <tr>
        <td colspan="2" align="center" class="unsubscribe-cell" style="padding:34px 20px 0 20px; text-align:center;">
          <a
            href="${unsubscribeUrl}"
            style="
              display:inline-block;
              color:${BRAND_COLORS.muted};
              text-decoration:underline;
              font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
              font-size:14px;
              line-height:1.4;
              text-align:center;
            "
          >Unsubscribe from SelfScore</a>
        </td>
      </tr>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <title>${APP_NAME}</title>
        <style>
          @media only screen and (max-width: 600px) {
            .email-shell {
              width: 100% !important;
            }

            .email-header,
            .email-body,
            .email-footer {
              padding-left: 20px !important;
              padding-right: 20px !important;
            }

            .email-header {
              padding-top: 22px !important;
              padding-bottom: 22px !important;
            }

            .email-body {
              padding-top: 32px !important;
              padding-bottom: 36px !important;
            }

            .email-footer {
              padding-top: 24px !important;
              padding-bottom: 28px !important;
            }

            .email-logo {
              width: 210px !important;
            }

            .footer-column {
              display: block !important;
              width: 100% !important;
              padding: 0 0 22px 0 !important;
            }

            .footer-column-right {
              padding-bottom: 0 !important;
            }

            .unsubscribe-cell {
              padding-top: 24px !important;
            }
          }
        </style>
      </head>
      <body style="margin:0; padding:0; background:#FFFFFF; color:${BRAND_COLORS.text};">
        ${
          previewText
            ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">${escapeHtml(
                previewText
              )}</div>`
            : ""
        }
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFFFFF;">
          <tr>
            <td align="center" style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-shell" style="max-width:760px; margin:0 auto;">
                <tr>
                  <td
                    class="email-header"
                    style="
                      padding:28px 32px;
                      background:rgba(218, 218, 218, 0.4);
                      background:#DADADA66;
                    "
                  >
                    <img
                      src="${LOGO_URL}"
                      alt="${APP_NAME}"
                      width="257"
                      class="email-logo"
                      style="display:block; width:257px; max-width:100%; height:auto; border:0;"
                    />
                  </td>
                </tr>
                <tr>
                  <td
                    class="email-body"
                    style="
                      background:#FFFFFF;
                      padding:48px 48px 54px 48px;
                    "
                  >
                    ${bodyHtml}
                  </td>
                </tr>
                <tr>
                  <td
                    class="email-footer"
                    style="
                      padding:30px 48px 34px 48px;
                      background:rgba(218, 218, 218, 0.4);
                      background:#DADADA66;
                    "
                  >
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; color:${BRAND_COLORS.muted}; font-size:14px;">
                      <tr>
                        <td width="50%" valign="top" class="footer-column" style="padding:0 20px 18px 0; font-size:14px; line-height:1.6;">
                          ${leftColumnLinks}
                          <!-- Follow us on section intentionally hidden for now -->
                        </td>
                        <td width="50%" valign="top" class="footer-column footer-column-right" style="padding:0 0 18px 20px; font-size:14px; line-height:1.6; word-break:break-word;">
                          <p style="margin:0 0 14px 0;"><a href="mailto:info@selfscore.net" style="color:${BRAND_COLORS.muted}; text-decoration:none;">info@selfscore.net</a></p>
                          <p style="margin:0 0 14px 0;"><a href="tel:+15614300610" style="color:${BRAND_COLORS.muted}; text-decoration:none;">+1 (561) 430-0610</a></p>
                          <p style="margin:0;">Charlottesville, Virginia, United States</p>
                        </td>
                      </tr>
                      ${unsubscribeBlock}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

// Send generic email
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return false;
    }

    console.log("✅ Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return false;
  }
};

// Send verification OTP email
export const sendVerificationEmail = async (
  email: string,
  username: string,
  verifyCode: string
): Promise<boolean> => {
  const safeUsername = escapeHtml(username);

  const html = renderEmailLayout({
    previewText: `Verify your ${APP_NAME} account`,
    recipientEmail: email,
    emailType: "transactional",
    bodyHtml: `
      <h1 style="margin:0 0 22px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:24px; line-height:1.3; font-weight:700;">
        Confirm your email address
      </h1>
      <p style="margin:0 0 40px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.6;">
        Hi ${safeUsername}, use the verification code below to complete your sign-up.
      </p>
      <div style="margin:0 0 34px 0;">
        <p style="margin:0 0 14px 0; color:#9D9D9D; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.4;">
          Your verification code
        </p>
        <div style="margin:0; color:#B34700; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:48px; line-height:1; font-weight:400; letter-spacing:6px;">
          ${verifyCode}
        </div>
      </div>
      <p style="margin:0 0 42px 0; color:#9D9D9D; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.5; font-weight:700;">
        This code will expire in 1 hour.
      </p>
      <p style="margin:0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.6;">
        If you didn&apos;t create an account with ${APP_NAME} please ignore this mail.
      </p>
    `,
  });

  return await sendEmail({
    to: email,
    subject: `Verify your ${APP_NAME} account`,
    html,
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  username: string,
  resetToken: string
): Promise<boolean> => {
  const resetLink = `${CLIENT_URL}/auth/reset-password?token=${resetToken}`;
  const safeUsername = escapeHtml(username);

  const html = renderEmailLayout({
    previewText: `Reset your ${APP_NAME} password`,
    recipientEmail: email,
    emailType: "transactional",
    bodyHtml: `
      <h1 style="margin:0 0 26px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:24px; line-height:1.35; font-weight:700;">
        Forgot your password? No worries, it happens.
      </h1>
      <p style="margin:0 0 12px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Hi ${safeUsername},
      </p>
      <p style="margin:0 0 34px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Click the button below to create a new one. This link will expire in 1 hour.
      </p>
      <div style="margin:0 0 42px 0; text-align:left;">
        <a
          href="${resetLink}"
          style="
            display:inline-block;
            padding:18px 36px;
            background:#0C677A;
            color:#FFFFFF;
            text-decoration:none;
            border-radius:16px;
            font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
            font-size:18px;
            line-height:1.2;
            font-weight:400;
          "
        >
          Reset your password
        </a>
      </div>
      <p style="margin:0 0 20px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Didn&apos;t ask to reset your password? You can ignore and delete this email.
      </p>
      <p style="margin:0; color:#707070; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:14px; line-height:1.6; word-break:break-word;">
        If the button doesn&apos;t work, open this link:
        <a href="${resetLink}" style="color:#0C677A; text-decoration:underline;">${resetLink}</a>
      </p>
    `,
  });

  return await sendEmail({
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    html,
  });
};

// Send welcome email after successful verification
export const sendWelcomeEmail = async (
  email: string,
  username: string
): Promise<boolean> => {
  const firstTestLink = `${PUBLIC_SITE_URL}/testInfo/?level=1`;
  const safeUsername = escapeHtml(username);
  const welcomeImagePath = resolveLocalAssetPath(
    "client/public/images/emails/welcome.png"
  );
  const welcomeImageSrc = welcomeImagePath
    ? "cid:welcome-image"
    : WELCOME_IMAGE_URL;

  const html = renderEmailLayout({
    previewText: `Welcome to ${APP_NAME}`,
    recipientEmail: email,
    emailType: "transactional",
    bodyHtml: `
      <div style="margin:0 0 34px 0; text-align:center;">
        <img
          src="${welcomeImageSrc}"
          alt="Welcome to SelfScore"
          width="360"
          style="display:inline-block; width:100%; max-width:360px; height:auto; border:0;"
        />
      </div>
      <p style="margin:0 0 12px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Hi ${safeUsername},
      </p>
      <p style="margin:0 0 10px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Small steps lead to meaningful change, and today, you&apos;ve taken one.
      </p>
      <p style="margin:0 0 10px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        ${APP_NAME} helps you measure, reflect, and grow at your own pace. No pressure. Just progress.
      </p>
      <p style="margin:0 0 34px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Ready to see where you stand?
      </p>
      <div style="margin:0; text-align:left;">
        <a
          href="${firstTestLink}"
          style="
            display:inline-block;
            padding:18px 36px;
            background:#0C677A;
            color:#FFFFFF;
            text-decoration:none;
            border-radius:16px;
            font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
            font-size:18px;
            line-height:1.2;
            font-weight:400;
          "
        >
          Take your first test
        </a>
      </div>
      <p style="margin:26px 0 0 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:16px; line-height:1.55;">
        If the button doesn&apos;t work, open this link:
        <a href="${firstTestLink}" style="color:#0C677A; text-decoration:underline;">${firstTestLink}</a>
      </p>
    `,
  });

  return await sendEmail({
    to: email,
    subject: `Welcome to ${APP_NAME} - Your Account is Verified!`,
    html,
    attachments: welcomeImagePath
      ? [
          {
            filename: "welcome.png",
            content: fs.readFileSync(welcomeImagePath),
            contentType: "image/png",
            contentId: "welcome-image",
          },
        ]
      : undefined,
  });
};

// Send contact form notification to admin
export const sendContactNotificationEmail = async (data: {
  name: string;
  email: string;
  message: string;
  messageId: string;
}): Promise<boolean> => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;

  if (!adminEmail || adminEmail === "onboarding@resend.dev") {
    console.warn(
      "⚠️  ADMIN_EMAIL not configured. Skipping admin notification."
    );
    return false;
  }

  const { name, email, message, messageId } = data;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);
  const submittedDate = formatEmailDateOnly(new Date());

  const html = renderEmailLayout({
    previewText: `New contact message from ${name}`,
    audience: "user",
    emailType: "transactional",
    showUnsubscribe: false,
    bodyHtml: `
      <p style="margin:0 0 38px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        New inquiry submitted via contact form.
      </p>
      <p style="margin:0 0 14px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        <strong>Name:</strong> ${safeName}
      </p>
      <p style="margin:0 0 34px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        <strong>Email:</strong> <a href="mailto:${safeEmail}" style="color:#111111; text-decoration:underline;">${safeEmail}</a>
      </p>
      <p style="margin:0 0 14px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55; font-weight:700;">
        Message
      </p>
      <div style="margin:0 0 14px 0; background:#F5F5F5; border-radius:18px; padding:22px 24px;">
        <p style="margin:0; color:#111111; white-space:pre-wrap; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.45;">
          ${safeMessage}
        </p>
      </div>
      <p style="margin:0; color:#9D9D9D; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.4;">
        Submitted on: ${submittedDate}
      </p>
    `,
  });

  return await sendEmail({
    to: adminEmail,
    subject: `New Contact Message from ${name}`,
    html,
  });
};

// Send test completion notification to user (Levels 1, 2, 3, 4)
export const sendTestCompletionEmailToUser = async (data: {
  email: string;
  username: string;
  level: number;
  score: number;
  totalQuestions: number;
  isPending?: boolean; // For Level 4 pending review
}): Promise<boolean> => {
  const {
    email,
    username,
    level,
    score,
    totalQuestions,
    isPending = false,
  } = data;
  const dashboardUrl = `${CLIENT_URL}/user/dashboard`;
  const safeUsername = escapeHtml(username);
  const cupImagePath = resolveLocalAssetPath("client/public/images/emails/cup.png");
  const cupImageSrc = cupImagePath ? "cid:cup-image" : CUP_IMAGE_URL;

  const scoreDisplay = isPending
    ? ""
    : `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 40px 0; border:2px solid #B34700; border-radius:20px;">
        <tr>
          <td style="padding:18px 18px 12px 18px; text-align:center;">
            <p style="margin:0 0 20px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.4; font-weight:700;">
              Your score
            </p>
            <div style="margin:0 0 22px 0; color:#B34700; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:64px; line-height:1; font-weight:400;">
              ${score}
            </div>
            <p style="margin:0; color:#9D9D9D; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.5;">
              Total questions solved: ${totalQuestions}
            </p>
          </td>
        </tr>
      </table>
    `;

  const html = renderEmailLayout({
    previewText: isPending
      ? `Level ${level} submission received`
      : `Level ${level} test completed`,
    recipientEmail: email,
    emailType: "transactional",
    bodyHtml: `
      ${
        isPending
          ? `
            <h1 style="margin:0 0 42px 0; color:#B34700; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:24px; line-height:1.35; font-weight:400;">
              Test Submitted Successfully!
            </h1>
            <p style="margin:0 0 42px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
              Congratulations on completing Level ${level} of the ${APP_NAME} assessment!
            </p>
            <p style="margin:0 0 40px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55; font-weight:700;">
              Current Status: Under Review
            </p>
            <div style="margin:0 0 48px 0; text-align:left;">
              <a
                href="${dashboardUrl}"
                style="
                  display:inline-block;
                  padding:18px 36px;
                  background:#0C677A;
                  color:#FFFFFF;
                  text-decoration:none;
                  border-radius:16px;
                  font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
                  font-size:18px;
                  line-height:1.2;
                  font-weight:400;
                "
              >
                See your progress
              </a>
            </div>
            <p style="margin:0; color:#9D9D9D; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
              You&apos;ll receive another email once your score is ready.
            </p>
          `
          : `
            <div style="margin:0 0 22px 0; text-align:center;">
              <img
                src="${cupImageSrc}"
                alt="Achievement cup"
                width="160"
                style="display:inline-block; width:100%; max-width:160px; height:auto; border:0;"
              />
            </div>
            <p style="margin:0 0 34px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55; text-align:center;">
              Congratulations ${safeUsername}, you&apos;re on a roll.
            </p>
            ${renderLevelProgress(level, isPending)}
            ${scoreDisplay}
            <div style="margin:0; text-align:center;">
              <a
                href="${dashboardUrl}"
                style="
                  display:inline-block;
                  padding:18px 36px;
                  background:#0C677A;
                  color:#FFFFFF;
                  text-decoration:none;
                  border-radius:16px;
                  font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
                  font-size:18px;
                  line-height:1.2;
                  font-weight:400;
                "
              >
                See your progress
              </a>
            </div>
          `
      }
    `,
  });

  return await sendEmail({
    to: email,
    subject: isPending
      ? `Level ${level} Test Submitted - Under Review`
      : `Level ${level} Test Completed - Score: ${score}`,
    html,
    attachments: !isPending && cupImagePath
      ? [
          {
            filename: "cup.png",
            content: fs.readFileSync(cupImagePath),
            contentType: "image/png",
            contentId: "cup-image",
          },
        ]
      : undefined,
  });
};

// Send test completion notification to admin (Levels 1, 2, 3, 4)
export const sendTestCompletionEmailToAdmin = async (data: {
  username: string;
  email: string;
  level: number;
  score: number;
  totalQuestions: number;
  userId: string;
  isPending?: boolean; // For Level 4 pending review
}): Promise<boolean> => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;

  if (!adminEmail || adminEmail === "onboarding@resend.dev") {
    console.warn(
      "⚠️  ADMIN_EMAIL not configured. Skipping admin notification."
    );
    return false;
  }

  const {
    username,
    email,
    level,
    score,
    totalQuestions,
    userId,
    isPending = false,
  } = data;
  const adminDashboardUrl =
    level === 4
      ? `${CLIENT_URL}/admin/level4-submissions`
      : `${CLIENT_URL}/admin/users/${userId}`;
  const safeUsername = escapeHtml(username);
  const safeEmail = escapeHtml(email);

  const html = renderEmailLayout({
    previewText: `User completed Level ${level} test`,
    audience: "user",
    emailType: "transactional",
    showUnsubscribe: false,
    bodyHtml: `
      <h1 style="margin:0 0 34px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:24px; line-height:1.35; font-weight:700;">
        ${
          isPending
            ? `Level ${level} test submitted for review`
            : `Level ${level} test completed`
        }
      </h1>
      <p style="margin:0 0 14px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        <strong>Name:</strong> ${safeUsername}
      </p>
      <p style="margin:0 0 14px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        <strong>Email:</strong> <a href="mailto:${safeEmail}" style="color:#111111; text-decoration:underline;">${safeEmail}</a>
      </p>
      <p style="margin:0 0 14px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        <strong>Level:</strong> Level ${level}
      </p>
      <p style="margin:0 0 34px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        <strong>User ID:</strong> ${userId}
      </p>
      ${
        isPending
          ? `
            <p style="margin:0 0 36px 0; color:#B34700; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
              This Level 4 submission is awaiting admin review.
            </p>
          `
          : `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 36px 0; border:2px solid #B34700; border-radius:20px;">
              <tr>
                <td style="padding:18px 18px 12px 18px; text-align:center;">
                  <p style="margin:0 0 20px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.4; font-weight:700;">
                    Submitted score
                  </p>
                  <div style="margin:0 0 22px 0; color:#B34700; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:64px; line-height:1; font-weight:400;">
                    ${score}
                  </div>
                  <p style="margin:0; color:#9D9D9D; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.5;">
                    Total questions solved: ${totalQuestions}
                  </p>
                </td>
              </tr>
            </table>
          `
      }
      <div style="text-align:left;">
        <a href="${adminDashboardUrl}" style="display:inline-block; padding:18px 36px; background:#0C677A; color:#FFFFFF; text-decoration:none; border-radius:16px; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.2; font-weight:400;">
          ${isPending ? "Review Submission" : "View User Details"}
        </a>
      </div>
    `,
  });

  return await sendEmail({
    to: adminEmail,
    subject: isPending
      ? `🔔 Level ${level} Submission Pending Review - ${username}`
      : `🔔 User Completed Level ${level} Test - ${username}`,
    html,
  });
};

// Send Level 4 review completion notification to user
export const sendLevel4ReviewCompleteEmail = async (
  email: string,
  username: string,
  totalScore: number
): Promise<boolean> => {
  const dashboardUrl = `${CLIENT_URL}/user/dashboard`;
  const giftImagePath = resolveLocalAssetPath("client/public/images/emails/Gift.png");
  const giftImageSrc = giftImagePath ? "cid:gift-image" : GIFT_IMAGE_URL;

  const html = renderEmailLayout({
    previewText: "Your Level 4 report is ready",
    recipientEmail: email,
    emailType: "transactional",
    bodyHtml: `
      <div style="margin:0 0 26px 0; text-align:center;">
        <img
          src="${giftImageSrc}"
          alt="Level 4 review complete"
          width="150"
          style="display:inline-block; width:100%; max-width:150px; height:auto; border:0;"
        />
      </div>
      <p style="margin:0 0 42px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Your Level 4 Review Is Complete
      </p>
      <p style="margin:0 0 40px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        You now have access to AI-Assisted Consultation.
      </p>
      <div style="margin:0 0 44px 0; text-align:left;">
        <a
          href="${dashboardUrl}"
          style="
            display:inline-block;
            padding:18px 36px;
            background:#0C677A;
            color:#FFFFFF;
            text-decoration:none;
            border-radius:16px;
            font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
            font-size:18px;
            line-height:1.2;
            font-weight:400;
          "
        >
          View your full report
        </a>
      </div>
      <p style="margin:0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.3;">
        This report provides deeper insights into your strengths and areas for growth, helping you take the next step in your wellbeing journey.
      </p>
    `,
  });

  return await sendEmail({
    to: email,
    subject: `Your Level 4 Report is Ready - Score: ${totalScore}`,
    html,
    attachments: giftImagePath
      ? [
          {
            filename: "gift.png",
            content: fs.readFileSync(giftImagePath),
            contentType: "image/png",
            contentId: "gift-image",
          },
        ]
      : undefined,
  });
};

// Send Level 5 Review Complete Email
export const sendLevel5ReviewCompleteEmail = async (
  userId: string,
  totalScore: number
): Promise<boolean> => {
  try {
    // Get user details
    const UserModel = (await import("../models/user")).default;
    const user = await UserModel.findById(userId).select("email username");

    if (!user) {
      console.error("User not found for Level 5 review email");
      return false;
    }

    const dashboardUrl = `${CLIENT_URL}/user/dashboard`;
    const giftImagePath = resolveLocalAssetPath(
      "client/public/images/emails/Gift.png"
    );
    const giftImageSrc = giftImagePath ? "cid:gift-image" : GIFT_IMAGE_URL;

    const html = renderEmailLayout({
      previewText: "Your Level 5 report is ready",
      recipientEmail: user.email,
      emailType: "transactional",
      bodyHtml: `
        <div style="margin:0 0 26px 0; text-align:center;">
          <img
            src="${giftImageSrc}"
            alt="Level 5 review complete"
            width="150"
            style="display:inline-block; width:100%; max-width:150px; height:auto; border:0;"
          />
        </div>
        <p style="margin:0 0 42px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
          Your Level 5 Review Is Complete
        </p>
        <p style="margin:0 0 40px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
          Your full AI interview report is now ready to review.
        </p>
        <div style="margin:0 0 44px 0; text-align:left;">
          <a href="${dashboardUrl}" style="display:inline-block; padding:18px 36px; background:#0C677A; color:#FFFFFF; text-decoration:none; border-radius:16px; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.2; font-weight:400;">
            View your full report
          </a>
        </div>
        <p style="margin:0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.3;">
          This report provides deeper insights into your communication style, strengths, and areas for growth so you can keep building with clarity and confidence.
        </p>
      `,
    });

    return await sendEmail({
      to: user.email,
      subject: `Your Level 5 AI Interview Report is Ready - Score: ${totalScore}`,
      html,
      attachments: giftImagePath
        ? [
            {
              filename: "gift.png",
              content: fs.readFileSync(giftImagePath),
              contentType: "image/png",
              contentId: "gift-image",
            },
          ]
        : undefined,
    });
  } catch (error) {
    console.error("Error sending Level 5 review email:", error);
    return false;
  }
};

// Send consultant approval email
export const sendConsultantApprovalEmail = async (
  email: string,
  firstName: string
): Promise<boolean> => {
  const safeFirstName = escapeHtml(firstName);

  const html = renderEmailLayout({
    previewText: "Your consultant application has been approved",
    audience: "user",
    emailType: "transactional",
    showUnsubscribe: false,
    bodyHtml: `
      <h1 style="margin:0 0 14px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:24px; line-height:1.35; font-weight:700;">
        Your Consultant Application Is Approved
      </h1>
      <p style="margin:0 0 38px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Welcome to ${APP_NAME}, ${safeFirstName}. Your profile is now active.
      </p>
      <div style="margin:0 0 42px 0; text-align:left;">
        <a
          href="${CLIENT_URL}/consultant/login"
          style="
            display:inline-block;
            padding:18px 36px;
            background:#0C677A;
            color:#FFFFFF;
            text-decoration:none;
            border-radius:16px;
            font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
            font-size:18px;
            line-height:1.2;
            font-weight:400;
          "
        >
          Access your consultant portal
        </a>
      </div>
      <p style="margin:0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        You can now manage sessions, update availability, and access client insights.
      </p>
    `,
  });

  return await sendEmail({
    to: email,
    subject: `🎉 Your Wellness Coach Application Has Been Approved!`,
    html,
  });
};

// Send consultant rejection email
export const sendConsultantRejectionEmail = async (
  email: string,
  firstName: string,
  rejectionReason: string
): Promise<boolean> => {
  const formattedFeedback = escapeHtml(rejectionReason)
    .split(/\r?\n+/)
    .filter(Boolean)
    .map(
      (line) => `
        <p style="margin:0 0 12px 0; color:#7A7A7A; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
          &#8727; ${line.trim()}
        </p>
      `
    )
    .join("");

  const html = renderEmailLayout({
    previewText: "Update on your consultant application",
    audience: "user",
    emailType: "transactional",
    showUnsubscribe: false,
    bodyHtml: `
      <h1 style="margin:0 0 40px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:24px; line-height:1.35; font-weight:700;">
        Your Consultant Application Update
      </h1>
      <p style="margin:0 0 40px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        After careful review, we&apos;re unable to approve your consultant application at this time.
      </p>
      <p style="margin:0 0 18px 0; color:#B34700; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Feedback from the team:
      </p>
      <div style="margin:0 0 34px 0;">
        ${
          formattedFeedback ||
          `<p style="margin:0; color:#7A7A7A; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
            &#8727; We need a bit more information before we can move your application forward.
          </p>`
        }
      </div>
      <p style="margin:0; color:#9D9D9D; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        You&apos;re welcome to update your information and reapply once the above points have been addressed.
      </p>
    `,
  });

  return await sendEmail({
    to: email,
    subject: `Update on Your Wellness Coach Application`,
    html,
  });
};

// Send booking confirmation email (to user and consultant)
export const sendBookingConfirmationEmail = async (data: {
  userEmail: string;
  userName: string;
  consultantName: string;
  sessionType: string;
  startTime: Date;
  duration: number;
  meetingLink?: string;
  timezone: string;
}): Promise<boolean> => {
  const {
    userEmail,
    userName,
    consultantName,
    sessionType,
    startTime,
    duration,
    meetingLink,
    timezone,
  } = data;
  const safeUserName = escapeHtml(userName);
  const joinSessionUrl = meetingLink || `${PUBLIC_SITE_URL}/user/bookings`;

  const endTime = new Date(startTime.getTime() + duration * 60000);

  // Use timezone helper to format dates
  const { date, timeRange } = formatBookingTimeForEmail(
    startTime,
    endTime,
    timezone
  );

  // Email to user
  const userHtml = renderEmailLayout({
    previewText: `Booking confirmed with ${consultantName}`,
    recipientEmail: userEmail,
    emailType: "transactional",
    bodyHtml: `
      <p style="margin:0 0 12px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Thanks ${safeUserName},
      </p>
      <p style="margin:0 0 34px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Your session is confirmed
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 44px 0; background:#F7EFE8; border-radius:20px;">
        <tr>
          <td style="padding:24px 26px;">
            <p style="margin:0 0 16px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.5;">
              <span style="color:#6F6F6F;">&#128197;</span> Date: <strong>${date}</strong>
            </p>
            <p style="margin:0 0 16px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.5;">
              <span style="color:#6F6F6F;">&#128339;</span> Time: <strong>${timeRange}</strong>
            </p>
            <p style="margin:0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.5;">
              <span style="color:#6F6F6F;">&#10003;</span> Duration: ${duration} Minutes
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 38px 0; color:#9D9D9D; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55; text-align:center;">
        &#128161; Feel free to bring any notes or questions you&apos;d like to discuss.
      </p>
      <div style="margin:0; text-align:center;">
        <a
          href="${joinSessionUrl}"
          style="
            display:inline-block;
            padding:18px 36px;
            background:#0C677A;
            color:#FFFFFF;
            text-decoration:none;
            border-radius:16px;
            font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
            font-size:18px;
            line-height:1.2;
            font-weight:400;
          "
        >
          Join your session
        </a>
      </div>
    `,
  });

  // Send email
  return await sendEmail({
    to: userEmail,
    subject: `Booking Confirmed: ${sessionType} with ${consultantName}`,
    html: userHtml,
  });
};

// Send booking cancellation email
export const sendBookingCancellationEmail = async (data: {
  userEmail: string;
  userName: string;
  consultantName: string;
  consultantEmail: string;
  sessionType: string;
  startTime: Date;
  duration: number;
  timezone: string;
  cancellationReason?: string;
}): Promise<boolean> => {
  const {
    userEmail,
    userName,
    consultantName,
    consultantEmail,
    sessionType,
    startTime,
    duration,
    timezone,
    cancellationReason,
  } = data;
  const safeUserName = escapeHtml(userName);
  const safeConsultantName = escapeHtml(consultantName);
  const bookNewSessionUrl = `${PUBLIC_SITE_URL}/consultations`;
  const consultantBookingsUrl = `${PUBLIC_SITE_URL}/consultant/bookings`;

  // Use timezone helper to format dates
  const endTime = new Date(startTime.getTime() + duration * 60000);
  const { date, time } = formatBookingTimeForEmail(
    startTime,
    endTime,
    timezone
  );
  const formattedDateTime = `${date} at ${time}`;

  // Email to user
  const userHtml = renderEmailLayout({
    previewText: `Booking cancelled for ${sessionType}`,
    recipientEmail: userEmail,
    emailType: "transactional",
    bodyHtml: `
      <p style="margin:0 0 12px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Hi ${safeUserName},
      </p>
      <p style="margin:0 0 10px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Your session scheduled for <span style="text-decoration:underline;">${formattedDateTime}</span> has been <strong>cancelled.</strong>
      </p>
      <p style="margin:0 0 40px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        If this was unintentional or you&apos;d like to book another time, you can schedule a new session below.
      </p>
      <div style="margin:0 0 42px 0; text-align:left;">
        <a
          href="${bookNewSessionUrl}"
          style="
            display:inline-block;
            padding:18px 36px;
            background:#0C677A;
            color:#FFFFFF;
            text-decoration:none;
            border-radius:16px;
            font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
            font-size:18px;
            line-height:1.2;
            font-weight:400;
          "
        >
          Book a new session
        </a>
      </div>
      <p style="margin:0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        If you have any questions, feel free to contact us we&apos;re here to help.
      </p>
    `,
  });

  // Email to consultant
  const consultantHtml = renderEmailLayout({
    previewText: `Booking cancelled by ${userName}`,
    audience: "user",
    emailType: "transactional",
    showUnsubscribe: false,
    bodyHtml: `
      <p style="margin:0 0 12px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        Hi ${safeConsultantName},
      </p>
      <p style="margin:0 0 10px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        ${safeUserName}&apos;s session scheduled for <span style="text-decoration:underline;">${formattedDateTime}</span> has been <strong>cancelled.</strong>
      </p>
      <p style="margin:0 0 40px 0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        You can review your upcoming availability and bookings below.
      </p>
      <div style="margin:0 0 42px 0; text-align:left;">
        <a
          href="${consultantBookingsUrl}"
          style="
            display:inline-block;
            padding:18px 36px;
            background:#0C677A;
            color:#FFFFFF;
            text-decoration:none;
            border-radius:16px;
            font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
            font-size:18px;
            line-height:1.2;
            font-weight:400;
          "
        >
          View your bookings
        </a>
      </div>
      <p style="margin:0; color:#111111; font-family:'Source Sans Pro', Arial, Helvetica, sans-serif; font-size:18px; line-height:1.55;">
        If you have any questions, feel free to contact us we&apos;re here to help.
      </p>
    `,
  });

  // Send both emails
  const userEmailSent = await sendEmail({
    to: userEmail,
    subject: `Booking Cancelled: ${sessionType}`,
    html: userHtml,
  });

  const consultantEmailSent = await sendEmail({
    to: consultantEmail,
    subject: `Booking Cancelled: ${sessionType} with ${userName}`,
    html: consultantHtml,
  });

  return userEmailSent && consultantEmailSent;
};
