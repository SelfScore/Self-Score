# WordPress Integration for LifeScore Blog

This document explains how to integrate WordPress with your LifeScore blog section.

## Overview

The blog system now supports **Server-Side Rendering (SSR)** and fetches blog posts from a WordPress site via the WordPress REST API. The integration supports:

- ✅ Fetching blog posts from WordPress
- ✅ Server-Side Rendering for better SEO
- ✅ Client-side search and pagination
- ✅ Individual blog post pages
- ✅ WordPress featured images and author data
- ✅ HTML content rendering from WordPress
- ✅ Backward compatibility with static blog posts

## Setup Instructions

### 1. WordPress Setup

#### Install WordPress

If you don't have WordPress installed yet:

**Using Local Development (XAMPP, MAMP, or Local by Flywheel)**

```bash
# Download WordPress
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz

# Or use a local WordPress environment like:
# - Local by Flywheel (https://localwp.com/)
# - XAMPP (https://www.apachefriends.org/)
# - MAMP (https://www.mamp.info/)
```

**Using Docker**

```bash
# Create docker-compose.yml
docker-compose up -d
```

#### Configure WordPress REST API

The WordPress REST API is enabled by default in WordPress 4.7+. No additional plugins are required!

**Verify REST API is working:**

```bash
# Replace with your WordPress URL
curl http://localhost:8000/wp-json/wp/v2/posts
```

You should see a JSON response with your blog posts.

### 2. Configure LifeScore Client

#### Update Environment Variables

Open `.env.local` in the client folder and set your WordPress URL:

```bash
# WordPress Configuration
NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8000
```

**Production Example:**

```bash
NEXT_PUBLIC_WORDPRESS_URL=https://blog.yourdomain.com
```

#### Restart Development Server

```bash
cd client
npm run dev
```

### 3. Create Blog Posts in WordPress

1. **Log into WordPress Admin**

   - Go to `http://localhost:8000/wp-admin`
   - Login with your credentials

2. **Create a New Post**

   - Go to **Posts → Add New**
   - Write your blog content using the WordPress editor
   - Add a **Featured Image** (this will be the blog thumbnail)
   - Click **Publish**

3. **Important WordPress Settings**
   - **Permalink Structure:** Go to **Settings → Permalinks** and choose "Post name" for clean URLs
   - **Reading Settings:** Ensure posts are publicly visible

### 4. Test the Integration

1. **Visit Blog Listing Page**

   ```
   http://localhost:3000/blogs
   ```

   You should see your WordPress posts!

2. **Click on a Blog Post**
   ```
   http://localhost:3000/blog/your-post-slug
   ```
   The individual post should load with full content.

## How It Works

### Architecture

```
WordPress (Backend)
  ↓
WordPress REST API (/wp-json/wp/v2/posts)
  ↓
wordpressService.ts (Fetch & Transform)
  ↓
Next.js Server Components (SSR)
  ↓
Client Components (Search/Pagination)
  ↓
User's Browser
```

### File Structure

```
client/src/
├── services/
│   └── wordpressService.ts          # WordPress API integration
├── app/
│   ├── blogs/
│   │   └── page.tsx                  # Blog listing (SSR)
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx              # Individual blog (SSR)
│   ├── components/
│   │   └── blogsComponent/
│   │       ├── BlogsClientWrapper.tsx # Client-side search/pagination
│   │       ├── BlogCard.tsx           # Blog card component
│   │       ├── BlogContent.tsx        # Renders blog content (HTML or structured)
│   │       └── BlogDetails.tsx        # Blog detail wrapper
│   └── data/
│       └── blogData.ts                # Type definitions & static fallback
```

### Key Files

#### 1. `wordpressService.ts`

Handles all WordPress REST API calls:

```typescript
// Fetch all posts
const { posts } = await wordpressService.getAllPosts();

// Fetch single post by slug
const post = await wordpressService.getPostBySlug("my-post-slug");

// Search posts
const results = await wordpressService.searchPosts("keyword");
```

#### 2. `blogs/page.tsx` (Server Component)

Fetches posts at request time and passes to client wrapper:

```typescript
export default async function BlogsPage() {
  const { posts: blogPosts } = await wordpressService.getAllPosts();
  return <BlogsClientWrapper initialBlogs={blogPosts} />;
}
```

#### 3. `BlogsClientWrapper.tsx` (Client Component)

Handles client-side features:

- Search functionality
- Pagination
- No server requests after initial load

#### 4. `BlogContent.tsx`

Renders blog content with two modes:

- **WordPress Mode:** Renders HTML from WordPress using `dangerouslySetInnerHTML`
- **Static Mode:** Renders structured content from static data

## WordPress REST API Endpoints

### Get All Posts

```
GET /wp-json/wp/v2/posts?_embed=true&per_page=100
```

**Query Parameters:**

- `_embed=true` - Include author and featured media
- `per_page=100` - Number of posts per page
- `page=1` - Page number
- `status=publish` - Only published posts

### Get Single Post by Slug

```
GET /wp-json/wp/v2/posts?slug=my-post-slug&_embed=true
```

### Search Posts

```
GET /wp-json/wp/v2/posts?search=keyword&_embed=true
```

## Data Transformation

WordPress posts are transformed to match the LifeScore `BlogPost` interface:

**WordPress Response:**

