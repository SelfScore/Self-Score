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
            fontWeight: "700",
            fontFamily: "faustina",
            color: "#000",
            mb: 3,
            mt: { xs: 11, md: 15 },
            fontSize: { xs: "2rem", sm: "2.5rem", md: "40px" },
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
            maxWidth: " 500px",
            color: "#6B7280",
          }}
        >
          Here's an overview of your journey so far.
          <br />
          Keep going to unlock deeper insights about your happiness.
        </Box>
      </Box>

      {/* progress bar  */}

      <JourneyProgress />
      <Testimonial />
      <FAQ />
    </Box>
  );
}
