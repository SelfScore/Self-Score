import { Box, Typography } from "@mui/material";

export default function OurMission() {
  return (
    <Box
      sx={{
        textAlign: "center",
        background: "linear-gradient(360deg, #F3D1BD -88.02%, #F7EFE8 204.19%)",
        width: "100%",
        mx: "auto",
        border: "4px solid #E6B79C99",
        borderLeft: "none",
        borderRight: "none",
        py: { xs: 1.5, md: 2.2 },
        px: { xs: 2, md: 0 },
      }}
    >
      <Typography
        variant="h2"
        component="h2"
        sx={{
          fontWeight: "700",
          color: "#1A1A1A",
          my: { xs: 1.5, md: 2 },
          lineHeight: "100%",
          fontSize: { xs: "1.2rem", sm: "1.8rem", md: "40px" },
          wordBreak: "break-word",
          hyphens: "auto",
        }}
      >
        ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय ।<br /> मृत्योर्मा अमृतं गमय । ॐ
        शान्तिः शान्तिः शान्तिः ॥
      </Typography>
    </Box>
  );
}
