import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetails from "../../components/blogsComponent/BlogDetails";
import { wordpressService } from "../../../services/wordpressService";

// Generate dynamic metadata from WordPress post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await wordpressService.getPostBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      url: `https://selfscore.net/blog/${slug}/`,
      type: "article",
      images: blog.image
        ? [
          {
            url: blog.image,
            alt: blog.title,
          },
        ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      images: blog.image ? [blog.image] : undefined,
    },
    alternates: {
      canonical: `https://selfscore.net/blog/${slug}/`,
    },
  };
}

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
