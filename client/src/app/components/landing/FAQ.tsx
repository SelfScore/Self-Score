"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FAQIcon from "../../../../public/images/LandingPage/FAQ.png";

const FAQ: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const faqData = [
    {
      id: "panel1",
      question: "What is a self-score?",
      answer:
        "A self-score is a reflection of your inner life, your awareness, clarity, peace, and overall state of happiness. Unlike a credit score that only measures finances, a Self Score gives you insight into your emotional and spiritual well-being, helping you see where you stand in life.",
    },
    {
      id: "panel2",
      question: "Why should I take this test?",
      answer:
        "The test helps you turn inward and understand yourself more deeply. It uncovers hidden strengths and blind spots, guiding you toward balance, peace, and growth. By knowing your Self Score, you begin a journey of transformation that can bring clarity, purpose, and harmony into everyday life.",
    },
    {
      id: "panel3",
      question: " How does the test work?",
      answer:
        "You simply answer a set of thoughtful and reflective questions designed to assess your personality, self-awareness, and state of mind. Each question invites you to pause, reflect, and be honest. Based on your responses, you’ll receive a score along with insights that show you where you are in your personal journey.",
    },
    {
      id: "panel4",
      question: " Are the results accurate?",
      answer:
        "The test is designed as a tool for self-inquiry rather than judgment. The accuracy depends on your honesty and openness while answering. The more truthful you are, the deeper the insights you’ll gain, making your results a meaningful guide for self-improvement and personal growth.",
    },
    {
      id: "panel5",
      question: "Which test should I choose, basic, moderate, or detailed?",
      answer:
        "Each test offers a different depth of exploration. The basic test is quick and easy, ideal if you want a starting point. The moderate test offers more balance and detail. The detailed test goes deeper into your personality and consciousness, perfect if you are ready for an advanced level of reflection.",
    },
    {
      id: "panel6",
      question: "What happens after I get my score?",
      answer:
        "Once you receive your self-score, you’ll also get insights about your inner state along with suggestions for improvement. This may include practices for self-awareness, balance, and peace of mind. It’s not the end of the journey; it’s the beginning of living more consciously, with clarity and a deeper connection to yourself.",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#F7F7F7",
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        {/* Split Layout Container */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 6 },
            alignItems: { xs: "center", md: "flex-start" },
          }}
        >
          {/* Left Side - Title Section (30%) */}
          <Box
            sx={{
              flex: { xs: "none", md: "0 0 30%" },
              width: { xs: "100%", md: "30%" },
              textAlign: { xs: "center", md: "left" },
              position: { md: "sticky" },
              top: { md: "2rem" },
            }}
          >
            <Box>
              <img
                src={FAQIcon.src}
                alt="FAQ Icon"
                style={{ width: "60px", height: "60px", marginBottom: "16px" }}
              />
            </Box>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: "bold",
                fontFamily: "faustina",
                color: "#000",
                mb: 3,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "40px" },
                lineHeight: 1.2,
              }}
            >
              Frequently <br /> Asked <br /> Questions
            </Typography>
            {/* <Typography
              variant="h6"
              sx={{
                color: "#2B2B2B",
                lineHeight: 1.6,
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                display: { xs: "block", md: "block" },
              }}
            >
              Find answers to common questions about our personality assessment
              and how it can help you on your journey of personal growth.
            </Typography> */}
          </Box>

          {/* Right Side - FAQ Accordions (70%) */}
          <Box
            sx={{
              flex: { xs: "none", md: "0 0 65%" },
              width: { xs: "100%", md: "70%" },
            }}
          >
            {faqData.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expanded === faq.id}
                onChange={handleChange(faq.id)}
                sx={{
                  mb: 2,
                  borderRadius: "10px !important",
                  "&:before": {
                    display: "none",
                  },
                  "&.Mui-expanded": {
                    margin: "0 0 16px 0",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        color: "#E87A42",
                        fontSize: { xs: "1.5rem", md: "2rem" },
                      }}
                    />
                  }
                  sx={{
                    backgroundColor: "#E6E6E6",
                    borderRadius: "12px",
                    // border:"1px solid #3A3A3A33",
                    height: { xs: 48, md: 56 },
                    "&.Mui-expanded": {
                      minHeight: { xs: 64, md: 72 },
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                    "& .MuiAccordionSummary-content": {
                      margin: { xs: "12px 0", md: "16px 0" },
                      "&.Mui-expanded": {
                        margin: { xs: "12px 0", md: "16px 0" },
                      },
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontFamily: "source sans pro",
                      color: "#2B2B2B",
                      fontSize: { xs: "1rem", sm: "1.1rem", md: "20px" },
                      lineHeight: "100%",
                    }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    backgroundColor: "white",
                    borderBottomLeftRadius: "12px",
                    borderBottomRightRadius: "12px",
                    padding: { xs: 2, md: 3 },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#2B2B2B",
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "0.95rem", md: "1.1rem" },
                      lineHeight: 1.6,
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FAQ;
