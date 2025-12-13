"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Divider,
} from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  VideoCall,
  Cancel,
  CheckCircle,
} from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { bookingService, Booking } from "@/services/bookingService";

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

function UserBookingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitialized } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // Cancel dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    // Wait for initial auth check to complete
    if (!isInitialized) {
      setLoading(true);
      return;
    }

    // Once initialized, check if user is authenticated
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // If authenticated, fetch bookings
    fetchBookings();

    // Check for success message
    if (searchParams.get("success") === "true") {
      setSuccessMessage("Booking confirmed successfully! 🎉");
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [isAuthenticated, isInitialized]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await bookingService.getUserBookings();

      if (response.success && response.data) {
        // Backend returns { bookings: [], count: number }
        const bookingsData = (response.data as any).bookings || response.data;
        // Ensure data is an array
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
        setBookings(bookingsArray);
      } else {
        setError("Failed to load bookings");
        setBookings([]);
      }
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings. Please try again.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;

    try {
      setCancelLoading(true);
      const response = await bookingService.cancelBooking({
        bookingId: bookingToCancel._id,
        cancellationReason: cancellationReason,
      });

      if (response.success) {
        setSuccessMessage("Booking cancelled successfully");
        setCancelDialogOpen(false);
        setBookingToCancel(null);
        setCancellationReason("");
        fetchBookings();
      } else {
        setError(response.message || "Failed to cancel booking");
      }
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      setError("Failed to cancel booking. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const getBookingStatus = (booking: Booking) => {
    if (booking.status === "CANCELLED") {
      return {
        label: "Cancelled",
        color: "#F44336",
        bgColor: "#FFEBEE",
      };
    }

    const now = new Date();
    const startTime = new Date(booking.startTime);

    if (booking.status === "CREATED") {
      const expiryTime = new Date(
        new Date(booking.createdAt).getTime() + 10 * 60 * 1000
      );
      if (now > expiryTime) {
        return {
          label: "Expired",
          color: "#FF9800",
          bgColor: "#FFF3E0",
        };
      }
      return {
        label: "Pending",
        color: "#FF9800",
        bgColor: "#FFF3E0",
      };
    }

    if (now > startTime) {
      return {
        label: "Completed",
        color: "#4CAF50",
        bgColor: "#E8F5E9",
      };
    }

    return {
      label: "Confirmed",
      color: "#4CAF50",
      bgColor: "#E8F5E9",
    };
  };

  const filterBookings = (type: "upcoming" | "past" | "cancelled") => {
    const now = new Date();

    return bookings.filter((booking) => {
      const startTime = new Date(booking.startTime);

      if (type === "cancelled") {
        return booking.status === "CANCELLED";
      }

      if (booking.status === "CANCELLED") return false;

      if (type === "upcoming") {
        return startTime > now && booking.status === "PAID";
      }

      if (type === "past") {
        // Show PAID bookings that have ended, and CREATED/expired bookings
        if (booking.status === "PAID" && startTime <= now) {
          return true;
        }
        // Also show CREATED bookings that have expired (older than 10 mins)
        if (booking.status === "CREATED") {
          const expiryTime = new Date(
            new Date(booking.createdAt).getTime() + 10 * 60 * 1000
          );
          return now > expiryTime;
        }
        return false;
      }

      return false;
    });
  };

  const upcomingBookings = filterBookings("upcoming");
  const pastBookings = filterBookings("past");
  const cancelledBookings = filterBookings("cancelled");

  const renderBookingCard = (booking: Booking) => {
    const status = getBookingStatus(booking);
    const consultant = booking.consultantId;

    // Handle case where consultant data isn't populated
    if (!consultant || typeof consultant === "string") {
      console.warn("Consultant data not populated for booking:", booking._id);
      return null;
    }

    return (
      <Paper
        key={booking._id}
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "12px",
          border: "1px solid #E0E0E0",
          mb: 2,
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
          <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
            <Avatar
              src={consultant.profilePhoto}
              sx={{ width: 64, height: 64, border: "2px solid #005F73" }}
            >
              {consultant.firstName?.charAt(0) || "C"}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontFamily: "Faustina",
                  fontSize: "20px",
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
                  fontSize: "14px",
                  color: "#666",
                  mb: 1,
                }}
              >
                {booking.sessionType} Consultation
              </Typography>
              <Chip
                label={status.label}
                size="small"
                sx={{
                  backgroundColor: status.bgColor,
                  color: status.color,
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CalendarToday sx={{ color: "#005F73", fontSize: "20px" }} />
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "15px",
                color: "#1A1A1A",
              }}
            >
              {bookingService.formatDate(booking.startTime)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AccessTime sx={{ color: "#005F73", fontSize: "20px" }} />
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "15px",
                color: "#1A1A1A",
              }}
            >
              {bookingService.formatTime(booking.startTime)} -{" "}
              {bookingService.formatTime(booking.endTime)} (
              {booking.userTimezone})
            </Typography>
          </Box>

          {booking.meetingLink && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <VideoCall sx={{ color: "#005F73", fontSize: "20px" }} />
              <Typography
                component="a"
                href={booking.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "15px",
                  color: "#005F73",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Join Video Call
              </Typography>
            </Box>
          )}

          {booking.userNotes && (
            <Box
              sx={{
                mt: 1,
                p: 2,
                backgroundColor: "#F9F9F9",
                borderRadius: "8px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#666",
                  mb: 0.5,
                }}
              >
                Your Notes:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  color: "#1A1A1A",
                }}
              >
                {booking.userNotes}
              </Typography>
            </Box>
          )}
        </Box>

        {booking.status === "PAID" &&
          new Date(booking.startTime) > new Date() && (
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => handleCancelClick(booking)}
                sx={{
                  borderColor: "#F44336",
                  color: "#F44336",
                  textTransform: "none",
                  fontFamily: "Source Sans Pro",
                  "&:hover": {
                    borderColor: "#D32F2F",
                    backgroundColor: "#FFEBEE",
                  },
                }}
              >
                Cancel Booking
              </Button>
            </Box>
          )}
      </Paper>
    );
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

  return (
    <>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#F9F9F9", py: 8 }}>
        <Container maxWidth="lg" sx={{ mt: 8 }}>
          {/* Header */}
          <Typography
            sx={{
              fontFamily: "Faustina",
              fontSize: { xs: "28px", md: "36px" },
              fontWeight: 700,
              color: "#1A1A1A",
              mb: 1,
            }}
          >
            My Bookings
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "16px",
              color: "#666",
              mb: 4,
            }}
          >
            Manage your consultation bookings
          </Typography>

          {successMessage && (
            <Alert
              severity="success"
              onClose={() => setSuccessMessage("")}
              sx={{ mb: 3 }}
            >
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Paper
            elevation={0}
            sx={{ borderRadius: "12px", border: "1px solid #E0E0E0" }}
          >
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{
                borderBottom: "1px solid #E0E0E0",
                px: 2,
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
              <Tab label={`Upcoming (${upcomingBookings.length})`} />
              <Tab label={`Past (${pastBookings.length})`} />
              <Tab label={`Cancelled (${cancelledBookings.length})`} />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Upcoming Tab */}
              <TabPanel value={tabValue} index={0}>
                {upcomingBookings.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 6,
                    }}
                  >
                    <CheckCircle
                      sx={{ fontSize: 64, color: "#E0E0E0", mb: 2 }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "18px",
                        color: "#666",
                        mb: 2,
                      }}
                    >
                      No upcoming bookings
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => router.push("/consultations")}
                      sx={{
                        backgroundColor: "#005F73",
                        color: "#FFF",
                        textTransform: "none",
                        fontFamily: "Source Sans Pro",
                        fontWeight: 600,
                        "&:hover": {
                          backgroundColor: "#004D5C",
                        },
                      }}
                    >
                      Browse Consultants
                    </Button>
                  </Box>
                ) : (
                  <>
                    {upcomingBookings
                      .map((booking) => renderBookingCard(booking))
                      .filter(Boolean)}
                  </>
                )}
              </TabPanel>

              {/* Past Tab */}
              <TabPanel value={tabValue} index={1}>
                {pastBookings.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "16px",
                        color: "#666",
                      }}
                    >
                      No past bookings
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {pastBookings
                      .map((booking) => renderBookingCard(booking))
                      .filter(Boolean)}
                  </>
                )}
              </TabPanel>

              {/* Cancelled Tab */}
              <TabPanel value={tabValue} index={2}>
                {cancelledBookings.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "16px",
                        color: "#666",
                      }}
                    >
                      No cancelled bookings
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {cancelledBookings
                      .map((booking) => renderBookingCard(booking))
                      .filter(Boolean)}
                  </>
                )}
              </TabPanel>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontFamily: "Faustina",
            fontSize: "24px",
            fontWeight: 700,
          }}
        >
          Cancel Booking
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "16px",
              color: "#666",
              mb: 2,
            }}
          >
            Are you sure you want to cancel this booking? This action cannot be
            undone.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for cancellation (optional)"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontFamily: "Source Sans Pro",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            sx={{
              color: "#666",
              textTransform: "none",
              fontFamily: "Source Sans Pro",
            }}
          >
            Keep Booking
          </Button>
          <Button
            onClick={handleCancelConfirm}
            disabled={cancelLoading}
            sx={{
              backgroundColor: "#F44336",
              color: "#FFF",
              textTransform: "none",
              fontFamily: "Source Sans Pro",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#D32F2F",
              },
            }}
          >
            {cancelLoading ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function UserBookingsPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <UserBookingsContent />
    </Suspense>
  );
}
