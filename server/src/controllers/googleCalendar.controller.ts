import { Request, Response } from 'express';
import { googleCalendarService } from '../lib/googleCalendar';
import ConsultantModel from '../models/consultant';
import { ApiResponse } from '../types/api';

export class GoogleCalendarController {
    /**
     * Initiate Google Calendar OAuth flow
     * GET /api/google-calendar/auth-url
     */
    static async initiateOAuth(req: Request, res: Response): Promise<void> {
        const consultantId = (req as any).consultant?.consultantId;
        
        if (!consultantId) {
            const response: ApiResponse = {
                success: false,
                message: 'Not authenticated'
            };
            res.status(401).json(response);
            return;
        }

        try {
            const authUrl = googleCalendarService.getAuthUrl(consultantId);
            
            const response: ApiResponse = {
                success: true,
                message: 'OAuth URL generated',
                data: { authUrl }
            };
            
            res.json(response);
        } catch (error) {
            console.error('Error initiating OAuth:', error);
            const response: ApiResponse = {
                success: false,
                message: 'Failed to initiate Google Calendar connection'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Handle OAuth callback from Google
     * GET /api/google-calendar/callback
     */
    static async handleCallback(req: Request, res: Response): Promise<void> {
        const { code, state, error } = req.query; // state contains consultantId
        
        // Handle OAuth errors
        if (error) {
            const response: ApiResponse = {
                success: false,
                message: `OAuth error: ${error}`
            };
            res.status(400).json(response);
            return;
        }

        if (!code || !state) {
            const response: ApiResponse = {
                success: false,
                message: 'Missing authorization code or state'
            };
            res.status(400).json(response);
            return;
        }

        try {
            // Exchange code for tokens
            const tokens = await googleCalendarService.getTokens(code as string);
            
            // Get user email
            const userInfo = await googleCalendarService.getUserInfo(tokens.accessToken);
            
            // Get primary calendar ID
            const calendarId = await googleCalendarService.getPrimaryCalendarId(tokens.accessToken);
            
            // Update consultant record
            const consultant = await ConsultantModel.findById(state);
            
            if (!consultant) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Consultant not found'
                };
                res.status(404).json(response);
                return;
            }

            // Store Google Calendar credentials
            consultant.googleCalendar = {
                isConnected: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                tokenExpiry: tokens.expiryDate,
                email: userInfo.email,
                calendarId: calendarId,
                connectedAt: new Date(),
                lastSyncedAt: new Date()
            };

            // Update registration step to 5 if not already higher
            if (consultant.registrationStep < 5) {
                consultant.registrationStep = 5;
            }

            await consultant.save();

            const response: ApiResponse = {
                success: true,
                message: 'Google Calendar connected successfully',
                data: {
                    email: userInfo.email,
                    calendarId: calendarId
                }
            };
            
            res.json(response);
        } catch (error) {
            console.error('Error handling OAuth callback:', error);
            const response: ApiResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to connect Google Calendar'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Disconnect Google Calendar
     * POST /api/google-calendar/disconnect
     */
    static async disconnectCalendar(req: Request, res: Response): Promise<void> {
        const consultantId = (req as any).consultant?.consultantId;
        
        if (!consultantId) {
            const response: ApiResponse = {
                success: false,
                message: 'Not authenticated'
            };
            res.status(401).json(response);
            return;
        }

        try {
            const consultant = await ConsultantModel.findById(consultantId);
            
            if (!consultant) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Consultant not found'
                };
                res.status(404).json(response);
                return;
            }

            // Clear Google Calendar data
            consultant.googleCalendar = {
                isConnected: false,
                accessToken: undefined,
                refreshToken: undefined,
                tokenExpiry: undefined,
                email: undefined,
                calendarId: undefined,
                connectedAt: undefined,
                lastSyncedAt: undefined
            };

            await consultant.save();

            const response: ApiResponse = {
                success: true,
                message: 'Google Calendar disconnected successfully'
            };
            
            res.json(response);
        } catch (error) {
            console.error('Error disconnecting calendar:', error);
            const response: ApiResponse = {
                success: false,
                message: 'Failed to disconnect Google Calendar'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Get Google Calendar connection status
     * GET /api/google-calendar/status
     */
    static async getStatus(req: Request, res: Response): Promise<void> {
        const consultantId = (req as any).consultant?.consultantId;
        
        if (!consultantId) {
            const response: ApiResponse = {
                success: false,
                message: 'Not authenticated'
            };
            res.status(401).json(response);
            return;
        }

        try {
            const consultant = await ConsultantModel.findById(consultantId);
            
            if (!consultant) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Consultant not found'
                };
                res.status(404).json(response);
                return;
            }

            const response: ApiResponse = {
                success: true,
                message: 'Calendar status retrieved',
                data: {
                    isConnected: consultant.googleCalendar?.isConnected || false,
                    email: consultant.googleCalendar?.email,
                    connectedAt: consultant.googleCalendar?.connectedAt,
                    lastSyncedAt: consultant.googleCalendar?.lastSyncedAt
                }
            };
            
            res.json(response);
        } catch (error) {
            console.error('Error getting calendar status:', error);
            const response: ApiResponse = {
                success: false,
                message: 'Failed to get calendar status'
            };
            res.status(500).json(response);
        }
    }
}
