"use client";

import { useParams, notFound } from "next/navigation";
import BlogDetails from "../../components/blogsComponent/BlogDetails";
import { getBlogBySlug, blogPosts } from "../../data/blogData";

export default function BlogPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  // Get related blogs (excluding current blog)
  const relatedBlogs = blogPosts.filter((b) => b.slug !== slug).slice(0, 2); // Show only 2 related articles

  return <BlogDetails blog={blog} relatedBlogs={relatedBlogs} />;
}
