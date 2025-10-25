import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import UserModel from '../models/user';
import { signUpSchema } from '../schemas/signUpSchema';
import { loginSchema } from '../schemas/loginSchema';
import { verifyEmailSchema } from '../schemas/verifyEmailSchema';
import { resendVerificationSchema } from '../schemas/resendVerificationSchema';
import { forgotPasswordSchema } from '../schemas/forgotPasswordSchema';
import { resetPasswordSchema } from '../schemas/resetPasswordSchema';
import { checkDatabaseConnection } from '../lib/dbUtils';
import { generateToken, getCookieOptions } from '../lib/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email';
import { ApiResponse, UserResponse } from '../types/api';

export class AuthController {
    static async signUp(req: Request, res: Response): Promise<void> {        
        if (!checkDatabaseConnection()) {
            const response: ApiResponse = {
                success: false,
                message: "Database connection not available. Please try again later."
            };
            res.status(503).json(response);
            return;
        }
        
        try {
            const { username, email, countryCode, phoneNumber, password, confirmPassword } = req.body;
            
            const validationResult = signUpSchema.safeParse({
                username,
                email,
                countryCode,
                phoneNumber,
                password,
                confirmPassword
            });

            if (!validationResult.success) {
                const response: ApiResponse = {
                    success: false,
                    message: "Validation failed",
                    errors: validationResult.error.issues
                };
                res.status(400).json(response);
                return;
            }

            const existingUser = await UserModel.findOne({ email , isVerified: true});

            if (existingUser) {
                const response: ApiResponse = {
                    success: false,
                    message: "User with this email already exists"
                };
                res.status(400).json(response);
                return;
            }

            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            await UserModel.deleteMany({ email, isVerified: false });

            const newUser = new UserModel({
                username,
                email,
                countryCode,
                phoneNumber,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate, 
                isVerified: false,
                purchasedLevels: {
                    level2: { purchased: false },
                    level3: { purchased: false },
                    level4: { purchased: false }
                },
                progress: {
                    completedLevels: [],
                    highestUnlockedLevel: 1,
                    testScores: {}
                }
            });

            await newUser.save();

            // Send verification email using Resend
            const emailSent = await sendVerificationEmail(newUser.email, newUser.username, verifyCode);
            
            if (!emailSent) {
                console.warn('⚠️  Failed to send verification email, but user was created');
            }

            const userData: UserResponse = {
                userId: (newUser._id as string).toString(),
                email: newUser.email,
                username: newUser.username,
                countryCode: newUser.countryCode,
                phoneNumber: newUser.phoneNumber,
                purchasedLevels: newUser.purchasedLevels,
                progress: newUser.progress
            };

            const response: ApiResponse<UserResponse> = {
                success: true,
                message: emailSent 
                    ? "User registered successfully. Please check your email for verification code."
                    : "User registered successfully. Verification email could not be sent.",
                data: userData
            };

            res.status(201).json(response);

        } catch (error) {
            console.error("Error in sign-up route:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }

    static async login(req: Request, res: Response): Promise<void> {        
        try {
            const { email, password } = req.body;

            const validationResult = loginSchema.safeParse({ email, password });

            if (!validationResult.success) {
                const response: ApiResponse = {
                    success: false,
                    message: "Validation failed",
                    errors: validationResult.error.issues
                };
                res.status(400).json(response);
                return;
            }

            const user = await UserModel.findOne({ email });

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User with this email does not exist"
                };
                res.status(404).json(response);
                return;
            }

            if (!user.isVerified) {
                const response: ApiResponse = {
                    success: false,
                    message: "Please verify your email before logging in"
                };
                res.status(401).json(response);
                return;
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (!isPasswordCorrect) {
                const response: ApiResponse = {
                    success: false,
                    message: "Incorrect password"
                };
                res.status(401).json(response);
                return;
            }

            const userData: UserResponse = {
                userId: (user._id as string).toString(),
                email: user.email,
                username: user.username,
                phoneNumber: user.phoneNumber,
                purchasedLevels: user.purchasedLevels,
                progress: user.progress
            };

            const token = generateToken(userData);
            const cookieOptions = getCookieOptions();
            res.cookie('authToken', token, cookieOptions);

            const response: ApiResponse<UserResponse> = {
                success: true,
                message: "Login successful",
                data: userData
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error in login route:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }

    static async verifyEmail(req: Request, res: Response): Promise<void> {        
        try {
            const { email, verifyCode } = req.body;

            const validationResult = verifyEmailSchema.safeParse({ email, verifyCode });

            if (!validationResult.success) {
                const response: ApiResponse = {
                    success: false,
                    message: "Validation failed",
                    errors: validationResult.error.issues
                };
                res.status(400).json(response);
                return;
            }

            const user = await UserModel.findOne({ email });

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User with this email does not exist"
                };
                res.status(404).json(response);
                return;
            }

            if (user.isVerified) {
                const response: ApiResponse = {
                    success: false,
                    message: "User is already verified"
                };
                res.status(400).json(response);
                return;
            }

            if (user.verifyCodeExpiry < new Date()) {
                const response: ApiResponse = {
                    success: false,
                    message: "Verification code has expired. Please request a new one"
                };
                res.status(400).json(response);
                return;
            }

            const isValidCode = user.verifyCode === verifyCode;
            
            if (!isValidCode) {
                const response: ApiResponse = {
                    success: false,
                    message: "Invalid verification code"
                };
                res.status(400).json(response);
                return;
            }

            user.isVerified = true;
            user.verifyCode = "VERIFIED";
            user.verifyCodeExpiry = new Date(0);
            await user.save();

            const userData: UserResponse = {
                userId: (user._id as string).toString(),
                email: user.email,
                username: user.username,
                phoneNumber: user.phoneNumber,
                purchasedLevels: user.purchasedLevels,
                progress: user.progress
            };

            const token = generateToken(userData);
            const cookieOptions = getCookieOptions();
            res.cookie('authToken', token, cookieOptions);

            const response: ApiResponse<UserResponse> = {
                success: true,
                message: "Email verified successfully. You are now logged in.",
                data: userData
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error in verify-email route:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }

    static async resendVerification(req: Request, res: Response): Promise<void> {        
        try {
            const { email } = req.body;

            const validationResult = resendVerificationSchema.safeParse({ email });

            if (!validationResult.success) {
                const response: ApiResponse = {
                    success: false,
                    message: "Validation failed",
                    errors: validationResult.error.issues
                };
                res.status(400).json(response);
                return;
            }

            const user = await UserModel.findOne({ email });

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User with this email does not exist"
                };
                res.status(404).json(response);
                return;
            }

            if (user.isVerified) {
                const response: ApiResponse = {
                    success: false,
                    message: "User is already verified"
                };
                res.status(400).json(response);
                return;
            }

            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            user.verifyCode = verifyCode;
            user.verifyCodeExpiry = expiryDate;
            await user.save();

            // Send verification email using Resend
            const emailSent = await sendVerificationEmail(user.email, user.username, verifyCode);

            const response: ApiResponse = {
                success: true,
                message: emailSent 
                    ? "Verification code resent successfully. Please check your email."
                    : "Verification code generated but email could not be sent. Please try again."
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error in resend verification route:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }

    static async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not authenticated"
                };
                res.status(401).json(response);
                return;
            }

            const user = await UserModel.findById(req.user.userId).select('-password -verifyCode');

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found"
                };
                res.status(404).json(response);
                return;
            }

