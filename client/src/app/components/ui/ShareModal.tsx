"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState } from "react";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  shareLink: string;
  level?: number;
}

export default function ShareModal({
  open,
  onClose,
  shareLink,
  level,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy link. Please try again.");
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Check out my Self Score Level ${
      level || ""
    } Report! \n\n${shareLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleEmailShare = () => {
    const subject = `My Self Score Level ${level || ""} Report`;
    const body = `Hi,\n\nI wanted to share my Self Score assessment results with you!\n\nView my report here: ${shareLink}\n\nBest regards`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          fontFamily: "Faustina",
          fontSize: "24px",
          fontWeight: 700,
          color: "#2B2B2B",
        }}
      >
        Share Your Report
        <IconButton
          onClick={onClose}
          sx={{
            color: "#6B7280",
            "&:hover": {
              backgroundColor: "#F3F4F6",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        {/* Success Message */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "#ECFDF5",
            borderRadius: "8px",
            border: "1px solid #A7F3D0",
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              color: "#065F46",
              fontFamily: "Source Sans Pro",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: "20px" }} />
            Share link generated successfully!
          </Typography>
        </Box>

        {/* Link TextField with Copy Button */}
        <TextField
          fullWidth
          value={shareLink}
          variant="outlined"
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleCopy}
                  edge="end"
                  sx={{
                    color: copied ? "#10B981" : "#6B7280",
                    "&:hover": {
                      backgroundColor: "#F3F4F6",
                    },
                  }}
                >
                  {copied ? (
                    <CheckCircleIcon sx={{ fontSize: "24px" }} />
                  ) : (
                    <ContentCopyIcon sx={{ fontSize: "24px" }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E5E7EB",
              },
            },
          }}
          sx={{ mb: 3 }}
        />

        {/* Share Description */}
        <Typography
          sx={{
            fontSize: "14px",
            color: "#6B7280",
            fontFamily: "Source Sans Pro",
            mb: 3,
            textAlign: "center",
          }}
        >
          Share this link with anyone to let them view and download your report
        </Typography>

        {/* Share Options */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
          }}
        >
          {/* Copy Button */}
          <Button
            variant="contained"
            startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
            onClick={handleCopy}
            sx={{
              flex: 1,
              backgroundColor: copied ? "#10B981" : "#005F73",
              color: "white",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: 600,
              fontFamily: "Source Sans Pro",
              textTransform: "none",
              "&:hover": {
                backgroundColor: copied ? "#059669" : "#004A5C",
              },
            }}
          >
            {copied ? "Copied!" : "Copy Link"}
          </Button>

          {/* WhatsApp Button */}
          <IconButton
            onClick={handleWhatsAppShare}
            sx={{
              width: "56px",
              height: "56px",
              backgroundColor: "#25D366",
              color: "white",
              borderRadius: "12px",
              "&:hover": {
                backgroundColor: "#20BA5A",
              },
            }}
          >
            <WhatsAppIcon sx={{ fontSize: "28px" }} />
          </IconButton>

          {/* Email Button */}
          <IconButton
            onClick={handleEmailShare}
            sx={{
              width: "56px",
              height: "56px",
              backgroundColor: "#EA4335",
              color: "white",
              borderRadius: "12px",
              "&:hover": {
                backgroundColor: "#D33426",
              },
            }}
          >
            <EmailIcon sx={{ fontSize: "28px" }} />
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
