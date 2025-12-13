# API Testing Quick Reference

Quick reference for testing the booking system API endpoints using curl or Postman.

---

## Authentication Tokens

All requests requiring authentication need the appropriate cookie:

- **User routes:** `authToken` cookie
- **Consultant routes:** `consultantAuthToken` cookie

For testing with curl, get your token from browser DevTools → Application → Cookies.

---

## 1. Google Calendar OAuth Flow

### Get OAuth URL (Consultant)

```bash
curl -X GET http://localhost:5000/api/google-calendar/auth-url \
  -H "Cookie: consultantAuthToken=YOUR_CONSULTANT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "OAuth URL generated",
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

### Manual Step: Visit OAuth URL

1. Open the `authUrl` in browser
2. Log in to Google account
3. Grant calendar permissions
4. You'll be redirected to callback URL

### Check Connection Status

```bash
curl -X GET http://localhost:5000/api/google-calendar/status \
  -H "Cookie: consultantAuthToken=YOUR_CONSULTANT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Calendar status retrieved",
  "data": {
    "isConnected": true,
    "email": "consultant@example.com",
    "connectedAt": "2025-12-10T...",
    "lastSyncedAt": "2025-12-10T..."
  }
}
```

### Disconnect Calendar

```bash
curl -X POST http://localhost:5000/api/google-calendar/disconnect \
  -H "Cookie: consultantAuthToken=YOUR_CONSULTANT_TOKEN"
```

---

## 2. Availability Check (Public)

### Get Available Slots

```bash
curl -X GET "http://localhost:5000/api/booking/availability/CONSULTANT_ID?date=2025-12-15&duration=60&timezone=America/New_York"
```

**Query Parameters:**

- `date` - Date in YYYY-MM-DD format
- `duration` - Session duration in minutes (30, 60, 90)
- `timezone` - IANA timezone (optional, defaults to UTC)

**Response:**

```json
{
  "success": true,
  "message": "Available slots retrieved",
  "data": {
    "slots": [
      {
        "start": "2025-12-15T14:00:00.000Z",
        "end": "2025-12-15T15:00:00.000Z",
        "available": true,
        "consultantId": "..."
      },
      {
        "start": "2025-12-15T15:00:00.000Z",
        "end": "2025-12-15T16:00:00.000Z",
        "available": false,
        "consultantId": "..."
      }
    ],
    "count": 8
  }
}
```

---

## 3. Create Booking (User)

### Create New Booking

```bash
curl -X POST http://localhost:5000/api/booking/create \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=YOUR_USER_TOKEN" \
  -d '{
    "consultantId": "CONSULTANT_ID",
    "sessionType": "60min",
    "startTime": "2025-12-15T14:00:00.000Z",
    "duration": 60,
    "userTimezone": "America/New_York",
    "userNotes": "Looking forward to discussing wellness goals"
  }'
```

**Request Body:**

- `consultantId` - Consultant's MongoDB ObjectId
- `sessionType` - "30min", "60min", or "90min"
- `startTime` - ISO 8601 datetime (UTC)
- `duration` - Duration in minutes (30, 60, 90)
- `userTimezone` - IANA timezone
- `userNotes` - Optional notes for consultant

**Response:**

```json
{
  "success": true,
  "message": "Booking created successfully. Please complete payment within 10 minutes.",
  "data": {
    "booking": {
      "_id": "...",
      "consultantId": {...},
      "userId": {...},
      "sessionType": "60min",
      "duration": 60,
      "startTime": "2025-12-15T14:00:00.000Z",
      "endTime": "2025-12-15T15:00:00.000Z",
      "status": "CREATED",
      "amount": 100,
      "currency": "usd",
      "createdAt": "2025-12-10T12:00:00.000Z",
      "effectiveStatus": "CREATED"
    }
  }
}
```

**Important:** Status is `CREATED`. Booking expires after 10 minutes if not confirmed.

---

## 4. Confirm Booking (User)

### Confirm After Payment

```bash
curl -X POST http://localhost:5000/api/booking/BOOKING_ID/confirm \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=YOUR_USER_TOKEN" \
  -d '{
    "paymentId": "pi_stripe_payment_id"
  }'
