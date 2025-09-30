"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function Info() {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  // Define the highest unlocked level (0-based index)
  // For example: 0 = only Level 1, 1 = Level 1 & 2, 2 = Level 1, 2 & 3, etc.
  const highestUnlockedLevel = 1; // Level 2 is unlocked, so Level 1 & 2 are available

  // // Generate unlocked levels array based on highest unlocked level
  // const unlockedLevels = Array.from(
  //   { length: highestUnlockedLevel + 1 },
  //   (_, i) => i
  // );

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

  const handleStartTest = () => {
    const levelNumber = activeTab + 1; // Convert 0-based index to 1-based level number
    router.push(`/user/test?level=${levelNumber}`);
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#F9F8F6",
        p: 4,
      }}
    >
      {/* Title and Subtitle Section */}

      {/* Main Container Box */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "80%",
          p: 2,
          mt: 10,
          mx: "auto", 
        }}
      >
        {/* Level Boxes Container */}
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", md: "80%" },
            p: 0.5,
            mx: "auto",
          }}
        >
          {/* Connected Progress Bar Container */}
          <Box
            sx={{
              display: "flex",
              position: "relative",
              height: { xs: "32px", md: "40px" },
              maxWidth: { xs: "100%", md: "70%" },
              mx: "auto",
              overflow: "hidden",
            }}
          >
            {levels.map((level, index) => (
              <Box
                key={level.id}
                onClick={() => handleLevelClick(index)}
                sx={{
                  flex: 1,
                  position: "relative",
                  cursor: isLevelUnlocked(index) ? "pointer" : "not-allowed",
                  zIndex: levels.length - index, // Higher z-index for earlier items
                  marginLeft: index === 0 ? "0" : "-15px", // Overlap segments
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    backgroundColor:
                      activeTab === index
                        ? "#307E8D"
                        : isLevelUnlocked(index)
                        ? "#CACACA80"
                        : "#CACACA80",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      activeTab === index || isLevelUnlocked(index)
                        ? "#fff"
                        : "#666",
                    transition: "all 0.3s ease",
                    clipPath:
                      index === levels.length - 1
                        ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 20px 50%)"
                        : index === 0
                        ? "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)"
                        : "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)",
                    opacity: isLevelUnlocked(index) ? 1 : 0.7,
                    borderRadius:
                      index === 0
                        ? "25px 0 0 25px"
                        : index === levels.length - 1
                        ? "0 25px 25px 0"
                        : "0",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 0.5, md: 1 },
                      justifyContent: "center",
                      px: index === 0 ? { xs: 1, md: 2 } : { xs: 1.5, md: 3 }, // Extra padding for overlapped segments
                    }}
                  >
                    {!isLevelUnlocked(index) && (
                      <LockIcon
                        sx={{
                          fontSize: { xs: "16px", md: "20px" },
                          color: "inherit",
                        }}
                      />
                    )}
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: activeTab === index ? "bold" : "500",
                        fontSize: { xs: "0.75rem", md: "1rem" },
                        fontFamily: "Source Sans Pro",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {level.title}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
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
              onClick={handleStartTest}
            >
              Start Test
            </button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
