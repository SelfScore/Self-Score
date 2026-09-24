import type { Metadata } from "next";
import { Box, Container, Typography } from "@mui/material";
import { wordpressService } from "../../services/wordpressService";
import BlogsClientWrapper from "@/app/components/blogsComponent/BlogsClientWrapper";

// Ensure latest WordPress posts are fetched on each request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Self Score Blog & Newsletter | Personal Growth, Mindfulness & Self Awareness Insights",
  description:
    "Read the Self Score blog and newsletter for practical tips on self-improvement, happiness, mindfulness, inner peace, personal growth, and spiritual reflection.",
  keywords: [
    "personal growth blog",
    "self improvement articles",
    "mindfulness blog",
    "self awareness blog",
    "happiness tips",
    "newsletter",
  ],
  openGraph: {
    title:
      "Self Score Blog & Newsletter | Personal Growth, Mindfulness & Self Awareness Insights",
    description:
      "Read the Self Score blog and newsletter for practical tips on self-improvement, happiness, mindfulness, inner peace, personal growth, and spiritual reflection.",
    url: "https://www.selfscore.net/blogs/",
  },
  alternates: {
    canonical: "https://www.selfscore.net/blogs/",
  },
};

// Server Component - Fetch initial batch at request time (SSR)
export default async function BlogsPage() {
  // Fetch initial 6 blog posts from WordPress for "blogs" tab
  const initialData = await wordpressService.getPosts({
    page: 1,
    perPage: 6,
    type: "blogs",
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFF",
        py: { xs: 8, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        {/* Page Title */}
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Typography
            sx={{
              fontWeight: "700",
              fontFamily: "faustina",
              color: "#000",
              mb: 2,
              mt: { xs: 0, md: 4 },
              fontSize: { xs: "2rem", sm: "2.5rem", md: "40px" },
            }}
          >
            Blogs & Newsletter
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

        {/* Client-side wrapper with category chips, search, and infinite scroll */}
        <BlogsClientWrapper
          initialPosts={initialData.posts}
          initialTotal={initialData.total}
          initialHasMore={initialData.hasMore}
          initialType="blogs"
        />
      </Container>
    </Box>
  );
}

