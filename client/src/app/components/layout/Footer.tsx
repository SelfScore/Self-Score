import React from "react";
// import Image from "next/image";
import { Box, Typography, Link } from "@mui/material";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#005F73", // Black Color
        color: "#F9F8F6", // White Color
        pt: { xs: 6, md: 8 },
        pb: 2,
        px: { xs: 3, md: 6 },
      }}
    >
      <Box>
        <Typography
          sx={{
            fontFamily: "Faustina",
            fontWeight: 600,
            fontSize: { xs: "18px", sm: "20px", md: "20px" },
            lineHeight: "100%",
            letterSpacing: "0%",
            textAlign: "center",
            verticalAlign: "middle",
          }}
        >
          Get in touch with Us
        </Typography>
      </Box>

      {/* //contact info */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          mt: { xs: 3, md: 5 },
          gap: { xs: 3, md: 7 },
          mx: "auto",
          justifyContent: "center",
        }}
      >
        {/* mail */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", md: "auto" },
          }}
        >
          <Box
            sx={{
              height: { xs: "36px", md: "40px" },
              width: { xs: "36px", md: "40px" },
              mb: 1,
              border: "1px solid #EFEFEF",
              borderRadius: "8px",
              flexShrink: 0,
            }}
          >
            <EmailOutlinedIcon
              sx={{
                height: "100%",
                width: "100%",
                padding: "8px",
                color: "#EFEFEF",
              }}
            />
          </Box>
          <Box sx={{ ml: 2, mb: 1 }}>
            <Link
              href="mailto:info@selfscore.net"
              color="inherit"
              sx={{
                fontFamily: "Source Sans Pro",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: { xs: "16px", sm: "18px", md: "20px" },
                lineHeight: "132%",
                letterSpacing: "0%",
                verticalAlign: "middle",
                textDecoration: "none",
                color: "#F7F7F7",
              }}
            >
              info@selfscore.net
            </Link>
          </Box>
        </Box>
        {/* phone  */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", md: "auto" },
          }}
        >
          <Box
            sx={{
              height: { xs: "36px", md: "40px" },
              width: { xs: "36px", md: "40px" },
              mb: 1,
              border: "1px solid #EFEFEF",
              borderRadius: "8px",
              flexShrink: 0,
            }}
          >
            <LocalPhoneOutlinedIcon
              sx={{
                height: "100%",
                width: "100%",
                padding: "8px",
                color: "#EFEFEF",
              }}
            />
          </Box>
          <Box sx={{ ml: 2, mb: 1 }}>
            <Link
              href="tel:+15614300610"
              color="inherit"
              sx={{
                fontFamily: "Source Sans Pro",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: { xs: "16px", sm: "18px", md: "20px" },
                lineHeight: "132%",
                letterSpacing: "0%",
                verticalAlign: "middle",
                textDecoration: "none",
                color: "#F7F7F7",
              }}
            >
              +1 (561) 430-0610
            </Link>
          </Box>
        </Box>
        {/* address */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", md: "auto" },
          }}
        >
          <Box
            sx={{
              height: { xs: "36px", md: "40px" },
              width: { xs: "36px", md: "40px" },
              mb: 1,
              border: "1px solid #EFEFEF",
              borderRadius: "8px",
              flexShrink: 0,
            }}
          >
            <LocationOnOutlinedIcon
              sx={{
                height: "100%",
                width: "100%",
                padding: "8px",
                color: "#EFEFEF",
              }}
            />
          </Box>
          <Box sx={{ ml: 2, mb: 1 }}>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: { xs: "16px", sm: "18px", md: "20px" },
                lineHeight: "132%",
                letterSpacing: "0%",
                verticalAlign: "middle",
                color: "#F7F7F7",
              }}
            >
              Charlottesville, Virginia, United States
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* follow us  */}

      <Box
        sx={{
          display: "flex",
          maxWidth: { xs: "100%", md: "333px" },
          mx: "auto",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          mt: { xs: 3, md: 5 },
          mb: 2,
          gap: 1,
          py: { xs: 3, md: 4 },
          borderTop: "1px solid #B8B8B8",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: { xs: "16px", sm: "18px", md: "20px" },
            lineHeight: "132%",
            letterSpacing: "0%",
            verticalAlign: "middle",
            color: "#F7F7F7",
          }}
        >
          Follow us on:
        </Typography>

        <Link
          href="https://www.instagram.com/YourProfile"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          sx={{ color: "#F7F7F7" }}
        >
          <Box
            sx={{
              height: { xs: "36px", md: "40px" },
              width: { xs: "36px", md: "40px" },
              mb: 1,
              border: "1px solid #EFEFEF",
              borderRadius: "8px",
              flexShrink: 0,
            }}
          >
            <InstagramIcon
              sx={{
                height: "100%",
                width: "100%",
                padding: "8px",
                color: "#EFEFEF",
              }}
            />
          </Box>
        </Link>
        <Link
          href="https://www.linkedin.com/YourProfile"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          sx={{ color: "#F7F7F7" }}
        >
          <Box
            sx={{
              height: { xs: "36px", md: "40px" },
              width: { xs: "36px", md: "40px" },
              mb: 1,
              border: "1px solid #EFEFEF",
              borderRadius: "8px",
              flexShrink: 0,
            }}
          >
            <LinkedInIcon
              sx={{
                height: "100%",
                width: "100%",
                padding: "8px",
                color: "#EFEFEF",
              }}
            />
          </Box>
        </Link>
      </Box>

      {/* self score text  */}

      <Box sx={{ textAlign: "center", mt: 2, overflow: "hidden" }}>
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: { xs: "60px", sm: "100px", md: "160px", lg: "240px" },
            lineHeight: "132%",
            letterSpacing: "-8%",
            textAlign: "center",
            verticalAlign: "middle",
            background: "linear-gradient(0deg, #005F73 14.51%, #D2D2D2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          SELFSCORE
        </Typography>
      </Box>

      {/* footer bottom text */}
      <Box
        sx={{
          textAlign: { xs: "center", md: "left" },
          mt: 2,
          borderTop: "1px solid #B8B8B8",
          pt: 2,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: { xs: "center", md: "space-between" },
          gap: { xs: 2, md: 0 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontWeight: 500,
              fontSize: { xs: "14px", sm: "16px", md: "18px" },
              lineHeight: "100%",
              letterSpacing: "0%",
              verticalAlign: "middle",
              color: "#F7F7F7",
            }}
          >
            &copy; {new Date().getFullYear()} SelfScore. All rights reserved.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 3 },
            alignItems: "center",
          }}
        >
          <Link
            href="/privacy-policy"
            sx={{
              fontFamily: "Source Sans Pro",
              fontWeight: 500,
              fontSize: { xs: "14px", sm: "16px", md: "18px" },
              lineHeight: "100%",
              letterSpacing: "0%",
              verticalAlign: "middle",
              color: "#F7F7F7",
              textDecoration: "underline",
            }}
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms-conditions"
            sx={{
              fontFamily: "Source Sans Pro",
              fontWeight: 500,
              fontSize: { xs: "14px", sm: "16px", md: "18px" },
              lineHeight: "100%",
              letterSpacing: "0%",
              verticalAlign: "middle",
              color: "#F7F7F7",
              textDecoration: "underline",
            }}
          >
            Terms of Service
          </Link>
          <Link
            href="/refund-policy"
            sx={{
              fontFamily: "Source Sans Pro",
              fontWeight: 500,
              fontSize: { xs: "14px", sm: "16px", md: "18px" },
              lineHeight: "100%",
              letterSpacing: "0%",
              verticalAlign: "middle",
              color: "#F7F7F7",
              textDecoration: "underline",
            }}
          >
            Refund Policy
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
