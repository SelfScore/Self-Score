import type { Metadata } from "next";
import NextLink from "next/link";
import { Box, Container, Typography } from "@mui/material";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

const linkStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 24px",
  borderRadius: 12,
  fontFamily: "Source Sans Pro, sans-serif",
  fontWeight: 600,
  fontSize: 16,
  textDecoration: "none",
};
const primary: React.CSSProperties = { ...linkStyle, background: "#FF5722", color: "#FFF" };
const secondary: React.CSSProperties = { ...linkStyle, border: "1px solid #D1D5DB", color: "#1F2937" };

export default function NotFound() {
  return (
    <Box sx={{ bgcolor: "#FFF", py: { xs: 14, md: 18 } }}>
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <Typography sx={{ fontFamily: "Faustina", fontWeight: 700, fontSize: "72px", color: "#FF4F00", lineHeight: 1 }}>
          404
        </Typography>
        <Typography
          component="h1"
          sx={{ fontFamily: "Faustina", fontWeight: 700, fontSize: { xs: "28px", md: "36px" }, color: "#000", mt: 2, mb: 1.5 }}
        >
          This page doesn&apos;t exist
        </Typography>
        <Typography sx={{ fontFamily: "Source Sans Pro", fontSize: "18px", color: "#6B7280", mb: 4 }}>
          The link may be old or mistyped. Here are some good places to go instead.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <NextLink href="/testInfo/" style={primary}>
            Take the free Self Score test
          </NextLink>
          <NextLink href="/blogs/" style={secondary}>
            Read the blog
          </NextLink>
          <NextLink href="/" style={secondary}>
            Home
          </NextLink>
        </Box>
      </Container>
    </Box>
  );
}
