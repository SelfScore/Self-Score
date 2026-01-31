"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter, useParams } from "next/navigation";
import {
  consultantService,
  PublicConsultant,
} from "@/services/consultantService";
import { useAuth } from "@/hooks/useAuth";
import TimezoneSelect from "react-timezone-select";
import SignUpModal from "@/app/user/SignUpModal";
import BookingCalendar from "@/app/components/booking/BookingCalendar";
import TimeSlotPicker from "@/app/components/booking/TimeSlotPicker";
import { bookingService, TimeSlot } from "@/services/bookingService";
import OutLineButton from "@/app/components/ui/OutLineButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ConsultantProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isInitialized } = useAuth();
  const [consultant, setConsultant] = useState<PublicConsultant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [userTimezone, setUserTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"
  );

  const consultantId = params?.consultantId as string;

  useEffect(() => {
    // Wait for auth initialization to complete
    if (!isInitialized) {
      return;
    }

    // Show login modal only if initialized and not authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // User is authenticated, fetch consultant
    if (consultantId) {
      fetchConsultant();
    }
  }, [consultantId, isAuthenticated, isInitialized]);

  // Fetch available slots when date, session type, or timezone changes
  useEffect(() => {
    if (selectedDate && selectedSessionType && consultant) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDate, selectedSessionType, userTimezone]);

  const fetchConsultant = async () => {
    try {
      setLoading(true);
      const response = await consultantService.getConsultantById(consultantId);
      if (response.success && response.data) {
        setConsultant(response.data);

        // Set default session type to first enabled service
        const firstEnabledService = response.data.services.find(
          (s) => s.enabled
        );
        if (firstEnabledService && !selectedSessionType) {
          setSelectedSessionType(firstEnabledService.duration.toString());
        }
      } else {
        setError("Consultant not found");
      }
    } catch (error: any) {
      console.error("Failed to fetch consultant:", error);
      setError("Failed to load consultant details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !selectedSessionType || !consultant) return;

    try {
      setSlotsLoading(true);
      setSlotsError("");

      const duration = parseInt(selectedSessionType);
      const dateStr = bookingService.formatDateForAPI(selectedDate);

      const response = await bookingService.getAvailableSlots({
        consultantId: consultantId,
        date: dateStr,
        duration: duration,
        timezone: userTimezone,
      });

      if (response.success && response.data) {
        setAvailableSlots(response.data.slots);
      } else {
        setSlotsError(response.message || "Failed to load available slots");
      }
    } catch (error: any) {
      console.error("Error fetching slots:", error);
      setSlotsError("Failed to load available slots. Please try again.");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookSession = async () => {
    if (!selectedSlot || !selectedSessionType || !consultant) return;

    try {
      setBookingLoading(true);
      setBookingError("");

      const duration = parseInt(selectedSessionType);
      const sessionType = `${selectedSessionType}min` as
        | "30min"
        | "60min"
        | "90min";

      // Create booking
      const createResponse = await bookingService.createBooking({
        consultantId: consultantId,
        sessionType: sessionType,
        startTime: new Date(selectedSlot.start).toISOString(),
        duration: duration,
        userTimezone: userTimezone,
        userNotes: bookingNotes,
      });

      if (!createResponse.success || !createResponse.data) {
        throw new Error(createResponse.message || "Failed to create booking");
      }

      const bookingId = createResponse.data.booking._id;

      // Confirm booking immediately (no payment for now)
      const confirmResponse = await bookingService.confirmBooking({
        bookingId: bookingId,
        paymentId: "manual-confirmation",
      });

      if (confirmResponse.success) {
        // Redirect to success page
        router.push(`/user/bookings?success=true&bookingId=${bookingId}`);
      } else {
        throw new Error(confirmResponse.message || "Failed to confirm booking");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      setBookingError(
        error.response?.data?.message ||
        error.message ||
        "Failed to book session. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
    // Only navigate away if user is still not authenticated
    if (!isAuthenticated) {
      router.push("/consultations");
    }
  };

  const handleLoginSuccess = () => {
    // Close modal and fetch consultant data
    setShowLoginModal(false);
    if (consultantId) {
      fetchConsultant();
    }
  };

  const handleBackClick = () => {
    router.push("/consultations");
  };

  const handleSessionTypeChange = (event: SelectChangeEvent) => {
    setSelectedSessionType(event.target.value);
    setSelectedSlot(null);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  // Show loading while auth is initializing or data is loading
  if (!isInitialized || loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#005F73" }} />
      </Box>
    );
  }

  if (error || !consultant) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, mt: 8, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "18px",
            color: "#666",
            mb: 3,
          }}
        >
          {error || "Consultant not found"}
        </Typography>
        <Button
          variant="outlined"
          onClick={handleBackClick}
          startIcon={<ArrowBackIcon />}
          sx={{
            borderColor: "#005F73",
            color: "#005F73",
            "&:hover": {
              borderColor: "#004D5C",
              backgroundColor: "#F0F9FA",
            },
          }}
        >
          Back to Consultations
        </Button>
      </Container>
    );
  }

  const handleBackToInfo = () => {
    router.push("/consultations");
  };

  const getEmbedUrl = (url: string): string => {
    if (!url) return "";

    // YouTube formats
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    // Loom formats
    if (url.includes("loom.com/share/")) {
      const videoId = url.split("loom.com/share/")[1]?.split("?")[0];
      return videoId ? `https://www.loom.com/embed/${videoId}` : url;
    }

    // Vimeo formats
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }

    // If already an embed URL or unknown format, return as is
    return url;
  };

  return (
    <>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#FFFFFF", pb: 6 }}>
        <Box sx={{ py: { xs: 2, md: 8 }, mt: { xs: 8, md: 6 }, maxWidth: "87%", mx: "auto", px: { xs: 1, md: 0 } }}>
          {/* Back Button */}
          <OutLineButton
            startIcon={<ArrowBackIosIcon sx={{ fontSize: { xs: 14, md: 18 } }} />}
            sx={{
              background: "transparent",
              color: "#3A3A3A",
              border: "1px solid #3A3A3A",
              borderRadius: "8px",
              padding: { xs: "4px 8px", md: "3.5px 14px" },
              fontWeight: 400,
              fontSize: { xs: "14px", md: "18px" },
              minWidth: { xs: "auto", md: "100px" },
              height: { xs: "28px", md: "auto" },
              minHeight: { xs: "28px", md: "44px" },
              cursor: "pointer",
              transition: "all 0.2s",
              "& .MuiButton-startIcon": {
                margin: { xs: 0, md: "0 8px 0 -4px" },
              },
            }}
            onClick={handleBackToInfo}
          >
            <Box sx={{ display: { xs: "none", md: "block" } }}>Back</Box>
          </OutLineButton>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              mt: 4,
            }}
          >
            {/* Left Side - Profile Info */}
            <Box sx={{ width: { xs: "100%", md: "750px" }, flexShrink: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: "14px",
                  border: "1px solid #3A3A3A4D",
                  position: { xs: "static", md: "sticky" },
                  top: 100,
                  flexDirection: { xs: "column", md: "row" },
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                {/* Profile Photo */}
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "left", mb: 2, alignItems: "flex-start" }}>
                  <Avatar
                    src={consultant.profilePhoto}
                    sx={{
                      width: { xs: 100, md: 168 },
                      height: { xs: 100, md: 168 },
                      borderRadius: "10px",
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      mr: { xs: 0, md: 4 },
                      ml: { xs: 0, md: 4 },
                      mt: { xs: 2, md: 0 },
                      alignItems: "flex-start",
                      textAlign: "left",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Faustina",
                        fontSize: { xs: "18px", md: "20px" },
                        lineHeight: "28px",
                        fontWeight: 700,
                        color: "#1A1A1A",
                        mb: 0.5,
                      }}
                    >
                      {consultant.firstName} {consultant.lastName}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "16px",
                        color: "#005F73",
                        mb: 1,
                      }}
                    >
                      {consultant.coachingSpecialties}
                    </Typography>

                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <LocationOnOutlinedIcon
                        sx={{ color: "#2B2B2B", fontSize: "20px" }}
                      />
                      <Typography
                        sx={{
                          fontFamily: "Source Sans Pro",
                          fontSize: "16px",
                          color: "#2B2B2B",
                        }}
                      >
                        {consultant.location}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <AccessTimeOutlinedIcon
                        sx={{ color: "#2B2B2B", fontSize: "18px" }}
                      />
                      <Typography
                        sx={{
                          fontFamily: "Source Sans Pro",
                          fontSize: "16px",
                          color: "#2B2B2B",
                        }}
                      >
                        {consultant.yearsOfExperience} years experience
                      </Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {consultant.languagesSpoken.map((lang) => (
                          <Chip
                            key={lang}
                            label={lang}
                            size="small"
                            sx={{
                              backgroundColor: "#F0F9FA",
                              color: "#005F73",
                              fontSize: "12px",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    flexDirection: "column",
                    mt: { xs: 2, md: 0 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "right",
                      justifyContent: "left",

                      gap: 1,
                    }}
                  >
                    <StarIcon sx={{ color: "#FF4F00", fontSize: "20px" }} />
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#1A1A1A",
                      }}
                    >
                      4.8
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "14px",
                        color: "#666",
                      }}
                    >
                      (01 reviews)
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "14px",
                        color: "#666",
                      }}
                    >
                      Starting from
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Faustina",
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#005F73",
                      }}
                    >
                      $
                      {Math.min(
                        ...consultant.services
                          .filter((s) => s.enabled && s.price)
                          .map((s) => s.price || 0)
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* about consultant  */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: "14px",
                  border: "1px solid #3A3A3A4D",
                  mb: 3,
                  mt: { xs: 2, md: 4 },
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={(_, newValue) => setTabValue(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    borderBottom: "1px solid #E0E0E0",
                    "& .MuiTab-root": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "14px", md: "16px" },
                      textTransform: "none",
                      fontWeight: 600,
                      color: "#0A0A0A",
                      minWidth: { xs: "auto", md: "90px" },
                      px: { xs: 1, md: 2 },
                    },
                    "& .Mui-selected": {
                      color: "#005F73 !important",
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#005F73",
                    },
                  }}
                >
                  <Tab label="About" />
                  <Tab label="Services" />
                  <Tab label="Reviews" />
                </Tabs>

                {/* About Tab */}
                <TabPanel value={tabValue} index={0}>
                  <Typography
                    sx={{
                      fontFamily: "Faustina",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#0A0A0A",
                      mb: 2,
                    }}
                  >
                    About Me
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "16px",
                      color: "#4A5565",
                      lineHeight: 1.7,
                      mb: 3,
                    }}
                  >
                    {consultant.professionalBio}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "Faustina",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#0A0A0A",
                      mb: 2,
                    }}
                  >
                    Certifications & Qualifications
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    {consultant.certifications.map((cert, index) => (
                      <Box key={index}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <WorkspacePremiumIcon
                            sx={{
                              color: "#005F73",
                              fontSize: "20px",
                              mt: "4px",
                            }}
                          />
                          <Typography
                            sx={{
                              fontFamily: "Source Sans Pro",
                              fontSize: "16px",
                              fontWeight: 600,
                              color: "#0A0A0A",
                            }}
                          >
                            {cert.name}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontFamily: "Source Sans Pro",
                            fontSize: "14px",
                            color: "#4A5565",
                            ml: 4,
                          }}
                        >
                          {cert.issuingOrganization}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "Faustina",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#1A1A1A",
                      mb: 2,
                    }}
                  >
                    Areas of Expertise
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}
                  >
                    {consultant.coachingSpecialties.map((specialty) => (
                      <Chip
                        key={specialty}
                        label={specialty}
                        sx={{
                          backgroundColor: "#F0F9FA",
                          color: "#005F73",
                          fontFamily: "Source Sans Pro",
                          fontSize: "14px",
                        }}
                      />
                    ))}
                  </Box>

                  {/* Introduction Video */}
                  {consultant.introductionVideoLink && (
                    <Box sx={{ mt: 4 }}>
                      <Typography
                        sx={{
                          fontFamily: "Faustina",
                          fontSize: "20px",
                          fontWeight: 700,
                          color: "#1A1A1A",
                          mb: 2,
                        }}
                      >
                        Introduction Video
                      </Typography>
                      <Box
                        sx={{
                          position: "relative",
                          paddingBottom: "56.25%",
                          height: 0,
                          overflow: "hidden",
                          borderRadius: "12px",
                          backgroundColor: "#000",
                        }}
                      >
                        <iframe
                          src={getEmbedUrl(consultant.introductionVideoLink)}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            border: "none",
                            borderRadius: "12px",
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </Box>
                    </Box>
                  )}
                </TabPanel>

                {/* Services Tab */}
                <TabPanel value={tabValue} index={1}>
                  <Typography
                    sx={{
                      fontFamily: "Faustina",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#1A1A1A",
                      mb: 2,
                    }}
                  >
                    Available Services
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {consultant.services
                      .filter((s) => s.enabled)
                      .map((service, index) => (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{
                            p: 2,
                            border: "1px solid #E0E0E0",
                            borderRadius: "8px",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                sx={{
                                  fontFamily: "Source Sans Pro",
                                  fontSize: "16px",
                                  fontWeight: 600,
                                  color: "#1A1A1A",
                                  mb: 0.5,
                                }}
                              >
                                {service.duration} Minute Session
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: "Source Sans Pro",
                                  fontSize: "14px",
                                  color: "#666",
                                }}
                              >
                                ${consultant.hourlyRate}/session
                              </Typography>
                            </Box>
                            {/* <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                              }}
                            >
                              {consultant.calcom?.isConnected &&
                              getBookingLink(service.duration) ? (
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => {
                                    const link = getBookingLink(
                                      service.duration
                                    );
                                    if (link) window.open(link, "_blank");
                                  }}
                                  sx={{
                                    backgroundColor: "#E87A42",
                                    color: "white",
                                    textTransform: "none",
                                    fontFamily: "Source Sans Pro",
                                    fontWeight: 600,
                                    "&:hover": {
                                      backgroundColor: "#D56B33",
                                    },
                                  }}
                                >
                                  Book Now
                                </Button>
                              ) : (
                                <Chip
                                  label="Contact to Book"
                                  size="small"
                                  sx={{
                                    backgroundColor: "#F0F9FA",
                                    color: "#005F73",
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </Box> */}
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                              }}
                            >
                              <Chip
                                label="Contact to Book"
                                size="small"
                                sx={{
                                  backgroundColor: "#F0F9FA",
                                  color: "#005F73",
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                  </Box>
                </TabPanel>

                {/* Reviews Tab */}
                <TabPanel value={tabValue} index={2}>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "16px",
                      color: "#666",
                      textAlign: "center",
                      py: 4,
                    }}
                  >
                    No reviews yet. Be the first to book and review!
                  </Typography>
                </TabPanel>
              </Paper>
            </Box>

            {/* Right Side - Details */}
            <Box sx={{ flex: 1, mt: { xs: 2, md: 0 } }}>
              {/* Booking Section */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: "12px",
                  border: "1px solid #E0E0E0",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "12px", md: "14px" },
                    fontWeight: 600,
                    color: "#1A1A1A",
                    mb: 1,
                  }}
                >
                  {consultant.firstName} {consultant.lastName}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Faustina",
                    fontSize: { xs: "18px", md: "24px" },
                    fontWeight: 700,
                    color: "#1A1A1A",
                    mb: 0.5,
                  }}
                >
                  {selectedSessionType
                    ? `${selectedSessionType} Minute Meeting`
                    : "Select a Meeting Type"}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 3,
                  }}
                ></Box>

                {/* Session Type Selector */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Session Duration</InputLabel>
                  <Select
                    value={selectedSessionType}
                    label="Select Session Duration"
                    onChange={handleSessionTypeChange}
                    sx={{
                      fontFamily: "Source Sans Pro",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#E0E0E0",
                      },
                    }}
                  >
                    {consultant.services
                      .filter((s) => s.enabled)
                      .map((service) => (
                        <MenuItem
                          key={service.duration}
                          value={service.duration.toString()}
                        >
                          {service.duration} Minute Session - $
                          {service.price || 0}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                {bookingError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {bookingError}
                  </Alert>
                )}

                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    flexDirection: { xs: "column", md: "row" },
                  }}
                >
                  {/* Left: Calendar */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#1A1A1A",
                        mb: 2,
                      }}
                    >
                      Select a Date & Time
                    </Typography>

                    <BookingCalendar
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                      minDate={new Date()}
                    />

                    {/* Timezone Selector */}
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        sx={{
                          fontFamily: "Source Sans Pro",
                          fontSize: "13px",
                          color: "#666",
                          mb: 1,
                        }}
                      >
                        🌍 Your Time Zone
                      </Typography>
                      <TimezoneSelect
                        value={userTimezone}
                        onChange={(tz: any) => setUserTimezone(tz.value)}
                        styles={{
                          control: (provided: any) => ({
                            ...provided,
                            borderColor: "#E0E0E0",
                            borderRadius: "8px",
                            padding: "2px",
                            fontFamily: "Source Sans Pro",
                            fontSize: "13px",
                          }),
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Right: Time Slots */}
                  <Box sx={{ flex: 1 }}>
                    <TimeSlotPicker
                      slots={availableSlots}
                      selectedSlot={selectedSlot}
                      onSlotSelect={handleSlotSelect}
                      loading={slotsLoading}
                      error={slotsError}
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                    />
                  </Box>
                </Box>

                {/* Notes */}
                {selectedSlot && (
                  <Box sx={{ mt: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Add notes (optional)"
                      placeholder="Share any specific topics or questions you'd like to discuss..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontFamily: "Source Sans Pro",
                        },
                      }}
                    />
                  </Box>
                )}

                {/* Book Button */}
                <Button
                  fullWidth
                  disabled={!selectedSlot || bookingLoading}
                  onClick={handleBookSession}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    backgroundColor: "#005F73",
                    color: "#FFF",
                    fontFamily: "Source Sans Pro",
                    fontSize: "16px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#004D5C",
                    },
                    "&:disabled": {
                      backgroundColor: "#CCC",
                      color: "#999",
                    },
                  }}
                >
                  {bookingLoading ? (
                    <CircularProgress size={24} sx={{ color: "#FFF" }} />
                  ) : selectedSlot ? (
                    "Confirm Booking"
                  ) : (
                    "Select a Time Slot"
                  )}
                </Button>

                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "12px",
                    color: "#666",
                    mt: 2,
                    textAlign: "center",
                  }}
                >
                  By proceeding, you agree to our Terms & Conditions
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>

      <SignUpModal
        open={showLoginModal}
        onClose={handleLoginModalClose}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}
