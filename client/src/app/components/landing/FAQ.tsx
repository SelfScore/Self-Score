"use client";
import React, { useState } from "react";
import { Box, Typography, Container } from "@mui/material";
import FAQIcon from "../../../../public/images/LandingPage/FAQ.png";
import CustomAccordion from "../ui/Accordian";
import Image from "next/image";

const FAQ: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
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
        backgroundColor: "#FAFAFA",
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
              <Image
                src={FAQIcon.src}
                width={60}
                height={60}
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
          </Box>

          {/* Right Side - FAQ Accordions (70%) */}
          <Box
            sx={{
              flex: { xs: "none", md: "0 0 65%" },
              width: { xs: "100%", md: "70%" },
            }}
          >
            {faqData.map((faq) => (
              <CustomAccordion
                key={faq.id}
                id={faq.id}
                question={faq.question}
                answer={faq.answer}
                expanded={expanded === faq.id}
                onChange={handleChange}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FAQ;
