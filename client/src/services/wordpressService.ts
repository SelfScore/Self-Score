import axios from 'axios';

// WordPress REST API base URL - will be set via environment variable
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL 
  ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2`
  : 'http://localhost:8000/wp-json/wp/v2'; // Fallback for development

// WordPress Post Response Interface
interface WordPressPost {
  id: number;
  date: string;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  author: number;
  featured_media: number;
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      description: string;
      avatar_urls: {
        [key: string]: string;
      };
    }>;
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

// Our internal BlogPost interface (matching your existing structure)
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string; // Full HTML content from WordPress
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  image: string;
  date: string;
  readTime: string;
}

// Calculate estimated read time based on content
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

// Strip HTML tags and get plain text
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Transform WordPress post to our BlogPost interface
function transformWordPressPost(wpPost: WordPressPost): BlogPost {
  const authorData = wpPost._embedded?.author?.[0];
  const featuredMedia = wpPost._embedded?.['wp:featuredmedia']?.[0];
  
  return {
    id: wpPost.id.toString(),
    slug: wpPost.slug,
    title: stripHtml(wpPost.title.rendered),
    description: stripHtml(wpPost.excerpt.rendered),
    content: wpPost.content.rendered, // Full HTML content
    author: {
      name: authorData?.name || 'Admin',
      role: authorData?.description || 'Author',
      avatar: authorData?.avatar_urls?.['96'] || '',
    },
    image: featuredMedia?.source_url || '',
    date: new Date(wpPost.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    readTime: calculateReadTime(wpPost.content.rendered),
  };
}

// Service for WordPress API calls
export const wordpressService = {
  /**
   * Fetch all blog posts from WordPress
   * @param page - Page number for pagination (default: 1)
   * @param perPage - Number of posts per page (default: 100)
   */
  async getAllPosts(page: number = 1, perPage: number = 100): Promise<{
    posts: BlogPost[];
    total: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get<WordPressPost[]>(`${WORDPRESS_API_URL}/posts`, {
        params: {
          page,
          per_page: perPage,
          _embed: true, // Include author and featured media data
          status: 'publish', // Only published posts
        },
      });

      const posts = response.data.map(transformWordPressPost);
      const total = parseInt(response.headers['x-wp-total'] || '0', 10);
      const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);

      return {
        posts,
        total,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching WordPress posts:', error);
      // Return empty array on error instead of throwing
      return {
        posts: [],
        total: 0,
        totalPages: 0,
      };
    }
  },

  /**
   * Fetch a single blog post by slug
   * @param slug - Post slug
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const response = await axios.get<WordPressPost[]>(`${WORDPRESS_API_URL}/posts`, {
        params: {
          slug,
          _embed: true, // Include author and featured media data
          status: 'publish',
        },
      });

      if (response.data.length === 0) {
        return null;
      }

      return transformWordPressPost(response.data[0]);
    } catch (error) {
      console.error(`Error fetching WordPress post with slug "${slug}":`, error);
      return null;
    }
  },

  /**
   * Search posts by keyword
   * @param searchQuery - Search term
   */
  async searchPosts(searchQuery: string): Promise<BlogPost[]> {
    try {
      const response = await axios.get<WordPressPost[]>(`${WORDPRESS_API_URL}/posts`, {
        params: {
          search: searchQuery,
          _embed: true,
          status: 'publish',
          per_page: 100,
        },
      });

      return response.data.map(transformWordPressPost);
    } catch (error) {
      console.error('Error searching WordPress posts:', error);
      return [];
    }
  },
};
