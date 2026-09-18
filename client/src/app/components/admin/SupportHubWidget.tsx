"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { Box, Tooltip } from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CloseIcon from "@mui/icons-material/Close";

declare global {
  interface Window {
    SupportHub?: {
      open: () => void;
      close: () => void;
      toggle: () => void;
      isOpen: () => boolean;
    };
  }
}

interface SupportHubWidgetProps {
  projectKey?: string;
  buttonColor?: string;
  hoverColor?: string;
}

export default function SupportHubWidget({
  projectKey = "proj_b72df8b88b9e5a38",
  buttonColor = "#FF4F00",
  hoverColor = "#E04500",
}: SupportHubWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SUPPORT_HUB_CLOSE") {
        setIsOpen(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      // Clean up widget iframe when navigating away from admin
      const iframe = document.getElementById("support-hub-iframe");
      if (iframe) {
        iframe.remove();
      }
    };
  }, []);

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.SupportHub) {
      window.SupportHub.toggle();
      setIsOpen(window.SupportHub.isOpen ? window.SupportHub.isOpen() : !isOpen);
    }
  };

  return (
    <>
      <Script
        id="support-hub-widget-script"
        src="https://cu-support-ticket-system-widget.pages.dev/widget.js"
        data-project-key={projectKey}
        data-position="bottom-right"
        data-button-color={buttonColor}
        data-border-radius="28px"
        data-hide-launcher="true"
        strategy="afterInteractive"
      />

      <Tooltip title={isOpen ? "Close Support" : "Need Help? Contact Support"} placement="left" arrow>
        <Box
          component="button"
          data-support-trigger="true"
          onClick={handleToggle}
          aria-label="Support Desk"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 2147483640,
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: buttonColor,
            color: "#FFFFFF",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(255, 79, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.12)",
            transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            outline: "none",
            "&:hover": {
              backgroundColor: hoverColor,
              transform: "scale(1.08)",
              boxShadow: "0 6px 20px rgba(255, 79, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.16)",
            },
            "&:active": {
              transform: "scale(0.96)",
            },
          }}
        >
          {isOpen ? (
            <CloseIcon sx={{ fontSize: 26, transition: "transform 0.2s ease" }} />
          ) : (
            <SupportAgentIcon sx={{ fontSize: 28, transition: "transform 0.2s ease" }} />
          )}
        </Box>
      </Tooltip>
    </>
  );
}
