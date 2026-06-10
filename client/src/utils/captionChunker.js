export const groupCaptions = (words, maxChars, maxLines) => {
    if (!words || words.length === 0) return [];

    const safeMaxChars = parseInt(maxChars, 10) || 20; 
    const safeMaxLines = parseInt(maxLines, 10) || 1;

    // 🚨 CINEMATIC FIX
    if (safeMaxLines === 3) {
        const chunks = [];
        let currentStack = [];
        let currentStackObj = []; // 🚨 Tracks the original word objects
        let currentStart = null;

        for (let i = 0; i < words.length; i++) {
            const wordObj = words[i];
            if (currentStart === null) currentStart = wordObj.start;

            currentStack.push(wordObj.word.trim());
            currentStackObj.push(wordObj); // 🚨 Save the object

            if (currentStack.length === 3 || i === words.length - 1) {
                chunks.push({
                    text: currentStack.join('\n'), 
                    start: currentStart,
                    end: wordObj.end,
                    words: currentStackObj // 🚨 Pass the data forward!
                });
                currentStack = [];
                currentStackObj = [];
                currentStart = null;
            }
        }
        return chunks;
    }

    // ====================================================
    // ORIGINAL LOGIC 
    // ====================================================
    const chunks = [];
    let currentLineWords = [];
    let currentBlockWords = []; // 🚨 Tracks the original word objects
    let currentLines = [];
    let currentStart = null;

    for (let i = 0; i < words.length; i++) {
        const wordObj = words[i];
        const wordText = wordObj.word.trim();
        
        if (currentStart === null) currentStart = wordObj.start;

        const currentLineString = currentLineWords.join(" ");
        const newLength = currentLineString.length === 0 
            ? wordText.length 
            : currentLineString.length + 1 + wordText.length;

        if (newLength > safeMaxChars && currentLineWords.length > 0) {
            currentLines.push(currentLineWords.join(" "));
            currentLineWords = [wordText]; 

            if (currentLines.length >= safeMaxLines) {
                const prevWord = words[i - 1];
                chunks.push({
                    text: currentLines.join("\n"), 
                    start: currentStart,
                    end: prevWord.end,
                    words: currentBlockWords // 🚨 Pass the data forward!
                });
                
                currentLines = [];
                currentBlockWords = [wordObj]; // 🚨 Start new block with this word
                currentStart = wordObj.start; 
            } else {
                currentBlockWords.push(wordObj);
            }
        } else {
            currentLineWords.push(wordText);
            currentBlockWords.push(wordObj);
        }
    }

    if (currentLineWords.length > 0) {
        currentLines.push(currentLineWords.join(" "));
    }
    
    if (currentLines.length > 0) {
        chunks.push({
            text: currentLines.join("\n"),
            start: currentStart,
            end: words[words.length - 1].end,
            words: currentBlockWords // 🚨 Pass the data forward!
        });
    }

    return chunks;
};