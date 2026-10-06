# Stripe Coupon & Promotion Code Implementation Plan (HAPPY20)

## 📌 Overview

This document outlines the implementation plan for introducing promotional discount codes (e.g., `HAPPY20` for 20% off) for users purchasing the SelfScore assessment bundle (Levels 4 & 5).

Since users make only **one purchase across their entire platform lifecycle** to unlock premium assessments, the industry-standard approach is to leverage **Stripe Checkout's native promotion code engine**. This avoids creating unnecessary database models, frontend code, or custom discount validation endpoints.

---

## 🎯 Objectives

1. Enable users to enter coupon codes like `HAPPY20` during checkout.
2. Allow every user to redeem the 20% discount on their purchase.
3. Keep code changes minimal, clean, and zero-maintenance.
4. Ensure invoices, database records, and transaction histories store the actual discounted amount paid ($20.00 instead of $25.00).

---

## 🏗️ Architecture & Flow

```
┌────────────────────────────────┐
│ User clicks "Unlock with       │
│ Premium" ($25.00)              │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│ Backend creates Stripe         │
│ Checkout session with:         │
│ allow_promotion_codes: true    │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────────┐
│ Stripe Hosted Checkout Page                                │
│                                                            │
│ • Displays built-in "Add promotion code" link             │
│ • User enters: HAPPY20                                     │
│ • Stripe validates & applies 20% off                       │
│ • Total updates to $20.00                                  │
│ • User completes payment                                   │
└───────────────┬────────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────────┐
│ Payment Verification & Webhook                             │
│                                                            │
│ • Updates Payment record with session.amount_total ($20)   │
│ • Unlocks Levels 4 & 5 for user                            │
│ • Invoices and history show accurate discounted amount     │
└────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Changes Required

All code changes are confined to **a single file**: `server/src/controllers/payment.controller.ts`.

### 1. Enable Promo Codes in Checkout Session
**Function:** `PaymentController.createCheckoutSession`  
**File:** `server/src/controllers/payment.controller.ts`

```diff
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
+   allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: productName,
            description: productDescription,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/user/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/user/payment/cancel`,
    client_reference_id: userId,
    metadata: {
      userId,
      level: level.toString(),
    },
  });
```

---

### 2. Record Discounted Amount in `verifyPayment`
**Function:** `PaymentController.verifyPayment`  
**File:** `server/src/controllers/payment.controller.ts`

When payment is confirmed upon return from Stripe, update `payment.amount` with `session.amount_total`:

```diff
  if (session.payment_status === "paid") {
    // Update payment record
    payment.status = "completed";
    payment.stripePaymentIntentId = session.payment_intent as string;
+   if (session.amount_total !== null && session.amount_total !== undefined) {
+     payment.amount = session.amount_total;
+   }
    await payment.save();
```

---

### 3. Record Discounted Amount in `handleWebhook`
**Function:** `PaymentController.handleWebhook`  
**File:** `server/src/controllers/payment.controller.ts`

When Stripe dispatches the asynchronous `checkout.session.completed` event:

```diff
  payment.status = "completed";
  payment.stripePaymentIntentId = session.payment_intent as string;
+ if (session.amount_total !== null && session.amount_total !== undefined) {
+   payment.amount = session.amount_total;
+ }
  await payment.save();
```

---

## 🛠️ Stripe Dashboard Setup Guide (HAPPY20)

No code is required to create, update, or expire coupon codes. You manage them directly in the Stripe Dashboard.

### Step-by-Step Instructions:

1. **Log in to Stripe Dashboard**:
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com).
   - Ensure you are in **Test Mode** during development.

2. **Navigate to Coupons**:
   - In the left navigation, select **Product catalog** → **Coupons** (or search "Coupons" in the search bar).
   - Click **+ New** (or **Create a coupon**).

3. **Configure the Coupon**:
   - **Name**: `20% Off Promotion`
   - **Type**: Select **Percentage discount**.
   - **Percentage off**: `20`%.
   - **Duration**: Select **Once** (applies one time per checkout).
   - **Currency**: `USD` (if prompted).

4. **Add Customer-Facing Promotion Code**:
   - Check the box **"Use customer-facing promotion code"**.
   - **Promotion code**: Enter `HAPPY20`.
   - *(Optional)* **Eligible for first-time orders only**: Checked.
   - *(Optional)* **Limit the total number of redemptions**: Set a global cap (e.g., 500) if needed.
   - *(Optional)* **Set an expiry date**: Set an expiration date if this is a time-limited campaign.

5. **Save**:
   - Click **Create coupon**. The code `HAPPY20` is now active immediately.

---

## 📋 Testing & Validation Checklist

| # | Step | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | Run server TypeScript build (`npx tsc --noEmit`) | Passes with 0 errors | ⏳ Pending |
| 2 | Click "Unlock with Premium" on Level 4/5 | Redirects to Stripe Checkout | ⏳ Pending |
| 3 | Inspect Stripe Checkout page | **"Add promotion code"** link is visible | ⏳ Pending |
| 4 | Enter `HAPPY20` and click Apply | Price discounts from $25.00 to $20.00 (-$5.00) | ⏳ Pending |
| 5 | Complete checkout using test card (e.g., `4242...`) | Redirects to success page; access granted | ⏳ Pending |
| 6 | Check MongoDB `payments` collection | `amount` is recorded as `2000` (cents) | ⏳ Pending |
| 7 | Download invoice PDF from user dashboard | Invoice reflects total paid: `$20.00` | ⏳ Pending |

---

## 🚀 Future Enhancements (Optional)

- **Multiple Codes**: You can add any number of additional promo codes in Stripe (e.g., `SPECIAL10`, `LAUNCH50`) without writing a single line of new code.
- **Affiliate / Influencer Codes**: Stripe supports creating specific promotion codes mapped to individual influencers or affiliate partners for tracking.
