import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/auth';
import { consultantAuthMiddleware } from '../middleware/consultantAuth';

const router = Router();

/**
 * PUBLIC ROUTES
 */

/**
 * @route   GET /api/booking/availability/:consultantId
 * @desc    Get available time slots for a consultant
 * @access  Public
 * @query   date (YYYY-MM-DD), duration (minutes), timezone (optional)
 */
router.get('/availability/:consultantId', BookingController.getAvailableSlots);

/**
 * USER ROUTES (require user authentication)
 */

/**
 * @route   POST /api/booking/create
 * @desc    Create a new booking (status: CREATED, awaiting payment)
 * @access  Private (User)
 * @body    consultantId, sessionType, startTime, duration, userTimezone, userNotes (optional)
 */
router.post('/create', authMiddleware, BookingController.createBooking);

/**
 * @route   POST /api/booking/:bookingId/confirm
 * @desc    Confirm booking after payment (status: CREATED -> PAID)
 * @access  Private (User)
 * @body    paymentId
 */
router.post('/:bookingId/confirm', authMiddleware, BookingController.confirmBooking);

/**
 * @route   POST /api/booking/:bookingId/cancel
 * @desc    Cancel a booking
 * @access  Private (User)
 * @body    cancellationReason (optional)
 */
router.post('/:bookingId/cancel', authMiddleware, BookingController.cancelBooking);

/**
 * @route   GET /api/booking/user/my-bookings
 * @desc    Get user's bookings
 * @access  Private (User)
 * @query   status (optional), upcoming (boolean, optional)
 */
router.get('/user/my-bookings', authMiddleware, BookingController.getUserBookings);

/**
 * CONSULTANT ROUTES (require consultant authentication)
 */

/**
 * @route   GET /api/booking/consultant/my-bookings
 * @desc    Get consultant's bookings
 * @access  Private (Consultant)
 * @query   status (optional), upcoming (boolean, optional)
 */
router.get('/consultant/my-bookings', consultantAuthMiddleware, BookingController.getConsultantBookings);

/**
 * @route   POST /api/booking/:bookingId/consultant-cancel
 * @desc    Consultant cancel a booking
 * @access  Private (Consultant)
 * @body    cancellationReason (optional)
 */
router.post('/:bookingId/consultant-cancel', consultantAuthMiddleware, BookingController.consultantCancelBooking);

export default router;
