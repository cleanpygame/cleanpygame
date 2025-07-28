/**
 * Utility functions for date formatting
 */

/**
 * Safely format a date from various formats (string, timestamp, etc.)
 * Uses local system short date and time formatting.
 * Shows just time for today's date, just date if not today.
 * 
 * @param date - Date to format (string, timestamp, Date object, etc.)
 * @param fallback - Fallback value to return if the date is invalid (default: 'N/A')
 * @param showInTitle - Whether to show full date and time (for titles) (default: false)
 * @returns Formatted date string or fallback value if the date is invalid
 */
export const formatDate = (date: any, fallback: string = 'N/A', showInTitle: boolean = false): string => {
    if (!date) return fallback;

    try {
        // Convert to Date object
        let dateObj: Date;
        
        // Handle Firestore Timestamp objects
        if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
            dateObj = date.toDate();
        } else {
            // Handle ISO strings and other formats that Date constructor can parse
            dateObj = new Date(date);
        }
        
        if (isNaN(dateObj.getTime())) {
            return fallback;
        }

        // For titles, always show full date and time
        if (showInTitle) {
            return dateObj.toLocaleString(navigator.language);
        }

        const today = new Date();
        const isToday = dateObj.getDate() === today.getDate() &&
            dateObj.getMonth() === today.getMonth() &&
            dateObj.getFullYear() === today.getFullYear();

        // Show just time for today's date
        if (isToday) {
            return "today " + dateObj.toLocaleTimeString(navigator.language, {
                hour: 'numeric',
                minute: '2-digit'
            });
        }

        // Show just date if not today
        return dateObj.toLocaleDateString();
    } catch (error) {
        console.error('Error formatting date:', error);
        return fallback;
    }
};