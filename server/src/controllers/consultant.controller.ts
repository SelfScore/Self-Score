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
}
