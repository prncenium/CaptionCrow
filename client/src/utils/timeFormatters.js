/**
 * Converts raw seconds into a professional timecode format.
 * @param {number} seconds - e.g., 65.5
 * @returns {string} - e.g., "01:05.5"
 */
export const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00.0";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    
    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');
    
    return `${formattedMins}:${formattedSecs}.${ms}`;
};

/**
 * Converts seconds into a short format for the Timeline Ruler.
 * @param {number} seconds - e.g., 5
 * @returns {string} - e.g., "00:05"
 */
export const formatRulerTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};