import type { MetadataRoute } from "next";

// Tolerate WordPress errors during `next build`; at runtime, rethrow so the last good sitemap is kept
const IS_BUILD_PHASE = process.env.NEXT_PHASE === "phase-production-build";

// Regenerated at most hourly so new blog posts appear without a redeploy
// (force-static only refreshed it on each build)
export const revalidate = 3600;

// WordPress API for fetching blog posts
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL
  ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2`
  : "https://cms.selfscore.net/wp-json/wp/v2";

interface WordPressPost {
  slug: string;
  modified: string;
  modified_gmt?: string;
}

async function getBlogPosts(): Promise<WordPressPost[]> {
  const all: WordPressPost[] = [];
  try {
    // WordPress caps per_page at 100, so page through everything
    for (let page = 1; page <= 50; page++) {
      const response = await fetch(
        `${WORDPRESS_API_URL}/posts?per_page=100&page=${page}&status=publish&_fields=slug,modified_gmt,modified`,
        { next: { revalidate: 3600 } },
      );
      if (!response.ok) {
        // WordPress answers 400 for a page past the end
        if (page > 1 && response.status === 400) break;
        throw new Error(`WordPress responded ${response.status}`);
      }
      const posts: WordPressPost[] = await response.json();
      all.push(...posts);
      const totalPages = Number(response.headers.get("x-wp-totalpages") || "1");
      if (page >= totalPages || posts.length === 0) break;
    }
  } catch (error) {
    console.error("[Sitemap] Error fetching blog posts:", error);
    if (!IS_BUILD_PHASE) throw error;
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.selfscore.net";

  // Static pages (no lastModified: we don't track real edit dates for these)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ourMission/`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/testInfo/`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact/`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Consultations hidden for now
    // {
    //   url: `${baseUrl}/consultations/`,
    //   changeFrequency: "weekly",
    //   priority: 0.8,
    // },
    {
      url: `${baseUrl}/blogs/`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy/`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-conditions/`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy/`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Fetch dynamic blog posts from WordPress
  const blogPosts = await getBlogPosts();

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}/`,
    lastModified: new Date(post.modified_gmt ? `${post.modified_gmt}Z` : post.modified),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));


  return [...staticPages, ...blogPages];
}
