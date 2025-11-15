import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    console.warn('⚠️  RESEND_API_KEY not found in environment variables. Email features will not work.');
}

export const resend = new Resend(resendApiKey || 'dummy-key');

// Email sender configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const APP_NAME = 'SelfScore';
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

// Send contact form notification to admin
export const sendContactNotificationEmail = async (data: {
    name: string;
    email: string;
    message: string;
    messageId: string;
}): Promise<boolean> => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    
    if (!adminEmail || adminEmail === 'onboarding@resend.dev') {
        console.warn('⚠️  ADMIN_EMAIL not configured. Skipping admin notification.');
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
