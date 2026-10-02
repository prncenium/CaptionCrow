// Converts AI phrase segments (plain text groups, e.g. from analyzeTranscriptForChunking)
// into a per-word segment map by walking the word array in order and consuming each
// phrase's word count. Robust to minor LLM text drift since only word COUNTS are
// trusted, not exact text — worst case (the AI slightly miscounts), later words just
// fall into the wrong/last segment, which only affects break-point *preference*, never
// correctness (the mechanical char-limit chunking below is always the fallback).
export const alignPhraseBreaks = (words, phrases) => {
    if (!Array.isArray(words) || !Array.isArray(phrases) || phrases.length === 0) return [];

    const wordSegments = new Array(words.length).fill(null);
    let wordCursor = 0;

    phrases.forEach((phrase, segmentId) => {
        const phraseWordCount = String(phrase?.text || '').trim().split(/\s+/).filter(Boolean).length;
        const sentenceEnd = !!phrase?.sentenceEnd;
        const end = Math.min(wordCursor + phraseWordCount, words.length);
        for (let i = wordCursor; i < end; i++) {
            wordSegments[i] = { segmentId, sentenceEnd };
        }
        wordCursor = end;
    });

    return wordSegments;
};

// A word ending in ./!/?/, is a strong, deterministic signal that a sentence or
// clause just completed — trusted even when AI segment data disagrees or is missing.
const hasTerminalPunctuation = (wordText) => /[.!?,]$/.test(wordText || '');

