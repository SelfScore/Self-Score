"use client";

import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Pagination,
} from "@mui/material";
import { useState } from "react";
import BlogCard from "../components/blogsComponent/BlogCard";
import { blogPosts } from "../data/blogData";
import SearchIcon from "@mui/icons-material/Search";

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

  // Filter blogs based on search query
  const filteredBlogs = blogPosts.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const endIndex = startIndex + blogsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFF",
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        {/* Page Title */}
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography
            sx={{
              fontFamily: "Faustina",
              fontSize: { xs: "32px", md: "48px" },
              fontWeight: 700,
              color: "#000000",
              mb: 1,
            }}
          >
            Blogs
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: { xs: "14px", md: "16px" },
              fontWeight: 400,
              color: "#6B7280",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Insights, tips, and guidance on your journey to self-discovery and
            personal growth
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: { xs: 4, md: 6 },
          }}
        >
          <TextField
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: "100%",
              maxWidth: "500px",
              "& .MuiOutlinedInput-root": {
                bgcolor: "#FFFFFF",
                borderRadius: "8px",
                height: "48px",
                "& fieldset": {
                  borderColor: "#E5E7EB",
                },
                "&:hover fieldset": {
                  borderColor: "#D1D5DB",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#FF5722",
                },
              },
              "& input": {
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
              },
            }}
          />
        </Box>

        {/* Blog Cards Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: { xs: 3, md: 4 },
            mb: { xs: 4, md: 6 },
          }}
        >
          {currentBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </Box>

        {/* No Results Message */}
        {filteredBlogs.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "18px",
                color: "#6B7280",
              }}
            >
              No articles found matching your search.
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {filteredBlogs.length > blogsPerPage && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: { xs: 4, md: 6 },
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size={window.innerWidth < 600 ? "small" : "medium"}
              sx={{
                "& .MuiPaginationItem-root": {
                  fontFamily: "Source Sans Pro",
                  fontWeight: 500,
                  color: "#6B7280",
                  "&.Mui-selected": {
                    bgcolor: "#FF5722",
                    color: "#FFFFFF",
                    "&:hover": {
                      bgcolor: "#E64A19",
                    },
                  },
                  "&:hover": {
                    bgcolor: "#F3F4F6",
                  },
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
