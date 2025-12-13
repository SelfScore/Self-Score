export enum BookingStatus {
    CREATED = 'CREATED',     // Booking created, awaiting payment
    PAID = 'PAID',          // Payment successful, confirmed
    CANCELLED = 'CANCELLED', // Cancelled by user or consultant
    // EXPIRED is computed: CREATED + 10 mins < current time
}

export enum SessionType {
    THIRTY_MIN = '30min',
    SIXTY_MIN = '60min',
    NINETY_MIN = '90min'
}

export interface GoogleCalendarCredentials {
    accessToken: string;
    refreshToken: string;
    expiryDate?: number;
    scope: string;
}

export interface ConsultantAvailability {
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    timeRanges: Array<{
        startTime: string; // HH:mm format in 24-hour (e.g., "09:00")
        endTime: string;   // HH:mm format in 24-hour (e.g., "17:00")
    }>;
    isAvailable: boolean;
}

export interface BookingSettings {
    // Slot configuration
    bufferBetweenSessions: number; // in minutes (5, 10, 15)
    
    // Booking window
    minAdvanceBookingHours: number; // default: 3 hours
    maxAdvanceBookingMonths: number; // default: 6 months
    
    // Meeting preferences
    autoCreateMeetLink: boolean; // Auto-generate Google Meet link
    meetingLocation?: string; // Custom location or "Google Meet"
}

export interface TimeSlot {
    start: Date; // UTC
    end: Date;   // UTC
    available: boolean;
    consultantId: string;
}

export interface BookingRequest {
    consultantId: string;
    userId: string;
    sessionType: SessionType;
    startTime: Date; // UTC
    endTime: Date;   // UTC
    userTimezone: string;
    consultantTimezone: string;
    userNotes?: string;
}

export interface GoogleCalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
    attendees?: Array<{
        email: string;
        displayName?: string;
    }>;
    hangoutLink?: string;
    conferenceData?: any;
}
