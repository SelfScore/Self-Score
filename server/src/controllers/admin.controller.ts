import { Request, Response } from "express";
import UserModel from "../models/user";
import PaymentModel from "../models/payment";
import TestSubmissionModel from "../models/testSubmission";
import ContactMessageModel from "../models/contactMessage";
import AIInterviewModel from "../models/aiInterview";
import ConsultantModel from "../models/consultant";
import { ApiResponse } from "../types/api";
import {
  sendConsultantApprovalEmail,
  sendConsultantRejectionEmail,
} from "../lib/email";

export class AdminController {
  // Get analytics data for dashboard
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period } = req.query; // 7, 14, 30, or 'all'

      // Calculate date range based on period
      let startDate: Date | null = null;
      if (period && period !== "all") {
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
      const testsQuery = startDate ? { submittedAt: { $gte: startDate } } : {};
      const totalTestsCompleted = await TestSubmissionModel.countDocuments(
        testsQuery
      );

      // Active Users (users who completed at least one test in period)
      const activeUsersQuery = startDate
        ? [
            { $match: { submittedAt: { $gte: startDate } } },
            { $group: { _id: "$userId" } },
            { $count: "count" },
          ]
        : [{ $group: { _id: "$userId" } }, { $count: "count" }];

      const activeUsersResult = await TestSubmissionModel.aggregate(
        activeUsersQuery
      );
      const activeUsers =
        activeUsersResult.length > 0 ? activeUsersResult[0].count : 0;

      // Get daily breakdown for charts
      // For 'all', get data from the earliest record; otherwise use the specified days
      let chartStartDate: Date;
      if (period === "all") {
        // Get the earliest user registration date for true "all time" data
        const earliestUser = (await UserModel.findOne({ isVerified: true })
          .sort({ createdAt: 1 })
          .select("createdAt")
          .lean()) as { createdAt?: Date } | null;
        const earliestTest = (await TestSubmissionModel.findOne()
          .sort({ submittedAt: 1 })
          .select("submittedAt")
          .lean()) as { submittedAt?: Date } | null;

        const earliestDate =
          earliestUser?.createdAt || earliestTest?.submittedAt || new Date();
        chartStartDate = new Date(earliestDate);
      } else {
        const chartDays = parseInt(period as string) || 7;
        chartStartDate = new Date();
        chartStartDate.setDate(chartStartDate.getDate() - chartDays);
      }

      // Daily new users
      const dailyUsers = await UserModel.aggregate([
        { $match: { isVerified: true, createdAt: { $gte: chartStartDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Daily tests completed
      const dailyTests = await TestSubmissionModel.aggregate([
        { $match: { submittedAt: { $gte: chartStartDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Total Revenue
      const revenueQuery = startDate
        ? { status: "completed", createdAt: { $gte: startDate } }
        : { status: "completed" };

      const revenueResult = await PaymentModel.aggregate([
        { $match: revenueQuery },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const totalRevenue =
        revenueResult.length > 0 ? revenueResult[0].total : 0;

      const response: ApiResponse = {
        success: true,
        message: "Analytics data retrieved successfully",
        data: {
          summary: {
            totalUsers,
            newUsers: period === "all" ? totalUsers : newUsers,
            totalTestsCompleted,
            activeUsers,
            totalRevenue,
          },
          charts: {
            dailyUsers,
            dailyTests,
          },
          period: period || "all",
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to fetch analytics data",
      };
      res.status(500).json(response);
    }
  }

  // Get all users with pagination and search
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const sortBy = (req.query.sortBy as string) || "latest"; // 'latest' or 'oldest'
      const filter = (req.query.filter as string) || "all"; // 'all', 'purchased', 'unpurchased'

      const skip = (page - 1) * limit;

      // Build search query
      let searchQuery: any = search
        ? {
            $or: [
              { email: { $regex: search, $options: "i" } },
              { username: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      // Add filter query
      if (filter === "purchased") {
        searchQuery.$or = searchQuery.$or || [];
        searchQuery.$and = [
          searchQuery.$or.length > 0 ? { $or: searchQuery.$or } : {},
          {
            $or: [
              { "purchasedLevels.level2.purchased": true },
              { "purchasedLevels.level3.purchased": true },
              { "purchasedLevels.level4.purchased": true },
            ],
          },
        ];
        delete searchQuery.$or;
      } else if (filter === "unpurchased") {
        searchQuery.$and = searchQuery.$and || [];
        const baseQuery = searchQuery.$or ? { $or: searchQuery.$or } : {};
        searchQuery.$and = [
          baseQuery,
          { "purchasedLevels.level2.purchased": { $ne: true } },
          { "purchasedLevels.level3.purchased": { $ne: true } },
          { "purchasedLevels.level4.purchased": { $ne: true } },
        ];
        delete searchQuery.$or;
      }

      // Determine sort order
      const sortOrder = sortBy === "oldest" ? 1 : -1;

      // Get total count
      const totalUsers = await UserModel.countDocuments(searchQuery);

      // Get users with pagination
      const users = await UserModel.find(searchQuery)
        .select(
          "-password -verifyCode -verifyCodeExpiry -resetPasswordToken -resetPasswordExpiry"
        )
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean();

      // Enrich with last active date (from latest test submission)
      const enrichedUsers = await Promise.all(
        users.map(async (user) => {
          const lastTest = await TestSubmissionModel.findOne({
            userId: user._id,
          })
            .sort({ submittedAt: -1 })
            .select("submittedAt")
            .lean();

          return {
            ...user,
            lastActive:
              lastTest?.submittedAt || (user as any).createdAt || new Date(),
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
            limit,
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to fetch users",
      };
      res.status(500).json(response);
    }
  }

  // Get single user details
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const user = await UserModel.findById(userId)
        .select(
          "-password -verifyCode -verifyCodeExpiry -resetPasswordToken -resetPasswordExpiry"
        )
        .lean();

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
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
        .filter((p) => p.status === "completed")
        .reduce((sum, payment) => sum + payment.amount, 0);

      // Get last active date
      const lastTest =
        testHistory.length > 0
          ? testHistory[0].submittedAt
          : (user as any).createdAt || new Date();

      const response: ApiResponse = {
        success: true,
        message: "User details retrieved successfully",
        data: {
          user: {
            ...user,
            lastActive: lastTest,
          },
          testHistory,
          paymentHistory,
          totalRevenue,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching user details:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to fetch user details",
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
      ).select(
        "-password -verifyCode -verifyCodeExpiry -resetPasswordToken -resetPasswordExpiry"
      );

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: "User updated successfully",
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating user:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to update user",
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
          message: "User not found",
        };
        res.status(404).json(response);
        return;
      }

      // Optional: Also delete user's related data
      await TestSubmissionModel.deleteMany({ userId });
      await PaymentModel.updateMany(
        { userId },
        { $set: { status: "refunded" } }
      );

      const response: ApiResponse = {
        success: true,
        message: "User deleted successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error deleting user:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to delete user",
      };
      res.status(500).json(response);
    }
  }

  // Get all contact messages with pagination
  static async getContactMessages(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string; // 'read', 'unread', 'all', or undefined for all
      const sortBy = (req.query.sortBy as string) || "latest"; // 'latest' or 'oldest'
      const search = (req.query.search as string) || ""; // search by name or email

      const skip = (page - 1) * limit;

      // Build query
      let query: any = {};

      // Add status filter (if not 'all')
      if (status && status !== "all") {
        query.status = status;
      }

      // Add search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Determine sort order
      const sortOrder = sortBy === "oldest" ? 1 : -1;

      // Get total count
      const totalMessages = await ContactMessageModel.countDocuments(query);

      // Get messages with pagination
      const messages = await ContactMessageModel.find(query)
        .sort({ createdAt: sortOrder })
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
            totalPages: Math.ceil(totalMessages / limit),
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to fetch contact messages",
      };
      res.status(500).json(response);
    }
  }

  // Get single contact message by ID
  static async getContactMessageById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { messageId } = req.params;

      const message = await ContactMessageModel.findById(messageId);

      if (!message) {
        const response: ApiResponse = {
          success: false,
          message: "Message not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: "Message retrieved successfully",
        data: message,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching message:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to fetch message",
      };
      res.status(500).json(response);
    }
  }

  // Update contact message (mark as read, add reply, or delete)
  static async updateContactMessage(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { messageId } = req.params;
      const { status, adminReply, action } = req.body;

      // Handle delete action
      if (action === "delete") {
        const deletedMessage = await ContactMessageModel.findByIdAndDelete(
          messageId
        );

        if (!deletedMessage) {
          const response: ApiResponse = {
            success: false,
            message: "Message not found",
          };
          res.status(404).json(response);
          return;
        }

        const response: ApiResponse = {
          success: true,
          message: "Message deleted successfully",
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
          message: "Message not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: "Message updated successfully",
        data: message,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating message:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to update message",
      };
      res.status(500).json(response);
    }
  }

  // Get badge counts for sidebar
  static async getCounts(req: Request, res: Response): Promise<void> {
    try {
      // Count pending Level 4 reviews
      const pendingReviews = await AIInterviewModel.countDocuments({
        level: 4,
        status: "PENDING_REVIEW",
      });

      // Count unread messages
      const unreadMessages = await ContactMessageModel.countDocuments({
        status: "unread",
      });

      // Count pending consultant applications
      const pendingConsultants = await ConsultantModel.countDocuments({
        applicationStatus: "pending",
      });

      const response: ApiResponse = {
        success: true,
        message: "Counts retrieved successfully",
        data: {
          pendingReviews,
          unreadMessages,
          pendingConsultants,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching counts:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to fetch counts",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get all consultants with filters
   */
  static async getConsultants(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        search,
        sortBy = "createdAt",
        order = "desc",
      } = req.query;

      // Build query
      const query: any = {};

      // Exclude draft applications by default (incomplete registrations)
      query.applicationStatus = { $ne: "draft" };

      // Filter by status
      if (status && status !== "all") {
        query.applicationStatus = status;
      }

      // Search by name or email
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Build sort
      const sortOrder = order === "asc" ? 1 : -1;
      const sortOptions: any = { [sortBy as string]: sortOrder };

      // Execute query
      const consultants = await ConsultantModel.find(query)
        .select("-password -verifyCode")
        .sort(sortOptions);

      // Get counts for each status (excluding drafts)
      const pendingCount = await ConsultantModel.countDocuments({
        applicationStatus: "pending",
      });
      const approvedCount = await ConsultantModel.countDocuments({
        applicationStatus: "approved",
      });
      const rejectedCount = await ConsultantModel.countDocuments({
        applicationStatus: "rejected",
      });

      const response: ApiResponse = {
        success: true,
        message: "Consultants retrieved successfully",
        data: {
          consultants,
          counts: {
            all: consultants.length,
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching consultants:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to fetch consultants",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get consultant by ID
   */
  static async getConsultantById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const consultant = await ConsultantModel.findById(id)
        .select("-password -verifyCode")
        .populate("reviewedBy", "email username");

      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: "Consultant retrieved successfully",
        data: consultant,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching consultant:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to fetch consultant",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Approve consultant application
   */
  static async approveConsultant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = (req as any).admin?.adminId;

      const consultant = await ConsultantModel.findById(id);

      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant not found",
        };
        res.status(404).json(response);
        return;
      }

      // Update consultant status
      consultant.applicationStatus = "approved";
      consultant.reviewedAt = new Date();
      consultant.reviewedBy = adminId;
      consultant.rejectionReason = undefined; // Clear any previous rejection reason

      await consultant.save();

      // Send approval email
      const emailSent = await sendConsultantApprovalEmail(
        consultant.email,
        consultant.firstName
      );

      if (!emailSent) {
        console.warn("⚠️  Failed to send approval email to consultant");
      }

      const response: ApiResponse = {
        success: true,
        message: "Consultant approved successfully",
        data: {
          consultantId: consultant._id,
          applicationStatus: consultant.applicationStatus,
          emailSent,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error approving consultant:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to approve consultant",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Reject consultant application
   */
  static async rejectConsultant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const adminId = (req as any).admin?.adminId;

      if (!rejectionReason || !rejectionReason.trim()) {
        const response: ApiResponse = {
          success: false,
          message: "Rejection reason is required",
        };
        res.status(400).json(response);
        return;
      }

      const consultant = await ConsultantModel.findById(id);

      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant not found",
        };
        res.status(404).json(response);
        return;
      }

      // Update consultant status
      consultant.applicationStatus = "rejected";
      consultant.reviewedAt = new Date();
      consultant.reviewedBy = adminId;
      consultant.rejectionReason = rejectionReason;

      await consultant.save();

      // Send rejection email with reason
      const emailSent = await sendConsultantRejectionEmail(
        consultant.email,
        consultant.firstName,
        rejectionReason
      );

      if (!emailSent) {
        console.warn("⚠️  Failed to send rejection email to consultant");
      }

      const response: ApiResponse = {
        success: true,
        message: "Consultant application rejected",
        data: {
          consultantId: consultant._id,
          applicationStatus: consultant.applicationStatus,
          emailSent,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error rejecting consultant:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to reject consultant",
      };
      res.status(500).json(response);
    }
  }
}
