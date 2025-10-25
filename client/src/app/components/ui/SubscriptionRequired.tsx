"use client";

import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { Lock as LockIcon, Star as StarIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import BuyLevelButton from "./BuyLevelButton";

interface SubscriptionRequiredProps {
  level: number;
}

// Helper to get bundle description
const getBundleDescription = (level: number): string => {
  switch (level) {
    case 2:
      return "Level 2 assessment";
    case 3:
      return "Level 2 and Level 3 assessments";
    case 4:
      return "Level 2, Level 3, and Level 4 assessments (Complete Bundle)";
    default:
      return `Level ${level} assessment`;
  }
};

export default function SubscriptionRequired({
  level,
}: SubscriptionRequiredProps) {
  const router = useRouter();

  const handleGoToLevel1 = () => {
    router.push("/user/test?level=1");
  };

  const bundleDescription = getBundleDescription(level);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "600px",
        mx: "auto",
        p: 4,
        textAlign: "center",
      }}
    >
      <Card
        elevation={3}
        sx={{
          p: 4,
          borderRadius: "16px",
          background: "linear-gradient(135deg, #FFF8F3 0%, #FFE8D6 100%)",
          border: "2px solid #E87A42",
        }}
      >
        <CardContent>
          {/* Lock Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#E87A42",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <LockIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#005F73",
              mb: 2,
              fontFamily: "Faustina",
            }}
          >
            Premium Access Required
          </Typography>

          {/* Message */}
          <Typography
            variant="body1"
            sx={{
              fontSize: "1.1rem",
              color: "#2B2B2B",
              mb: 3,
              lineHeight: 1.6,
              fontFamily: "Source Sans Pro",
            }}
          >
            {level === 4
              ? `Get access to all premium assessments (Levels 2, 3 & 4) with our complete bundle.`
              : level === 3
              ? `Get access to Levels 2 & 3 with this bundle purchase.`
              : `Unlock ${bundleDescription} to access advanced insights and personalized recommendations.`}
          </Typography>

          {/* Features List */}
          <Box sx={{ mb: 4, textAlign: "left" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#005F73",
                mb: 2,
                textAlign: "center",
              }}
            >
              {level === 4
                ? "Complete Bundle Includes:"
                : level === 3
                ? "Bundle Includes:"
                : "Premium Features:"}
            </Typography>
            {[
              level >= 3
                ? "Multiple level assessments"
                : "Advanced level assessment",
              "Detailed progress analytics",
              "Personalized improvement plans",
              "Priority support",
              "Unlimited retakes",
            ].map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                  justifyContent: "center",
                }}
              >
                <StarIcon sx={{ color: "#E87A42", mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: "#2B2B2B" }}>
                  {feature}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Integrated Buy Level Button for Stripe Payment */}
            <BuyLevelButton level={level} />

            <Button
              onClick={handleGoToLevel1}
              variant="outlined"
              sx={{
                borderColor: "#005F73",
                color: "#005F73",
                borderRadius: "25px",
                padding: "12px 32px",
                fontWeight: "bold",
                fontSize: "1rem",
                "&:hover": {
                  borderColor: "#004A5C",
                  color: "#004A5C",
                  background: "rgba(0, 95, 115, 0.04)",
                },
              }}
            >
              Try Level 1 Free
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
