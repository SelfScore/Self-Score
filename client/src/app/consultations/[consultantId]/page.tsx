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
import SignUpModal from "@/app/user/SignUpModal";

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const fetchConsultant = async () => {
    try {
      setLoading(true);
      const response = await consultantService.getConsultantById(consultantId);
      if (response.success && response.data) {
        setConsultant(response.data);
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

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
    router.push("/consultations");
  };

  const handleBackClick = () => {
    router.push("/consultations");
  };

  // const getBookingLink = (duration: number): string | null => {
  //   if (!consultant?.calcom?.isConnected || !consultant?.calcom?.eventTypes) {
  //     return null;
  //   }

  //   const eventTypes = consultant.calcom.eventTypes;
  //   if (duration === 30 && eventTypes.duration30) {
  //     return eventTypes.duration30.link;
  //   } else if (duration === 60 && eventTypes.duration60) {
  //     return eventTypes.duration60.link;
  //   } else if (duration === 90 && eventTypes.duration90) {
  //     return eventTypes.duration90.link;
  //   }
  //   return null;
  // };

  // Placeholder calendar dates for June 2023
  const generateCalendarDates = () => {
    const dates = [];
    for (let i = 1; i <= 30; i++) {
      dates.push(i);
    }
    return dates;
  };

  const calendarDates = generateCalendarDates();
  const bookedDates = [20, 21, 22, 23, 27, 28, 29, 30]; // Placeholder

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

              {/* Booking Calendar */}
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
                    fontFamily: "Faustina",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1A1A1A",
                    mb: 1,
                  }}
                >
                  Book a Session
                </Typography>

                {/* Select Service Dropdown */}
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
                    Select Service
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid #E0E0E0",
                      borderRadius: "8px",
                      backgroundColor: "#F9F9F9",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "16px",
                        color: "#666",
                      }}
                    >
                      30 - Minute Consultation Call
                    </Typography>
                  </Box>
                </Box>

                {/* Calendar */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#1A1A1A",
                      }}
                    >
                      June 2023
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        size="small"
                        sx={{ minWidth: "auto", color: "#666" }}
                      >
                        ‹
                      </Button>
                      <Button
                        size="small"
                        sx={{ minWidth: "auto", color: "#666" }}
                      >
                        ›
                      </Button>
                    </Box>
                  </Box>

                  {/* Calendar Grid */}
                  <Box>
                    {/* Day headers */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                        (day) => (
                          <Typography
                            key={day}
                            sx={{
                              fontFamily: "Source Sans Pro",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#666",
                              textAlign: "center",
                            }}
                          >
                            {day}
                          </Typography>
                        )
                      )}
                    </Box>

                    {/* Date cells */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: 1,
                      }}
                    >
                      {/* Empty cells for alignment */}
                      {[1, 2, 3].map((i) => (
                        <Box key={`empty-${i}`} sx={{ aspectRatio: "1" }} />
                      ))}

                      {calendarDates.map((date) => {
                        const isBooked = bookedDates.includes(date);
                        const isSelected = selectedDate?.getDate() === date;

                        return (
                          <Box
                            key={date}
                            onClick={() =>
                              !isBooked &&
                              setSelectedDate(new Date(2023, 5, date))
                            }
                            sx={{
                              aspectRatio: "1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "8px",
                              backgroundColor: isBooked
                                ? "#F5F5F5"
                                : isSelected
                                ? "#005F73"
                                : "transparent",
                              color: isBooked
                                ? "#CCC"
                                : isSelected
                                ? "#FFF"
                                : "#666",
                              fontFamily: "Source Sans Pro",
                              fontSize: "14px",
                              fontWeight: isSelected ? 600 : 400,
                              cursor: isBooked ? "not-allowed" : "pointer",
                              border: isSelected
                                ? "2px solid #005F73"
                                : "1px solid #E0E0E0",
                              "&:hover": {
                                backgroundColor: isBooked
                                  ? "#F5F5F5"
                                  : isSelected
                                  ? "#005F73"
                                  : "#F9F9F9",
                              },
                            }}
                          >
                            {date}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "12px",
                      color: "#666",
                      mt: 2,
                      textAlign: "center",
                    }}
                  >
                    Free cancellation up to 24 hours before session
                  </Typography>
                </Box>

                {/* Book Button */}
                <Button
                  fullWidth
                  disabled={!selectedDate}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    backgroundColor: "#FF5722",
                    color: "#FFF",
                    fontFamily: "Source Sans Pro",
                    fontSize: "16px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#E64A19",
                    },
                    "&:disabled": {
                      backgroundColor: "#CCC",
                      color: "#999",
                    },
                  }}
                >
                  {selectedDate ? "Book Session" : "Select a Date"}
                </Button>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      <SignUpModal open={showLoginModal} onClose={handleLoginModalClose} />
    </>
  );
}
