"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function AboutLevels() {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  // Define the highest unlocked level (0-based index)
  // For example: 0 = only Level 1, 1 = Level 1 & 2, 2 = Level 1, 2 & 3, etc.
  const highestUnlockedLevel = 1; // Level 2 is unlocked, so Level 1 & 2 are available

  // Generate unlocked levels array based on highest unlocked level
  const unlockedLevels = Array.from(
    { length: highestUnlockedLevel + 1 },
    (_, i) => i
  );

  const levels = [
    {
      id: 1,
      title: "Level 1",
      name: "Awareness",
    },
    {
      id: 2,
      title: "Level 2",
      name: "Exploration",
    },
    {
      id: 3,
      title: "Level 3",
      name: "Action",
    },
    {
      id: 4,
      title: "Level 4",
      name: "Mastery",
    },
  ];

  const handleLevelClick = (index: number) => {
    if (isLevelUnlocked(index)) {
      setActiveTab(index);
    }
  };

  const isLevelUnlocked = (index: number) => index <= highestUnlockedLevel;

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#F9F8F6",
        p: 4,
      }}
    >
      {/* Title and Subtitle Section */}
      <Box
        sx={{
          textAlign: "center",
          mb: 6,
          maxWidth: "800px",
          mx: "auto",
        }}
      >
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontWeight: "bold",
            color: "#005F73",
            mb: 3,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          About the Levels
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "#2B2B2B",
            maxWidth: "600px",
            mx: "auto",
            lineHeight: 1.6,
            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
          }}
        >
          Our life scoring system is divided into four progressive levels, each
          representing a different stage of personal growth and development.
          Take the assessment to unlock your journey.
        </Typography>
      </Box>

      {/* Main Container Box */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "80%",
          backgroundColor: "#E0E0E0",
          borderRadius: "50px",
          p: 2,
          mx: "auto", // Center horizontally
        }}
      >
        {/* Level Boxes Container */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {levels.map((level, index) => (
            <Box
              key={level.id}
              onClick={() => handleLevelClick(index)}
              sx={{
                backgroundColor:
                  activeTab === index ? "#E87A42" : "transparent",
                color: activeTab === index ? "#F9F8F6" : "#2B2B2B",
                borderRadius: "50px",
                p: 1,
                textAlign: "center",
                cursor: isLevelUnlocked(index) ? "pointer" : "not-allowed",
                opacity: isLevelUnlocked(index) ? 1 : 0.4,
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1,
                minHeight: "40px",
                justifyContent: "center",
                // "&:hover": {
                // transform: isLevelUnlocked(index)
                //   ? "translateY(-2px)"
                //   : "none",
                // boxShadow: isLevelUnlocked(index)
                //   ? "0 6px 20px rgba(232, 122, 66, 0.3)"
                //   : "none",
                // },
              }}
            >
              {!isLevelUnlocked(index) && (
                <LockIcon
                  sx={{
                    fontSize: "28px",
                    mb: 1,
                    color: activeTab === index ? "#F9F8F6" : "#2B2B2B",
                  }}
                />
              )}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                {level.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Content Area - Separate from level tabs */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "80%",
          mx: "auto", // Center horizontally
          mt: 4,
          mb: 10,
          backgroundColor: "transparent",
          // borderRadius: '16px',
          p: 4,
          // border: '1px solid #E0E0E0',
          minHeight: "350px",
          // boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "#005F73", fontWeight: "bold" }}
        >
          {levels[activeTab].title}: {levels[activeTab].name}
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontSize: "1.1rem", lineHeight: 1.7, mb: 3 }}
        >
          {isLevelUnlocked(activeTab)
            ? `Content for ${levels[activeTab].name} level will be displayed here.`
            : "Complete the previous level to unlock this content."}
        </Typography>
        {isLevelUnlocked(activeTab) && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <button
              style={{
              background: "#E87A42",
              color: "#fff",
              border: "none",
              borderRadius: "25px",
              padding: "12px 32px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background 0.2s",
              }}
              onClick={() => { router.push("/user"); }}
            >
              Start Test
            </button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
