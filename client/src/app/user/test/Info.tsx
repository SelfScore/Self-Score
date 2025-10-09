"use client";

import Testimonial from "@/app/components/landing/Testimonial";
import JourneyProgress from "./JourneyProgress";
import { Box } from "@mui/material";
import FAQ from "@/app/components/landing/FAQ";

export default function Info() {
  return (
    <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
      {/* title  */}
      <Box
        sx={{
          textAlign: "center",
          px: { xs: 2, md: 0 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFF",
        }}
      >
        <Box
          sx={{
            mb: { xs: 4, md: 3 },
            mt: { xs: 4, md: 18 },
            fontFamily: "faustina",
            fontWeight: 700,
            fontSize: { xs: "24px", md: "40px" },
            lineHeight: "100%",
            letterSpacing: "0%",
            color: "#111827",
            // mb: 1,
          }}
        >
          Self Score Test
        </Box>
        <Box
          sx={{
            mb: { xs: 4, md: 10 },
            fontFamily: "Source Sans Pro",
            fontWeight: 400,
            fontSize: { xs: "16px", md: "18px" },
            lineHeight: "120%",
            letterSpacing: "0%",
            maxWidth:" 500px",
            color: "#6B7280",
          }}
        >
          Here's an overview of your journey so far. Keep going to unlock deeper
          insights about your happiness.
        </Box>
      </Box>

      {/* progress bar  */}
      
      <JourneyProgress />
      <Testimonial/>
      <FAQ />
    </Box>
  );
}
