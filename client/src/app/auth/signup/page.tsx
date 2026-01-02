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
  FormHelperText,
} from "@mui/material";
import { useState, useEffect } from "react";
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
import {
  getUserFriendlyError,
  getSuccessMessage,
} from "../../../utils/errorMessages";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    countryCode: "1",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field-specific errors for inline display
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  // Load form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem("signupFormData");
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(parsed);
      } catch (error) {
        console.error("Failed to parse saved form data:", error);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (
      formData.username ||
      formData.email ||
      formData.phoneNumber ||
      formData.password ||
      formData.confirmPassword
    ) {
      localStorage.setItem("signupFormData", JSON.stringify(formData));
    }
  }, [formData]);

  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return "";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber.trim()) {
      return "";
    }
    if (phoneNumber.length < 7) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return "";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ): string => {
    if (!confirmPassword) {
      return "";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setLocalError("");
    clearError();

    // Real-time validation for specific fields
    if (field === "email") {
      const error = validateEmail(value);
      setFieldErrors((prev) => ({ ...prev, email: error }));
    } else if (field === "phoneNumber") {
      const error = validatePhoneNumber(value);
      setFieldErrors((prev) => ({ ...prev, phoneNumber: error }));
    } else if (field === "password") {
      const error = validatePassword(value);
      setFieldErrors((prev) => ({ ...prev, password: error }));
      // Also revalidate confirm password if it's filled
      if (formData.confirmPassword) {
        const confirmError = validateConfirmPassword(
          value,
          formData.confirmPassword
        );
        setFieldErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
      }
    } else if (field === "confirmPassword") {
      const error = validateConfirmPassword(formData.password, value);
      setFieldErrors((prev) => ({ ...prev, confirmPassword: error }));
    }
  };

  const handlePhoneChange = (phone: string, country: any) => {
    const phoneWithoutCode = phone.slice(country.dialCode.length);
    setFormData((prev) => ({
      ...prev,
      phoneNumber: phoneWithoutCode,
      countryCode: country.dialCode,
    }));
    setLocalError("");
    clearError();

    // Real-time validation for phone number
    const error = validatePhoneNumber(phoneWithoutCode);
    setFieldErrors((prev) => ({ ...prev, phoneNumber: error }));
  };

  const validateForm = () => {
    // Username validation
    if (!formData.username.trim()) {
      setLocalError("Please enter your full name");
      return false;
    }
    if (formData.username.trim().length < 2) {
      setLocalError("Name must be at least 2 characters long");
      return false;
    }
    if (formData.username.trim().length > 20) {
      setLocalError("Name must not exceed 20 characters");
      return false;
    }

    // Email validation
    if (!formData.email.trim()) {
      setLocalError("Please enter your email address");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError(
        "Please enter a valid email address (e.g., name@example.com)"
      );
      return false;
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      setLocalError("Please enter your phone number");
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError(
        "Passwords do not match. Please enter the same password in both fields"
      );
      return false;
    }

    // Terms agreement validation
    if (!agreedToTerms) {
      setLocalError(
        "Please agree to the Terms of Service and Privacy Policy to continue"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await signUp({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        countryCode: formData.countryCode,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        setSuccess(getSuccessMessage("signup"));
        // Clear localStorage after successful signup
        localStorage.removeItem("signupFormData");
        // Redirect to verification page with email
        setTimeout(() => {
          router.push(
            `/auth/verify-email?email=${encodeURIComponent(formData.email)}`
          );
        }, 2000);
      } else {
        setLocalError(
          getUserFriendlyError(
            { response: { data: { message: response.message } } },
            "signup"
          )
        );
      }
    } catch (err: any) {
      setLocalError(getUserFriendlyError(err, "signup"));
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
        mb: { xs: 0, md: 4 },
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
              error={!!fieldErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: fieldErrors.email ? 0.5 : 2,
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  "& fieldset": {
                    border: fieldErrors.email
                      ? "1px solid #d32f2f"
                      : "1px solid #3A3A3A4D",
                  },
                  "&:hover fieldset": {
                    border: fieldErrors.email
                      ? "1px solid #d32f2f"
                      : "1px solid #3A3A3A4D",
                  },
                  "&.Mui-focused fieldset": {
                    border: fieldErrors.email
                      ? "1px solid #d32f2f"
                      : "1px solid #FF5722",
                  },
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
            {fieldErrors.email && (
              <FormHelperText sx={{ color: "#d32f2f", mb: 2, mt: 0.5, ml: 0 }}>
                {fieldErrors.email}
              </FormHelperText>
            )}

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
              value={`+${formData.countryCode}${formData.phoneNumber}`}
              onChange={handlePhoneChange}
              disabled={isLoading}
              containerStyle={{
                width: "100%",
                marginBottom: fieldErrors.phoneNumber ? "4px" : "16px",
              }}
              inputStyle={{
                width: "100%",
                height: "48px",
                borderRadius: "8px",
                border: fieldErrors.phoneNumber
                  ? "1px solid #d32f2f"
                  : "1px solid #3A3A3A4D",
                fontSize: "16px",
                paddingLeft: "48px",
                color: "#000000",
                backgroundColor: "#FFFFFF",
              }}
              buttonStyle={{
                borderRadius: "8px 0 0 8px",
                border: fieldErrors.phoneNumber
                  ? "1px solid #d32f2f"
                  : "1px solid #3A3A3A4D",
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
            {fieldErrors.phoneNumber && (
              <FormHelperText sx={{ color: "#d32f2f", mb: 2, mt: 0, ml: 0 }}>
                {fieldErrors.phoneNumber}
              </FormHelperText>
            )}

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
              error={!!fieldErrors.password}
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
                mb: fieldErrors.password ? 0.5 : 2,
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  "& fieldset": {
                    border: fieldErrors.password
                      ? "1px solid #d32f2f"
                      : "1px solid #3A3A3A4D",
                  },
                  "&:hover fieldset": {
                    border: fieldErrors.password
                      ? "1px solid #d32f2f"
                      : "1px solid #3A3A3A4D",
                  },
                  "&.Mui-focused fieldset": {
                    border: fieldErrors.password
                      ? "1px solid #d32f2f"
                      : "1px solid #FF5722",
                  },
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
            {fieldErrors.password && (
              <FormHelperText sx={{ color: "#d32f2f", mb: 2, mt: 0.5, ml: 0 }}>
                {fieldErrors.password}
              </FormHelperText>
            )}

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
              error={!!fieldErrors.confirmPassword}
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
                mb: fieldErrors.confirmPassword ? 0.5 : 2,
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  "& fieldset": {
                    border: fieldErrors.confirmPassword
                      ? "1px solid #d32f2f"
                      : "1px solid #3A3A3A4D",
                  },
                  "&:hover fieldset": {
                    border: fieldErrors.confirmPassword
                      ? "1px solid #d32f2f"
                      : "1px solid #3A3A3A4D",
                  },
                  "&.Mui-focused fieldset": {
                    border: fieldErrors.confirmPassword
                      ? "1px solid #d32f2f"
                      : "1px solid #FF5722",
                  },
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
            {fieldErrors.confirmPassword && (
              <FormHelperText sx={{ color: "#d32f2f", mb: 2, mt: 0.5, ml: 0 }}>
                {fieldErrors.confirmPassword}
              </FormHelperText>
            )}

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
                <Typography variant="body2" sx={{ color: "#2B2B2B" }}>
                  I agree to the{" "}
                  <Link
                    component={NextLink}
                    href="/terms-conditions"
                    sx={{ color: "#005F73", textDecoration: "none" }}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    component={NextLink}
                    href="/privacy-policy"
                    sx={{ color: "#005F73", textDecoration: "none" }}
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
                    color: "#005F73",
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
