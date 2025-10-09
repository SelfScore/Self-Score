"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Link,
  // Paper,
  // InputAdornment,
} from "@mui/material";
// import {
//   Email as EmailIcon,
//   Person as PersonIcon,
//   // Subject as SubjectIcon,
//   Message as MessageIcon,
//   Send as SendIcon,
// } from "@mui/icons-material";
import ButtonSelfScore from "../ui/ButtonSelfScore";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      // Handle form submission here
      alert("Thank you for your message! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#fff", // White Color
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
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
              fontWeight: "700",
              fontFamily: "faustina",
              color: "#000", // Accent Color
              mb: 3,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "28px" },
            }}
          >
            Contact Us
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#2B2B2B", // Black Color
              maxWidth: "600px",
              mx: "auto",
              fontFamily: "source sans pro",
              lineHeight: 1.2,
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
            }}
          >
            Have questions about our assessment or need support? We're here to
            help you on your personal development journey.
          </Typography>
        </Box>

        {/* Content Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 6 },
            alignItems: "flex-start",
          }}
        >
          {/* Right Side - Contact Form */}
          <Box sx={{ flex: 1, maxWidth: "670px", mx: "auto" }}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: { xs: 3, sm: 4 },
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #3A3A3A4D",
              }}
            >
              {/* Full Name Field */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  component="label"
                  sx={{
                    display: "block",
                    fontFamily: "Source Sans Pro",
                    mb: 1,
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#2C3E50",
                  }}
                >
                  Full Name<span style={{ color: "#FF5722" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  name="name"
                  placeholder="Amit Sunda"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#FFFFFF",
                      borderRadius: "8px",
                      "& fieldset": {
                        borderColor: "#3A3A3A4D",
                        borderWidth: "1px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#3A3A3A4D",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#FF5722",
                      },
                    },
                  }}
                />
              </Box>

              {/* Email Address Field */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  component="label"
                  sx={{
                    display: "block",
                    mb: 1,
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#000",
                  }}
                >
                  Email Address<span style={{ color: "#FF5722" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#FFFFFF",
                      borderRadius: "8px",
                      "& fieldset": {
                        borderColor: "#3A3A3A4D",
                        borderWidth: "1px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#3A3A3A4D",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#FF5722",
                      },
                    },
                  }}
                />
              </Box>

              {/* Message Field */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  component="label"
                  sx={{
                    display: "block",
                    mb: 1,
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#000",
                  }}
                >
                  Your Message<span style={{ color: "#FF5722" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  name="message"
                  placeholder="Tell us more about how we can help..."
                  multiline
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  error={!!errors.message}
                  helperText={errors.message}
                  inputProps={{ maxLength: 1000 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#FFFFFF",
                      borderRadius: "8px",
                      alignItems: "flex-start",
                      "& fieldset": {
                        borderColor: "#3A3A3A4D",
                        borderWidth: "1px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#3A3A3A4D",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#FF5722",
                      },
                    },
                  }}
                />
                <Typography
                  sx={{
                    textAlign: "right",
                    fontSize: "14px",
                    color: "#999",
                    mt: 0.5,
                  }}
                >
                  {formData.message.length}/1000
                </Typography>
              </Box>

              {/* Submit Button */}
              <ButtonSelfScore fullWidth text="Send Message" type="submit"></ButtonSelfScore>

              {/* Privacy Policy Text */}
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: "14px",
                  color: "#6B7280",
                  mt: 2,
                }}
              >
                By submitting, you agree to our{" "}
                <Link
                  href="/privacy"
                  sx={{
                    color: "#FF5722",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Privacy Policy
                </Link>
                . We typically respond within 24 hours.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactUs;
