"use client";

import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { TimeSlot } from "@/services/bookingService";

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  loading?: boolean;
  error?: string;
  selectedDate: Date | null;
}

export default function TimeSlotPicker({
  slots,
  selectedSlot,
  onSlotSelect,
  loading = false,
  error,
  selectedDate,
}: TimeSlotPickerProps) {
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  const formatDateDisplay = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const isSlotSelected = (slot: TimeSlot): boolean => {
    if (!selectedSlot) return false;
    return (
      new Date(slot.start).getTime() === new Date(selectedSlot.start).getTime()
    );
  };

  if (!selectedDate) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
          backgroundColor: "#F9F9F9",
          borderRadius: "12px",
          border: "1px solid #E0E0E0",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "16px",
            color: "#666",
          }}
        >
          Please select a date to view available time slots
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "#005F73" }} />
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "14px",
            color: "#666",
          }}
        >
          Loading available time slots...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const availableSlots = slots.filter((slot) => slot.available);

  if (availableSlots.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
          backgroundColor: "#FFF3E0",
          borderRadius: "12px",
          border: "1px solid #FFB74D",
          p: 3,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "16px",
            fontWeight: 600,
            color: "#E65100",
            mb: 1,
          }}
        >
          No Available Slots
        </Typography>
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "14px",
            color: "#666",
            textAlign: "center",
          }}
        >
          There are no available time slots for{" "}
          {formatDateDisplay(selectedDate)}. Please select another date.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Selected Date Display */}
      <Typography
        sx={{
          fontFamily: "Source Sans Pro",
          fontSize: "16px",
          fontWeight: 600,
          color: "#1A1A1A",
          mb: 2,
        }}
      >
        {formatDateDisplay(selectedDate)}
      </Typography>

      {/* Time Slots Grid */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          maxHeight: 400,
          overflowY: "auto",
          pr: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#F5F5F5",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#005F73",
            borderRadius: "10px",
          },
        }}
      >
        {availableSlots.map((slot, index) => {
          const selected = isSlotSelected(slot);
          return (
            <Box
              key={index}
              onClick={() => onSlotSelect(slot)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                borderRadius: "8px",
                border: selected ? "2px solid #005F73" : "1px solid #E0E0E0",
                backgroundColor: selected ? "#E8F4F8" : "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: selected ? "#E8F4F8" : "#F9F9F9",
                  borderColor: "#005F73",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "16px",
                  fontWeight: selected ? 600 : 400,
                  color: selected ? "#005F73" : "#1A1A1A",
                }}
              >
                {formatTime(slot.start)}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Available Slots Count */}
      <Typography
        sx={{
          fontFamily: "Source Sans Pro",
          fontSize: "13px",
          color: "#666",
          mt: 2,
          textAlign: "center",
        }}
      >
        {availableSlots.length} slot{availableSlots.length !== 1 ? "s" : ""}{" "}
        available
      </Typography>
    </Box>
  );
}
