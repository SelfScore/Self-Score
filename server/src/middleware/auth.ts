import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromCookies, TokenPayload } from '../lib/jwt';
import UserModel, { isProfileComplete } from '../models/user';
import { ApiResponse } from '../types/api';

// Extend Request interface to include user data
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

type SessionCheck =
    | { ok: true; payload: TokenPayload }
    | { ok: false; message: string };

/**
 * Verifies the JWT signature AND checks it against the database:
 *  - the user still exists (also stops consultant/admin tokens being replayed here)
 *  - the session hasn't been revoked (tokenVersion bumped on password reset / takeover)
 */
export const checkSession = async (token: string): Promise<SessionCheck> => {
    let decoded: TokenPayload;
    try {
        decoded = verifyToken(token);
    } catch (error) {
        const message =
            error instanceof Error && error.message === 'Token expired'
                ? 'Authentication token has expired. Please log in again.'
                : 'Invalid authentication token. Please log in again.';
        return { ok: false, message };
    }

    if (!decoded.userId || (decoded.type && decoded.type !== 'user')) {
        return { ok: false, message: 'Invalid authentication token. Please log in again.' };
    }

    const user = await UserModel.findById(decoded.userId)
        .select('tokenVersion email username')
        .lean();

    if (!user) {
        return { ok: false, message: 'Account not found. Please log in again.' };
    }

    // Tokens issued before tokenVersion existed carry no `tv` and count as version 0
    if ((decoded.tv ?? 0) !== (user.tokenVersion ?? 0)) {
        return { ok: false, message: 'Your session has ended. Please log in again.' };
    }

    return {
        ok: true,
        payload: {
            ...decoded,
            // Always use the current email/username, not what was in the token
            email: user.email,
            username: user.username,
        },
    };
};

// Auth middleware to verify JWT tokens from cookies
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = extractTokenFromCookies(req.cookies);

        if (!token) {
            const response: ApiResponse = {
                success: false,
                message: "Access denied. No authentication token provided."
            };
            res.status(401).json(response);
            return;
        }

        const session = await checkSession(token);
        if (!session.ok) {
            res.clearCookie('authToken', { path: '/' });
            res.status(401).json({ success: false, message: session.message } as ApiResponse);
            return;
        }

        req.user = session.payload;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" } as ApiResponse);
    }
};

// Optional auth middleware - doesn't fail if no token is provided
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = extractTokenFromCookies(req.cookies);

        if (token) {
            const session = await checkSession(token);
            if (session.ok) {
                req.user = session.payload;
            } else {
                res.clearCookie('authToken', { path: '/' });
            }
        }
    } catch (error) {
        // Even if there's an error, continue without auth
        console.error("Optional auth middleware error:", error);
    }
    next();
};

/**
 * Gate for payments and sensitive actions (Level 4/5, bookings).
 * Must run AFTER authMiddleware. Reads fresh state from the database.
 *
 * Responds 403 with a machine-readable `code` so the client can open the
 * right step of the account gate modal:
 *   EMAIL_UNVERIFIED   -> verify email
 *   PROFILE_INCOMPLETE -> fill in country / gender / age group
 */
export const requireVerifiedAndComplete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "User not authenticated" } as ApiResponse);
            return;
        }

        const user = await UserModel.findById(userId)
            .select('isVerified country gender ageGroup')
            .lean();

        if (!user) {
            res.status(401).json({ success: false, message: "User not found" } as ApiResponse);
            return;
        }

        const emailVerified = user.isVerified === true;
        const profileComplete = isProfileComplete(user);

        if (!emailVerified || !profileComplete) {
            res.status(403).json({
                success: false,
                code: !emailVerified ? 'EMAIL_UNVERIFIED' : 'PROFILE_INCOMPLETE',
                message: !emailVerified
                    ? "Please verify your email address to continue."
                    : "Please complete your profile to continue.",
                data: { emailVerified, profileComplete },
            });
            return;
        }

        next();
    } catch (error) {
        console.error("requireVerifiedAndComplete error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" } as ApiResponse);
    }
};

/**
 * For routes that take a :userId URL param: only the owner may access it.
 * Must run AFTER authMiddleware.
 */
export const requireSelfParam = (paramName = 'userId') =>
    (req: Request, res: Response, next: NextFunction): void => {
        const requested = req.params[paramName];
        if (!req.user?.userId || requested !== req.user.userId) {
            res.status(403).json({
                success: false,
                message: "You can only access your own data.",
            } as ApiResponse);
            return;
        }
        next();
    };

/**
 * For routes that receive `userId` in the request body: always use the
 * authenticated user's id, never what the client sent.
 * Must run AFTER authMiddleware.
 */
export const bindBodyUserId = (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
        req.body.userId = req.user!.userId;
    }
    next();
};
