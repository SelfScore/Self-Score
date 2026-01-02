"use client";

import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentService } from "../../../../services/paymentService";
import { authService } from "../../../../services/authService";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ButtonSelfScore from "../../../components/ui/ButtonSelfScore";
import OutLineButton from "../../../components/ui/OutLineButton";

function PaymentSuccessContent() {
  const [verifying, setVerifying] = useState(true);
  const [_success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  // const [countdown, setCountdown] = useState(5000000);
  const [paymentData, setPaymentData] = useState<{
    transactionId: string;
    amount: number;
    date: string;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setError("No session ID found");
        setVerifying(false);
        return;
      }

      try {
        const response = await paymentService.verifyPayment(sessionId);

        if (response.success) {
          setSuccess(true);
          setLevel(response.data?.level || null);
          setSessionId(sessionId); // Store session ID for invoice download

          // Mock payment data (replace with actual data from response if available)
          setPaymentData({
            transactionId: sessionId.slice(-12).toUpperCase(),
            amount:
              response.data?.level === 2
                ? 5
                : response.data?.level === 3
                ? 10
                : 25,
            date: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          });

          // Refresh user data to get updated purchasedLevels
          await authService.getCurrentUser();

          // Start countdown
          // const countdownInterval = setInterval(() => {
          //   setCountdown((prev) => {
          //     if (prev <= 1) {
          //       clearInterval(countdownInterval);
          //       router.push(`/user/test?level=${response.data?.level || 2}`);
          //       return 0;
          //     }
          //     return prev - 1;
          //   });
          // }, 1000);

          // return () => clearInterval(countdownInterval);
        } else {
          setError(response.message || "Payment verification failed");
        }
      } catch (err: any) {
        console.error("Payment verification error:", err);
        setError(err.response?.data?.message || "Failed to verify payment");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  const handleDownloadInvoice = async () => {
    if (!sessionId) {
      alert("Session ID not found");
      return;
    }

    try {
      setDownloadingInvoice(true);
      await paymentService.downloadInvoice(sessionId);
    } catch (err: any) {
      console.error("Failed to download invoice:", err);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (verifying) {
    return (
      <Container maxWidth="sm" sx={{ mt: 16, mb: 8, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Verifying your payment...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <ButtonSelfScore
          text="Go to Dashboard"
          onClick={() => router.push("/user/dashboard")}
          fullWidth
        />
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#FFF" }}>
      <Container
        maxWidth="sm"
        sx={{
          pt: 17,
          pb: 8,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#E8F5E9",
            borderRadius: "24px",
            maxWidth: "628px",
            maxHeight: "644px",
            py: { xs: 4, md: 2 },
            px: { xs: 4, md: 4 },
            border: "1px solid #C8E6C9",
          }}
        >
          {/* Countdown Message */}
          {/* <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: { xs: "14px", md: "18px" },
              color: "#4A5565",
              mb: 3,
            }}
          >
            You are being redirected to test in {countdown}...
          </Typography> */}

          {/* Success Icon */}
          <Box
            sx={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "#22C55E1A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#22C55E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 32, color: "transprent" }} />
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Faustina",
              fontWeight: 600,
              fontSize: { xs: "28px", md: "36px" },
              color: "#000000",
              mb: 2,
            }}
          >
            Payment Successful
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: { xs: "14px", md: "18px" },
              color: "#4A5565",
              mb: 4,
            }}
          >
            Your payment has been processed successfully.
            <br />
            You will be redirected to the unlocked test.
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ mb: 4 }}>
            <ButtonSelfScore
              text={`Start Level ${level || 2} Test`}
              endIcon={<ArrowForwardIcon sx={{ color: "#FFF" }} />}
              onClick={() => router.push(`/user/test?level=${level || 2}`)}
              fullWidth
              height={40}
              textStyle={{ fontSize: "16px" }}
              style={{
                backgroundColor: "#FF5722",
                marginBottom: "12px",
              }}
            />
            <OutLineButton
              startIcon={<DownloadIcon />}
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              fullWidth
              sx={{
                borderColor: "#307E8D",
                color: "#307E8D",
                height: "40px",
                fontSize: "16px",
                "&:hover": {
                  borderColor: "#307E8D",
                  backgroundColor: "rgba(48, 126, 141, 0.04)",
                },
                "&:disabled": {
                  opacity: 0.6,
                  cursor: "not-allowed",
                },
              }}
            >
              {downloadingInvoice ? "Downloading..." : "Download Invoice"}
            </OutLineButton>
          </Box>

          {/* Transaction Details */}
          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              borderRadius: "12px",
              p: 3,
              textAlign: "left",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                pb: 2,
                borderBottom: "1px solid #E0E0E0",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: { xs: "14px", md: "16px" },
                  color: "#6B7280",
                }}
              >
                Transaction ID:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: { xs: "14px", md: "16px" },
                  fontWeight: 600,
                  color: "#000",
                }}
              >
                {paymentData?.transactionId}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                pb: 2,
                borderBottom: "1px solid #E0E0E0",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: { xs: "14px", md: "16px" },
                  color: "#6B7280",
                }}
              >
                Amount Paid:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: { xs: "14px", md: "16px" },
                  fontWeight: 600,
                  color: "#000",
                }}
              >
                ${paymentData?.amount || 5}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: { xs: "14px", md: "16px" },
                  color: "#6B7280",
                }}
              >
                Date:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: { xs: "14px", md: "16px" },
                  fontWeight: 600,
                  color: "#000",
                }}
              >
                {paymentData?.date || "Oct 23, 2025"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm" sx={{ mt: 8, mb: 8, textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Loading...
          </Typography>
        </Container>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
