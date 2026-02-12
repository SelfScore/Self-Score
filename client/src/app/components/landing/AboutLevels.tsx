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
      price: "FREE",
      description:
        "Level 1 helps you gently understand how balanced you feel inside right now. It looks at your everyday experience of happiness, love, peace, freedom, forgiveness, and inner harmony. This is not about judgment; it’s simply a mirror to help you know yourself better.",
    },
    {
      id: 2,
      title: "Level 2",
      name: "Exploration",
      price: "$5",
      description:
        "Level 2 helps you become aware of habits, impulses, and inner tendencies that quietly affect your peace and clarity. This is not about guilt or judgment, but about honest self-observation. Awareness is the first step toward inner freedom.",
    },
    {
      id: 3,
      title: "Level 3",
      name: "Action",
      price: " $15",
      description:
        "Level 3 explores your deepest beliefs about life, self, God, happiness, and truth. It helps you observe who you think you are, why you live, and what guides your choices. This level is not about right or wrong answers, but about honest inner clarity.",
    },
    {
      id: 4,
      title: "Level 4",
      name: "Mastery",
      price: "$25",
      description:
        "Level 4 reflects how deeply you are living what you already know. It looks at consistency, inner stability, and your ability to grow without losing balance. All questions in this level are subjective. You can also use voice notes to answer.",
    },
    {
      id: 5,
      title: "Level 5",
      name: "Excellence",
      price: "Bonus Included with level 4",
      description:
        "This advanced stage represents the pinnacle of personal development. You'll embody wisdom, demonstrate consistent growth, and serve as a guide for others. This level is about continuous refinement, lasting impact, and creating a legacy of positive transformation.",
    },
  ];

  const handleLevelClick = (index: number) => {
    // All levels are now clickable - removed unlock restriction
    setActiveTab(index);
  };

  const isLevelUnlocked = (index: number) => index <= highestUnlockedLevel;

  // Guidelines for each level
  const getLevelGuidelines = (levelIndex: number) => {
    const guidelines = [
      // Level 1
      {
        guidelines:
          "There are no right or wrong answers, only honest ones. Answer based on how you truly feel most of the time, not how you wish to feel.",
        beforeYouBegin:
          "Take a quiet moment before you begin and breathe calmly. Approach the test with an open mind and a calm heart. Leave aside expectations, distractions, and comparisons. ",
        timeCommitment:
          "The assessment takes approximately 2-5 minutes to complete. Set aside uninterrupted time to reflect and respond.",
        privacy:
          "Your responses are confidential and will not be shared with anyone. We prioritize your privacy and data security.",
      },
      // Level 2
      {
        guidelines:
          "Please answer honestly and kindly toward yourself. There are no right or wrong answers. This test is for self-understanding, not self-criticism.",
        beforeYouBegin:
          "Take a few quiet moments before you begin and answer without rushing. Trust that even small awareness creates meaningful change.",
        timeCommitment:
          "The assessment takes approximately 5-7 minutes to complete. Set aside uninterrupted time to reflect and respond.",
        privacy:
          "Your responses are confidential and will not be shared with anyone. We prioritize your privacy and data security.",
      },
      // Level 3
      {
        guidelines:
          "Answer slowly and truthfully; there are no correct or incorrect views, only your current understanding. Let your answers come from lived experience, not borrowed philosophies.",
        beforeYouBegin:
          "It is okay if some questions feel uncomfortable or unclear. Choose the option that feels most aligned right now, not what you aspire to be. This is a mirror, not a judgment.",
        timeCommitment:
          "The assessment takes approximately 10-15 minutes to complete. Set aside uninterrupted time to reflect and respond.",
        privacy:
          "Your responses are confidential and will not be shared with anyone. We prioritize your privacy and data security.",
      },
      // Level 4
      {
        guidelines:
          "Take a quiet moment before you begin and breathe calmly. Approach the test with an open mind and a calm heart. Leave aside expectations, distractions, and comparisons.",
        beforeYouBegin:
          "There are no right or wrong answers, only what feels true for you at this moment. This level is about how you live, not what you believe.",
        timeCommitment:
          "The assessment takes approximately 25-30 minutes to complete. Set aside uninterrupted time to reflect and respond.",
        privacy:
          "Your responses are confidential and will not be shared with anyone. We prioritize your privacy and data security.",
      },
      // Level 5
      {
        guidelines:
          "There are no right or wrong answers, only what feels true for you at this moment. This level is about how you live, not what you believe.",
        beforeYouBegin:
          "Take a quiet moment before you begin and breathe calmly. Approach the test with an open mind and a calm heart. Leave aside expectations, distractions, and comparisons.",
        timeCommitment:
          "The assessment takes approximately 25-30 minutes to complete. Set aside uninterrupted time to reflect and respond.",
        privacy:
          "Your responses are confidential and will not be shared with anyone. We prioritize your privacy and data security.",
      },
    ];

    return guidelines[levelIndex] || guidelines[0];
  };

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
          Our life scoring system comprises four progressive levels,
          <br />
          each corresponding to a distinct stage of personal development.
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
                  cursor: "pointer", // All levels are now clickable
                  zIndex: levels.length - index, // Higher z-index for earlier items
                  marginLeft: index === 0 ? "0" : "-15px", // Overlap segments
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    backgroundColor:
                      activeTab === index
                        ? "#FF4F00"
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
                    // Add blue border for Level 5
                    ...(index === 4 && {
                      border: "2px solid #FF4F00",
                      boxSizing: "border-box",
                    }),
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
                      {/* Full text for medium+ screens */}
                      <Box
                        component="span"
                        sx={{ display: { xs: "none", md: "inline" } }}
                      >
                        {level.title}
                      </Box>
                      {/* Abbreviated text for small screens */}
                      <Box
                        component="span"
                        sx={{ display: { xs: "inline", md: "none" } }}
                      >
                        L{level.id}
                      </Box>
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
            <Box sx={{ display: "flex", flexDirection: "row" }}>
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
              <Box
                sx={{
                  // border: "1px solid #000",
                  borderRadius: "12px",
                  // mb: 5,
                  px: 2,
                  ml: 1,
                  my: "auto",
                  backgroundColor: "#005F73",
                  display: "flex",
                  color: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Source Sans Pro",
                }}
              >
                <Typography>{levels[activeTab].price}</Typography>
              </Box>
            </Box>
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
              {levels[activeTab].description}
            </Typography>

            {/* Button with sequential access validation */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <ButtonSelfScore
                onClick={() => {
                  router.push(`/testInfo?level=${activeTab + 1}`);
                }}
                text={
                  activeTab === 0 || isLevelUnlocked(activeTab)
                    ? "Discover Your Starting Point"
                    : `Level ${activeTab + 1} Locked`
                }
                disabled={activeTab !== 0 && !isLevelUnlocked(activeTab)}
                style={{
                  opacity:
                    activeTab === 0 || isLevelUnlocked(activeTab) ? 1 : 0.6,
                  cursor:
                    activeTab === 0 || isLevelUnlocked(activeTab)
                      ? "pointer"
                      : "not-allowed",
                  background:
                    activeTab === 0 || isLevelUnlocked(activeTab)
                      ? "#FF4F00"
                      : "#CACACA",
                }}
              />
              {activeTab !== 0 && !isLevelUnlocked(activeTab) && (
                <Typography
                  sx={{
                    mt: 1.5,
                    color: "#E87A42",
                    fontSize: { xs: "13px", md: "15px" },
                    fontFamily: "Source Sans Pro",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  ⚠️ Complete Level {activeTab} first to unlock this level
                </Typography>
              )}
            </Box>
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
                <strong>Guidelines:</strong>{" "}
                {getLevelGuidelines(activeTab).guidelines}
              </Typography>
              {getLevelGuidelines(activeTab).beforeYouBegin && (
                <Typography
                  sx={{ fontSize: { xs: "14px", md: "16px" }, mt: 1 }}
                >
                  <strong>Before You Begin:</strong>{" "}
                  {getLevelGuidelines(activeTab).beforeYouBegin}
                </Typography>
              )}
              <Typography sx={{ mt: 1, fontSize: { xs: "14px", md: "16px" } }}>
                <strong>Time Commitment:</strong>{" "}
                {getLevelGuidelines(activeTab).timeCommitment}
              </Typography>
              <Typography sx={{ mt: 1, fontSize: { xs: "14px", md: "16px" } }}>
                <strong>Privacy Assurance:</strong>{" "}
                {getLevelGuidelines(activeTab).privacy}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
