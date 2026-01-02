import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import ConsultantModel from "../models/consultant";
import { checkDatabaseConnection } from "../lib/dbUtils";
import {
  generateToken,
  generateGenericToken,
  getCookieOptions,
} from "../lib/jwt";
import { sendVerificationEmail } from "../lib/email";
import { ApiResponse } from "../types/api";
import {
  uploadProfilePhoto,
  uploadResume,
  uploadCertificate,
  deleteFromS3,
} from "../lib/s3";

// Consultant-specific token payload
interface ConsultantTokenPayload {
  consultantId: string;
  email: string;
  firstName: string;
  lastName: string;
  applicationStatus: string;
  isVerified: boolean;
}

export class ConsultantAuthController {
  /**
   * Step 1: Initial Registration - Create consultant with personal info and send OTP
   */
  static async registerStep1(req: Request, res: Response): Promise<void> {
    if (!checkDatabaseConnection()) {
      const response: ApiResponse = {
        success: false,
        message: "Database connection not available. Please try again later.",
      };
      res.status(503).json(response);
      return;
    }

    try {
      const {
        firstName,
        lastName,
        email,
        password,
        countryCode,
        phoneNumber,
        location,
        profilePhoto,
      } = req.body;

      // Validate required fields
      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !countryCode ||
        !phoneNumber ||
        !location
      ) {
        const response: ApiResponse = {
          success: false,
          message: "All fields are required",
        };
        res.status(400).json(response);
        return;
      }

      // Check if consultant already exists
      const existingConsultant = await ConsultantModel.findOne({
        email,
        isVerified: true,
      });
      if (existingConsultant) {
        const response: ApiResponse = {
          success: false,
          message: "A consultant with this email already exists",
        };
        res.status(400).json(response);
        return;
      }

      // Generate OTP
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      // Delete any existing unverified consultant with this email
      await ConsultantModel.deleteMany({ email, isVerified: false });

      // Upload profile photo to S3 if provided
      let profilePhotoUrl = "";
      if (profilePhoto) {
        try {
          profilePhotoUrl = await uploadProfilePhoto(profilePhoto, email); // Use email as temp ID
        } catch (error) {
          console.error("Error uploading profile photo to S3:", error);
          const response: ApiResponse = {
            success: false,
            message: "Failed to upload profile photo. Please try again.",
          };
          res.status(500).json(response);
          return;
        }
      }

      // Create new consultant
      const newConsultant = new ConsultantModel({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        countryCode,
        phoneNumber,
        location,
        profilePhoto: profilePhotoUrl,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        registrationStep: 1,
        applicationStatus: "draft", // Changed to 'draft' until Step 4 is completed
      });

      await newConsultant.save();

      // Send verification email
      const emailSent = await sendVerificationEmail(
        newConsultant.email,
        newConsultant.firstName,
        verifyCode
      );

      if (!emailSent) {
        console.warn(
          "⚠️  Failed to send verification email, but consultant was created"
        );
      }

      const response: ApiResponse = {
        success: true,
        message: emailSent
          ? "Registration initiated. Please check your email for verification code."
          : "Registration initiated. Verification email could not be sent.",
        data: {
          consultantId: (newConsultant._id as string).toString(),
          email: newConsultant.email,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Error in consultant registration step 1:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Verify Email OTP
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, verifyCode } = req.body;

      if (!email || !verifyCode) {
        const response: ApiResponse = {
          success: false,
          message: "Email and verification code are required",
        };
        res.status(400).json(response);
        return;
      }

      const consultant = await ConsultantModel.findOne({ email });

      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant not found",
        };
        res.status(404).json(response);
        return;
      }

      if (consultant.isVerified) {
        const response: ApiResponse = {
          success: false,
          message: "Email already verified",
        };
        res.status(400).json(response);
        return;
      }

      // Check if code expired
      if (consultant.verifyCodeExpiry < new Date()) {
        const response: ApiResponse = {
          success: false,
          message: "Verification code has expired. Please request a new one.",
        };
        res.status(400).json(response);
        return;
      }

