// import { Request, Response } from 'express';
// import ConsultantModel from '../models/consultant';
// import BookingModel from '../models/booking';
// import UserModel from '../models/user';
// import { ApiResponse } from '../types/api';
// import {
//     getCalcomAuthUrl,
//     exchangeCodeForToken,
//     getCalcomProfile,
//     getEventTypes,
//     createEventType,
//     createWebhook,
//     deleteWebhook,
//     verifyWebhookSignature
// } from '../lib/calcom';
// import { sendBookingConfirmationEmail, sendBookingCancellationEmail } from '../lib/email';

// const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5001';
// const CALCOM_WEBHOOK_SECRET = process.env.CALCOM_WEBHOOK_SECRET || '';

// export class CalcomController {
//     /**
//      * Get Cal.com OAuth authorization URL
//      */
//     static async getAuthUrl(req: Request, res: Response): Promise<void> {
//         try {
//             const consultantId = (req as any).consultant?.consultantId;

//             if (!consultantId) {
//                 const response: ApiResponse = {
//                     success: false,
//                     message: 'Not authenticated'
//                 };
//                 res.status(401).json(response);
//                 return;
//             }

//             // Generate state with consultant ID for security
//             const state = Buffer.from(JSON.stringify({ consultantId })).toString('base64');
//             const authUrl = getCalcomAuthUrl(state);

//             const response: ApiResponse = {
//                 success: true,
//                 message: 'Authorization URL generated',
//                 data: { authUrl }
//             };

//             res.status(200).json(response);

//         } catch (error) {
//             console.error('Error generating Cal.com auth URL:', error);
//             const response: ApiResponse = {
//                 success: false,
//                 message: 'Failed to generate authorization URL'
//             };
//             res.status(500).json(response);
//         }
//     }

//     /**
//      * Handle OAuth callback and complete Cal.com integration
//      */
//     static async handleCallback(req: Request, res: Response): Promise<void> {
//         try {
//             const { code, state } = req.query;

//             if (!code || typeof code !== 'string') {
//                 const response: ApiResponse = {
//                     success: false,
//                     message: 'Authorization code is required'
//                 };
//                 res.status(400).json(response);
//                 return;
//             }

//             // Decode state to get consultant ID
//             let consultantId: string;
//             try {
//                 const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString());
//                 consultantId = decodedState.consultantId;
//             } catch (error) {
//                 const response: ApiResponse = {
//                     success: false,
//                     message: 'Invalid state parameter'
//                 };
//                 res.status(400).json(response);
//                 return;
//             }

//             // Find consultant
//             const consultant = await ConsultantModel.findById(consultantId);
//             if (!consultant) {
//                 const response: ApiResponse = {
//                     success: false,
//                     message: 'Consultant not found'
//                 };
//                 res.status(404).json(response);
//                 return;
//             }

//             // Exchange code for tokens
//             const tokenData = await exchangeCodeForToken(code);
//             const { access_token, refresh_token } = tokenData;

//             // Get Cal.com profile
//             const profile = await getCalcomProfile(access_token);
//             const username = profile.username || profile.email?.split('@')[0];
//             const userId = profile.id;

//             // Get or create event types for 30, 60, 90 minutes
//             const existingEventTypes = await getEventTypes(access_token);
            
//             const eventTypesData = {
//                 duration30: null as any,
//                 duration60: null as any,
//                 duration90: null as any
//             };

//             // Helper function to create or find event type
//             const getOrCreateEventType = async (duration: number, slug: string) => {
//                 // Check if event type already exists
//                 const existing = existingEventTypes.find(
//                     (et: any) => et.length === duration && et.slug.includes(slug)
//                 );

//                 if (existing) {
//                     return {
//                         id: existing.id,
//                         slug: existing.slug,
//                         link: `https://cal.com/${username}/${existing.slug}`
//                     };
//                 }

//                 // Create new event type
//                 const newEventType = await createEventType(access_token, {
//                     title: `${duration} Min Consultation`,
//                     slug: `${slug}-${duration}min`,
//                     length: duration,
//                     description: `${duration}-minute consultation session with ${consultant.firstName} ${consultant.lastName}`,
//                     hidden: false
//                 });

