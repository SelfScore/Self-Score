import { Box, Typography, Button, Container } from "@mui/material";

export default function HeroSection() {
  return (
    <Box
      component="section"
      sx={{
        background: "#F9F8F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          textAlign: "center",
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            maxWidth: "800px",
            margin: "0 auto",
            mt: { xs: 8, sm: 10, md: 12 },
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#005F73",
              mb: 4,
            //   textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            Transform Your Life with <br />
            Personalized Life Scoring
          </Typography>

          <Typography
            variant="h5"
            component="p"
            sx={{
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
              lineHeight: 1.6,
              color: "#2B2B2B",
              mb: 6,
            //   opacity: 0.95,
            }}
          >
            Discover your potential and track your progress across all life
            dimensions. <br />
            Get insights from certified consultants and build the life you've
            always wanted. <br />
            Start your transformation journey today.
          </Typography>

          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "#E87A42",
              color: "#F9F8F6",
              padding: { xs: "0.8rem 2rem", md: "1rem 2.5rem" },
              fontSize: { xs: "1rem", md: "1.2rem" },
              fontWeight: 600,
              borderRadius: "50px",
              mb: 10,
              textTransform: "uppercase",
              letterSpacing: "1px",
              boxShadow: "0 8px 20px rgba(232, 122, 66, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#d66a35",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 25px rgba(232, 122, 66, 0.4)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
          >
            Take the Test
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
