import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// WordPress API for fetching blog posts
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL
  ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2`
  : "https://cms.selfscore.net/wp-json/wp/v2";

interface WordPressPost {
  slug: string;
  modified: string;
}

async function getBlogPosts(): Promise<WordPressPost[]> {
  try {
    console.log("[Sitemap] Fetching blog posts from:", WORDPRESS_API_URL);
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?per_page=100&status=publish`,
      {
        cache: "no-store", // Always fetch fresh during build
      },
    );

    if (!response.ok) {
      console.error(
        "[Sitemap] Failed to fetch blog posts. Status:",
        response.status,
      );
      return [];
    }

    const posts = await response.json();
    console.log(`[Sitemap] Successfully fetched ${posts.length} blog posts`);
    return posts;
  } catch (error) {
    console.error("[Sitemap] Error fetching blog posts:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://selfscore.net";

  // Static pages with their priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ourMission/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/testInfo/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/consultations/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blogs/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy/`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-conditions/`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy/`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Fetch dynamic blog posts from WordPress
  const blogPosts = await getBlogPosts();

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}/`,
    lastModified: new Date(post.modified),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  console.log(
    `[Sitemap] Generated sitemap with ${staticPages.length} static pages and ${blogPages.length} blog posts`,
  );

  return [...staticPages, ...blogPages];
}
