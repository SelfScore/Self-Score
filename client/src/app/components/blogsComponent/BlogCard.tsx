"use client";

import { Box, Typography, Card, CardMedia, CardContent } from "@mui/material";
import { useRouter } from "next/navigation";
import { BlogPost } from "../../data/blogData";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface BlogCardProps {
  blog: BlogPost;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const router = useRouter();

  const handleReadMore = () => {
    router.push(`/blog/${blog.slug}`);
  };

  return (
    <Card
      sx={{
        maxWidth: "413px",
        maxHeight: "443px",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #3A3A3A4D",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        cursor: "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        },
      }}
      onClick={handleReadMore}
    >
      {/* Blog Image */}
      <Box
        sx={{
          maxHeight: "172.9375px",
          height: "172.9375px",
          overflow: "hidden",
        }}
      >
        <CardMedia
          component="img"
          image={blog.image}
          alt={blog.title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      {/* Blog Content */}
      <CardContent
        sx={{
          px: { xs: 2.5, md: 3 },
          py: { xs: 2.5, md: 3 },
          bgcolor: "#FFFFFF",
          height: "calc(443px - 172.9375px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Read Time */}
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "14px",
            fontWeight: 400,
            color: "#6B7280",
            mb: 1.5,
          }}
        >
          {blog.readTime}
        </Typography>

        {/* Title */}
        <Typography
          sx={{
            fontFamily: "Faustina",
            fontSize: "20px",
            fontWeight: 700,
            color: "#000000",
            mb: 1.5,
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {blog.title}
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "14px",
            fontWeight: 400,
            color: "#6B7280",
            mb: 2,
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {blog.description}
        </Typography>

        {/* Footer - Date and Read More */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 400,
              color: "#6B7280",
            }}
          >
            {blog.date}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              cursor: "pointer",
              "&:hover": {
                "& .read-more-text": {
                  textDecoration: "underline",
                },
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleReadMore();
            }}
          >
            <Typography
              className="read-more-text"
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
                fontWeight: 600,
                color: "#FF5722",
              }}
            >
              Read More
            </Typography>
            <ArrowForwardIcon
              sx={{
                fontSize: "16px",
                color: "#FF5722",
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
