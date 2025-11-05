import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import AdminModel from '../models/admin';
import { ApiResponse } from '../types/api';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export class AdminAuthController {
    // Admin Login
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                const response: ApiResponse = {
                    success: false,
                    message: "Email and password are required"
                };
                res.status(400).json(response);
                return;
            }

            // Find admin by email
            const admin = await AdminModel.findOne({ email: email.toLowerCase() });

            if (!admin) {
                const response: ApiResponse = {
                    success: false,
                    message: "Invalid credentials"
                };
                res.status(401).json(response);
                return;
            }

            // Verify password
            const isPasswordCorrect = await bcrypt.compare(password, admin.password);

            if (!isPasswordCorrect) {
                const response: ApiResponse = {
                    success: false,
                    message: "Invalid credentials"
                };
                res.status(401).json(response);
                return;
            }

            // Create JWT token with admin type
            const tokenPayload = {
                adminId: (admin._id as string).toString(),
                email: admin.email,
                username: admin.username,
                type: 'admin'  // Important: identifies this as admin token
            };

            const token = jwt.sign(tokenPayload, JWT_SECRET, {
                expiresIn: JWT_EXPIRE
            } as jwt.SignOptions);

            // Set HTTP-only cookie with different name for admin
            res.cookie('adminAuthToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/'
            });

            const response: ApiResponse = {
                success: true,
                message: "Admin login successful",
                data: {
                    adminId: (admin._id as string).toString(),
                    email: admin.email,
                    username: admin.username,
                    type: 'admin'
                }
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error in admin login:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }

    // Admin Logout
    static async logout(req: Request, res: Response): Promise<void> {
        try {
            // Clear admin auth cookie
            res.clearCookie('adminAuthToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/'
            });

            const response: ApiResponse = {
                success: true,
                message: "Admin logout successful"
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error in admin logout:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }

    // Get current admin info
    static async getCurrentAdmin(req: Request, res: Response): Promise<void> {
        try {
            const adminId = (req as any).admin?.adminId;

            if (!adminId) {
                const response: ApiResponse = {
                    success: false,
                    message: "Not authenticated"
                };
                res.status(401).json(response);
                return;
            }

            const admin = await AdminModel.findById(adminId).select('-password');

            if (!admin) {
                const response: ApiResponse = {
                    success: false,
                    message: "Admin not found"
                };
                res.status(404).json(response);
                return;
            }

            const response: ApiResponse = {
                success: true,
                message: "Admin info retrieved successfully",
                data: {
                    adminId: (admin._id as string).toString(),
                    email: admin.email,
                    username: admin.username,
                    type: 'admin'
                }
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error getting current admin:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }
}
