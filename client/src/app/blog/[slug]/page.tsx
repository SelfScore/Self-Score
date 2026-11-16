import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import BlogDetails from "../../components/blogsComponent/BlogDetails";
import JsonLd, { SITE_URL, breadcrumbSchema } from "../../components/seo/JsonLd";
import { wordpressService } from "../../../services/wordpressService";

// Rendered on first request, then cached and refreshed in the background every 5 minutes
// (was force-dynamic: every visit re-fetched WordPress, ~2.9 s to first byte)
export const revalidate = 300;
export const dynamicParams = true;

// No posts pre-built at deploy; each is rendered on first visit, then cached (ISR)
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return [];
}

// generateMetadata and the page share one WordPress request per render
// throwOnError: a WordPress outage keeps serving the cached page instead of caching a 404
const getPost = cache((slug: string) => wordpressService.getPostBySlug(slug, { throwOnError: true }));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPost(slug);

  if (!blog) {
    return { title: "Blog Post Not Found", robots: { index: false } };
  }

  const url = `${SITE_URL}/blog/${slug}/`;
  return {
    title: blog.title,
    description: blog.description,
    authors: [{ name: blog.author.name }],
    openGraph: {
      title: blog.title,
      description: blog.description,
      url,
      type: "article",
      publishedTime: blog.publishedAt,
      modifiedTime: blog.modifiedAt,
      authors: [blog.author.name],
      section: blog.categories?.[0]?.name,
      tags: blog.categories?.map((c) => c.name),
      images: blog.image ? [{ url: blog.image, alt: blog.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      images: blog.image ? [blog.image] : undefined,
    },
    alternates: { canonical: url },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getPost(slug);

  if (!blog) {
    notFound();
  }

  // Same-category articles first (was: the first two posts, whatever the topic)
  const relatedBlogs = await wordpressService.getRelatedPosts(blog, 2);

  const url = `${SITE_URL}/blog/${slug}/`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: blog.title,
    description: blog.description,
    image: blog.image ? [blog.image] : undefined,
    datePublished: blog.publishedAt,
    dateModified: blog.modifiedAt,
    author: { "@type": "Person", name: blog.author.name },
    publisher: { "@id": `${SITE_URL}/#organization` },
    articleSection: blog.categories?.[0]?.name,
    keywords: blog.categories?.map((c) => c.name).join(", ") || undefined,
    inLanguage: "en",
  };

  return (
    <>
      <JsonLd
        data={[
          articleSchema,
          breadcrumbSchema([
            ["Home", "/"],
            ["Blog", "/blogs/"],
            [blog.title, `/blog/${slug}/`],
          ]),
        ]}
      />
      <BlogDetails blog={blog} relatedBlogs={relatedBlogs} />
    </>
  );
}