//                 return {
//                     id: newEventType.id,
//                     slug: newEventType.slug,
//                     link: `https://cal.com/${username}/${newEventType.slug}`
//                 };
//             };

//             // Create/get event types for enabled services
//             const service30 = consultant.services?.find(s => s.sessionType === '30min' && s.enabled);
//             const service60 = consultant.services?.find(s => s.sessionType === '60min' && s.enabled);
//             const service90 = consultant.services?.find(s => s.sessionType === '90min' && s.enabled);

//             if (service30) {
//                 eventTypesData.duration30 = await getOrCreateEventType(30, 'consultation');
//             }
//             if (service60) {
//                 eventTypesData.duration60 = await getOrCreateEventType(60, 'consultation');
//             }
//             if (service90) {
//                 eventTypesData.duration90 = await getOrCreateEventType(90, 'consultation');
//             }

//             // Create webhook for booking notifications
//             const webhookUrl = `${SERVER_URL}/api/calcom/webhook`;
//             const webhook = await createWebhook(access_token, {
//                 subscriberUrl: webhookUrl,
//                 eventTriggers: [
//                     'BOOKING_CREATED',
//                     'BOOKING_RESCHEDULED',
//                     'BOOKING_CANCELLED'
//                 ],
//                 active: true
//             });

//             // Update consultant with Cal.com data
//             consultant.calcom = {
//                 isConnected: true,
//                 accessToken: access_token,
//                 refreshToken: refresh_token,
//                 username,
//                 userId: userId?.toString(),
//                 eventTypes: eventTypesData,
//                 webhookId: webhook.id,
//                 connectedAt: new Date(),
//                 lastSyncedAt: new Date()
//             };

//             await consultant.save();

//             const response: ApiResponse = {
//                 success: true,
//                 message: 'Cal.com connected successfully',
//                 data: {
//                     username,
//                     eventTypes: eventTypesData,
//                     connectedAt: consultant.calcom.connectedAt
//                 }
//             };

//             res.status(200).json(response);

//         } catch (error) {
//             console.error('Error handling Cal.com callback:', error);
//             const response: ApiResponse = {
//                 success: false,
//                 message: error instanceof Error ? error.message : 'Failed to connect Cal.com'
//             };
//             res.status(500).json(response);
//         }
//     }

//     /**
//      * Disconnect Cal.com integration
//      */
//     static async disconnect(req: Request, res: Response): Promise<void> {
//         try {
//             const consultantId = (req as any).consultant?.consultantId;

//             if (!consultantId) {
//                 const response: ApiResponse = {
//                     success: false,
//                     message: 'Not authenticated'
//                 };
//                 res.status(401).json(response);
//                 return;
//             }

//             const consultant = await ConsultantModel.findById(consultantId);
//             if (!consultant) {
//                 const response: ApiResponse = {
//                     success: false,
//                     message: 'Consultant not found'
//                 };
//                 res.status(404).json(response);
//                 return;
//             }

//             if (!consultant.calcom?.isConnected) {
//                 const response: ApiResponse = {
//                     success: false,
//                     message: 'Cal.com is not connected'
//                 };
//                 res.status(400).json(response);
//                 return;
//             }

//             // Try to delete webhook
//             if (consultant.calcom.webhookId && consultant.calcom.accessToken) {
//                 try {
//                     await deleteWebhook(consultant.calcom.accessToken, consultant.calcom.webhookId);
//                 } catch (error) {
//                     console.warn('Failed to delete webhook, continuing with disconnect:', error);
//                 }
//             }

//             // Clear Cal.com data
//             consultant.calcom = {
//                 isConnected: false
//             };

//             await consultant.save();

//             const response: ApiResponse = {
//                 success: true,
//                 message: 'Cal.com disconnected successfully'
//             };

//             res.status(200).json(response);

//         } catch (error) {
//             console.error('Error disconnecting Cal.com:', error);
//             const response: ApiResponse = {
//                 success: false,
//                 message: 'Failed to disconnect Cal.com'
//             };
//             res.status(500).json(response);
//         }
//     }

//     /**
//      * Get Cal.com connection status
//      */
//     static async getStatus(req: Request, res: Response): Promise<void> {
//         try {
//             const consultantId = (req as any).consultant?.consultantId;

