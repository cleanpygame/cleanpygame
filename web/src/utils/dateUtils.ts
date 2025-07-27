/**
 * Utility functions for date formatting
 */

/**
 * Safely format a date from various formats (string, timestamp, etc.)
 * @param date - Date to format (string, timestamp, Date object, etc.)
 * @param fallback - Fallback value to return if the date is invalid (default: 'N/A')
 * @returns Formatted date string or fallback value if the date is invalid
 */
export const formatDate = (date: any, fallback: string = 'N/A'): string => {
    if (!date) return fallback;

    try {
        // Handle Firestore Timestamp objects
        if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
            return date.toDate().toLocaleDateString();
        }

        // Handle ISO strings and other formats that Date constructor can parse
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return fallback;
        }

        return dateObj.toLocaleDateString();
    } catch (error) {
        console.error('Error formatting date:', error);
        return fallback;
    }
};