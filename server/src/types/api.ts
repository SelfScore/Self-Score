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
    countryCode?: string;
    phoneNumber?: string;
    isVerified?: boolean;
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
        testScores: {
            level1?: number;
            level2?: number;
            level3?: number;
            level4?: number;
            level5?: number;
        };
    };
}

export interface SignUpRequest {
    username: string;
    email: string;
    countryCode: string;
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
