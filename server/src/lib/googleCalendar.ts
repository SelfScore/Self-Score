import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// Google Calendar API configuration
// Using minimal scopes for easier production verification:
// - calendar.events: Read/write calendar events
// - calendar.freebusy: Read freebusy information (required for availability checks)
// - userinfo.email: Get user's email address
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
  "https://www.googleapis.com/auth/userinfo.email",
];

const REDIRECT_URI =
  process.env.GOOGLE_CALENDAR_REDIRECT_URI ||
  "http://localhost:3000/consultant/calendar/callback";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;

  constructor() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.warn(
        "⚠️  Google Calendar credentials not configured. Calendar features will not work.",
      );
    }

    this.oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI,
    );
  }

  /**
   * Generate OAuth URL for consultant to authorize access
   */
  getAuthUrl(consultantId: string): string {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      state: consultantId, // Pass consultant ID as state
      prompt: "consent", // Force consent to get refresh token
    });
    return url;
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
  }> {
    const { tokens } = await this.oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Failed to obtain tokens from Google");
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : new Date(Date.now() + 3600 * 1000),
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiryDate: Date;
  }> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error("Failed to refresh access token");
    }

    return {
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : new Date(Date.now() + 3600 * 1000),
    };
  }

  /**
   * Get user info (email)
   */
  async getUserInfo(accessToken: string): Promise<{ email: string }> {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const oauth2 = google.oauth2({
      auth: this.oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      throw new Error("Failed to get user email from Google");
    }

    return {
      email: data.email,
    };
  }

  /**
   * Get primary calendar ID
   * Note: We use "primary" as the calendar ID directly instead of calling calendarList.list()
   * This allows us to use only calendar.events scope instead of the broader calendar scope
   */
  getPrimaryCalendarId(): string {
    return "primary";
  }

  /**
   * Get busy time slots from Google Calendar
   */
  async getFreeBusy(
    accessToken: string,
    calendarId: string,
    timeMin: Date,
    timeMax: Date,
  ): Promise<Array<{ start: Date; end: Date }>> {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    const { data } = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: calendarId }],
      },
    });

    const busy = data.calendars?.[calendarId]?.busy || [];

    return busy.map((slot) => ({
      start: new Date(slot.start!),
      end: new Date(slot.end!),
    }));
  }

  /**
   * Create a calendar event
   */
  async createEvent(
    accessToken: string,
    calendarId: string,
    eventData: {
      summary: string;
      description?: string;
      startTime: Date;
      endTime: Date;
      attendeeEmail: string;
      attendeeName?: string;
      location?: string;
      conferenceData?: boolean;
    },
  ): Promise<{
    eventId: string;
    meetingLink?: string;
    htmlLink: string;
  }> {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    const event: any = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: eventData.endTime.toISOString(),
        timeZone: "UTC",
      },
      attendees: [
        {
          email: eventData.attendeeEmail,
          displayName: eventData.attendeeName,
        },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 60 },
        ],
      },
    };

    if (eventData.location) {
      event.location = eventData.location;
    }

    // Add Google Meet conference if requested
    if (eventData.conferenceData) {
      event.conferenceData = {
        createRequest: {
          requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      };
    }

    const { data } = await calendar.events.insert({
      calendarId: calendarId,
      conferenceDataVersion: eventData.conferenceData ? 1 : 0,
      requestBody: event,
      sendUpdates: "all", // Send email notifications to attendees
    });

    if (!data.id) {
      throw new Error("Failed to create calendar event");
    }

    return {
      eventId: data.id,
      meetingLink:
        data.hangoutLink ||
        data.conferenceData?.entryPoints?.[0]?.uri ||
        undefined,
      htmlLink: data.htmlLink || "",
    };
  }

  /**
   * Update a calendar event
   */
  async updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    updates: {
      summary?: string;
      description?: string;
      startTime?: Date;
      endTime?: Date;
    },
  ): Promise<void> {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    const event: any = {};

    if (updates.summary) event.summary = updates.summary;
    if (updates.description) event.description = updates.description;
    if (updates.startTime) {
      event.start = {
        dateTime: updates.startTime.toISOString(),
        timeZone: "UTC",
      };
    }
    if (updates.endTime) {
      event.end = {
        dateTime: updates.endTime.toISOString(),
        timeZone: "UTC",
      };
    }

    await calendar.events.patch({
      calendarId: calendarId,
      eventId: eventId,
      requestBody: event,
      sendUpdates: "all",
    });
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
  ): Promise<void> {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    await calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId,
      sendUpdates: "all",
    });
  }

  /**
   * Check if token is expired and refresh if needed
   */
  async ensureValidToken(
    accessToken: string,
    refreshToken: string,
    tokenExpiry: Date,
  ): Promise<{ accessToken: string; expiryDate: Date; refreshed: boolean }> {
    const now = new Date();
    const expiryBuffer = 5 * 60 * 1000; // 5 minutes buffer

    if (now.getTime() + expiryBuffer < tokenExpiry.getTime()) {
      // Token is still valid
      return {
        accessToken,
        expiryDate: tokenExpiry,
        refreshed: false,
      };
    }

    // Token expired or about to expire, refresh it
    const refreshed = await this.refreshAccessToken(refreshToken);

    return {
      accessToken: refreshed.accessToken,
      expiryDate: refreshed.expiryDate,
      refreshed: true,
    };
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();
