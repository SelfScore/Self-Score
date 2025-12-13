import api from '../lib/api';

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  consultantId: string;
}

export interface Booking {
  _id: string;
  consultantId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
  };
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  sessionType: '30min' | '60min' | '90min';
  duration: number;
  startTime: Date;
  endTime: Date;
  userTimezone: string;
  consultantTimezone: string;
  status: 'CREATED' | 'PAID' | 'CANCELLED';
  meetingLink?: string;
  userNotes?: string;
  consultantNotes?: string;
  cancellationReason?: string;
  cancelledBy?: 'user' | 'consultant' | 'system';
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AvailabilityParams {
  consultantId: string;
  date: string; // YYYY-MM-DD format
  duration: number;
  timezone?: string;
}

export interface CreateBookingParams {
  consultantId: string;
  sessionType: '30min' | '60min' | '90min';
  startTime: string; // ISO string
  duration: number;
  userTimezone: string;
  userNotes?: string;
}

export interface ConfirmBookingParams {
  bookingId: string;
  paymentId?: string;
}

export interface CancelBookingParams {
  bookingId: string;
  cancellationReason?: string;
}

export const bookingService = {
  // Get available time slots for a consultant
  getAvailableSlots: async (params: AvailabilityParams): Promise<ApiResponse<{ slots: TimeSlot[]; count: number }>> => {
    try {
      const queryParams = new URLSearchParams({
        date: params.date,
        duration: params.duration.toString(),
        ...(params.timezone && { timezone: params.timezone })
      });
      
      const response = await api.get(`/api/booking/availability/${params.consultantId}?${queryParams}`);
      return response as unknown as ApiResponse<{ slots: TimeSlot[]; count: number }>;
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      throw error;
    }
  },

  // Create a new booking
  createBooking: async (params: CreateBookingParams): Promise<ApiResponse<{ booking: Booking }>> => {
    try {
      const response = await api.post('/api/booking/create', params);
      return response as unknown as ApiResponse<{ booking: Booking }>;
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    }
  },

  // Confirm booking after payment (for now, just marks as PAID without payment)
  confirmBooking: async (params: ConfirmBookingParams): Promise<ApiResponse<{ booking: Booking }>> => {
    try {
      const response = await api.post(`/api/booking/${params.bookingId}/confirm`, {
        paymentId: params.paymentId || 'manual-confirmation' // Placeholder for now
      });
      return response as unknown as ApiResponse<{ booking: Booking }>;
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      throw error;
    }
  },

  // Cancel a booking
  cancelBooking: async (params: CancelBookingParams): Promise<ApiResponse> => {
    try {
      const response = await api.post(`/api/booking/${params.bookingId}/cancel`, {
        cancellationReason: params.cancellationReason
      });
      return response as unknown as ApiResponse;
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  },

  // Get user's bookings
  getUserBookings: async (params?: { status?: string; upcoming?: boolean }): Promise<ApiResponse<Booking[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.upcoming !== undefined) queryParams.append('upcoming', params.upcoming.toString());
      
      const query = queryParams.toString() ? `?${queryParams}` : '';
      const response = await api.get(`/api/booking/user/my-bookings${query}`);
      return response as unknown as ApiResponse<Booking[]>;
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
      throw error;
    }
  },

  // Helper: Format date for API (YYYY-MM-DD)
  formatDateForAPI: (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Helper: Format time for display
  formatTime: (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  },

  // Helper: Format date for display
  formatDate: (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }
};
