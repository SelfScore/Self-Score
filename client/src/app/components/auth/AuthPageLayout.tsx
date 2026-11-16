"use client";

import { Box, Typography } from "@mui/material";
import Image from "next/image";

interface AuthPageLayoutProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

/** Image on the left, form on the right — same layout as the original auth pages */
export default function AuthPageLayout({ title, subtitle, children }: AuthPageLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        bgcolor: "#FFFFFF",
        py: { xs: 2, sm: 3, md: 4 },
        mb: { xs: 0, md: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          alignItems: { xs: "center", md: "center" },
          gap: { xs: 3, md: 2 },
          marginTop: { xs: 8, md: 12 },
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: { xs: "none", md: "block" },
            width: { md: "46%", lg: "48%" },
            flexShrink: 0,
          }}
        >
          <Box sx={{ position: "relative", height: "min(680px, calc(100vh - 140px))", minHeight: "520px", width: "100%", maxWidth: "690px" }}>
            <Image
              src="/images/LandingPage/AuthImg.webp"
              alt="Authentication"
              fill
              style={{
                objectFit: "cover",
                borderTopRightRadius: "60px",
                borderBottomRightRadius: "60px",
              }}
              priority
            />
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            justifyContent: { xs: "center", md: "flex-start" },
            width: "100%",
            px: { xs: 2, sm: 3, md: 0 },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: "627px", display: "flex", flexDirection: "column" }}>
            <Box sx={{ textAlign: { xs: "center", md: "left" }, mb: 3 }}>
              <Typography
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: "#000",
                  mb: 0.75,
                  lineHeight: 1.15,
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "38px" },
                  fontFamily: "Faustina",
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  sx={{
                    color: "#6B7280",
                    fontSize: { xs: "15px", md: "17px" },
                    fontWeight: 400,
                    fontFamily: "Source Sans Pro",
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
