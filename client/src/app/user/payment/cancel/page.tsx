"use client";

import { Box, Typography, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import CancelIcon from "@mui/icons-material/Cancel";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import OutLineButton from "@/app/components/ui/OutLineButton";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <Box sx={{
      backgroundColor:"#FFF"
    }}>
      <Container
        maxWidth="sm"
        sx={{
          pt: 12,
          pb: 8,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#FFF3E0",
            borderRadius: "24px",
            p: { xs: 4, md: 6 },
            border: "1px solid #FFE0B2",
          }}
        >
          {/* Warning Icon */}
          <Box
            sx={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#FF9800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <CancelIcon sx={{ fontSize: 48, color: "#fff" }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Faustina",
              fontWeight: 600,
              fontSize: { xs: "28px", md: "34px" },
              color: "#000",
              mb: 2,
            }}
          >
            Payment Cancelled
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: { xs: "14px", md: "16px" },
              color: "#6B7280",
              mb: 4,
            }}
          >
            Your payment was cancelled.
            <br />
            No charges have been made to your account.
          </Typography>

          {/* Action Buttons */}
          <Box>
            <ButtonSelfScore
              text="Back to Tests"
              endIcon={<ArrowBackIcon />}
              onClick={() => router.push("/user/test")}
              fullWidth
              style={{
                backgroundColor: "#FF5722",
                marginBottom: "12px",
              }}
            />
            <OutLineButton
              startIcon={<HomeIcon />}
              onClick={() => router.push("/")}
              fullWidth
              sx={{
                borderColor: "#307E8D",
                color: "#307E8D",
                "&:hover": {
                  borderColor: "#307E8D",
                  backgroundColor: "rgba(48, 126, 141, 0.04)",
                },
              }}
            >
              Go to Home
            </OutLineButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
