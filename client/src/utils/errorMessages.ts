/**
 * Error message utility for converting technical/API errors to user-friendly messages
 */

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
      errors?: Array<{
        message?: string;
        path?: string[];
      }>;
    };
    status?: number;
  };
  message?: string;
}

/**
 * Get user-friendly error message from API error response
 */
export const getUserFriendlyError = (
  error: ErrorResponse | any,
  context:
    | "signup"
    | "signin"
    | "verify"
    | "forgot"
    | "reset"
    | "profile" = "signin"
): string => {
  // Handle network errors
  if (!error.response) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  const { status, data } = error.response;
  const message = data?.message || "";

  // Handle validation errors from Zod
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    if (firstError.message) {
      return formatValidationError(firstError.message);
    }
  }

  // Common error messages mapping
  const errorMappings: Record<string, string> = {
    // Sign Up errors
    "User with this email already exists":
      "An account with this email already exists. Please sign in or use a different email.",

    // Sign In errors
    "User with this email does not exist":
      "No account found with this email. Please check your email or create a new account.",
    "Incorrect password":
      "The password you entered is incorrect. Please try again or reset your password.",
    "Please verify your email before logging in":
      "Your email is not verified yet. Please check your inbox for the verification code.",

    // Verification errors
    "User is already verified":
      "Your email is already verified. You can proceed to sign in.",
    "Verification code has expired. Please request a new one":
      "Your verification code has expired. Please click 'Resend Code' to get a new one.",
    "Invalid verification code":
      "The verification code you entered is incorrect. Please check and try again.",

    // Forgot/Reset Password errors
    "Invalid or expired reset token":
      "This password reset link has expired or is invalid. Please request a new one.",

    // Profile update errors
    "Email already in use by another account":
      "This email is already registered with another account. Please use a different email.",
    "No pending email change for this address":
      "No email change request found. Please try updating your email again.",

    // General errors
    "Validation failed":
      "Please check your information and ensure all required fields are filled correctly.",
    "Internal Server Error":
      "Something went wrong on our end. Please try again in a few moments.",
    "Database connection not available. Please try again later.":
      "We're experiencing technical difficulties. Please try again in a few minutes.",
  };

  // Check for exact matches
  if (errorMappings[message]) {
    return errorMappings[message];
  }

  // Handle status codes
  switch (status) {
    case 400:
      return (
        message ||
        "Invalid request. Please check your information and try again."
      );
    case 401:
      if (context === "signin") {
        return "Invalid email or password. Please try again.";
      }
      return message || "Authentication failed. Please try again.";
    case 403:
      return "Access denied. You don't have permission to perform this action.";
    case 404:
      if (context === "signin") {
        return "No account found with this email. Please check your email or sign up.";
      }
      return message || "The requested resource was not found.";
    case 429:
      return "Too many attempts. Please wait a few minutes before trying again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "We're experiencing technical difficulties. Please try again in a few moments.";
    default:
      break;
  }

  // Fallback to original message if it's user-friendly enough
  if (message && message.length < 150 && !message.includes("Error:")) {
    return message;
  }

  // Final fallback based on context
  const contextFallbacks: Record<typeof context, string> = {
    signup: "Unable to create your account. Please try again.",
    signin: "Unable to sign in. Please check your credentials and try again.",
    verify: "Verification failed. Please try again or request a new code.",
    forgot: "Unable to send reset link. Please try again.",
    reset:
      "Unable to reset your password. Please try again or request a new reset link.",
    profile: "Unable to update your profile. Please try again.",
  };

  return contextFallbacks[context];
};

/**
 * Format validation error messages to be more user-friendly
 */
const formatValidationError = (message: string): string => {
  const validationMappings: Record<string, string> = {
    "String must contain at least":
      "This field is too short. Please enter more characters.",
    "String must contain at most":
      "This field is too long. Please use fewer characters.",
    "Invalid email":
      "Please enter a valid email address (e.g., name@example.com).",
    Required: "This field is required. Please fill it in.",
    "Expected string": "Please enter text in this field.",
    "Expected number": "Please enter a valid number.",
    "Passwords don't match":
      "The passwords you entered don't match. Please try again.",
    "Password must be at least":
      "Your password must be at least 6 characters long.",
  };

  for (const [key, value] of Object.entries(validationMappings)) {
    if (message.includes(key)) {
      return value;
    }
  }

  return message;
};

/**
 * Get user-friendly success message
 */
export const getSuccessMessage = (
  action:
    | "signup"
    | "signin"
    | "verify"
    | "forgot"
    | "reset"
    | "resend"
    | "profile"
): string => {
  const successMappings: Record<typeof action, string> = {
    signup:
      "Account created successfully! Please check your email for the verification code.",
    signin: "Welcome back! Redirecting to your dashboard...",
    verify: "Email verified successfully! You can now sign in to your account.",
    forgot:
      "Password reset instructions have been sent to your email. Please check your inbox.",
    reset:
      "Your password has been reset successfully! You can now sign in with your new password.",
    resend: "Verification code sent! Please check your email.",
    profile: "Your profile has been updated successfully.",
  };

  return successMappings[action];
};
