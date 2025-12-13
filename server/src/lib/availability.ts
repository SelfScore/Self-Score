import { googleCalendarService } from '../lib/googleCalendar';
import ConsultantModel, { Consultant } from '../models/consultant';
import BookingModel from '../models/booking';
import { TimeSlot } from '../types/booking.types';
import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz';
import { parseISO, startOfDay, endOfDay } from 'date-fns';

export class AvailabilityService {
    /**
     * Generate available time slots for a consultant
     */
    async getAvailableSlots(
        consultantId: string,
        date: Date, // Date in user's timezone
        durationMinutes: number,
        userTimezone: string
    ): Promise<TimeSlot[]> {
        // Fetch consultant with tokens
        const consultant = await ConsultantModel.findById(consultantId)
            .select('+googleCalendar.accessToken +googleCalendar.refreshToken');

        if (!consultant) {
            throw new Error('Consultant not found');
        }

        if (!consultant.googleCalendar?.isConnected) {
            throw new Error('Consultant has not connected their Google Calendar');
        }

        if (!consultant.bookingSettings || !consultant.bookingSettings.availability.length) {
            throw new Error('Consultant has not configured their availability');
        }

        // Check if consultant offers this session duration
        const offersDuration = consultant.services.some(
            service => service.duration === durationMinutes && service.enabled
        );

        if (!offersDuration) {
            throw new Error(`Consultant does not offer ${durationMinutes}-minute sessions`);
        }

        // Get consultant's timezone
        const consultantTimezone = consultant.bookingSettings.timezone || 'UTC';

        // Ensure valid access token
        const { accessToken } = await googleCalendarService.ensureValidToken(
            consultant.googleCalendar.accessToken!,
            consultant.googleCalendar.refreshToken!,
            consultant.googleCalendar.tokenExpiry!
        );

        // Update token if refreshed
        if (accessToken !== consultant.googleCalendar.accessToken) {
            consultant.googleCalendar.accessToken = accessToken;
            await consultant.save();
        }

        // Get day of week (0 = Sunday, 6 = Saturday)
        const dayOfWeek = date.getDay();

        // Check if consultant is available on this day
        const dayAvailability = consultant.bookingSettings.availability.find(
            a => a.dayOfWeek === dayOfWeek && a.isAvailable
        );

        if (!dayAvailability) {
            return []; // Consultant not available on this day
        }

        // Handle backward compatibility: convert old schema to new schema
        let timeRanges: Array<{ startTime: string; endTime: string }>;
        if ((dayAvailability as any).timeRanges) {
            // New schema with timeRanges array
            timeRanges = (dayAvailability as any).timeRanges;
        } else if ((dayAvailability as any).startTime && (dayAvailability as any).endTime) {
            // Old schema with direct startTime/endTime - convert to array
            timeRanges = [{
                startTime: (dayAvailability as any).startTime,
                endTime: (dayAvailability as any).endTime
            }];
        } else {
            return []; // No time ranges available
        }

        if (!timeRanges || timeRanges.length === 0) {
            return []; // No time ranges configured
        }

        // Apply minimum advance booking buffer (e.g., 3 hours from now)
        const minBookingTime = new Date();
        minBookingTime.setHours(minBookingTime.getHours() + consultant.bookingSettings.minAdvanceBookingHours);

        // Get existing bookings from our database
        // Use startOfDay and endOfDay in UTC to capture all bookings for the date
        const startOfDayUtc = startOfDay(date);
        const endOfDayUtc = endOfDay(date);

        const existingBookings = await BookingModel.find({
            consultantId: consultantId,
            startTime: { $gte: startOfDayUtc, $lt: endOfDayUtc },
            status: { $in: ['CREATED', 'PAID'] } // Only active bookings
        });

        // Process each time range for this day
        const allSlots: TimeSlot[] = [];
        
        for (const timeRange of timeRanges) {
            // Convert start and end times to UTC dates
            const startDateTime = this.combineDateTime(date, timeRange.startTime, consultantTimezone);
            const endDateTime = this.combineDateTime(date, timeRange.endTime, consultantTimezone);

            const effectiveStartTime = startDateTime < minBookingTime ? minBookingTime : startDateTime;

            // Skip if effective start is after end time
            if (effectiveStartTime >= endDateTime) {
                continue;
            }

            // Get busy slots from Google Calendar for this time range
            const busySlots = await googleCalendarService.getFreeBusy(
                accessToken,
                consultant.googleCalendar.calendarId!,
                effectiveStartTime,
                endDateTime
            );

            // Merge busy slots from Google Calendar and our bookings
            const allBusySlots = [
                ...busySlots,
                ...existingBookings.map(b => ({
                    start: b.startTime,
                    end: b.endTime
                }))
            ];

            // Generate time slots for this time range
            const slots = this.generateTimeSlots(
                effectiveStartTime,
                endDateTime,
                durationMinutes,
                consultant.bookingSettings.bufferBetweenSessions,
                allBusySlots,
                consultantId
            );

            allSlots.push(...slots);
        }

        // Convert slot times from UTC to user's timezone for display
        // The times are stored as UTC Date objects but will be formatted in user's timezone on frontend
        const slotsInUserTimezone = allSlots.map(slot => ({
            ...slot,
            start: toZonedTime(slot.start, userTimezone),
            end: toZonedTime(slot.end, userTimezone)
        }));

        return slotsInUserTimezone;
    }

