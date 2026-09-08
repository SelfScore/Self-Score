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
  FormHelperText,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import NextLink from "next/link";
import Image from "next/image";
import EmailIcon from "@mui/icons-material/Email";
import PublicIcon from "@mui/icons-material/Public";
import PersonIcon from "@mui/icons-material/Person";
import WcIcon from "@mui/icons-material/Wc";
import CakeIcon from "@mui/icons-material/Cake";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import { getNames } from "country-list";
import {
  getUserFriendlyError,
  getSuccessMessage,
} from "../../../utils/errorMessages";

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;
const AGE_GROUP_OPTIONS = [
  "Under 18",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+",
] as const;

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    country: "",
    gender: "",
    ageGroup: "",
  });
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Field-specific errors for inline display
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    email: "",
    country: "",
    gender: "",
    ageGroup: "",
  });

  // Load form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem("signupFormData");
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData((prev) => ({ ...prev, ...parsed }));
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
      formData.country ||
      formData.gender ||
      formData.ageGroup
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
    } else if (field === "country") {
      const error = !value ? "Country is required" : "";
      setFieldErrors((prev) => ({ ...prev, country: error }));
    } else if (field === "gender") {
      setFieldErrors((prev) => ({ ...prev, gender: "" }));
    } else if (field === "ageGroup") {
      setFieldErrors((prev) => ({ ...prev, ageGroup: "" }));
    }
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
    if (formData.username.trim().length > 50) {
      setLocalError("Name must not exceed 50 characters");
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

    // Country validation
    if (!formData.country.trim()) {
      setLocalError("Please select your country");
      return false;
    }

    // Gender validation
    if (!formData.gender) {
      setLocalError("Please select your gender");
      return false;
    }

    // Age Group validation
    if (!formData.ageGroup) {
      setLocalError("Please select your age group");
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
        country: formData.country.trim(),
        gender: formData.gender,
        ageGroup: formData.ageGroup,
      });

      if (response.success) {
        setSuccess(getSuccessMessage("signup"));
        // Clear localStorage after successful signup
        localStorage.removeItem("signupFormData");
        // Redirect to verification page with email & mode=signup
        setTimeout(() => {
          router.push(
            `/auth/verify-email?email=${encodeURIComponent(formData.email.trim().toLowerCase())}&mode=signup`
          );
        }, 1500);
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
          <Box sx={{ textAlign: { xs: "center", md: "left" }, mb: 4 }}>
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
            {/* Full Name */}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "#999" }} />
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
              }}
            />

            {/* Email Address */}
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
              }}
            />
            {fieldErrors.email && (
              <FormHelperText sx={{ color: "#d32f2f", mb: 2, mt: 0.5, ml: 0 }}>
                {fieldErrors.email}
              </FormHelperText>
            )}

            {/* Country */}
            <Typography
              sx={{
                mb: 1,
                color: "#2C3E50",
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
              }}
            >
              Country<span style={{ color: "#FF5722" }}>*</span>
            </Typography>
            <TextField
              select
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PublicIcon
                      sx={{ color: "#999", fontSize: { xs: 20, sm: 24 } }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: fieldErrors.country ? "4px" : "16px",
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  fontSize: "16px",
                  "& fieldset": {
                    border: fieldErrors.country
                      ? "1px solid #d32f2f"
                      : "1px solid #3A3A3A4D",
                  },
                  "&:hover fieldset": {
                    border: fieldErrors.country
                      ? "1px solid #d32f2f"
                      : "1px solid #3A3A3A4D",
                  },
                  "&.Mui-focused fieldset": {
                    border: fieldErrors.country
                      ? "2px solid #d32f2f"
                      : "2px solid #FF5722",
                  },
                },
              }}
            >
              {getNames().map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
            {fieldErrors.country && (
              <FormHelperText sx={{ color: "#d32f2f", mb: 2, mt: 0, ml: 0 }}>
                {fieldErrors.country}
              </FormHelperText>
            )}

            {/* Gender */}
            <Typography
              sx={{
                mb: 1,
                color: "#2C3E50",
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
              }}
            >
              Gender<span style={{ color: "#FF5722" }}>*</span>
            </Typography>
            <TextField
              select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WcIcon
                      sx={{ color: "#999", fontSize: { xs: 20, sm: 24 } }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: "16px",
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  fontSize: "16px",
                  "& fieldset": { border: "1px solid #3A3A3A4D" },
                  "&:hover fieldset": { border: "1px solid #3A3A3A4D" },
                  "&.Mui-focused fieldset": { border: "2px solid #FF5722" },
                },
              }}
            >
              {GENDER_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            {/* Age Group */}
            <Typography
              sx={{
                mb: 1,
                color: "#2C3E50",
                fontWeight: 400,
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
              }}
            >
              Age Group<span style={{ color: "#FF5722" }}>*</span>
            </Typography>
            <TextField
              select
              value={formData.ageGroup}
              onChange={(e) => handleInputChange("ageGroup", e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CakeIcon
                      sx={{ color: "#999", fontSize: { xs: 20, sm: 24 } }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: "16px",
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  fontSize: "16px",
                  "& fieldset": { border: "1px solid #3A3A3A4D" },
                  "&:hover fieldset": { border: "1px solid #3A3A3A4D" },
                  "&.Mui-focused fieldset": { border: "2px solid #FF5722" },
                },
              }}
            >
              {AGE_GROUP_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

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
              sx={{ mb: 2 }}
            />

            <ButtonSelfScore
              type="submit"
              fullWidth
              disabled={isLoading}
              text={
                isLoading ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  "Create Account & Get Code"
                )
              }
              height="44px"
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