```

**Actions Performed:**

- Re-checks slot availability
- Creates Google Calendar event
- Updates status to `PAID`
- Sends confirmation email
- Returns meeting link

**Response:**

```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "booking": {
      "_id": "...",
      "status": "PAID",
      "googleCalendarEventId": "...",
      "meetingLink": "https://meet.google.com/...",
      "paymentId": "pi_...",
      "effectiveStatus": "PAID"
    }
  }
}
```

---

## 5. List Bookings

### Get User's Bookings

```bash
# All bookings
curl -X GET http://localhost:5000/api/booking/user/my-bookings \
  -H "Cookie: authToken=YOUR_USER_TOKEN"

# Only upcoming bookings
curl -X GET "http://localhost:5000/api/booking/user/my-bookings?upcoming=true" \
  -H "Cookie: authToken=YOUR_USER_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/booking/user/my-bookings?status=PAID" \
  -H "Cookie: authToken=YOUR_USER_TOKEN"
```

**Query Parameters:**

- `status` - Filter by status: "CREATED", "PAID", "CANCELLED"
- `upcoming` - Boolean, only show future bookings

**Response:**

```json
{
  "success": true,
  "message": "Bookings retrieved",
  "data": {
    "bookings": [
      {
        "_id": "...",
        "consultantId": {
          "_id": "...",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "profilePhoto": "..."
        },
        "sessionType": "60min",
        "startTime": "2025-12-15T14:00:00.000Z",
        "status": "PAID",
        "meetingLink": "https://meet.google.com/...",
        "effectiveStatus": "PAID"
      }
    ],
    "count": 1
  }
}
```

### Get Consultant's Bookings

```bash
# All bookings
curl -X GET http://localhost:5000/api/booking/consultant/my-bookings \
  -H "Cookie: consultantAuthToken=YOUR_CONSULTANT_TOKEN"

# Only upcoming bookings
curl -X GET "http://localhost:5000/api/booking/consultant/my-bookings?upcoming=true" \
  -H "Cookie: consultantAuthToken=YOUR_CONSULTANT_TOKEN"
```

---

## 6. Cancel Booking

### User Cancel

```bash
curl -X POST http://localhost:5000/api/booking/BOOKING_ID/cancel \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=YOUR_USER_TOKEN" \
  -d '{
    "cancellationReason": "Schedule conflict"
  }'
```

### Consultant Cancel

```bash
curl -X POST http://localhost:5000/api/booking/BOOKING_ID/consultant-cancel \
  -H "Content-Type: application/json" \
  -H "Cookie: consultantAuthToken=YOUR_CONSULTANT_TOKEN" \
  -d '{
    "cancellationReason": "Emergency - need to reschedule"
  }'
```

**Actions Performed:**

- Deletes Google Calendar event (if status was PAID)
- Updates status to `CANCELLED`
- Records who cancelled (user/consultant)
- Sends cancellation emails to both parties

**Response:**

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {
      "_id": "...",
      "status": "CANCELLED",
      "cancellationReason": "Schedule conflict",
      "cancelledBy": "user",
      "cancelledAt": "2025-12-10T13:00:00.000Z",
      "effectiveStatus": "CANCELLED"
    }
  }
}
```

