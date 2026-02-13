"use client";

import { useState, useEffect } from "react";
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
  const {
    isLevelPurchased,
    getBundleInfo,
    getRemainingAttempts,
    checkTestAttemptAccess,
    user,
    progress,
  } = useLevelAccess();
  const [activeLevel, setActiveLevel] = useState(initialLevel);
  const [isLevel4PendingReview, setIsLevel4PendingReview] = useState(false);

  // Check if Level 4 is pending review (for Level 5 button state)
  useEffect(() => {
    const checkLevel4Status = async () => {
      if (!user?.userId) return;

      // Check if Level 4 is already completed (reviewed by admin)
      const isLevel4Completed = progress?.completedLevels?.includes(4) || false;

      if (isLevel4Completed) {
        setIsLevel4PendingReview(false);
        return;
      }

      // Level 4 not completed - check if it's been submitted (pending review)
      try {
        const { aiInterviewService } = await import("../../services/aiInterviewService");
        const historyResponse = await aiInterviewService.getInterviewHistory();

        const hasSubmittedLevel4 = historyResponse.data?.some(
          (interview: any) =>
            interview.level === 4 &&
            (interview.status === "PENDING_REVIEW" || interview.status === "REVIEWED")
        );

        setIsLevel4PendingReview(hasSubmittedLevel4);
      } catch (error) {
        console.error("Error checking Level 4 status:", error);
        setIsLevel4PendingReview(false);
      }
    };

    checkLevel4Status();
  }, [user?.userId, progress]);


  // Check if current active level is purchased
  const isCurrentLevelPurchased = isLevelPurchased(activeLevel + 1);
  const bundleInfo = getBundleInfo(activeLevel + 1);

  // For Level 4 and 5, get remaining attempts
  const currentLevelNumber = activeLevel + 1;
  const remainingAttempts = getRemainingAttempts(currentLevelNumber);
  const showRemainingAttempts = (currentLevelNumber === 4 || currentLevelNumber === 5) && isCurrentLevelPurchased;

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
      duration: "5-7 minutes",
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
      duration: "10-15 minutes",
      questions: "60",
      description: "This reflection usually takes 10-15 minutes. It is meant to be unhurried and thoughtful",
      questionsDetail: "You may return to this assessment anytime as your understanding grows",
      isFree: false,
      features: [
        "60 in-depth questions",
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
      description: "It will take time to complete the assessment",
      questionsDetail: "It will provide sustained growth, inner stability, and conscious leadership",
      isFree: false,
      features: [
        "25 comprehensive questions",
        "Complete life mastery analysis",
        "Leadership assessment",
        "Lifetime access to insights",
      ],
    },
    {
      id: 5,
      title: "Bonus",
      name: "AI-Assisted Consultation",
      duration: "25-30 Minutes",
      questions: "AI Voice Interview",
      description: "A one-on-one reflective conversation with AI",
      questionsDetail:
        "This is not a questionnaire; it is a curated conversation that explores your thinking patterns, emotional intelligence, and inner alignment",
      isFree: false,
      features: [
        "Live, natural voice conversation",
        "Intelligent follow-up questions",
        "Deep personalized insight report",
        "Real-time adaptive dialogue",
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

    // Check if user can attempt this level
    const attemptAccess = checkTestAttemptAccess(level);

    // Don't proceed if cannot attempt
    if (!attemptAccess.canAttempt) {
      return;
    }

    // Proceed to test
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
          mb: { xs: 4, md: 8 },
        }}
      >
        <Chip
          label={`${currentLevel.title} - ${currentLevel.isFree ? "Free Assessment" : currentLevel.name
            }`}
          icon={
            <EmojiEventsIcon
              sx={{ fontSize: { xs: "16px", md: "20px" }, color: "#fff !important" }}
            />
          }
          sx={{
            backgroundColor: "#005F73",
            color: "#fff",
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "12px", md: "16px" },
            fontWeight: 600,
            borderRadius: "12px",
            py: { xs: 2, md: 2.5 },
            px: { xs: 1.5, md: 2 },
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
          borderRadius: { xs: "16px", md: "32px" },
          border: "1px solid #3A3A3A4D",
          overflow: "hidden",
        }}
      >
        {/* Connected Progress Bar (Level Selector) */}
        <Box sx={{ pt: { xs: 3, md: 5 }, pb: { xs: 2, md: 2 }, px: { xs: 2, md: 0 } }}>
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
                        {level.id === 5 ? "Bonus" : `L${level.id}`}
                      </Box>
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
          <Box sx={{ px: { xs: 2, md: 12 }, py: { xs: 3, md: 4 } }}>
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
                  ? "Unlock complete bundle including Bonus Level (AI-Assisted Consultation) for one-time fee of"
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
                  🎁 Bonus: AI-Assisted Consultation included FREE!
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
                    : `${levels[activeLevel - 1].title} (${levels[activeLevel - 1].isFree ? "Free" : "Previous"
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
                    mb: 0.5,
                  }}
                >
                  {currentLevel.title} (Premium)
                </Typography>
                {/* Bundle inclusion text */}
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "12px", md: "14px" },
                    fontWeight: 500,
                    color: "#6B7280",
                    mb: 2,
                  }}
                >
                  {activeLevel === 1
                    ? "Includes access to Level 2"
                    : activeLevel === 2
                      ? "Includes access to Levels 2 & 3"
                      : activeLevel === 3 || activeLevel === 4
                        ? "Includes access to Levels 2, 3, 4 & 5"
                        : ""}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 2 }, mb: 2 }}>
              <Box
                sx={{
                  width: { xs: "32px", md: "40px" },
                  height: { xs: "32px", md: "40px" },
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AccessTimeIcon sx={{ fontSize: { xs: "16px", md: "20px" }, color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "14px", md: "18px" },
                    fontWeight: 600,
                    color: "#000",
                  }}
                >
                  {currentLevel.duration} to Complete
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "12px", md: "14px" },
                    color: "#6B7280",
                  }}
                >
                  {currentLevel.description}
                </Typography>
              </Box>
            </Box>

            {/* Questions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 2 }, mb: 2 }}>
              <Box
                sx={{
                  width: { xs: "32px", md: "40px" },
                  height: { xs: "32px", md: "40px" },
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckCircleOutlineIcon
                  sx={{ fontSize: { xs: "16px", md: "20px" }, color: "#fff" }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "14px", md: "18px" },
                    fontWeight: 600,
                    color: "#000",
                  }}
                >
                  {currentLevel.questions} Comprehensive Questions
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "12px", md: "14px" },
                    color: "#6B7280",
                  }}
                >
                  {currentLevel.questionsDetail}
                </Typography>
              </Box>
            </Box>

            {/* Personalized Recommendations */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 2 }, mb: 2 }}>
              <Box
                sx={{
                  width: { xs: "32px", md: "40px" },
                  height: { xs: "32px", md: "40px" },
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FlareIcon sx={{ fontSize: { xs: "16px", md: "20px" }, color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "14px", md: "18px" },
                    fontWeight: 600,
                    color: "#000",
                  }}
                >
                  Personalized Recommendations
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "12px", md: "14px" },
                    color: "#6B7280",
                  }}
                >
                  Actionable advice based on your specific results
                </Typography>
              </Box>
            </Box>

            {/* Detailed Score Breakdown */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 2 }, mb: { xs: 3, md: 4 } }}>
              <Box
                sx={{
                  width: { xs: "32px", md: "40px" },
                  height: { xs: "32px", md: "40px" },
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LibraryBooksIcon sx={{ fontSize: { xs: "16px", md: "20px" }, color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "14px", md: "18px" },
                    fontWeight: 600,
                    color: "#000",
                  }}
                >
                  Detailed Score Breakdown
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "12px", md: "14px" },
                    color: "#6B7280",
                  }}
                >
                  Individual scores for 8+ life categories with visual charts
                </Typography>
              </Box>
            </Box>

            {/* Unlock Button - Hide for Level 5, show message instead */}
            {activeLevel !== 4 ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <BuyLevelButton
                  level={activeLevel + 1}
                  fullWidth
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "16px", md: "18px" },
                    color: "#FF5722",
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  🔓 Unlock Level 4 to access this bonus level
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "14px", md: "16px" },
                    color: "#6B7280",
                  }}
                >
                  The AI-Assisted Consultation is included free with Level 4 purchase
                </Typography>
              </Box>
            )}

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
          <Box sx={{ px: { xs: 2, md: 12 }, py: { xs: 3, md: 4 } }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "Faustina",
                fontWeight: 600,
                fontSize: { xs: "20px", md: "28px" },
                color: "#000",
                mb: { xs: 3, md: 4 },
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
                gap: { xs: 2, md: 3 },
                mb: { xs: 2, md: 3 },
                pb: { xs: 2, md: 3 },
                borderBottom: "1px solid #3A3A3A4D",
              }}
            >
              <Box
                sx={{
                  width: { xs: "40px", md: "48px" },
                  height: { xs: "40px", md: "48px" },
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AccessTimeIcon sx={{ fontSize: { xs: "20px", md: "24px" }, color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "16px", md: "20px" },
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
                    fontSize: { xs: "13px", md: "16px" },
                    color: "#6B7280",
                    lineHeight: 1.3,
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
                gap: { xs: 2, md: 3 },
                mb: { xs: 2, md: 3 },
                pb: { xs: 2, md: 3 },
                borderBottom: "1px solid #3A3A3A4D",
              }}
            >
              <Box
                sx={{
                  width: { xs: "40px", md: "48px" },
                  height: { xs: "40px", md: "48px" },
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckCircleOutlineIcon
                  sx={{ fontSize: { xs: "20px", md: "24px" }, color: "#fff" }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "16px", md: "20px" },
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
                    fontSize: { xs: "13px", md: "16px" },
                    color: "#6B7280",
                    lineHeight: 1.4,
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
                gap: { xs: 2, md: 3 },
                mb: { xs: 3, md: 4 },
              }}
            >
              <Box
                sx={{
                  width: { xs: "40px", md: "48px" },
                  height: { xs: "40px", md: "48px" },
                  borderRadius: "50%",
                  backgroundColor: "#307E8D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <EmojiEventsIcon sx={{ fontSize: { xs: "20px", md: "24px" }, color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: { xs: "16px", md: "20px" },
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
                    fontSize: { xs: "13px", md: "16px" },
                    color: "#6B7280",
                    lineHeight: 1.4,
                  }}
                >
                  Your results are shared immediately after completion
                </Typography>
              </Box>
            </Box>

            {/* Start Assessment Button */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: { xs: 3, md: 5 },
              }}
            >
              <ButtonSelfScore
                text={showRemainingAttempts
                  ? `Start Assessment (${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} left)`
                  : "Start Assessment"}
                endIcon={<ArrowForwardIcon sx={{ color: "#FFF" }} />}
                onClick={handleStartAssessment}
                maxWidth="565px"
                height="44px"
                borderRadius="12px"
                fontSize="16px"
                fullWidth={true}
                disabled={!checkTestAttemptAccess(activeLevel + 1).canAttempt}
                style={{
                  backgroundColor: checkTestAttemptAccess(activeLevel + 1).canAttempt ? "#FF5722" : "#CACACA",
                  cursor: checkTestAttemptAccess(activeLevel + 1).canAttempt ? "pointer" : "not-allowed",
                  opacity: checkTestAttemptAccess(activeLevel + 1).canAttempt ? 1 : 0.6,
                }}
                textStyle={{
                  fontWeight: 400,
                }}
              />
              {!checkTestAttemptAccess(activeLevel + 1).canAttempt && (
                <Typography
                  sx={{
                    mt: 2,
                    color: "#E87A42",
                    fontSize: { xs: "13px", md: "14px" },
                    fontFamily: "Source Sans Pro",
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  {activeLevel === 4 && isLevel4PendingReview
                    ? "⚠️ Level 4 review is pending. You can attempt Level 5 after admin reviews your Level 4 submission."
                    : checkTestAttemptAccess(activeLevel + 1).reason === 'PREVIOUS_LEVEL_NOT_COMPLETED'
                      ? `⚠️ Please complete Level ${checkTestAttemptAccess(activeLevel + 1).missingLevel || activeLevel} first`
                      : `⚠️ Please purchase this level to continue`}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        {/* End of conditional rendering */}
      </Box>
    </Box>
  );
}
