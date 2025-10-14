import { useAppSelector } from '../store/hooks';

export interface LevelAccess {
  canAccess: boolean;
  reason: 'LEVEL_LOCKED' | 'SUBSCRIPTION_REQUIRED' | null;
}


export const useLevelAccess = () => {
  const { user, purchasedLevels, progress } = useAppSelector(state => state.auth);
  
  const checkLevelAccess = (level: number): LevelAccess => {
    // Level 1 is always accessible
    if (level === 1) {
      return { canAccess: true, reason: null };
    }
    
    // Must be authenticated for levels 2+
    if (!user) {
      return { canAccess: false, reason: 'SUBSCRIPTION_REQUIRED' };
    }
    
    // Check if level is unlocked (previous level completed)
    if (!progress || progress.highestUnlockedLevel < level) {
      return { canAccess: false, reason: 'LEVEL_LOCKED' };
    }
    
    // Check if level is purchased for levels 2+
    if (level > 1) {
      const levelKey = `level${level}` as 'level2' | 'level3' | 'level4';
      if (!purchasedLevels || !purchasedLevels[levelKey].purchased) {
        return { canAccess: false, reason: 'SUBSCRIPTION_REQUIRED' };
      }
    }
    
    return { canAccess: true, reason: null };
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
  
  return {
    checkLevelAccess,
    getHighestUnlockedLevel,
    isLevelCompleted,
    hasActiveSubscription,
    getTestScore,
    // Direct access to state
    user,
    purchasedLevels,
    progress
  };
};