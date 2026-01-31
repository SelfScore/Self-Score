"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Container } from "@mui/material";
import dynamic from "next/dynamic";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

// Dynamic import with SSR disabled to fix hydration mismatch on mobile
const Slider = dynamic(() => import("react-slick"), { ssr: false });

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

// Helper function to get slides count based on window width
const getSlidesToShow = (width: number): number => {
  if (width < 600) return 1;
  if (width < 1024) return 2;
  return 3;
};

export default function Testimonial() {
  // Track if component is mounted and current slides count
  const [slidesToShow, setSlidesToShow] = useState<number | null>(null);

  useEffect(() => {
    // Set initial slides count based on window width
    const handleResize = () => {
      setSlidesToShow(getSlidesToShow(window.innerWidth));
    };

    // Initial call
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // React Slick settings
  // Custom Next Arrow
  function NextArrow(props: any) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClick}
      >
        <NavigateNextIcon sx={{ color: "#FF4F00", fontSize: "2rem" }} />
      </div>
    );
  }

  // Custom Prev Arrow
  function PrevArrow(props: any) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClick}
      >
        <NavigateNextIcon
          sx={{
            color: "#FF4F00",
            fontSize: "2rem",
            transform: "rotate(180deg)",
          }}
        />
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShow || 1, // Use detected value, default to 1
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
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

  // Don't render slider until we know the screen size
  if (slidesToShow === null) {
    return null;
  }

  // Create an infinite loop effect by duplicating testimonials
  // const extendedTestimonials = [...testimonials, ...testimonials];

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#fff", // White Color
        py: { xs: 6, md: 0 },
        mb: { xs: 0, md: 10 },
        px: { xs: 2, sm: 4, md: 6 },
        "& .slick-dots": {
          bottom: "-50px",
          "& li button:before": {
            color: "#FF4F00", // Primary Color
            fontSize: "12px",
          },
          "& li.slick-active button:before": {
            color: "#FF4F00", // Primary Color
          },
        },
        "& .slick-prev, & .slick-next": {
          zIndex: 2,
          width: "40px",
          height: "40px",
          display: "flex !important",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          borderRadius: "50%",
          border: "2px solid #FF4F00",
          // boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          "&:before": {
            display: "none",
          },
          "& svg": {
            color: "#FF4F00",
            fontSize: "2rem",
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
            mt: { xs: 0, md: 8 }
          }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: "700",
              color: "#000", // Accent Color
              mb: 3,
              fontFamily: "faustina",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "28px" },
            }}
          >
            What Our Users Say
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#2B2B2B", // Black Color
              maxWidth: "500px",
              mx: "auto",
              fontFamily: "Source Sans Pro",
              lineHeight: 1.6,
              fontSize: { xs: "1rem", sm: "1.1rem", md: "18px" },
            }}
          >
            Discover how our life assessment has helped thousands of people
            transform their lives and achieve their personal goals.
          </Typography>
        </Box>

        {/* React Slick Carousel */}
        <Box sx={{ mx: "auto", mb: 6, maxWidth: { xs: "95%", md: "75%" } }}>
          <Slider
            {...settings}
          // sx={{
          //   display: "flex",
          //   justifyContent: "center",
          //   alignItems: "center",
          // }}
          >
            {testimonials.map((testimonial) => (
              <Box
                key={testimonial.id}
                sx={{
                  px: 0.1, // Further reduced gap between cards
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 260, sm: 276 },
                    height: { xs: 260, sm: 279 },
                    opacity: 1,
                    borderRadius: "20px",
                    backgroundColor: "#EFEFEF",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    p: { xs: 2.5, sm: 3 },
                    boxSizing: "border-box",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      // transform: "translateY(-5px)",
                      // boxShadow: "0 12px 40px rgba(0, 95, 115, 0.15)",
                      border: "1px solid #3A3A3A4D"
                    },
                    mx: "auto", // Center the card
                  }}
                >
                  {/* Icon on top left */}
                  <Typography
                    sx={{
                      color: "#FF4F00",
                      fontSize: "64px",
                      fontFamily: "faustina",
                      fontWeight: 700,
                      mt: -4,
                      mb: -2,
                      ml: -2,
                    }}
                  >
                    ‘
                  </Typography>

                  {/* Testimonial Content */}
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: "0.9rem", sm: "16px" },
                      fontFamily: "Source Sans Pro",
                      lineHeight: 1.2,
                      color: "#2B2B2B",
                      fontStyle: "regular",
                      flex: 1,
                      mb: 2,
                      mt: -4,
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    "{testimonial.content}"
                  </Typography>

                  {/* User Info at the bottom */}
                  <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                    {/* Placeholder for user image */}
                    <Box
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        borderRadius: "50%",
                        backgroundColor: "#FF4F00",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        mr: 1,
                        flexShrink: 0,
                      }}
                    >
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "500",
                          fontFamily: "faustina",
                          color: "#000",
                          fontSize: { xs: "0.9rem", sm: "16px" },
                          lineHeight: 1,
                        }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#2B2B2B",
                          fontFamily: "Source Sans Pro",
                          opacity: 0.8,
                          fontSize: { xs: "0.75rem", sm: "12px" },
                        }}
                      >
                        {testimonial.role} at {testimonial.company}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Slider>
        </Box>
      </Container>
    </Box>
  );
}
