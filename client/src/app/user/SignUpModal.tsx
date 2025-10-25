"use client";

import {
  Dialog,
  Box,
  Typography,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Link,
  Checkbox,
  FormControlLabel,
  InputAdornment,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { authService, UserData } from "../../services/authService";
import NextLink from "next/link";
import ButtonSelfScore from "../components/ui/ButtonSelfScore";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (userData: any) => void;
}

type AuthStep = "login" | "signup" | "verify" | "password";

export default function SignUpModal({
  open,
  onClose,
  onSuccess,
}: SignUpModalProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    verifyCode: "",
    password: "",
    confirmPassword: "",
  });

  const [_tempUserData, setTempUserData] = useState<UserData | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifyCode, setVerifyCode] = useState(["", "", "", "", "", ""]);
  const [resendLoading, setResendLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(""); // Clear error when user types
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6; // Minimum 6 characters
  };

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

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError("");

      // Validation
      if (!formData.username.trim()) {
        setError("Username is required");
        return;
      }
      if (formData.username.trim().length < 2) {
        setError("Username must be at least 2 characters long");
        return;
      }
      if (formData.username.trim().length > 20) {
        setError("Username must be at most 20 characters long");
        return;
      }
      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }
      if (!formData.phoneNumber.trim()) {
        setError("Phone number is required");
        return;
      }
      if (!validatePassword(formData.password)) {
        setError("Password must be at least 6 characters long");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!agreedToTerms) {
        setError("Please agree to the Terms of Service and Privacy Policy");
        return;
      }

      // Extract country code and phone number separately
      const { countryCode, phoneNumber } = extractPhoneData(
        formData.phoneNumber
      );

      const response = await authService.signUp({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        countryCode,
        phoneNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        setTempUserData(response.data || null);
        setSuccess(
          "Account created! Please check your email for verification code."
        );
        setCurrentStep("verify");
      } else {
        setError(response.message || "Failed to create account");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setLoading(true);
      setError("");

      const code = verifyCode.join("");
      if (!code || code.length !== 6) {
        setError("Please enter the complete 6-digit verification code");
        return;
      }

      const response = await authService.verifyEmail({
        email: formData.email.trim().toLowerCase(),
        verifyCode: code,
      });

      if (response.success) {
        setSuccess("Email verified successfully! You can now log in.");
        // Auto login after verification
        await handleLogin(true);
      } else {
        setError(response.message || "Invalid verification code");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to verify email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (autoLogin = false) => {
    try {
      setLoading(true);
      if (!autoLogin) setError("");

      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }
      if (!formData.password.trim()) {
        setError("Password is required");
        return;
      }

      const response = await authService.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.success && response.data) {
        setSuccess("Login successful!");

        // Store user data in localStorage
        // authService.saveUser(response.data);

        // Call success callback
        if (onSuccess) {
          onSuccess(response.data);
        }

        // Close modal after a brief delay
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      if (
        err.response?.data?.message ===
        "Please verify your email before logging in"
      ) {
        setError("Please verify your email first");
        setCurrentStep("verify");
      } else {
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      setError("");
      setSuccess("");

      const response = await authService.resendVerification(
        formData.email.trim().toLowerCase()
      );

      if (response.success) {
        setSuccess("Verification code sent! Please check your email.");
      } else {
        setError(response.message || "Failed to resend verification code");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to resend verification code. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...verifyCode];
    newCode[index] = value;
    setVerifyCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !verifyCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData
        .split("")
        .concat(Array(6).fill(""))
        .slice(0, 6);
      setVerifyCode(newCode);
      // Focus the last filled input or the next empty one
      const nextEmptyIndex = newCode.findIndex((val) => !val);
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      const input = document.getElementById(`code-input-${focusIndex}`);
      input?.focus();
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      phoneNumber: "",
      verifyCode: "",
      password: "",
      confirmPassword: "",
    });
    setVerifyCode(["", "", "", "", "", ""]);
    setCurrentStep("signup");
    setError("");
    setSuccess("");
    setTempUserData(null);
    setAgreedToTerms(false);
    setRememberMe(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderSignUpStep = () => (
    <Box>
      <Box
        sx={{
          textAlign: "center",
          mb: { xs: 2, sm: 2.5 },
          mt: { xs: 0, sm: -3.5 },
        }}
      >
        <Typography
          sx={{
            fontWeight: "700",
            color: "#000",
            mb: 0.5,
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            fontFamily: "Faustina",
            lineHeight: 1.2,
          }}
        >
          Create Your Account
        </Typography>
        <Typography
          sx={{
            color: "#6B7280",
            fontSize: { xs: "13px", sm: "14px" },
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
          }}
        >
          Start your journey to self-discovery today
        </Typography>
      </Box>

      <Box
        sx={{
          border: "1px solid #3A3A3A4D",
          borderRadius: "12px",
          py: { xs: 2, sm: 2.5 },
          px: { xs: 1.5, sm: 2 },
          bgcolor: "#FFFFFF",
        }}
        component="form"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          handleSignUp();
        }}
      >
        <Typography
          sx={{
            mb: 0.5,
            color: "#2C3E50",
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", sm: "15px" },
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
          disabled={loading}
          sx={{
            mb: { xs: 1.5, sm: 2 },
            "& .MuiOutlinedInput-root": {
              height: { xs: "44px", sm: "48px" },
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              fontSize: { xs: "14px", sm: "15px" },
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
            mb: 0.5,
            color: "#2C3E50",
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", sm: "15px" },
          }}
        >
          Email Address<span style={{ color: "#FF5722" }}>*</span>
        </Typography>
        <TextField
          placeholder="Enter your email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          fullWidth
          required
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon
                  sx={{ color: "#999", fontSize: { xs: 20, sm: 24 } }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: { xs: 1.5, sm: 2 },
            "& .MuiOutlinedInput-root": {
              height: { xs: "44px", sm: "48px" },
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              fontSize: { xs: "14px", sm: "15px" },
              "& fieldset": { border: "1px solid #3A3A3A4D" },
              "&:hover fieldset": { border: "1px solid #3A3A3A4D" },
              "&.Mui-focused fieldset": { border: "1px solid #FF5722" },
            },
          }}
        />

        <Typography
          sx={{
            mb: 0.5,
            color: "#2C3E50",
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", sm: "15px" },
          }}
        >
          Phone Number<span style={{ color: "#FF5722" }}>*</span>
        </Typography>
        <PhoneInput
          country={"us"}
          value={formData.phoneNumber}
          onChange={(phone) => handleInputChange("phoneNumber", `+${phone}`)}
          disabled={loading}
          containerStyle={{
            width: "100%",
            marginBottom: "12px",
          }}
          inputStyle={{
            width: "100%",
            height: "48px",
            borderRadius: "8px",
            border: "1px solid #3A3A3A4D",
            fontSize: "15px",
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
            mb: 0.5,
            color: "#2C3E50",
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", sm: "15px" },
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
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon
                  sx={{ color: "#999", fontSize: { xs: 20, sm: 24 } }}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ p: { xs: 0.5, sm: 1 } }}
                >
                  {showPassword ? (
                    <VisibilityOff sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  ) : (
                    <Visibility sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: { xs: 1.5, sm: 2 },
            "& .MuiOutlinedInput-root": {
              height: { xs: "44px", sm: "48px" },
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              fontSize: { xs: "14px", sm: "15px" },
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
            mb: 0.5,
            color: "#2C3E50",
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", sm: "15px" },
          }}
        >
          Confirm Password<span style={{ color: "#FF5722" }}>*</span>
        </Typography>
        <TextField
          placeholder="Confirm your password"
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          fullWidth
          required
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon
                  sx={{ color: "#999", fontSize: { xs: 20, sm: 24 } }}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  sx={{ p: { xs: 0.5, sm: 1 } }}
                >
                  {showConfirmPassword ? (
                    <VisibilityOff sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  ) : (
                    <Visibility sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: { xs: 1.5, sm: 2 },
            "& .MuiOutlinedInput-root": {
              height: { xs: "44px", sm: "48px" },
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              fontSize: { xs: "14px", sm: "15px" },
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
                padding: { xs: "6px", sm: "9px" },
              }}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontSize: { xs: "12px", sm: "14px" },
              }}
            >
              I agree to the{" "}
              <Link
                component={NextLink}
                href="/terms-conditions"
                target="_blank"
                sx={{
                  color: "#0066cc",
                  textDecoration: "none",
                  fontSize: { xs: "12px", sm: "14px" },
                }}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                component={NextLink}
                href="/privacy-policy"
                target="_blank"
                sx={{
                  color: "#0066cc",
                  textDecoration: "none",
                  fontSize: { xs: "12px", sm: "14px" },
                }}
              >
                Privacy Policy
              </Link>
            </Typography>
          }
          sx={{ mb: { xs: 1, sm: 1.5 }, ml: -0.5 }}
        />

        <ButtonSelfScore
          type="submit"
          fullWidth
          disabled={loading}
          text={
            loading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Sign Up"
            )
          }
          height="42px"
          borderRadius="12px"
          background="#FF5722"
          fontSize="15px"
          textStyle={{
            fontWeight: "600",
          }}
          style={{
            marginBottom: "12px",
            opacity: loading ? 0.7 : 1,
          }}
        />

        <Box sx={{ textAlign: "center", mb: { xs: 0, sm: -2.5 } }}>
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              fontSize: { xs: "12px", sm: "14px" },
            }}
          >
            Already have an account?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => setCurrentStep("login")}
              sx={{
                color: "#0066cc",
                fontWeight: "600",
                textDecoration: "none",
                fontSize: { xs: "12px", sm: "14px" },
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Login here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const renderLoginStep = () => (
    <Box>
      <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 2.5 } }}>
        <Typography
          sx={{
            fontWeight: "700",
            color: "#000",
            mb: 0.5,
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            fontFamily: "Faustina",
            lineHeight: 1.2,
          }}
        >
          Welcome Back
        </Typography>
        <Typography
          sx={{
            color: "#6B7280",
            fontSize: { xs: "13px", sm: "14px" },
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
          }}
        >
          Sign in to continue your journey
        </Typography>
      </Box>

      <Box
        sx={{
          border: "1px solid #3A3A3A4D",
          borderRadius: "12px",
          py: { xs: 2, sm: 2.5 },
          px: { xs: 1.5, sm: 2 },
          bgcolor: "#FFFFFF",
        }}
        component="form"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <Typography
          sx={{
            mb: 0.5,
            color: "#2C3E50",
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", sm: "15px" },
          }}
        >
          Email Address<span style={{ color: "#FF5722" }}>*</span>
        </Typography>
        <TextField
          placeholder="Enter your email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          fullWidth
          required
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon
                  sx={{ color: "#999", fontSize: { xs: 20, sm: 24 } }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: { xs: 1.5, sm: 2 },
            "& .MuiOutlinedInput-root": {
              height: { xs: "44px", sm: "48px" },
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              fontSize: { xs: "14px", sm: "15px" },
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
            mb: 0.5,
            color: "#2C3E50",
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", sm: "15px" },
          }}
        >
          Password<span style={{ color: "#FF5722" }}>*</span>
        </Typography>
        <TextField
          placeholder="Enter your password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          fullWidth
          required
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon
                  sx={{ color: "#999", fontSize: { xs: 20, sm: 24 } }}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ p: { xs: 0.5, sm: 1 } }}
                >
                  {showPassword ? (
                    <VisibilityOff sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  ) : (
                    <Visibility sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: { xs: 1.5, sm: 2 },
            "& .MuiOutlinedInput-root": {
              height: { xs: "44px", sm: "48px" },
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              fontSize: { xs: "14px", sm: "15px" },
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: { xs: 2, sm: 2.5 },
            flexWrap: { xs: "wrap", sm: "nowrap" },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                sx={{
                  color: "#999",
                  "&.Mui-checked": { color: "#FF5722" },
                  padding: { xs: "6px", sm: "9px" },
                }}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{
                  color: "#666",
                  fontSize: { xs: "12px", sm: "14px" },
                }}
              >
                Remember me
              </Typography>
            }
            sx={{ ml: -0.5 }}
          />
          <Link
            component={NextLink}
            href="/auth/forgot-password"
            target="_blank"
            sx={{
              color: "#0066cc",
              textDecoration: "none",
              fontSize: { xs: "12px", sm: "14px" },
              whiteSpace: "nowrap",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Forgot Password?
          </Link>
        </Box>

        <ButtonSelfScore
          type="submit"
          fullWidth
          disabled={loading}
          text={
            loading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Login"
            )
          }
          height="42px"
          borderRadius="12px"
          background="#FF5722"
          fontSize="15px"
          textStyle={{
            fontWeight: "600",
          }}
          style={{
            marginBottom: "12px",
            opacity: loading ? 0.7 : 1,
          }}
        />

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              fontSize: { xs: "12px", sm: "14px" },
            }}
          >
            Don't have an account?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => setCurrentStep("signup")}
              sx={{
                color: "#0066cc",
                fontWeight: "600",
                textDecoration: "none",
                fontSize: { xs: "12px", sm: "14px" },
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const renderVerifyStep = () => (
    <Box>
      <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 2.5 } }}>
        <Typography
          sx={{
            fontWeight: "700",
            color: "#000",
            mb: 0.5,
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            fontFamily: "Faustina",
            lineHeight: 1.2,
          }}
        >
          Verify Your Email
        </Typography>
        <Typography
          sx={{
            color: "#6B7280",
            fontSize: { xs: "12px", sm: "13px" },
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
            mb: 0.5,
          }}
        >
          We've sent a 6-digit code to
        </Typography>
        <Typography
          sx={{
            fontWeight: "600",
            color: "#6B7280",
            fontSize: { xs: "13px", sm: "14px" },
            fontFamily: "Source Sans Pro",
          }}
        >
          {formData.email || "your email"}
        </Typography>
      </Box>

      <Box
        sx={{
          border: "1px solid #3A3A3A4D",
          borderRadius: "12px",
          py: { xs: 2, sm: 2.5 },
          px: { xs: 1.5, sm: 2 },
          bgcolor: "#FFFFFF",
        }}
        component="form"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          handleVerifyEmail();
        }}
      >
        <Typography
          sx={{
            mb: { xs: 1.5, sm: 2 },
            textAlign: "center",
            color: "#141414",
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", sm: "15px" },
          }}
        >
          Enter Verification Code
        </Typography>

        {/* 6-digit code input boxes */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 0.75, sm: 1 },
            justifyContent: "center",
            mb: { xs: 2, sm: 2.5 },
          }}
        >
          {verifyCode.map((digit, index) => (
            <TextField
              key={index}
              id={`code-input-${index}`}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) =>
                handleKeyDown(index, e as React.KeyboardEvent<HTMLInputElement>)
              }
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={loading}
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "600",
                  padding: "0",
                },
              }}
              sx={{
                width: { xs: "38px", sm: "46px" },
                "& .MuiOutlinedInput-root": {
                  height: { xs: "38px", sm: "46px" },
                  borderRadius: "8px",
                  bgcolor: "#FFFFFF",
                  "& fieldset": { border: "1px solid #E5E7EB" },
                  "&:hover fieldset": { border: "1px solid #9CA3AF" },
                  "&.Mui-focused fieldset": {
                    border: "2px solid #FF5722",
                  },
                },
                "& input": {
                  fontFamily: "Source Sans Pro",
                },
              }}
            />
          ))}
        </Box>

        <Typography
          sx={{
            textAlign: "center",
            mb: { xs: 2, sm: 2.5 },
            color: "#6B7280",
            fontSize: { xs: "12px", sm: "14px" },
            fontFamily: "Source Sans Pro",
          }}
        >
          Didn't receive the code?{" "}
          <Link
            component="button"
            type="button"
            onClick={handleResendVerification}
            disabled={resendLoading}
            sx={{
              color: "#005F73",
              fontWeight: "400",
              fontFamily: "Source Sans Pro",
              textDecoration: "none",
              fontSize: { xs: "12px", sm: "14px" },
              cursor: resendLoading ? "not-allowed" : "pointer",
              opacity: resendLoading ? 0.5 : 1,
              "&:hover": {
                textDecoration: !resendLoading ? "underline" : "none",
              },
            }}
          >
            Resend
          </Link>
        </Typography>

        <ButtonSelfScore
          type="submit"
          fullWidth
          disabled={loading || verifyCode.join("").length !== 6}
          text={
            loading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Verify"
            )
          }
          height="42px"
          borderRadius="12px"
          background="#FF5722"
          fontSize="15px"
          textStyle={{
            fontWeight: "600",
          }}
          style={{
            marginBottom: "12px",
            opacity: loading || verifyCode.join("").length !== 6 ? 0.7 : 1,
          }}
        />

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              color: "#6B7280",
              fontSize: { xs: "12px", sm: "14px" },
            }}
          >
            Wrong Email? Back to{" "}
            <Link
              component="button"
              type="button"
              onClick={() => setCurrentStep("signup")}
              sx={{
                color: "#6B7280",
                fontWeight: "400",
                textDecoration: "none",
                fontSize: { xs: "12px", sm: "14px" },
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
          handleClose();
        }
      }}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: { xs: "16px", sm: "24px" },
          width: { xs: "95%", sm: "500px", md: "550px" },
          maxWidth: "95vw",
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: "95vh", sm: "90vh" },
          overflow: "visible",
          position: "relative",
        },
      }}
      sx={{
        "& .MuiDialog-container": {
          alignItems: { xs: "flex-start", sm: "center" },
          pt: { xs: 2, sm: 0 },
        },
      }}
    >
      <Box sx={{ position: "relative", bgcolor: "#FFFFFF" }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: { xs: 8, sm: 12 },
            top: { xs: 8, sm: 12 },
            zIndex: 10,
            bgcolor: "#F5F5F5",
            "&:hover": { bgcolor: "#E0E0E0" },
            width: { xs: 32, sm: 36 },
            height: { xs: 32, sm: 36 },
          }}
        >
          <CloseIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
        </IconButton>

        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            pt: { xs: 5, sm: 5.5 },
            pb: { xs: 2, sm: 3 },
            overflowY: "auto",
            overflowX: "hidden",
            maxHeight: { xs: "calc(95vh - 16px)", sm: "calc(90vh - 32px)" },
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#555",
            },
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                fontSize: { xs: "12px", sm: "14px" },
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                fontSize: { xs: "12px", sm: "14px" },
              }}
            >
              {success}
            </Alert>
          )}

          {currentStep === "signup" && renderSignUpStep()}
          {currentStep === "login" && renderLoginStep()}
          {currentStep === "verify" && renderVerifyStep()}
        </Box>
      </Box>
    </Dialog>
  );
}
