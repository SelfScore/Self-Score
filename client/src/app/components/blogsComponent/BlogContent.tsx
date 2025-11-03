"use client";

import { Box, Typography, Container, Avatar, Divider } from "@mui/material";
import Image from "next/image";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { BlogPost } from "../../data/blogData";

interface BlogContentProps {
  blog: BlogPost;
}

export default function BlogContent({ blog }: BlogContentProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFFFFF",
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="md">
        {/* Date and Read Time */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: "16px", color: "#6B7280" }} />
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "14px", md: "16px" },
                fontWeight: 400,
                color: "#6B7280",
              }}
            >
              {blog.date}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeIcon sx={{ fontSize: "16px", color: "#6B7280" }} />
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "14px", md: "16px" },
                fontWeight: 400,
                color: "#6B7280",
              }}
            >
              {blog.readTime}
            </Typography>
          </Box>
        </Box>

        {/* Blog Title */}
        <Typography
          sx={{
            fontFamily: "Faustina",
            fontSize: { xs: "28px", md: "40px" },
            fontWeight: 700,
            color: "#000000",
            mb: 3,
            lineHeight: 1.3,
          }}
        >
          {blog.title}
        </Typography>

        {/* Author Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 4,
          }}
        >
          <Avatar
            src={blog.author.avatar}
            alt={blog.author.name}
            sx={{
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
            }}
          />
          <Box>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "16px", md: "18px" },
                fontWeight: 600,
                color: "#000000",
              }}
            >
              {blog.author.name}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "14px", md: "16px" },
                fontWeight: 400,
                color: "#6B7280",
              }}
            >
              {blog.author.role}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Featured Image */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: "250px", sm: "350px", md: "450px" },
            borderRadius: "16px",
            overflow: "hidden",
            mb: 4,
          }}
        >
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </Box>

        {/* WordPress HTML Content */}
        <Box
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "16px", md: "18px" },
            fontWeight: 400,
            color: "#374151",
            lineHeight: 1.8,
            "& p": {
              mb: 2,
            },
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              fontFamily: "Faustina",
              fontWeight: 700,
              color: "#000000",
              mt: 4,
              mb: 2,
            },
            "& h2": {
              fontSize: { xs: "22px", md: "28px" },
            },
            "& h3": {
              fontSize: { xs: "20px", md: "24px" },
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: "8px",
              my: 3,
            },
            "& a": {
              color: "#FF5722",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            },
            "& ul, & ol": {
              pl: 3,
              mb: 2,
            },
            "& li": {
              mb: 1,
            },
            "& blockquote": {
              borderLeft: "4px solid #FF5722",
              pl: 2,
              fontStyle: "italic",
              color: "#4B5563",
              my: 3,
            },
            "& code": {
              backgroundColor: "#F3F4F6",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.9em",
              fontFamily: "monospace",
            },
            "& pre": {
              backgroundColor: "#F3F4F6",
              padding: 2,
              borderRadius: "8px",
              overflow: "auto",
              my: 3,
            },
          }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </Container>
    </Box>
  );
}
