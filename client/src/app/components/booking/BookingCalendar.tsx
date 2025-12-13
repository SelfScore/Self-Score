"use client";

import { Box, Typography, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useState } from "react";

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date; // Minimum selectable date
  maxDate?: Date; // Maximum selectable date
}

const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function BookingCalendar({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get day of week for first day (0 = Sunday, adjust to Monday = 0)
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    return { daysInMonth, firstDayOfWeek };
  };

  const { daysInMonth, firstDayOfWeek } = getDaysInMonth(currentMonth);

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    // Check if before min date
    if (date < minDate) return true;

    // Check if after max date
    if (maxDate && date > maxDate) return true;

    return false;
  };

  const isDateSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    if (isDateDisabled(day)) return;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onDateSelect(date);
  };

  // Generate calendar grid
  const calendarDays = [];

  // Empty cells before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(<Box key={`empty-${i}`} />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const disabled = isDateDisabled(day);
    const selected = isDateSelected(day);

    calendarDays.push(
      <Box
        key={day}
        onClick={() => handleDateClick(day)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 40,
          cursor: disabled ? "not-allowed" : "pointer",
          borderRadius: "8px",
          backgroundColor: selected ? "#005F73" : "transparent",
          color: selected ? "#FFFFFF" : disabled ? "#CCCCCC" : "#1A1A1A",
          fontFamily: "Source Sans Pro",
          fontSize: "14px",
          fontWeight: selected ? 600 : 400,
          transition: "all 0.2s ease",
          "&:hover": disabled
            ? {}
            : {
                backgroundColor: selected ? "#004D5C" : "#E8F4F8",
              },
        }}
      >
        {day}
      </Box>
    );
  }

  return (
    <Box>
      {/* Month Navigation */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <IconButton
          onClick={handlePreviousMonth}
          sx={{
            color: "#005F73",
            "&:hover": { backgroundColor: "#E8F4F8" },
          }}
        >
          <ChevronLeft />
        </IconButton>

        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "18px",
            fontWeight: 600,
            color: "#1A1A1A",
          }}
        >
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Typography>

        <IconButton
          onClick={handleNextMonth}
          sx={{
            color: "#005F73",
            "&:hover": { backgroundColor: "#E8F4F8" },
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Days of Week Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 1,
          mb: 1,
        }}
      >
        {DAYS_OF_WEEK.map((day) => (
          <Box key={day}>
            <Typography
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
          </Box>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box
        sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}
      >
        {calendarDays.map((day, index) => (
          <Box key={index}>{day}</Box>
        ))}
      </Box>
    </Box>
  );
}
