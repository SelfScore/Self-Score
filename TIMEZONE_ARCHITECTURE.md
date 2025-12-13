# Timezone and Slot Storage Architecture

## Overview

Your booking system handles timezones and availability slots using a **UTC-based storage** approach with **timezone-aware display**. This is the industry-standard pattern used by Calendly, Cal.com, and other scheduling platforms.

---

## 🗄️ Database Storage

### 1. **Consultant Availability (Static Schedule)**

**Location**: `consultant.bookingSettings.availability`

**Storage Format**:

```typescript
bookingSettings: {
  availability: [
    {
      dayOfWeek: 1,              // 0=Sunday, 6=Saturday
      timeRanges: [
        {
          startTime: "09:00",    // HH:mm in consultant's timezone
          endTime: "17:00"       // HH:mm in consultant's timezone
        },
        {
          startTime: "19:00",    // Can have multiple ranges per day
          endTime: "21:00"
        }
      ],
      isAvailable: true
    }
  ],
  timezone: "America/New_York",  // Consultant's timezone
  bufferBetweenSessions: 10,     // Minutes between sessions
  minAdvanceBookingHours: 3,     // Minimum booking notice
  maxAdvanceBookingMonths: 6     // Maximum future booking
}
```

**Key Points**:

- ✅ Times stored in **consultant's local time** (e.g., "09:00" means 9 AM in their timezone)
- ✅ **Day of week** is timezone-independent (Monday is always 1)
- ✅ Consultant's **timezone stored separately**
- ✅ Multiple time ranges per day supported

---

### 2. **Bookings (Actual Appointments)**

**Location**: `Booking` collection

**Storage Format**:

```typescript
{
  consultantId: ObjectId,
  userId: ObjectId,

  // Times stored in UTC
  startTime: Date,              // UTC timestamp
  endTime: Date,                // UTC timestamp

  // Timezone info for display
  userTimezone: "America/Los_Angeles",
  consultantTimezone: "America/New_York",

  sessionType: "60min",
  duration: 60,
  status: "PAID"
}
```

**Key Points**:

- ✅ **All times stored in UTC** for consistency
- ✅ Both user and consultant timezones stored for display
- ✅ UTC prevents ambiguity with DST changes
- ✅ Easy to query by time ranges

---

## 🔄 Timezone Conversion Flow

### **Step 1: Consultant Sets Availability**

**Client Side** (`Step5Calendar.tsx`):

```typescript
// Consultant sets: Mon-Fri, 9 AM - 5 PM in their timezone
bookingSettings: {
  availability: [
    { dayOfWeek: 1, timeRanges: [{ startTime: "09:00", endTime: "17:00" }] }
  ],
  timezone: "America/New_York"  // Auto-detected or selected
}
```

**Database** (MongoDB):

```json
{
  "bookingSettings": {
    "availability": [
      {
        "dayOfWeek": 1,
        "timeRanges": [{ "startTime": "09:00", "endTime": "17:00" }]
      }
    ],
    "timezone": "America/New_York"
  }
}
```

**No conversion needed** - times are stored as-is in consultant's timezone.

---

### **Step 2: User Requests Available Slots**

**Client Request** (`ConsultantProfilePage.tsx`):

```typescript
// User in Los Angeles viewing slots for Dec 15, 2025
const response = await bookingService.getAvailableSlots({
  consultantId: "123",
  date: "2025-12-15", // User's local date
  duration: 60,
  timezone: "America/Los_Angeles", // User's timezone
});
```

**Server Processing** (`availability.ts`):

1. **Fetch consultant settings**:

```typescript
const consultant = await ConsultantModel.findById(consultantId);
// consultant.bookingSettings.timezone = "America/New_York"
// consultant.bookingSettings.availability[0].timeRanges = [{ "09:00", "17:00" }]
```

2. **Convert consultant's schedule to UTC**:

```typescript
// Consultant: Mon 9 AM - 5 PM EST (America/New_York)
// Dec 15, 2025 is a Monday

// 9:00 AM EST = 14:00 UTC (9 + 5)
// 5:00 PM EST = 22:00 UTC (17 + 5)

const startDateTime = combineDateTime(
  new Date("2025-12-15"),
  "09:00",
  "America/New_York"
); // = 2025-12-15T14:00:00Z (UTC)

const endDateTime = combineDateTime(
  new Date("2025-12-15"),
  "17:00",
  "America/New_York"
); // = 2025-12-15T22:00:00Z (UTC)
```

3. **Check existing bookings** (already in UTC):

