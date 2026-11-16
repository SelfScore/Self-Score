"use client";
import React, { useState } from "react";
import { Box, Typography, Container } from "@mui/material";
import FAQIcon from "../../../../public/images/LandingPage/FAQ.png";
import CustomAccordion from "../ui/Accordian";
import Image from "next/image";
import { faqData } from "../../data/faqData";

const FAQ: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>("panel1");

  const handleChange = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
  };


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
