"use client";

import { Box, Typography, Container, IconButton, Divider } from "@mui/material";
import { useState } from "react";
import BlogContent from "./BlogContent";
import BlogCard from "./BlogCard";
import CustomAccordion from "../ui/Accordian";
import { BlogPost } from "../../data/blogData";
import ShareIcon from "@mui/icons-material/Share";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

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
    null
  );

  const handleAccordionChange = (id: string) => {
    setExpandedAccordion(expandedAccordion === id ? null : id);
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
      default:
        // Copy link to clipboard
        navigator.clipboard.writeText(url);
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
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            sx={{
              fontFamily: "Faustina",
              fontSize: { xs: "28px", md: "40px" },
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
              fontSize: { xs: "28px", md: "40px" },
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
    </Box>
  );
}
