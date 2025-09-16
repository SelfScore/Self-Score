"use client";

import React from "react";
import Image from "next/image";
import {
  Box,
  Typography,
  Container,
  Link,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#2B2B2B", // Black Color
        color: "#F9F8F6", // White Color
        pt: { xs: 6, md: 8 },
        pb: 2,
        px: { xs: 3, md: 6 },
      }}
    >
      
      <Container maxWidth="xl">
        {/* Main Footer Content */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: { xs: 4, md: 6 },
            mb: 4,
          }}
        >
          {/* Company Info Section */}
          <Box>
            <Box sx={{ mb: 3 }}>
              {/* Logo */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: 60,
                  }}
                >
                  <Image
                    src="/images/logos/LogoWithText.png"
                    alt="Life Score Logo"
                    height={60}
                    width={120}
                    style={{
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Typography
              variant="body2"
              sx={{
                mb: 3,
                lineHeight: 1.6,
                color: "#E0E0E0", // Grey Color
              }}
            >
              Transform your life through comprehensive assessment and
              personalized guidance. Discover your potential and unlock your
              path to personal growth.
            </Typography>

            {/* Social Media Icons */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  color: "#F9F8F6", // White Color
                }}
              >
                Follow Us
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  href="#"
                  sx={{
                    color: "#E0E0E0", // Grey Color
                    "&:hover": {
                      color: "#E87A42", // Primary Color
                      backgroundColor: "rgba(232, 122, 66, 0.1)",
                    },
                  }}
                >
                  <Facebook />
                </IconButton>
                <IconButton
                  href="#"
                  sx={{
                    color: "#E0E0E0", // Grey Color
                    "&:hover": {
                      color: "#E87A42", // Primary Color
                      backgroundColor: "rgba(232, 122, 66, 0.1)",
                    },
                  }}
                >
                  <Twitter />
                </IconButton>
                <IconButton
                  href="#"
                  sx={{
                    color: "#E0E0E0", // Grey Color
                    "&:hover": {
                      color: "#E87A42", // Primary Color
                      backgroundColor: "rgba(232, 122, 66, 0.1)",
                    },
                  }}
                >
                  <LinkedIn />
                </IconButton>
                <IconButton
                  href="#"
                  sx={{
                    color: "#E0E0E0", // Grey Color
                    "&:hover": {
                      color: "#E87A42", // Primary Color
                      backgroundColor: "rgba(232, 122, 66, 0.1)",
                    },
                  }}
                >
                  <Instagram />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 3,
                color: "#E87A42", // Primary Color
              }}
            >
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {[
                "Home",
                "About Us",
                "Take Assessment",
                "Levels",
                "Contact",
                "Privacy Policy",
                "Terms of Service",
              ].map((item) => (
                <Box key={item} component="li" sx={{ mb: 1 }}>
                  <Link
                    href="#"
                    sx={{
                      color: "#E0E0E0", // Grey Color
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      "&:hover": {
                        color: "#E87A42", // Primary Color
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {item}
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Services */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 3,
                color: "#E87A42", // Primary Color
              }}
            >
              Our Services
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {[
                "Life Assessment",
                "Personal Coaching",
                "Level Progression",
                "Progress Tracking",
                "Custom Reports",
                "Group Sessions",
                "Corporate Training",
              ].map((item) => (
                <Box key={item} component="li" sx={{ mb: 1 }}>
                  <Link
                    href="#"
                    sx={{
                      color: "#E0E0E0", // Grey Color
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      "&:hover": {
                        color: "#E87A42", // Primary Color
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {item}
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Contact Info */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 3,
                color: "#E87A42", // Primary Color
              }}
            >
              Contact Info
            </Typography>
            <Box>
              {/* Email */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Email
                  sx={{
                    color: "#E87A42", // Primary Color
                    mr: 1,
                    fontSize: "1.2rem",
                  }}
                />
                <Link
                  href="mailto:info@lifescore.com"
                  sx={{
                    color: "#E0E0E0", // Grey Color
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    "&:hover": {
                      color: "#E87A42", // Primary Color
                    },
                  }}
                >
                  info@lifescore.com
                </Link>
              </Box>

              {/* Phone */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Phone
                  sx={{
                    color: "#E87A42", // Primary Color
                    mr: 1,
                    fontSize: "1.2rem",
                  }}
                />
                <Link
                  href="tel:+1234567890"
                  sx={{
                    color: "#E0E0E0", // Grey Color
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    "&:hover": {
                      color: "#E87A42", // Primary Color
                    },
                  }}
                >
                  +1 (234) 567-8900
                </Link>
              </Box>

              {/* Address */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <LocationOn
                  sx={{
                    color: "#E87A42", // Primary Color
                    mr: 1,
                    fontSize: "1.2rem",
                    mt: 0.2,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#E0E0E0", // Grey Color
                    fontSize: "0.9rem",
                    lineHeight: 1.4,
                  }}
                >
                  123 Personal Growth Ave
                  <br />
                  Suite 456
                  <br />
                  Development City, DC 12345
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Divider */}
        <Divider
          sx={{
            backgroundColor: "#E0E0E0", // Grey Color
            opacity: 0.3,
            mb: 3,
          }}
        />

        {/* Bottom Footer */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#E0E0E0", // Grey Color
              textAlign: { xs: "center", md: "left" },
            }}
          >
            © 2025 LifeScore. All rights reserved.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link
              href="#"
              sx={{
                color: "#E0E0E0", // Grey Color
                textDecoration: "none",
                fontSize: "0.9rem",
                "&:hover": {
                  color: "#E87A42", // Primary Color
                },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              sx={{
                color: "#E0E0E0", // Grey Color
                textDecoration: "none",
                fontSize: "0.9rem",
                "&:hover": {
                  color: "#E87A42", // Primary Color
                },
              }}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              sx={{
                color: "#E0E0E0", // Grey Color
                textDecoration: "none",
                fontSize: "0.9rem",
                "&:hover": {
                  color: "#E87A42", // Primary Color
                },
              }}
            >
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
