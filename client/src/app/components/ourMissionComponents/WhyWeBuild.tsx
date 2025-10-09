import { Box, Typography } from "@mui/material";
import MissionCard from "../ui/MissionCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BalanceIcon from "@mui/icons-material/Balance";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

export default function WhyWeBuild() {
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
          maxWidth: "900px",
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
            fontSize: { xs: "2rem", sm: "2.5rem", md: "28px" },
          }}
        >
          Why We Build Self Score
        </Typography>
        <Typography
          sx={{
            color: "#2B2B2B",
            fontFamily: "source sans pro",
            lineHeight: 1.2,
            fontSize: { xs: "1rem", sm: "1.1rem", md: "18px" },
          }}
        >
          Happiness isn't linear, and understanding it requires honest
          self-reflection. Our 4-level approach starts with a <br /> free Level
          1 assessment, then unlocks deeper insights through premium Levels 2-4,
          giving you the tools to <br /> understand and nurture your emotional
          well-being at your own pace.
        </Typography>
      </Box>

      {/* mission cards */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 3, md: 4 },
          justifyContent: "center",
          alignItems: { xs: "center", md: "stretch" },
          mt: 6,
          flexWrap: "wrap",
        }}
      >
        <MissionCard
          icon={<RemoveRedEyeIcon sx={{ fontSize: 32, color: "white" }} />}
          title="Clarity"
          points={[
            "Measure where you stand with honest",
            "self-assessment tools that provide",
            "clear insights into your current",
            "happiness levels.",
          ]}
        />

        <MissionCard
          icon={<TrendingUpIcon sx={{ fontSize: 32, color: "white" }} />}
          title="Growth"
          points={[
            "Track your happiness journey over time",
            "with progress monitoring and",
            "personalized insights for continuous",
            "improvement.",
          ]}
        />

        <MissionCard
          icon={<BalanceIcon sx={{ fontSize: 32, color: "white" }} />}
          title="Balance"
          points={[
            "Nurture your emotional well-being with",
            "balanced approaches that respect your",
            "unique journey and pace.",
          ]}
        />
      </Box>
    </Box>
  );
}
