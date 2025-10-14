"use client";

import { Box, Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import CancelIcon from "@mui/icons-material/Cancel";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8, textAlign: "center" }}>
      <CancelIcon sx={{ fontSize: 80, color: "warning.main", mb: 2 }} />
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
        Payment Cancelled
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        Your payment was cancelled. No charges have been made to your account.
      </Typography>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={() => router.push("/user/test")}
          sx={{
            bgcolor: "#E87A42",
            "&:hover": { bgcolor: "#D16A35" },
          }}
        >
          Back to Tests
        </Button>
        <Button variant="outlined" onClick={() => router.push("/")}>
          Go to Home
        </Button>
      </Box>
    </Container>
  );
}
