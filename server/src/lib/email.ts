import { Resend } from "resend";
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

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Send generic email
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
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
  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #005F73 0%, #0A9396 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #005F73; margin-top: 0;">Welcome, ${username}!</h2>
                
                <p style="font-size: 16px; color: #555;">
                    Thank you for signing up with ${APP_NAME}. To complete your registration, please verify your email address using the code below:
                </p>
                
                <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0; border: 2px solid #E87A42;">
                    <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                    <h1 style="margin: 10px 0; font-size: 42px; color: #E87A42; letter-spacing: 8px; font-weight: bold;">${verifyCode}</h1>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    <strong>This code will expire in 1 hour.</strong>
                </p>
                
                <p style="font-size: 14px; color: #666;">
                    If you didn't create an account with ${APP_NAME}, you can safely ignore this email.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

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

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #005F73 0%, #0A9396 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #005F73; margin-top: 0;">Password Reset Request</h2>
                
                <p style="font-size: 16px; color: #555;">
                    Hi ${username},
                </p>
                
                <p style="font-size: 16px; color: #555;">
                    We received a request to reset your password. Click the button below to create a new password:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="display: inline-block; background: #E87A42; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    Or copy and paste this link into your browser:
                </p>
                <p style="font-size: 12px; color: #0A9396; word-break: break-all; background: white; padding: 10px; border-radius: 4px;">
                    ${resetLink}
                </p>
                
                <p style="font-size: 14px; color: #666;">
                    <strong>This link will expire in 1 hour.</strong>
                </p>
                
                <p style="font-size: 14px; color: #666;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

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
  const dashboardLink = `${CLIENT_URL}/user/dashboard`;

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ${APP_NAME}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #005F73 0%, #0A9396 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #005F73; margin-top: 0;">Welcome to ${APP_NAME}! 🎉</h2>
                
                <p style="font-size: 16px; color: #555;">
                    Hi ${username},
                </p>
                
                <p style="font-size: 16px; color: #555;">
                    Congratulations! Your email has been successfully verified, and your account is now active.
                </p>
                
                <p style="font-size: 16px; color: #555;">
                    You're all set to begin your journey of self-discovery and wellness. We're excited to have you as part of our community!
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${dashboardLink}" style="display: inline-block; background: #E87A42; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Access Your Dashboard</a>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0A9396;">
                    <h3 style="color: #005F73; margin-top: 0; font-size: 18px;">What's Next?</h3>
                    <ul style="color: #555; padding-left: 20px;">
                        <li style="margin-bottom: 10px;">Complete your wellness assessment</li>
                        <li style="margin-bottom: 10px;">Explore personalized recommendations</li>
                        <li style="margin-bottom: 10px;">Connect with certified wellness coaches</li>
                        <li style="margin-bottom: 10px;">Track your progress over time</li>
                    </ul>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    If you have any questions or need assistance, feel free to reach out to our support team.
                </p>
                
                <p style="font-size: 16px; color: #555;">
                    Best regards,<br>
                    <strong>The ${APP_NAME} Team</strong>
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

  return await sendEmail({
    to: email,
    subject: `Welcome to ${APP_NAME} - Your Account is Verified!`,
    html,
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
  const adminDashboardUrl = `${CLIENT_URL}/admin/messages`;

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Message</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #005F73 0%, #0A9396 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME} - Admin</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #005F73; margin-top: 0;">📧 New Contact Message</h2>
                
                <p style="font-size: 16px; color: #555;">
                    You have received a new message from the contact form.
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E87A42;">
                    <p style="margin: 5px 0;"><strong>From:</strong> ${name}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0A9396;">${email}</a></p>
                    <p style="margin: 5px 0;"><strong>Message ID:</strong> ${messageId}</p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
                    <p style="margin: 0; color: #555; white-space: pre-wrap;">${message}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${adminDashboardUrl}" style="display: inline-block; background: #E87A42; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">View in Dashboard</a>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

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

  // Different messages for pending Level 4
  const scoreDisplay = isPending
    ? `<p style="font-size: 16px; color: #555;">Your submission is currently under review by our expert team. You'll receive another email once your score is ready.</p>`
    : `<div style="background: white; padding: 25px; text-align: center; border-radius: 8px; margin: 30px 0; border: 2px solid #E87A42;">
            <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Score</p>
            <h1 style="margin: 10px 0; font-size: 48px; color: #E87A42; font-weight: bold;">${score}</h1>
            <p style="margin: 0; font-size: 12px; color: #999;">Total Questions: ${totalQuestions}</p>
        </div>`;

  const title = isPending
    ? "✅ Test Submitted Successfully!"
    : "🎉 Test Completed!";

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test Completed - Level ${level}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #005F73 0%, #0A9396 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #005F73; margin-top: 0;">${title}</h2>
                
                <p style="font-size: 16px; color: #555;">
                    Hi ${username},
                </p>
                
                <p style="font-size: 16px; color: #555;">
                    Congratulations on completing Level ${level} of the SelfScore assessment!
                </p>
                
                ${scoreDisplay}
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; background: #E87A42; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">View Dashboard</a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    ${
                      isPending
                        ? "You can track the review status from your dashboard."
                        : "You can view your detailed results and download your report from your dashboard."
                    }
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0A9396;">
                    <p style="margin: 0; font-size: 14px; color: #555;">
                        <strong>💡 Next Steps:</strong> ${
                          isPending
                            ? "Your answers are being carefully reviewed. Check back soon for your detailed feedback!"
                            : `Continue your journey by exploring Level ${
                                level + 1
                              } or review your progress on the dashboard.`
                        }
                    </p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

  return await sendEmail({
    to: email,
    subject: isPending
      ? `Level ${level} Test Submitted - Under Review`
      : `Level ${level} Test Completed - Score: ${score}`,
    html,
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

  const statusBadge = isPending
    ? `<span style="background: #FFA500; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">PENDING REVIEW</span>`
    : `<span style="background: #4CAF50; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">COMPLETED</span>`;

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Completed Test - Level ${level}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #005F73 0%, #0A9396 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME} - Admin</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #005F73; margin-top: 0;">📝 User Completed Level ${level} Test</h2>
                
                <p style="font-size: 16px; color: #555;">
                    A user has ${
                      isPending ? "submitted" : "completed"
                    } a Level ${level} test on the platform.
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E87A42;">
                    <p style="margin: 5px 0;"><strong>User Name:</strong> ${username}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0A9396;">${email}</a></p>
                    <p style="margin: 5px 0;"><strong>User ID:</strong> ${userId}</p>
                    <p style="margin: 5px 0;"><strong>Test Level:</strong> Level ${level}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> ${statusBadge}</p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Test Results:</strong></p>
                    ${
                      isPending
                        ? `<p style="margin: 0; color: #FFA500; font-weight: bold;">⏳ Awaiting Admin Review</p>
                           <p style="margin: 10px 0 0 0; color: #555; font-size: 14px;">This Level 4 submission requires manual review and scoring.</p>`
                        : `<p style="margin: 0;"><strong>Score:</strong> ${score} / ${totalQuestions}</p>
                           <p style="margin: 5px 0;"><strong>Total Questions:</strong> ${totalQuestions}</p>`
                    }
                </div>
                
                ${
                  isPending
                    ? `
                <div style="background: #FFF3CD; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFA500;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">
                        <strong>⚠️ Action Required:</strong> Please review this Level 4 submission and provide scores and feedback for each question.
                    </p>
                </div>
                `
                    : ""
                }
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${adminDashboardUrl}" style="display: inline-block; background: #E87A42; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">${
    isPending ? "Review Submission" : "View User Details"
  }</a>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

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

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Level 4 Report is Ready</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #005F73 0%, #0A9396 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #005F73; margin-top: 0;">🎉 Your Level 4 Report is Ready!</h2>
                
                <p style="font-size: 16px; color: #555;">
                    Hi ${username},
                </p>
                
                <p style="font-size: 16px; color: #555;">
                    Great news! Our team has completed the review of your Level 4 Mastery Test submission.
                </p>
                
                <div style="background: white; padding: 25px; text-align: center; border-radius: 8px; margin: 30px 0; border: 2px solid #E87A42;">
                    <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Total Score</p>
                    <h1 style="margin: 10px 0; font-size: 48px; color: #E87A42; font-weight: bold;">${totalScore}</h1>
                    <p style="margin: 0; font-size: 12px; color: #999;">Score Range: 350 - 900</p>
                </div>
                
                <p style="font-size: 16px; color: #555;">
                    Your detailed report with individual question scores and expert remarks is now available on your dashboard.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; background: #E87A42; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">View Your Report</a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    You can also download your complete report as a PDF from your dashboard.
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0A9396;">
                    <p style="margin: 0; font-size: 14px; color: #555;">
                        <strong>💡 Tip:</strong> Review the expert remarks carefully to understand your strengths and areas for improvement in life management and emotional intelligence.
                    </p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

  return await sendEmail({
    to: email,
    subject: `Your Level 4 Report is Ready - Score: ${totalScore}`,
    html,
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

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Level 5 Report is Ready</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #005F73 0%, #0A9396 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #005F73; margin-top: 0;">🎉 Your Level 5 AI Interview Report is Ready!</h2>
                
                <p style="font-size: 16px; color: #555;">
                    Hi ${user.username},
                </p>
                
                <p style="font-size: 16px; color: #555;">
                    Excellent news! Our expert team has completed the comprehensive review of your Level 5 Real-Time AI Voice Interview.
                </p>
                
                <div style="background: white; padding: 25px; text-align: center; border-radius: 8px; margin: 30px 0; border: 2px solid #E87A42;">
                    <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Total Score</p>
                    <h1 style="margin: 10px 0; font-size: 48px; color: #E87A42; font-weight: bold;">${totalScore}</h1>
                    <p style="margin: 0; font-size: 12px; color: #999;">Score Range: 350 - 900</p>
                </div>
                
                <p style="font-size: 16px; color: #555;">
                    Your detailed report includes individual scores for all 25 questions, expert remarks on your voice responses, and personalized feedback on your communication and emotional intelligence.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; background: #E87A42; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">View Your Report</a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    You can also download your complete report as a PDF from your dashboard.
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0A9396;">
                    <p style="margin: 0; font-size: 14px; color: #555;">
                        <strong>💡 Tip:</strong> Review the expert remarks carefully to understand how your voice communication reflects your emotional intelligence, decision-making abilities, and life management skills.
                    </p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
      to: user.email,
      subject: `Your Level 5 AI Interview Report is Ready - Score: ${totalScore}`,
      html,
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
  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Approved!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #4CAF50; margin-top: 0;">Welcome to ${APP_NAME}, ${firstName}!</h2>
                
                <p style="font-size: 16px; color: #555;">
                    We're excited to inform you that your wellness coach application has been <strong>approved</strong>! 🎊
                </p>
                
                <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4CAF50;">
                    <p style="margin: 0; font-size: 15px; color: #2E7D32;">
                        <strong>✅ Your Profile is Now Active</strong><br/>
                        You can now start accepting clients and offering your coaching services through our platform.
                    </p>
                </div>
                
                <h3 style="color: #005F73; margin-top: 30px;">Next Steps:</h3>
                <ul style="font-size: 15px; color: #555; line-height: 1.8;">
                    <li>Log in to your consultant dashboard to manage your profile</li>
                    <li>Set up your availability and session preferences</li>
                    <li>Start connecting with clients who need your expertise</li>
                    <li>Review our coaching guidelines and best practices</li>
                </ul>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${CLIENT_URL}/consultant/login" style="display: inline-block; padding: 15px 35px; background-color: #005F73; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Access Your Dashboard
                    </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 25px;">
                    We're thrilled to have you as part of our wellness community. Together, we'll help individuals transform their lives and achieve their goals.
                </p>
                
                <p style="font-size: 14px; color: #666;">
                    If you have any questions, please don't hesitate to reach out to our support team.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

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
  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #005F73 0%, #0A9396 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #005F73; margin-top: 0;">Dear ${firstName},</h2>
                
                <p style="font-size: 16px; color: #555;">
                    Thank you for your interest in becoming a wellness coach with ${APP_NAME}. After careful review of your application, we regret to inform you that we are unable to approve your application at this time.
                </p>
                
                <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FF9800;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #E65100; font-weight: bold;">
                        Feedback from Review Team:
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #555; white-space: pre-wrap;">
                        ${rejectionReason}
                    </p>
                </div>
                
                <p style="font-size: 15px; color: #555; margin-top: 25px;">
                    We appreciate the time and effort you put into your application. Please note that this decision is based on our current requirements and platform standards.
                </p>
                
                <p style="font-size: 14px; color: #666;">
                    We encourage you to continue developing your coaching practice and expertise. We wish you all the best in your professional journey.
                </p>
                
                <p style="font-size: 14px; color: #666;">
                    If you have any questions about this decision, please feel free to contact our support team.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

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

  const endTime = new Date(startTime.getTime() + duration * 60000);

  // Use timezone helper to format dates
  const { date, timeRange } = formatBookingTimeForEmail(
    startTime,
    endTime,
    timezone
  );

  // Email to user
  const userHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #005F73 0%, #0A9396 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #005F73; margin-top: 0;">✅ Booking Confirmed!</h2>
                
                <p style="font-size: 16px; color: #555;">
                    Hi ${userName},
                </p>
                
                <p style="font-size: 16px; color: #555;">
                    Your consultation with <strong>${consultantName}</strong> has been confirmed.
                </p>
                
                <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #E87A42;">
                    <h3 style="margin-top: 0; color: #005F73;">📅 Appointment Details</h3>
                    <p style="margin: 10px 0;"><strong>Session:</strong> ${sessionType}</p>
                    <p style="margin: 10px 0;"><strong>Consultant:</strong> ${consultantName}</p>
                    <p style="margin: 10px 0;"><strong>Duration:</strong> ${duration} minutes</p>
                    <p style="margin: 10px 0;"><strong>Date:</strong> ${date}</p>
                    <p style="margin: 10px 0;"><strong>Time:</strong> ${timeRange}</p>
                    ${
                      meetingLink
                        ? `<p style="margin: 10px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #0A9396;">${meetingLink}</a></p>`
                        : ""
                    }
                </div>
                
                <div style="background: #E8F4F8; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 14px; color: #005F73;">
                        <strong>📝 Before your session:</strong><br>
                        • Please arrive 5 minutes early<br>
                        • Ensure you have a stable internet connection<br>
                        • Prepare any questions you'd like to discuss<br>
                        • Check your audio and video settings
                    </p>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    If you need to cancel, please do so through your dashboard.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

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

  // Use timezone helper to format dates
  const endTime = new Date(startTime.getTime() + duration * 60000);
  const { date, time } = formatBookingTimeForEmail(
    startTime,
    endTime,
    timezone
  );
  const formattedDateTime = `${date} at ${time}`;

  // Email to user
  const userHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Cancelled</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #005F73 0%, #0A9396 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #F44336; margin-top: 0;">❌ Booking Cancelled</h2>
                
                <p style="font-size: 16px; color: #555;">
                    Hi ${userName},
                </p>
                
                <p style="font-size: 16px; color: #555;">
                    Your consultation booking has been cancelled.
                </p>
                
                <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #F44336;">
                    <h3 style="margin-top: 0; color: #F44336;">📅 Cancelled Booking</h3>
                    <p style="margin: 10px 0;"><strong>Session:</strong> ${sessionType}</p>
                    <p style="margin: 10px 0;"><strong>Consultant:</strong> ${consultantName}</p>
                    <p style="margin: 10px 0;"><strong>Scheduled Time:</strong> ${formattedDateTime}</p>
                    ${
                      cancellationReason
                        ? `<p style="margin: 10px 0;"><strong>Reason:</strong> ${cancellationReason}</p>`
                        : ""
                    }
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    You can book a new session at any time through our platform.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

  // Email to consultant
  const consultantHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Cancelled</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #005F73 0%, #0A9396 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #F44336; margin-top: 0;">❌ Booking Cancelled</h2>
                
                <p style="font-size: 16px; color: #555;">
                    Hi ${consultantName},
                </p>
                
                <p style="font-size: 16px; color: #555;">
                    A consultation booking has been cancelled.
                </p>
                
                <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #F44336;">
                    <h3 style="margin-top: 0; color: #F44336;">📅 Cancelled Booking</h3>
                    <p style="margin: 10px 0;"><strong>Client:</strong> ${userName}</p>
                    <p style="margin: 10px 0;"><strong>Session:</strong> ${sessionType}</p>
                    <p style="margin: 10px 0;"><strong>Scheduled Time:</strong> ${formattedDateTime}</p>
                    ${
                      cancellationReason
                        ? `<p style="margin: 10px 0;"><strong>Reason:</strong> ${cancellationReason}</p>`
                        : ""
                    }
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

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
