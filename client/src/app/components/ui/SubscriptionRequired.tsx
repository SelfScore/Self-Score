"use client";

import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { Lock as LockIcon, Star as StarIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import BuyLevelButton from "./BuyLevelButton";

interface SubscriptionRequiredProps {
  level: number;
}

export default function SubscriptionRequired({
  level,
}: SubscriptionRequiredProps) {
  const router = useRouter();

  const handleGoToLevel1 = () => {
    router.push("/user/test?level=1");
  };

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
            Level {level} is part of our premium assessment suite. Unlock
            advanced insights and personalized recommendations with a
            subscription.
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
              Premium Features:
            </Typography>
            {[
              "Advanced level assessments",
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
