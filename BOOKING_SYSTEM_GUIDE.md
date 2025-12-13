# Google Calendar Booking System - Implementation Guide

## 📋 Overview

This guide covers the complete setup and implementation of the custom booking system using Google Calendar API for the LifeScore consultant platform.

---

## 🚀 Phase 1: Google Cloud Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Project name: "LifeScore Booking System"
4. Click "Create"

### Step 2: Enable Google Calendar API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and click "Enable"
4. Also enable "Google+ API" (for user info)

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:

   - User Type: **External**
   - App name: **LifeScore Booking**
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add these scopes:
     - `.../auth/calendar`
     - `.../auth/calendar.events`
     - `.../auth/userinfo.email`
   - Test users: Add your test email addresses
   - Click "Save and Continue"

4. Create OAuth Client ID:

   - Application type: **Web application**
   - Name: **LifeScore Consultant Calendar**
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/consultant/calendar/callback`
     - `https://yourdomain.com/consultant/calendar/callback`
   - Click "Create"

5. **Save your credentials:**
   - Client ID: `123456789-abcdefg.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxxxxxx`

### Step 4: Update Environment Variables

Update `/server/.env`:

```env
# Google Calendar Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/consultant/calendar/callback
```

---

## 📁 Implementation Status

### ✅ Completed Backend

1. **Database Models:**

   - ✅ `Booking` model (`/server/src/models/booking.ts`)
   - ✅ Updated `Consultant` model with Google Calendar fields
   - ✅ Booking types (`/server/src/types/booking.types.ts`)

2. **Services:**

   - ✅ Google Calendar Service (`/server/src/lib/googleCalendar.ts`)
   - ✅ Availability Service (`/server/src/lib/availability.ts`)

3. **Controllers:**

   - ✅ `BookingController` (`/server/src/controllers/booking.controller.ts`)
   - ✅ `GoogleCalendarController` (`/server/src/controllers/googleCalendar.controller.ts`)

4. **Routes:**

   - ✅ Booking routes (`/server/src/routes/booking.ts`)
   - ✅ Google Calendar routes (`/server/src/routes/googleCalendar.ts`)

5. **Email Notifications:**

   - ✅ Booking confirmation emails
   - ✅ Cancellation emails

6. **Status Management:**
   - ✅ `CREATED` - Booking reserved, awaiting payment
   - ✅ `PAID` - Payment successful, confirmed
   - ✅ `CANCELLED` - Cancelled booking
   - ✅ `EXPIRED` - Computed (CREATED + 10 mins > now)

### 🚧 To Be Implemented (Frontend)

#### Consultant Registration Step 5 (`/client/src/app/consultant/register/`)

1. **`Step5Calendar.tsx`** - Calendar connection page

   - `initiateOAuth` - Start OAuth flow
   - `handleCallback` - Handle OAuth callback
   - `disconnectCalendar` - Disconnect Google Calendar
   - `getCalendarStatus` - Check connection status

2. **Update `consultantAuth.controller.ts`**:
   - Add Step 5: Calendar Connection

#### Backend Routes (`/server/src/routes/`)

1. **`booking.ts`** - Booking routes

   ```typescript
   // Public
   GET  /api/booking/availability/:consultantId

   // User routes (auth required)
   POST /api/booking/create
   POST /api/booking/:bookingId/confirm
   POST /api/booking/:bookingId/cancel
   GET  /api/booking/user/my-bookings

   // Consultant routes (consultant auth required)
   GET  /api/booking/consultant/my-bookings
   POST /api/booking/:bookingId/consultant-cancel
   ```

2. **`googleCalendar.ts`** - Calendar routes
   ```typescript
   // Consultant routes (consultant auth required)
   GET / api / google - calendar / auth - url;
   GET / api / google - calendar / callback;
   POST / api / google - calendar / disconnect;
   GET / api / google - calendar / status;
   ```

#### Frontend (`/client/src/app/booking/`)

1. **Consultant Registration Step 5:**

   - `/consultant/register/Step5Calendar.tsx`
   - Calendar connection button
   - Availability configuration (Calendly-style)
   - Slot duration settings
   - Booking window settings

2. **User Booking Interface:**

   - `/booking/[consultantId]/page.tsx` - Main booking page
   - Service selection (30/60/90 min)
   - Date picker
   - Time slot selection grid
   - Booking form
   - `/booking/[consultantId]/success/page.tsx` - Success page

