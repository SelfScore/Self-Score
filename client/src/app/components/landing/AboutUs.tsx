"use client";

import { Box, Typography, Container } from "@mui/material";
import AboutUsIMG from "../../../../public/images/LandingPage/aboutus.jpg"
import Image from "next/image";

export default function AboutUs() {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#FAFAFA",
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        {/* Title and Subtitle Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 6, md: 8 },
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 700,
              fontFamily: "faustina",
              color: "#000",
              mb: 3,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "28px" },
            }}
          >
            About Us
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#2B2B2B",
              maxWidth: "500px",
              fontFamily: "source sans pro",
              mx: "auto",
              lineHeight: 1.6,
              fontSize: { xs: "1rem", sm: "1.1rem", md: "18px" },
            }}
          >
            We're dedicated to helping you transform your life through
            comprehensive assessment and personalized guidance.
          </Typography>
        </Box>

        {/* Image and Text Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 4, md: 6 },
          }}
        >
          {/* Image on Left */}
          <Box
            sx={{
              flex: "0 0 auto",
              width: { xs: "100%", md: "45%" },
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: { xs: "300px", md: "350px" },
                borderRadius: "20px",
                overflow: "hidden",
                backgroundColor: "#F9F8F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src={AboutUsIMG}
                alt="About Us"
                fill
                style={{ objectFit: "cover" }}
              />
             
            </Box>
          </Box>

          {/* Text on Right */}
          <Box
            sx={{
              flex: 1,
              width: { xs: "100%", md: "55%" },
            }}
          >
            <Typography
              variant="h4"
              component="h3"
              sx={{
                fontWeight: 700,
                color: "#000",
                fontFamily: "faustina",
                mb: 3,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "28px" },
              }}
            >
              Empowering Your Life Journey
            </Typography>

            <Typography
              variant="body1"
              paragraph
              sx={{
                fontSize: "18px",
                lineHeight: 1.2,
                fontFamily: "source sans pro",
                color: "#2B2B2B",
                mb: 3,
                fontWeight:"400",
              }}
            >
              At SelfScore, we believe that every individual has the potential
              for extraordinary growth. Our comprehensive assessment system is
              designed to meet you exactly where you are in your life journey
              and guide you toward where you want to be.
            </Typography>

            <Typography
              variant="body1"
              paragraph
              sx={{
                fontSize: "18px",
                lineHeight: 1.2,
                fontFamily: "source sans pro",
                color: "#2B2B2B",
                mb: 3,
                fontWeight:"400",
              }}
            >
              Through our four-level progressive system, we provide personalized
              insights, practical tools, and actionable strategies that
              transform self-awareness into meaningful life changes.
            </Typography>

            
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
