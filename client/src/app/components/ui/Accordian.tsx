"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface AccordionProps {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
  onChange: (id: string) => void;
}

const CustomAccordion: React.FC<AccordionProps> = ({
  id,
  question,
  answer,
  expanded,
  onChange,
}) => {
  return (
    <Box
      sx={{
        mb: 2,
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #3A3A3A33",
      }}
    >
      {/* Accordion Header */}
      <Box
        onClick={() => onChange(id)}
        sx={{
          backgroundColor: "#F7F7F7",
          borderRadius: expanded ? "10px 10px 0 0" : "10px",
          height: { xs: 48, md: 56 },
          minHeight: { xs: 48, md: 56 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: { xs: "0 16px", md: "0 16px" },
          cursor: "pointer",
          transition: "all 0.3s ease",
        //   "&:hover": {
        //     backgroundColor: "#F0F0F0",
        //   },
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
          {question}
        </Typography>
        <ExpandMoreIcon
          sx={{
            color: "#E87A42",
            fontSize: { xs: "1.5rem", md: "2rem" },
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
            flexShrink: 0,
            ml: 2,
          }}
        />
      </Box>

      {/* Accordion Content */}
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: expanded ? "1fr" : "0fr",
          transition: "grid-template-rows 0.3s ease",
        }}
      >
        <Box
          sx={{
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              backgroundColor: "white",
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
              {answer}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomAccordion;
