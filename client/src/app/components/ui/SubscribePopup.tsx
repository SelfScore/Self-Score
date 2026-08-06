"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ButtonSelfScore from "./ButtonSelfScore";
import api from "../../../lib/api";

const POPUP_SESSION_KEY = "selfscore_subscribe_popup_dismissed";
const DELAY_MS = 15000; // 15 seconds

export default function SubscribePopup() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(POPUP_SESSION_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem(POPUP_SESSION_KEY, "1");
  };

  const handleSubmit = async () => {
    setError("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const response: any = await api.post("/api/newsletter/subscribe", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      if (response.success) {
        setSuccess(true);
        // Auto-close after 3s
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        setError(response.message || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit timeout={400}>
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 16, md: 24 },
          left: { xs: 12, md: 24 },
          zIndex: 1400,
          width: { xs: "calc(100vw - 24px)", sm: "360px" },
          maxWidth: "360px",
          borderRadius: "20px",
          background:
            "linear-gradient(145deg, #F7EFE8 0%, #EBD5C4 50%, #D4E9EF 100%)",
          border: "1px solid #E6B79C99",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header accent bar */}
        {/* <Box
          sx={{
            height: "4px",
            background: "linear-gradient(90deg, #005F73 0%, #FF4F00 100%)",
          }}
        /> */}

        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          {/* Close button */}
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "#666",
              backgroundColor: "rgba(255,255,255,0.6)",
              width: 28,
              height: 28,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.9)",
                color: "#333",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>

          {!success ? (
            <>
              {/* Icon + Heading */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                  pr: 3,
                }}
              >
                <AutoAwesomeIcon sx={{ color: "#005F73", fontSize: 22 }} />
                <Typography
                  sx={{
                    fontFamily: "Faustina",
                    fontWeight: 700,
                    fontSize: "17px",
                    color: "#005F73",
                    lineHeight: 1.3,
                  }}
                >
                  Know Yourself Better
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  color: "#2B2B2B",
                  lineHeight: 1.5,
                  mb: 2,
                  opacity: 0.85,
                }}
              >
                Get practical insights, thoughtful tips, and the latest from SelfScore to support your journey of self-discovery and personal growth.
              </Typography>

              {/* Error */}
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 1.5,
                    py: 0.5,
                    fontSize: "13px",
                    borderRadius: "10px",
                    fontFamily: "Source Sans Pro",
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Name field */}
              <TextField
                fullWidth
                placeholder="Your Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                size="small"
                sx={{
                  mb: 1.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "rgba(255,255,255,0.75)",
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                    "& fieldset": { borderColor: "rgba(0,95,115,0.25)" },
                    "&:hover fieldset": { borderColor: "rgba(0,95,115,0.4)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#005F73",
                      borderWidth: "1.5px",
                    },
                  },
                  "& input::placeholder": {
                    color: "#888",
                    opacity: 1,
                  },
                }}
              />

              {/* Email field */}
              <TextField
                fullWidth
                placeholder="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "rgba(255,255,255,0.75)",
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                    "& fieldset": { borderColor: "rgba(0,95,115,0.25)" },
                    "&:hover fieldset": { borderColor: "rgba(0,95,115,0.4)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#005F73",
                      borderWidth: "1.5px",
                    },
                  },
                  "& input::placeholder": {
                    color: "#888",
                    opacity: 1,
                  },
                }}
              />

              {/* Submit button */}
              <ButtonSelfScore
                onClick={handleSubmit}
                text={loading ? "Subscribing..." : "Get Free Insights →"}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                  ) : undefined
                }
                fullWidth
                fontSize="15px"
                height={42}
              />

              
            </>
          ) : (
            /* Success state */
            <Box sx={{ textAlign: "center", py: 1 }}>
              <Typography
                sx={{
                  fontSize: "32px",
                  mb: 1,
                }}
              >
                🙏
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Faustina",
                  fontWeight: 700,
                  fontSize: "18px",
                  color: "#005F73",
                  mb: 1,
                }}
              >
                You're in!
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  color: "#2B2B2B",
                  lineHeight: 1.5,
                  opacity: 0.85,
                }}
              >
                Check your inbox for a welcome message. Your journey toward
                self-awareness begins now.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Slide>
  );
}
