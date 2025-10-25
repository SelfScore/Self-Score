"use client";

import {
  Box,
  Typography,
  TextField,
  Link,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import NextLink from "next/link";
import Image from "next/image";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setLocalError("");
    clearError();
  };

  // Format phone number from react-phone-input-2 format to +XX-XXXXXXXXXX
  // Extract country code and phone number separately from react-phone-input-2 format
  // Input: "+911234567890" (from library)
  // Output: { countryCode: "91", phoneNumber: "1234567890" }
  const extractPhoneData = (
    phone: string
  ): { countryCode: string; phoneNumber: string } => {
    // The phone already has + from our onChange handler
    if (!phone.startsWith("+")) {
      return { countryCode: "", phoneNumber: phone };
    }

    const withoutPlus = phone.substring(1); // Remove the +

    // Try to extract country code intelligently
    // Priority: Try 4, then 3, then 2, then 1 digit country codes
    for (let codeLength = 4; codeLength >= 1; codeLength--) {
      const potentialCode = withoutPlus.substring(0, codeLength);
      const potentialNumber = withoutPlus.substring(codeLength);

      // Phone number should be at least 7 digits
      if (potentialNumber.length >= 7) {
        return { countryCode: potentialCode, phoneNumber: potentialNumber };
      }
    }

    // Fallback: treat everything as phone number
    return { countryCode: "", phoneNumber: withoutPlus };
  };

  const validateForm = () => {
    // Username validation
    if (!formData.username.trim()) {
      setLocalError("Username is required");
      return false;
    }
    if (formData.username.trim().length < 2) {
      setLocalError("Username must be at least 2 characters long");
      return false;
    }
    if (formData.username.trim().length > 20) {
      setLocalError("Username must be at most 20 characters long");
      return false;
    }

    // Email validation
    if (!formData.email.trim()) {
      setLocalError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError("Please enter a valid email address");
      return false;
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      setLocalError("Phone number is required");
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }

    // Terms agreement validation
    if (!agreedToTerms) {
      setLocalError("Please agree to the Terms of Service and Privacy Policy");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Extract country code and phone number separately
      const { countryCode, phoneNumber } = extractPhoneData(
        formData.phoneNumber
      );

      const response = await signUp({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        countryCode,
        phoneNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        setSuccess(
          "Account created successfully! Please check your email for verification."
        );
        // Redirect to verification page with email
        setTimeout(() => {
          router.push(
            `/auth/verify-email?email=${encodeURIComponent(formData.email)}`
          );
        }, 2000);
      } else {
        setLocalError(response.message || "Failed to create account");
      }
    } catch (err: any) {
      setLocalError(
        err.response?.data?.message ||
          "Failed to create account. Please try again."
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#FFFFFF",
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          // maxWidth: "1400px",
          alignItems: { xs: "center", md: "flex-start" },
          gap: { xs: 3, md: 3 },
          marginTop: { xs: 8, md: 12 },
        }}
      >
        {/* Left Side - Image */}
        <Box
          sx={{
            position: "relative",
            display: { xs: "none", md: "block" },
            width: { md: "48%", lg: "50%" },
            minHeight: "798px",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              position: "relative",
              height: "798px",
              width: "100%",
              maxWidth: "690px",
            }}
          >
            <Image
              src="/images/LandingPage/AuthImg.webp"
              alt="Authentication"
              fill
              style={{
                objectFit: "cover",
                borderTopRightRadius: "60px",
                borderBottomRightRadius: "60px",
              }}
              priority
            />
          </Box>
        </Box>

        {/* Right Side - Form */}
        <Box
          sx={{
            width: { xs: "100%", md: "48%", lg: "50%" },
            maxWidth: { xs: "627px", md: "627px" },
            px: { xs: 2, sm: 3, md: 0 },
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <Box sx={{ textAlign: { xs: "center", md: "centre" }, mb: 4 }}>
            <Typography
              sx={{
                fontWeight: "700",
                color: "#000",
                mb: 0,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "40px" },
                fontFamily: "Faustina",
              }}
            >
              Create Your Account
            </Typography>
            <Typography
              sx={{
                color: "#6B7280",
                fontSize: { xs: "16px", md: "18px" },
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
              }}
            >
              Start your journey to self-discovery today
            </Typography>
          </Box>

          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || localError}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box
            sx={{
              border: "1px solid #3A3A3A4D",
              borderRadius: "16px",
              py: { xs: 3, md: 4 },
              px: { xs: 2, md: 2.5 },
              width: "100%",
              bgcolor: "#FFFFFF",
            }}
            component="form"
            onSubmit={handleSubmit}
          >
            <Typography
              sx={{
                mb: 1,
                color: "#2C3E50",
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
              }}
            >
              Full Name<span style={{ color: "#FF5722" }}>*</span>
            </Typography>
            <TextField
              placeholder="Enter your Full Name"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  "& fieldset": { border: "1px solid #3A3A3A4D" },
                  "&:hover fieldset": { border: "1px solid #3A3A3A4D" },
                  "&.Mui-focused fieldset": { border: "1px solid #FF5722" },
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:hover": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
              }}
            />

            <Typography
              sx={{
                mb: 1,
                color: "#2C3E50",
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
              }}
            >
              Email Address<span style={{ color: "#FF4F00" }}>*</span>
            </Typography>
            <TextField
              placeholder="Enter your email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  "& fieldset": { border: "1px solid #3A3A3A4D" },
                  "&:hover fieldset": { border: "1px solid #3A3A3A4D" },
                  "&.Mui-focused fieldset": { border: "1px solid #FF5722" },
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:hover": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
              }}
            />

            <Typography
              sx={{
                mb: 1,
                color: "#2C3E50",
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
              }}
            >
              Phone Number<span style={{ color: "#FF5722" }}>*</span>
            </Typography>
            <PhoneInput
              country={"us"}
              value={formData.phoneNumber}
              onChange={(phone) =>
                handleInputChange("phoneNumber", `+${phone}`)
              }
              disabled={isLoading}
              containerStyle={{
                width: "100%",
                marginBottom: "16px",
              }}
              inputStyle={{
                width: "100%",
                height: "48px",
                borderRadius: "8px",
                border: "1px solid #3A3A3A4D",
                fontSize: "16px",
                paddingLeft: "48px",
                color: "#000000",
                backgroundColor: "#FFFFFF",
              }}
              buttonStyle={{
                borderRadius: "8px 0 0 8px",
                border: "1px solid #3A3A3A4D",
                backgroundColor: "#FFFFFF",
              }}
              dropdownStyle={{
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                color: "#000000",
              }}
              searchStyle={{
                width: "90%",
                margin: "8px auto",
                padding: "8px",
                border: "1px solid #3A3A3A4D",
                borderRadius: "4px",
                color: "#000000",
                backgroundColor: "#FFFFFF",
              }}
            />

            <Typography
              sx={{
                mb: 1,
                color: "#2C3E50",
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
              }}
            >
              Password<span style={{ color: "#FF5722" }}>*</span>
            </Typography>
            <TextField
              placeholder="Create a password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
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
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  "& fieldset": { border: "1px solid #3A3A3A4D" },
                  "&:hover fieldset": { border: "1px solid #3A3A3A4D" },
                  "&.Mui-focused fieldset": { border: "1px solid #FF5722" },
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:hover": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
              }}
            />

            <Typography
              sx={{
                mb: 1,
                color: "#2C3E50",
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
              }}
            >
              Confirm Password<span style={{ color: "#FF5722" }}>*</span>
            </Typography>
            <TextField
              placeholder="Confirm your password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              fullWidth
              required
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  "& fieldset": { border: "1px solid #3A3A3A4D" },
                  "&:hover fieldset": { border: "1px solid #3A3A3A4D" },
                  "&.Mui-focused fieldset": { border: "1px solid #FF5722" },
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:hover": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
                  WebkitTextFillColor: "#000000",
                },
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  sx={{
                    color: "#999",
                    "&.Mui-checked": { color: "#FF5722" },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "#666" }}>
                  I agree to the{" "}
                  <Link
                    component={NextLink}
                    href="/terms-conditions"
                    sx={{ color: "#0066cc", textDecoration: "none" }}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    component={NextLink}
                    href="/privacy-policy"
                    sx={{ color: "#0066cc", textDecoration: "none" }}
                  >
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ mb: 1 }}
            />

            <ButtonSelfScore
              type="submit"
              fullWidth
              disabled={isLoading}
              text={
                isLoading ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  "Sign Up"
                )
              }
              height="40px"
              borderRadius="12px"
              background="#FF5722"
              fontSize="1.1rem"
              textStyle={{
                fontWeight: "600",
              }}
              style={{
                marginBottom: "16px",
                opacity: isLoading ? 0.7 : 1,
              }}
            />

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Already have an account?{" "}
                <Link
                  component={NextLink}
                  href="/auth/signin"
                  sx={{
                    color: "#0066cc",
                    fontWeight: "600",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Login here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
