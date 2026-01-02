"use client";

import {
  Box,
  Typography,
  Grid,
  Alert,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  InputLabel,
  CircularProgress,
  IconButton,
  Button,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import TimezoneSelect from "react-timezone-select";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import OutLineButton from "../../components/ui/OutLineButton";

interface Step5CalendarProps {
  consultantId: string;
  onComplete: () => void;
  onPrevious: () => void;
}

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface AvailabilitySlot {
  dayOfWeek: number;
  timeRanges: TimeRange[];
  isAvailable: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const BUFFER_TIMES = [
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
];

export default function Step5Calendar({
  consultantId,
  onComplete,
  onPrevious,
}: Step5CalendarProps) {
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // New state: whether to show availability settings
  const [showAvailabilitySettings, setShowAvailabilitySettings] =
    useState(false);

  const [bookingSettings, setBookingSettings] = useState({
    availability: DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day.value,
      timeRanges: [{ startTime: "09:00", endTime: "17:00" }],
      isAvailable: day.value >= 1 && day.value <= 5, // Mon-Fri default
    })) as AvailabilitySlot[],
    bufferBetweenSessions: 10,
    minAdvanceBookingHours: 3,
    maxAdvanceBookingMonths: 6,
    autoCreateMeetLink: true,
    meetingLocation: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Load saved booking settings from sessionStorage on mount
  useEffect(() => {
    const savedSettings = sessionStorage.getItem("consultantStep5");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setBookingSettings(parsed.bookingSettings || bookingSettings);
        setShowAvailabilitySettings(parsed.showAvailabilitySettings || false);
      } catch (e) {
        console.error("Error loading saved step 5 data", e);
      }
    }
  }, []);

  // Auto-save booking settings to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem(
      "consultantStep5",
      JSON.stringify({
        bookingSettings,
        showAvailabilitySettings,
      })
    );
  }, [bookingSettings, showAvailabilitySettings]);

  // Check calendar connection status on mount
  useEffect(() => {
    checkCalendarStatus();
  }, []);

  const checkCalendarStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/google-calendar/status`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && data.data?.isConnected) {
        setCalendarConnected(true);
        setCalendarEmail(data.data.email || "");
        // If already connected, show availability settings
        setShowAvailabilitySettings(true);
      }
    } catch (error) {
      console.error("Error checking calendar status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    setApiError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/google-calendar/auth-url`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && data.data?.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.data.authUrl;
      } else {
        setApiError(data.message || "Failed to get OAuth URL");
        setIsConnecting(false);
      }
    } catch (error) {
      console.error("Error getting OAuth URL:", error);
      setApiError("Failed to connect to calendar service");
      setIsConnecting(false);
    }
  };

  // Skip calendar connection and complete registration
  const handleSkipAndContinue = async () => {
    setLoading(true);
    setApiError("");

    try {
      // Submit with default booking settings without calendar
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/consultants/${consultantId}/booking-settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ bookingSettings }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onComplete();
      } else {
        setApiError(data.message || "Failed to save booking settings");
      }
    } catch (error) {
      console.error("Error saving booking settings:", error);
      setApiError("Failed to save booking settings");
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = (
    dayOfWeek: number,
    field: "isAvailable",
    value: boolean
  ) => {
    setBookingSettings((prev) => ({
      ...prev,
      availability: prev.availability.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const handleTimeRangeChange = (
    dayOfWeek: number,
    rangeIndex: number,
    field: "startTime" | "endTime",
    value: Dayjs | null
  ) => {
    if (!value) return;

    const timeString = value.format("HH:mm");

    setBookingSettings((prev) => ({
      ...prev,
      availability: prev.availability.map((slot) =>
        slot.dayOfWeek === dayOfWeek
          ? {
              ...slot,
              timeRanges: slot.timeRanges.map((range, idx) =>
                idx === rangeIndex ? { ...range, [field]: timeString } : range
              ),
            }
          : slot
      ),
    }));
  };

  const addTimeRange = (dayOfWeek: number) => {
    setBookingSettings((prev) => ({
      ...prev,
      availability: prev.availability.map((slot) =>
        slot.dayOfWeek === dayOfWeek
          ? {
              ...slot,
              timeRanges: [
                ...slot.timeRanges,
                { startTime: "09:00", endTime: "17:00" },
              ],
            }
          : slot
      ),
    }));
  };

  const removeTimeRange = (dayOfWeek: number, rangeIndex: number) => {
    setBookingSettings((prev) => ({
      ...prev,
      availability: prev.availability.map((slot) =>
        slot.dayOfWeek === dayOfWeek
          ? {
              ...slot,
              timeRanges: slot.timeRanges.filter(
                (_, idx) => idx !== rangeIndex
              ),
            }
          : slot
      ),
    }));
  };

  const validateBookingSettings = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Check if at least one day is available
    const hasAvailableDays = bookingSettings.availability.some(
      (slot) => slot.isAvailable
    );
    if (!hasAvailableDays) {
      newErrors.availability = "Please select at least one available day";
    }

    // Validate time ranges
    bookingSettings.availability.forEach((slot) => {
      if (slot.isAvailable) {
        slot.timeRanges.forEach((range) => {
          const [startHour, startMin] = range.startTime.split(":").map(Number);
          const [endHour, endMin] = range.endTime.split(":").map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;

          if (endMinutes <= startMinutes) {
            newErrors.availability = "End time must be after start time";
          }
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateBookingSettings()) return;

    setLoading(true);
    setApiError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/consultants/${consultantId}/booking-settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ bookingSettings }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onComplete();
      } else {
        setApiError(data.message || "Failed to save booking settings");
      }
    } catch (error) {
      console.error("Error saving booking settings:", error);
      setApiError("Failed to save booking settings");
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#005F73" }} />
        <Typography sx={{ mt: 2, color: "#666" }}>
          Checking calendar status...
        </Typography>
      </Box>
    );
  }

  // SIMPLIFIED INITIAL VIEW - Connect or Skip
  if (!showAvailabilitySettings && !calendarConnected) {
    return (
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontFamily: "Faustina",
            fontSize: "24px",
            fontWeight: 700,
            color: "#1A1A1A",
            mb: 1,
          }}
        >
          Connect Your Calendar
        </Typography>
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "14px",
            color: "#666",
            mb: 4,
          }}
        >
          Connect your Google Calendar to manage session bookings and
          availability
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {apiError}
          </Alert>
        )}

        {/* Simplified Options */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            border: "1px solid #E0E0E0",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: "48px", mb: 2 }}>📅</Typography>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "18px",
                fontWeight: 600,
                color: "#1A1A1A",
                mb: 1,
              }}
            >
              Google Calendar Integration
            </Typography>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                color: "#666",
                mb: 3,
                maxWidth: 400,
                mx: "auto",
              }}
            >
              Connect your Google Calendar to automatically sync your
              availability and prevent double bookings.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
            }}
          >
            <ButtonSelfScore
              onClick={handleConnectCalendar}
              disabled={isConnecting}
              text={
                isConnecting ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  "Connect Google Calendar"
                )
              }
              style={{ minWidth: 250 }}
            />

            <Button
              variant="text"
              onClick={handleSkipAndContinue}
              disabled={loading}
              sx={{
                color: "#666",
                textTransform: "none",
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                "&:hover": {
                  backgroundColor: "transparent",
                  textDecoration: "underline",
                },
              }}
            >
              {loading ? "Processing..." : "Skip & Continue →"}
            </Button>
          </Box>
        </Paper>

        {/* Back Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 4 }}>
          <OutLineButton
            onClick={onPrevious}
            disabled={loading}
            sx={{ height: "40px" }}
          >
            Back
          </OutLineButton>
        </Box>
      </Box>
    );
  }

  // FULL VIEW - Availability Settings (shown after connecting calendar)
  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          fontFamily: "Faustina",
          fontSize: "24px",
          fontWeight: 700,
          color: "#1A1A1A",
          mb: 1,
        }}
      >
        Set Your Availability
      </Typography>
      <Typography
        sx={{
          fontFamily: "Source Sans Pro",
          fontSize: "14px",
          color: "#666",
          mb: 4,
        }}
      >
        Configure your weekly availability and booking preferences
      </Typography>

      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}

      {/* Calendar Connection Status */}
      {calendarConnected && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: "1px solid #4CAF50",
            borderRadius: "8px",
            backgroundColor: "#E8F5E9",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography sx={{ fontSize: "24px", mr: 1.5 }}>✓</Typography>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#2E7D32",
                }}
              >
                Calendar Connected
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#666" }}>
                {calendarEmail}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Timezone Selection */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid #E0E0E0",
          borderRadius: "8px",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "16px",
            fontWeight: 600,
            color: "#1A1A1A",
            mb: 2,
          }}
        >
          Timezone
        </Typography>

        <TimezoneSelect
          value={bookingSettings.timezone}
          onChange={(tz: any) =>
            setBookingSettings((prev) => ({
              ...prev,
              timezone: tz.value,
            }))
          }
          styles={{
            control: (provided: any) => ({
              ...provided,
              borderColor: "#E0E0E0",
              borderRadius: "8px",
              padding: "4px",
              fontFamily: "Source Sans Pro",
            }),
          }}
        />
      </Paper>

      {/* Weekly Availability */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid #E0E0E0",
          borderRadius: "8px",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "16px",
            fontWeight: 600,
            color: "#1A1A1A",
            mb: 2,
          }}
        >
          Weekly Availability
        </Typography>

        {errors.availability && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.availability}
          </Alert>
        )}

        <Grid container spacing={2}>
          {DAYS_OF_WEEK.map((day) => {
            const slot = bookingSettings.availability.find(
              (s) => s.dayOfWeek === day.value
            );
            if (!slot) return null;

            return (
              <Grid size={{ xs: 12 }} key={day.value}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: slot.isAvailable ? "#F9F9F9" : "#FFF",
                    borderRadius: "8px",
                    border: "1px solid #E0E0E0",
                  }}
                >
                  {/* Day Header with Checkbox */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: slot.isAvailable ? 2 : 0,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={slot.isAvailable}
                          onChange={(e) =>
                            handleAvailabilityChange(
                              day.value,
                              "isAvailable",
                              e.target.checked
                            )
                          }
                          sx={{
                            color: "#005F73",
                            "&.Mui-checked": { color: "#005F73" },
                          }}
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            fontWeight: 600,
                            minWidth: 100,
                            color: slot.isAvailable ? "#1A1A1A" : "#999",
                          }}
                        >
                          {day.label}
                        </Typography>
                      }
                    />

                    {slot.isAvailable && (
                      <IconButton
                        onClick={() => addTimeRange(day.value)}
                        size="small"
                        sx={{
                          color: "#005F73",
                          "&:hover": { backgroundColor: "#E8F4F8" },
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </Box>

                  {/* Time Ranges */}
                  {slot.isAvailable && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {slot.timeRanges.map((range, rangeIndex) => (
                          <Box
                            key={rangeIndex}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              pl: 5,
                            }}
                          >
                            <TimePicker
                              label="Start Time"
                              value={dayjs(`2000-01-01T${range.startTime}`)}
                              onChange={(newValue) =>
                                handleTimeRangeChange(
                                  day.value,
                                  rangeIndex,
                                  "startTime",
                                  newValue
                                )
                              }
                              slotProps={{
                                textField: {
                                  size: "small",
                                  sx: { minWidth: 140 },
                                },
                              }}
                            />

                            <Typography sx={{ color: "#666" }}>to</Typography>

                            <TimePicker
                              label="End Time"
                              value={dayjs(`2000-01-01T${range.endTime}`)}
                              onChange={(newValue) =>
                                handleTimeRangeChange(
                                  day.value,
                                  rangeIndex,
                                  "endTime",
                                  newValue
                                )
                              }
                              slotProps={{
                                textField: {
                                  size: "small",
                                  sx: { minWidth: 140 },
                                },
                              }}
                            />

                            {slot.timeRanges.length > 1 && (
                              <IconButton
                                onClick={() =>
                                  removeTimeRange(day.value, rangeIndex)
                                }
                                size="small"
                                sx={{
                                  color: "#F44336",
                                  "&:hover": { backgroundColor: "#FFEBEE" },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        ))}
                      </LocalizationProvider>
                    </Box>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Buffer Time Configuration */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid #E0E0E0",
          borderRadius: "8px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography sx={{ fontSize: "20px", mr: 1 }}>⏰</Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "16px",
              fontWeight: 600,
              color: "#1A1A1A",
            }}
          >
            Buffer Between Sessions
          </Typography>
        </Box>

        <FormControl fullWidth>
          <InputLabel>Buffer Time</InputLabel>
          <Select
            value={bookingSettings.bufferBetweenSessions}
            label="Buffer Time"
            onChange={(e) =>
              setBookingSettings((prev) => ({
                ...prev,
                bufferBetweenSessions: e.target.value as number,
              }))
            }
            sx={{
              backgroundColor: "#FFF",
              borderRadius: "8px",
              height: "48px",
              "& fieldset": {
                borderColor: "#3A3A3A4D",
                borderWidth: "1px",
              },
            }}
          >
            {BUFFER_TIMES.map((buffer) => (
              <MenuItem key={buffer.value} value={buffer.value}>
                {buffer.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography sx={{ fontSize: "12px", color: "#666", mt: 1 }}>
          Break time between consecutive sessions
        </Typography>
      </Paper>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
          gap: 2,
        }}
      >
        <OutLineButton
          onClick={onPrevious}
          disabled={loading}
          sx={{ height: "40px" }}
        >
          Back
        </OutLineButton>

        <ButtonSelfScore
          onClick={handleSubmit}
          disabled={loading}
          text={
            loading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Complete Setup"
            )
          }
          style={{ height: "40px" }}
        />
      </Box>
    </Box>
  );
}