      // Verify code
      if (consultant.verifyCode !== verifyCode) {
        const response: ApiResponse = {
          success: false,
          message: "Invalid verification code",
        };
        res.status(400).json(response);
        return;
      }

      // Mark as verified
      consultant.isVerified = true;
      consultant.verifyCode = ""; // Clear the code
      await consultant.save();

      const response: ApiResponse = {
        success: true,
        message:
          "Email verified successfully. You can now continue with your registration.",
        data: {
          consultantId: (consultant._id as string).toString(),
          isVerified: true,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error in email verification:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Resend Verification Code
   */
  static async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        const response: ApiResponse = {
          success: false,
          message: "Email is required",
        };
        res.status(400).json(response);
        return;
      }

      const consultant = await ConsultantModel.findOne({ email });

      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant not found",
        };
        res.status(404).json(response);
        return;
      }

      if (consultant.isVerified) {
        const response: ApiResponse = {
          success: false,
          message: "Email is already verified",
        };
        res.status(400).json(response);
        return;
      }

      // Generate new OTP
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      consultant.verifyCode = verifyCode;
      consultant.verifyCodeExpiry = expiryDate;
      await consultant.save();

      // Send email
      const emailSent = await sendVerificationEmail(
        consultant.email,
        consultant.firstName,
        verifyCode
      );

      const response: ApiResponse = {
        success: emailSent,
        message: emailSent
          ? "Verification code sent successfully"
          : "Failed to send verification email",
      };

      res.status(emailSent ? 200 : 500).json(response);
    } catch (error) {
      console.error("Error in resend verification:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Step 2: Update Professional Information
   */
  static async updateProfessionalInfo(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { consultantId } = req.body;
      const {
        coachingSpecialties,
        yearsOfExperience,
        professionalBio,
        languagesSpoken,
      } = req.body;

      const consultant = await ConsultantModel.findById(consultantId);

      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant not found",
        };
        res.status(404).json(response);
        return;
      }

      if (!consultant.isVerified) {
        const response: ApiResponse = {
          success: false,
          message: "Please verify your email first",
        };
        res.status(400).json(response);
        return;
      }

      // Update fields
      consultant.coachingSpecialties = coachingSpecialties;
      consultant.yearsOfExperience = yearsOfExperience;
      consultant.professionalBio = professionalBio;
      consultant.languagesSpoken = languagesSpoken;
      consultant.registrationStep = 2;

      await consultant.save();

      const response: ApiResponse = {
        success: true,
        message: "Professional information saved successfully",
        data: {
          consultantId: (consultant._id as string).toString(),
          registrationStep: 2,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating professional info:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Step 3: Update Certifications and Resume
   */
  static async updateCertifications(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { consultantId, certifications, resume } = req.body;

      const consultant = await ConsultantModel.findById(consultantId);

      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant not found",
        };
        res.status(404).json(response);
        return;
      }

      if (!consultant.isVerified) {
        const response: ApiResponse = {
          success: false,
          message: "Please verify your email first",
        };
        res.status(400).json(response);
        return;
      }

      // Validate resume is provided
      if (!resume) {
        const response: ApiResponse = {
          success: false,
          message: "Resume is required",
        };
        res.status(400).json(response);
        return;
      }

      // Upload resume to S3
      let resumeUrl = "";
      try {
        resumeUrl = await uploadResume(resume, consultantId);
      } catch (error) {
        console.error("Error uploading resume to S3:", error);
        const response: ApiResponse = {
          success: false,
          message: "Failed to upload resume. Please try again.",
        };
        res.status(500).json(response);
        return;
      }

      // Upload certifications to S3
      const uploadedCertifications = [];
      if (certifications && certifications.length > 0) {
        for (const cert of certifications) {
          let certificateFileUrl = "";

          // Upload certificate file if provided
          if (cert.certificateFile) {
            try {
              certificateFileUrl = await uploadCertificate(
                cert.certificateFile,
                consultantId,
                cert.name
              );
            } catch (error) {
              console.error("Error uploading certificate to S3:", error);
              const response: ApiResponse = {
                success: false,
                message: `Failed to upload certificate "${cert.name}". Please try again.`,
              };
              res.status(500).json(response);
              return;
            }
          }

          uploadedCertifications.push({
            name: cert.name,
            issuingOrganization: cert.issuingOrganization,
            issueDate: cert.issueDate,
            certificateFile: certificateFileUrl,
          });
        }
      }

      // Update fields
      consultant.certifications = uploadedCertifications;
      consultant.resume = resumeUrl;
      consultant.registrationStep = 3;

      await consultant.save();

      const response: ApiResponse = {
        success: true,
        message: "Certifications and resume saved successfully",
        data: {
          consultantId: (consultant._id as string).toString(),
          registrationStep: 3,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating certifications:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Step 4: Complete Registration - Services
   */
  static async completeRegistration(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const {
        consultantId,
        hourlyRate,
        services,
        generalAvailability,
        introductionVideoLink,
      } = req.body;

      const consultant = await ConsultantModel.findById(consultantId);

      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant not found",
        };
        res.status(404).json(response);
        return;
      }

      if (!consultant.isVerified) {
        const response: ApiResponse = {
          success: false,
          message: "Please verify your email first",
        };
        res.status(400).json(response);
        return;
      }

      // Update fields
      consultant.hourlyRate = hourlyRate;
      consultant.services = services;
      consultant.generalAvailability = generalAvailability;
      consultant.introductionVideoLink = introductionVideoLink;
      consultant.registrationStep = 4;
      consultant.appliedAt = new Date();
      consultant.applicationStatus = "pending";

      await consultant.save();

      // Generate JWT token for consultant
      const tokenPayload: ConsultantTokenPayload = {
        consultantId: (consultant._id as string).toString(),
        email: consultant.email,
        firstName: consultant.firstName,
        lastName: consultant.lastName,
        applicationStatus: consultant.applicationStatus,
        isVerified: consultant.isVerified,
      };

      const token = generateGenericToken(tokenPayload);
      const cookieOptions = getCookieOptions();
      res.cookie("consultantAuthToken", token, cookieOptions);

      const response: ApiResponse = {
        success: true,
        message:
          "Registration completed successfully. Your application is pending admin approval.",
        data: {
          consultant: {
            consultantId: (consultant._id as string).toString(),
            email: consultant.email,
            firstName: consultant.firstName,
            lastName: consultant.lastName,
            applicationStatus: consultant.applicationStatus,
            registrationStep: 4,
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error completing registration:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Consultant Login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const response: ApiResponse = {
          success: false,
          message: "Email and password are required",
        };
        res.status(400).json(response);
        return;
      }

      const consultant = await ConsultantModel.findOne({ email });

      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant with this email does not exist",
        };
        res.status(404).json(response);
        return;
      }

      if (!consultant.isVerified) {
        const response: ApiResponse = {
          success: false,
          message: "Please verify your email before logging in",
        };
        res.status(401).json(response);
        return;
      }

      const isPasswordCorrect = await bcrypt.compare(
        password,
        consultant.password
      );

      if (!isPasswordCorrect) {
        const response: ApiResponse = {
          success: false,
          message: "Incorrect password",
        };
        res.status(401).json(response);
        return;
      }

      // Generate JWT token
      const tokenPayload: ConsultantTokenPayload = {
        consultantId: (consultant._id as string).toString(),
        email: consultant.email,
        firstName: consultant.firstName,
        lastName: consultant.lastName,
        applicationStatus: consultant.applicationStatus,
        isVerified: consultant.isVerified,
      };

      const token = generateGenericToken(tokenPayload);
      const cookieOptions = getCookieOptions();
      res.cookie("consultantAuthToken", token, cookieOptions);

      const response: ApiResponse = {
        success: true,
        message: "Login successful",
        data: {
          consultant: {
            consultantId: (consultant._id as string).toString(),
            email: consultant.email,
            firstName: consultant.firstName,
            lastName: consultant.lastName,
            applicationStatus: consultant.applicationStatus,
            registrationStep: consultant.registrationStep,
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error in consultant login:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get Current Consultant
   */
  static async getCurrentConsultant(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const consultantId = (req as any).consultant?.consultantId;

      if (!consultantId) {
        const response: ApiResponse = {
          success: false,
          message: "Not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      const consultant = await ConsultantModel.findById(consultantId).select(
        "-password -verifyCode"
      );

      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: "Consultant data retrieved successfully",
        data: consultant,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error getting current consultant:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("consultantAuthToken");

      const response: ApiResponse = {
        success: true,
        message: "Logged out successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error in logout:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Update Personal Information
   */
  static async updatePersonalInfo(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = (req as any).consultant?.consultantId;

      if (!consultantId) {
        const response: ApiResponse = {
          success: false,
          message: "Not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      const {
        firstName,
        lastName,
        email,
        countryCode,
        phoneNumber,
        location,
        profilePhoto,
      } = req.body;

      const consultant = await ConsultantModel.findById(consultantId);
      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant not found",
        };
        res.status(404).json(response);
        return;
      }

      // Check if email is being changed
      if (email && email !== consultant.email) {
        // Check if new email already exists
        const existingConsultant = await ConsultantModel.findOne({
          email,
          _id: { $ne: consultantId },
        });

        if (existingConsultant) {
          const response: ApiResponse = {
            success: false,
            message: "Email already in use by another account",
          };
          res.status(400).json(response);
          return;
        }

        // Generate verification code for new email
        const verifyCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        // Store pending email change
        consultant.resetPasswordToken = email; // Temporary storage for new email
        consultant.verifyCode = verifyCode;
        consultant.verifyCodeExpiry = expiryDate;

        await consultant.save();

        // Send verification email to NEW email
        const emailSent = await sendVerificationEmail(
          email,
          consultant.firstName,
          verifyCode
        );

        const response: ApiResponse = {
          success: true,
          message: emailSent
            ? "Verification code sent to new email address. Please verify to complete the change."
            : "Failed to send verification email. Please try again.",
          data: {
            emailVerificationPending: true,
            newEmail: email,
          },
        };

        res.status(200).json(response);
        return;
      }

      // Update other fields immediately
      if (firstName) consultant.firstName = firstName;
      if (lastName) consultant.lastName = lastName;
      if (countryCode) consultant.countryCode = countryCode;
      if (phoneNumber) consultant.phoneNumber = phoneNumber;
      if (location) consultant.location = location;

      // Handle profile photo upload - only if it's new base64 data
      if (profilePhoto) {
        // Check if it's actually new base64 data (not an existing S3 URL)
        const isBase64 =
          profilePhoto.startsWith("data:") ||
          (!profilePhoto.startsWith("http") &&
            !profilePhoto.includes("amazonaws.com"));

        if (isBase64) {
          // Delete old photo if exists
          if (consultant.profilePhoto) {
            await deleteFromS3(consultant.profilePhoto);
          }
          const photoUrl = await uploadProfilePhoto(profilePhoto, consultantId);
          consultant.profilePhoto = photoUrl;
        }
        // If it's already a URL, keep it as is (no change needed)
      }

      await consultant.save();

      const response: ApiResponse = {
        success: true,
        message: "Profile updated successfully",
        data: consultant,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating personal info:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Verify Email Update
   */
  static async verifyEmailUpdate(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = (req as any).consultant?.consultantId;

      if (!consultantId) {
        const response: ApiResponse = {
          success: false,
          message: "Not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      const { newEmail, verifyCode } = req.body;

      if (!newEmail || !verifyCode) {
        const response: ApiResponse = {
          success: false,
          message: "New email and verification code are required",
        };
        res.status(400).json(response);
        return;
      }

      const consultant = await ConsultantModel.findById(consultantId);
      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant not found",
        };
        res.status(404).json(response);
        return;
      }

      // Check if there's a pending email change
      if (consultant.resetPasswordToken !== newEmail) {
        const response: ApiResponse = {
          success: false,
          message: "No pending email change for this address",
        };
        res.status(400).json(response);
        return;
      }

      // Verify code
      if (consultant.verifyCode !== verifyCode) {
        const response: ApiResponse = {
          success: false,
          message: "Invalid verification code",
        };
        res.status(400).json(response);
        return;
      }

      // Check if code expired
      if (
        !consultant.verifyCodeExpiry ||
        new Date() > consultant.verifyCodeExpiry
      ) {
        const response: ApiResponse = {
          success: false,
          message: "Verification code has expired",
        };
        res.status(400).json(response);
        return;
      }

      // Update email
      consultant.email = newEmail;
      consultant.resetPasswordToken = undefined;
      consultant.verifyCode = "";
      consultant.verifyCodeExpiry = new Date(0);

      await consultant.save();

      // Generate new token with updated email
      const tokenPayload: ConsultantTokenPayload = {
        consultantId: (consultant._id as string).toString(),
        email: consultant.email,
        firstName: consultant.firstName,
        lastName: consultant.lastName,
        applicationStatus: consultant.applicationStatus,
        isVerified: consultant.isVerified,
      };

      const token = generateGenericToken(tokenPayload);
      const cookieOptions = getCookieOptions();
      res.cookie("consultantAuthToken", token, cookieOptions);

      const response: ApiResponse = {
        success: true,
        message: "Email updated successfully",
        data: consultant,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error verifying email update:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Update Availability and Booking Settings
   */
  static async updateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = (req as any).consultant?.consultantId;

      if (!consultantId) {
        const response: ApiResponse = {
          success: false,
          message: "Not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      const {
        coachingSpecialties,
        yearsOfExperience,
        professionalBio,
        languagesSpoken,
        hourlyRate,
        services,
        introductionVideoLink,
        bookingSettings,
      } = req.body;

      const consultant = await ConsultantModel.findById(consultantId);
      if (!consultant) {
        const response: ApiResponse = {
          success: false,
          message: "Consultant not found",
        };
        res.status(404).json(response);
        return;
      }

      // Update professional details
      if (coachingSpecialties)
        consultant.coachingSpecialties = coachingSpecialties;
      if (yearsOfExperience !== undefined)
        consultant.yearsOfExperience = yearsOfExperience;
      if (professionalBio) consultant.professionalBio = professionalBio;
      if (languagesSpoken) consultant.languagesSpoken = languagesSpoken;

      // Update services and pricing
      if (hourlyRate !== undefined) consultant.hourlyRate = hourlyRate;
      if (services) consultant.services = services;
      if (introductionVideoLink !== undefined)
        consultant.introductionVideoLink = introductionVideoLink;

      // Update booking settings
      if (bookingSettings) {
        if (!consultant.bookingSettings) {
          consultant.bookingSettings = {
            availability: [],
            bufferBetweenSessions: 15,
            minAdvanceBookingHours: 24,
            maxAdvanceBookingMonths: 3,
            autoCreateMeetLink: true,
            timezone: "UTC",
          };
        }

        if (bookingSettings.availability) {
          consultant.bookingSettings.availability =
            bookingSettings.availability;
        }
        if (bookingSettings.bufferBetweenSessions !== undefined) {
          consultant.bookingSettings.bufferBetweenSessions =
            bookingSettings.bufferBetweenSessions;
        }
        if (bookingSettings.minAdvanceBookingHours !== undefined) {
          consultant.bookingSettings.minAdvanceBookingHours =
            bookingSettings.minAdvanceBookingHours;
        }
        if (bookingSettings.maxAdvanceBookingMonths !== undefined) {
          consultant.bookingSettings.maxAdvanceBookingMonths =
            bookingSettings.maxAdvanceBookingMonths;
        }
        if (bookingSettings.autoCreateMeetLink !== undefined) {
          consultant.bookingSettings.autoCreateMeetLink =
            bookingSettings.autoCreateMeetLink;
        }
        if (bookingSettings.meetingLocation !== undefined) {
          consultant.bookingSettings.meetingLocation =
            bookingSettings.meetingLocation;
        }
        if (bookingSettings.timezone) {
          consultant.bookingSettings.timezone = bookingSettings.timezone;
        }
      }

      await consultant.save();

      const response: ApiResponse = {
        success: true,
        message: "Availability updated successfully",
        data: consultant,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating availability:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }
}
