"use client";

import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { UserReportData } from "../../user/report/types";
import { generateReportHTML } from "../../user/report/reportGenerator";
import {
  generatePDFFromHTML,
  generateReportFilename,
} from "../../user/report/utils/pdfGenerator";

interface DownloadReportButtonProps {
  userData: UserReportData;
  variant?: "contained" | "outlined" | "text";
  fullWidth?: boolean;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

export default function DownloadReportButton({
  userData,
  variant = "outlined",
  fullWidth = false,
  size = "medium",
  disabled = false,
}: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);

      // Generate HTML
      const htmlContent = generateReportHTML(userData);

      // Generate filename
      const filename = generateReportFilename(userData);

      // Generate and download PDF
      await generatePDFFromHTML(htmlContent, filename, (progressValue) => {
        setProgress(Math.round(progressValue));
      });
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      startIcon={
        isGenerating ? <CircularProgress size={20} /> : <DownloadIcon />
      }
      onClick={handleDownload}
      disabled={disabled || isGenerating}
      sx={{
        background: "#005F73",
        color: "white",
        borderRadius: "16px",
        padding: "12px 12px",
        fontSize: "16px",
        fontWeight: "400",
        height: "40px",
        textTransform: "none",
        "&:hover": {
          background: "#004A5C",
        },
        "&:disabled": {
          background: "#CCCCCC",
          color: "#666666",
        },
      }}
    >
      {isGenerating ? `Generating... ${progress}%` : "Download Report"}
    </Button>
  );
}
