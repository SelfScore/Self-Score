import Stripe from "stripe";

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn(
    "⚠️  STRIPE_SECRET_KEY not found in environment variables. Payment features will not work.",
  );
}

export const stripe = new Stripe(stripeSecretKey || "sk_test_dummy", {
  apiVersion: "2025-09-30.clover",
  typescript: true,
});

// Level pricing configuration (in cents)
// Only Level 4 remains a paid bundle; Levels 2 and 3 are free.
export const LEVEL_PRICES = {
  4: 2500, // $25.00 USD - Levels 2 + 3 + 4 bundle
} as const;

export const CURRENCY = "usd";

// Helper to get price for a level
export const getLevelPrice = (level: number): number | null => {
  if (level in LEVEL_PRICES) {
    return LEVEL_PRICES[level as keyof typeof LEVEL_PRICES];
  }
  return null;
};

// Helper to format price for display
export const formatPrice = (
  amountInCents: number,
  currency: string = CURRENCY,
): string => {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};
