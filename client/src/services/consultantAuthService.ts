import api from "../lib/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface ConsultantData {
  consultantId: string;
  email: string;
  firstName: string;
  lastName: string;
  applicationStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  registrationStep: number;
  isVerified?: boolean;
}

export interface Step1Data {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  countryCode: string;
  phoneNumber: string;
  location: string;
  profilePhoto?: string;
}

export interface Step2Data {
  consultantId: string;
  coachingSpecialties: string[];
  yearsOfExperience: number;
  professionalBio: string;
  languagesSpoken: string[];
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  certificateFile?: string;
}

export interface Step3Data {
  consultantId: string;
  certifications: Certification[];
  resume: string; // Base64 string
}

export interface Service {
  sessionType: '30min' | '60min' | '90min';
  duration: number;
  enabled: boolean;
}

export interface Step4Data {
  consultantId: string;
  hourlyRate: number;
  services: Service[];
  generalAvailability?: string;
  introductionVideoLink?: string;
}

export interface VerifyEmailData {
  email: string;
  verifyCode: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const consultantAuthService = {
  // Step 1: Register with personal info
  registerStep1: async (data: Step1Data): Promise<ApiResponse<{ consultantId: string; email: string }>> => {
    try {
      const response = await api.post("/api/consultant/auth/register/step1", data);
      return response as unknown as ApiResponse<{ consultantId: string; email: string }>;
    } catch (error) {
      throw error;
    }
  },

  // Verify email OTP
  verifyEmail: async (data: VerifyEmailData): Promise<ApiResponse<{ consultantId: string; isVerified: boolean }>> => {
    try {
      const response = await api.post("/api/consultant/auth/verify-email", data);
      return response as unknown as ApiResponse<{ consultantId: string; isVerified: boolean }>;
    } catch (error) {
      throw error;
    }
  },

  // Resend verification code
  resendVerification: async (email: string): Promise<ApiResponse> => {
    try {
      const response = await api.post("/api/consultant/auth/resend-verification", { email });
      return response as unknown as ApiResponse;
    } catch (error) {
      throw error;
    }
  },

  // Step 2: Update professional info
  updateProfessionalInfo: async (data: Step2Data): Promise<ApiResponse> => {
    try {
      const response = await api.post("/api/consultant/auth/register/step2", data);
      return response as unknown as ApiResponse;
    } catch (error) {
      throw error;
    }
  },

  // Step 3: Update certifications and resume
  updateCertifications: async (data: Step3Data): Promise<ApiResponse> => {
    try {
      const response = await api.post("/api/consultant/auth/register/step3", data);
      return response as unknown as ApiResponse;
    } catch (error) {
      throw error;
    }
  },

  // Step 4: Complete registration
  completeRegistration: async (data: Step4Data): Promise<ApiResponse<{ consultant: ConsultantData }>> => {
    try {
      const response = await api.post("/api/consultant/auth/register/step4", data);
      return response as unknown as ApiResponse<{ consultant: ConsultantData }>;
    } catch (error) {
      throw error;
    }
  },

  // Login
  login: async (data: LoginData): Promise<ApiResponse<{ consultant: ConsultantData }>> => {
    try {
      const response = await api.post("/api/consultant/auth/login", data);
      return response as unknown as ApiResponse<{ consultant: ConsultantData }>;
    } catch (error) {
      throw error;
    }
  },

  // Get current consultant
  getCurrentConsultant: async (): Promise<ApiResponse<ConsultantData>> => {
    try {
      const response = await api.get("/api/consultant/auth/me");
      return response as unknown as ApiResponse<ConsultantData>;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await api.post("/api/consultant/auth/logout");
      return response as unknown as ApiResponse;
    } catch (error) {
      throw error;
    }
  },

  // Helper: Convert file to base64
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  },

  // Helper: Validate file size (max 1MB)
  validateFileSize: (base64String: string, maxSizeMB: number = 1): boolean => {
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB <= maxSizeMB;
  }
};
