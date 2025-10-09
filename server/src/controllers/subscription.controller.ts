import { Request, Response } from 'express';
import UserModel from '../models/user';
import { ApiResponse } from '../types/api';

export class SubscriptionController {
    // Check current subscription status
    static async checkSubscriptionStatus(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            
            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not authenticated"
                };
                res.status(401).json(response);
                return;
            }

            const user = await UserModel.findById(userId).select('subscription');
            
            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found"
                };
                res.status(404).json(response);
                return;
            }

            const response: ApiResponse = {
                success: true,
                message: "Subscription status retrieved successfully",
                data: {
                    subscription: user.subscription
                }
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error checking subscription status:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }

    // Activate subscription (called after successful payment)
    static async activateSubscription(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { plan, paymentId, expiresAt } = req.body;
            
            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not authenticated"
                };
                res.status(401).json(response);
                return;
            }

            // Validate plan
            if (!plan || !['premium'].includes(plan)) {
                const response: ApiResponse = {
                    success: false,
                    message: "Invalid subscription plan"
                };
                res.status(400).json(response);
                return;
            }

            const user = await UserModel.findById(userId);
            
            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found"
                };
                res.status(404).json(response);
                return;
            }

            // Update subscription
            user.subscription.isActive = true;
            user.subscription.plan = plan;
            
            if (expiresAt) {
                user.subscription.expiresAt = new Date(expiresAt);
            } else {
                // Default to 24 months from now
                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 24);
                user.subscription.expiresAt = expiryDate;
            }

            await user.save();

            const response: ApiResponse = {
                success: true,
                message: "Subscription activated successfully",
                data: {
                    subscription: user.subscription,
                    paymentId
                }
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error activating subscription:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }
}

// Export individual functions for route handlers
export const checkSubscriptionStatus = SubscriptionController.checkSubscriptionStatus;
export const activateSubscription = SubscriptionController.activateSubscription;