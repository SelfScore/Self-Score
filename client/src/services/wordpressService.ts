import axios from 'axios';

// WordPress REST API base URL - will be set via environment variable
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL 
  ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2`
  : 'http://localhost:8000/wp-json/wp/v2'; // Fallback for development

// WordPress Post Response Interface
interface WordPressPost {
  id: number;
  date: string;
  modified?: string;
  date_gmt?: string;
  modified_gmt?: string;
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
  categories?: number[];
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
    'wp:term'?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
  };
}

// WordPress Category Response Interface
interface WordPressCategory {
  id: number;
  count: number;
  description: string;
  name: string;
  slug: string;
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
  /** ISO 8601 timestamps for structured data and article meta tags */
  publishedAt: string;
  modifiedAt: string;
  readTime: string;
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export interface GetPostsOptions {
  page?: number;
  perPage?: number;
  type?: 'blogs' | 'newsletter' | 'all';
  search?: string;
  /**
   * Throw on WordPress errors instead of returning an empty list. Cached (ISR) pages use
   * this so a WordPress outage keeps the last good page instead of caching an empty one.
   */
  throwOnError?: boolean;
}

export interface GetPostsResponse {
  posts: BlogPost[];
  total: number;
  totalPages: number;
  hasMore: boolean;
  page: number;
}

// During `next build` WordPress errors are tolerated (empty result) so a CMS hiccup
// can't fail a deploy; at runtime cached pages rethrow so the last good version is kept.
export const IS_BUILD_PHASE = process.env.NEXT_PHASE === 'phase-production-build';

// In-memory category cache
let cachedCategories: WordPressCategory[] | null = null;
let categoryCacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// Calculate estimated read time based on content
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} min read`;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  laquo: '«', raquo: '»', bull: '•', middot: '·', copy: '©', reg: '®', trade: '™',
};

// WordPress returns "rendered" text with HTML entities (e.g. &#8217; for ’)
function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

// Strip HTML tags, decode entities and collapse whitespace -> plain text
function stripHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

// WordPress *_gmt fields have no timezone suffix; mark them as UTC
function toIso(gmt: string | undefined, local: string): string {
  const d = gmt ? new Date(`${gmt}Z`) : new Date(local);
  return Number.isNaN(d.getTime()) ? new Date(local).toISOString() : d.toISOString();
}

// Transform WordPress post to our BlogPost interface
function transformWordPressPost(wpPost: WordPressPost): BlogPost {
  const authorData = wpPost._embedded?.author?.[0];
  const featuredMedia = wpPost._embedded?.['wp:featuredmedia']?.[0];
  const terms = wpPost._embedded?.['wp:term']?.[0] || [];
  const categories = terms.map((term) => ({
    id: term.id,
    name: term.name,
    slug: term.slug,
  }));
  
  return {
    id: wpPost.id.toString(),
    slug: wpPost.slug,
    title: stripHtml(wpPost.title.rendered),
    description: stripHtml(wpPost.excerpt.rendered),
    // Full HTML content. The page title is the only H1, so H1s inside the article become H2s
    content: wpPost.content.rendered.replace(/<(\/?)h1(\s|>)/gi, '<$1h2$2'),
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
    publishedAt: toIso(wpPost.date_gmt, wpPost.date),
    modifiedAt: toIso(wpPost.modified_gmt, wpPost.modified || wpPost.date),
    readTime: calculateReadTime(wpPost.content.rendered),
    categories,
  };
}

