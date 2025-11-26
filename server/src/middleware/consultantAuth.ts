import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { ApiResponse } from '../types/api';

// Extend Request interface to include consultant data
declare global {
    namespace Express {
        interface Request {
            consultant?: {
                consultantId: string;
                email: string;
                firstName: string;
                lastName: string;
                applicationStatus: string;
                isVerified: boolean;
            };
        }
    }
}

// Extract consultant token from cookies
const extractConsultantToken = (cookies: any): string | null => {
    return cookies?.consultantAuthToken || null;
};

// Consultant auth middleware
export const consultantAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Extract token from cookies
        const token = extractConsultantToken(req.cookies);

        if (!token) {
            const response: ApiResponse = {
                success: false,
                message: "Access denied. No authentication token provided."
            };
            res.status(401).json(response);
            return;
        }

        // Verify token
        const decoded = verifyToken(token);
        
        // Add consultant data to request object
        req.consultant = decoded as any;
        
        // Continue to next middleware/route handler
        next();
        
    } catch (error) {
        console.error("Consultant auth middleware error:", error);
        
        let message = "Invalid authentication token.";
        if (error instanceof Error) {
            if (error.message === "Token expired") {
                message = "Authentication token has expired. Please log in again.";
            } else if (error.message === "Invalid token") {
                message = "Invalid authentication token. Please log in again.";
            }
        }

        const response: ApiResponse = {
            success: false,
            message
        };
        
        // Clear the invalid cookie
        res.clearCookie('consultantAuthToken');
        res.status(401).json(response);
    }
};

// Optional consultant auth middleware
export const optionalConsultantAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = extractConsultantToken(req.cookies);

        if (token) {
            try {
                const decoded = verifyToken(token);
                req.consultant = decoded as any;
            } catch (error) {
                console.log("Optional consultant auth: Invalid token, continuing without consultant");
                res.clearCookie('consultantAuthToken');
            }
        }

        next();
        
    } catch (error) {
        console.error("Optional consultant auth middleware error:", error);
        next();
    }
};