//             if (!consultantId) {
//                 const response: ApiResponse = {
//                     success: false,
//                     message: 'Not authenticated'
//                 };
//                 res.status(401).json(response);
//                 return;
//             }

//             const consultant = await ConsultantModel.findById(consultantId).select('calcom');
//             if (!consultant) {
//                 const response: ApiResponse = {
//                     success: false,
//                     message: 'Consultant not found'
//                 };
//                 res.status(404).json(response);
//                 return;
//             }

//             const response: ApiResponse = {
//                 success: true,
//                 message: 'Cal.com status retrieved',
//                 data: {
//                     isConnected: consultant.calcom?.isConnected || false,
//                     username: consultant.calcom?.username,
//                     eventTypes: consultant.calcom?.eventTypes,
//                     connectedAt: consultant.calcom?.connectedAt,
//                     lastSyncedAt: consultant.calcom?.lastSyncedAt
//                 }
//             };

//             res.status(200).json(response);

//         } catch (error) {
//             console.error('Error getting Cal.com status:', error);
//             const response: ApiResponse = {
//                 success: false,
//                 message: 'Failed to get Cal.com status'
//             };
//             res.status(500).json(response);
//         }
//     }

//     /**
//      * Handle webhook from Cal.com
//      */
//     static async handleWebhook(req: Request, res: Response): Promise<void> {
//         try {
//             const signature = req.headers['x-cal-signature'] as string;
//             const payload = JSON.stringify(req.body);

//             // Verify webhook signature
//             if (!verifyWebhookSignature(payload, signature, CALCOM_WEBHOOK_SECRET)) {
//                 console.warn('Invalid webhook signature');
//                 res.status(401).json({ error: 'Invalid signature' });
//                 return;
//             }

//             const event = req.body;
//             const { triggerEvent, payload: eventPayload } = event;

//             console.log('📥 Cal.com webhook received:', triggerEvent);

//             switch (triggerEvent) {
//                 case 'BOOKING_CREATED':
//                     await CalcomController.handleBookingCreated(eventPayload);
//                     break;

//                 case 'BOOKING_RESCHEDULED':
//                     await CalcomController.handleBookingRescheduled(eventPayload);
//                     break;

//                 case 'BOOKING_CANCELLED':
//                     await CalcomController.handleBookingCancelled(eventPayload);
//                     break;

//                 default:
//                     console.log('Unhandled webhook event:', triggerEvent);
//             }

//             res.status(200).json({ received: true });

//         } catch (error) {
//             console.error('Error handling Cal.com webhook:', error);
//             res.status(500).json({ error: 'Webhook processing failed' });
//         }
//     }

//     /**
//      * Handle booking created webhook
//      */
//     private static async handleBookingCreated(payload: any): Promise<void> {
//         try {
//             const { id, uid, title, description, startTime, endTime, attendees, eventType, metadata } = payload;

//             // Find consultant by Cal.com user ID or event type
//             const consultant = await ConsultantModel.findOne({
//                 'calcom.userId': eventType.userId
//             });

//             if (!consultant) {
//                 console.warn('Consultant not found for booking:', id);
//                 return;
//             }

//             // Extract attendee info
//             const attendee = attendees && attendees.length > 0 ? attendees[0] : null;
//             if (!attendee) {
//                 console.warn('No attendee found for booking:', id);
//                 return;
//             }

//             // Try to find user by email
//             const user = await UserModel.findOne({ email: attendee.email });

//             // Calculate duration
//             const start = new Date(startTime);
//             const end = new Date(endTime);
//             const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

//             // Create booking record
//             const booking = new BookingModel({
//                 calcomBookingId: id,
//                 calcomBookingUid: uid,
//                 consultantId: consultant._id,
//                 userId: user?._id,
//                 attendee: {
//                     name: attendee.name,
//                     email: attendee.email,
//                     timeZone: attendee.timeZone,
//                     locale: attendee.locale
//                 },
//                 title,
//                 description,
//                 startTime: start,
//                 endTime: end,
//                 duration,
//                 status: 'scheduled',
//                 eventTypeId: eventType.id,
//                 eventTypeSlug: eventType.slug,
//                 meetingUrl: metadata?.videoCallUrl,
//                 location: metadata?.location,
//                 metadata
//             });