```json
{
  "id": 123,
  "slug": "my-blog-post",
  "title": { "rendered": "My Blog Post" },
  "excerpt": { "rendered": "<p>Post description...</p>" },
  "content": { "rendered": "<p>Full content...</p>" },
  "date": "2025-11-03T10:00:00",
  "_embedded": {
    "author": [...],
    "wp:featuredmedia": [...]
  }
}
```

**Transformed to:**

```typescript
{
  id: "123",
  slug: "my-blog-post",
  title: "My Blog Post",
  description: "Post description...",
  content: "<p>Full content...</p>",
  author: {
    name: "Author Name",
    role: "Author",
    avatar: "https://..."
  },
  image: "https://...",
  date: "November 3, 2025",
  readTime: "5 min read"
}
```

## Advanced Configuration

### Custom WordPress Fields

If you want to add custom fields (using ACF or similar):

1. Install Advanced Custom Fields plugin in WordPress
2. Add custom fields to your posts
3. Modify `wordpressService.ts` to fetch and transform them:

```typescript
// In transformWordPressPost function
return {
  // ... existing fields
  customField: wpPost.acf?.custom_field || "",
};
```

### Enable CORS (If Needed)

If WordPress is on a different domain, you may need to enable CORS:

**Add to WordPress `functions.php`:**

```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
}, 15);
```

**Or use a CORS plugin:**

- Install "WP REST API – CORS" plugin from WordPress.org

### Authentication (Optional)

If you need to fetch private posts:

```typescript
const response = await axios.get(`${WORDPRESS_API_URL}/posts`, {
  headers: {
    Authorization: `Bearer ${YOUR_JWT_TOKEN}`,
  },
});
```

You'll need to install a JWT authentication plugin like:

- JWT Authentication for WP REST API
- WP GraphQL JWT Authentication

## Caching Strategy (Optional)

For production, consider implementing caching:

### Next.js Revalidation

```typescript
// In blogs/page.tsx or blog/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour
```

### Redis Caching (Advanced)

```typescript
import redis from "redis";

const client = redis.createClient();

async function getCachedPosts() {
  const cached = await client.get("blog:posts");
  if (cached) return JSON.parse(cached);

  const posts = await wordpressService.getAllPosts();
  await client.setex("blog:posts", 3600, JSON.stringify(posts));
  return posts;
}
```

## Troubleshooting

### Posts Not Showing

1. **Check WordPress REST API:**

   ```bash
   curl http://localhost:8000/wp-json/wp/v2/posts
   ```

   Should return JSON, not HTML.

2. **Verify Environment Variable:**

   ```bash
   echo $NEXT_PUBLIC_WORDPRESS_URL
   ```

3. **Check Console for Errors:**
   Open browser DevTools → Console

### Images Not Loading

1. **Check Featured Image in WordPress:**
   - Each post should have a featured image set
2. **Check Image URLs:**

   - Verify the `source_url` in the API response

3. **CORS Issues:**
   - If images are from external domain, check CORS headers

### Styling Issues

WordPress HTML might include classes that need styling:

```typescript
// In BlogContent.tsx, add more sx styles:
"& .wp-block-quote": {
  borderLeft: "4px solid #FF5722",
  pl: 2,
  fontStyle: "italic"
},
```

## Production Deployment

### 1. Update Environment Variables

```bash
# Production .env
NEXT_PUBLIC_WORDPRESS_URL=https://blog.yourdomain.com
```

### 2. WordPress on Subdomain (Recommended)

```
Main Site: https://lifescore.com
Blog:      https://blog.lifescore.com (WordPress)
```

### 3. WordPress Security

- Use HTTPS for WordPress
- Keep WordPress updated
- Use strong admin passwords
- Install security plugins (Wordfence, Sucuri)
- Limit login attempts

### 4. Performance Optimization

- Enable WordPress caching (WP Super Cache, W3 Total Cache)
- Use a CDN for images
- Optimize WordPress database
- Implement Next.js ISR (Incremental Static Regeneration)

## Fallback to Static Posts

If WordPress is unavailable, the system can fall back to static posts:

```typescript
try {
  const { posts } = await wordpressService.getAllPosts();
  return posts;
} catch (error) {
  // Fallback to static posts
  return blogPosts; // from blogData.ts
}
```

## Testing

### Test WordPress API

```bash
# Get all posts
curl http://localhost:8000/wp-json/wp/v2/posts

# Get specific post
curl http://localhost:8000/wp-json/wp/v2/posts?slug=my-post

# Check if _embed works
curl "http://localhost:8000/wp-json/wp/v2/posts?_embed=true"
```

### Test Next.js Pages

```bash
# Start dev server
cd client
npm run dev

# Visit pages
open http://localhost:3000/blogs
open http://localhost:3000/blog/your-post-slug
```

## Migration Checklist

- [ ] WordPress installed and accessible
- [ ] REST API enabled and working
- [ ] `NEXT_PUBLIC_WORDPRESS_URL` set in `.env.local`
- [ ] At least one blog post created with featured image
- [ ] Blog listing page loads WordPress posts
- [ ] Individual blog pages work
- [ ] Search functionality works
- [ ] Pagination works
- [ ] Images load correctly
- [ ] Author information displays
- [ ] Read time calculation works

## Support

For issues or questions:

1. Check WordPress REST API endpoint directly
2. Verify environment variables
3. Check browser console for errors
4. Review Next.js server logs

## Resources

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [WordPress REST API Reference](https://developer.wordpress.org/rest-api/reference/)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [WordPress.org](https://wordpress.org/)
