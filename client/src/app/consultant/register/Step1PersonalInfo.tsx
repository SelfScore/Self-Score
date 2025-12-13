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
} from "@mui/material";
import { useState, useRef } from "react";
import { Visibility, VisibilityOff, PhotoCamera } from "@mui/icons-material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import {
  consultantAuthService,
  Step1Data,
} from "../../../services/consultantAuthService";

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

  // Email verification modal state
  const [verificationModal, setVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [consultantId, setConsultantId] = useState("");

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

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
        // Email verified, proceed to next step
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
                backgroundColor: "#F5F5F5",
                borderRadius: "8px",
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
                backgroundColor: "#F5F5F5",
                borderRadius: "8px",
              },
            }}
          />
        </Grid>

        {/* Email */}
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
            Email Address <span style={{ color: "#E87A42" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F5F5F5",
                borderRadius: "8px",
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
              height: "56px",
              fontSize: "16px",
              backgroundColor: "#F5F5F5",
              border: errors.phoneNumber
                ? "1px solid #d32f2f"
                : "1px solid #E0E0E0",
              borderRadius: "8px",
            }}
            buttonStyle={{
              backgroundColor: "#F5F5F5",
              border: "1px solid #E0E0E0",
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
                backgroundColor: "#F5F5F5",
                borderRadius: "8px",
              },
            }}
          />
        </Grid>

        {/* Location */}
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
            Location (City, State) <span style={{ color: "#E87A42" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g., New York, NY"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            error={!!errors.location}
            helperText={errors.location}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F5F5F5",
                borderRadius: "8px",
              },
            }}
          />
        </Grid>

        {/* Profile Photo */}
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
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
              backgroundColor: "#F5F5F5",
              borderRadius: "8px",
              border: errors.profilePhoto
                ? "1px solid #d32f2f"
                : "1px dashed #E0E0E0",
            }}
          >
            <Avatar
              src={profilePhotoPreview}
              sx={{
                width: 80,
                height: 80,
                backgroundColor: "#E87A42",
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
                  mb: 1,
                }}
              >
                Click to upload or drag and drop
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "12px",
                  color: "#999",
                }}
              >
                PNG, JPG up to 1MB
              </Typography>
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
            <IconButton
              onClick={() => fileInputRef.current?.click()}
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
          style={{ minWidth: "150px" }}
        />
      </Box>

      {/* Email Verification Modal */}
      <Dialog
        open={verificationModal}
        onClose={() => {}}
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
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
}
