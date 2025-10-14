import { Request, Response } from 'express';
import UserModel from '../models/user';
import { ApiResponse } from '../types/api';

export class SubscriptionController {
    // Check purchased levels status (replaces subscription)
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

            const user = await UserModel.findById(userId).select('purchasedLevels progress');
            
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
                message: "Purchased levels status retrieved successfully",
                data: {
                    purchasedLevels: user.purchasedLevels,
                    progress: user.progress
                }
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error checking purchased levels status:", error);
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