export const groupCaptions = (words, maxChars, maxLines, aiHighlights, wordSegments, presetId) => {
    if (!words || words.length === 0) return [];

    const safeMaxChars = parseInt(maxChars, 10) || 20;
    const safeMaxLines = parseInt(maxLines, 10) || 1;

    // 🚨 STACKED (Viral Pop): multi-word lines (up to 3 words / maxChars each),
    // grouped into cards of 2 OR 3 lines. The AI decides 2 vs 3: a card closes at
    // 2 lines when the 2nd line completes a sentence/clause, otherwise it fills to
    // 3 — so the layout follows the natural flow of the script (2,2 / 3,3 / mixed)
    // rather than a fixed count. Falls back to filling to 3 with no AI data.
    if (presetId === 'viral-pop') {
        const MAX_WORDS_PER_LINE = 3;

        // A sentence ends at word i if i is the last word of a sentence-ending
        // segment (the flag marks every word in the segment, so require the next
        // word to be a different segment), or the word carries trailing .!?,.
        const endsSentenceAt = (i) => {
            const wt = (words[i]?.word || words[i]?.text || '').trim();
            const seg = wordSegments ? wordSegments[i] : null;
            const nextSeg = wordSegments ? wordSegments[i + 1] : null;
            const isSegLast = !nextSeg || (seg && nextSeg.segmentId !== seg.segmentId);
            return (!!(seg && seg.sentenceEnd) && isSegLast) || /[.!?,]$/.test(wt);
        };

        // Pass 1: pack words into lines (≤ MAX_WORDS_PER_LINE, ≤ maxChars, and
        // always ending a line where a sentence ends so line/sentence edges align).
        const lines = []; // { wordObjs: [...], endsSentence: bool }
        let lineWords = [];
        for (let i = 0; i < words.length; i++) {
            const wordObj = words[i];
            if (!wordObj) continue;
            const wt = (wordObj.word || wordObj.text || '').trim();
            if (!wt) continue;

            const prospective = [...lineWords.map(w => (w.word || w.text || '').trim()), wt].join(' ');
            if (lineWords.length > 0 && prospective.length > safeMaxChars) {
                lines.push({ wordObjs: lineWords, endsSentence: false });
                lineWords = [];
            }
            lineWords.push(wordObj);
            if (endsSentenceAt(i) || lineWords.length >= MAX_WORDS_PER_LINE) {
                lines.push({ wordObjs: lineWords, endsSentence: endsSentenceAt(i) });
                lineWords = [];
            }
        }
        if (lineWords.length > 0) lines.push({ wordObjs: lineWords, endsSentence: false });

        // Pass 2: group lines into cards of 2 or 3.
        const lineText = (l) => l.wordObjs.map(w => (w.word || w.text || '').trim()).join(' ');
        const chunks = [];
        let cardLines = [];
        for (let j = 0; j < lines.length; j++) {
            cardLines.push(lines[j]);
            const atMax = cardLines.length >= 3;
            // Close early at 2 lines when the 2nd line finishes a sentence, so the
            // next sentence starts a fresh card instead of being dragged onto line 3.
            const closeAt2 = cardLines.length === 2 && lines[j].endsSentence;
            if (atMax || closeAt2 || j === lines.length - 1) {
                const flat = cardLines.flatMap(l => l.wordObjs);
                chunks.push({
                    text: cardLines.map(lineText).join('\n'),
                    start: flat[0].start,
                    end: flat[flat.length - 1].end,
                    words: flat,
                });
                cardLines = [];
            }
        }

        // Only the final card can end up with a single line (a leftover). Fold it into
        // the previous card when there's room, so cards stay 2-3 lines (and keep a
        // yellow line 2) instead of ending on a lonely one-word card.
        if (chunks.length >= 2) {
            const last = chunks[chunks.length - 1];
            const prev = chunks[chunks.length - 2];
            if (last.text.split('\n').length === 1 && prev.text.split('\n').length < 3) {
                prev.text += '\n' + last.text;
                prev.end = last.end;
                prev.words = [...prev.words, ...last.words];
                chunks.pop();
            }
        }
        return chunks;
    }

    // ====================================================
    // ORIGINAL LOGIC (now phrase-boundary aware)
    // ====================================================
    const chunks = [];
    let currentLineWords = [];
    let currentBlockWords = []; // 🚨 Tracks the original word objects
    let currentLines = [];
    let currentStart = null;

    for (let i = 0; i < words.length; i++) {
        const wordObj = words[i];
        if (!wordObj) continue;
        const wordText = (wordObj.word || wordObj.text || '').trim();
        if (!wordText) continue;

        if (currentStart === null) currentStart = wordObj.start;

        const seg = wordSegments ? wordSegments[i] : null;
        const prevSeg = (wordSegments && i > 0) ? wordSegments[i - 1] : null;
        const isNewPhraseStart = !!(seg && prevSeg && seg.segmentId !== prevSeg.segmentId);

        const prevWordText = i > 0 ? (words[i - 1].word || words[i - 1].text || '').trim() : '';
        // A card only needs to stop early at a REAL sentence/clause boundary — not
        // just any phrase split — so trust either the AI's judgment or literal
        // punctuation on the word that just ended, whichever is available.
        const isStrongBoundary = isNewPhraseStart && (!!(prevSeg && prevSeg.sentenceEnd) || hasTerminalPunctuation(prevWordText));

        const currentLineString = currentLineWords.join(" ");
        const newLength = currentLineString.length === 0
            ? wordText.length
            : currentLineString.length + 1 + wordText.length;

        const wouldOverflow = newLength > safeMaxChars && currentLineWords.length > 0;
        // Prefer breaking at a natural phrase boundary over packing to the hard
        // character limit — this is what stops a card from splitting mid-sentence
        // (e.g. ending a line right after a short word like "hai" if that's where
        // the phrase actually ends, rather than cramming the next phrase's first
        // word onto the same line just because there was room left).
        const shouldBreakForPhrase = isNewPhraseStart && currentLineWords.length > 0;

        if (wouldOverflow || shouldBreakForPhrase) {
            currentLines.push(currentLineWords.join(" "));
            currentLineWords = [wordText];

            const reachedMaxLines = currentLines.length >= safeMaxLines;
            // Once at least one line is done, a genuine sentence/clause ending means
            // this card is complete on its own — don't force a second line by
            // dragging in the start of the NEXT sentence just to fill the layout.
            const shouldStopEarly = !reachedMaxLines && isStrongBoundary;

            if (reachedMaxLines || shouldStopEarly) {
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
