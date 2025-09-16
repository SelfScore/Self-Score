"use client";

import { Box, Typography, Container } from "@mui/material";

export default function AboutUs() {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#F9F8F6",
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
              fontWeight: "bold",
              color: "#005F73",
              mb: 3,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            About Us
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#2B2B2B",
              maxWidth: "600px",
              mx: "auto",
              lineHeight: 1.6,
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
            }}
          >
            We're dedicated to helping you transform your life through
            comprehensive assessment and personalized guidance on your journey
            to personal growth.
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
                height: { xs: "300px", md: "400px" },
                borderRadius: "20px",
                overflow: "hidden",
                backgroundColor: "#F9F8F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Placeholder for image - replace with your actual image */}
              <Box
                sx={{
                  width: "80%",
                  height: "80%",
                  backgroundColor: "#E0E0E0",
                  borderRadius: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "#2B2B2B", textAlign: "center" }}
                >
                  Your Image Here
                </Typography>
              </Box>
              {/* Uncomment and use this when you have an actual image
              <Image
                src="/path-to-your-image.jpg"
                alt="About Us"
                fill
                style={{ objectFit: "cover" }}
              />
              */}
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
                fontWeight: "bold",
                color: "#005F73",
                mb: 3,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
              }}
            >
              Empowering Your Life Journey
            </Typography>

            <Typography
              variant="body1"
              paragraph
              sx={{
                fontSize: "1.1rem",
                lineHeight: 1.7,
                color: "#2B2B2B",
                mb: 3,
              }}
            >
              At LifeScore, we believe that every individual has the potential
              for extraordinary growth. Our comprehensive assessment system is
              designed to meet you exactly where you are in your life journey
              and guide you toward where you want to be.
            </Typography>

            <Typography
              variant="body1"
              paragraph
              sx={{
                fontSize: "1.1rem",
                lineHeight: 1.7,
                color: "#2B2B2B",
                mb: 3,
              }}
            >
              Through our four-level progressive system, we provide personalized
              insights, practical tools, and actionable strategies that
              transform self-awareness into meaningful life changes.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: "1.1rem",
                lineHeight: 1.7,
                color: "#2B2B2B",
              }}
            >
              Whether you're just beginning your journey of self-discovery or
              ready to take your personal development to the next level, we're
              here to support you every step of the way.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
