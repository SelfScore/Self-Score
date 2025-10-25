import { useAppSelector } from '../store/hooks';

export interface LevelAccess {
  canAccess: boolean;
  reason: 'LEVEL_LOCKED' | 'SUBSCRIPTION_REQUIRED' | null;
}

export interface TestAttemptAccess {
  canAttempt: boolean;
  reason: 'PREVIOUS_LEVEL_NOT_COMPLETED' | 'SUBSCRIPTION_REQUIRED' | null;
}

export const useLevelAccess = () => {
  const { user, purchasedLevels, progress } = useAppSelector(state => state.auth);
  
  // Check if user can ACCESS level info (view details, purchase options)
  const checkLevelAccess = (level: number): LevelAccess => {
    // All levels are accessible for viewing info
    // Level 1 is always fully accessible
    if (level === 1) {
      return { canAccess: true, reason: null };
    }
    
    // For levels 2-4, check if purchased
    if (!user) {
      return { canAccess: false, reason: 'SUBSCRIPTION_REQUIRED' };
    }
    
    const levelKey = `level${level}` as 'level2' | 'level3' | 'level4';
    if (!purchasedLevels || !purchasedLevels[levelKey].purchased) {
      return { canAccess: false, reason: 'SUBSCRIPTION_REQUIRED' };
    }
    
    return { canAccess: true, reason: null };
  };

  // NEW: Check if user can ATTEMPT the test (requires previous level completion)
  const checkTestAttemptAccess = (level: number): TestAttemptAccess => {
    // Level 1 can always be attempted
    if (level === 1) {
      return { canAttempt: true, reason: null };
    }

    // Must be authenticated for levels 2+
    if (!user) {
      return { canAttempt: false, reason: 'SUBSCRIPTION_REQUIRED' };
    }

    // Check if level is purchased
    const levelKey = `level${level}` as 'level2' | 'level3' | 'level4';
    if (!purchasedLevels || !purchasedLevels[levelKey].purchased) {
      return { canAttempt: false, reason: 'SUBSCRIPTION_REQUIRED' };
    }

    // Check if previous level is completed
    const previousLevel = level - 1;
    if (!progress || !progress.completedLevels.includes(previousLevel)) {
      return { canAttempt: false, reason: 'PREVIOUS_LEVEL_NOT_COMPLETED' };
    }

    return { canAttempt: true, reason: null };
  };

  // Check if a level can be purchased (doesn't require previous level completion)
  const canPurchaseLevel = (level: number): boolean => {
    if (level === 1) return false; // Level 1 is free
    if (!user) return false; // Must be authenticated
    
    const levelKey = `level${level}` as 'level2' | 'level3' | 'level4';
    return !purchasedLevels || !purchasedLevels[levelKey].purchased;
  };
  
  const getHighestUnlockedLevel = (): number => {
    return progress?.highestUnlockedLevel || 1;
  };
  
  const isLevelCompleted = (level: number): boolean => {
    return progress?.completedLevels.includes(level) || false;
  };
  
  const hasActiveSubscription = (): boolean => {
    // Check if any level is purchased
    return purchasedLevels ? (
      purchasedLevels.level2.purchased || 
      purchasedLevels.level3.purchased || 
      purchasedLevels.level4.purchased
    ) : false;
  };

  // Check if level is purchased
  const isLevelPurchased = (level: number): boolean => {
    if (level === 1) return true; // Level 1 is free
    if (!purchasedLevels) return false;
    
    const levelKey = `level${level}` as 'level2' | 'level3' | 'level4';
    return purchasedLevels[levelKey].purchased;
  };
  
  const getTestScore = (level: number): number | undefined => {
    if (!progress?.testScores) return undefined;
    
    switch (level) {
      case 1: return progress.testScores.level1;
      case 2: return progress.testScores.level2;
      case 3: return progress.testScores.level3;
      case 4: return progress.testScores.level4;
      default: return undefined;
    }
  };

  // Get bundle information for a level
  const getBundleInfo = (level: number): { levels: number[], price: number } | null => {
    switch (level) {
      case 2:
        return { levels: [2], price: 5 };
      case 3:
        return { levels: [2, 3], price: 10 };
      case 4:
        return { levels: [2, 3, 4], price: 25 };
      default:
        return null;
    }
  };
  
  return {
    checkLevelAccess,
    checkTestAttemptAccess,
    canPurchaseLevel,
    isLevelPurchased,
    getHighestUnlockedLevel,
    isLevelCompleted,
    hasActiveSubscription,
    getTestScore,
    getBundleInfo,
    // Direct access to state
    user,
    purchasedLevels,
    progress
  };
};