"use client";

import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Container,
} from "@mui/material";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentService } from "../../../../services/paymentService";
import { authService } from "../../../../services/authService";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function PaymentSuccessContent() {
  const [verifying, setVerifying] = useState(true);
  const [_success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [level, setLevel] = useState<number | null>(null);
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

          // Refresh user data to get updated purchasedLevels
          await authService.getCurrentUser();
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
  }, [searchParams]);

  if (verifying) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8, textAlign: "center" }}>
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
        <Button
          variant="contained"
          onClick={() => router.push("/user/test")}
          fullWidth
        >
          Go to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8, textAlign: "center" }}>
      <CheckCircleIcon sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
        Payment Successful!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        {level
          ? `You have successfully unlocked Level ${level}. You can now take the assessment.`
          : "Your payment has been processed successfully."}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={() => router.push(`/user/test?level=${level || 2}`)}
          sx={{
            bgcolor: "#E87A42",
            "&:hover": { bgcolor: "#D16A35" },
          }}
        >
          Start Level {level || 2} Test
        </Button>
        <Button
          variant="outlined"
          onClick={() => router.push("/user/dashboard")}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
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
