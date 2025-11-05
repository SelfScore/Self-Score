import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
    adminId: string;
    email: string;
    username: string;
    type: 'admin';
}

declare global {
    namespace Express {
        interface Request {
            admin?: any;
        }
    }
}

export const adminAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.cookies.adminAuthToken;

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Check if the token is an admin token
        if (decoded.type !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
            return;
        }

        const admin = await Admin.findById(decoded.adminId);

        if (!admin) {
            res.status(401).json({
                success: false,
                message: 'Admin not found'
            });
            return;
        }

        req.admin = {
            adminId: decoded.adminId,
            email: admin.email,
            username: admin.username,
            type: 'admin'
        };
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};