3. **Booking Management:**

   - `/user/bookings/page.tsx` - User's bookings
   - `/consultant/bookings/page.tsx` - Consultant's bookings

4. **Components:**
   - `TimeSlotPicker.tsx` - Interactive slot selection
   - `BookingCalendar.tsx` - Calendar view
   - `BookingCard.tsx` - Booking details card

---

## 🔧 Next Steps for Implementation

### Step 1: Implement Backend Controllers

Start with the Google Calendar controller:

```typescript
// /server/src/controllers/googleCalendar.controller.ts

import { Request, Response } from "express";
import { googleCalendarService } from "../lib/googleCalendar";
import ConsultantModel from "../models/consultant";

export class GoogleCalendarController {
  static async initiateOAuth(req: Request, res: Response) {
    const consultantId = (req as any).consultant?.consultantId;

    if (!consultantId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    try {
      const authUrl = googleCalendarService.getAuthUrl(consultantId);

      res.json({
        success: true,
        data: { authUrl },
      });
    } catch (error) {
      console.error("Error initiating OAuth:", error);
      res.status(500).json({
        success: false,
        message: "Failed to initiate Google Calendar connection",
      });
    }
  }

  static async handleCallback(req: Request, res: Response) {
    const { code, state } = req.query; // state contains consultantId

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    try {
      // Exchange code for tokens
      const tokens = await googleCalendarService.getTokens(code as string);

      // Get user email
      const userInfo = await googleCalendarService.getUserInfo(
        tokens.accessToken
      );

      // Get primary calendar ID
      const calendarId = await googleCalendarService.getPrimaryCalendarId(
        tokens.accessToken
      );

      // Update consultant record
      const consultant = await ConsultantModel.findById(state);

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      consultant.googleCalendar = {
        isConnected: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: tokens.expiryDate,
        email: userInfo.email,
        calendarId: calendarId,
        connectedAt: new Date(),
        lastSyncedAt: new Date(),
      };

      consultant.registrationStep = 5;
      await consultant.save();

      res.json({
        success: true,
        message: "Google Calendar connected successfully",
      });
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      res.status(500).json({
        success: false,
        message: "Failed to connect Google Calendar",
      });
    }
  }
}
```

### Step 2: Implement Booking Controller

```typescript
// /server/src/controllers/booking.controller.ts

import { Request, Response } from "express";
import { availabilityService } from "../lib/availability";
import BookingModel from "../models/booking";
import ConsultantModel from "../models/consultant";
import UserModel from "../models/user";

export class BookingController {
  static async getAvailableSlots(req: Request, res: Response) {
    const { consultantId } = req.params;
    const { date, duration } = req.query;

    try {
      const slots = await availabilityService.getAvailableSlots(
        consultantId,
        new Date(date as string),
        parseInt(duration as string),
        "UTC"
      );

      res.json({
        success: true,
        data: { slots },
      });
    } catch (error: any) {
      console.error("Error getting available slots:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get available slots",
      });
    }
  }

  static async createBooking(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const {
      consultantId,
      sessionType,
      startTime,
      duration,
      userTimezone,
      userNotes,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    try {
      // Check if slot is still available
      const isAvailable = await availabilityService.isSlotAvailable(
        consultantId,
        new Date(startTime),
        duration
      );

      if (!isAvailable) {
        return res.status(409).json({
          success: false,
          message: "This time slot is no longer available",
        });
      }

      // Get consultant timezone
      const consultant = await ConsultantModel.findById(consultantId);
      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      const consultantTimezone = consultant.bookingSettings?.timezone || "UTC";

      // Create booking with status CREATED
      const endTime = new Date(
        new Date(startTime).getTime() + duration * 60000
      );

      const booking = await BookingModel.create({
        consultantId,
        userId,
        sessionType,
        duration,
        startTime: new Date(startTime),
        endTime,
        userTimezone,
        consultantTimezone,
        status: "CREATED",
        userNotes,
      });

      res.status(201).json({
        success: true,
        message:
          "Booking created successfully. Please complete payment within 10 minutes.",
        data: { booking },
      });
    } catch (error: any) {
      console.error("Error creating booking:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create booking",
      });
    }
  }
}
```

### Step 3: Create Routes

