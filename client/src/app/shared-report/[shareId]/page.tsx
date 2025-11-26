"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Button,
} from "@mui/material";
import { questionsApi } from "../../../services/questionsService";
import DownloadIcon from "@mui/icons-material/Download";
import { generateReportHTML } from "../../user/report/reportGenerator";
import { generatePDFFromHTML } from "../../user/report/utils/pdfGenerator";
import { UserReportData } from "../../user/report/types";
import PersonIcon from '@mui/icons-material/Person';
// import PhoneIcon from '@mui/icons-material/Phone';
// import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function SharedReportPage() {
  const params = useParams();
  const shareId = params.shareId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [reportData, setReportData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchSharedReport = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await questionsApi.getSharedReport(shareId);

        if (!response.success) {
          setError("Shared report not found or link is invalid");
          return;
        }

        setReportData(response.data);
      } catch (err) {
        console.error("Error fetching shared report:", err);
        setError("Failed to load shared report");
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedReport();
    }
  }, [shareId]);

  const handleDownloadReport = async () => {
    if (!reportData) return;

    try {
      setDownloading(true);

      // Prepare report data
      const userData: UserReportData = {
        username: reportData.user?.username || "User",
        email: reportData.user?.email || "",
        phoneNumber:
          reportData.user?.countryCode && reportData.user?.phoneNumber
            ? `+${reportData.user.countryCode}${reportData.user.phoneNumber}`
            : reportData.user?.phoneNumber || "",
        reportDate: new Date(reportData.submittedAt).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        ),
        level: reportData.level,
        score: reportData.score,
        maxScore: 900,
      };

      // Generate HTML and PDF
      const htmlContent = generateReportHTML(userData);
      const filename = `SelfScore_Level${reportData.level}_Report_${
        userData.username
      }_${new Date().toISOString().split("T")[0]}.pdf`;

      await generatePDFFromHTML(htmlContent, filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          gap={2}
        >
          <CircularProgress size={50} sx={{ color: "#FF4F00" }} />
          <Typography variant="h6" color="text.secondary">
            Loading shared report...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          gap={2}
        >
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!reportData) {
    return null;
  }

  // Calculate score percentage for circular progress
  const scorePercentage = (reportData.score / 900) * 100;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFA", py: 4 }}>
      <Container maxWidth="md" sx={{ mt: 8 }}>
        {/* Cover Page */}
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: "16px",
            textAlign: "center",
            background: "linear-gradient(135deg, #005F73 0%, #0C677A 100%)",
            color: "white",
            mb: 4,
          }}
        >
          <Typography
            sx={{
              fontSize: "48px",
              fontWeight: 700,
              fontFamily: "Faustina",
              mb: 2,
            }}
          >
            Self Score Report
          </Typography>
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: 600,
              fontFamily: "Faustina",
              mb: 1,
            }}
          >
            Level {reportData.level}
          </Typography>
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 400,
              fontFamily: "Source Sans Pro",
              opacity: 0.9,
            }}
          >
            Assessment Report
          </Typography>
        </Paper>

        {/* Score Display */}
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: "16px",
            mb: 4,
            textAlign: "center",
          }}
        >
          {/* User Details */}
          <Box
            sx={{
              mb: 4,
              pb: 4,
              borderBottom: "2px solid #E5E7EB",
              backgroundColor: "#F9FAFB",
              borderRadius: "12px",
              p: 3,
            }}
          >
            {/* First Row: Username (with user icon) and Phone */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                maxWidth: "600px",
                mx: "auto",
                alignItems: "center",
              }}
            >
              {/* Username */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    backgroundColor: "transparent",
                    border: "1px solid #005F73",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    color: "#005F73",
                  }}
                >
                  <PersonIcon />    
                </Box>
                <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#000000",
                      fontFamily: "Source Sans Pro",
                      fontWeight: 500,
                    //   mb: 0,
                    }}
                  >
                    Name
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "18px",
                      color: "#000000",
                      fontFamily: "Source Sans Pro",
                      fontWeight: 600,
                      wordBreak: "break-word",
                    }}
                  >
                    {reportData.user?.username || "User"}
                  </Typography>
                </Box>
              </Box>

              {/* Phone */}
              {/* <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    backgroundColor: "transparent",
                    border: "1px solid #005F73",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    color: "#005F73",
                  }}
                >
                    <PhoneIcon />
                </Box>
                <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#6B7280",
                      fontFamily: "Source Sans Pro",
                      fontWeight: 500,
                    //   mb: 0.25,
                    }}
                  >
                    Phone
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "18px",
                      color: "#000000",
                      fontFamily: "Source Sans Pro",
                      fontWeight: 600,
                    }}
                  >
                    {(reportData.user?.countryCode &&
                      `+${reportData.user.countryCode} `) ||
                      ""}
                    {reportData.user?.phoneNumber || "-"}
                  </Typography>
                </Box>
              </Box> */}

              {/* Second Row: Email and Report Date */}
              {/* Email */}
              {/* <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    backgroundColor: "transparent",
                    border: "1px solid #005F73",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    color: "#005F73",
                  }}
                >
                    <EmailIcon />
                </Box>
                <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#6B7280",
                      fontFamily: "Source Sans Pro",
                      fontWeight: 500,
                    //   mb: 0.25,
                    }}
                  >
                    Email
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "18px",
                      color: "#000000",
                      fontFamily: "Source Sans Pro",
                      fontWeight: 600,
                      wordBreak: "break-word",
                    }}
                  >
                    {reportData.user?.email || "-"}
                  </Typography>
                </Box>
              </Box> */}

              {/* Report Date */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    backgroundColor: "transparent",
                    border: "1px solid #005F73",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                    <CalendarMonthIcon style={{ color: "#005F73" }} />
                </Box>
                <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#6B7280",
                      fontFamily: "Source Sans Pro",
                      fontWeight: 500,
                    //   mb: 0.25,
                    }}
                  >
                    Report Date
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "18px",
                      color: "#000000",
                      fontFamily: "Source Sans Pro",
                      fontWeight: 600,
                    }}
                  >
                    {new Date(reportData.submittedAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Typography
            sx={{
              fontSize: "28px",
              fontWeight: 700,
              fontFamily: "Faustina",
              mb: 4,
              color: "#2B2B2B",
            }}
          >
            Assessment Score
          </Typography>

          {/* Circular Score Display */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <Box sx={{ position: "relative", width: 243, height: 243 }}>
              <svg
                width="243"
                height="243"
                viewBox="0 0 243 243"
                style={{ transform: "rotate(-90deg)" }}
              >
                {/* Background circle */}
                <circle
                  cx="121.5"
                  cy="121.5"
                  r="100"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                />
                {/* Progress circle */}
                <circle
                  cx="121.5"
                  cy="121.5"
                  r="100"
                  fill="none"
                  stroke="#508B28"
                  strokeWidth="16"
                  strokeDasharray={`${
                    (scorePercentage / 100) * (2 * Math.PI * 100)
                  } ${2 * Math.PI * 100}`}
                  strokeLinecap="round"
                  style={{ transition: "all 1s" }}
                />
              </svg>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "67px",
                    fontFamily: "Source Sans Pro",
                    fontWeight: 700,
                    color: "#1F2937",
                  }}
                >
                  {reportData.score}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "24px",
                    color: "#6B7280",
                  }}
                >
                  out of 900
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography
            sx={{
              fontSize: "16px",
              color: "#6B7280",
              fontFamily: "Source Sans Pro",
              mb: 4,
            }}
          >
            Completed on{" "}
            {new Date(reportData.submittedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>

          {/* Download Button */}
          <Button
            variant="contained"
            size="large"
            startIcon={
              downloading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DownloadIcon />
              )
            }
            onClick={handleDownloadReport}
            disabled={downloading}
            sx={{
              backgroundColor: "#FF4F00",
              color: "white",
              borderRadius: "12px",
              padding: "12px 32px",
              fontSize: "18px",
              fontWeight: 600,
              fontFamily: "Source Sans Pro",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#E64500",
              },
              "&:disabled": {
                backgroundColor: "#FFB899",
                color: "white",
              },
            }}
          >
            {downloading ? "Generating PDF..." : "Download Full Report"}
          </Button>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#6B7280",
              fontFamily: "Source Sans Pro",
            }}
          >
            Want to take your own Self Score assessment?
          </Typography>
          <Button
            variant="outlined"
            size="medium"
            onClick={() => (window.location.href = "/")}
            sx={{
              mt: 2,
              borderColor: "#005F73",
              color: "#005F73",
              borderRadius: "8px",
              padding: "8px 24px",
              fontSize: "16px",
              fontWeight: 600,
              fontFamily: "Source Sans Pro",
              textTransform: "none",
              "&:hover": {
                borderColor: "#0C677A",
                backgroundColor: "rgba(0, 95, 115, 0.04)",
              },
            }}
          >
            Start Your Assessment
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
