"use client";
import React from "react";
import { Box, Typography } from "@mui/material";

interface MissionCardProps {
  icon: React.ReactNode;
  title: string;
  points: string[];
}

const MissionCard: React.FC<MissionCardProps> = ({ icon, title, points }) => {
  return (
    <Box
      sx={{
        minWidth: "362.65625px",
        minHeight:"296px",
        gap: "16px",
        borderRadius: "24px",
        padding: "32px",
        background: "#F7F7F7",
        border: "1px solid #3A3A3A4D",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Icon Box */}
      <Box
        sx={{
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          background: "#FF834C",
          border: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>

      {/* Title */}
      <Typography
        sx={{
          fontFamily: "Source Sans Pro",
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "100%",
          letterSpacing: "0%",
          color: "#111827",
        }}
      >
        {title}
      </Typography>

      {/* Points List */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {points.map((point, index) => (
          <Typography
            key={index}
            sx={{
              fontFamily: "Source Sans Pro",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "100%",
              letterSpacing: "0%",
              color: "#4B5563",
            }}
          >
            {point}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default MissionCard;
