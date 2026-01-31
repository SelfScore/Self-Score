"use client";

import {
  Container,
  Typography,
  TextField,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Stack,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Edit,
  Save,
  Cancel,
  Dashboard,
  Logout,
  Email,
  AccountCircle,
  // ArrowBack,
} from "@mui/icons-material";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import OutLineButton from "@/app/components/ui/OutLineButton";
import EmailVerificationModal from "@/app/components/ui/EmailVerificationModal";
import LogoutConfirmationModal from "@/app/components/ui/LogoutConfirmationModal";
import { authService } from "@/services/authService";
import { getUserFriendlyError, getSuccessMessage } from "@/utils/errorMessages";

export default function ProfilePage() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { logout } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    countryCode: "",
    phoneNumber: "",
  });

  const [originalData, setOriginalData] = useState({
    username: "",
    email: "",
    countryCode: "",
    phoneNumber: "",
  });

  useEffect(() => {
    // Only redirect after auth state is initialized
    if (isInitialized && !isAuthenticated) {
      router.push("/auth/signin");
    } else if (user) {
      const userData = {
        username: user.username || "",
        email: user.email || "",
        countryCode: user.countryCode || "+1",
        phoneNumber: user.phoneNumber || "",
      };
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [isAuthenticated, isInitialized, user, router]);

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(originalData);
    setError("");
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      // Validate username
      if (formData.username.trim().length < 3) {
        setError("Name must be at least 3 characters long");
        setLoading(false);
        return;
      }

      // Validate phone number
      if (formData.phoneNumber && formData.phoneNumber.trim().length < 7) {
        setError("Phone number must be at least 7 digits long");
        setLoading(false);
        return;
      }

      // Check what changed
      const updates: any = {};
      if (formData.username !== originalData.username) {
        updates.username = formData.username;
      }
      if (formData.countryCode !== originalData.countryCode) {
        updates.countryCode = formData.countryCode;
      }
      if (formData.phoneNumber !== originalData.phoneNumber) {
        updates.phoneNumber = formData.phoneNumber;
      }
      if (formData.email !== originalData.email) {
        updates.email = formData.email;
      }

      if (Object.keys(updates).length === 0) {
        setError("No changes were made to your profile");
        setLoading(false);
        return;
      }

      const response = await authService.updateProfile(updates);

      if (response.success) {
        // Check if email verification is pending
        if ((response.data as any)?.emailVerificationPending) {
          setPendingEmail(formData.email);
          setShowEmailVerification(true);
          setSuccessMessage(
            "Verification code sent to your new email address. Please check your inbox."
          );
          setShowSuccessMessage(true);
        } else {
          // Update successful
          setOriginalData(formData);
          setIsEditing(false);
          setSuccessMessage(getSuccessMessage("profile"));
          setShowSuccessMessage(true);
        }
      }
    } catch (err: any) {
      setError(getUserFriendlyError(err, "profile"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (code: string) => {
    await authService.verifyEmailUpdate({
      newEmail: pendingEmail,
      verifyCode: code,
    });

    // Update local state
    const newData = { ...formData, email: pendingEmail };
    setFormData(newData);
    setOriginalData(newData);
    setShowEmailVerification(false);
    setIsEditing(false);
    setSuccessMessage("Email updated successfully!");
    setShowSuccessMessage(true);
  };

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setError("");
    };

  const handlePhoneChange = (phone: string, country: any) => {
    setFormData((prev) => ({
      ...prev,
      phoneNumber: phone.slice(country.dialCode.length),
      countryCode: `+${country.dialCode}`,
    }));
    setError("");
  };

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.2rem",
            color: "#005F73",
            fontFamily: "Source Sans Pro",
          }}
        >
          Loading...
        </Typography>
      </Box>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        py: { xs: 12, md: 16 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        {/* Header Section - matching dashboard style */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            mb: 4,
            p: { xs: 2, md: 3 },
            backgroundColor: "#FFF",
            borderRadius: "16px",
            border: "1px solid #3A3A3A4D",
            gap: { xs: 2, md: 0 },
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "#2B2B2B",
                fontFamily: "Faustina",
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                mb: 0.5,
              }}
            >
              Profile Settings
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "0.875rem", md: "1rem" },
              }}
            >
              Manage your account information and preferences
            </Typography>
          </Box>
          <Box
            sx={{
              px: { xs: 2, md: 2.5 },
              py: { xs: 1, md: 1.5 },
              backgroundColor: "#f1f5f9",
              borderRadius: "8px",
            }}
          >
            <Typography
              sx={{
                color: "#475569",
                fontWeight: 600,
                fontSize: { xs: "0.75rem", md: "0.875rem" },
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Profile Summary Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: "fit-content",
                borderRadius: "16px",
                boxShadow: "none",
                backgroundColor: "#F7F7F7",
                border: "1px solid #3A3A3A4D",
              }}
            >
              <CardContent sx={{ textAlign: "center", p: { xs: 2.5, md: 3 } }}>
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-block",
                    mb: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 100, md: 120 },
                      height: { xs: 100, md: 120 },
                      background:
                        "linear-gradient(135deg, #FF4F00 0%, #E87A42 100%)",
                      fontSize: "2.5rem",
                      fontWeight: "bold",
                      border: "4px solid #fff",
                      boxShadow: "0 8px 24px rgba(232, 122, 66, 0.3)",
                    }}
                  >
                    {user?.username?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </Avatar>
                  {!isEditing && (
                    <IconButton
                      onClick={handleEdit}
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: -8,
                        backgroundColor: "#FF4F00",
                        color: "#fff",
                        width: 36,
                        height: 36,
                        border: "3px solid #fff",
                        "&:hover": {
                          backgroundColor: "#E87A42",
                        },
                      }}
                    >
                      <Edit sx={{ fontSize: "1rem" }} />
                    </IconButton>
                  )}
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    color: "#1A1A1A",
                    fontFamily: "Faustina",
                  }}
                >
                  {user?.username}
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                  sx={{ mb: 3 }}
                >
                  <Email sx={{ fontSize: "1rem", color: "#666" }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      fontFamily: "Source Sans Pro",
                    }}
                  >
                    {user?.email}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* Quick Stats */}
                <Box sx={{ mb: 3 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#666",
                          fontFamily: "Source Sans Pro",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Member Since
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#1A1A1A",
                          fontFamily: "Source Sans Pro",
                        }}
                      >
                        {new Date().toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {isEditing && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mt: 3,
                      flexDirection: "column",
                    }}
                  >
                    <ButtonSelfScore
                      text={
                        loading ? (
                          <CircularProgress size={20} sx={{ color: "#fff" }} />
                        ) : (
                          "Save Changes"
                        )
                      }
                      onClick={handleSave}
                      startIcon={
                        loading ? undefined : <Save sx={{ color: "#FFF" }} />
                      }
                      disabled={loading}
                      fullWidth
                      height={44}
                      style={{
                        borderRadius: "12px",
                        fontFamily: "Source Sans Pro",
                        opacity: loading ? 0.7 : 1,
                      }}
                    />
                    <OutLineButton
                      onClick={handleCancel}
                      startIcon={<Cancel />}
                      disabled={loading}
                      fullWidth
                      sx={{
                        height: "44px",
                        fontFamily: "Source Sans Pro",
                      }}
                    >
                      Cancel
                    </OutLineButton>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card
              sx={{
                mt: { xs: 2, md: 3 },
                borderRadius: "16px",
                boxShadow: "none",
                backgroundColor: "#FFF",
                border: "1px solid #3A3A3A4D",
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: "#1A1A1A",
                    fontFamily: "Faustina",
                    fontSize: "1.1rem",
                  }}
                >
                  Quick Actions
                </Typography>

                <Stack spacing={2}>
                  <ButtonSelfScore
                    text="Go to Dashboard"
                    onClick={() => router.push("/user/dashboard")}
                    startIcon={<Dashboard sx={{color:"#FFF"}} />}
                    fullWidth
                    height={44}
                    background="#005F73"
                    style={{
                      borderRadius: "12px",
                      fontFamily: "Source Sans Pro",
                    }}
                  />

                  <OutLineButton
                    onClick={() => setShowLogoutModal(true)}
                    startIcon={<Logout />}
                    fullWidth
                    sx={{
                      height: "44px",
                      borderColor: "#D32F2F",
                      color: "#D32F2F",
                      fontFamily: "Source Sans Pro",
                      "&:hover": {
                        borderColor: "#B71C1C",
                        backgroundColor: "rgba(211, 47, 47, 0.04)",
                      },
                    }}
                  >
                    Sign Out
                  </OutLineButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "none",
                backgroundColor: "#FFF",
                border: "1px solid #3A3A3A4D",
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 4,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: "#1A1A1A",
                        fontFamily: "Faustina",
                        mb: 0.5,
                      }}
                    >
                      Personal Information
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontFamily: "Source Sans Pro",
                      }}
                    >
                      Update your personal details
                    </Typography>
                  </Box>

                  {!isEditing && (
                    <IconButton
                      onClick={handleEdit}
                      sx={{
                        backgroundColor: "#FF4F00",
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: "#E87A42",
                        },
                      }}
                    >
                      <Edit />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontFamily: "Source Sans Pro",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Username
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleInputChange("username")}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <AccountCircle
                            sx={{ mr: 1, color: "#005F73", opacity: 0.7 }}
                          />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          fontFamily: "Source Sans Pro",
                          backgroundColor: isEditing ? "#fff" : "#F8FAFB",
                          "& fieldset": {
                            borderColor: "rgba(0, 95, 115, 0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(0, 95, 115, 0.4)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FF4F00",
                            borderWidth: "2px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontFamily: "Source Sans Pro",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#FF4F00",
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontFamily: "Source Sans Pro",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Email Address
                    </Typography>
                    <TextField
                      fullWidth
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <Email
                            sx={{ mr: 1, color: "#005F73", opacity: 0.7 }}
                          />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          fontFamily: "Source Sans Pro",
                          backgroundColor: isEditing ? "#fff" : "#F8FAFB",
                          "& fieldset": {
                            borderColor: "rgba(0, 95, 115, 0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(0, 95, 115, 0.4)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FF4F00",
                            borderWidth: "2px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontFamily: "Source Sans Pro",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#FF4F00",
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontFamily: "Source Sans Pro",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Phone Number
                    </Typography>
                    <PhoneInput
                      country={"us"}
                      value={formData.countryCode + formData.phoneNumber}
                      onChange={handlePhoneChange}
                      disabled={!isEditing}
                      containerStyle={{
                        width: "100%",
                      }}
                      inputStyle={{
                        width: "100%",
                        height: "48px",
                        borderRadius: "12px",
                        border: "1px solid rgba(0, 95, 115, 0.2)",
                        fontSize: "16px",
                        paddingLeft: "48px",
                        fontFamily: "Source Sans Pro",
                        backgroundColor: isEditing ? "#fff" : "#F8FAFB",
                        color: "#000000",
                      }}
                      buttonStyle={{
                        borderRadius: "12px 0 0 12px",
                        border: "1px solid rgba(0, 95, 115, 0.2)",
                        backgroundColor: isEditing ? "#fff" : "#F8FAFB",
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
                        border: "1px solid rgba(0, 95, 115, 0.2)",
                        borderRadius: "4px",
                        color: "#000000",
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  </Grid>
                </Grid>

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mt: 3,
                      borderRadius: "12px",
                      fontFamily: "Source Sans Pro",
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {isEditing && (
                  <Alert
                    severity="info"
                    sx={{
                      mt: 4,
                      borderRadius: "12px",
                      backgroundColor: "rgba(0, 95, 115, 0.08)",
                      border: "1px solid rgba(0, 95, 115, 0.2)",
                      "& .MuiAlert-icon": {
                        color: "#005F73",
                      },
                      fontFamily: "Source Sans Pro",
                    }}
                  >
                    <Typography variant="body2">
                      <strong>Note:</strong> If you change your email,
                      you&apos;ll need to verify it before the change takes
                      effect.
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card
              sx={{
                mt: { xs: 2, md: 3 },
                borderRadius: "16px",
                boxShadow: "none",
                background: "#005F73",
                border: "none",
                color: "#fff",
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    fontFamily: "Faustina",
                  }}
                >
                  Account Status
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.8,
                          display: "block",
                          mb: 0.5,
                          fontFamily: "Source Sans Pro",
                        }}
                      >
                        Email Verified
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontFamily: "Source Sans Pro",
                        }}
                      >
                        ✓ Verified
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.8,
                          display: "block",
                          mb: 0.5,
                          fontFamily: "Source Sans Pro",
                        }}
                      >
                        Account Type
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontFamily: "Source Sans Pro",
                        }}
                      >
                        User
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Email Verification Modal */}
        <EmailVerificationModal
          open={showEmailVerification}
          newEmail={pendingEmail}
          onClose={() => setShowEmailVerification(false)}
          onVerify={handleVerifyEmail}
        />

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccessMessage}
          autoHideDuration={3000}
          onClose={() => setShowSuccessMessage(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowSuccessMessage(false)}
            severity="success"
            sx={{
              borderRadius: "12px",
              fontFamily: "Source Sans Pro",
            }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Logout Confirmation Modal */}
        <LogoutConfirmationModal
          open={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={async () => {
            setLogoutLoading(true);
            try {
              await logout();
              router.push("/");
            } finally {
              setLogoutLoading(false);
              setShowLogoutModal(false);
            }
          }}
          loading={logoutLoading}
        />
      </Container>
    </Box>
  );
}
