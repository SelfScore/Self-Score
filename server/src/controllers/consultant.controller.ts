import { Request, Response } from 'express';
import ConsultantModel from '../models/consultant';
import { ApiResponse } from '../types/api';

export class ConsultantController {
    /**
     * Get all approved consultants (public endpoint)
     */
    static async getPublicConsultants(req: Request, res: Response): Promise<void> {
        try {
            const consultants = await ConsultantModel.find({
                applicationStatus: 'approved',
                isVerified: true
            })
            .select('-password -verifyCode -verifyCodeExpiry')
            .sort({ createdAt: -1 });

            const response: ApiResponse = {
                success: true,
                message: "Consultants retrieved successfully",
                data: consultants
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error fetching public consultants:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }

    /**
     * Get single consultant by ID (public endpoint)
     */
    static async getConsultantById(req: Request, res: Response): Promise<void> {
        try {
            const { consultantId } = req.params;

            const consultant = await ConsultantModel.findOne({
                _id: consultantId,
                applicationStatus: 'approved',
                isVerified: true
            }).select('-password -verifyCode -verifyCodeExpiry');

            if (!consultant) {
                const response: ApiResponse = {
                    success: false,
                    message: "Consultant not found"
                };
                res.status(404).json(response);
                return;
            }

            const response: ApiResponse = {
                success: true,
                message: "Consultant retrieved successfully",
                data: consultant
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error fetching consultant by ID:", error);
            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };
            res.status(500).json(response);
        }
    }

    /**
     * Update consultant booking settings
     * PUT /api/consultants/:consultantId/booking-settings
     */
    static async updateBookingSettings(req: Request, res: Response): Promise<void> {
        const { consultantId } = req.params;
        const authenticatedConsultantId = (req as any).consultant?.consultantId;

        // Verify consultant is updating their own settings
        if (consultantId !== authenticatedConsultantId) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized'
            };
            res.status(403).json(response);
            return;
        }

        try {
            const { bookingSettings } = req.body;

            if (!bookingSettings) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Booking settings are required'
                };
                res.status(400).json(response);
                return;
            }

            const consultant = await ConsultantModel.findById(consultantId);

            if (!consultant) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Consultant not found'
                };
                res.status(404).json(response);
                return;
            }

            // Update booking settings
            consultant.bookingSettings = {
                availability: bookingSettings.availability,
                bufferBetweenSessions: bookingSettings.bufferBetweenSessions,
                minAdvanceBookingHours: bookingSettings.minAdvanceBookingHours || 3,
                maxAdvanceBookingMonths: bookingSettings.maxAdvanceBookingMonths || 6,
                autoCreateMeetLink: bookingSettings.autoCreateMeetLink,
                meetingLocation: bookingSettings.meetingLocation,
                timezone: bookingSettings.timezone
            };

            // Update registration step to 5 if not already higher
            if (consultant.registrationStep < 5) {
                consultant.registrationStep = 5;
            }

            await consultant.save();

            const response: ApiResponse = {
                success: true,
                message: 'Booking settings updated successfully',
                data: {
                    bookingSettings: consultant.bookingSettings
                }
            };

            res.json(response);

        } catch (error: any) {
            console.error('Error updating booking settings:', error);
            const response: ApiResponse = {
                success: false,
                message: error.message || 'Failed to update booking settings'
            };
            res.status(500).json(response);
        }
    }
}
