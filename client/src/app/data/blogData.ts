// BlogPost interface for WordPress content
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string; // WordPress HTML content
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  image: string;
  date: string;
  readTime: string;
}

// Note: Static blog data has been removed.
// All blog posts are now fetched from WordPress via the wordpressService.
// See /src/services/wordpressService.ts for the WordPress integration.
