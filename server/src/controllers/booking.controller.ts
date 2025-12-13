import { Request, Response } from 'express';
import { availabilityService } from '../lib/availability';
import { googleCalendarService } from '../lib/googleCalendar';
import BookingModel, { BookingStatus } from '../models/booking';
import ConsultantModel from '../models/consultant';
import UserModel from '../models/user';
import { ApiResponse } from '../types/api';
import { sendBookingConfirmationEmail, sendBookingCancellationEmail } from '../lib/email';

export class BookingController {
    /**
     * Get available time slots for a consultant
     * GET /api/booking/availability/:consultantId
     */
    static async getAvailableSlots(req: Request, res: Response): Promise<void> {
        const { consultantId } = req.params;
        const { date, duration, timezone } = req.query;
        
        if (!date || !duration) {
            const response: ApiResponse = {
                success: false,
                message: 'Date and duration are required'
            };
            res.status(400).json(response);
            return;
        }

        try {
            const slots = await availabilityService.getAvailableSlots(
                consultantId,
                new Date(date as string),
                parseInt(duration as string),
                (timezone as string) || 'UTC'
            );
            
            const response: ApiResponse = {
                success: true,
                message: 'Available slots retrieved',
                data: { 
                    slots,
                    count: slots.filter(s => s.available).length
                }
            };
            
            res.json(response);
        } catch (error: any) {
            console.error('Error getting available slots:', error);
            const response: ApiResponse = {
                success: false,
                message: error.message || 'Failed to get available slots'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Create a new booking (status: CREATED)
     * POST /api/booking/create
     */
    static async createBooking(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user?.userId;
        const { consultantId, sessionType, startTime, duration, userTimezone, userNotes } = req.body;
        
        if (!userId) {
            const response: ApiResponse = {
                success: false,
                message: 'Not authenticated'
            };
            res.status(401).json(response);
            return;
        }

        // Validation
        if (!consultantId || !sessionType || !startTime || !duration || !userTimezone) {
            const response: ApiResponse = {
                success: false,
                message: 'Missing required fields'
            };
            res.status(400).json(response);
            return;
        }

        try {
            // Check if slot is still available
            const isAvailable = await availabilityService.isSlotAvailable(
                consultantId,
                new Date(startTime),
                duration
            );

            if (!isAvailable) {
                const response: ApiResponse = {
                    success: false,
                    message: 'This time slot is no longer available. Please select another slot.'
                };
                res.status(409).json(response);
                return;
            }

            // Get consultant and verify they exist
            const consultant = await ConsultantModel.findById(consultantId);
            if (!consultant) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Consultant not found'
                };
                res.status(404).json(response);
                return;
            }

            // Verify consultant has calendar connected
            if (!consultant.googleCalendar?.isConnected) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Consultant has not configured their calendar'
                };
                res.status(400).json(response);
                return;
            }

            const consultantTimezone = consultant.bookingSettings?.timezone || 'UTC';

            // Calculate end time
            const endTime = new Date(new Date(startTime).getTime() + duration * 60000);

            // Calculate amount (for future payment integration)
            const hourlyRate = consultant.hourlyRate || 0;
            const amount = (hourlyRate / 60) * duration;

            // Create booking with status CREATED
            const booking = await BookingModel.create({
                consultantId,
                userId,
                sessionType,
                duration,
                startTime: new Date(startTime),
                endTime,
                userTimezone,
                consultantTimezone,
                status: BookingStatus.CREATED,
                amount,
                currency: 'usd',
                userNotes
            });

            // Populate user and consultant info
            await booking.populate('userId', 'username email');
            await booking.populate('consultantId', 'firstName lastName email');

            const response: ApiResponse = {
                success: true,
                message: 'Booking created successfully. Please complete payment within 10 minutes.',
                data: { booking }
            };
            
            res.status(201).json(response);
        } catch (error: any) {
            console.error('Error creating booking:', error);
            const response: ApiResponse = {
                success: false,
                message: error.message || 'Failed to create booking'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Confirm booking after payment (status: CREATED -> PAID)
     * POST /api/booking/:bookingId/confirm
     */
    static async confirmBooking(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user?.userId;
        const { bookingId } = req.params;
        const { paymentId } = req.body;
        
        if (!userId) {
            const response: ApiResponse = {
                success: false,
                message: 'Not authenticated'
            };
            res.status(401).json(response);
            return;
        }

        try {
            const booking = await BookingModel.findById(bookingId)
                .populate('userId', 'username email')
                .populate('consultantId', 'firstName lastName email');

            if (!booking) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Booking not found'
                };
                res.status(404).json(response);
                return;
            }

            // Verify booking belongs to user
            if (booking.userId._id.toString() !== userId) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Unauthorized'
                };
                res.status(403).json(response);
                return;
            }

