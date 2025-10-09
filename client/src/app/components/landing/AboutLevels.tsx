"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ButtonSelfScore from "../ui/ButtonSelfScore";
import { useLevelAccess } from "../../../hooks/useLevelAccess";

export default function AboutLevels() {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const { getHighestUnlockedLevel } = useLevelAccess();

  // Get dynamic highest unlocked level from user progress
  const highestUnlockedLevel = getHighestUnlockedLevel() - 1; // Convert to 0-based index

  // Generate unlocked levels array based on highest unlocked level
  // const _unlockedLevels = Array.from(
  //   { length: highestUnlockedLevel + 1 },
  //   (_, i) => i
  // );

  const levels = [
    {
      id: 1,
      title: "Level 1",
      name: "Awareness",
      description:
        "This initial stage is all about gently tuning into your inner world. You'll begin to recognize your current patterns, discover what truly matters to you, and lay the groundwork for a more mindful existence. It's the moment you start listening to the whispers of your soul.",
    },
    {
      id: 2,
      title: "Level 2",
      name: "Exploration",
      description:
        "At this stage, you embark on a journey of self-discovery. You'll delve deeper into understanding your strengths, values, and aspirations. This level encourages you to explore new perspectives, challenge limiting beliefs, and start envisioning the life you want to create.",
    },
    {
      id: 3,
      title: "Level 3",
      name: "Action",
      description:
        "In this phase, you take decisive steps towards your goals. You'll learn to set actionable objectives, develop new skills, and implement changes in your life. This level is all about turning insights into tangible outcomes and making meaningful progress.",
    },
    {
      id: 4,
      title: "Level 4",
      name: "Mastery",
      description:
        "The final stage is about sustaining growth and embracing lifelong learning. You'll refine your abilities, cultivate resilience, and deepen your self-awareness. This level empowers you to live authentically, lead with purpose, and inspire others on their own journeys.",
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
        backgroundColor: "#fff",
        p: { xs: 2, md: 4 },
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
            fontWeight: "700",
            fontFamily: "faustina",
            color: "#000",
            mb: 3,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "28px" },
          }}
        >
          About the Test Levels
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Source Sans Pro",
            color: "#2B2B2B",
            maxWidth: "800px",
            mx: "auto",
            lineHeight: 1.2,
            fontSize: { xs: "1rem", sm: "1.1rem", md: "18px" },
          }}
        >
          Our life scoring system comprises four progressive levels, each
          corresponding to a distinct stage of personal development. Take the
          assessment to start your journey.
        </Typography>
      </Box>

      <Box
        sx={{
          height: "48px",
          maxWidth: "428px",
          mx: "auto",
          border: "1px solid #3A3A3A66",
          borderRadius: "16px",
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: { xs: "0.75rem", sm: "0.875rem", md: "18px" },
              color: "#000000",
              textAlign: "center",
              lineHeight: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 1,
            }}
          >
            Take the assessment to start your journey
            <ArrowDownwardIcon
              sx={{ color: "#307E8D", fontSize: "24px", ml: 1 }}
            />
          </Typography>
        </Box>
      </Box>

      {/* Main  Test Container Box */}
      <Box
        sx={{
          width: "100%",
          maxWidth: { md: "93%", xs: "100%" },
          backgroundColor: "#F7F7F7",
          borderRadius: { xs: "16px", md: "32px" },
          p: { xs: "8px 8px 0px 8px", md: "32px 32px 0px 32px" },
          mx: "auto",
          border: "1px solid #3A3A3A4D",
        }}
      >
        {/* Level Tabs */}
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", md: "80%" },
            // backgroundColor: "#e5e5e5",
            // borderRadius: "50px",
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

        {/* Content Area - Separate from level tabs */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            mt: { xs: 2, md: 4 },
            gap: { xs: 2, md: 0 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", md: "80%" },
              flexDirection: "column",
              flex: { xs: 1, md: 0.5 },
              mx: "auto", // Center horizontally
              mt: { xs: 2, md: 4 },
              mb: { xs: 4, md: 10 },
              backgroundColor: "transparent",
              // borderRadius: '16px',
              p: { xs: 2, md: 4 },
              // border: '1px solid #E0E0E0',
              minHeight: { xs: "200px", md: "350px" },
              // boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                color: "#005F73",
                fontWeight: "bold",
                fontFamily: "Faustina",
                fontSize: { xs: "1.5rem", md: "2.125rem" },
              }}
            >
              {levels[activeTab].title}: {levels[activeTab].name}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "16px", md: "20px" },
                fontFamily: "Source Sans Pro",
                lineHeight: 1.2,
                mb: 3,
                color: "#2B2B2B",
              }}
            >
              {isLevelUnlocked(activeTab)
                ? levels[activeTab].description
                : "Complete the previous level to unlock this content."}
            </Typography>

            {isLevelUnlocked(activeTab) && (
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <ButtonSelfScore
                  onClick={() => {
                    router.push("/user");
                  }}
                  text="Discover Your Starting Point"
                />
              </Box>
            )}
          </Box>

          {/* guidelines box */}
          <Box
            sx={{
              flex: { xs: 1, md: 0.5 },
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              minHeight: { xs: "200px", md: "350px" },
            }}
          >
            <Box
              sx={{
                width: "100%",
                fontFamily: "Source Sans Pro",
                borderTopRightRadius: "16px",
                borderTopLeftRadius: "16px",
                p: { xs: 1.5, md: 2 },
                background:
                  "linear-gradient(133.35deg, #F7EFE8 -8.89%, #B0D8E0 119%)",
                maxWidth: { xs: "100%", md: "450px" },
                mx: "auto",
                color: "#000",
                mb: 0,
                border: "1px solid #154B564D",
                borderBottom: "none",
              }}
            >
              <Typography sx={{ fontSize: { xs: "14px", md: "16px" } }}>
                <strong>Guidelines:</strong> Answer honestly and thoughtfully.
                There are no right or wrong answers. Your responses will help
                you understand your current stage and guide you on your personal
                growth journey.
              </Typography>
              <Typography sx={{ mt: 1, fontSize: { xs: "14px", md: "16px" } }}>
                <strong>Time Commitment:</strong> The assessment takes
                approximately 10-15 minutes to complete. Set aside uninterrupted
                time to reflect and respond.
              </Typography>
              <Typography sx={{ mt: 1, fontSize: { xs: "14px", md: "16px" } }}>
                <strong>Privacy Assurance:</strong> Your responses are
                confidential and will not be shared with anyone. We prioritize
                your privacy and data security.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
