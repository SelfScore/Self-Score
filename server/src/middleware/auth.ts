import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromCookies, TokenPayload } from '../lib/jwt';
import { ApiResponse } from '../types/api';

// Extend Request interface to include user data
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

// Auth middleware to verify JWT tokens from cookies
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Extract token from cookies
        const token = extractTokenFromCookies(req.cookies);

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
        
        // Add user data to request object
        req.user = decoded;
        
        // Continue to next middleware/route handler
        next();
        
    } catch (error) {
        console.error("Auth middleware error:", error);
        
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
        res.clearCookie('authToken');
        res.status(401).json(response);
    }
};

// Optional auth middleware - doesn't fail if no token is provided
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = extractTokenFromCookies(req.cookies);

        if (token) {
            try {
                const decoded = verifyToken(token);
                req.user = decoded;
            } catch (error) {
                // Token is invalid, but we don't fail the request
                console.log("Optional auth: Invalid token, continuing without user");
                res.clearCookie('authToken');
            }
        }

        next();
        
    } catch (error) {
        // Even if there's an error, continue without auth
        console.error("Optional auth middleware error:", error);
        next();
    }
};