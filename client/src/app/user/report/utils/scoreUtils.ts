// Utility functions for score calculations and interpretations

import { ScoreRange } from '../types';

// Score ranges for all levels (out of 900)
export const getScoreRanges = (): ScoreRange[] => {
  return [
    {
      min: 0,
      max: 350,
      label: 'Seeker',
      color: '#90EE90',
      description: 'This stage is for someone who needs care, patience, and gentle guidance.'
    },
    {
      min: 351,
      max: 500,
      label: 'Learner',
      color: '#90EE90',
      description: 'This stage is for someone who is slowly waking up to themselves.'
    },
    {
      min: 501,
      max: 750,
      label: 'Evolver',
      color: '#FFA500',
      description: 'This stage is for someone who is becoming steady and balanced.'
    },
    {
      min: 751,
      max: 900,
      label: 'Awakened',
      color: '#FFB6C1',
      description: 'This stage is for someone who lives with deep peace and wisdom.'
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

// Get detailed meaning based on score - Updated with new content
export const getScoreMeaning = (score: number): string => {
  if (score >= 750 && score <= 900) {
    return "You are deeply connected with yourself. Happiness and peace come from within you, not from situations. You forgive easily, love freely, and stay calm even when life is challenging. Your mind, body, and soul are in harmony.";
  } else if (score >= 500 && score <= 749) {
    return "You are doing well. Most of the time, you feel calm, loving, and aware of yourself. You understand your emotions better and don't get shaken as easily as before. Your mind, body, and inner self are learning to work together.";
  } else if (score >= 350 && score <= 499) {
    return "You are starting to notice yourself more now. Sometimes you feel calm and happy, and sometimes you don't. This is a beautiful stage because awareness has started. You are learning what disturbs you and what brings you peace.";
  } else {
    return "Right now, life may feel heavy for you. Please remember, this score does not mean anything is wrong with you. It only means you are tired inside. The fact that you took this test shows courage. Healing begins with awareness, and you have already begun.";
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
