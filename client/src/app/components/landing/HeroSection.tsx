import { Box, Typography } from "@mui/material";
import HomePageBG from "../../../../public/images/LandingPage/HomePage.png";
import HomeSmile from "../../../../public/images/LandingPage/HomePageSmile.png";
import ButtonSelfScore from "../ui/ButtonSelfScore";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export default function HeroSection() {
  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      <Box
        sx={{
          position: "relative",
          border: "1px solid #3A3A3A66 ",
          borderBottomLeftRadius: { xs: "40px", md: "80px" },
          borderBottomRightRadius: { xs: "40px", md: "80px" },
          marginBottom: { xs: 4, md: 8 },
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: "100%", sm: "500px", md: "1001px" },
            maxHeight: { xs: "500px", sm: "450px", md: "566px" },
            margin: "0 auto",
            mt: { xs: 12, sm: 6, md: 16 },
            backgroundImage: `url(${HomePageBG.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            textAlign: "center",
            px: { xs: 2, sm: 3, md: 2 },
            py: { xs: 4, sm: 6, md: 14 },
            overflow: "hidden",
          }}
        >
          <Box>
            <Box
              component="img"
              src={HomeSmile.src}
              alt="Hero Image"
              sx={{
                maxWidth: { xs: "70px", sm: "100px", md: "156px" },
                width: "100%",
                height: "auto",
                objectFit: "contain",
                mb: 2,
                mt: { xs: 8, sm: 2, md: 5 },
                display: "block",
                mx: "auto",
              }}
            />
          </Box>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontFamily: "faustina",
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "40px" },
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#000",
              mb: { xs: 3, md: 4 },
              // mt: 8,
              //   textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            Your Soul's Journey <br />
            Starts Here.
          </Typography>

          <Typography
            // variant="h5"
            // component="p"
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: { xs: "1rem", sm: "1.1rem", md: "18px" },
              lineHeight: "125%",
              color: "#2B2B2B",
              mb: { xs: 4, md: 6 },
              maxWidth: { xs: "100%", sm: "80%", md: "598px" },
              mx: "auto",
              px: { xs: 1, md: 0 },
              //   opacity: 0.95,
            }}
          >
            You already know your credit score. But do you know your self-score,
            your life score, your happiness score?
          </Typography>

          <Box sx={{ display: "inline-block" }}>
            <ButtonSelfScore text="Discover Your Path →" />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: { xs: 1, md: 2 },
            }}
          >
            <VerifiedUserIcon
              sx={{
                color: "#005F73",
                mr: 1,
                fontSize: { xs: "20px", md: "24px" },
              }}
            />
            <Typography
              variant="body2"
              component="p"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem", md: "18px" },
                color: "#2B2B2B",
                opacity: 1,
                fontFamily: "Source Sans Pro",
              }}
            >
              We protect your privacy. Your answers stay secure.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
