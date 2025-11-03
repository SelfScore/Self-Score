import { Box, Container, Typography } from "@mui/material";
import { wordpressService } from "../../services/wordpressService";
import BlogsClientWrapper from "@/app/components/blogsComponent/BlogsClientWrapper";

// Server Component - Fetch data at request time (SSR)
export default async function BlogsPage() {
  // Fetch all blog posts from WordPress
  const { posts: blogPosts } = await wordpressService.getAllPosts();

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

        {/* Client-side wrapper for search and pagination */}
        <BlogsClientWrapper initialBlogs={blogPosts} />
      </Container>
    </Box>
  );
}