//             await booking.save();

//             console.log('✅ Booking created:', booking._id);

//             // Send confirmation emails
//             await sendBookingConfirmationEmail({
//                 attendeeName: attendee.name,
//                 attendeeEmail: attendee.email,
//                 consultantName: `${consultant.firstName} ${consultant.lastName}`,
//                 consultantEmail: consultant.email,
//                 startTime: start,
//                 endTime: end,
//                 duration,
//                 meetingUrl: metadata?.videoCallUrl,
//                 title
//             });

//         } catch (error) {
//             console.error('Error handling booking created:', error);
//         }
//     }

//     /**
//      * Handle booking rescheduled webhook
//      */
//     private static async handleBookingRescheduled(payload: any): Promise<void> {
//         try {
//             const { id, uid, startTime, endTime } = payload;

//             // Find original booking
//             const booking = await BookingModel.findOne({ calcomBookingId: id });
//             if (!booking) {
//                 console.warn('Booking not found for reschedule:', id);
//                 return;
//             }

//             // Update booking times
//             booking.startTime = new Date(startTime);
//             booking.endTime = new Date(endTime);
//             booking.status = 'rescheduled';

//             await booking.save();

//             console.log('✅ Booking rescheduled:', booking._id);

//             // TODO: Send reschedule notification emails

//         } catch (error) {
//             console.error('Error handling booking rescheduled:', error);
//         }
//     }

//     /**
//      * Handle booking cancelled webhook
//      */
//     private static async handleBookingCancelled(payload: any): Promise<void> {
//         try {
//             const { id, cancellationReason } = payload;

//             // Find booking
//             const booking = await BookingModel.findOne({ calcomBookingId: id });
//             if (!booking) {
//                 console.warn('Booking not found for cancellation:', id);
//                 return;
//             }

//             // Update booking status
//             booking.status = 'cancelled';
//             booking.cancellationReason = cancellationReason;
//             booking.cancelledAt = new Date();
//             booking.cancelledBy = 'user'; // Default to user, adjust logic as needed

//             await booking.save();

//             console.log('✅ Booking cancelled:', booking._id);

//             // Get consultant details
//             const consultant = await ConsultantModel.findById(booking.consultantId);
//             if (consultant) {
//                 await sendBookingCancellationEmail({
//                     attendeeName: booking.attendee.name,
//                     attendeeEmail: booking.attendee.email,
//                     consultantName: `${consultant.firstName} ${consultant.lastName}`,
//                     consultantEmail: consultant.email,
//                     startTime: booking.startTime,
//                     title: booking.title,
//                     cancellationReason
//                 });
//             }

//         } catch (error) {
//             console.error('Error handling booking cancelled:', error);
//         }
//     }

//     /**
//      * Get consultant's bookings
//      */
//     static async getConsultantBookings(req: Request, res: Response): Promise<void> {
//         try {
//             const consultantId = (req as any).consultant?.consultantId;

//             if (!consultantId) {
//                 const response: ApiResponse = {
//                     success: false,
//                     message: 'Not authenticated'
//                 };
//                 res.status(401).json(response);
//                 return;
//             }

//             const { status, startDate, endDate } = req.query;

//             const query: any = { consultantId };
//             if (status) query.status = status;
//             if (startDate || endDate) {
//                 query.startTime = {};
//                 if (startDate) query.startTime.$gte = new Date(startDate as string);
//                 if (endDate) query.startTime.$lte = new Date(endDate as string);
//             }

//             const bookings = await BookingModel.find(query)
//                 .populate('userId', 'username email')
//                 .sort({ startTime: -1 });

//             const response: ApiResponse = {
//                 success: true,
//                 message: 'Bookings retrieved successfully',
//                 data: bookings
//             };

//             res.status(200).json(response);

//         } catch (error) {
//             console.error('Error getting bookings:', error);
//             const response: ApiResponse = {
//                 success: false,
//                 message: 'Failed to get bookings'
//             };
//             res.status(500).json(response);
//         }
//     }
// }
