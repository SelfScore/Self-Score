"use client";

import {
  Box,
  Typography,
  Container,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import BlogContent from "./BlogContent";
import BlogCard from "./BlogCard";
import CustomAccordion from "../ui/Accordian";
import { BlogPost } from "../../data/blogData";
import ShareIcon from "@mui/icons-material/Share";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface BlogDetailsProps {
  blog: BlogPost;
  relatedBlogs: BlogPost[];
}

// FAQ data - you can move this to a separate file later
const faqData = [
  {
    id: "1",
    question: "What is personality assessment and how does it works?",
    answer:
      "A personality assessment is a tool used to evaluate an individual's personality traits, characteristics, and behaviors. It works by asking a series of questions or presenting scenarios that help identify patterns in how a person thinks, feels, and acts. The results provide insights into personal strengths, weaknesses, and preferences.",
  },
  {
    id: "2",
    question: "What is personality assessment and how does it works?",
    answer:
      "A personality assessment is a tool used to evaluate an individual's personality traits, characteristics, and behaviors. It works by asking a series of questions or presenting scenarios that help identify patterns in how a person thinks, feels, and acts. The results provide insights into personal strengths, weaknesses, and preferences.",
  },
  {
    id: "3",
    question: "What is personality assessment and how does it works?",
    answer:
      "A personality assessment is a tool used to evaluate an individual's personality traits, characteristics, and behaviors. It works by asking a series of questions or presenting scenarios that help identify patterns in how a person thinks, feels, and acts. The results provide insights into personal strengths, weaknesses, and preferences.",
  },
  {
    id: "4",
    question: "What is personality assessment and how does it works?",
    answer:
      "A personality assessment is a tool used to evaluate an individual's personality traits, characteristics, and behaviors. It works by asking a series of questions or presenting scenarios that help identify patterns in how a person thinks, feels, and acts. The results provide insights into personal strengths, weaknesses, and preferences.",
  },
];

export default function BlogDetails({ blog, relatedBlogs }: BlogDetailsProps) {
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(
    "1"
  );
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  const handleAccordionChange = (id: string) => {
    setExpandedAccordion(expandedAccordion === id ? null : id);
  };

  const handleCopy = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setShowCopiedAlert(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy link. Please try again.");
    }
  };

  const handleCloseAlert = () => {
    setShowCopiedAlert(false);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = blog.title;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(title)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "whatsapp":
        const message = `Check out this article: ${title}\n\n${url}`;
        window.open(
          `https://wa.me/?text=${encodeURIComponent(message)}`,
          "_blank"
        );
        break;
      case "email":
        const subject = `Check out: ${title}`;
        const body = `Hi,\n\nI thought you might find this article interesting:\n\n${title}\n\n${url}\n\nBest regards`;
        window.location.href = `mailto:?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(body)}`;
        break;
      default:
        setShareModalOpen(true);
        break;
    }
  };

  return (
    <Box sx={{ bgcolor: "#FFFFFF", paddingTop: { xs: 2, md: 8 } }}>
      {/* Blog Content */}
      <BlogContent blog={blog} />

      {/* FAQ Section */}
      <Box
        sx={{
          bgcolor: "#FFF",
          py: { xs: 6, md: 0 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            sx={{
              fontFamily: "Faustina",
              fontSize: { xs: "24px", md: "24px" },
              fontWeight: 700,
              color: "#000000",
              mb: { xs: 4, md: 6 },
            }}
          >
            FAQ
          </Typography>

          {faqData.map((faq) => (
            <CustomAccordion
              key={faq.id}
              id={faq.id}
              question={faq.question}
              answer={faq.answer}
              expanded={expandedAccordion === faq.id}
              onChange={handleAccordionChange}
            />
          ))}
        </Container>
      </Box>

      {/* horizontal line  */}
      <Divider sx={{ my: 0, maxWidth: "850px", mx: "auto" }} />
      {/* Share Section */}
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          py: { xs: 4, md: 4 },
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: { xs: "20px", md: "24px" },
                fontWeight: 700,
                color: "#000000",
              }}
            >
              Share this article
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              {/* Share Icon */}
              <IconButton
                onClick={() => handleShare("copy")}
                sx={{
                  bgcolor: "#F3F4F6",
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  "&:hover": {
                    bgcolor: "#E5E7EB",
                  },
                }}
              >
                <ShareIcon sx={{ fontSize: "20px", color: "#6B7280" }} />
              </IconButton>

              {/* Facebook */}
              <IconButton
                onClick={() => handleShare("facebook")}
                sx={{
                  bgcolor: "#1877F2",
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  "&:hover": {
                    bgcolor: "#1565C0",
                  },
                }}
              >
                <FacebookIcon sx={{ fontSize: "20px", color: "#FFFFFF" }} />
              </IconButton>

              {/* Twitter */}
              <IconButton
                onClick={() => handleShare("twitter")}
                sx={{
                  bgcolor: "#1DA1F2",
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  "&:hover": {
                    bgcolor: "#1A8CD8",
                  },
                }}
              >
                <TwitterIcon sx={{ fontSize: "20px", color: "#FFFFFF" }} />
              </IconButton>

              {/* LinkedIn */}
              <IconButton
                onClick={() => handleShare("linkedin")}
                sx={{
                  bgcolor: "#0A66C2",
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  "&:hover": {
                    bgcolor: "#004182",
                  },
                }}
              >
                <LinkedInIcon sx={{ fontSize: "20px", color: "#FFFFFF" }} />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* horizontal line  */}
      <Divider sx={{ my: 0, maxWidth: "850px", mx: "auto" }} />

      {/* Related Articles Section */}
      <Box
        sx={{
          bgcolor: "#FFF",
          py: { xs: 6, md: 10 },
          maxWidth: "850px",
          mx: "auto",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            sx={{
              fontFamily: "Faustina",
              fontSize: { xs: "24px", md: "24px" },
              fontWeight: 700,
              color: "#000000",
              mb: { xs: 4, md: 6 },
            }}
          >
            Related Articles
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },
              gap: { xs: 3, md: 4 },
            }}
          >
            {relatedBlogs.map((relatedBlog) => (
              <BlogCard key={relatedBlog.id} blog={relatedBlog} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Share Modal */}
      <Dialog
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
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
          Share this Article
          <IconButton
            onClick={() => setShareModalOpen(false)}
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
              Share link ready!
            </Typography>
          </Box>

          {/* Link TextField with Copy Button */}
          <TextField
            fullWidth
            value={window.location.href}
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
            Share this article with your friends and colleagues
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
              onClick={() => handleShare("whatsapp")}
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
              onClick={() => handleShare("email")}
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

      {/* Snackbar for copy confirmation */}
      <Snackbar
        open={showCopiedAlert}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="success"
          sx={{
            width: "100%",
            bgcolor: "#10B981",
            color: "#FFFFFF",
            "& .MuiAlert-icon": {
              color: "#FFFFFF",
            },
          }}
        >
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
