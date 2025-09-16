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
