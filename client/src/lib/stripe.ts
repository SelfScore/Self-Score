import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('⚠️  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found. Payment features will not work.');
}

// Singleton Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey || '');
  }
  return stripePromise;
};

// Level pricing for display (in USD)
// Bundle pricing: Level 2 = $5, Level 3 = $10 (includes L2), Level 4 = $25 (includes L2+L3)
export const LEVEL_PRICES = {
  2: 5,   // $5.00 - Level 2 only
  3: 10,  // $10.00 - Levels 2 + 3 bundle
  4: 25,  // $25.00 - Levels 2 + 3 + 4 bundle
} as const;

export const getLevelPrice = (level: number): number | null => {
  if (level in LEVEL_PRICES) {
    return LEVEL_PRICES[level as keyof typeof LEVEL_PRICES];
  }
  return null;
};

export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
