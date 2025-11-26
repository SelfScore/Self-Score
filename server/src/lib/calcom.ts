// import axios from 'axios';

// const CALCOM_API_URL = process.env.CALCOM_API_URL || 'https://api.cal.com/v1';
// const CALCOM_CLIENT_ID = process.env.CALCOM_CLIENT_ID;
// const CALCOM_CLIENT_SECRET = process.env.CALCOM_CLIENT_SECRET;
// const CALCOM_REDIRECT_URI = process.env.CALCOM_REDIRECT_URI;

// /**
//  * Generate Cal.com OAuth authorization URL
//  */
// export const getCalcomAuthUrl = (state?: string): string => {
//     const params = new URLSearchParams({
//         client_id: CALCOM_CLIENT_ID || '',
//         redirect_uri: CALCOM_REDIRECT_URI || '',
//         response_type: 'code',
//         ...(state && { state })
//     });

//     return `https://app.cal.com/oauth/authorize?${params.toString()}`;
// };

// /**
//  * Exchange authorization code for access token
//  */
// export const exchangeCodeForToken = async (code: string): Promise<{
//     access_token: string;
//     refresh_token: string;
//     expires_in: number;
// }> => {
//     try {
//         const response = await axios.post('https://app.cal.com/oauth/token', {
//             client_id: CALCOM_CLIENT_ID,
//             client_secret: CALCOM_CLIENT_SECRET,
//             code,
//             grant_type: 'authorization_code',
//             redirect_uri: CALCOM_REDIRECT_URI
//         });

//         return response.data;
//     } catch (error: any) {
//         console.error('Cal.com token exchange error:', error.response?.data || error.message);
//         throw new Error('Failed to exchange code for token');
//     }
// };

// /**
//  * Refresh access token
//  */
// export const refreshAccessToken = async (refreshToken: string): Promise<{
//     access_token: string;
//     refresh_token: string;
//     expires_in: number;
// }> => {
//     try {
//         const response = await axios.post('https://app.cal.com/oauth/token', {
//             client_id: CALCOM_CLIENT_ID,
//             client_secret: CALCOM_CLIENT_SECRET,
//             refresh_token: refreshToken,
//             grant_type: 'refresh_token'
//         });

//         return response.data;
//     } catch (error: any) {
//         console.error('Cal.com token refresh error:', error.response?.data || error.message);
//         throw new Error('Failed to refresh access token');
//     }
// };

// /**
//  * Get Cal.com user profile
//  */
// export const getCalcomProfile = async (accessToken: string): Promise<any> => {
//     try {
//         const response = await axios.get(`${CALCOM_API_URL}/me`, {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`
//             }
//         });

//         return response.data;
//     } catch (error: any) {
//         console.error('Cal.com get profile error:', error.response?.data || error.message);
//         throw new Error('Failed to fetch Cal.com profile');
//     }
// };

// /**
//  * Get user's event types
//  */
// export const getEventTypes = async (accessToken: string): Promise<any[]> => {
//     try {
//         const response = await axios.get(`${CALCOM_API_URL}/event-types`, {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`
//             }
//         });

//         return response.data.event_types || [];
//     } catch (error: any) {
//         console.error('Cal.com get event types error:', error.response?.data || error.message);
//         throw new Error('Failed to fetch event types');
//     }
// };

// /**
//  * Create an event type
//  */
// export const createEventType = async (
//     accessToken: string,
//     eventTypeData: {
//         title: string;
//         slug: string;
//         length: number;
//         description?: string;
//         hidden?: boolean;
//         price?: number;
//     }
// ): Promise<any> => {
//     try {
//         const response = await axios.post(
//             `${CALCOM_API_URL}/event-types`,
//             eventTypeData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );

//         return response.data.event_type;
//     } catch (error: any) {
//         console.error('Cal.com create event type error:', error.response?.data || error.message);
//         throw new Error('Failed to create event type');
//     }
// };

// /**
//  * Update an event type
//  */
// export const updateEventType = async (
//     accessToken: string,
//     eventTypeId: number,
//     eventTypeData: any
// ): Promise<any> => {
//     try {
//         const response = await axios.patch(
//             `${CALCOM_API_URL}/event-types/${eventTypeId}`,
//             eventTypeData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );

//         return response.data.event_type;
//     } catch (error: any) {
//         console.error('Cal.com update event type error:', error.response?.data || error.message);
//         throw new Error('Failed to update event type');
//     }
// };

// /**
//  * Create a webhook subscription
//  */
// export const createWebhook = async (
//     accessToken: string,
//     webhookData: {
//         subscriberUrl: string;
//         eventTriggers: string[];
//         active: boolean;
//     }
// ): Promise<any> => {
//     try {
//         const response = await axios.post(
//             `${CALCOM_API_URL}/webhooks`,
//             webhookData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );

//         return response.data.webhook;
//     } catch (error: any) {
//         console.error('Cal.com create webhook error:', error.response?.data || error.message);
//         throw new Error('Failed to create webhook');
//     }
// };

// /**
//  * Delete a webhook
//  */
// export const deleteWebhook = async (
//     accessToken: string,
//     webhookId: string
// ): Promise<void> => {
//     try {
//         await axios.delete(`${CALCOM_API_URL}/webhooks/${webhookId}`, {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`
//             }
//         });
//     } catch (error: any) {
//         console.error('Cal.com delete webhook error:', error.response?.data || error.message);
//         throw new Error('Failed to delete webhook');
//     }
// };

// /**
//  * Get bookings for a user
//  */
// export const getBookings = async (
//     accessToken: string,
//     filters?: {
//         status?: string;
//         startTime?: string;
//         endTime?: string;
//     }
// ): Promise<any[]> => {
//     try {
//         const params = new URLSearchParams();
//         if (filters?.status) params.append('status', filters.status);
//         if (filters?.startTime) params.append('startTime', filters.startTime);
//         if (filters?.endTime) params.append('endTime', filters.endTime);

//         const response = await axios.get(
//             `${CALCOM_API_URL}/bookings?${params.toString()}`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`
//                 }
//             }
//         );

//         return response.data.bookings || [];
//     } catch (error: any) {
//         console.error('Cal.com get bookings error:', error.response?.data || error.message);
//         throw new Error('Failed to fetch bookings');
//     }
// };

// /**
//  * Cancel a booking
//  */
// export const cancelBooking = async (
//     accessToken: string,
//     bookingId: number,
//     reason?: string
// ): Promise<void> => {
//     try {
//         await axios.delete(`${CALCOM_API_URL}/bookings/${bookingId}`, {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`
//             },
//             data: {
//                 reason
//             }
//         });
//     } catch (error: any) {
//         console.error('Cal.com cancel booking error:', error.response?.data || error.message);
//         throw new Error('Failed to cancel booking');
//     }
// };

// /**
//  * Verify webhook signature
//  */
// export const verifyWebhookSignature = (
//     payload: string,
//     signature: string,
//     secret: string
// ): boolean => {
//     const crypto = require('crypto');
//     const expectedSignature = crypto
//         .createHmac('sha256', secret)
//         .update(payload)
//         .digest('hex');

//     return signature === expectedSignature;
// };
