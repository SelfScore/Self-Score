"use client";
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Container as MUIContainer,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";

// Styled components
const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#F9F8F6", // White Color
  padding: theme.spacing(4),
}));

const CircularContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  maxWidth: 600,
  height: "auto",
  aspectRatio: "1 / 1",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  [theme.breakpoints.down("md")]: {
    maxWidth: 500,
  },
  [theme.breakpoints.down("sm")]: {
    maxWidth: 400,
  },
  [theme.breakpoints.down("xs")]: {
    maxWidth: 320,
  },
}));

const Circle = styled(Box)<{ size: number; opacity: number }>(
  ({ size, opacity, theme }) => ({
    position: "absolute",
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    backgroundColor: `rgba(232, 122, 66, ${opacity})`, // Primary Color with varying opacity
    border: "2px solid rgba(232, 122, 66, 0.2)",
    [theme.breakpoints.down("md")]: {
      width: `${size * 0.83}px`, // 500/600 ratio
      height: `${size * 0.83}px`,
    },
    [theme.breakpoints.down("sm")]: {
      width: `${size * 0.67}px`, // 400/600 ratio
      height: `${size * 0.67}px`,
    },
    [theme.breakpoints.down("xs")]: {
      width: `${size * 0.53}px`, // 320/600 ratio
      height: `${size * 0.53}px`,
    },
  })
);

const CenterIcon = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: 80,
  height: 80,
  borderRadius: "50%",
  backgroundColor: "#E87A42", // Primary Color
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10,
  [theme.breakpoints.down("md")]: {
    width: 65,
    height: 65,
  },
  [theme.breakpoints.down("sm")]: {
    width: 55,
    height: 55,
  },
  [theme.breakpoints.down("xs")]: {
    width: 45,
    height: 45,
  },
}));

const TraitLabel = styled(Paper)<{
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}>(({ theme, top, bottom, left, right }) => ({
  position: "absolute",
  padding: theme.spacing(1.5, 3),
  backgroundColor: "rgba(0, 95, 115, 0.9)", // Accent Color with transparency
  borderRadius: 25,
  border: "none",
  boxShadow: "0 4px 12px rgba(0, 95, 115, 0.15)",
  zIndex: 5,
  top: top ? `${top}px` : "auto",
  bottom: bottom ? `${bottom}px` : "auto",
  left: left ? `${left}px` : "auto",
  right: right ? `${right}px` : "auto",
  transform: "translate(-50%, -50%)",
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(1.2, 2.5),
    top: top ? `${top * 0.83}px` : "auto",
    bottom: bottom ? `${bottom * 0.83}px` : "auto",
    left: left ? `${left * 0.83}px` : "auto",
    right: right ? `${right * 0.83}px` : "auto",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2),
    borderRadius: 20,
    top: top ? `${top * 0.67}px` : "auto",
    bottom: bottom ? `${bottom * 0.67}px` : "auto",
    left: left ? `${left * 0.67}px` : "auto",
    right: right ? `${right * 0.67}px` : "auto",
  },
  [theme.breakpoints.down("xs")]: {
    padding: theme.spacing(0.8, 1.5),
    borderRadius: 15,
    top: top ? `${top * 0.53}px` : "auto",
    bottom: bottom ? `${bottom * 0.53}px` : "auto",
    left: left ? `${left * 0.53}px` : "auto",
    right: right ? `${right * 0.53}px` : "auto",
  },
}));

const TraitText = styled(Typography)(({ theme }) => ({
  color: "#F9F8F6", // White Color for text on accent background
  fontWeight: 600,
  fontSize: "16px",
  textAlign: "center",
  whiteSpace: "nowrap",
  [theme.breakpoints.down("md")]: {
    fontSize: "14px",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "12px",
  },
  [theme.breakpoints.down("xs")]: {
    fontSize: "10px",
    whiteSpace: "normal",
  },
}));

const Advantages: React.FC = () => {
  return (
    <Container>
      <MUIContainer maxWidth="lg">
        {/* Title and Subtitle Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 6, md: 8 },
            maxWidth: "800px",
            mx: "auto",
            mt: 4,
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
            Advantages of taking this test
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
            Explore the five key dimensions of personality that shape who you
            are and unlock insights for personal growth and development.
          </Typography>
        </Box>
      </MUIContainer>

      <CircularContainer>
        {/* Concentric circles */}
        <Circle size={500} opacity={0.08} />
        <Circle size={400} opacity={0.12} />
        <Circle size={300} opacity={0.16} />
        <Circle size={200} opacity={0.2} />

        {/* Center icon */}
        <CenterIcon>
          <AddIcon
            sx={{
              color: "white",
              fontSize: { xs: 28, sm: 32, md: 36, lg: 40 },
            }}
          />
        </CenterIcon>

        {/* Trait labels positioned around the circle */}
        <TraitLabel top={50} left={300}>
          <TraitText>Openness to experience</TraitText>
        </TraitLabel>

        <TraitLabel top={180} left={120}>
          <TraitText>Neuroticism</TraitText>
        </TraitLabel>

        <TraitLabel top={180} right={-50}>
          <TraitText>Conscientiousness</TraitText>
        </TraitLabel>

        <TraitLabel bottom={180} left={120}>
          <TraitText>Agreeableness</TraitText>
        </TraitLabel>

        <TraitLabel bottom={180} right={-40}>
          <TraitText>Extraversion</TraitText>
        </TraitLabel>

        <TraitLabel bottom={20} left={300}>
          <TraitText>See it live in action</TraitText>
        </TraitLabel>
      </CircularContainer>
    </Container>
  );
};

export default Advantages;
