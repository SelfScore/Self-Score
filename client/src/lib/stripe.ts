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
export const LEVEL_PRICES = {
  2: 1,  // $1.00
  3: 2,  // $2.00
  4: 3,  // $3.00
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