            // Check if booking expired
            if (booking.isExpired()) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Booking has expired. Please create a new booking.'
                };
                res.status(410).json(response);
                return;
            }

            // Check if already confirmed
            if (booking.status === BookingStatus.PAID) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Booking is already confirmed'
                };
                res.status(400).json(response);
                return;
            }

            // Re-verify slot is still available (excluding current booking)
            const isAvailable = await availabilityService.isSlotAvailable(
                booking.consultantId._id.toString(),
                booking.startTime,
                booking.duration,
                (booking._id as any).toString() // Exclude current booking from check
            );

            if (!isAvailable) {
                const response: ApiResponse = {
                    success: false,
                    message: 'This time slot is no longer available'
                };
                res.status(409).json(response);
                return;
            }

            // Get consultant with tokens
            const consultant = await ConsultantModel.findById(booking.consultantId._id)
                .select('+googleCalendar.accessToken +googleCalendar.refreshToken');

            if (!consultant?.googleCalendar?.isConnected) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Consultant calendar not available'
                };
                res.status(500).json(response);
                return;
            }

            // Ensure valid token
            const { accessToken } = await googleCalendarService.ensureValidToken(
                consultant.googleCalendar.accessToken!,
                consultant.googleCalendar.refreshToken!,
                consultant.googleCalendar.tokenExpiry!
            );

            // Create Google Calendar event
            const user = booking.userId as any;
            const consultantData = booking.consultantId as any;

            const eventData = await googleCalendarService.createEvent(
                accessToken,
                consultant.googleCalendar.calendarId!,
                {
                    summary: `Consultation with ${user.username}`,
                    description: `${booking.duration}-minute ${booking.sessionType} consultation session.\n\nUser: ${user.username} (${user.email})\nNotes: ${booking.userNotes || 'None'}`,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    attendeeEmail: user.email,
                    attendeeName: user.username,
                    location: consultant.bookingSettings?.meetingLocation,
                    conferenceData: consultant.bookingSettings?.autoCreateMeetLink
                }
            );

            // Update booking
            booking.status = BookingStatus.PAID;
            booking.googleCalendarEventId = eventData.eventId;
            booking.meetingLink = eventData.meetingLink;
            booking.paymentId = paymentId;

            await booking.save();

            // Send confirmation emails
            try {
                await sendBookingConfirmationEmail({
                    userEmail: user.email,
                    userName: user.username,
                    consultantName: `${consultantData.firstName} ${consultantData.lastName}`,
                    sessionType: booking.sessionType,
                    startTime: booking.startTime,
                    duration: booking.duration,
                    meetingLink: booking.meetingLink,
                    timezone: booking.userTimezone
                });
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
            }

            const response: ApiResponse = {
                success: true,
                message: 'Booking confirmed successfully',
                data: { booking }
            };
            
            res.json(response);
        } catch (error: any) {
            console.error('Error confirming booking:', error);
            const response: ApiResponse = {
                success: false,
                message: error.message || 'Failed to confirm booking'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Cancel a booking
     * POST /api/booking/:bookingId/cancel
     */
    static async cancelBooking(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user?.userId;
        const { bookingId } = req.params;
        const { cancellationReason } = req.body;
        
        if (!userId) {
            const response: ApiResponse = {
                success: false,
                message: 'Not authenticated'
            };
            res.status(401).json(response);
            return;
        }

        try {
            const booking = await BookingModel.findById(bookingId)
                .populate('userId', 'username email')
                .populate('consultantId', 'firstName lastName email');

            if (!booking) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Booking not found'
                };
                res.status(404).json(response);
                return;
            }

            // Verify booking belongs to user
            if (booking.userId._id.toString() !== userId) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Unauthorized'
                };
                res.status(403).json(response);
                return;
            }

            // Check if already cancelled
            if (booking.status === BookingStatus.CANCELLED) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Booking is already cancelled'
                };
                res.status(400).json(response);
                return;
            }

            // If confirmed, delete from Google Calendar
            if (booking.status === BookingStatus.PAID && booking.googleCalendarEventId) {
                const consultant = await ConsultantModel.findById(booking.consultantId._id)
                    .select('+googleCalendar.accessToken +googleCalendar.refreshToken');

                if (consultant?.googleCalendar?.isConnected) {
                    try {
                        const { accessToken } = await googleCalendarService.ensureValidToken(
                            consultant.googleCalendar.accessToken!,
                            consultant.googleCalendar.refreshToken!,
                            consultant.googleCalendar.tokenExpiry!
                        );

                        await googleCalendarService.deleteEvent(
                            accessToken,
                            consultant.googleCalendar.calendarId!,
                            booking.googleCalendarEventId
                        );
                    } catch (calendarError) {
                        console.error('Failed to delete calendar event:', calendarError);
                    }
                }
            }

            // Update booking
            booking.status = BookingStatus.CANCELLED;
            booking.cancellationReason = cancellationReason;
            booking.cancelledBy = 'user';
            booking.cancelledAt = new Date();

            await booking.save();

            // Send cancellation emails
            try {
                const user = booking.userId as any;
                const consultantData = booking.consultantId as any;

                await sendBookingCancellationEmail({
                    userEmail: user.email,
                    userName: user.username,
                    consultantName: `${consultantData.firstName} ${consultantData.lastName}`,
                    consultantEmail: consultantData.email,
                    sessionType: booking.sessionType,
                    startTime: booking.startTime,
                    duration: booking.duration,
                    timezone: booking.userTimezone,
                    cancellationReason: cancellationReason
                });
            } catch (emailError) {
                console.error('Failed to send cancellation email:', emailError);
            }

            const response: ApiResponse = {
                success: true,
                message: 'Booking cancelled successfully',
                data: { booking }
            };
            
            res.json(response);
        } catch (error: any) {
            console.error('Error cancelling booking:', error);
            const response: ApiResponse = {
                success: false,
                message: error.message || 'Failed to cancel booking'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Get user's bookings
     * GET /api/booking/user/my-bookings
     */
    static async getUserBookings(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user?.userId;
        const { status, upcoming } = req.query;
        
        if (!userId) {
            const response: ApiResponse = {
                success: false,
                message: 'Not authenticated'
            };
            res.status(401).json(response);
            return;
        }

        try {
            const query: any = { userId };

            if (status) {
                query.status = status;
            }

            if (upcoming === 'true') {
                query.startTime = { $gte: new Date() };
            }

            const bookings = await BookingModel.find(query)
                .populate('consultantId', 'firstName lastName email profilePhoto')
                .sort({ startTime: -1 });

            const response: ApiResponse = {
                success: true,
                message: 'Bookings retrieved',
                data: { 
                    bookings,
                    count: bookings.length
                }
            };
            
            res.json(response);
        } catch (error) {
            console.error('Error getting user bookings:', error);
            const response: ApiResponse = {
                success: false,
                message: 'Failed to get bookings'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Get consultant's bookings
     * GET /api/booking/consultant/my-bookings
     */
    static async getConsultantBookings(req: Request, res: Response): Promise<void> {
        const consultantId = (req as any).consultant?.consultantId;
        const { status, upcoming } = req.query;
        
        if (!consultantId) {
            const response: ApiResponse = {
                success: false,
                message: 'Not authenticated'
            };
            res.status(401).json(response);
            return;
        }

        try {
            const query: any = { consultantId };

            if (status) {
                query.status = status;
            }

            if (upcoming === 'true') {
                query.startTime = { $gte: new Date() };
            }

            const bookings = await BookingModel.find(query)
                .populate('userId', 'username email phoneNumber')
                .sort({ startTime: -1 });

            const response: ApiResponse = {
                success: true,
                message: 'Bookings retrieved',
                data: { 
                    bookings,
                    count: bookings.length
                }
            };
            
            res.json(response);
        } catch (error) {
            console.error('Error getting consultant bookings:', error);
            const response: ApiResponse = {
                success: false,
                message: 'Failed to get bookings'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Consultant cancel a booking
     * POST /api/booking/:bookingId/consultant-cancel
     */
    static async consultantCancelBooking(req: Request, res: Response): Promise<void> {
        const consultantId = (req as any).consultant?.consultantId;
        const { bookingId } = req.params;
        const { cancellationReason } = req.body;
        
        if (!consultantId) {
            const response: ApiResponse = {
                success: false,
                message: 'Not authenticated'
            };
            res.status(401).json(response);
            return;
        }

        try {
            const booking = await BookingModel.findById(bookingId)
                .populate('userId', 'username email')
                .populate('consultantId', 'firstName lastName email');

            if (!booking) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Booking not found'
                };
                res.status(404).json(response);
                return;
            }

            // Verify booking belongs to consultant
            if (booking.consultantId._id.toString() !== consultantId) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Unauthorized'
                };
                res.status(403).json(response);
                return;
            }

            // Check if already cancelled
            if (booking.status === BookingStatus.CANCELLED) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Booking is already cancelled'
                };
                res.status(400).json(response);
                return;
            }

            // If confirmed, delete from Google Calendar
            if (booking.status === BookingStatus.PAID && booking.googleCalendarEventId) {
                const consultant = await ConsultantModel.findById(consultantId)
                    .select('+googleCalendar.accessToken +googleCalendar.refreshToken');

                if (consultant?.googleCalendar?.isConnected) {
                    try {
                        const { accessToken } = await googleCalendarService.ensureValidToken(
                            consultant.googleCalendar.accessToken!,
                            consultant.googleCalendar.refreshToken!,
                            consultant.googleCalendar.tokenExpiry!
                        );

                        await googleCalendarService.deleteEvent(
                            accessToken,
                            consultant.googleCalendar.calendarId!,
                            booking.googleCalendarEventId
                        );
                    } catch (calendarError) {
                        console.error('Failed to delete calendar event:', calendarError);
                    }
                }
            }

            // Update booking
            booking.status = BookingStatus.CANCELLED;
            booking.cancellationReason = cancellationReason;
            booking.cancelledBy = 'consultant';
            booking.cancelledAt = new Date();

            await booking.save();

            // Send cancellation emails
            try {
                const user = booking.userId as any;
                const consultantData = booking.consultantId as any;

                await sendBookingCancellationEmail({
                    userEmail: user.email,
                    userName: user.username,
                    consultantName: `${consultantData.firstName} ${consultantData.lastName}`,
                    consultantEmail: consultantData.email,
                    sessionType: booking.sessionType,
                    startTime: booking.startTime,
                    duration: booking.duration,
                    timezone: booking.userTimezone,
                    cancellationReason: cancellationReason
                });
            } catch (emailError) {
                console.error('Failed to send cancellation email:', emailError);
            }

            const response: ApiResponse = {
                success: true,
                message: 'Booking cancelled successfully',
                data: { booking }
            };
            
            res.json(response);
        } catch (error: any) {
            console.error('Error cancelling booking:', error);
            const response: ApiResponse = {
                success: false,
                message: error.message || 'Failed to cancel booking'
            };
            res.status(500).json(response);
        }
    }
}
