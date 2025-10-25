export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: {
    introduction: string;
    sections: {
      heading: string;
      paragraphs: string[];
    }[];
    conclusion: {
      heading: string;
      content: string;
    };
  };
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  image: string;
  date: string;
  readTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "understanding-self-awareness",
    title: "Understanding Self-Awareness: The First Step to Personal Growth",
    description:
      "Discover how developing self-awareness can transform your life and help you make better decisions",
    content: {
      introduction:
        "Self-awareness is the cornerstone of personal development and emotional intelligence. It's the ability to recognize and understand your own emotions, thoughts, and behaviors, and how they impact both yourself and others around you.",
      sections: [
        {
          heading: "What is Self-Awareness?",
          paragraphs: [
            "Self-awareness involves two key components: internal self-awareness and external self-awareness. Internal self-awareness is how clearly we see our own values, passions, aspirations, fit with our environment, reactions, and impact on others. External self-awareness is understanding how other people view us.",
            "Research shows that when we see ourselves clearly, we are more confident and more creative. We make sounder decisions, build stronger relationships, and communicate more effectively. We're less likely to lie, cheat, and steal. We are better workers who get more promotions. And we're more effective leaders with more satisfied employees and more profitable companies.",
          ],
        },
        {
          heading: "What is Self-Awareness?",
          paragraphs: [
            "Self-awareness involves two key components: internal self-awareness and external self-awareness. Internal self-awareness is how clearly we see our own values, passions, aspirations, fit with our environment, reactions, and impact on others. External self-awareness is understanding how other people view us.",
            "Research shows that when we see ourselves clearly, we are more confident and more creative. We make sounder decisions, build stronger relationships, and communicate more effectively. We're less likely to lie, cheat, and steal. We are better workers who get more promotions. And we're more effective leaders with more satisfied employees and more profitable companies.",
          ],
        },
      ],
      conclusion: {
        heading: "Conclusion",
        content:
          "Self-awareness is not a destination but a continuous journey of self-discovery and growth. By investing the time and effort to understand yourself better, you lay the foundation for a more fulfilling, authentic, and successful life. Remember, the journey to self-awareness begins with a single step—why not take yours today?",
      },
    },
    author: {
      name: "Mr. Jitendra Patel",
      role: "Admin",
      avatar: "/images/LandingPage/AuthImg.webp",
    },
    image: "/images/LandingPage/AuthImg.webp",
    date: "October 15, 2025",
    readTime: "5 min read",
  },
  {
    id: "2",
    slug: "building-emotional-intelligence",
    title: "Building Emotional Intelligence in Daily Life",
    description:
      "Learn practical strategies to enhance your emotional intelligence and improve your relationships",
    content: {
      introduction:
        "Emotional intelligence is a critical skill that affects every aspect of our lives, from personal relationships to professional success.",
      sections: [
        {
          heading: "Understanding Emotional Intelligence",
          paragraphs: [
            "Emotional intelligence (EI) is the ability to understand and manage your own emotions, as well as recognize and influence the emotions of those around you.",
            "Research has shown that high emotional intelligence is linked to better mental health, job performance, and leadership skills.",
          ],
        },
      ],
      conclusion: {
        heading: "Conclusion",
        content:
          "Developing emotional intelligence is a lifelong journey that pays dividends in all areas of life. Start practicing these skills today and watch your relationships and success flourish.",
      },
    },
    author: {
      name: "Mr. Jitendra Patel",
      role: "Admin",
      avatar: "/images/LandingPage/AuthImg.webp",
    },
    image: "/images/LandingPage/AuthImg.webp",
    date: "October 12, 2025",
    readTime: "4 min read",
  },
  {
    id: "3",
    slug: "mindfulness-meditation-guide",
    title: "A Beginner's Guide to Mindfulness and Meditation",
    description:
      "Start your mindfulness journey with these simple, practical meditation techniques",
    content: {
      introduction:
        "Mindfulness and meditation are powerful tools for reducing stress, improving focus, and enhancing overall well-being.",
      sections: [
        {
          heading: "Getting Started with Meditation",
          paragraphs: [
            "Meditation doesn't require any special equipment or a lot of time. You can start with just 5 minutes a day and gradually increase as you become more comfortable.",
            "The key is consistency. Regular practice, even if brief, is more beneficial than occasional long sessions.",
          ],
        },
      ],
      conclusion: {
        heading: "Conclusion",
        content:
          "Remember, meditation is a practice, not a perfect. Be patient with yourself and enjoy the journey of self-discovery and inner peace.",
      },
    },
    author: {
      name: "Mr. Jitendra Patel",
      role: "Admin",
      avatar: "/images/LandingPage/AuthImg.webp",
    },
    image: "/images/LandingPage/AuthImg.webp",
    date: "October 8, 2025",
    readTime: "6 min read",
  },
];

// Helper function to get blog by slug
export const getBlogBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
};

// Helper function to get all blog slugs (for static generation)
export const getAllBlogSlugs = (): string[] => {
  return blogPosts.map((post) => post.slug);
};
