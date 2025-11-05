import { Request, Response } from 'express';
import UserModel from '../models/user';
import PaymentModel from '../models/payment';
import TestSubmissionModel from '../models/testSubmission';
import ContactMessageModel from '../models/contactMessage';
import { ApiResponse } from '../types/api';

export class AdminController {
    // Get analytics data for dashboard
    static async getAnalytics(req: Request, res: Response): Promise<void> {
        try {
            const { period } = req.query; // 7, 14, 30, or 'all'

            // Calculate date range based on period
            let startDate: Date | null = null;
            if (period && period !== 'all') {
                const days = parseInt(period as string);
                startDate = new Date();
                startDate.setDate(startDate.getDate() - days);
            }

            // Total Users (all time)
            const totalUsers = await UserModel.countDocuments({ isVerified: true });

            // New Users Registered in period
            const newUsersQuery = startDate 
                ? { isVerified: true, createdAt: { $gte: startDate } }
                : { isVerified: true };
            const newUsers = await UserModel.countDocuments(newUsersQuery);

            // Total Tests Completed in period
            const testsQuery = startDate 
                ? { submittedAt: { $gte: startDate } }
                : {};
            const totalTestsCompleted = await TestSubmissionModel.countDocuments(testsQuery);

            // Active Users (users who completed at least one test in period)
            const activeUsersQuery = startDate
                ? [
                    { $match: { submittedAt: { $gte: startDate } } },
                    { $group: { _id: "$userId" } },
                    { $count: "count" }
                ]
                : [
                    { $group: { _id: "$userId" } },
                    { $count: "count" }
                ];
            
            const activeUsersResult = await TestSubmissionModel.aggregate(activeUsersQuery);
            const activeUsers = activeUsersResult.length > 0 ? activeUsersResult[0].count : 0;

            // Get daily breakdown for charts (last 30 days max)
            const chartDays = period === 'all' ? 30 : parseInt(period as string) || 7;
            const chartStartDate = new Date();
            chartStartDate.setDate(chartStartDate.getDate() - chartDays);

            // Daily new users
            const dailyUsers = await UserModel.aggregate([
                { $match: { isVerified: true, createdAt: { $gte: chartStartDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Daily tests completed
            const dailyTests = await TestSubmissionModel.aggregate([
                { $match: { submittedAt: { $gte: chartStartDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Total Revenue
            const revenueQuery = startDate
                ? { status: 'completed', createdAt: { $gte: startDate } }
                : { status: 'completed' };
            
            const revenueResult = await PaymentModel.aggregate([
                { $match: revenueQuery },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
            
            const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

            const response: ApiResponse = {
                success: true,
                message: "Analytics data retrieved successfully",
                data: {
                    summary: {
                        totalUsers,
                        newUsers: period === 'all' ? totalUsers : newUsers,
                        totalTestsCompleted,
                        activeUsers,
                        totalRevenue
                    },
                    charts: {
                        dailyUsers,
                        dailyTests
                    },
                    period: period || 'all'
                }
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error fetching analytics:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to fetch analytics data"
            };
            res.status(500).json(response);
        }
    }

    // Get all users with pagination and search
    static async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';

            const skip = (page - 1) * limit;

            // Build search query
            const searchQuery = search
                ? {
                    $or: [
                        { email: { $regex: search, $options: 'i' } },
                        { username: { $regex: search, $options: 'i' } }
                    ]
                }
                : {};

            // Get total count
            const totalUsers = await UserModel.countDocuments(searchQuery);

            // Get users with pagination
            const users = await UserModel.find(searchQuery)
                .select('-password -verifyCode -verifyCodeExpiry -resetPasswordToken -resetPasswordExpiry')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            // Enrich with last active date (from latest test submission)
            const enrichedUsers = await Promise.all(
                users.map(async (user) => {
                    const lastTest = await TestSubmissionModel.findOne({ userId: user._id })
                        .sort({ submittedAt: -1 })
                        .select('submittedAt')
                        .lean();

                    return {
                        ...user,
                        lastActive: lastTest?.submittedAt || (user as any).createdAt || new Date()
                    };
                })
            );

            const response: ApiResponse = {
                success: true,
                message: "Users retrieved successfully",
                data: {
                    users: enrichedUsers,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalUsers / limit),
                        totalUsers,
                        limit
                    }
                }
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error fetching users:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to fetch users"
            };
            res.status(500).json(response);
        }
    }

    // Get single user details
    static async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            const user = await UserModel.findById(userId)
                .select('-password -verifyCode -verifyCodeExpiry -resetPasswordToken -resetPasswordExpiry')
                .lean();

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found"
                };
                res.status(404).json(response);
                return;
            }

            // Get user's test history
            const testHistory = await TestSubmissionModel.find({ userId })
                .sort({ submittedAt: -1 })
                .lean();

            // Get user's payment history
            const paymentHistory = await PaymentModel.find({ userId })
                .sort({ createdAt: -1 })
                .lean();

            // Calculate total revenue from this user
            const totalRevenue = paymentHistory
                .filter(p => p.status === 'completed')
                .reduce((sum, payment) => sum + payment.amount, 0);

            // Get last active date
            const lastTest = testHistory.length > 0 ? testHistory[0].submittedAt : (user as any).createdAt || new Date();

            const response: ApiResponse = {
                success: true,
                message: "User details retrieved successfully",
                data: {
                    user: {
                        ...user,
                        lastActive: lastTest
                    },
                    testHistory,
                    paymentHistory,
                    totalRevenue
                }
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error fetching user details:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to fetch user details"
            };
            res.status(500).json(response);
        }
    }

    // Update user
    static async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const updates = req.body;

            // Don't allow updating sensitive fields
            delete updates.password;
            delete updates.verifyCode;
            delete updates.verifyCodeExpiry;
            delete updates.resetPasswordToken;
            delete updates.resetPasswordExpiry;

            const user = await UserModel.findByIdAndUpdate(
                userId,
                { $set: updates },
                { new: true, runValidators: true }
            ).select('-password -verifyCode -verifyCodeExpiry -resetPasswordToken -resetPasswordExpiry');

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
                message: "User updated successfully",
                data: user
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error updating user:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to update user"
            };
            res.status(500).json(response);
        }
    }

    // Delete user
    static async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            const user = await UserModel.findByIdAndDelete(userId);

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found"
                };
                res.status(404).json(response);
                return;
            }

            // Optional: Also delete user's related data
            await TestSubmissionModel.deleteMany({ userId });
            await PaymentModel.updateMany(
                { userId },
                { $set: { status: 'refunded' } }
            );

            const response: ApiResponse = {
                success: true,
                message: "User deleted successfully"
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error deleting user:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to delete user"
            };
            res.status(500).json(response);
        }
    }

    // Get all contact messages with pagination
    static async getContactMessages(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string; // 'read', 'unread', or undefined for all

            const skip = (page - 1) * limit;

            // Build query
            const query = status ? { status } : {};

            // Get total count
            const totalMessages = await ContactMessageModel.countDocuments(query);

            // Get messages with pagination
            const messages = await ContactMessageModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const response: ApiResponse = {
                success: true,
                message: "Contact messages retrieved successfully",
                data: {
                    messages,
                    pagination: {
                        page,
                        limit,
                        total: totalMessages,
                        totalPages: Math.ceil(totalMessages / limit)
                    }
                }
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error fetching contact messages:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to fetch contact messages"
            };
            res.status(500).json(response);
        }
    }

    // Get single contact message by ID
    static async getContactMessageById(req: Request, res: Response): Promise<void> {
        try {
            const { messageId } = req.params;

            const message = await ContactMessageModel.findById(messageId);

            if (!message) {
                const response: ApiResponse = {
                    success: false,
                    message: "Message not found"
                };
                res.status(404).json(response);
                return;
            }

            const response: ApiResponse = {
                success: true,
                message: "Message retrieved successfully",
                data: message
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error fetching message:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to fetch message"
            };
            res.status(500).json(response);
        }
    }

    // Update contact message (mark as read, add reply, or delete)
    static async updateContactMessage(req: Request, res: Response): Promise<void> {
        try {
            const { messageId } = req.params;
            const { status, adminReply, action } = req.body;

            // Handle delete action
            if (action === 'delete') {
                const deletedMessage = await ContactMessageModel.findByIdAndDelete(messageId);

                if (!deletedMessage) {
                    const response: ApiResponse = {
                        success: false,
                        message: "Message not found"
                    };
                    res.status(404).json(response);
                    return;
                }

                const response: ApiResponse = {
                    success: true,
                    message: "Message deleted successfully"
                };
                res.status(200).json(response);
                return;
            }

            // Update message
            const updateData: any = {};
            if (status) updateData.status = status;
            if (adminReply !== undefined) updateData.adminReply = adminReply;

            const message = await ContactMessageModel.findByIdAndUpdate(
                messageId,
                updateData,
                { new: true }
            );

            if (!message) {
                const response: ApiResponse = {
                    success: false,
                    message: "Message not found"
                };
                res.status(404).json(response);
                return;
            }

            const response: ApiResponse = {
                success: true,
                message: "Message updated successfully",
                data: message
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error updating message:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to update message"
            };
            res.status(500).json(response);
        }
    }
}
