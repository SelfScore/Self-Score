export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any[];
}

export interface UserResponse {
    userId: string;
    email: string;
    username: string;
    phoneNumber?: string;
    isVerified?: boolean;
    subscription?: {
        isActive: boolean;
        plan: 'free' | 'premium';
        expiresAt?: Date;
    };
    progress?: {
        completedLevels: number[];
        highestUnlockedLevel: number;
        testScores: {
            level1?: number;
            level2?: number;
            level3?: number;
            level4?: number;
        };
    };
}

export interface SignUpRequest {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface VerifyEmailRequest {
    email: string;
    verifyCode: string;
}

export interface ResendVerificationRequest {
    email: string;
}
