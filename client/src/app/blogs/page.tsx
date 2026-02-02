import type { Metadata } from "next";
import { Box, Container, Typography } from "@mui/material";
import { wordpressService } from "../../services/wordpressService";
import BlogsClientWrapper from "@/app/components/blogsComponent/BlogsClientWrapper";

export const metadata: Metadata = {
  title: "Self Score Blog | Personal Growth, Mindfulness & Self Awareness Insights",
  description:
    "Read the Self Score blog for practical tips on self-improvement, happiness, mindfulness, inner peace, personal growth, and spiritual reflection.",
  keywords: [
    "personal growth blog",
    "self improvement articles",
    "mindfulness blog",
    "self awareness blog",
    "happiness tips",
  ],
  openGraph: {
    title: "Self Score Blog | Personal Growth, Mindfulness & Self Awareness Insights",
    description:
      "Read the Self Score blog for practical tips on self-improvement, happiness, mindfulness, inner peace, personal growth, and spiritual reflection.",
    url: "https://selfscore.net/blogs/",
  },
  alternates: {
    canonical: "https://selfscore.net/blogs/",
  },
};
// Server Component - Fetch data at request time (SSR)
export default async function BlogsPage() {
  // Fetch all blog posts from WordPress
  const { posts: blogPosts } = await wordpressService.getAllPosts();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFF",
        py: { xs: 10, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        {/* Page Title */}
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography
            sx={{
              fontWeight: "700",
              fontFamily: "faustina",
              color: "#000",
              mb: 3,
              mt: { xs: 0, md: 4 },
              fontSize: { xs: "2rem", sm: "2.5rem", md: "40px" },
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
