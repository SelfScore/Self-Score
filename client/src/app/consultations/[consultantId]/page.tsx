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
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
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
  const { isAuthenticated } = useAuth();
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
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (consultantId) {
      fetchConsultant();
    }
  }, [consultantId, isAuthenticated]);

  // Fetch available slots when date or session type changes
  useEffect(() => {
    if (selectedDate && selectedSessionType && consultant) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDate, selectedSessionType]);

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
    router.push("/consultations");
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

  if (loading) {
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

  return (
    <>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#FFFFFF", pb: 6 }}>
        <Container maxWidth="lg" sx={{ py: 8, mt: 8 }}>
          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
            sx={{
              mb: 3,
              color: "#666",
              fontFamily: "Source Sans Pro",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "transparent",
                color: "#005F73",
              },
            }}
          >
            Back
          </Button>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* Left Side - Profile Info */}
            <Box sx={{ width: { xs: "100%", md: "400px" }, flexShrink: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  border: "1px solid #E0E0E0",
                  position: "sticky",
                  top: 100,
                }}
              >
                {/* Profile Photo */}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <Avatar
                    src={consultant.profilePhoto}
                    sx={{
                      width: 120,
                      height: 120,
                      border: "4px solid #005F73",
                    }}
                  />
                </Box>

                {/* Name and Rating */}
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <Typography
                    sx={{
                      fontFamily: "Faustina",
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#1A1A1A",
                      mb: 0.5,
                    }}
                  >
                    Dr. {consultant.firstName} {consultant.lastName}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "16px",
                      color: "#666",
                      mb: 1,
                    }}
                  >
                    Wellness Coach
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <StarIcon sx={{ color: "#FF9800", fontSize: "20px" }} />
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
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Contact Info */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <EmailIcon sx={{ color: "#005F73", fontSize: "20px" }} />
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "14px",
                        color: "#666",
                        wordBreak: "break-all",
                      }}
                    >
                      {consultant.email}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <PhoneIcon sx={{ color: "#005F73", fontSize: "20px" }} />
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

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <LocationOnIcon
                      sx={{ color: "#005F73", fontSize: "20px" }}
                    />
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

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CalendarTodayIcon
                      sx={{ color: "#005F73", fontSize: "20px" }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "14px",
                        color: "#666",
                      }}
                    >
                      {consultant.yearsOfExperience} years experience
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Languages */}
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1A1A1A",
                      mb: 1,
                    }}
                  >
                    Languages
                  </Typography>
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
              </Paper>
            </Box>

            {/* Right Side - Details */}
            <Box sx={{ flex: 1 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  border: "1px solid #E0E0E0",
                  mb: 3,
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={(_, newValue) => setTabValue(newValue)}
                  sx={{
                    borderBottom: "1px solid #E0E0E0",
                    "& .MuiTab-root": {
                      fontFamily: "Source Sans Pro",
                      fontSize: "16px",
                      textTransform: "none",
                      fontWeight: 600,
                      color: "#666",
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
                  <Tab label="Reviews (01)" />
                </Tabs>

                {/* About Tab */}
                <TabPanel value={tabValue} index={0}>
                  <Typography
                    sx={{
                      fontFamily: "Faustina",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#1A1A1A",
                      mb: 2,
                    }}
                  >
                    About Me
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "16px",
                      color: "#666",
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
                      color: "#1A1A1A",
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
                        <Typography
                          sx={{
                            fontFamily: "Source Sans Pro",
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#1A1A1A",
                          }}
                        >
                          {cert.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Source Sans Pro",
                            fontSize: "14px",
                            color: "#666",
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
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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

              {/* Booking Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  border: "1px solid #E0E0E0",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
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
                    fontSize: "24px",
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
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#4CAF50",
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    {selectedSessionType ? `${selectedSessionType} min` : ""}
                  </Typography>
                  {selectedSessionType && (
                    <>
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          backgroundColor: "#666",
                        }}
                      />
                      <Typography
                        sx={{
                          fontFamily: "Source Sans Pro",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        Web conferencing details provided upon confirmation
                      </Typography>
                    </>
                  )}
                </Box>

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
                          {consultant.hourlyRate}
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
        </Container>
      </Box>

      <SignUpModal open={showLoginModal} onClose={handleLoginModalClose} />
    </>
  );
}
