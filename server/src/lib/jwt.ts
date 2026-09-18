import jwt from 'jsonwebtoken';
import { UserResponse } from '../types/api';

// JWT secret key from environment variables
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '7d';

// Token payload interface
export interface TokenPayload {
    userId: string;
    email: string;
    username: string;
    country?: string;
    countryCode?: string;
    phoneNumber?: string;
    gender?: string;
    ageGroup?: string;
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
        country: userData.country,
        countryCode: userData.countryCode,
        phoneNumber: userData.phoneNumber,
        gender: userData.gender,
        ageGroup: userData.ageGroup,
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
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
    };

    return options;
};