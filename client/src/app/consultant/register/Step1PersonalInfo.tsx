"use client";

import {
  Box,
  Typography,
  TextField,
  Grid,
  Alert,
  Avatar,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Chip,
  Button,
} from "@mui/material";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Visibility,
  VisibilityOff,
  PhotoCamera,
  CheckCircle,
  CloudUpload,
} from "@mui/icons-material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import {
  consultantAuthService,
  Step1Data,
} from "../../../services/consultantAuthService";

// Location options list - major cities and locations
const LOCATION_OPTIONS = [
  // United States
  "New York, NY, USA",
  "Los Angeles, CA, USA",
  "Chicago, IL, USA",
  "Houston, TX, USA",
  "Phoenix, AZ, USA",
  "Philadelphia, PA, USA",
  "San Antonio, TX, USA",
  "San Diego, CA, USA",
  "Dallas, TX, USA",
  "San Jose, CA, USA",
  "Austin, TX, USA",
  "Jacksonville, FL, USA",
  "Fort Worth, TX, USA",
  "Columbus, OH, USA",
  "Charlotte, NC, USA",
  "San Francisco, CA, USA",
  "Indianapolis, IN, USA",
  "Seattle, WA, USA",
  "Denver, CO, USA",
  "Boston, MA, USA",
  "Nashville, TN, USA",
  "Detroit, MI, USA",
  "Portland, OR, USA",
  "Las Vegas, NV, USA",
  "Miami, FL, USA",
  "Atlanta, GA, USA",
  "Minneapolis, MN, USA",
  "Tampa, FL, USA",
  "Orlando, FL, USA",
  "St. Louis, MO, USA",
  "Pittsburgh, PA, USA",
  "Cincinnati, OH, USA",
  "Cleveland, OH, USA",
  "Kansas City, MO, USA",
  "Salt Lake City, UT, USA",
  // Canada
  "Toronto, ON, Canada",
  "Vancouver, BC, Canada",
  "Montreal, QC, Canada",
  "Calgary, AB, Canada",
  "Ottawa, ON, Canada",
  // United Kingdom
  "London, UK",
  "Manchester, UK",
  "Birmingham, UK",
  "Edinburgh, UK",
  "Glasgow, UK",
  // Australia
  "Sydney, NSW, Australia",
  "Melbourne, VIC, Australia",
  "Brisbane, QLD, Australia",
  "Perth, WA, Australia",
  // India
  "Mumbai, Maharashtra, India",
  "Delhi, India",
  "Bangalore, Karnataka, India",
  "Hyderabad, Telangana, India",
  "Chennai, Tamil Nadu, India",
  "Kolkata, West Bengal, India",
  "Pune, Maharashtra, India",
  // Other major cities
  "Singapore",
  "Dubai, UAE",
  "Hong Kong",
  "Tokyo, Japan",
  "Berlin, Germany",
  "Paris, France",
  "Amsterdam, Netherlands",
  "Remote / Online",
];

interface Step1PersonalInfoProps {
  onNext: (data: Step1Data, consultantId: string) => void;
  initialData?: Partial<Step1Data>;
}

