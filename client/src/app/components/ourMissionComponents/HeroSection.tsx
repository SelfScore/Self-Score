import { Box, Button, Typography } from "@mui/material";
import ButtonSelfScore from "../ui/ButtonSelfScore";
import YogoPersonIMG from "../../../../public/images/ourMission/YogaPerson.webp";
import Image from "next/image";

export default function HeroSection() {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#FFF",
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          maxWidth: "800px",
          mx: "auto",
          mt: { xs: 0, md: 4 },
        }}
      >
        <Typography
          sx={{
            fontWeight: "700",
            fontFamily: "faustina",
            color: "#000",
            mb: 3,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "40px" },
          }}
        >
          Our Mission
        </Typography>
        <Typography
          sx={{
            color: "#2B2B2B",
            fontFamily: "source sans pro",
            lineHeight: 1.6,
            fontSize: { xs: "1rem", sm: "1.1rem", md: "18px" },
          }}
        >
          We are on a mission to help you measure & nurture your happiness
        </Typography>
        <Typography
          sx={{
            color: "#6B7280",
            fontFamily: "source sans pro",
            lineHeight: "120%",
            maxWidth: "700px",
            mx: "auto",
            textAlign: "center",
            fontSize: { xs: "1rem", sm: "1.1rem", md: "18px" },
            mt: 2,
          }}
        >
          Self Score is built to empower individuals with clarity about their
          emotional well-being, helping them track progress and unlock insights
          for a more fulfilling life.
        </Typography>
      </Box>

      {/* buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <ButtonSelfScore text="Take the Happiness Test →" />
          <Button
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: "12px",
              border: "1px solid #FF4F00",
              color: "#FF4F00",
              fontWeight: 400,
              textTransform: "none",
              fontSize: { xs: "1rem", md: "20px" },
            }}
          >
            Learn More
          </Button>
        </Box>
      </Box>

      {/* yoga person  */}
        <Box
            sx={{
            width: "100%",
            height: { xs: "200px", md: "300px" },
            mt: { xs: 4, md: 6 },
            position: "relative",
            
            overflow: "hidden",
            // p: 0 !important,
            }}
        >
            <Image
            src={YogoPersonIMG}
            alt="Yoga Person"
            fill
            style={{ objectFit: "cover" }}
            />
        </Box>

    </Box>
  );
}
