# Cal.com Integration Documentation

## Overview

This document provides a comprehensive guide to the Cal.com integration for the LifeScore consultant booking system. The integration allows consultants to connect their Cal.com accounts to enable seamless booking management for their consultation services.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Setup & Configuration](#setup--configuration)
3. [OAuth Flow](#oauth-flow)
4. [Webhook System](#webhook-system)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Frontend Components](#frontend-components)
8. [Email Notifications](#email-notifications)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Architecture

### High-Level Flow

```
Consultant Dashboard → Connect Cal.com Button → OAuth Authorization →
Cal.com Callback → Token Exchange → Create Event Types → Setup Webhook →
Store Integration Data → Display Booking Links → Client Books Session →
Webhook Notification → Store Booking → Send Emails
```

### Components

- **Backend**: Express.js controllers, routes, and Cal.com API integration
- **Frontend**: Next.js pages for dashboard, callback handling, and public profiles
- **Database**: MongoDB models for consultants and bookings
- **External Service**: Cal.com OAuth and API

---

## Setup & Configuration

### 1. Register Your App with Cal.com

1. Go to [Cal.com Developer Settings](https://app.cal.com/settings/developer)
2. Click "Create OAuth App"
3. Fill in the application details:
   - **Name**: LifeScore Consultant Platform
   - **Description**: Booking integration for wellness consultants
   - **Redirect URI**: `http://localhost:3000/consultant/calcom/callback` (development)
   - **Redirect URI**: `https://yourdomain.com/consultant/calcom/callback` (production)
4. Save and note down:
   - `client_id`
   - `client_secret`

### 2. Configure Environment Variables

**Server (.env)**:

```env
# Cal.com Configuration
CALCOM_CLIENT_ID=your_calcom_client_id_here
CALCOM_CLIENT_SECRET=your_calcom_client_secret_here
CALCOM_REDIRECT_URI=http://localhost:3000/consultant/calcom/callback
CALCOM_WEBHOOK_SECRET=your_calcom_webhook_secret_here
CALCOM_API_URL=https://api.cal.com/v1
SERVER_URL=http://localhost:5001
```

**Notes**:

- Replace `your_calcom_client_id_here` with your actual Cal.com client ID
- Replace `your_calcom_client_secret_here` with your actual Cal.com client secret
- Generate a secure random string for `CALCOM_WEBHOOK_SECRET` (e.g., using `openssl rand -hex 32`)
- Update `CALCOM_REDIRECT_URI` and `SERVER_URL` for production deployment

### 3. Install Dependencies

The following packages are required (already included in package.json):

- `axios` - For Cal.com API requests
- `crypto` - For webhook signature verification (built-in Node.js)

---

## OAuth Flow

### Step-by-Step Process

#### 1. **Initiate OAuth**

```typescript
// User clicks "Connect Cal.com" button
// Frontend calls: GET /api/calcom/auth-url
// Backend generates: https://app.cal.com/oauth/authorize?client_id=...&redirect_uri=...
```

#### 2. **User Authorization**

- User is redirected to Cal.com
- If no account: User creates a free Cal.com account
- If has account: User authorizes the app
- Cal.com redirects to: `http://localhost:3000/consultant/calcom/callback?code=AUTH_CODE&state=STATE`

#### 3. **Callback Handling**

```typescript
// Frontend receives callback with code
// Frontend calls: POST /api/calcom/callback { code, state }
// Backend exchanges code for tokens
```

#### 4. **Token Exchange**

```typescript
POST https://app.cal.com/oauth/token
{
  client_id: CALCOM_CLIENT_ID,
  client_secret: CALCOM_CLIENT_SECRET,
  code: AUTH_CODE,
  grant_type: "authorization_code",
  redirect_uri: CALCOM_REDIRECT_URI
}

Response:
{
  access_token: "...",
  refresh_token: "...",
  expires_in: 3600
}
```

#### 5. **Fetch User Profile**

```typescript
GET https://api.cal.com/v1/me
Headers: { Authorization: "Bearer ACCESS_TOKEN" }

Response:
{
  id: 123,
  username: "consultant_username",
  email: "consultant@example.com",
  ...
}
```

#### 6. **Create Event Types**

For each enabled service (30min, 60min, 90min):

```typescript
POST https://api.cal.com/v1/event-types
{
  title: "30 Min Consultation",
  slug: "consultation-30min",
  length: 30,
  description: "30-minute consultation session",
  hidden: false
}
```

#### 7. **Setup Webhook**

```typescript
POST https://api.cal.com/v1/webhooks
{
  subscriberUrl: "http://yourdomain.com/api/calcom/webhook",
  eventTriggers: ["BOOKING_CREATED", "BOOKING_RESCHEDULED", "BOOKING_CANCELLED"],
  active: true
}
```

#### 8. **Store Integration Data**

```typescript
consultant.calcom = {
  isConnected: true,
  accessToken: "...",
  refreshToken: "...",
  username: "consultant_username",
  userId: "123",
  eventTypes: {
    duration30: { id: 1, slug: "...", link: "https://cal.com/username/..." },
    duration60: { id: 2, slug: "...", link: "..." },
    duration90: { id: 3, slug: "...", link: "..." },
  },
  webhookId: "webhook_id",
  connectedAt: new Date(),
  lastSyncedAt: new Date(),
};
```

---

## Webhook System

### Webhook URL

```
POST http://yourdomain.com/api/calcom/webhook
```

### Signature Verification

```typescript
// Cal.com sends: X-Cal-Signature header
const signature = req.headers["x-cal-signature"];
const payload = JSON.stringify(req.body);

// Verify using HMAC-SHA256
const expectedSignature = crypto
  .createHmac("sha256", CALCOM_WEBHOOK_SECRET)
  .update(payload)
  .digest("hex");

if (signature !== expectedSignature) {
  return res.status(401).json({ error: "Invalid signature" });
}
```

### Supported Events

#### 1. BOOKING_CREATED

```json
{
  "triggerEvent": "BOOKING_CREATED",
  "payload": {
    "id": 12345,
    "uid": "booking_uid_string",
    "title": "30 Min Consultation",
    "description": "...",
    "startTime": "2025-11-25T10:00:00Z",
    "endTime": "2025-11-25T10:30:00Z",
    "attendees": [
      {
        "name": "Client Name",
        "email": "client@example.com",
        "timeZone": "America/New_York",
        "locale": "en"
      }
    ],
    "eventType": {
      "id": 1,
      "slug": "consultation-30min",
      "userId": 123
    },
    "metadata": {
      "videoCallUrl": "https://meet.google.com/...",
      "location": "Google Meet"
    }
  }
}
```

**Action**: Create booking record, send confirmation emails

#### 2. BOOKING_RESCHEDULED

```json
{
  "triggerEvent": "BOOKING_RESCHEDULED",
  "payload": {
    "id": 12345,
    "uid": "booking_uid_string",
    "startTime": "2025-11-26T14:00:00Z",
    "endTime": "2025-11-26T14:30:00Z"
  }
}
```

**Action**: Update booking times, send reschedule notification

#### 3. BOOKING_CANCELLED

```json
{
  "triggerEvent": "BOOKING_CANCELLED",
  "payload": {
    "id": 12345,
    "cancellationReason": "Client requested cancellation"
  }
}
```

**Action**: Mark booking as cancelled, send cancellation emails

---

## API Endpoints

### Backend Endpoints

#### Get OAuth Authorization URL

```
GET /api/calcom/auth-url
Authorization: Bearer consultantAuthToken
```

**Response**:

```json
{
  "success": true,
  "message": "Authorization URL generated",
  "data": {
    "authUrl": "https://app.cal.com/oauth/authorize?..."
  }
}
```

#### Handle OAuth Callback

```
POST /api/calcom/callback
Body: { code: string, state: string }
```

**Response**:

```json
{
  "success": true,
  "message": "Cal.com connected successfully",
  "data": {
    "username": "consultant_username",
    "eventTypes": { ... },
    "connectedAt": "2025-11-25T..."
  }
}
```

#### Get Connection Status

```
GET /api/calcom/status
Authorization: Bearer consultantAuthToken
```

**Response**:

```json
{
  "success": true,
  "data": {
    "isConnected": true,
    "username": "consultant_username",
    "eventTypes": { ... },
    "connectedAt": "...",
    "lastSyncedAt": "..."
  }
}
```

#### Disconnect Cal.com

```
POST /api/calcom/disconnect
Authorization: Bearer consultantAuthToken
```

#### Get Consultant Bookings

```
GET /api/calcom/bookings?status=scheduled&startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer consultantAuthToken
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "calcomBookingId": 12345,
      "attendee": { "name": "...", "email": "..." },
      "startTime": "...",
      "endTime": "...",
      "duration": 30,
      "status": "scheduled",
      ...
    }
  ]
}
```

#### Webhook Endpoint

```
POST /api/calcom/webhook
Headers: { X-Cal-Signature: "signature_string" }
Body: { triggerEvent: string, payload: object }
```

---

## Database Schema

### Consultant Model (Updated Fields)

```typescript
calcom: {
  isConnected: boolean;
  accessToken?: string;          // Encrypted in production
  refreshToken?: string;          // Encrypted in production
  username?: string;
  userId?: string;                // Cal.com user ID
  eventTypes?: {
    duration30?: {
      id: number;
      slug: string;
      link: string;
    };
    duration60?: { ... };
    duration90?: { ... };
  };
  webhookId?: string;
  connectedAt?: Date;
  lastSyncedAt?: Date;
}
```

### Booking Model (New)

```typescript
{
  calcomBookingId: number;        // Cal.com booking ID
  calcomBookingUid: string;       // Cal.com booking UID
  consultantId: ObjectId;         // Reference to Consultant
  userId?: ObjectId;              // Reference to User (if registered)
  attendee: {
    name: string;
    email: string;
    timeZone: string;
    locale?: string;
  };
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  duration: number;               // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  eventTypeId: number;
  eventTypeSlug: string;
  meetingUrl?: string;
  location?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: 'consultant' | 'user' | 'system';
  rescheduledFrom?: ObjectId;
  rescheduledTo?: ObjectId;
  metadata?: object;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Frontend Components

### Consultant Dashboard

**Path**: `/consultant/dashboard`

Features:

- Display Cal.com connection status
- "Connect Cal.com" button (if not connected)
- Booking links display (if connected)
- "Disconnect Cal.com" button (if connected)

### OAuth Callback Page

**Path**: `/consultant/calcom/callback`

Features:

- Loading indicator during token exchange
- Success message with redirect
- Error handling with retry option

### Public Consultant Profile

**Path**: `/consultations/[consultantId]`

Features:

- Display consultant services
- "Book Now" buttons (if Cal.com connected)
- Direct links to Cal.com booking pages
- Opens in new tab for seamless booking

---

## Email Notifications

### Booking Confirmation

**Sent to**: Both consultant and attendee
**Trigger**: BOOKING_CREATED webhook
**Contains**:

- Appointment details
- Date & time
- Duration
- Meeting link
- Preparation tips

### Booking Cancellation

**Sent to**: Both consultant and attendee
**Trigger**: BOOKING_CANCELLED webhook
**Contains**:

- Cancelled appointment details
- Cancellation reason (if provided)
- Rebooking instructions

---

## Testing

### Manual Testing Checklist

#### OAuth Flow

- [ ] Click "Connect Cal.com" button
- [ ] Redirected to Cal.com authorization page
- [ ] Create new Cal.com account (test account creation)
- [ ] Authorize the app
- [ ] Redirected back to callback page
- [ ] Success message displayed
- [ ] Redirected to dashboard
- [ ] Cal.com status shows "Connected"
- [ ] Booking links displayed

#### Booking Flow

- [ ] Navigate to consultant public profile
- [ ] Verify "Book Now" buttons appear
- [ ] Click "Book Now" for 30min session
- [ ] Cal.com booking page opens in new tab
- [ ] Complete booking (use test email)
- [ ] Verify webhook received by backend
- [ ] Check booking created in database
- [ ] Verify confirmation emails sent

#### Disconnection

- [ ] Click "Disconnect Cal.com" button
- [ ] Confirm disconnection
- [ ] Verify status changes to "Not Connected"
- [ ] Verify booking links removed from profile

### Webhook Testing

Use a tool like [ngrok](https://ngrok.com/) to expose your local server:

```bash
# Start ngrok
ngrok http 5001

# Update Cal.com webhook URL to ngrok URL
https://your-ngrok-url.ngrok.io/api/calcom/webhook
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid signature" on webhook

**Cause**: Webhook secret mismatch
**Solution**: Verify `CALCOM_WEBHOOK_SECRET` matches the secret configured in Cal.com

#### 2. OAuth redirect fails

**Cause**: Redirect URI mismatch
**Solution**: Ensure `CALCOM_REDIRECT_URI` in .env matches the URI configured in Cal.com OAuth app

#### 3. Event types not created

**Cause**: Consultant services not enabled
**Solution**: Ensure consultant has enabled at least one service (30/60/90min) before connecting Cal.com

#### 4. Booking links not showing

**Cause**: Cal.com integration not complete or consultant not approved
**Solution**:

- Verify consultant is approved
- Check `consultant.calcom.isConnected` is true
- Verify event types exist in `consultant.calcom.eventTypes`

#### 5. Webhook not receiving events

**Cause**: Webhook URL not accessible or incorrect
**Solution**:

- Verify `SERVER_URL` is publicly accessible
- Check webhook is created successfully in Cal.com
- Test webhook endpoint manually with curl

### Debug Mode

Enable detailed logging:

```typescript
// In server/src/controllers/calcom.controller.ts
console.log("Cal.com webhook received:", JSON.stringify(event, null, 2));
```

### Health Check

Verify Cal.com integration status:

```bash
# Check consultant Cal.com status
curl -X GET http://localhost:5001/api/calcom/status \
  -H "Cookie: consultantAuthToken=YOUR_TOKEN"

# Check bookings
curl -X GET http://localhost:5001/api/calcom/bookings \
  -H "Cookie: consultantAuthToken=YOUR_TOKEN"
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Update `CALCOM_REDIRECT_URI` to production URL
- [ ] Update `SERVER_URL` to production URL
- [ ] Encrypt tokens before storing in database
- [ ] Set up SSL/TLS for webhook endpoint
- [ ] Configure Cal.com webhook URL to production
- [ ] Test OAuth flow with production URLs
- [ ] Set up monitoring for webhook failures
- [ ] Configure email service for production
- [ ] Set up error tracking (e.g., Sentry)

### Security Recommendations

1. **Encrypt Sensitive Data**: Encrypt `accessToken` and `refreshToken` before storing
2. **Rate Limiting**: Implement rate limiting on OAuth and webhook endpoints
3. **Token Refresh**: Implement automatic token refresh before expiry
4. **Audit Logging**: Log all Cal.com API calls for debugging
5. **HTTPS Only**: Enforce HTTPS for all webhook communications

---

## Support & Resources

- **Cal.com API Documentation**: https://cal.com/docs/api-reference
- **Cal.com OAuth Guide**: https://cal.com/docs/oauth
- **Cal.com Webhooks**: https://cal.com/docs/webhooks
- **Cal.com Support**: https://cal.com/support

---

## Version History

- **v1.0.0** (2025-11-25): Initial Cal.com integration implementation
  - OAuth flow
  - Webhook system
  - Booking management
  - Email notifications
