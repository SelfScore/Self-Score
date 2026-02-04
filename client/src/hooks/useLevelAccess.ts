import { useAppSelector } from "../store/hooks";

export interface LevelAccess {
  canAccess: boolean;
  reason: "LEVEL_LOCKED" | "SUBSCRIPTION_REQUIRED" | null;
}

export interface TestAttemptAccess {
  canAttempt: boolean;
  reason: "PREVIOUS_LEVEL_NOT_COMPLETED" | "SUBSCRIPTION_REQUIRED" | null;
}

export const useLevelAccess = () => {
  const { user, purchasedLevels, progress } = useAppSelector(
    (state) => state.auth
  );

  // Check if user can ACCESS level info (view details, purchase options)
  const checkLevelAccess = (level: number): LevelAccess => {
    // All levels are accessible for viewing info
    // Level 1 is always fully accessible
    if (level === 1) {
      return { canAccess: true, reason: null };
    }

    // For levels 2-3, check if purchased (boolean)
    if (!user) {
      return { canAccess: false, reason: "SUBSCRIPTION_REQUIRED" };
    }

    // Level 4 and 5 use remainingAttempts instead of purchased boolean
    if (level === 4) {
      const remaining = purchasedLevels?.level4?.remainingAttempts || 0;
      if (remaining <= 0) {
        return { canAccess: false, reason: "SUBSCRIPTION_REQUIRED" };
      }
      return { canAccess: true, reason: null };
    }
    if (level === 5) {
      const remaining = purchasedLevels?.level5?.remainingAttempts || 0;
      if (remaining <= 0) {
        return { canAccess: false, reason: "SUBSCRIPTION_REQUIRED" };
      }
      return { canAccess: true, reason: null };
    }

    // For levels 2-3, use the boolean purchased flag
    const levelKey = `level${level}` as "level2" | "level3";
    if (!purchasedLevels || !purchasedLevels[levelKey].purchased) {
      return { canAccess: false, reason: "SUBSCRIPTION_REQUIRED" };
    }

    return { canAccess: true, reason: null };
  };

  // NEW: Check if user can ATTEMPT the test (requires previous level completion)
  const checkTestAttemptAccess = (_level: number): TestAttemptAccess => {
    // 🚧 TEMPORARY: Access control disabled for testing
    // TODO: Re-enable this logic after testing Level 4 AI Interview
    return { canAttempt: true, reason: null };

    /* ORIGINAL LOGIC - COMMENTED OUT FOR TESTING
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
    */
  };

  // Check if a level can be purchased (doesn't require previous level completion)
  const canPurchaseLevel = (level: number): boolean => {
    if (level === 1) return false; // Level 1 is free
    if (!user) return false; // Must be authenticated

    // Level 4 can always be repurchased to add more attempts
    if (level === 4 || level === 5) {
      return true; // Always allow purchase for pay-per-use levels
    }

    // For levels 2-3, check if already purchased
    const levelKey = `level${level}` as "level2" | "level3";
    return !purchasedLevels || !purchasedLevels[levelKey].purchased;
  };

  const getHighestUnlockedLevel = (): number => {
    return progress?.highestUnlockedLevel || 1;
  };

  const isLevelCompleted = (level: number): boolean => {
    return progress?.completedLevels.includes(level) || false;
  };

  const hasActiveSubscription = (): boolean => {
    // Check if any level is purchased or has attempts
    if (!purchasedLevels) return false;
    return (
      purchasedLevels.level2?.purchased ||
      purchasedLevels.level3?.purchased ||
      (purchasedLevels.level4?.remainingAttempts || 0) > 0 ||
      (purchasedLevels.level5?.remainingAttempts || 0) > 0
    );
  };

  // Check if level is purchased (has access)
  const isLevelPurchased = (level: number): boolean => {
    if (level === 1) return true; // Level 1 is free
    if (!purchasedLevels) return false;

    // Level 4 and 5 use remainingAttempts
    if (level === 4) {
      return (purchasedLevels.level4?.remainingAttempts || 0) > 0;
    }
    if (level === 5) {
      return (purchasedLevels.level5?.remainingAttempts || 0) > 0;
    }

    // Levels 2-3 use boolean purchased
    const levelKey = `level${level}` as "level2" | "level3";
    return purchasedLevels[levelKey]?.purchased || false;
  };

  // Get remaining attempts for Level 4 or 5 (returns Infinity for other levels)
  const getRemainingAttempts = (level: number): number => {
    if (level === 4) {
      return purchasedLevels?.level4?.remainingAttempts || 0;
    }
    if (level === 5) {
      return purchasedLevels?.level5?.remainingAttempts || 0;
    }
    // Levels 1-3: unlimited attempts after purchase
    return Infinity;
  };

  // Check if user has used their attempts (for showing "Buy Again" button)
  // Returns true if user has ever purchased but now has 0 remaining attempts
  const hasUsedAttempts = (level: number): boolean => {
    if (level === 4) {
      // Check if user has a payment history for level 4 but 0 remaining attempts
      const remaining = purchasedLevels?.level4?.remainingAttempts || 0;
      const hasPurchased = purchasedLevels?.level4?.purchaseDate !== undefined;
      return hasPurchased && remaining === 0;
    }
    if (level === 5) {
      const remaining = purchasedLevels?.level5?.remainingAttempts || 0;
      const hasPurchased = purchasedLevels?.level5?.purchaseDate !== undefined;
      return hasPurchased && remaining === 0;
    }
    return false; // Other levels don't use pay-per-use
  };

  const getTestScore = (level: number): number | undefined => {
    if (!progress?.testScores) return undefined;

    switch (level) {
      case 1:
        return progress.testScores.level1;
      case 2:
        return progress.testScores.level2;
      case 3:
        return progress.testScores.level3;
      case 4:
        return progress.testScores.level4;
      case 5:
        return progress.testScores.level5;
      default:
        return undefined;
    }
  };

  // Get bundle information for a level
  const getBundleInfo = (
    level: number
  ): { levels: number[]; price: number } | null => {
    switch (level) {
      case 2:
        return { levels: [2], price: 5 };
      case 3:
        return { levels: [2, 3], price: 10 };
      case 4:
        return { levels: [2, 3, 4, 5], price: 25 }; // Level 4 includes Level 5
      case 5:
        return { levels: [2, 3, 4, 5], price: 25 }; // Level 5 purchase = Level 4 bundle
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
    getRemainingAttempts,
    hasUsedAttempts,
    // Direct access to state
    user,
    purchasedLevels,
    progress,
  };
};
