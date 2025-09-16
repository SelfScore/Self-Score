"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Paper,
  InputAdornment,
} from "@mui/material";
import {
  Email as EmailIcon,
  Person as PersonIcon,
  // Subject as SubjectIcon,
  Message as MessageIcon,
  Send as SendIcon,
} from "@mui/icons-material";

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
        backgroundColor: "#F9F8F6", // White Color
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
              fontWeight: "bold",
              color: "#005F73", // Accent Color
              mb: 3,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
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
              lineHeight: 1.6,
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
          {/* Left Side - Text Content */}
          <Box sx={{ flex: 1, pr: { md: 2 } }}>
            <Typography
              variant="h4"
              component="h3"
              sx={{
                fontWeight: "bold",
                color: "#005F73", // Accent Color
                mb: 3,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
              }}
            >
              Get in Touch
            </Typography>

            <Typography
              variant="body1"
              paragraph
              sx={{
                fontSize: "1.1rem",
                lineHeight: 1.7,
                color: "#2B2B2B", // Black Color
                mb: 4,
              }}
            >
              We're committed to supporting you throughout your personal
              development journey. Whether you have questions about our
              assessment, need technical support, or want to learn more about
              our services, our team is ready to help.
            </Typography>

            {/* Contact Info */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#005F73", // Accent Color
                  mb: 2,
                }}
              >
                Why Contact Us?
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: "none" }}>
                <Typography component="li" sx={{ mb: 1, fontSize: "1rem",color: "#2B2B2B", }}>
                  • Assessment questions and guidance
                </Typography>
                <Typography component="li" sx={{ mb: 1, fontSize: "1rem",color: "#2B2B2B", }}>
                  • Technical support and troubleshooting
                </Typography>
                <Typography component="li" sx={{ mb: 1, fontSize: "1rem",color: "#2B2B2B", }}>
                  • Personalized coaching consultations
                </Typography>
                <Typography component="li" sx={{ mb: 1, fontSize: "1rem",color: "#2B2B2B", }}>
                  • Partnership and collaboration opportunities
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Side - Contact Form */}
          <Box sx={{ flex: 1 }}>
            <Paper
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: { xs: 3, sm: 4 },
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 95, 115, 0.1)",
                border: "1px solid #E0E0E0", // Grey Color
              }}
            >
              <Typography
                variant="h5"
                component="h4"
                sx={{
                  fontWeight: "bold",
                  color: "#005F73", // Accent Color
                  mb: 3,
                  textAlign: "center",
                }}
              >
                Send us a Message
              </Typography>

              {/* Name Field */}
              <TextField
                fullWidth
                name="name"
                label="Your Name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#E87A42" }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Email Field */}
              <TextField
                fullWidth
                name="email"
                label="Your Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#E87A42" }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Subject Field */}
              {/* <TextField
                fullWidth
                name="subject"
                label="Subject"
                value={formData.subject}
                onChange={handleChange}
                error={!!errors.subject}
                helperText={errors.subject}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SubjectIcon sx={{ color: "#E87A42" }} />
                    </InputAdornment>
                  ),
                }}
              /> */}

              {/* Message Field */}
              <TextField
                fullWidth
                name="message"
                label="Your Message"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleChange}
                error={!!errors.message}
                helperText={errors.message}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ alignSelf: "flex-start", mt: 1 }}
                    >
                      <MessageIcon sx={{ color: "#E87A42" }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Submit Button */}
              <Box sx={{ textAlign: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SendIcon />}
                  sx={{
                    backgroundColor: "#E87A42", // Primary Color
                    color: "#F9F8F6", // White Color
                    px: 4,
                    py: 1.5,
                    borderRadius: "50px",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#005F73", // Accent Color
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Send Message
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactUs;
