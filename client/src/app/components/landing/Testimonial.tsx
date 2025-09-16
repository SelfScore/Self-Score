"use client";

import React from "react";
import { Box, Typography, Container, Card, CardContent } from "@mui/material";
import { FormatQuote } from "@mui/icons-material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Marketing Manager",
    company: "Tech Solutions Inc.",
    content:
      "This life assessment completely transformed my perspective on personal growth. The insights were incredibly accurate and helped me identify areas I never knew needed attention.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Entrepreneur",
    company: "StartUp Ventures",
    content:
      "The progressive level system is brilliant! It guided me step by step through my personal development journey. I've seen remarkable improvements in both my personal and professional life.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Life Coach",
    company: "Wellness Center",
    content:
      "As a professional coach, I'm impressed by the depth and accuracy of this assessment. I now recommend it to all my clients as a starting point for their transformation journey.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Project Manager",
    company: "Global Corp",
    content:
      "The personalized insights helped me understand my behavioral patterns better. The actionable recommendations were practical and easy to implement in my daily routine.",
    rating: 5,
  },
  {
    id: 5,
    name: "Lisa Wang",
    role: "HR Director",
    company: "Innovation Labs",
    content:
      "I've used many assessment tools, but this one stands out for its accuracy and practical application. It's now part of our employee development program.",
    rating: 5,
  },
  {
    id: 6,
    name: "James Miller",
    role: "Consultant",
    company: "Strategic Partners",
    content:
      "The level-based approach made it easy to track my progress. Each stage felt achievable and the content was perfectly tailored to my development needs.",
    rating: 5,
  },
];

export default function Testimonial() {
  const renderStars = (rating: number) => {
    return "★".repeat(rating);
  };

  // React Slick settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // Create an infinite loop effect by duplicating testimonials
  // const extendedTestimonials = [...testimonials, ...testimonials];

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#F9F8F6", // White Color
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 6 },
        "& .slick-dots": {
          bottom: "-50px",
          "& li button:before": {
            color: "#E87A42", // Primary Color
            fontSize: "12px",
          },
          "& li.slick-active button:before": {
            color: "#E87A42", // Primary Color
          },
        },
        "& .slick-prev, & .slick-next": {
          zIndex: 2,
          "&:before": {
            color: "#E87A42", // Primary Color
            fontSize: "24px",
          },
        },
        "& .slick-prev": {
          left: "-25px",
        },
        "& .slick-next": {
          right: "-25px",
        },
      }}
    >
      <Container maxWidth="xl">
        {/* Title Section */}
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
              color: "#005F73", // Accent Color
              mb: 3,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            What Our Users Say
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#2B2B2B", // Black Color
              maxWidth: "600px",
              mx: "auto",
              lineHeight: 1.6,
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
            }}
          >
            Discover how our life assessment has helped thousands of people
            transform their lives and achieve their personal goals.
          </Typography>
        </Box>

        {/* React Slick Carousel */}
        <Box sx={{ mx: { xs: 2, sm: 4 }, mb: 6 }}>
          <Slider {...settings}>
            {testimonials.map((testimonial) => (
              <Box key={testimonial.id} sx={{ px: 1.5 }}>
                <Card
                  sx={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "20px",
                    boxShadow: "0 8px 32px rgba(0, 95, 115, 0.1)",
                    border: "1px solid #E0E0E0", // Grey Color
                    height: "400px", // Fixed height for consistency
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 12px 40px rgba(0, 95, 115, 0.15)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 3, sm: 4 },
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Quote Icon */}
                    <FormatQuote
                      sx={{
                        fontSize: 30,
                        color: "#E87A42", // Primary Color
                        mb: 2,
                        opacity: 0.7,
                      }}
                    />

                    {/* Testimonial Content */}
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        lineHeight: 1.6,
                        color: "#2B2B2B", // Black Color
                        mb: 3,
                        fontStyle: "italic",
                        flex: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      "{testimonial.content}"
                    </Typography>

                    {/* Rating */}
                    <Typography
                      sx={{
                        fontSize: "1.2rem",
                        color: "#E87A42", // Primary Color
                        mb: 2,
                        textAlign: "center",
                      }}
                    >
                      {renderStars(testimonial.rating)}
                    </Typography>

                    {/* User Info */}
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: "#005F73", // Accent Color
                          mb: 0.5,
                          fontSize: { xs: "1rem", sm: "1.1rem" },
                        }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#2B2B2B", // Black Color
                          opacity: 0.8,
                          fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        }}
                      >
                        {testimonial.role} at {testimonial.company}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
        </Box>
      </Container>
    </Box>
  );
}
