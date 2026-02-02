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
  // Button,
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
  Edit,
  AccessTime,
  VideoCall,
  Person,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { consultantAuthService } from "@/services/consultantAuthService";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import { bookingService, Booking } from "@/services/bookingService";
// import OutLineButton from "../../components/ui/OutLineButton";

export default function ConsultantDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [consultant, setConsultant] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [calendarStatus, setCalendarStatus] = useState<any>(null);
  const [checkingCalendar, setCheckingCalendar] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [selectedTab, setSelectedTab] = useState(0); // 0: Upcoming, 1: Past

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
      fetchBookings(); // Fetch bookings when consultant data is loaded
    }
  }, [consultant]);

  const checkCalendarConnection = async () => {
    try {
      setCheckingCalendar(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/google-calendar/status`,
        {
          credentials: "include",
        },
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

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const response = await bookingService.getConsultantBookings();

      if (response.success && response.data) {
        const bookingsData = (response.data as any).bookings || response.data;
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
        setBookings(bookingsArray);
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setBookingsError("Failed to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  const getBookingStatus = (booking: Booking) => {
    if (booking.status === "CANCELLED") {
      return { label: "Cancelled", color: "#F44336", bgColor: "#FFEBEE" };
    }

    const now = new Date();
    const startTime = new Date(booking.startTime);

    if (booking.status === "CREATED") {
      const expiryTime = new Date(
        new Date(booking.createdAt).getTime() + 10 * 60 * 1000,
      );
      if (now > expiryTime) {
        return { label: "Expired", color: "#FF9800", bgColor: "#FFF3E0" };
      }
      return { label: "Pending Payment", color: "#FF9800", bgColor: "#FFF3E0" };
    }

    if (now > startTime) {
      return { label: "Completed", color: "#4CAF50", bgColor: "#E8F5E9" };
    }

    return { label: "Confirmed", color: "#4CAF50", bgColor: "#E8F5E9" };
  };

  const filterBookings = (type: "upcoming" | "past") => {
    const now = new Date();

    return bookings.filter((booking) => {
      const startTime = new Date(booking.startTime);

      if (booking.status === "CANCELLED") return false;

      if (type === "upcoming") {
        return startTime > now && booking.status === "PAID";
      }

      if (type === "past") {
        if (booking.status === "PAID" && startTime <= now) {
          return true;
        }
        if (booking.status === "CREATED") {
          const expiryTime = new Date(
            new Date(booking.createdAt).getTime() + 10 * 60 * 1000,
          );
          return now > expiryTime;
        }
      }

      return false;
    });
  };

  const upcomingBookings = filterBookings("upcoming");
  const pastBookings = filterBookings("past");
  const totalBookings = bookings.filter((b) => b.status === "PAID").length;
  const completedBookings = bookings.filter((b) => {
    const now = new Date();
    const startTime = new Date(b.startTime);
    return b.status === "PAID" && startTime <= now;
  }).length;

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
          "Failed to load consultant data. Please try refreshing the page.",
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
        <Box
          sx={{
            mb: { xs: 3, md: 4 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "flex-start" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "Faustina",
                fontSize: { xs: "24px", sm: "28px", md: "36px" },
                fontWeight: 700,
                color: "#1A1A1A",
                mb: 1,
                mt: { xs: 6, sm: 7, md: 8 },
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

          <Box
            sx={{
              mt: { xs: 0, sm: 7, md: 8 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <ButtonSelfScore
              text="Edit Profile"
              onClick={() => router.push("/consultant/profile")}
              startIcon={<Edit />}
              style={{
                borderRadius: "12px",
                fontFamily: "Source Sans Pro",
              }}
              fullWidth={true}
            />
          </Box>
        </Box>

        {/* Application Status Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 3.5, md: 4 },
            mb: { xs: 3, md: 4 },
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
              fontSize: { xs: "20px", sm: "22px", md: "24px" },
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
              fontSize: { xs: "14px", sm: "15px", md: "16px" },
              color: "#666",
              maxWidth: "600px",
              mx: "auto",
              px: { xs: 1, sm: 0 },
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
                p: { xs: 2.5, sm: 3 },
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
                  fontSize: { xs: "18px", sm: "20px" },
                  fontWeight: 600,
                  color: "#1A1A1A",
                  mb: { xs: 2, sm: 3 },
                }}
              >
                Personal Information
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: { xs: 2, sm: 3 },
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 1.5, sm: 0 },
                }}
              >
                <Avatar
                  src={consultant.profilePhoto}
                  sx={{
                    width: { xs: 64, sm: 80 },
                    height: { xs: 64, sm: 80 },
                    backgroundColor: "#E87A42",
                    fontSize: { xs: "24px", sm: "32px" },
                    mr: { xs: 0, sm: 2 },
                  }}
                >
                  {consultant.firstName.charAt(0)}
                </Avatar>
                <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "16px", sm: "18px" },
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
                p: { xs: 2.5, sm: 3 },
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
                  fontSize: { xs: "18px", sm: "20px" },
                  fontWeight: 600,
                  color: "#1A1A1A",
                  mb: { xs: 2, sm: 3 },
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

              {/* <Box>
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
              </Box> */}
            </Paper>
          </Grid>
        </Grid>

        {/* Bookings Section - Only show if approved and calendar connected */}
        {consultant.applicationStatus === "approved" &&
          calendarStatus?.isConnected && (
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "Faustina",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#1A1A1A",
                  mb: 3,
                }}
              >
                My Consultations
              </Typography>

              {/* Booking Stats */}
              <Grid
                container
                spacing={{ xs: 2, sm: 3 }}
                sx={{ mb: { xs: 2, sm: 3 } }}
              >
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 2, sm: 2.5, md: 3 },
                      backgroundColor:
                        "linear-gradient(135deg, #005F73 0%, #0A7A8F 100%)",
                      background:
                        "linear-gradient(135deg, #005F73 0%, #0A7A8F 100%)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.9,
                        fontFamily: "Source Sans Pro",
                        fontSize: { xs: "12px", sm: "13px" },
                      }}
                    >
                      Total Bookings
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        fontFamily: "Faustina",
                        fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                      }}
                    >
                      {totalBookings}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 2, sm: 2.5, md: 3 },
                      backgroundColor: "#4CAF50",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.9,
                        fontFamily: "Source Sans Pro",
                        fontSize: { xs: "12px", sm: "13px" },
                      }}
                    >
                      Upcoming
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        fontFamily: "Faustina",
                        fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                      }}
                    >
                      {upcomingBookings.length}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 2, sm: 2.5, md: 3 },
                      backgroundColor: "#FF9800",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.9,
                        fontFamily: "Source Sans Pro",
                        fontSize: { xs: "12px", sm: "13px" },
                      }}
                    >
                      Completed
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        fontFamily: "Faustina",
                        fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                      }}
                    >
                      {completedBookings}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Bookings List */}
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px solid #E0E0E0",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    px: { xs: 1.5, sm: 2, md: 3 },
                    overflowX: "auto",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: { xs: 1, sm: 2 },
                      minWidth: "max-content",
                    }}
                  >
                    <Box
                      onClick={() => setSelectedTab(0)}
                      sx={{
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1.5, sm: 2 },
                        cursor: "pointer",
                        borderBottom:
                          selectedTab === 0
                            ? "3px solid #FF4F00"
                            : "3px solid transparent",
                        color: selectedTab === 0 ? "#FF4F00" : "#666",
                        fontWeight: selectedTab === 0 ? 600 : 400,
                        fontFamily: "Source Sans Pro",
                        fontSize: { xs: "14px", sm: "16px" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      Upcoming ({upcomingBookings.length})
                    </Box>
                    <Box
                      onClick={() => setSelectedTab(1)}
                      sx={{
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1.5, sm: 2 },
                        cursor: "pointer",
                        borderBottom:
                          selectedTab === 1
                            ? "3px solid #FF4F00"
                            : "3px solid transparent",
                        color: selectedTab === 1 ? "#FF4F00" : "#666",
                        fontWeight: selectedTab === 1 ? 600 : 400,
                        fontFamily: "Source Sans Pro",
                        fontSize: { xs: "14px", sm: "16px" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      Past ({pastBookings.length})
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                  {bookingsLoading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 4 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : bookingsError ? (
                    <Alert severity="error">{bookingsError}</Alert>
                  ) : (
                    <>
                      {/* Upcoming Bookings */}
                      {selectedTab === 0 && (
                        <>
                          {upcomingBookings.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 4 }}>
                              <CalendarToday
                                sx={{ fontSize: 48, color: "#CCC", mb: 2 }}
                              />
                              <Typography
                                variant="body1"
                                sx={{
                                  color: "#666",
                                  fontFamily: "Source Sans Pro",
                                }}
                              >
                                No upcoming consultations
                              </Typography>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              {upcomingBookings.map((booking) => {
                                const status = getBookingStatus(booking);
                                return (
                                  <Paper
                                    key={booking._id}
                                    sx={{
                                      p: 3,
                                      backgroundColor: "#F8FAFB",
                                      borderRadius: "12px",
                                      border: "1px solid #E0E0E0",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        mb: 2,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 2,
                                        }}
                                      >
                                        <Avatar
                                          sx={{
                                            backgroundColor: "#FF4F00",
                                            width: 48,
                                            height: 48,
                                          }}
                                        >
                                          {booking.userId.username
                                            .charAt(0)
                                            .toUpperCase()}
                                        </Avatar>
                                        <Box>
                                          <Typography
                                            variant="subtitle1"
                                            sx={{
                                              fontWeight: 600,
                                              fontFamily: "Source Sans Pro",
                                            }}
                                          >
                                            {booking.userId.username}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: "#666",
                                              fontFamily: "Source Sans Pro",
                                            }}
                                          >
                                            {booking.userId.email}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Chip
                                        label={status.label}
                                        sx={{
                                          backgroundColor: status.bgColor,
                                          color: status.color,
                                          fontWeight: 600,
                                          fontFamily: "Source Sans Pro",
                                        }}
                                      />
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Grid container spacing={2}>
                                      <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            mb: 1,
                                          }}
                                        >
                                          <CalendarToday
                                            sx={{
                                              fontSize: 18,
                                              color: "#005F73",
                                            }}
                                          />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontFamily: "Source Sans Pro",
                                            }}
                                          >
                                            {new Date(
                                              booking.startTime,
                                            ).toLocaleDateString("en-US", {
                                              weekday: "short",
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                          </Typography>
                                        </Box>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          <AccessTime
                                            sx={{
                                              fontSize: 18,
                                              color: "#005F73",
                                            }}
                                          />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontFamily: "Source Sans Pro",
                                            }}
                                          >
                                            {new Date(
                                              booking.startTime,
                                            ).toLocaleTimeString("en-US", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}{" "}
                                            - {booking.duration} min
                                          </Typography>
                                        </Box>
                                      </Grid>

                                      <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            mb: 1,
                                          }}
                                        >
                                          <Person
                                            sx={{
                                              fontSize: 18,
                                              color: "#005F73",
                                            }}
                                          />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontFamily: "Source Sans Pro",
                                            }}
                                          >
                                            {booking.sessionType}
                                          </Typography>
                                        </Box>
                                        {booking.meetingLink && (
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                            }}
                                          >
                                            <VideoCall
                                              sx={{
                                                fontSize: 18,
                                                color: "#4CAF50",
                                              }}
                                            />
                                            <a
                                              href={booking.meetingLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{
                                                color: "#4CAF50",
                                                textDecoration: "none",
                                                fontFamily: "Source Sans Pro",
                                              }}
                                            >
                                              Join Meeting
                                            </a>
                                          </Box>
                                        )}
                                      </Grid>
                                    </Grid>

                                    {booking.userNotes && (
                                      <Box
                                        sx={{
                                          mt: 2,
                                          p: 2,
                                          backgroundColor: "#FFF",
                                          borderRadius: "8px",
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontWeight: 600,
                                            color: "#666",
                                          }}
                                        >
                                          Client Notes:
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            mt: 0.5,
                                            fontFamily: "Source Sans Pro",
                                          }}
                                        >
                                          {booking.userNotes}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Paper>
                                );
                              })}
                            </Box>
                          )}
                        </>
                      )}

                      {/* Past Bookings */}
                      {selectedTab === 1 && (
                        <>
                          {pastBookings.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 4 }}>
                              <CalendarToday
                                sx={{ fontSize: 48, color: "#CCC", mb: 2 }}
                              />
                              <Typography
                                variant="body1"
                                sx={{
                                  color: "#666",
                                  fontFamily: "Source Sans Pro",
                                }}
                              >
                                No past consultations
                              </Typography>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              {pastBookings.map((booking) => {
                                const status = getBookingStatus(booking);
                                return (
                                  <Paper
                                    key={booking._id}
                                    sx={{
                                      p: 3,
                                      backgroundColor: "#F8FAFB",
                                      borderRadius: "12px",
                                      border: "1px solid #E0E0E0",
                                      opacity: 0.8,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        mb: 2,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 2,
                                        }}
                                      >
                                        <Avatar
                                          sx={{
                                            backgroundColor: "#999",
                                            width: 48,
                                            height: 48,
                                          }}
                                        >
                                          {booking.userId.username
                                            .charAt(0)
                                            .toUpperCase()}
                                        </Avatar>
                                        <Box>
                                          <Typography
                                            variant="subtitle1"
                                            sx={{
                                              fontWeight: 600,
                                              fontFamily: "Source Sans Pro",
                                            }}
                                          >
                                            {booking.userId.username}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: "#666",
                                              fontFamily: "Source Sans Pro",
                                            }}
                                          >
                                            {booking.userId.email}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Chip
                                        label={status.label}
                                        sx={{
                                          backgroundColor: status.bgColor,
                                          color: status.color,
                                          fontWeight: 600,
                                          fontFamily: "Source Sans Pro",
                                        }}
                                      />
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Grid container spacing={2}>
                                      <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            mb: 1,
                                          }}
                                        >
                                          <CalendarToday
                                            sx={{ fontSize: 18, color: "#666" }}
                                          />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: "#666",
                                              fontFamily: "Source Sans Pro",
                                            }}
                                          >
                                            {new Date(
                                              booking.startTime,
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                          </Typography>
                                        </Box>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          <AccessTime
                                            sx={{ fontSize: 18, color: "#666" }}
                                          />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: "#666",
                                              fontFamily: "Source Sans Pro",
                                            }}
                                          >
                                            {booking.duration} min session
                                          </Typography>
                                        </Box>
                                      </Grid>

                                      <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          <Person
                                            sx={{ fontSize: 18, color: "#666" }}
                                          />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: "#666",
                                              fontFamily: "Source Sans Pro",
                                            }}
                                          >
                                            {booking.sessionType}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Paper>
                                );
                              })}
                            </Box>
                          )}
                        </>
                      )}
                    </>
                  )}
                </Box>
              </Paper>
            </Box>
          )}
      </Container>
    </Box>
  );
}
