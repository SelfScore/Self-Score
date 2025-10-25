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

        {/* Introduction */}
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "16px", md: "18px" },
            fontWeight: 400,
            color: "#374151",
            lineHeight: 1.8,
            mb: 4,
          }}
        >
          {blog.content.introduction}
        </Typography>

        {/* Sections */}
        {blog.content.sections.map((section, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: { xs: "22px", md: "28px" },
                fontWeight: 700,
                color: "#000000",
                mb: 2,
              }}
            >
              {section.heading}
            </Typography>
            {section.paragraphs.map((paragraph, pIndex) => (
              <Typography
                key={pIndex}
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: { xs: "16px", md: "18px" },
                  fontWeight: 400,
                  color: "#374151",
                  lineHeight: 1.8,
                  mb: 2,
                }}
              >
                {paragraph}
              </Typography>
            ))}
          </Box>
        ))}

        {/* Conclusion */}
        <Box sx={{ mt: 6 }}>
          <Typography
            sx={{
              fontFamily: "Faustina",
              fontSize: { xs: "22px", md: "28px" },
              fontWeight: 700,
              color: "#000000",
              mb: 2,
            }}
          >
            {blog.content.conclusion.heading}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: { xs: "16px", md: "18px" },
              fontWeight: 400,
              color: "#374151",
              lineHeight: 1.8,
            }}
          >
            {blog.content.conclusion.content}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