            if (!user.isVerified) {
                const response: ApiResponse = {
                    success: false,
                    message: "User email not verified"
                };
                res.status(401).json(response);
                return;
            }

            const userData: UserResponse = {
                userId: (user._id as string).toString(),
                email: user.email,
                username: user.username,
                phoneNumber: user.phoneNumber,
                purchasedLevels: user.purchasedLevels,
                progress: user.progress
            };

            const response: ApiResponse<UserResponse> = {
                success: true,
                message: "Current user retrieved successfully",
                data: userData
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error in get current user route:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }

    static async logout(req: Request, res: Response): Promise<void> {
        try {
            res.clearCookie('authToken');

            const response: ApiResponse = {
                success: true,
                message: "Logged out successfully"
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error in logout route:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }

    // Forgot Password - Send reset link
    static async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            const validationResult = forgotPasswordSchema.safeParse({ email });

            if (!validationResult.success) {
                const response: ApiResponse = {
                    success: false,
                    message: "Validation failed",
                    errors: validationResult.error.issues
                };
                res.status(400).json(response);
                return;
            }

            const user = await UserModel.findOne({ email });

            // Return error if user doesn't exist
            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User with this email does not exist"
                };
                res.status(404).json(response);
                return;
            }

            if (!user.isVerified) {
                const response: ApiResponse = {
                    success: false,
                    message: "Please verify your email before resetting password"
                };
                res.status(400).json(response);
                return;
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1); // 1 hour expiry

            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpiry = expiryDate;
            await user.save();

            // Send password reset email
            const emailSent = await sendPasswordResetEmail(user.email, user.username, resetToken);

            const response: ApiResponse = {
                success: true,
                message: emailSent 
                    ? "Password reset link has been sent to your email."
                    : "Reset token generated but email could not be sent. Please try again."
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error in forgot password route:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }

    // Reset Password - Update password with token
    static async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, password, confirmPassword } = req.body;

            const validationResult = resetPasswordSchema.safeParse({ token, password, confirmPassword });

            if (!validationResult.success) {
                const response: ApiResponse = {
                    success: false,
                    message: "Validation failed",
                    errors: validationResult.error.issues
                };
                res.status(400).json(response);
                return;
            }

            // Hash the token to compare with stored hash
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            const user = await UserModel.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpiry: { $gt: new Date() } // Token must not be expired
            });

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "Invalid or expired reset token"
                };
                res.status(400).json(response);
                return;
            }

            // Update password
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiry = undefined;
            await user.save();

            const response: ApiResponse = {
                success: true,
                message: "Password reset successfully. You can now log in with your new password."
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error in reset password route:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }
}
