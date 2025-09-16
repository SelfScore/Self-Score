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

const FAQ: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const faqData = [
    {
      id: "panel1",
      question: "What is a personality assessment and how does it work?",
      answer:
        "Our personality assessment is a comprehensive evaluation tool that analyzes the Big Five personality traits: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. Through a series of carefully designed questions, we measure your tendencies and preferences to provide personalized insights into your behavior patterns and potential for growth.",
    },
    {
      id: "panel2",
      question: "How long does the assessment take to complete?",
      answer:
        "The complete assessment typically takes 15-20 minutes to finish. We recommend taking it when you have uninterrupted time to ensure the most accurate results. The assessment is designed to be thorough yet efficient, providing comprehensive insights without being overwhelming.",
    },
    {
      id: "panel3",
      question: "Are my results private and secure?",
      answer:
        "Absolutely. We take your privacy very seriously. All assessment data is encrypted and stored securely. Your results are completely confidential and will never be shared with third parties without your explicit consent. You have full control over your data and can access, modify, or delete it at any time.",
    },
    {
      id: "panel4",
      question: "Can I retake the assessment if my results change over time?",
      answer:
        "Yes, you can retake the assessment whenever you feel your personality or circumstances have significantly changed. We actually recommend periodic reassessment as personal growth and life experiences can influence your personality traits. There's no limit to how many times you can take the assessment.",
    },
    {
      id: "panel5",
      question: "What makes your assessment different from others?",
      answer:
        "Our assessment combines scientific rigor with practical application. We use validated psychological research while focusing on actionable insights for personal development. Our four-level progressive system provides not just results, but a clear path for growth and improvement tailored to your unique personality profile.",
    },
    {
      id: "panel6",
      question: "How do I interpret my results?",
      answer:
        "Each assessment comes with a detailed report explaining your scores across all five personality dimensions. We provide clear explanations of what each trait means, how it manifests in daily life, and specific recommendations for personal development. Our reports are designed to be easily understood without requiring psychological expertise.",
    },
  ];

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
            Frequently Asked Questions
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
            Find answers to common questions about our personality assessment
            and how it can help you on your journey of personal growth.
          </Typography>
        </Box>

        {/* FAQ Accordions */}
        <Box sx={{ maxWidth: "900px", mx: "auto" }}>
          {faqData.map((faq) => (
            <Accordion
              key={faq.id}
              expanded={expanded === faq.id}
              onChange={handleChange(faq.id)}
              sx={{
                mb: 2,
                borderRadius: "12px !important",
                boxShadow: "0 2px 8px rgba(0, 95, 115, 0.08)",
                "&:before": {
                  display: "none",
                },
                "&.Mui-expanded": {
                  margin: "0 0 16px 0",
                  boxShadow: "0 4px 16px rgba(0, 95, 115, 0.12)",
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
                  backgroundColor: "white",
                  borderRadius: "12px",
                  minHeight: { xs: 64, md: 72 },
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
                    color: "#005F73",
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                    lineHeight: 1.4,
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
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "#2B2B2B",
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
      </Container>
    </Box>
  );
};

export default FAQ;