# Blog Components Documentation

## Overview

This directory contains the blog-related components for the LifeScore application.

## Components Created

### 1. **BlogCard.tsx**

A reusable card component for displaying blog post previews.

**Features:**

- Responsive design (mobile-first)
- Hover effects (lift animation + shadow)
- Clickable - navigates to full blog post
- Displays: image, read time, title, description, date, and "Read More" link
- Uses brand colors (Orange #FF5722) and fonts (Faustina, Source Sans Pro)

**Usage:**

```tsx
import BlogCard from "@/app/components/blogsComponent/BlogCard";
import { blogPosts } from "@/app/data/blogData";

<BlogCard blog={blogPosts[0]} />;
```

### 2. **BlogContent.tsx**

A reusable component for rendering the full blog post content.

**Features:**

- Responsive typography
- Author info with avatar
- Featured image with Next.js Image optimization
- Structured content (introduction, sections, conclusion)
- Clean, readable layout
- Icons for date and read time

**Usage:**

```tsx
import BlogContent from "@/app/components/blogsComponent/BlogContent";
import { getBlogBySlug } from "@/app/data/blogData";

const blog = getBlogBySlug("understanding-self-awareness");
<BlogContent blog={blog} />;
```

## Data Structure

### **blogData.ts**

Located at: `/app/data/blogData.ts`

Contains:

- `BlogPost` interface (TypeScript type definition)
- `blogPosts` array (3 sample blog posts)
- `getBlogBySlug()` - helper function to fetch blog by slug
- `getAllBlogSlugs()` - helper function for static generation

## Pages Created

### 1. **Blogs Listing Page** - `/app/blogs/page.tsx`

- Displays all blog posts in a responsive grid (1 column mobile, 2 columns tablet, 3 columns desktop)
- Page title and description
- Uses BlogCard component for each post

**Route:** `/blogs`

### 2. **Individual Blog Page** - `/app/blog/[slug]/page.tsx`

- Dynamic route for each blog post
- Uses BlogContent component
- 404 handling if blog not found

**Route:** `/blog/understanding-self-awareness`

## File Structure

```
client/src/app/
├── data/
│   └── blogData.ts                    # Blog data and types
├── components/
│   └── blogsComponent/
│       ├── BlogCard.tsx               # Card component
│       └── BlogContent.tsx            # Full content component
├── blogs/
│   └── page.tsx                       # Blogs listing page
└── blog/
    └── [slug]/
        └── page.tsx                   # Individual blog page
```

## Styling

All components use:

- **Primary Color:** #FF5722 (Orange)
- **Text Colors:** #000000 (headings), #6B7280 (body), #374151 (content)
- **Background:** #FAFAFA (page), #FFFFFF (cards)
- **Fonts:**
  - Faustina (headings)
  - Source Sans Pro (body text)
- **Responsive breakpoints:** xs, sm, md, lg

## Sample Blog Posts

Currently includes 3 static blog posts:

1. Understanding Self-Awareness: The First Step to Personal Growth
2. Building Emotional Intelligence in Daily Life
3. A Beginner's Guide to Mindfulness and Meditation

## Next Steps (When Ready for Dynamic Data)

1. Replace static data with API calls
2. Add pagination to blogs listing
3. Add categories/tags filtering
4. Add search functionality
5. Add related posts section
6. Connect to CMS (Contentful, Strapi, etc.) or database

## Notes

- All images are referenced from `/public/images/blogs/` and `/public/images/avatars/`
- You'll need to add actual images to these directories
- Components are fully responsive and match your design system
- Uses Next.js App Router conventions
