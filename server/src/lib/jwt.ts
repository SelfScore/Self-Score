import jwt from 'jsonwebtoken';
import { UserResponse } from '../types/api';

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Token payload interface
export interface TokenPayload {
    userId: string;
    email: string;
    username: string;
    countryCode?: string;
    phoneNumber?: string;
    purchasedLevels?: {
        level2: {
            purchased: boolean;
            purchaseDate?: Date;
            paymentId?: string;
        };
        level3: {
            purchased: boolean;
            purchaseDate?: Date;
            paymentId?: string;
        };
        level4: {
            remainingAttempts: number;
            purchaseDate?: Date;
            paymentId?: string;
        };
        level5: {
            remainingAttempts: number;
            purchaseDate?: Date;
            paymentId?: string;
        };
    };
    progress?: {
        completedLevels: number[];
        highestUnlockedLevel: number;
    };
}

// Generate JWT token for users
export const generateToken = (userData: UserResponse): string => {
    const payload: TokenPayload = {
        userId: userData.userId,
        email: userData.email,
        username: userData.username,
        countryCode: userData.countryCode,
        phoneNumber: userData.phoneNumber,
        purchasedLevels: userData.purchasedLevels,
        progress: userData.progress
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
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
// export const getCookieOptions = () => {
//     const isProduction = process.env.NODE_ENV === 'production';

//     return {
//         httpOnly: true,        // Cannot be accessed via JavaScript
//         secure: isProduction,  // Only sent over HTTPS in production
//         sameSite: 'lax' as const, // CSRF protection
//         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
//         path: '/'             // Cookie available for entire domain
//     };
// };

export const getCookieOptions = (rememberMe: boolean = false) => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Base cookie options
    const options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'lax';
        path: string;
        maxAge?: number;
    } = {
        httpOnly: true,
        secure: isProduction, // Only secure in production
        sameSite: 'lax' as 'lax', // 'lax' works better for same-site requests
        path: '/'
    };

    // If "Remember Me" is checked, set cookie to expire in 30 days
    // If not checked, don't set maxAge (session cookie - expires when browser closes)
    if (rememberMe) {
        options.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    }

    return options;
};