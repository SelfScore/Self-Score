import jwt from 'jsonwebtoken';
import { UserResponse } from '../types/api';

// JWT secret key from environment variables
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    // Never sign sessions with a publicly known fallback secret in production
    throw new Error('JWT_SECRET must be set in production');
}
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '7d';

// Token payload interface
// Kept intentionally small: anything that can change (purchases, progress,
// verification status) is read from the database, never trusted from the token.
export interface TokenPayload {
    userId: string;
    email: string;
    username: string;
    /** "user" for end-user sessions. Consultant/admin tokens never carry this. */
    type?: "user";
    /** Session version; bumping user.tokenVersion revokes all older tokens */
    tv?: number;
}

const USER_SESSION_DAYS = 7;
const USER_REMEMBER_ME_DAYS = 30;

// Generate JWT token for users
export const generateToken = (
    userData: Pick<UserResponse, "userId" | "email" | "username">,
    options: { tokenVersion?: number; rememberMe?: boolean } = {}
): string => {
    const payload: TokenPayload = {
        userId: userData.userId,
        email: userData.email,
        username: userData.username,
        type: "user",
        tv: options.tokenVersion ?? 0,
    };

    return jwt.sign(payload, JWT_SECRET, {
        // Token lifetime always matches the cookie lifetime
        expiresIn: `${options.rememberMe ? USER_REMEMBER_ME_DAYS : USER_SESSION_DAYS}d`,
        issuer: 'lifescore-app',
        audience: 'lifescore-users'
    } as jwt.SignOptions);
};

// Generate JWT token for consultants or admins (generic)
export const generateGenericToken = (payload: any): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'lifescore-app',
        audience: 'lifescore-users'
    } as jwt.SignOptions);
};

// Verify JWT token
export const verifyToken = (token: string): TokenPayload => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'lifescore-app',
            audience: 'lifescore-users'
        }) as TokenPayload;

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        } else {
            throw new Error('Token verification failed');
        }
    }
};

// Extract token from cookies
export const extractTokenFromCookies = (cookies: any): string | null => {
    return cookies?.authToken || null;
};

// Cookie options for setting auth token
export const getCookieOptions = (rememberMe: boolean = false) => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Base cookie options
    const options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'lax';
        path: string;
        maxAge: number;
    } = {
        httpOnly: true,
        secure: isProduction, // Only secure in production
        sameSite: 'lax' as 'lax', // 'lax' works better for same-site requests
        path: '/',
        // Default to 7 days persistent cookie to prevent tab sleep/idle logouts,
        // or 30 days if rememberMe is enabled
        maxAge: (rememberMe ? USER_REMEMBER_ME_DAYS : USER_SESSION_DAYS) * 24 * 60 * 60 * 1000
    };

    return options;
};