# WordPress Integration - Quick Start Guide

## ✅ What's Been Implemented

Your blog system now fetches posts from WordPress using Server-Side Rendering (SSR)!

### Files Created/Modified:

1. **`/client/src/services/wordpressService.ts`** - New WordPress API service
2. **`/client/src/app/blogs/page.tsx`** - Updated to fetch from WordPress (SSR)
3. **`/client/src/app/blog/[slug]/page.tsx`** - Updated to fetch single post from WordPress (SSR)
4. **`/client/src/app/components/blogsComponent/BlogsClientWrapper.tsx`** - New client component for search/pagination
5. **`/client/src/app/components/blogsComponent/BlogContent.tsx`** - Updated to handle WordPress HTML content
6. **`/client/src/app/data/blogData.ts`** - Updated BlogPost interface to support both content types
7. **`/client/.env.local`** - Added NEXT_PUBLIC_WORDPRESS_URL variable

## 🚀 Quick Setup (5 Minutes)

### Step 1: Set Your WordPress URL

Edit `/client/.env.local`:

```bash
NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8000  # Change this to your WordPress URL
```

### Step 2: Ensure WordPress REST API is Working

Test your WordPress API:

```bash
# Replace with your WordPress URL
curl http://localhost:8000/wp-json/wp/v2/posts
```

You should see JSON response with posts.

### Step 3: Restart Your Dev Server

```bash
cd client
npm run dev
```

### Step 4: Test It!

1. Visit `http://localhost:3000/blogs`
2. You should see your WordPress posts!
3. Click on a post to view the full content

## 📋 WordPress Checklist

Before your blogs will show, make sure:

- [ ] WordPress is installed and running
- [ ] At least one blog post is published
- [ ] Each post has a **Featured Image** (for thumbnails)
- [ ] Posts are set to "Published" status
- [ ] WordPress REST API is accessible (not blocked)
- [ ] `NEXT_PUBLIC_WORDPRESS_URL` is set correctly

## 🔧 WordPress Setup (If You Don't Have It Yet)

### Option 1: Use Local by Flywheel (Easiest)

1. Download from https://localwp.com/
2. Create a new WordPress site
3. Note the local URL (e.g., `http://lifescore.local`)
4. Set that URL in `.env.local`

### Option 2: Use XAMPP/MAMP

1. Install XAMPP or MAMP
2. Download WordPress from wordpress.org
3. Extract to `htdocs` folder
4. Create database and install WordPress
5. Set URL in `.env.local` (e.g., `http://localhost:8000`)

### Option 3: Use Existing WordPress Site

1. Make sure REST API is enabled (it's enabled by default in WP 4.7+)
2. Set your WordPress URL in `.env.local`
3. If on different domain, you may need CORS plugin

## 📝 Creating Your First Blog Post

1. **Login to WordPress Admin:**

   - Go to `http://your-wordpress-url/wp-admin`

2. **Create New Post:**

   - Posts → Add New
   - Write your title and content
   - **Important:** Set a Featured Image (becomes thumbnail)
   - Click Publish

3. **Verify in LifeScore:**
   - Visit `http://localhost:3000/blogs`
   - Your post should appear!

## 🎨 Content Rendering

The system now supports **both**:

✅ **WordPress HTML Content** - Full WordPress editor HTML with images, formatting, etc.
✅ **Static Structured Content** - Backward compatible with your existing static blog posts

## 🔍 Features

- ✅ **Server-Side Rendering (SSR)** - Better SEO
- ✅ **Client-side Search** - Fast, instant search
- ✅ **Client-side Pagination** - Smooth page transitions
- ✅ **WordPress Images** - Automatic featured image handling
- ✅ **Author Information** - Displays WordPress author data
- ✅ **Read Time Calculation** - Auto-calculated from content
- ✅ **HTML Content Rendering** - Proper WordPress HTML styling

## 📊 How It Works

```
1. User visits /blogs
   ↓
2. Next.js Server fetches posts from WordPress API
   ↓
3. Server renders initial HTML with all posts
   ↓
4. Client receives pre-rendered page (fast!)
   ↓
5. Client-side search/pagination work without API calls
```

## 🐛 Troubleshooting

### "No articles found" on /blogs page

**Check:**

1. WordPress URL is correct in `.env.local`
2. WordPress REST API is accessible: `curl http://your-wp-url/wp-json/wp/v2/posts`
3. You have published posts in WordPress
4. Restart Next.js dev server after changing `.env.local`

### Images not loading

**Check:**

1. Each post has a Featured Image set in WordPress
2. WordPress media uploads are working
3. Image URLs in API response are accessible

### "Cannot fetch posts" error

**Check:**

1. WordPress is running
2. REST API endpoint returns JSON (not HTML error page)
3. No firewall/security blocking the API
4. CORS is configured if WordPress is on different domain

## 📚 Full Documentation

See **`WORDPRESS_INTEGRATION.md`** for complete documentation including:

- Advanced configuration
- Custom fields
- Authentication
- Caching strategies
- Production deployment
- Security best practices

## 🎯 Next Steps

1. Set up WordPress (if you haven't already)
2. Create a few blog posts with featured images
3. Update `.env.local` with your WordPress URL
4. Restart dev server
5. Visit `/blogs` and enjoy!

## 💡 Pro Tips

1. **Use Featured Images:** Always set a featured image for better thumbnails
2. **SEO:** WordPress has great SEO plugins (Yoast, Rank Math)
3. **Backup:** Regularly backup your WordPress content
4. **Categories/Tags:** WordPress categories can be integrated later if needed
5. **Performance:** Consider using a caching plugin for WordPress

## 🆘 Need Help?

1. Check `WORDPRESS_INTEGRATION.md` for detailed docs
2. Test WordPress REST API directly in browser: `http://your-wp-url/wp-json/wp/v2/posts`
3. Check browser console for errors
4. Check Next.js terminal for server errors

---

**Ready to go live?** Update `.env.local` with your production WordPress URL and deploy! 🚀
