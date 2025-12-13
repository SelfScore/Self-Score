"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  Divider,
} from "@mui/material";
import {
  HourglassEmpty,
  CheckCircle,
  Cancel,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  EventAvailable,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { consultantAuthService } from "@/services/consultantAuthService";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
// import { calcomService } from "@/services/calcomService";
// import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
// import {
//   EventAvailable,
//   Link as LinkIcon,
//   CheckCircleOutline,
// } from "@mui/icons-material";

export default function ConsultantDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [consultant, setConsultant] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [calendarStatus, setCalendarStatus] = useState<any>(null);
  const [checkingCalendar, setCheckingCalendar] = useState(false);

  useEffect(() => {
    // Check if consultant data is available in sessionStorage (from registration)
    const storedData = sessionStorage.getItem("consultantData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setConsultant(parsedData);
        setLoading(false);
        // Clear it after using
        sessionStorage.removeItem("consultantData");
        // Still fetch fresh data in background
        fetchConsultantDataSilently();
      } catch (_e) {
        fetchConsultantData();
      }
    } else {
      fetchConsultantData();
    }
  }, []);

  useEffect(() => {
    // Check calendar connection status
    if (consultant) {
      checkCalendarConnection();
    }
  }, [consultant]);

  const checkCalendarConnection = async () => {
    try {
      setCheckingCalendar(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/google-calendar/status`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        setCalendarStatus(data.data);
      }
    } catch (error) {
      console.error("Error checking calendar status:", error);
    } finally {
      setCheckingCalendar(false);
    }
  };

  const handleConnectCalendar = () => {
    // Store consultant ID for Step 5
    if (consultant?._id) {
      sessionStorage.setItem("consultantId", consultant._id);
      sessionStorage.setItem("consultantCurrentStep", "5");
    }
    // Redirect to Step 5 of registration
    router.push("/consultant/register?step=5");
  };

  // useEffect(() => {
  //   // Fetch Cal.com status if consultant is approved
  //   if (consultant?.applicationStatus === "approved") {
  //     fetchCalcomStatus();
  //   }
  // }, [consultant]);

  // const fetchCalcomStatus = async () => {
  //   try {
  //     const response = await calcomService.getStatus();
  //     if (response.success) {
  //       setCalcomStatus(response.data);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch Cal.com status:", error);
  //   }
  // };

  // const handleConnectCalcom = async () => {
  //   setCalcomLoading(true);
  //   try {
  //     await calcomService.initiateOAuthFlow();
  //   } catch (error: any) {
  //     console.error("Failed to connect Cal.com:", error);
  //     setError(error.message || "Failed to connect Cal.com");
  //   } finally {
  //     setCalcomLoading(false);
  //   }
  // };

  // const handleDisconnectCalcom = async () => {
  //   if (!confirm("Are you sure you want to disconnect Cal.com?")) return;

  //   setCalcomLoading(true);
  //   try {
  //     const response = await calcomService.disconnect();
  //     if (response.success) {
  //       setCalcomStatus({ isConnected: false });
  //     }
  //   } catch (error: any) {
  //     console.error("Failed to disconnect Cal.com:", error);
  //     setError(error.message || "Failed to disconnect Cal.com");
  //   } finally {
  //     setCalcomLoading(false);
  //   }
  // };

  const fetchConsultantDataSilently = async () => {
    try {
      const response = await consultantAuthService.getCurrentConsultant();
      if (response.success && response.data) {
        setConsultant(response.data);
      }
    } catch (error) {
      console.error("Background fetch error:", error);
    }
  };

  const fetchConsultantData = async () => {
    setLoading(true);
    try {
      const response = await consultantAuthService.getCurrentConsultant();

      if (response.success && response.data) {
        setConsultant(response.data);
        setError("");
      } else {
        setError("Failed to load consultant data");
        setTimeout(() => {
          router.push("/consultant/login");
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error fetching consultant:", error);

      // Check if it's actually an auth error
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        setError("Please log in to continue");
        setTimeout(() => {
          router.push("/consultant/login");
        }, 1000);
      } else {
        setError(
          "Failed to load consultant data. Please try refreshing the page."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: <HourglassEmpty sx={{ fontSize: 48, color: "#FF9800" }} />,
          color: "#FF9800",
          bgColor: "#FFF3E0",
          title: "Application Under Review",
          message:
            "Thank you for your application! Our team is currently reviewing your profile and credentials. You'll receive an email notification once your application has been reviewed.",
        };
      case "approved":
        return {
          icon: <CheckCircle sx={{ fontSize: 48, color: "#4CAF50" }} />,
          color: "#4CAF50",
          bgColor: "#E8F5E9",
          title: "Application Approved!",
          message:
            "Congratulations! Your application has been approved. You can now start accepting clients and offering your coaching services.",
        };
      case "rejected":
        return {
          icon: <Cancel sx={{ fontSize: 48, color: "#F44336" }} />,
          color: "#F44336",
          bgColor: "#FFEBEE",
          title: "Application Not Approved",
          message:
            consultant?.rejectionReason ||
            "Unfortunately, we are unable to approve your application at this time. Please contact us for more information.",
        };
      default:
        return {
          icon: <HourglassEmpty sx={{ fontSize: 48, color: "#999" }} />,
          color: "#999",
          bgColor: "#F5F5F5",
          title: "Status Unknown",
          message: "Please contact support for assistance.",
        };
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9F9F9",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#005F73" }} />
      </Box>
    );
  }

  if (error || !consultant) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">
          {error || "Failed to load consultant data"}
        </Alert>
      </Container>
    );
  }

  const statusInfo = getStatusInfo(consultant.applicationStatus);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F9F9F9",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "Faustina",
              fontSize: { xs: "28px", md: "36px" },
              fontWeight: 700,
              color: "#1A1A1A",
              mb: 1,
              mt:8
            }}
          >
            Welcome, {consultant.firstName}!
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: { xs: "14px", md: "16px" },
              color: "#666",
            }}
          >
            Consultant Dashboard
          </Typography>
        </Box>

        {/* Application Status Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            backgroundColor: statusInfo.bgColor,
            borderRadius: "12px",
            border: `2px solid ${statusInfo.color}`,
            textAlign: "center",
          }}
        >
          <Box sx={{ mb: 2 }}>{statusInfo.icon}</Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "Faustina",
              fontSize: "24px",
              fontWeight: 700,
              color: statusInfo.color,
              mb: 1,
            }}
          >
            {statusInfo.title}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "16px",
              color: "#666",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            {statusInfo.message}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Chip
              label={`Status: ${consultant.applicationStatus.toUpperCase()}`}
              sx={{
                backgroundColor: statusInfo.color,
                color: "white",
                fontFamily: "Source Sans Pro",
                fontWeight: 600,
                fontSize: "14px",
              }}
            />
          </Box>

          {/* Calendar Connection Status */}
          {consultant.applicationStatus === "approved" && !checkingCalendar && (
            <Box sx={{ mt: 3 }}>
              {calendarStatus?.isConnected ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    p: 2,
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #4CAF50",
                  }}
                >
                  <EventAvailable sx={{ color: "#4CAF50", fontSize: 20 }} />
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#4CAF50",
                    }}
                  >
                    Calendar Connected: {calendarStatus.email}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "14px",
                        mb: 1,
                      }}
                    >
                      <strong>Connect your calendar</strong> to start accepting
                      bookings from clients.
                    </Typography>
                  </Alert>
                  <ButtonSelfScore
                    text="Connect Google Calendar"
                    onClick={handleConnectCalendar}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </Paper>

        {/* Cal.com Integration Card - Only show if approved */}
        {/* {consultant.applicationStatus === "approved" && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px solid #E0E0E0",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <EventAvailable sx={{ fontSize: 32, color: "#005F73", mr: 2 }} />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "Faustina",
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#1A1A1A",
                }}
              >
                Booking Calendar Integration
              </Typography>
            </Box>

            {calcomStatus?.isConnected ? (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CheckCircleOutline sx={{ color: "#4CAF50", mr: 1 }} />
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "16px",
                      color: "#4CAF50",
                      fontWeight: 600,
                    }}
                  >
                    Cal.com Connected
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                    color: "#666",
                    mb: 2,
                  }}
                >
                  Connected as: <strong>{calcomStatus.username}</strong>
                </Typography>

                {calcomStatus.eventTypes && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#1A1A1A",
                        mb: 1,
                      }}
                    >
                      Your Booking Links:
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {calcomStatus.eventTypes.duration30 && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LinkIcon
                            sx={{ fontSize: 18, color: "#005F73", mr: 1 }}
                          />
                          <a
                            href={calcomStatus.eventTypes.duration30.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#0A9396", textDecoration: "none" }}
                          >
                            30 Min Session
                          </a>
                        </Box>
                      )}
                      {calcomStatus.eventTypes.duration60 && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LinkIcon
                            sx={{ fontSize: 18, color: "#005F73", mr: 1 }}
                          />
                          <a
                            href={calcomStatus.eventTypes.duration60.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#0A9396", textDecoration: "none" }}
                          >
                            60 Min Session
                          </a>
                        </Box>
                      )}
                      {calcomStatus.eventTypes.duration90 && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LinkIcon
                            sx={{ fontSize: 18, color: "#005F73", mr: 1 }}
                          />
                          <a
                            href={calcomStatus.eventTypes.duration90.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#0A9396", textDecoration: "none" }}
                          >
                            90 Min Session
                          </a>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                <ButtonSelfScore
                  text={
                    calcomLoading ? "Disconnecting..." : "Disconnect Cal.com"
                  }
                  onClick={handleDisconnectCalcom}
                  disabled={calcomLoading}
                  background="#F44336"
                  style={{ marginTop: 16 }}
                />
              </Box>
            ) : (
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                    color: "#666",
                    mb: 3,
                  }}
                >
                  Connect your Cal.com account to enable clients to book
                  consultations with you directly. Cal.com provides a free,
                  professional booking calendar that integrates seamlessly with
                  your platform profile.
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: "14px" }}>
                    <strong>New to Cal.com?</strong> No problem! When you click
                    "Connect Cal.com", you'll be able to create a free account
                    if you don't have one yet.
                  </Typography>
                </Alert>

                <ButtonSelfScore
                  text={calcomLoading ? "Connecting..." : "Connect Cal.com"}
                  onClick={handleConnectCalcom}
                  disabled={calcomLoading}
                />
              </Box>
            )}
          </Paper>
        )} */}

        {/* Profile Information */}
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #E0E0E0",
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Faustina",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#1A1A1A",
                  mb: 3,
                }}
              >
                Personal Information
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  src={consultant.profilePhoto}
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: "#E87A42",
                    fontSize: "32px",
                    mr: 2,
                  }}
                >
                  {consultant.firstName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#1A1A1A",
                    }}
                  >
                    {consultant.firstName} {consultant.lastName}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    Wellness Coach
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Email sx={{ color: "#005F73", mr: 2 }} />
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    {consultant.email}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Phone sx={{ color: "#005F73", mr: 2 }} />
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    {consultant.countryCode} {consultant.phoneNumber}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LocationOn sx={{ color: "#005F73", mr: 2 }} />
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    {consultant.location}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CalendarToday sx={{ color: "#005F73", mr: 2 }} />
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    Applied:{" "}
                    {new Date(consultant.appliedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Professional Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #E0E0E0",
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Faustina",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#1A1A1A",
                  mb: 3,
                }}
              >
                Professional Details
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666",
                    mb: 1,
                  }}
                >
                  Years of Experience
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "16px",
                    color: "#1A1A1A",
                  }}
                >
                  {consultant.yearsOfExperience} years
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666",
                    mb: 1,
                  }}
                >
                  Coaching Specialties
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {consultant.coachingSpecialties?.map((specialty: string) => (
                    <Chip
                      key={specialty}
                      label={specialty}
                      size="small"
                      sx={{
                        backgroundColor: "#E8F4F8",
                        color: "#005F73",
                        fontFamily: "Source Sans Pro",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666",
                    mb: 1,
                  }}
                >
                  Languages
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {consultant.languagesSpoken?.map((language: string) => (
                    <Chip
                      key={language}
                      label={language}
                      size="small"
                      sx={{
                        backgroundColor: "#FFF3E0",
                        color: "#E87A42",
                        fontFamily: "Source Sans Pro",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666",
                    mb: 1,
                  }}
                >
                  Hourly Rate
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#005F73",
                  }}
                >
                  ${consultant.hourlyRate} USD
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