```typescript
const existingBookings = await BookingModel.find({
  consultantId: "123",
  startTime: { $gte: startOfDay, $lt: endOfDay },
  status: { $in: ["CREATED", "PAID"] },
});
// Returns: [{ startTime: 2025-12-15T15:00:00Z, endTime: 2025-12-15T16:00:00Z }]
```

4. **Check Google Calendar busy times** (returns UTC):

```typescript
const busySlots = await googleCalendarService.getFreeBusy(
  accessToken,
  calendarId,
  startDateTime, // UTC
  endDateTime // UTC
);
// Returns: [{ start: 2025-12-15T18:00:00Z, end: 2025-12-15T19:00:00Z }]
```

5. **Generate available slots**:

```typescript
// Generate slots every 60 min + 10 min buffer = 70 minutes apart
// From 14:00 UTC to 22:00 UTC
// Exclude busy times: 15:00-16:00 and 18:00-19:00

slots = [
  { start: 14:00 UTC, end: 15:00 UTC, available: true },
  { start: 15:10 UTC, end: 16:10 UTC, available: false }, // Conflict
  { start: 16:20 UTC, end: 17:20 UTC, available: true },
  { start: 17:30 UTC, end: 18:30 UTC, available: false }, // Conflict
  { start: 18:40 UTC, end: 19:40 UTC, available: true },
  { start: 19:50 UTC, end: 20:50 UTC, available: true },
  { start: 21:00 UTC, end: 22:00 UTC, available: false }  // Exceeds end time
]
```

**Client Receives** (UTC timestamps):

```json
{
  "success": true,
  "data": {
    "slots": [
      {
        "start": "2025-12-15T14:00:00.000Z",
        "end": "2025-12-15T15:00:00.000Z",
        "available": true
      },
      {
        "start": "2025-12-15T16:20:00.000Z",
        "end": "2025-12-15T17:20:00.000Z",
        "available": true
      }
    ]
  }
}
```

**Client Displays** (converts to user's timezone):

```typescript
// User in Los Angeles (PST = UTC-8)
// 14:00 UTC = 6:00 AM PST
// 16:20 UTC = 8:20 AM PST

// Displayed as:
// "6:00 AM - 7:00 AM"  ✓ Available
// "8:20 AM - 9:20 AM"  ✓ Available
```

---

### **Step 3: User Books a Slot**

**Client Request**:

```typescript
await bookingService.createBooking({
  consultantId: "123",
  sessionType: "60min",
  startTime: "2025-12-15T14:00:00.000Z", // Selected slot (UTC)
  duration: 60,
  userTimezone: "America/Los_Angeles",
  userNotes: "Looking forward to it!",
});
```

**Server Processing**:

```typescript
// Validate slot is still available
const isAvailable = await availabilityService.isSlotAvailable(
  consultantId,
  new Date("2025-12-15T14:00:00.000Z"),
  60
);

// Calculate end time
const endTime = new Date("2025-12-15T15:00:00.000Z");

// Create booking
const booking = await BookingModel.create({
  consultantId: "123",
  userId: "456",
  startTime: new Date("2025-12-15T14:00:00.000Z"), // UTC
  endTime: new Date("2025-12-15T15:00:00.000Z"), // UTC
  userTimezone: "America/Los_Angeles",
  consultantTimezone: "America/New_York",
  status: "CREATED",
});
```

**Database Storage**:

```json
{
  "_id": "booking123",
  "consultantId": "123",
  "userId": "456",
  "startTime": "2025-12-15T14:00:00.000Z",
  "endTime": "2025-12-15T15:00:00.000Z",
  "userTimezone": "America/Los_Angeles",
  "consultantTimezone": "America/New_York",
  "status": "CREATED"
}
```

---

### **Step 4: Send Confirmation Emails**

**Email to User** (Los Angeles time):

```
Your booking is confirmed!
Date: Monday, December 15, 2025
Time: 6:00 AM - 7:00 AM PST
```

**Email to Consultant** (New York time):

```
New booking received!
Date: Monday, December 15, 2025
Time: 9:00 AM - 10:00 AM EST
```

**Code**:

```typescript
// Convert UTC to user's timezone for display
const userLocalTime = formatInTimeZone(
  booking.startTime,
  booking.userTimezone,
  "h:mm a z"
); // "6:00 AM PST"

const consultantLocalTime = formatInTimeZone(
  booking.startTime,
  booking.consultantTimezone,
  "h:mm a z"
); // "9:00 AM EST"
```

---

## 🔧 Current Implementation Issues & Recommendations

### ⚠️ **Issue 1: Simplified Timezone Conversion**

**Current Code** (`availability.ts:155`):

```typescript
private combineDateTime(date: Date, timeString: string, timezone: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const localDate = new Date(date);
  localDate.setHours(hours, minutes, 0, 0);
  return localDate; // ❌ This doesn't actually convert from timezone to UTC
}
```

**Problem**: This creates a date in the **system's timezone**, not the consultant's timezone.

**Recommendation**: Use a proper timezone library:

```typescript
import { zonedTimeToUtc } from 'date-fns-tz';

private combineDateTime(date: Date, timeString: string, timezone: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${timeString}:00`;

  // Convert from consultant's timezone to UTC
  return zonedTimeToUtc(dateString, timezone);
}
```

---

### ⚠️ **Issue 2: Missing Timezone Library**

**Current**: No timezone conversion library installed

**Recommendation**: Install `date-fns-tz`:

```bash
npm install date-fns date-fns-tz
```

---

### ⚠️ **Issue 3: No DST Handling**

**Problem**: Current implementation doesn't account for Daylight Saving Time changes.

**Example**:

- Consultant in New York (America/New_York)
- Sets availability: Mon-Fri 9 AM - 5 PM
- In winter (EST): UTC offset is -5 hours
- In summer (EDT): UTC offset is -4 hours
- **Current code would break during DST transitions**

**Solution**: Using `date-fns-tz` automatically handles DST.

---

## ✅ Recommended Implementation

### Install Dependencies

```bash
cd server
npm install date-fns date-fns-tz
```

### Update `availability.ts`

```typescript
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';

