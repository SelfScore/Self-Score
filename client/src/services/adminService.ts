import api from "../lib/api";

export interface AnalyticsSummary {
  totalUsers: number;
  newUsers: number;
  totalTestsCompleted: number;
  activeUsers: number;
  totalRevenue: number;
}

export interface ChartData {
  _id: string;
  count: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  charts: {
    dailyUsers: ChartData[];
    dailyTests: ChartData[];
  };
  period: string;
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  isVerified: boolean;
  purchasedLevels: {
    level2: { purchased: boolean; purchaseDate?: Date; paymentId?: string };
    level3: { purchased: boolean; purchaseDate?: Date; paymentId?: string };
    level4: { purchased: boolean; purchaseDate?: Date; paymentId?: string };
  };
  progress: {
    completedLevels: number[];
    highestUnlockedLevel: number;
    testScores: {
      level1?: number;
      level2?: number;
      level3?: number;
      level4?: number;
    };
  };
  lastActive: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UsersPagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: UsersPagination;
}

export interface UserDetailResponse {
  user: AdminUser;
  testHistory: any[];
  paymentHistory: any[];
  totalRevenue: number;
}

export const adminService = {
  // Get analytics data
  getAnalytics: async (
    period: "7" | "14" | "30" | "90" | "all" = "all"
  ): Promise<AnalyticsData> => {
    try {
      const response = await api.get(`/api/admin/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      throw error;
    }
  },

  // Get users list with pagination and search
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    sortBy: "latest" | "oldest" = "latest",
    filter: "all" | "purchased" | "unpurchased" = "all"
  ): Promise<UsersResponse> => {
    try {
      const response = await api.get(
        `/api/admin/users?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&filter=${filter}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  },

  // Get single user details
  getUserById: async (userId: string): Promise<UserDetailResponse> => {
    try {
      const response = await api.get(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      throw error;
    }
  },

  // Update user
  updateUser: async (
    userId: string,
    updates: Partial<AdminUser>
  ): Promise<AdminUser> => {
    try {
      const response = await api.put(`/api/admin/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    try {
      await api.delete(`/api/admin/users/${userId}`);
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  },

  // Get badge counts for sidebar
  getCounts: async (): Promise<{
    pendingReviews: number;
    unreadMessages: number;
    pendingConsultants: number;
  }> => {
    try {
      const response = await api.get("/api/admin/counts");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch counts:", error);
      throw error;
    }
  },

  // Consultant Management

  // Get consultants list with filters
  getConsultants: async (
    status: "all" | "pending" | "approved" | "rejected" = "all",
    search: string = "",
    sortBy: string = "createdAt",
    order: "asc" | "desc" = "desc"
  ): Promise<any> => {
    try {
      const response = await api.get(
        `/api/admin/consultants?status=${status}&search=${search}&sortBy=${sortBy}&order=${order}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch consultants:", error);
      throw error;
    }
  },

  // Get consultant by ID
  getConsultantById: async (consultantId: string): Promise<any> => {
    try {
      const response = await api.get(`/api/admin/consultants/${consultantId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch consultant:", error);
      throw error;
    }
  },

  // Approve consultant
  approveConsultant: async (consultantId: string): Promise<any> => {
    try {
      const response = await api.patch(
        `/api/admin/consultants/${consultantId}/approve`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to approve consultant:", error);
      throw error;
    }
  },

  // Reject consultant
  rejectConsultant: async (
    consultantId: string,
    rejectionReason: string
  ): Promise<any> => {
    try {
      const response = await api.patch(
        `/api/admin/consultants/${consultantId}/reject`,
        {
          rejectionReason,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to reject consultant:", error);
      throw error;
    }
  },
};
