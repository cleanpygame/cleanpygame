/**
 * Class representing a text region with start and end positions
 */
export class EventRegion {
    startLine: number;
    startCol: number;
    endLine: number;
    endCol: number;
    eventId: string;

    /**
     * Create a text region
     * @param startLine - The starting line index
     * @param startCol - The starting column index
     * @param endLine - The ending line index
     * @param endCol - The ending column index
     * @param eventId - Optional identifier for the region
     */
    constructor(startLine: number, startCol: number, endLine: number, endCol: number, eventId: string) {
        this.startLine = startLine;
        this.startCol = startCol;
        this.endLine = endLine;
        this.endCol = endCol;
        this.eventId = eventId;
    }

    /**
     * Check if a given position belongs to this region
     * @param lineIndex - The line index to check
     * @param columnIndex - The column index to check
     * @param len - The length of token to check (default is 1)
     * @returns True if the position is within the region, false otherwise
     */
    contains(lineIndex: number, columnIndex: number, len: number = 1): boolean {
        if (lineIndex < this.startLine || lineIndex > this.endLine)
            return false;
        if (lineIndex === this.startLine && columnIndex + len - 1 < this.startCol)
            return false;
        return !(lineIndex === this.endLine && columnIndex > this.endCol);

    }
}