private combineDateTime(date: Date, timeString: string, timezone: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);

  // Create ISO string in consultant's timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  const dateTimeStr = `${year}-${month}-${day}T${timeStr}`;

  // Convert to UTC
  return zonedTimeToUtc(dateTimeStr, timezone);
}
```

---

## 📊 Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│ CONSULTANT SETS AVAILABILITY                                 │
├─────────────────────────────────────────────────────────────┤
│ Input: "Mon 9 AM - 5 PM" in "America/New_York"             │
│ Store: { dayOfWeek: 1, startTime: "09:00", endTime: "17:00"│
│         timezone: "America/New_York" }                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ USER REQUESTS SLOTS (in Los Angeles)                         │
├─────────────────────────────────────────────────────────────┤
│ Input: date="2025-12-15", timezone="America/Los_Angeles"    │
│                                                              │
│ Server Process:                                              │
│ 1. Convert consultant times to UTC:                         │
│    "09:00" EST → 14:00 UTC                                  │
│    "17:00" EST → 22:00 UTC                                  │
│                                                              │
│ 2. Check bookings (UTC) + Google Calendar (UTC)            │
│ 3. Generate slots in UTC                                    │
│ 4. Return UTC timestamps to client                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ CLIENT DISPLAYS (in user's timezone)                         │
├─────────────────────────────────────────────────────────────┤
│ Received: "2025-12-15T14:00:00.000Z" (UTC)                 │
│ Display: "6:00 AM PST" (user's timezone)                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ USER BOOKS SLOT                                              │
├─────────────────────────────────────────────────────────────┤
│ Send: startTime="2025-12-15T14:00:00.000Z" (UTC)           │
│       userTimezone="America/Los_Angeles"                     │
│                                                              │
│ Store in DB:                                                 │
│ {                                                            │
│   startTime: 2025-12-15T14:00:00.000Z (UTC)                │
│   endTime: 2025-12-15T15:00:00.000Z (UTC)                  │
│   userTimezone: "America/Los_Angeles"                        │
│   consultantTimezone: "America/New_York"                     │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ SEND NOTIFICATIONS                                           │
├─────────────────────────────────────────────────────────────┤
│ User Email: "6:00 AM PST"                                   │
│ Consultant Email: "9:00 AM EST"                             │
│ Google Calendar: Created with UTC times                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Benefits of This Approach

1. **✅ Single Source of Truth**: All times stored in UTC in database
2. **✅ DST-Safe**: Timezone library handles Daylight Saving Time automatically
3. **✅ International**: Works for consultants and users anywhere in the world
4. **✅ Consistent**: Same time always displays correctly regardless of viewer's timezone
5. **✅ Google Calendar Compatible**: Google Calendar uses UTC internally
6. **✅ Queryable**: Easy to find all bookings in a time range using UTC

---

## 🚀 Next Steps

1. ✅ Install `date-fns` and `date-fns-tz`
2. ✅ Update `combineDateTime()` method
3. ✅ Add timezone conversion helpers for email formatting
4. ✅ Test with different timezones
5. ✅ Test during DST transitions
6. ✅ Add timezone display in booking confirmations

Would you like me to implement these timezone improvements now?