// Service for WordPress API calls
export const wordpressService = {
  /**
   * Fetch categories from WordPress
   */
  async getCategories(): Promise<WordPressCategory[]> {
    const now = Date.now();
    if (cachedCategories && now - categoryCacheTimestamp < CACHE_TTL_MS) {
      return cachedCategories;
    }

    try {
      const response = await axios.get<WordPressCategory[]>(`${WORDPRESS_API_URL}/categories`, {
        params: {
          per_page: 100,
        },
      });
      cachedCategories = response.data;
      categoryCacheTimestamp = now;
      return response.data;
    } catch (error) {
      console.error('Error fetching WordPress categories:', error);
      return [];
    }
  },

  /**
   * Get category ID by slug or name
   */
  async getCategoryIdBySlug(slug: string): Promise<number | null> {
    const categories = await this.getCategories();
    const targetSlug = slug.toLowerCase();
    const category = categories.find(
      (c) => c.slug.toLowerCase() === targetSlug || c.name.toLowerCase() === targetSlug
    );
    return category ? category.id : null;
  },

  /**
   * Fetch paginated posts supporting 'blogs' vs 'newsletter' category filtering and search
   */
  async getPosts(options: GetPostsOptions = {}): Promise<GetPostsResponse> {
    const { page = 1, perPage = 6, type = 'blogs', search, throwOnError = false } = options;

    try {
      const params: Record<string, any> = {
        page,
        per_page: perPage,
        _embed: true, // Include author, media, and terms data
        status: 'publish', // Only published posts
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      // Handle category filtering
      if (type === 'newsletter') {
        const newsletterCatId = await this.getCategoryIdBySlug('newsletter') 
          || await this.getCategoryIdBySlug('newsletters');
        
        if (newsletterCatId) {
          params.categories = newsletterCatId;
        } else {
          // If newsletter category doesn't exist yet on WordPress, return empty result gracefully
          return {
            posts: [],
            total: 0,
            totalPages: 0,
            hasMore: false,
            page,
          };
        }
      } else if (type === 'blogs') {
        const newsletterCatId = await this.getCategoryIdBySlug('newsletter')
          || await this.getCategoryIdBySlug('newsletters');
        
        if (newsletterCatId) {
          params.categories_exclude = newsletterCatId;
        }
      }

      const response = await axios.get<WordPressPost[]>(`${WORDPRESS_API_URL}/posts`, { params });

      const posts = response.data.map(transformWordPressPost);
      const total = parseInt(response.headers['x-wp-total'] || '0', 10);
      const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
      const hasMore = page < totalPages;

      return {
        posts,
        total,
        totalPages,
        hasMore,
        page,
      };
    } catch (error: any) {
      console.error('Error fetching WordPress posts:', error?.message || error);
      if (throwOnError && !IS_BUILD_PHASE) throw error;
      return {
        posts: [],
        total: 0,
        totalPages: 0,
        hasMore: false,
        page,
      };
    }
  },

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
    const result = await this.getPosts({ page, perPage, type: 'all' });
    return {
      posts: result.posts,
      total: result.total,
      totalPages: result.totalPages,
    };
  },

  /**
   * Fetch a single blog post by slug
   * @param slug - Post slug
   */
  async getPostBySlug(slug: string, { throwOnError = false }: { throwOnError?: boolean } = {}): Promise<BlogPost | null> {
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
      // null means "doesn't exist" (404); a fetch error must not be cached as a 404
      if (throwOnError && !IS_BUILD_PHASE) throw error;
      return null;
    }
  },

  /**
   * Related posts: same category first, topped up with recent posts
   */
  async getRelatedPosts(blog: BlogPost, limit = 2): Promise<BlogPost[]> {
    const fetchSome = async (extra: Record<string, unknown>): Promise<BlogPost[]> => {
      try {
        const response = await axios.get<WordPressPost[]>(`${WORDPRESS_API_URL}/posts`, {
          params: { per_page: limit + 1, _embed: true, status: 'publish', exclude: blog.id, ...extra },
        });
        return response.data.map(transformWordPressPost);
      } catch (error: any) {
        console.error('Error fetching related posts:', error?.message || error);
        return [];
      }
    };

    const categoryIds = (blog.categories || []).map((c) => c.id);
    const related = categoryIds.length ? await fetchSome({ categories: categoryIds.join(',') }) : [];
    if (related.length < limit) {
      const recent = await fetchSome({});
      for (const post of recent) {
        if (related.length >= limit) break;
        if (!related.some((r) => r.id === post.id)) related.push(post);
      }
    }
    return related.slice(0, limit);
  },

  /**
   * Search posts by keyword
   * @param searchQuery - Search term
   */
  async searchPosts(searchQuery: string): Promise<BlogPost[]> {
    const result = await this.getPosts({ search: searchQuery, perPage: 100, type: 'all' });
    return result.posts;
  },
};