```typescript
// /server/src/routes/booking.ts

import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/auth";
import { consultantAuthMiddleware } from "../middleware/consultantAuth";

const router = Router();

// Public routes
router.get("/availability/:consultantId", BookingController.getAvailableSlots);

// User routes (requires authentication)
router.post("/create", authMiddleware, BookingController.createBooking);
router.post(
  "/:bookingId/confirm",
  authMiddleware,
  BookingController.confirmBooking
);
router.post(
  "/:bookingId/cancel",
  authMiddleware,
  BookingController.cancelBooking
);
router.get(
  "/user/my-bookings",
  authMiddleware,
  BookingController.getUserBookings
);

// Consultant routes
router.get(
  "/consultant/my-bookings",
  consultantAuthMiddleware,
  BookingController.getConsultantBookings
);
router.post(
  "/:bookingId/consultant-cancel",
  consultantAuthMiddleware,
  BookingController.consultantCancelBooking
);

export default router;
```

### Step 4: Update Routes Index

Add to `/server/src/routes/index.ts`:

```typescript
import bookingRoutes from "./booking";
import googleCalendarRoutes from "./googleCalendar";

// ... existing imports

router.use("/booking", bookingRoutes);
router.use("/google-calendar", googleCalendarRoutes);
```

---

## 🧪 Testing Workflow

### 1. Test Google OAuth Flow

```bash
# 1. Start backend
cd server && npm run dev

# 2. As consultant, initiate OAuth
GET http://localhost:5001/api/google-calendar/auth-url

# 3. Visit the returned URL in browser
# 4. Authorize with your Google account
# 5. You'll be redirected to callback URL
# 6. Backend handles callback and stores tokens
```

### 2. Test Availability Fetching

```bash
# Get available slots for a consultant
GET http://localhost:5001/api/booking/availability/[consultantId]?date=2025-12-15&duration=60
```

### 3. Test Booking Creation

```bash
# Create a booking (as authenticated user)
POST http://localhost:5001/api/booking/create
{
  "consultantId": "...",
  "sessionType": "60min",
  "startTime": "2025-12-15T14:00:00Z",
  "duration": 60,
  "userTimezone": "America/New_York",
  "userNotes": "Looking forward to the session"
}
```

---

## 📊 Data Flow

### Booking Creation Flow:

1. **User selects slot** → Frontend calls `/api/booking/availability/:consultantId`
2. **User clicks "Book"** → Frontend calls `/api/booking/create`
3. **Backend checks availability** → Queries Google Calendar + Database
4. **If available** → Creates booking with status `CREATED`
5. **User pays** (future) → Backend calls `/api/booking/:id/confirm`
6. **Backend confirms** → Creates Google Calendar event → Status `PAID`
7. **Send emails** → User + Consultant notified

### Calendar Sync Flow:

1. **Consultant connects calendar** → OAuth flow → Tokens stored
2. **User requests slots** → Backend fetches from Google Calendar
3. **Merge availability** → Google Calendar + Consultant settings + Existing bookings
4. **Return available slots** → Frontend displays

---

## 🔐 Security Considerations

1. **Token Storage:** Access/refresh tokens stored with `select: false`
2. **Token Refresh:** Automatic refresh before expiry (5 min buffer)
3. **Booking Validation:** Always re-check availability before creation
4. **Time Buffer:** 3-hour minimum booking buffer
5. **Expiry Check:** 10-minute payment window with automatic expiry

---

## 📈 Next Features (Future)

1. **Payment Integration** - Stripe for booking payments
2. **Email Notifications** - Booking confirmations, reminders
3. **Rescheduling** - Allow users to reschedule bookings
4. **Recurring Bookings** - Weekly/monthly sessions
5. **Waitlist** - Notify when consultant becomes available
6. **Timezone Detection** - Auto-detect user timezone
7. **Calendar View** - Visual calendar for consultants
8. **Analytics** - Booking stats, revenue tracking

---

## 🐛 Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution:** Ensure redirect URI in Google Cloud Console exactly matches your env variable

### Issue: "Token expired"

**Solution:** Token refresh is automatic. Check if refresh token is valid.

### Issue: "Slot not available"

**Solution:** Re-fetch slots before booking. Another user may have booked it.

### Issue: "Calendar not connected"

**Solution:** Consultant must complete Step 5 of registration (calendar connection)

---

## 📚 Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Calendar Quickstart](https://developers.google.com/calendar/api/quickstart/nodejs)

---

**Status:** Backend foundations complete. Ready for controller and frontend implementation.
**Last Updated:** December 10, 2025
