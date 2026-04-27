import fs from 'fs';
import path from 'path';

// Helper: Converts standard #RRGGBB hex from React to SubStation Alpha &H00BBGGRR format
const hexToAssColor = (hex) => {
    if (!hex) return '&H00FFFFFF';
    const cleanHex = hex.replace('#', '');
    const r = cleanHex.substring(0, 2);
    const g = cleanHex.substring(2, 4);
    const b = cleanHex.substring(4, 6);
    return `&H00${b}${g}${r}`;
};

// Helper: Converts raw seconds (e.g., 65.4) to ASS time format (H:MM:SS.cs)
const formatAssTime = (seconds) => {
    const d = new Date(seconds * 1000);
    const h = Math.floor(seconds / 3600);
    const m = d.getUTCMinutes().toString().padStart(2, '0');
    const s = d.getUTCSeconds().toString().padStart(2, '0');
    const ms = Math.floor(d.getUTCMilliseconds() / 10).toString().padStart(2, '0');
    return `${h}:${m}:${s}.${ms}`;
};

export const generateAssFile = (transcription, styles, outputPath) => {
    // 1. Map the React styles to the ASS variables
    const fontName = styles.fontFamily.split(',')[0].replace(/['"]/g, '').trim(); // e.g., 'Inter'
    const fontSize = styles.fontSize;
    const primaryColor = hexToAssColor(styles.fillColor);
    const outlineColor = hexToAssColor(styles.strokeColor);
    const shadowColor = hexToAssColor(styles.shadowColor);
    const outlineWidth = styles.strokeWidth;
    const shadowDepth = styles.shadowBlur > 0 ? styles.shadowOffsetX : 0;

    // 2. Build the ASS file header
    let assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 1

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize * 2},${primaryColor},&H000000FF,${outlineColor},${shadowColor},-1,0,0,0,100,100,0,0,1,${outlineWidth},${shadowDepth},5,10,10,50,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    // 3. Loop through the Groq AI words and build the timeline
    transcription.forEach((wordObj) => {
        const start = formatAssTime(wordObj.start);
        const end = formatAssTime(wordObj.end);
        // Clean the word of any weird characters that might break the subtitle renderer
        const rawText = wordObj.word || wordObj.text || "";
        const safeWord = rawText.replace(/[{}]/g, '');
        
        assContent += `Dialogue: 0,${start},${end},Default,,0,0,0,,${safeWord}\n`;
    });

    // 4. Write the file to disk so FFmpeg can read it
    fs.writeFileSync(outputPath, assContent, 'utf8');
    return outputPath;
};