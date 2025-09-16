import { Box, Typography } from "@mui/material";

export default function OurMission() {
  return (
    <Box
      sx={{
        textAlign: "center",
        backgroundColor: "#F9F8F6",
        // mb: 6,
        width: "100%",
        // maxWidth: "800px",
        mx: "auto",
      }}
    >
      <hr
        style={{
          border: "none",
          borderTop: "0.5px solid #ccc",
          //   margin: "20px 0"
          maxWidth:"80%",
          margin:"auto"
        }}
      />
      <Typography
        variant="h2"
        component="h2"
        sx={{
          fontWeight: "bold",
          color: "#005F73",
          //   mb: 3,
          my:2,
          fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
        }}
      >
        ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय ।<br /> मृत्योर्मा अमृतं गमय । ॐ
        शान्तिः शान्तिः शान्तिः ॥
      </Typography>

      <hr
        style={{
          border: "none",
          borderTop: "0.5px solid #ccc",
          //   margin: "20px 0"
          maxWidth:"80%",
          margin:"auto"
        }}
      />
    </Box>
  );
}
