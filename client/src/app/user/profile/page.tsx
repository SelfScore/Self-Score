"use client";

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Alert,
} from "@mui/material";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Person, Edit, Save, Cancel } from "@mui/icons-material";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin");
    } else if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [isAuthenticated, user, router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Implement profile update API call
      console.log("Saving profile:", formData);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error("Error updating profile:", error);
      // Show error message
    }
  };

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", color: "#005F73", mb: 4 }}
      >
        Profile Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Summary Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "fit-content" }}>
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  backgroundColor: "#E87A42",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  mx: "auto",
                  mb: 2,
                }}
              >
                {user?.username?.charAt(0) || user?.email?.charAt(0) || "U"}
              </Avatar>

              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                {user?.username}
              </Typography>

              <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
                {user?.email}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    sx={{
                      borderColor: "#E87A42",
                      color: "#E87A42",
                      "&:hover": {
                        backgroundColor: "rgba(232, 122, 66, 0.1)",
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      sx={{
                        backgroundColor: "#E87A42",
                        "&:hover": { backgroundColor: "#D16A35" },
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      sx={{
                        borderColor: "#666",
                        color: "#666",
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
              Personal Information
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={handleInputChange("username")}
                  disabled={!isEditing}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#E87A42",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#E87A42",
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  disabled={!isEditing}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#E87A42",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#E87A42",
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange("phoneNumber")}
                  disabled={!isEditing}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#E87A42",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#E87A42",
                    },
                  }}
                />
              </Grid>
            </Grid>

            {isEditing && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  Profile update functionality will be implemented with backend
                  integration.
                </Typography>
              </Alert>
            )}
          </Paper>

          {/* Account Actions */}
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
              Account Actions
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.push("/user/dashboard")}
                sx={{
                  justifyContent: "flex-start",
                  py: 1.5,
                  borderColor: "#005F73",
                  color: "#005F73",
                  "&:hover": {
                    backgroundColor: "rgba(0, 95, 115, 0.1)",
                  },
                }}
              >
                <Person sx={{ mr: 1 }} />
                Back to Dashboard
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={() => router.push("/auth/logout")}
                sx={{
                  justifyContent: "flex-start",
                  py: 1.5,
                }}
              >
                Sign Out
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
