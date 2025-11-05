"use client";
import { Box, Typography } from "@mui/material";
import ButtonSelfScore from "../ui/ButtonSelfScore";
import YogoPersonIMG from "../../../../public/images/ourMission/YogaPerson.webp";
import Image from "next/image";
import OutLineButton from "../ui/OutLineButton";
// import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HeroSection() {
  // const router = useRouter();

  const handleLearnMore = () => {
    const whyWeBuildSection = document.getElementById("why-we-build");
    if (whyWeBuildSection) {
      whyWeBuildSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
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
          <Link href="/testInfo">
            <ButtonSelfScore
              // onClick={() => {
              //   router.push(`/testInfo?`);
              // }}
              text="Take the Happiness Test →"
            />
          </Link>
          <OutLineButton
            onClick={handleLearnMore}
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: "12px",
              padding: { xs: "6.75px 14px", md: "1px 20px" },
              border: "1px solid #FF4F00",
              color: "#FF4F00",
              fontWeight: 400,
              textTransform: "none",
              fontSize: { xs: "1rem", md: "20px" },
            }}
          >
            Learn More
          </OutLineButton>
        </Box>
      </Box>

      {/* yoga person  */}
      <Box
        sx={{
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          ml: "-50vw",
          mr: "-50vw",
          height: { xs: "200px", md: "589px" },
          mt: { xs: 4, md: 6 },
          overflow: "hidden",
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
