// Utility functions for score calculations and interpretations

import { ScoreRange } from '../types';

// Score ranges for Level 1 (out of 900)
export const getScoreRanges = (): ScoreRange[] => {
  return [
    {
      min: 0,
      max: 350,
      label: 'Seeker',
      color: '#90EE90',
      description: 'You are in a Seeker state with minimal emotional stress.'
    },
    {
      min: 351,
      max: 500,
      label: 'Learner',
      color: '#90EE90',
      description: 'You maintain a good balance in your emotional awareness.'
    },
    {
      min: 501,
      max: 750,
      label: 'Evolver',
      color: '#FFA500',
      description: 'You are emotionally aware and evolving.'
    },
    {
      min: 751,
      max: 900,
      label: 'Awakened',
      color: '#FFB6C1',
      description: 'You may be feeling emotionally Awakened.'
    }
  ];
};

// Get score interpretation based on score value
export const getScoreInterpretation = (score: number): {
  range: ScoreRange;
  position: 'Seeker' | 'Learner' | 'Evolver' | 'Awakened';
} => {
  const ranges = getScoreRanges();
  const range = ranges.find(r => score >= r.min && score <= r.max) || ranges[0];
  
  if (score <= 350) return { range, position: 'Seeker' };
  if (score <= 500) return { range, position: 'Learner' };
  if (score <= 750) return { range, position: 'Evolver' };
  return { range, position: 'Awakened' };
};

// Get detailed meaning based on score
export const getScoreMeaning = (score: number): string => {
  if (score >= 750 && score <= 900) {
    return "You have strong emotional awareness and empathy. Your actions align with your values.";
  } else if (score >= 500 && score <= 749) {
    return "You are Emotionally Aware. You understand your emotions well, reflect on your actions, and make thoughtful choices. You are in control of most situations and have strong emotional insight, though there's still room to deepen your awareness and align fully with your values.";
  } else if (score >= 350 && score <= 499) {
    return "You understand your emotions well and act with self-awareness and intent.";
  } else {
    return "You may feel unsure about your emotions. This stage helps you see your patterns.";
  }
};

// Get zone for semi-circular gauge (350-500, 500-750, 750-900)
export const getScoreZone = (score: number): 'unaware' | 'aware' | 'conscious' => {
  if (score >= 750) return 'conscious';
  if (score >= 500) return 'aware';
  return 'unaware';
};

// Format date to readable format
export const formatDate = (dateString: string): string => {
  // Handle null/undefined/empty strings
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // If invalid date, return the original string (it might already be formatted)
      return dateString || 'N/A';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (_error) {
    return dateString || 'N/A';
  }
};

// Calculate percentage for progress indicators
export const calculatePercentage = (score: number, maxScore: number): number => {
  return Math.round((score / maxScore) * 100);
};
