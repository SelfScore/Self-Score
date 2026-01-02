import api from "../lib/api";

export interface PublicConsultant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  location: string;
  profilePhoto?: string;
  coachingSpecialties: string[];
  yearsOfExperience: number;
  professionalBio: string;
  languagesSpoken: string[];
  certifications: {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    certificateFile?: string;
  }[];
  resume?: string;
  hourlyRate: number;
  services: {
    sessionType: "30min" | "60min" | "90min";
    duration: number;
    enabled: boolean;
    isFree?: boolean;
    price?: number;
  }[];
  generalAvailability?: string;
  introductionVideoLink?: string;
  applicationStatus: "approved";
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  // calcom?: {
  //   isConnected: boolean;
  //   username?: string;
  //   eventTypes?: {
  //     duration30?: {
  //       id: number;
  //       slug: string;
  //       link: string;
  //     };
  //     duration60?: {
  //       id: number;
  //       slug: string;
  //       link: string;
  //     };
  //     duration90?: {
  //       id: number;
  //       slug: string;
  //       link: string;
  //     };
  //   };
  // };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const consultantService = {
  // Get all approved consultants (public endpoint)
  getPublicConsultants: async (): Promise<ApiResponse<PublicConsultant[]>> => {
    try {
      const response = await api.get("/api/consultants/public");
      return response as unknown as ApiResponse<PublicConsultant[]>;
    } catch (error) {
      console.error("Failed to fetch consultants:", error);
      throw error;
    }
  },

  // Get single consultant by ID (public endpoint)
  getConsultantById: async (
    consultantId: string
  ): Promise<ApiResponse<PublicConsultant>> => {
    try {
      const response = await api.get(`/api/consultants/public/${consultantId}`);
      return response as unknown as ApiResponse<PublicConsultant>;
    } catch (error) {
      console.error("Failed to fetch consultant:", error);
      throw error;
    }
  },
};