---

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authenticated"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Booking not found"
}
```

### 409 Conflict (Slot Unavailable)

```json
{
  "success": false,
  "message": "This time slot is no longer available. Please select another slot."
}
```

### 410 Gone (Booking Expired)

```json
{
  "success": false,
  "message": "Booking has expired. Please create a new booking."
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Failed to create booking"
}
```

---

## Testing Workflow

### Complete Flow Test

1. **Setup** (One-time)

   - Get consultant auth token
   - Connect Google Calendar
   - Verify connection status

2. **Check Availability**

   - Call availability endpoint with date/duration
   - Note available time slots

3. **Create Booking** (as user)

   - Get user auth token
   - Create booking with selected slot
   - Note booking ID and 10-minute timer

4. **Confirm Booking** (within 10 minutes)

   - Call confirm endpoint with booking ID
   - Verify Google Calendar event created
   - Check for meeting link
   - Confirm email received

5. **View Bookings**

   - List user's bookings
   - List consultant's bookings
   - Verify booking appears in both lists

6. **Cancel Booking** (optional)
   - Cancel as user or consultant
   - Verify calendar event deleted
   - Check cancellation emails sent

### Testing Expiry

1. Create booking
2. **Wait 11 minutes** (don't confirm)
3. Try to confirm - should fail with 410 Gone
4. Check effectiveStatus shows "EXPIRED"

---

## Postman Collection

Save this collection to test all endpoints:

```json
{
  "info": {
    "name": "LifeScore Booking System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Google Calendar",
      "item": [
        {
          "name": "Get OAuth URL",
          "request": {
            "method": "GET",
            "header": [],
            "url": "{{baseUrl}}/api/google-calendar/auth-url"
          }
        },
        {
          "name": "Get Status",
          "request": {
            "method": "GET",
            "header": [],
            "url": "{{baseUrl}}/api/google-calendar/status"
          }
        },
        {
          "name": "Disconnect",
          "request": {
            "method": "POST",
            "header": [],
            "url": "{{baseUrl}}/api/google-calendar/disconnect"
          }
        }
      ]
    },
    {
      "name": "Booking",
      "item": [
        {
          "name": "Get Availability",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/booking/availability/:consultantId?date=2025-12-15&duration=60&timezone=America/New_York",
              "host": ["{{baseUrl}}"],
              "path": ["api", "booking", "availability", ":consultantId"],
              "query": [
                { "key": "date", "value": "2025-12-15" },
                { "key": "duration", "value": "60" },
                { "key": "timezone", "value": "America/New_York" }
              ]
            }
          }
        },
        {
          "name": "Create Booking",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"consultantId\": \"{{consultantId}}\",\n  \"sessionType\": \"60min\",\n  \"startTime\": \"2025-12-15T14:00:00.000Z\",\n  \"duration\": 60,\n  \"userTimezone\": \"America/New_York\",\n  \"userNotes\": \"Test booking\"\n}"
            },
            "url": "{{baseUrl}}/api/booking/create"
          }
        },
        {
          "name": "Confirm Booking",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"paymentId\": \"pi_test_12345\"\n}"
            },
            "url": "{{baseUrl}}/api/booking/:bookingId/confirm"
          }
        },
        {
          "name": "Get User Bookings",
          "request": {
            "method": "GET",
            "header": [],
            "url": "{{baseUrl}}/api/booking/user/my-bookings"
          }
        },
        {
          "name": "Get Consultant Bookings",
          "request": {
            "method": "GET",
            "header": [],
            "url": "{{baseUrl}}/api/booking/consultant/my-bookings"
          }
        },
        {
          "name": "Cancel Booking (User)",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"cancellationReason\": \"Schedule conflict\"\n}"
            },
            "url": "{{baseUrl}}/api/booking/:bookingId/cancel"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    },
    {
      "key": "consultantId",
      "value": "YOUR_CONSULTANT_ID"
    }
  ]
}
```

Set environment variables in Postman:

- `baseUrl`: `http://localhost:5000`
- `consultantId`: Replace with actual consultant MongoDB ID

---

## Tips

1. **Get Auth Tokens:**

   - Log in via browser
   - Open DevTools → Application → Cookies
   - Copy `authToken` (users) or `consultantAuthToken` (consultants)

2. **Test Different Timezones:**

   - Try `America/New_York`, `Europe/London`, `Asia/Tokyo`
   - Verify slots shown respect user's timezone

3. **Test Expiry:**

   - Create booking, note timestamp
   - Wait 11 minutes
   - Check `effectiveStatus` becomes "EXPIRED"

4. **Monitor Server Logs:**

   - Run `npm run dev` in server terminal
   - Watch for detailed error messages

5. **Check MongoDB:**
   - Use MongoDB Compass or mongosh
   - Inspect `bookings` and `consultants` collections
   - Verify data structure matches schema
