import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    console.warn('⚠️  RESEND_API_KEY not found in environment variables. Email features will not work.');
}

export const resend = new Resend(resendApiKey || 'dummy-key');

// Email sender configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const APP_NAME = 'LifeScore';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

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
            console.error('❌ Resend Error:', error);
            return false;
        }

        console.log('✅ Email sent successfully:', data);
        return true;
    } catch (error) {
        console.error('❌ Failed to send email:', error);
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
