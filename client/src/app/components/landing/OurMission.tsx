"use client";

import { Box, Typography, Button, Collapse } from "@mui/material";
import { useState } from "react";

export default function OurMission() {
  const [showMeaning, setShowMeaning] = useState(false);

  const toggleMeaning = () => {
    setShowMeaning(!showMeaning);
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        background: "linear-gradient(360deg, #F3D1BD -88.02%, #F7EFE8 204.19%)",
        width: "100%",
        mx: "auto",
        border: "4px solid #E6B79C99",
        borderLeft: "none",
        borderRight: "none",
        py: { xs: 1.5, md: 2.2 },
        px: { xs: 2, md: 0 },
      }}
    >
      <Typography
        variant="h2"
        component="h2"
        sx={{
          fontWeight: "700",
          color: "#1A1A1A",
          my: { xs: 1.5, md: 2 },
          lineHeight: "100%",
          fontSize: { xs: "1.2rem", sm: "1.8rem", md: "40px" },
          wordBreak: "break-word",
          hyphens: "auto",
        }}
      >
        ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय ।<br /> मृत्योर्मा अमृतं गमय । ॐ
        शान्तिः शान्तिः शान्तिः ॥
      </Typography>

      <Collapse in={showMeaning} timeout={500}>
        <Box
          sx={{
            mt: { xs: 2, md: 3 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Typography
            sx={{
              fontWeight: "400",
              color: "#1A1A1A",
              lineHeight: "100%",
              fontSize: { xs: "0.9rem", sm: "1.1rem", md: "18px" },
              textAlign: "left",
              maxWidth: "550px",
              mx: "auto",
            }}
          >
            <strong>1:</strong> Om, (O Lord) From (the Phenomenal World of)
            Unreality, make me go (i.e. Lead me) towards the Reality (of Eternal
            Self),
            <br />
            <br />
            <strong>2:</strong> From the Darkness (of Ignorance), make me go
            (i.e. Lead me) towards the Light (of Spiritual Knowledge),
            <br />
            <br />
            <strong>3:</strong> From (the World of) Mortality (of Material
            Attachment), make me go (i.e. Lead me) towards the World of
            Immortality (of Self-Realization),
            <br />
            <br />
            <strong>4:</strong> Om, Peace, Peace, Peace.
          </Typography>
        </Box>
      </Collapse>

      <Button
        onClick={toggleMeaning}
        sx={{
          mt: { xs: 2, md: 2.5 },
          mb: { xs: 1, md: 1.5 },
          px: { xs: 3, md: 4 },
          py: { xs: 1, md: 1.2 },
          fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
          fontWeight: "600",
          color: "#1A1A1A",
          backgroundColor: "rgba(230, 183, 156, 0.3)",
          border: "2px solid #E6B79C",
          borderRadius: "8px",
          textTransform: "none",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(230, 183, 156, 0.5)",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          },
        }}
      >
        {showMeaning ? "Hide Meaning" : "Know the Meaning"}
      </Button>
    </Box>
  );
}
