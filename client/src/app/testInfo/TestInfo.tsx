"use client";

import { useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { useRouter } from "next/navigation";
import { Lock as LockIcon } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import OutLineButton from "../components/ui/OutLineButton";
import ButtonSelfScore from "../components/ui/ButtonSelfScore";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useLevelAccess } from "../../hooks/useLevelAccess";
import BuyLevelButton from "../components/ui/BuyLevelButton";
import { formatPrice } from "../../lib/stripe";
import FlareIcon from "@mui/icons-material/Flare";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

interface TestInfoProps {
  initialLevel: number;
}

export default function TestInfo({ initialLevel }: TestInfoProps) {
  const router = useRouter();
  const { isLevelPurchased, getBundleInfo } = useLevelAccess();
  const [activeLevel, setActiveLevel] = useState(initialLevel);

  // Check if current active level is purchased
  const isCurrentLevelPurchased = isLevelPurchased(activeLevel + 1);
  const bundleInfo = getBundleInfo(activeLevel + 1);

  const levels = [
    {
      id: 1,
      title: "Level 1",
      name: "Awareness",
      duration: "2-3 Minutes",
      questions: 6,
      description: "Quick and easy questions that respect your time",
      questionsDetail: "Covering key areas of life satisfaction and well-being",
      isFree: true,
      features: [
        "6 basic questions",
        "General overview",
        "Basic recommendations",
        "Simple score display",
      ],
    },
    {
      id: 2,
      title: "Level 2",
      name: "Exploration",
      duration: "15-20 Minutes",
      questions: 9,
      description: "Still quick enough to fit in your schedule",
      questionsDetail:
        "Deeper exploration of life satisfaction, relationships, career, and personal growth",
      isFree: false,
      features: [
        "9 comprehensive questions",
        "Detailed category analysis",
        "Personalized action plan",
        "Professional PDF report",
      ],
    },
    {
      id: 3,
      title: "Level 3",
      name: "Action",
      duration: "25-30 Minutes",
      questions: "50+",
      description: "Comprehensive assessment for actionable insights",
      questionsDetail: "Developing concrete strategies for personal growth",
      isFree: false,
      features: [
        "50+ in-depth questions",
        "Advanced analytics",
        "Goal-setting framework",
        "Progress tracking tools",
      ],
    },
    {
      id: 4,
      title: "Level 4",
      name: "Mastery",
      duration: "35-40 Minutes",
      questions: 25,
      description: "Complete mastery assessment",
      questionsDetail: "Evaluating sustained growth and leadership potential",
      isFree: false,
      features: [
        "20 comprehensive questions",
        "Complete life mastery analysis",
        "Leadership assessment",
        "Lifetime access to insights",
      ],
    },
    {
      id: 5,
      title: "Level 5",
      name: "Excellence",
      duration: "45-60 Minutes",
      questions: "Expert Review",
      description: "Pinnacle of personal development",
      questionsDetail:
        "Expert review and personalized guidance for lasting transformation",
      isFree: false,
      features: [
        "Expert consultant review",
        "Personalized transformation plan",
        "Legacy building framework",
        "Ongoing support access",
      ],
    },
  ];

  const currentLevel = levels[activeLevel];

  const handleLevelClick = (index: number) => {
    // All levels are now clickable - removed unlock restriction
    setActiveLevel(index);
  };

  const handleStartAssessment = () => {
    const level = activeLevel + 1;
    if (level === 5) {
      router.push(`/user/test?level=${level}&mode=voice`);
    } else {
      router.push(`/user/test?level=${level}`);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#FFF",
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 4 },
      }}
    >
      {/* Back Button */}
      <Box
        sx={{
          mb: { xs: 3, md: -5 },
          ml: { xs: 0, lg: 8 },
          mt: { xs: 8, md: 10 },
        }}
      >
        <OutLineButton
          startIcon={
            <ArrowBackIosIcon
              sx={{
                fontSize: { xs: "20px" },
              }}
            />
          }
          style={{
            background: "transparent",
            color: "#3A3A3A",
            border: "1px solid #3A3A3A",
            borderRadius: "8px",
            padding: "6.75px 14px",
            fontWeight: 400,
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={handleBack}
        >
          Back
        </OutLineButton>
      </Box>

      {/* Level Badge */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 8,
        }}
      >
        <Chip
          label={`${currentLevel.title} - ${
            currentLevel.isFree ? "Free Assessment" : currentLevel.name
          }`}
          icon={
            <EmojiEventsIcon
              sx={{ fontSize: "20px", color: "#fff !important" }}
            />
          }
          sx={{
            backgroundColor: "#005F73",
            color: "#fff",
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "14px", md: "16px" },
            fontWeight: 600,
            borderRadius: "12px",
            py: 2.5,
            px: 2,
            "& .MuiChip-icon": {
              color: "#fff",
            },
          }}
        />
      </Box>

      {/* Main Content Container */}
      <Box
        sx={{
          maxWidth: "846px",
          mx: "auto",
          backgroundColor: "#F7F7F7",
          borderRadius: "32px",
          border: "1px solid #3A3A3A4D",
          overflow: "hidden",
        }}
      >
        {/* Connected Progress Bar (Level Selector) */}
        <Box sx={{ pt: { xs: 3, md: 5 }, pb: { xs: 2, md: 2 } }}>
          <Box
            sx={{
              display: "flex",
              position: "relative",
              height: { xs: "36px", md: "40px" },
              maxWidth: { xs: "100%", md: "80%" },
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
                  zIndex: levels.length - index,
                  marginLeft: index === 0 ? "0" : "-15px",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    backgroundColor:
                      activeLevel === index
                        ? "#307E8D"
                        : isLevelPurchased(index + 1) || index === 0
                        ? "#CACACA80"
                        : "#E0E0E0",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      activeLevel === index ||
                      isLevelPurchased(index + 1) ||
                      index === 0
                        ? "#fff"
                        : "#999",
                    transition: "all 0.3s ease",
                    clipPath:
                      index === levels.length - 1
                        ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 20px 50%)"
                        : index === 0
                        ? "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)"
                        : "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)",
                    opacity:
                      isLevelPurchased(index + 1) || index === 0 ? 1 : 0.6,
                    borderRadius:
                      index === 0
                        ? "25px 0 0 25px"
                        : index === levels.length - 1
                        ? "0 25px 25px 0"
                        : "0",
                    "&:hover": {
                      opacity: 0.9,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 0.5, md: 1 },
                      justifyContent: "center",
                      px: index === 0 ? { xs: 1, md: 2 } : { xs: 1.5, md: 3 },
                    }}
                  >
                    {!isLevelPurchased(index + 1) && index > 0 && (
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
                        fontWeight: activeLevel === index ? "bold" : "500",
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

        {/* Conditional Content - Show Pricing UI if not purchased, otherwise show What to Expect */}
        {!isCurrentLevelPurchased && !currentLevel.isFree ? (
          // PRICING/UPGRADE UI for unpurchased levels
          <Box sx={{ px: { xs: 3, md: 12 }, py: { xs: 4, md: 4 } }}>
            {/* Price Section */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: { xs: "14px", md: "16px" },
                  color: "#6B7280",
                  mb: 1,
                }}
              >
                {activeLevel === 4
                  ? "Unlock complete bundle including Level 5 (Excellence) for one-time fee of"
                  : "Unlock this assessment for lifetime access for one-time fee of"}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: "Faustina",
                  fontWeight: 700,
                  fontSize: { xs: "48px", md: "64px" },
                  color: "#000",
                  lineHeight: 1,
                }}
              >
                {bundleInfo ? formatPrice(bundleInfo.price) : "$0"}
              </Typography>
              {activeLevel === 4 && (
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "12px", md: "14px" },
                    color: "#FF5722",
                    mt: 1,
                    fontWeight: 600,
                  }}
                >
                  🎁 Bonus: Level 5 (Excellence) included FREE!
                </Typography>
              )}
            </Box>

            {/* Why Upgrade Section */}
            <Typography
              variant="h5"
              sx={{
                fontFamily: "Faustina",
                fontWeight: 600,
                fontSize: { xs: "20px", md: "24px" },
                color: "#000",
                mb: 3,
                textAlign: "center",
              }}
            >
              Why Upgrade to {currentLevel.title}?
            </Typography>

            {/* Comparison Cards */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 4,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              {/* Previous Level (Free or Lower Tier) */}
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: "#F9FAFB",
                  borderRadius: "16px",
                  border: "1px solid #E5E7EB",
                  p: 3,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "16px", md: "18px" },
                    fontWeight: 600,
                    color: "#6B7280",
                    mb: 2,
                  }}
                >
                  {activeLevel === 1
                    ? "Level 1 (Free)"
                    : `${levels[activeLevel - 1].title} (${
                        levels[activeLevel - 1].isFree ? "Free" : "Previous"
                      })`}
                </Typography>
                {activeLevel > 0 &&
                  levels[activeLevel - 1].features.map((feature, idx) => (
                    <Typography
                      key={idx}
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: { xs: "14px", md: "16px" },
                        color: "#6B7280",
                        mb: 1,
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                    >
                      • {feature}
                    </Typography>
                  ))}
              </Box>

              {/* Current Level (Premium) */}
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: "#FFF7ED",
                  borderRadius: "16px",
                  border: "2px solid #FF5722",
                  p: 3,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "16px", md: "18px" },
                    fontWeight: 600,
                    color: "#FF5722",
                    mb: 2,
                  }}
                >
                  {currentLevel.title} (Premium)
                </Typography>
                {currentLevel.features.map((feature, idx) => (
                  <Typography
                    key={idx}
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "14px", md: "16px" },
                      color: "#000",
                      mb: 1,
                      display: "flex",
                      alignItems: "flex-start",
                    }}
                  >
                    • {feature}
                  </Typography>
                ))}
              </Box>
            </Box>

            {/* What to Expect - Condensed version */}
            <Typography
              variant="h6"
              sx={{
                fontFamily: "Faustina",
                fontWeight: 600,
                fontSize: { xs: "18px", md: "20px" },
                color: "#000",
                mb: 3,
                textAlign: "left",
              }}
            >
              What to Expect
            </Typography>

            {/* Duration */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AccessTimeIcon sx={{ fontSize: "20px", color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "16px", md: "18px" },
                    fontWeight: 600,
                    color: "#000",
                  }}
                >
                  {currentLevel.duration} to Complete
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "13px", md: "14px" },
                    color: "#6B7280",
                  }}
                >
                  {currentLevel.description}
                </Typography>
              </Box>
            </Box>

            {/* Questions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckCircleOutlineIcon
                  sx={{ fontSize: "20px", color: "#fff" }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "16px", md: "18px" },
                    fontWeight: 600,
                    color: "#000",
                  }}
                >
                  {currentLevel.questions} Comprehensive Questions
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "13px", md: "14px" },
                    color: "#6B7280",
                  }}
                >
                  {currentLevel.questionsDetail}
                </Typography>
              </Box>
            </Box>

            {/* Personalized Recommendations */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FlareIcon sx={{ fontSize: "20px", color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "16px", md: "18px" },
                    fontWeight: 600,
                    color: "#000",
                  }}
                >
                  Personalized Recommendations
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "13px", md: "14px" },
                    color: "#6B7280",
                  }}
                >
                  Actionable advice based on your specific results
                </Typography>
              </Box>
            </Box>

            {/* Detailed Score Breakdown */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <Box
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LibraryBooksIcon sx={{ fontSize: "20px", color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "16px", md: "18px" },
                    fontWeight: 600,
                    color: "#000",
                  }}
                >
                  Detailed Score Breakdown
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "13px", md: "14px" },
                    color: "#6B7280",
                  }}
                >
                  Individual scores for 8+ life categories with visual charts
                </Typography>
              </Box>
            </Box>

            {/* Unlock Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <BuyLevelButton
                level={activeLevel === 4 ? 4 : activeLevel + 1}
                fullWidth
              />
            </Box>

            {/* Security Note */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: { xs: "12px", md: "14px" },
                  color: "#6B7280",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <LockIcon sx={{ fontSize: "16px" }} />
                100% Secure payments
              </Typography>
            </Box>
          </Box>
        ) : (
          // WHAT TO EXPECT UI for purchased/free levels
          <Box sx={{ px: { xs: 3, md: 12 }, py: { xs: 4, md: 4 } }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "Faustina",
                fontWeight: 600,
                fontSize: { xs: "24px", md: "28px" },
                color: "#000",
                mb: 4,
                textAlign: "left",
              }}
            >
              What to Expect
            </Typography>

            {/* Duration */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 3,
                mb: 3,
                pb: 3,
                borderBottom: "1px solid #3A3A3A4D",
              }}
            >
              <Box
                sx={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AccessTimeIcon sx={{ fontSize: "24px", color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "source Sans Pro",
                    fontSize: { xs: "18px", md: "20px" },
                    fontWeight: 600,
                    color: "#000",
                    mb: 0.5,
                    mt: -0.5,
                  }}
                >
                  Duration: {currentLevel.duration}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "14px", md: "16px" },
                    color: "#6B7280",
                    lineHeight: 1,
                  }}
                >
                  {currentLevel.description}
                </Typography>
              </Box>
            </Box>

            {/* Questions */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 3,
                mb: 3,
                pb: 3,
                borderBottom: "1px solid #3A3A3A4D",
              }}
            >
              <Box
                sx={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckCircleOutlineIcon
                  sx={{ fontSize: "24px", color: "#fff" }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "source Sans Pro",
                    fontSize: { xs: "18px", md: "20px" },
                    fontWeight: 600,
                    color: "#000",
                    mb: 0.5,
                    mt: -0.5,
                  }}
                >
                  {currentLevel.questions} Questions
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "14px", md: "16px" },
                    color: "#6B7280",
                    lineHeight: 1.5,
                  }}
                >
                  {currentLevel.questionsDetail}
                </Typography>
              </Box>
            </Box>

            {/* Instant Results */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 3,
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <EmojiEventsIcon sx={{ fontSize: "24px", color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "source Sans Pro",
                    fontSize: { xs: "18px", md: "20px" },
                    fontWeight: 600,
                    color: "#000",
                    mb: 0.5,
                    mt: -0.5,
                  }}
                >
                  Instant Results
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "14px", md: "16px" },
                    color: "#6B7280",
                    lineHeight: 1.5,
                  }}
                >
                  Get your self-score immediately after completion
                </Typography>
              </Box>
            </Box>

            {/* Start Assessment Button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 5,
              }}
            >
              <ButtonSelfScore
                text="Start Assessment"
                endIcon={<ArrowForwardIcon sx={{ color: "#FFF" }} />}
                onClick={handleStartAssessment}
                maxWidth="565px"
                height="40px"
                borderRadius="12px"
                fontSize="20px"
                fullWidth={true}
                style={{
                  backgroundColor: "#FF5722",
                }}
                textStyle={{
                  fontWeight: 400,
                }}
              />
            </Box>
          </Box>
        )}
        {/* End of conditional rendering */}
      </Box>
    </Box>
  );
}
