/**
 * Class representing a text region with start and end positions
 */
export class EventRegion {
    /**
     * Create a text region
     * @param {number} startLine - The starting line index
     * @param {number} startCol - The starting column index
     * @param {number} endLine - The ending line index
     * @param {number} endCol - The ending column index
     * @param {string} [eventId] - Optional identifier for the region
     */
    constructor(startLine, startCol, endLine, endCol, eventId = null) {
        this.startLine = startLine;
        this.startCol = startCol;
        this.endLine = endLine;
        this.endCol = endCol;
        this.eventId = eventId;
    }

    /**
     * Check if a given position belongs to this region
     * @param {number} lineIndex - The line index to check
     * @param {number} columnIndex - The column index to check
     * @param {number} len - The length of token to check (default is 1)
     * @returns {boolean} - True if the position is within the region, false otherwise
     */
    contains(lineIndex, columnIndex, len = 1) {
        if (lineIndex < this.startLine || lineIndex > this.endLine)
            return false;
        if (lineIndex === this.startLine && columnIndex + len - 1 < this.startCol)
            return false;
        if (lineIndex === this.endLine && columnIndex > this.endCol)
            return false;
        return true;
    }

    /**
     * Create a TextRegion instance from a region object
     * @param {Object} regionObj - Object containing region properties
     * @returns {EventRegion} - A new TextRegion instance
     */
    static fromObject(regionObj) {
        return new EventRegion(
            regionObj.startLine,
            regionObj.startCol || regionObj.firstToken, // Support both naming conventions
            regionObj.endLine,
            regionObj.endCol || regionObj.lastToken,    // Support both naming conventions
            regionObj.eventId
        );
    }
}
