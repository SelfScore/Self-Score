import type { MetadataRoute } from 'next'

// WordPress API for fetching blog posts
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL
    ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2`
    : 'https://cms.selfscore.net/wp-json/wp/v2'

interface WordPressPost {
    slug: string
    modified: string
}

async function getBlogPosts(): Promise<WordPressPost[]> {
    try {
        const response = await fetch(`${WORDPRESS_API_URL}/posts?per_page=100&status=publish`, {
            next: { revalidate: 3600 }, // Revalidate every hour
        })

        if (!response.ok) {
            console.error('Failed to fetch blog posts for sitemap')
            return []
        }

        return response.json()
    } catch (error) {
        console.error('Error fetching blog posts for sitemap:', error)
        return []
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://selfscore.net'

    // Static pages with their priorities
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/ourMission/`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/testInfo/`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact/`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/consultations/`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blogs/`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ]

    // Fetch dynamic blog posts from WordPress
    const blogPosts = await getBlogPosts()

    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}/`,
        lastModified: new Date(post.modified),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }))

    return [...staticPages, ...blogPages]
}
