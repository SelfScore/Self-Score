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
        width: { xs: "100%", md: "auto" },
        minWidth: { xs: "unset", md: "362.65625px" },
        maxWidth: { xs: "100%", md: "400px" },
        minHeight: { xs: "auto", md: "296px" },
        gap: { xs: "12px", md: "16px" },
        borderRadius: { xs: "16px", md: "24px" },
        padding: { xs: "24px", md: "32px" },
        background: "#F7F7F7",
        border: "1px solid #3A3A3A4D",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Icon Box */}
      <Box
        sx={{
          width: { xs: "52px", md: "64px" },
          height: { xs: "52px", md: "64px" },
          borderRadius: { xs: "12px", md: "16px" },
          background: "#FF834C",
          border: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "& svg": {
            fontSize: { xs: 28, md: 32 },
          },
        }}
      >
        {icon}
      </Box>

      {/* Title */}
      <Typography
        sx={{
          fontFamily: "Source Sans Pro",
          fontWeight: 600,
          fontSize: { xs: "20px", md: "24px" },
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
          gap: { xs: "6px", md: "8px" },
        }}
      >
        {points.map((point, index) => (
          <Typography
            key={index}
            sx={{
              fontFamily: "Source Sans Pro",
              fontWeight: 400,
              fontSize: { xs: "14px", md: "16px" },
              lineHeight: { xs: "140%", md: "100%" },
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
