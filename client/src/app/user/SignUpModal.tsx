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
  MenuItem,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import EmailIcon from "@mui/icons-material/Email";
import PublicIcon from "@mui/icons-material/Public";
import PersonIcon from "@mui/icons-material/Person";
import WcIcon from "@mui/icons-material/Wc";
import CakeIcon from "@mui/icons-material/Cake";
import { useState } from "react";
import { authService, UserData } from "../../services/authService";
import NextLink from "next/link";
import ButtonSelfScore from "../components/ui/ButtonSelfScore";
import { getNames } from "country-list";
import {
  getUserFriendlyError,
  getSuccessMessage,
} from "../../utils/errorMessages";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (userData: any) => void;
}

type AuthStep = "login" | "signup" | "verify";

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;
const AGE_GROUP_OPTIONS = [
  "Under 18",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+",
] as const;

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
    country: "",
    gender: "",
    ageGroup: "",
  });

  const [_tempUserData, setTempUserData] = useState<UserData | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [verifyCode, setVerifyCode] = useState(["", "", "", "", "", ""]);
  const [resendLoading, setResendLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError("");

      // Validation
      if (!formData.username.trim()) {
        setError("Please enter your full name");
        return;
      }
      if (formData.username.trim().length < 2) {
        setError("Name must be at least 2 characters long");
        return;
      }
      if (formData.username.trim().length > 50) {
        setError("Name must not exceed 50 characters");
        return;
      }
      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address (e.g., name@example.com)");
        return;
      }
      if (!formData.country.trim()) {
        setError("Please select your country");
        return;
      }
      if (!formData.gender) {
        setError("Please select your gender");
        return;
      }
      if (!formData.ageGroup) {
        setError("Please select your age group");
        return;
      }
      if (!agreedToTerms) {
        setError(
          "Please agree to the Terms of Service and Privacy Policy to continue"
        );
        return;
      }

      const response = await authService.signUp({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        country: formData.country.trim(),
        gender: formData.gender,
        ageGroup: formData.ageGroup,
      });

      if (response.success) {
        setTempUserData(response.data || null);
        setSuccess(getSuccessMessage("signup"));
        setCurrentStep("verify");
      } else {
        setError(
          getUserFriendlyError(
            { response: { data: { message: response.message } } },
            "signup"
          )
        );
      }
    } catch (err: any) {
      setError(getUserFriendlyError(err, "signup"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address (e.g., name@example.com)");
        return;
      }

      const response = await authService.login({
        email: formData.email.trim().toLowerCase(),
      });

      if (response.success) {
        setSuccess("Login code sent to your email!");
        setCurrentStep("verify");
      } else {
        setError(
          getUserFriendlyError(
            { response: { data: { message: response.message } } },
            "signin"
          )
        );
      }
    } catch (err: any) {
      setError(getUserFriendlyError(err, "signin"));
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
        setError("Please enter all 6 digits of the verification code");
        return;
      }

      const response = await authService.verifyEmail({
        email: formData.email.trim().toLowerCase(),
        verifyCode: code,
      });

      if (response.success && response.data) {
        setSuccess("Verification successful!");
        if (onSuccess) {
          onSuccess(response.data);
        }
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else {
        setError(
          getUserFriendlyError(
            { response: { data: { message: response.message } } },
            "verify"
          )
        );
      }
    } catch (err: any) {
      setError(getUserFriendlyError(err, "verify"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      setError("");

      const response = await authService.resendVerification(
        formData.email.trim().toLowerCase()
      );

      if (response.success) {
        setSuccess(getSuccessMessage("resend"));
      } else {
        setError(
          getUserFriendlyError(
            { response: { data: { message: response.message } } },
            "verify"
          )
        );
      }
    } catch (err: any) {
      setError(getUserFriendlyError(err, "verify"));
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...verifyCode];
    newCode[index] = value;
    setVerifyCode(newCode);
    setError("");

    if (value && index < 5) {
      const nextInput = document.getElementById(`modal-code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !verifyCode[index] && index > 0) {
      const prevInput = document.getElementById(`modal-code-input-${index - 1}`);
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
      const nextEmptyIndex = newCode.findIndex((val) => !val);
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      const input = document.getElementById(`modal-code-input-${focusIndex}`);
      input?.focus();
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      country: "",
      gender: "",
      ageGroup: "",
    });
    setVerifyCode(["", "", "", "", "", ""]);
    setCurrentStep("signup");
    setError("");
    setSuccess("");
    setTempUserData(null);
    setAgreedToTerms(false);
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
        {/* Full Name */}
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: "#999", fontSize: 20 }} />
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

        {/* Email Address */}
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

        {/* Country */}
        <Typography
          sx={{
            mb: 0.5,
            color: "#2C3E50",
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", sm: "15px" },
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
          disabled={loading}
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
        >
          {getNames().map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>

        {/* Gender */}
        <Typography
          sx={{
            mb: 0.5,
            color: "#2C3E50",
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", sm: "15px" },
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
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <WcIcon sx={{ color: "#999", fontSize: { xs: 20, sm: 24 } }} />
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
            mb: 0.5,
            color: "#2C3E50",
            fontWeight: 400,
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", sm: "15px" },
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
          disabled={loading}
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
              "Create Account & Get Code"
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
          Enter your email to receive a secure login code
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
            mb: { xs: 2, sm: 2.5 },
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

        <ButtonSelfScore
          type="submit"
          fullWidth
          disabled={loading}
          text={
            loading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Get Login Code"
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
          Enter Verification Code
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
            color: "#005F73",
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
          Enter 6-Digit Code
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
              id={`modal-code-input-${index}`}
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
              fontWeight: "600",
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
            {resendLoading ? "Sending..." : "Resend Code"}
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
              "Verify & Continue"
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