export default function Step1PersonalInfo({
  onNext,
  initialData,
}: Step1PersonalInfoProps) {
  const [formData, setFormData] = useState<Step1Data>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    password: initialData?.password || "",
    countryCode: initialData?.countryCode || "+1",
    phoneNumber: initialData?.phoneNumber || "",
    location: initialData?.location || "",
    profilePhoto: initialData?.profilePhoto || "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>(
    initialData?.profilePhoto || ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [consultantId, setConsultantId] = useState("");

  // Photo upload modal state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load saved data from sessionStorage on mount (for page refresh)
  useEffect(() => {
    const saved = sessionStorage.getItem("consultantStep1");
    if (saved && !initialData?.email) {
      // Only load from sessionStorage if not already provided via initialData
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        if (parsed.profilePhoto) {
          setProfilePhotoPreview(parsed.profilePhoto);
        }
      } catch (e) {
        console.error("Error loading saved step 1 data", e);
      }
    }
  }, []);

  // Auto-save form data to sessionStorage whenever it changes
  useEffect(() => {
    // Only save if user has started filling the form
    if (formData.firstName || formData.lastName || formData.email) {
      sessionStorage.setItem("consultantStep1", JSON.stringify(formData));
    }
  }, [formData]);

  // Also save profile photo preview separately
  useEffect(() => {
    if (profilePhotoPreview && formData.profilePhoto) {
      const currentData = sessionStorage.getItem("consultantStep1");
      if (currentData) {
        const parsed = JSON.parse(currentData);
        parsed.profilePhoto = profilePhotoPreview;
        sessionStorage.setItem("consultantStep1", JSON.stringify(parsed));
      }
    }
  }, [profilePhotoPreview, formData.profilePhoto]);

  const handleInputChange = (field: keyof Step1Data, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhoneChange = (phone: string, country: any) => {
    setFormData((prev) => ({
      ...prev,
      phoneNumber: phone.slice(country.dialCode.length),
      countryCode: `+${country.dialCode}`,
    }));
  };

  // Handle file processing (used by both click and drag-drop)
  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        profilePhoto: "Please select an image file",
      }));
      return;
    }

    try {
      const base64 = await consultantAuthService.fileToBase64(file);

      // Validate file size (1MB limit)
      if (!consultantAuthService.validateFileSize(base64, 1)) {
        setErrors((prev) => ({
          ...prev,
          profilePhoto: "Image must be under 1MB",
        }));
        return;
      }

      setProfilePhotoPreview(base64);
      setFormData((prev) => ({ ...prev, profilePhoto: base64 }));
      setErrors((prev) => ({ ...prev, profilePhoto: "" }));
    } catch (_error) {
      setErrors((prev) => ({
        ...prev,
        profilePhoto: "Failed to upload image",
      }));
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    // Check if consultant already exists (returning from later steps)
    const existingConsultantId = sessionStorage.getItem("consultantId");

    if (existingConsultantId) {
      // Consultant already registered, just proceed to next step
      onNext(formData, existingConsultantId);
      return;
    }

    // New registration flow
    setLoading(true);
    try {
      const response = await consultantAuthService.registerStep1(formData);

      if (response.success && response.data) {
        setConsultantId(response.data.consultantId);
        // Open verification modal
        setVerificationModal(true);
      } else {
        setErrors({ general: response.message || "Registration failed" });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "An error occurred during registration";
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode.trim()) {
      setVerificationError("Please enter the verification code");
      return;
    }

    if (verificationCode.length !== 6) {
      setVerificationError("Verification code must be 6 digits");
      return;
    }

    setVerificationLoading(true);
    setVerificationError("");

    try {
      const response = await consultantAuthService.verifyEmail({
        email: formData.email,
        verifyCode: verificationCode,
      });

      if (response.success) {
        // Mark email as verified
        setIsEmailVerified(true);
        // Store consultantId in sessionStorage for persistence
        sessionStorage.setItem("consultantId", consultantId);
        // Store form data for persistence
        sessionStorage.setItem("consultantStep1", JSON.stringify(formData));
        // Close modal and proceed to next step
        setVerificationModal(false);
        onNext(formData, consultantId);
      } else {
        setVerificationError(response.message || "Verification failed");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Verification failed";
      setVerificationError(errorMessage);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setVerificationError("");

    try {
      const response = await consultantAuthService.resendVerification(
        formData.email
      );

      if (response.success) {
        setVerificationError(""); // Clear any previous errors
        // Show success message (you could add a success state)
        alert("Verification code resent successfully!");
      } else {
        setVerificationError(response.message || "Failed to resend code");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to resend code";
      setVerificationError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  // Check if returning user with verified email
  const existingConsultantId = sessionStorage.getItem("consultantId");
  const emailAlreadyVerified = !!existingConsultantId || isEmailVerified;

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontFamily: "Faustina",
          fontSize: "24px",
          fontWeight: 600,
          mb: 3,
          color: "#1A1A1A",
        }}
      >
        Personal Information
      </Typography>

      {errors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.general}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* First Name */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 600,
              mb: 1,
              color: "#1A1A1A",
            }}
          >
            First Name <span style={{ color: "#E87A42" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FFF",
                borderRadius: "8px",
                height: "48px",
                "& fieldset": {
                  borderColor: "#3A3A3A4D",
                  borderWidth: "1px",
                },
              },
            }}
          />
        </Grid>

        {/* Last Name */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 600,
              mb: 1,
              color: "#1A1A1A",
            }}
          >
            Last Name <span style={{ color: "#E87A42" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FFF",
                borderRadius: "8px",
                height: "48px",
                "& fieldset": {
                  borderColor: "#3A3A3A4D",
                  borderWidth: "1px",
                },
              },
            }}
          />
        </Grid>

        {/* Email with Verified Badge */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                fontWeight: 600,
                color: "#1A1A1A",
              }}
            >
              Email Address <span style={{ color: "#E87A42" }}>*</span>
            </Typography>
            {emailAlreadyVerified && (
              <Chip
                icon={<CheckCircle sx={{ fontSize: 16 }} />}
                label="Verified"
                size="small"
                sx={{
                  backgroundColor: "#E8F5E9",
                  color: "#2E7D32",
                  fontWeight: 600,
                  fontSize: "11px",
                  height: "22px",
                  "& .MuiChip-icon": {
                    color: "#2E7D32",
                  },
                }}
              />
            )}
          </Box>
          <TextField
            fullWidth
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            disabled={emailAlreadyVerified}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: emailAlreadyVerified ? "#F5F5F5" : "#FFF",
                borderRadius: "8px",
                height: "48px",
                "& fieldset": {
                  borderColor: "#3A3A3A4D",
                  borderWidth: "1px",
                },
              },
            }}
          />
        </Grid>

        {/* Phone Number */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 600,
              mb: 1,
              color: "#1A1A1A",
            }}
          >
            Phone Number <span style={{ color: "#E87A42" }}>*</span>
          </Typography>
          <PhoneInput
            country={"us"}
            value={formData.countryCode + formData.phoneNumber}
            onChange={handlePhoneChange}
            inputStyle={{
              width: "100%",
              height: "48px",
              fontSize: "16px",
              backgroundColor: "#FFF",
              border: errors.phoneNumber
                ? "1px solid #d32f2f"
                : "1px solid #3A3A3A4D",
              borderRadius: "8px",
            }}
            buttonStyle={{
              backgroundColor: "#FFF",
              border: "1px solid #3A3A3A4D",
              borderRadius: "8px 0 0 8px",
            }}
          />
          {errors.phoneNumber && (
            <Typography
              sx={{ color: "#d32f2f", fontSize: "12px", mt: 0.5, ml: 1.5 }}
            >
              {errors.phoneNumber}
            </Typography>
          )}
        </Grid>

        {/* Password */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 600,
              mb: 1,
              color: "#1A1A1A",
            }}
          >
            Password <span style={{ color: "#E87A42" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            disabled={emailAlreadyVerified}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: emailAlreadyVerified ? "#F5F5F5" : "#FFF",
                borderRadius: "8px",
                height: "48px",
                "& fieldset": {
                  borderColor: "#3A3A3A4D",
                  borderWidth: "1px",
                },
              },
            }}
          />
        </Grid>

        {/* Location - Autocomplete Dropdown */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 600,
              mb: 1,
              color: "#1A1A1A",
            }}
          >
            Location <span style={{ color: "#E87A42" }}>*</span>
          </Typography>
          <Autocomplete
            freeSolo
            options={LOCATION_OPTIONS}
            value={formData.location}
            onChange={(_, newValue) => {
              handleInputChange("location", newValue || "");
            }}
            onInputChange={(_, newInputValue) => {
              handleInputChange("location", newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select or type your location"
                error={!!errors.location}
                helperText={errors.location}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#FFF",
                    borderRadius: "8px",
                    height: "48px",
                    "& fieldset": {
                      borderColor: "#3A3A3A4D",
                      borderWidth: "1px",
                    },
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* Profile Photo - Click to Open Modal */}
        <Grid size={{ xs: 12 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 600,
              mb: 1,
              color: "#1A1A1A",
            }}
          >
            Profile Photo
          </Typography>
          <Box
            onClick={() => setPhotoModalOpen(true)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
              backgroundColor: "#FFF",
              border: errors.profilePhoto
                ? "1px solid #d32f2f"
                : "1px solid #3A3A3A4D",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#005F73",
                backgroundColor: "#F5F9FA",
              },
            }}
          >
            <Avatar
              src={profilePhotoPreview}
              sx={{
                width: 80,
                height: 80,
                backgroundColor: "#FF4F00",
                fontSize: "32px",
              }}
            >
              {formData.firstName.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  color: "#666",
                  fontWeight: 400,
                  mb: 0.5,
                }}
              >
                {profilePhotoPreview
                  ? "Change profile photo"
                  : "Upload profile photo"}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "12px",
                  color: "#999",
                }}
              >
                Click to browse or drag and drop • PNG, JPG up to 1MB
              </Typography>
            </Box>
            <IconButton
              sx={{
                backgroundColor: "#005F73",
                color: "white",
                "&:hover": { backgroundColor: "#004A5A" },
              }}
            >
              <PhotoCamera />
            </IconButton>
          </Box>
          {errors.profilePhoto && (
            <Typography
              sx={{ color: "#d32f2f", fontSize: "12px", mt: 0.5, ml: 1.5 }}
            >
              {errors.profilePhoto}
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* Next Button */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <ButtonSelfScore
          text={loading ? "Processing..." : "Next Step"}
          onClick={handleNext}
          disabled={loading}
          style={{ minWidth: "150px", height: "40px" }}
        />
      </Box>

      {/* Photo Upload Modal */}
      <Dialog
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            p: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Faustina",
            fontSize: "24px",
            fontWeight: 600,
            color: "#1A1A1A",
            pb: 1,
          }}
        >
          Upload Profile Photo
        </DialogTitle>
        <DialogContent>
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              p: 4,
              minHeight: "300px",
              backgroundColor: isDragOver ? "#E3F2FD" : "#F9FAFB",
              border: isDragOver ? "2px dashed #005F73" : "2px dashed #E0E0E0",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {profilePhotoPreview ? (
              <>
                <Avatar
                  src={profilePhotoPreview}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "16px",
                    color: "#005F73",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  Click to change photo or drag and drop a new one
                </Typography>
              </>
            ) : (
              <>
                <CloudUpload
                  sx={{
                    fontSize: 64,
                    color: isDragOver ? "#005F73" : "#999",
                    mb: 2,
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "18px",
                    color: isDragOver ? "#005F73" : "#666",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {isDragOver
                    ? "Drop your image here"
                    : "Drag and drop your photo here"}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                    color: "#FF4F00",
                    textAlign: "center",
                  }}
                >
                  or click to browse from your computer
                </Typography>
              </>
            )}
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "12px",
                color: "#999",
                mt: 1,
              }}
            >
              Supported formats: PNG, JPG • Max size: 1MB
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
          </Box>
          {errors.profilePhoto && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.profilePhoto}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setPhotoModalOpen(false)}
            sx={{
              color: "#666",
              textTransform: "none",
              fontFamily: "Source Sans Pro",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (profilePhotoPreview) {
                setPhotoModalOpen(false);
              }
            }}
            variant="contained"
            disabled={!profilePhotoPreview}
            sx={{
              backgroundColor: "#005F73",
              color: "white",
              textTransform: "none",
              fontFamily: "Source Sans Pro",
              "&:hover": { backgroundColor: "#004A5A" },
              "&:disabled": {
                backgroundColor: "#CCCCCC",
                color: "#666666",
              },
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Verification Modal */}
      <Dialog
        open={verificationModal}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            p: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Faustina",
            fontSize: "24px",
            fontWeight: 600,
            color: "#1A1A1A",
            pb: 1,
          }}
        >
          Verify Your Email
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "16px",
              color: "#666",
              mb: 3,
            }}
          >
            We've sent a 6-digit verification code to{" "}
            <strong>{formData.email}</strong>
          </Typography>

          {verificationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {verificationError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Verification Code"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setVerificationCode(value);
              setVerificationError("");
            }}
            error={!!verificationError}
            inputProps={{
              maxLength: 6,
              style: {
                fontSize: "24px",
                textAlign: "center",
                letterSpacing: "8px",
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F5F5F5",
                borderRadius: "8px",
              },
            }}
          />

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                color: "#666",
              }}
            >
              Didn't receive the code?{" "}
              <span
                onClick={handleResendCode}
                style={{
                  color: "#005F73",
                  fontWeight: 600,
                  cursor: resendLoading ? "not-allowed" : "pointer",
                  textDecoration: "underline",
                }}
              >
                {resendLoading ? "Sending..." : "Resend"}
              </span>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ButtonSelfScore
            text={verificationLoading ? "Verifying..." : "Verify Email"}
            onClick={handleVerifyEmail}
            disabled={verificationLoading || verificationCode.length !== 6}
            fullWidth
            style={{ height: "40px" }}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
}
