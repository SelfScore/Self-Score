import { format, toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Format a UTC date to a specific timezone
 * @param utcDate - Date in UTC
 * @param timezone - Target timezone (e.g., 'America/New_York')
 * @param formatString - Format string (default: 'MMM d, yyyy h:mm a zzz')
 * @returns Formatted date string in target timezone
 */
export const formatInTimeZone = (
    utcDate: Date,
    timezone: string,
    formatString: string = 'MMM d, yyyy h:mm a zzz'
): string => {
    try {
        const zonedDate = toZonedTime(utcDate, timezone);
        return format(zonedDate, formatString, { timeZone: timezone });
    } catch (error) {
        console.error('Error formatting date in timezone:', error);
        return utcDate.toISOString();
    }
};

/**
 * Format a date range in a specific timezone
 * @param startDate - Start date in UTC
 * @param endDate - End date in UTC
 * @param timezone - Target timezone
 * @returns Formatted string like "Dec 15, 2025 9:00 AM - 10:00 AM EST"
 */
export const formatDateRangeInTimeZone = (
    startDate: Date,
    endDate: Date,
    timezone: string
): string => {
    try {
        const zonedStart = toZonedTime(startDate, timezone);
        const zonedEnd = toZonedTime(endDate, timezone);
        
        // Format date part
        const datePart = format(zonedStart, 'EEEE, MMMM d, yyyy', { timeZone: timezone });
        
        // Format time range
        const startTime = format(zonedStart, 'h:mm a', { timeZone: timezone });
        const endTime = format(zonedEnd, 'h:mm a zzz', { timeZone: timezone });
        
        return `${datePart}, ${startTime} - ${endTime}`;
    } catch (error) {
        console.error('Error formatting date range:', error);
        return `${startDate.toISOString()} - ${endDate.toISOString()}`;
    }
};

/**
 * Format time only in a specific timezone
 * @param utcDate - Date in UTC
 * @param timezone - Target timezone
 * @returns Formatted time string like "9:00 AM EST"
 */
export const formatTimeInTimeZone = (
    utcDate: Date,
    timezone: string
): string => {
    try {
        const zonedDate = toZonedTime(utcDate, timezone);
        return format(zonedDate, 'h:mm a zzz', { timeZone: timezone });
    } catch (error) {
        console.error('Error formatting time:', error);
        return utcDate.toISOString();
    }
};

/**
 * Format date only in a specific timezone
 * @param utcDate - Date in UTC
 * @param timezone - Target timezone
 * @returns Formatted date string like "Monday, December 15, 2025"
 */
export const formatDateInTimeZone = (
    utcDate: Date,
    timezone: string
): string => {
    try {
        const zonedDate = toZonedTime(utcDate, timezone);
        return format(zonedDate, 'EEEE, MMMM d, yyyy', { timeZone: timezone });
    } catch (error) {
        console.error('Error formatting date:', error);
        return utcDate.toISOString();
    }
};

/**
 * Get timezone abbreviation for a date
 * @param utcDate - Date in UTC
 * @param timezone - Target timezone
 * @returns Timezone abbreviation like "EST", "PST", etc.
 */
export const getTimezoneAbbreviation = (
    utcDate: Date,
    timezone: string
): string => {
    try {
        const zonedDate = toZonedTime(utcDate, timezone);
        return format(zonedDate, 'zzz', { timeZone: timezone });
    } catch (error) {
        console.error('Error getting timezone abbreviation:', error);
        return timezone;
    }
};

/**
 * Convert a date from one timezone to another
 * @param date - Date to convert
 * @param fromTimezone - Source timezone
 * @param toTimezone - Target timezone
 * @returns Date object in target timezone
 */
export const convertBetweenTimezones = (
    date: Date,
    fromTimezone: string,
    toTimezone: string
): Date => {
    try {
        // First convert to UTC from source timezone
        const utcDate = toZonedTime(date, fromTimezone);
        // Then convert to target timezone
        return toZonedTime(utcDate, toTimezone);
    } catch (error) {
        console.error('Error converting between timezones:', error);
        return date;
    }
};

/**
 * Check if a timezone is valid
 * @param timezone - Timezone string to validate
 * @returns true if valid, false otherwise
 */
export const isValidTimezone = (timezone: string): boolean => {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
    } catch {
        return false;
    }
};

/**
 * Format booking time for email in user's timezone
 * Example: "Monday, December 15, 2025 at 6:00 AM PST"
 */
export const formatBookingTimeForEmail = (
    startDate: Date,
    endDate: Date,
    timezone: string
): { date: string; time: string; timeRange: string } => {
    const date = formatDateInTimeZone(startDate, timezone);
    const time = formatTimeInTimeZone(startDate, timezone);
    const timeRange = `${formatTimeInTimeZone(startDate, timezone)} - ${formatTimeInTimeZone(endDate, timezone)}`;
    
    return { date, time, timeRange };
};
