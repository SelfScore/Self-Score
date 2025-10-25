// Content data for different levels

import { ReportContent } from '../types';

export const level1Content: ReportContent = {
  level: 1,
  characteristics: [
    "You notice patterns in your feelings and respond thoughtfully rather than reacting impulsively.",
    "You reflect on your thoughts and actions, understanding the reasons behind your choices.",
    "You can empathize with others and consider the impact of your behavior, improving your interactions.",
    "With more focus on aligning actions fully with your values, you can move toward the Deeply Conscious level.",
    "Keep observing patterns, practicing empathy, and making intentional choices to strengthen your emotional mastery."
  ],
  recommendations: [
    {
      title: "Emotional Journaling",
      description: "Spend 5 minutes each day writing down your feelings to track and understand them."
    },
    {
      title: "Self-Talk Awareness",
      description: "Notice your thoughts, label them, and avoid judging yourself."
    },
    {
      title: "Mindfulness Practice",
      description: "Focus on being aware of the present moment rather than trying to control it."
    }
  ],
  proTip: "Your current awareness is like a compass. Level 2 Self Score Test will help you map the terrain much easier.",
  outcomes: [
    "Better Emotional Stability",
    "Improved Decision Making",
    "Stronger Self-Leadership"
  ]
};

export const level2Content: ReportContent = {
  level: 2,
  characteristics: [
    "You demonstrate advanced emotional intelligence and self-awareness.",
    "You consistently align your actions with your core values and principles.",
    "You show exceptional empathy and understanding in your relationships.",
    "You maintain strong emotional regulation even in challenging situations.",
    "You actively work on personal growth and development."
  ],
  recommendations: [
    {
      title: "Advanced Reflection",
      description: "Engage in deeper self-reflection exercises to explore your patterns."
    },
    {
      title: "Values Alignment",
      description: "Regularly assess whether your daily actions align with your core values."
    },
    {
      title: "Emotional Mastery",
      description: "Practice advanced techniques for managing complex emotional situations."
    }
  ],
  proTip: "Continue your journey with Level 3 to unlock even deeper insights into your emotional landscape.",
  outcomes: [
    "Enhanced Self-Awareness",
    "Deeper Relationship Connections",
    "Greater Life Satisfaction"
  ]
};

// Dummy content for Level 3
export const level3Content: ReportContent = {
  level: 3,
  characteristics: [
    "You exhibit mastery in emotional intelligence and self-regulation.",
    "Your actions consistently reflect deep alignment with your values.",
    "You inspire others through your emotional awareness and stability.",
    "You navigate complex emotional situations with grace and wisdom.",
    "You demonstrate advanced leadership in your personal and professional life."
  ],
  recommendations: [
    {
      title: "Leadership Development",
      description: "Focus on developing your leadership skills to guide others."
    },
    {
      title: "Advanced Mindfulness",
      description: "Practice advanced meditation and mindfulness techniques."
    },
    {
      title: "Mentorship",
      description: "Consider mentoring others in their emotional awareness journey."
    }
  ],
  proTip: "Level 4 awaits to help you achieve complete mastery of your emotional landscape.",
  outcomes: [
    "Leadership Excellence",
    "Profound Self-Understanding",
    "Transformational Impact"
  ]
};

// Dummy content for Level 4
export const level4Content: ReportContent = {
  level: 4,
  characteristics: [
    "You have achieved exceptional mastery in all aspects of emotional intelligence.",
    "You serve as a role model for emotional awareness and conscious living.",
    "Your life reflects complete alignment between values, thoughts, and actions.",
    "You navigate life's challenges with wisdom, grace, and deep understanding.",
    "You make a significant positive impact on those around you."
  ],
  recommendations: [
    {
      title: "Continued Growth",
      description: "Maintain your practices and explore new dimensions of awareness."
    },
    {
      title: "Teaching Others",
      description: "Share your wisdom and experience with those beginning their journey."
    },
    {
      title: "Deep Integration",
      description: "Continue integrating all aspects of your emotional intelligence."
    }
  ],
  proTip: "You have achieved mastery. Focus on maintaining and sharing your wisdom with others.",
  outcomes: [
    "Complete Emotional Mastery",
    "Wisdom and Guidance",
    "Lasting Positive Impact"
  ]
};

export const getContentByLevel = (level: number): ReportContent => {
  switch (level) {
    case 1:
      return level1Content;
    case 2:
      return level2Content;
    case 3:
      return level3Content;
    case 4:
      return level4Content;
    default:
      return level1Content;
  }
};
