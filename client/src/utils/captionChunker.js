export const groupCaptions = (words, maxChars, maxLines) => {
    if (!words || words.length === 0) return [];

    // BULLETPROOF FIX: Force incoming parameters to be strict integers. 
    // If the React state drops them, fall back to safe defaults (11 chars, 1 line).
    const safeMaxChars = parseInt(maxChars, 10) || 11;
    const safeMaxLines = parseInt(maxLines, 10) || 1;

    const chunks = [];
    let currentLineWords = [];
    let currentLines = [];
    let currentStart = null;
    let currentEnd = null;

    for (const wordObj of words) {
        const wordText = wordObj.word.trim();
        
        if (currentStart === null) currentStart = wordObj.start;

        const currentLineString = currentLineWords.join(" ");
        const newLength = currentLineString.length === 0 
            ? wordText.length 
            : currentLineString.length + 1 + wordText.length;

        // Use safeMaxChars here
        if (newLength > safeMaxChars && currentLineWords.length > 0) {
            currentLines.push(currentLineWords.join(" "));
            currentLineWords = [wordText]; 

            // Use safeMaxLines here
            if (currentLines.length >= safeMaxLines) {
                chunks.push({
                    text: currentLines.join("\n"), 
                    start: currentStart,
                    end: currentEnd 
                });
                
                currentLines = [];
                currentStart = wordObj.start;
            }
        } else {
            currentLineWords.push(wordText);
        }
        
        currentEnd = wordObj.end;
    }

    if (currentLineWords.length > 0) {
        currentLines.push(currentLineWords.join(" "));
    }
    if (currentLines.length > 0) {
        chunks.push({
            text: currentLines.join("\n"),
            start: currentStart,
            end: currentEnd
        });
    }

    return chunks;
};