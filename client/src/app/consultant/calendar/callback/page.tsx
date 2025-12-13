"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

function CalendarCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state"); // consultantId
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setMessage(`Authentication error: ${error}`);
        setTimeout(() => {
          router.push("/consultant/register?step=5");
        }, 3000);
        return;
      }

      if (!code || !state) {
        setStatus("error");
        setMessage("Missing authorization code or state");
        setTimeout(() => {
          router.push("/consultant/register?step=5");
        }, 3000);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/google-calendar/callback?code=${code}&state=${state}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("Google Calendar connected successfully!");

          // Update sessionStorage to keep user on Step 5
          sessionStorage.setItem("consultantCurrentStep", "5");

          // Redirect back to registration Step 5 after 2 seconds
          setTimeout(() => {
            router.push("/consultant/register?step=5");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to connect calendar");
          setTimeout(() => {
            router.push("/consultant/register?step=5");
          }, 3000);
        }
      } catch (error) {
        console.error("Error handling callback:", error);
        setStatus("error");
        setMessage("Failed to process calendar connection");
        setTimeout(() => {
          router.push("/consultant/register?step=5");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F9F9F9",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: "12px",
            p: 6,
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {status === "loading" && (
            <>
              <CircularProgress sx={{ color: "#005F73", mb: 3 }} size={60} />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "Faustina",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#1A1A1A",
                  mb: 2,
                }}
              >
                Connecting Calendar...
              </Typography>
              <Typography sx={{ color: "#666", fontSize: "14px" }}>
                Please wait while we connect your Google Calendar
              </Typography>
            </>
          )}

          {status === "success" && (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "#E8F5E9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Typography sx={{ fontSize: "48px", color: "#4CAF50" }}>
                  ✓
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "Faustina",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#1A1A1A",
                  mb: 2,
                }}
              >
                Calendar Connected!
              </Typography>
              <Typography sx={{ color: "#666", fontSize: "14px", mb: 3 }}>
                {message}
              </Typography>
              <Typography sx={{ color: "#999", fontSize: "12px" }}>
                Redirecting to dashboard...
              </Typography>
            </>
          )}

          {status === "error" && (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "#FFEBEE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Typography sx={{ fontSize: "48px", color: "#F44336" }}>
                  ✕
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "Faustina",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#1A1A1A",
                  mb: 2,
                }}
              >
                Connection Failed
              </Typography>
              <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
                {message}
              </Alert>
              <Typography sx={{ color: "#999", fontSize: "12px" }}>
                Redirecting to dashboard...
              </Typography>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default function CalendarCallbackPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F9F9F9",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <CalendarCallbackContent />
    </Suspense>
  );
}