    /**
     * Combine date with time string to create UTC Date
     * Properly handles timezone conversion including DST
     */
    private combineDateTime(date: Date, timeString: string, timezone: string): Date {
        const [hours, minutes] = timeString.split(':').map(Number);
        
        // Create ISO date string in YYYY-MM-DD format
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
        const dateTimeStr = `${year}-${month}-${day}T${timeStr}`;
        
        // Convert from consultant's timezone to UTC
        // This automatically handles DST transitions
        return fromZonedTime(dateTimeStr, timezone);
    }

    /**
     * Generate time slots based on availability and busy times
     */
    private generateTimeSlots(
        startTime: Date,
        endTime: Date,
        sessionDuration: number,
        buffer: number,
        busySlots: Array<{ start: Date; end: Date }>,
        consultantId: string
    ): TimeSlot[] {
        const slots: TimeSlot[] = [];
        let currentTime = new Date(startTime);

        while (currentTime.getTime() + sessionDuration * 60000 <= endTime.getTime()) {
            const slotEnd = new Date(currentTime.getTime() + sessionDuration * 60000);

            // Check if this slot conflicts with any busy time
            const isAvailable = !busySlots.some(busy => {
                return (
                    (currentTime >= busy.start && currentTime < busy.end) ||
                    (slotEnd > busy.start && slotEnd <= busy.end) ||
                    (currentTime <= busy.start && slotEnd >= busy.end)
                );
            });

            slots.push({
                start: new Date(currentTime),
                end: new Date(slotEnd),
                available: isAvailable,
                consultantId
            });

            // Move to next slot (session duration + buffer)
            // Each slot is spaced by the full session duration plus buffer time
            currentTime = new Date(currentTime.getTime() + (sessionDuration + buffer) * 60000);
        }

        return slots;
    }

    /**
     * Check if a specific time slot is available
     */
    async isSlotAvailable(
        consultantId: string,
        startTime: Date,
        duration: number,
        excludeBookingId?: string
    ): Promise<boolean> {
        const endTime = new Date(startTime.getTime() + duration * 60000);

        // Build query to check against our database
        const query: any = {
            consultantId: consultantId,
            status: { $in: ['CREATED', 'PAID'] },
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        };

        // Exclude specific booking if provided (when confirming a CREATED booking)
        if (excludeBookingId) {
            query._id = { $ne: excludeBookingId };
        }

        const existingBooking = await BookingModel.findOne(query);

        if (existingBooking) {
            return false;
        }

        // Check against Google Calendar
        const consultant = await ConsultantModel.findById(consultantId)
            .select('+googleCalendar.accessToken +googleCalendar.refreshToken');

        if (!consultant?.googleCalendar?.isConnected) {
            return false;
        }

        const { accessToken } = await googleCalendarService.ensureValidToken(
            consultant.googleCalendar.accessToken!,
            consultant.googleCalendar.refreshToken!,
            consultant.googleCalendar.tokenExpiry!
        );

        const busySlots = await googleCalendarService.getFreeBusy(
            accessToken,
            consultant.googleCalendar.calendarId!,
            startTime,
            endTime
        );

        // If there are any busy slots in this time range, it's not available
        return busySlots.length === 0;
    }

    /**
     * Get consultant's next available slot
     */
    async getNextAvailableSlot(
        consultantId: string,
        sessionDuration: number
    ): Promise<TimeSlot | null> {
        const consultant = await ConsultantModel.findById(consultantId);

        if (!consultant || !consultant.bookingSettings) {
            return null;
        }

        // Check next 30 days
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() + i);

            const slots = await this.getAvailableSlots(
                consultantId,
                checkDate,
                sessionDuration,
                'UTC'
            );

            const availableSlot = slots.find(slot => slot.available);
            if (availableSlot) {
                return availableSlot;
            }
        }

        return null;
    }
}

export const availabilityService = new AvailabilityService();
