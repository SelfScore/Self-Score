import { notFound } from "next/navigation";
import BlogDetails from "../../components/blogsComponent/BlogDetails";
import { wordpressService } from "../../../services/wordpressService";

// Server Component - Fetch data at request time (SSR)
export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch the blog post from WordPress
  const blog = await wordpressService.getPostBySlug(slug);

  if (!blog) {
    notFound();
  }

  // Fetch related blogs (get all posts and exclude current one)
  const { posts: allPosts } = await wordpressService.getAllPosts();
  const relatedBlogs = allPosts.filter((b) => b.slug !== slug).slice(0, 2); // Show only 2 related articles

  return <BlogDetails blog={blog} relatedBlogs={relatedBlogs} />;
}
