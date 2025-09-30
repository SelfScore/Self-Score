"use client";
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Container as MUIContainer,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DescriptionIcon from '@mui/icons-material/Description';

// Styled components
const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#fff", // White Color
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

const Circle = styled(Box)<{
  size: number;
  bgcolor: string;
  bordercolor: string;
}>(({ size, bgcolor, bordercolor, theme }) => ({
  position: "absolute",
  width: `${size}px`,
  height: `${size}px`,
  borderRadius: "50%",
  backgroundColor: `${bgcolor}`, // Circle Color
  border: `2px solid ${bordercolor}`,
  [theme.breakpoints.down("md")]: {
    width: `${size * 0.83}px`, // 500/600 ratio
    height: `${size * 0.83}px`,
  },
  [theme.breakpoints.down("sm")]: {
    width: `${size * 0.50}px`, // 400/600 ratio
    height: `${size * 0.50}px`,
  },
  [theme.breakpoints.down("xs")]: {
    width: `${size * 0.53}px`, // 320/600 ratio
    height: `${size * 0.53}px`,
  },
}));

const CenterIcon = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: 80,
  height: 80,
  borderRadius: "50%",
  backgroundColor: "#E87A42", // Primary Color
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1,
  [theme.breakpoints.down("md")]: {
    width: 65,
    height: 65,
  },
  [theme.breakpoints.down("sm")]: {
    width: 55,
    height: 55,
  },
  [theme.breakpoints.down("xs")]: {
    width: 35,
    height: 35,
  },
}));

const TraitLabel = styled(Paper)<{
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}>(({ theme, top, bottom, left, right }) => ({
  position: "absolute",
  // padding: theme.spacing(1.5, 3),
  height: "48px",
  width: "260px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#005F73", // Accent Color with transparency
  borderRadius: 32,
  border: "none",
  // boxShadow: "0 4px 12px rgba(0, 95, 115, 0.15)",
  zIndex: 5,
  top: top ? `${top}px` : "auto",
  bottom: bottom ? `${bottom}px` : "auto",
  left: left ? `${left}px` : "auto",
  right: right ? `${right}px` : "auto",
  transform: "translate(-50%, -50%)",
  [theme.breakpoints.down("md")]: {
    height: "40px",
    width: "220px",
    padding: theme.spacing(1.2, 2.5),
  },
  [theme.breakpoints.down("sm")]: {
    height: "28px",
    width: "140px",
    padding: theme.spacing(1, 2),
    borderRadius: 20,
  },
  [theme.breakpoints.down("xs")]: {
    height: "32px",
    width: "150px",
    padding: theme.spacing(0.8, 1.5),
    borderRadius: 15,
  },
}));

const TraitText = styled(Typography)(({ theme }) => ({
  color: "#F9F8F6", // White Color for text on accent background
  fontWeight: 500,
  fontFamily: "faustina",
  fontSize: "20px",
  textAlign: "center",
  whiteSpace: "nowrap",
  [theme.breakpoints.down("md")]: {
    fontSize: "16px",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "14px",
  },
  [theme.breakpoints.down("xs")]: {
    fontSize: "12px",
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
              fontWeight: 700,
              fontFamily: "faustina",
              color: "#000000",
              lineHeight: "100%",
              mb: 3,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "28px" },
            }}
          >
            Advantage of taking the test
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#2B2B2B",
              maxWidth: "900px",
              fontFamily: "Source Sans Pro",
              mx: "auto",
              lineHeight: 1.6,
              fontSize: { xs: "1rem", sm: "1.1rem", md: "18px" },
            }}
          >
            Most people are caught in “eat, drink, and be merry.” But what about
            mind purification, the ability to live fully in the present moment?
          </Typography>
        </Box>
      </MUIContainer>

      <CircularContainer>
        {/* Concentric circles */}
        <Circle size={554} bgcolor="#F7EFE8" bordercolor="#F4D7C6" />
        <Circle size={449} bgcolor="#F5E1D4" bordercolor="#F4D7C6" />
        <Circle size={370} bgcolor="#F3D1BD" bordercolor="#F4D7C6" />
        <Circle size={233} bgcolor="#F7EFE8" bordercolor="#F1C0A5" />

        {/* Center icon */}
        <CenterIcon>
          <DescriptionIcon
            sx={{
              color: "white",
              fontSize: { xs: 28, sm: 32, md: 36, lg: 40 },
            }}
          />
        </CenterIcon>

        {/* Trait labels positioned around the circle */}
        <TraitLabel
          sx={{
            top: { xs: "7%", sm: "6%", md: "25px" },
            left: { xs: "50%", sm: "50%", md: "300px" },
            transform: "translate(-50%, -50%)",
          }}
        >
          <TraitText>Self-Awareness</TraitText>
        </TraitLabel>

        <TraitLabel
          sx={{
            top: { xs: "30%", sm: "32%", md: "180px" },
            left: { xs: "15%", sm: "0%", md: "40px" },
            transform: "translate(-50%, -50%)",
          }}
        >
          <TraitText>Emotional Clarity</TraitText>
        </TraitLabel>

        <TraitLabel
          sx={{
            top: { xs: "30%", sm: "32%", md: "180px" },
            right: { xs: "16%", sm: "0%", md: "50px" },
            transform: "translate(50%, -50%)",
          }}
        >
          <TraitText>Inner Balance</TraitText>
        </TraitLabel>

        <TraitLabel
          sx={{
            bottom: { xs: "30%", sm: "32%", md: "160px" },
            left: { xs: "15%", sm: "0%", md: "40px" },
            transform: "translate(-50%, 50%)",
          }}
        >
          <TraitText>Mental Focus</TraitText>
        </TraitLabel>

        <TraitLabel
          sx={{
            bottom: { xs: "30%", sm: "32%", md: "160px" },
            right: { xs: "16%", sm: "0%", md: "50px" },
            transform: "translate(50%, 50%)",
          }}
        >
          <TraitText>Personal Growth</TraitText>
        </TraitLabel>

        <TraitLabel
          sx={{
            bottom: { xs: "8%", sm: "6%", md: "30px" },
            left: { xs: "50%", sm: "50%", md: "300px" },
            transform: "translate(-50%, 50%)",
          }}
        >
          <TraitText>Lasting Peace</TraitText>
        </TraitLabel>
      </CircularContainer>
    </Container>
  );
};

export default Advantages;
