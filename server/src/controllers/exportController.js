import path from 'path';
import fs from 'fs';
import { burnSubtitles } from '../services/renderService.js';

const parseNum = (val, fallback) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? fallback : parsed;
};

const extractAssColor = (hex, defaultOpacity = 1) => {
    let color = hex || '#FFFFFF';
    let opacity = defaultOpacity;

    if (color.startsWith('rgba')) {
        const parts = color.match(/[\d.]+/g);
        if (parts && parts.length >= 4) {
            opacity = parseFloat(parts[3]);
            const r = parseInt(parts[0], 10).toString(16).padStart(2, '0');
            const g = parseInt(parts[1], 10).toString(16).padStart(2, '0');
            const b = parseInt(parts[2], 10).toString(16).padStart(2, '0');
            color = `#${r}${g}${b}`;
        }
    } else if (color.startsWith('rgb')) {
        const parts = color.match(/[\d.]+/g);
        if (parts && parts.length >= 3) {
            const r = parseInt(parts[0], 10).toString(16).padStart(2, '0');
            const g = parseInt(parts[1], 10).toString(16).padStart(2, '0');
            const b = parseInt(parts[2], 10).toString(16).padStart(2, '0');
            color = `#${r}${g}${b}`;
        }
    }

    color = color.replace('#', '');
    if (color.length === 3) color = color.split('').map(c => c + c).join('');
    if (color.length === 8) color = color.substring(2);

    const r = color.substring(0, 2);
    const g = color.substring(2, 4);
    const b = color.substring(4, 6);

    const a = Math.floor((1 - opacity) * 255).toString(16).padStart(2, '0');

    return {
        rgb: `&H${b}${g}${r}&`.toUpperCase(),
        alpha: `&H${a}&`.toUpperCase(),
        headerFormat: `&H${a}${b}${g}${r}`.toUpperCase()
    };
};

const mapFontFamily = (currentStyle) => {
    let fam = (currentStyle.fontFamily || 'Poppins').replace(/['"]/g, '').trim();
    const lowerFam = fam.toLowerCase();

    if (lowerFam.includes('poppins')) return 'Poppins';
    if (lowerFam.includes('inter')) return 'Inter';
    if (lowerFam.includes('coolvetica')) return 'Coolvetica';
    if (lowerFam.includes('apple')) return 'Apple Garamond';
    if (lowerFam.includes('blacksword')) return 'Blacksword';

    fam = fam.replace(/\b(Bold|Black|Light|Medium|Regular|SemiBold|Thin|Italic|ExtraBold|ExtraLight)\b/ig, '').trim();
    return fam || 'Poppins';
};

export const handleExport = async (req, res, next) => {
    try {
        const bodyKeys = req.body ? Object.keys(req.body) : [];
        console.log(`[Export] body keys: ${bodyKeys.join(', ')} | body size: ${JSON.stringify(req.body)?.length ?? 0} chars`);

        const { filename, timelineBlocks, globalLineOffsets, activeStyle, lineStyles } = req.body;

        const missing = [];
        if (!filename) missing.push('filename');
        if (!timelineBlocks) missing.push('timelineBlocks');
        if (!activeStyle) missing.push('activeStyle');
        if (missing.length > 0) {
            return res.status(400).json({ success: false, message: `Missing required export data: ${missing.join(', ')}` });
        }
        if (!Array.isArray(timelineBlocks) || timelineBlocks.length === 0) {
            return res.status(400).json({ success: false, message: 'No caption blocks to export. Please process your video first.' });
        }

        const tempDir = path.resolve('temp_uploads');
        const inputVideoPath = path.join(tempDir, filename);

        if (!fs.existsSync(inputVideoPath)) {
            return res.status(404).json({ success: false, message: 'Original video file not found on server.' });
        }

        const uniqueId = Date.now();
        const assFilePath = path.join(tempDir, `subtitles_${uniqueId}.ass`);
        const outputVideoName = `exported_${uniqueId}.mp4`;
        const outputVideoPath = path.join(tempDir, outputVideoName);

        const TARGET_VIDEO_WIDTH = 1080;
        const TARGET_VIDEO_HEIGHT = 1920;

        const FONT_COMPENSATION = 1.86;
        const baseFontSize = Math.round(parseNum(activeStyle.fontSize, 48) * FONT_COMPENSATION);

        const hasBg = activeStyle.hasBackground;
        const bgColor = hasBg ? extractAssColor(activeStyle.backgroundColor || '#000000') : extractAssColor('#000000', 0);
        const backColorHeader = bgColor.headerFormat;
        const pillRadius = 24;

        let assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: ${TARGET_VIDEO_WIDTH}
PlayResY: ${TARGET_VIDEO_HEIGHT}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Poppins,${baseFontSize},&H00FFFFFF,&H00000000,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1
Style: BackgroundPill,Poppins,${baseFontSize},${backColorHeader},&H000000FF,${backColorHeader},${backColorHeader},0,0,0,0,100,100,0,0,1,${pillRadius},0,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

        const formatTime = (seconds) => {
            const d = new Date(seconds * 1000);
            const h = Math.floor(seconds / 3600);
            const m = d.getUTCMinutes().toString().padStart(2, '0');
            const s = d.getUTCSeconds().toString().padStart(2, '0');
            const cs = Math.floor(d.getUTCMilliseconds() / 10).toString().padStart(2, '0');
            return `${h}:${m}:${s}.${cs}`;
        };

        const safeLineStyles = lineStyles || [];

        timelineBlocks.forEach((block) => {
            const lines = block.text.split('\n');

            // 🚨 REVEAL COMPRESSION (Viral Slide Up only): mirrors the same fix in CanvasOverlay.jsx.
            // Fast speech can make a 2-line card's fixed stagger/anim timing outlast the block's real
            // duration, so Line 2's words never finish sliding/fading in before the Dialogue event ends.
            // Scale stagger delay + anim duration down so the full reveal fits inside block.end - block.start.
            const totalWordsInBlock = lines.reduce((sum, l) => sum + l.split(' ').filter(Boolean).length, 0);
            const blockDurationMs = Math.max(50, (block.end - block.start) * 1000);
            const baseStyleNormBlock = String(activeStyle.animationStyle || '').toLowerCase().replace(/\s+/g, '');
            const blockIsSlideStagger = (activeStyle.wordStagger === true || String(activeStyle.wordStagger) === 'true')
                && baseStyleNormBlock.includes('slide') && !baseStyleNormBlock.includes('bounce');
            const requiredMsBlock = ((totalWordsInBlock - 1) * parseNum(activeStyle.staggerDelayMs, 150))
                + Math.max(parseNum(activeStyle.animationDurationMs, 300), 150);
            const revealScale = (blockIsSlideStagger && requiredMsBlock > blockDurationMs)
                ? Math.max(0.25, blockDurationMs / requiredMsBlock)
                : 1;

            const LINE_HEIGHT_MULTIPLIER = 1.15;
            let totalBlockHeight = 0;

            const lineSizes = lines.map((_, i) => {
                const s = { ...activeStyle, ...(safeLineStyles[i] || {}), ...(block.styleOverrides?.[i] || {}) };
                const rawSz = parseNum(s.fontSize, 48);
                totalBlockHeight += (rawSz * LINE_HEIGHT_MULTIPLIER);
                return rawSz;
            });

            const baseStartY = (TARGET_VIDEO_HEIGHT - totalBlockHeight) / 2;
            let currentYOffset = 0;
            currentYOffset += (lineSizes[0] * LINE_HEIGHT_MULTIPLIER);
            let cumulativeWordCount = 0;

            const hasEnrichedData = block.enrichedLines && block.enrichedLines.length > 0;

            lines.forEach((lineText, index) => {
                const currentStyle = { ...activeStyle, ...(safeLineStyles[index] || {}), ...(block.styleOverrides?.[index] || {}) };

                const animStyle = currentStyle.animationStyle || 'none';
                const lineAnimSpeed = Math.max(60, Math.round(parseNum(currentStyle.animationDurationMs, 300) * revealScale));
                const staggerDelayMs = Math.max(15, Math.round(parseNum(currentStyle.staggerDelayMs, 150) * revealScale));
                const isWordStagger = currentStyle.wordStagger === true || String(currentStyle.wordStagger) === 'true';

                const rawLineFontSize = lineSizes[index];
                const lineFontSizeScaled = Math.round(rawLineFontSize * FONT_COMPENSATION);
                const lineStroke = extractAssColor(currentStyle.strokeColor);

                const rawShadowOpacity = currentStyle.shadowOpacity !== undefined ? currentStyle.shadowOpacity : currentStyle.shadowIntensity;
                const shadowIntensity = rawShadowOpacity !== undefined ? rawShadowOpacity : (currentStyle.hasShadow !== false ? 80 : 0);
                const shadowOpacityVal = shadowIntensity / 100;
                const exactShadowAlphaHex = Math.floor((1 - shadowOpacityVal) * 255).toString(16).padStart(2, '0');
                const exactShadowAlpha = `&H${exactShadowAlphaHex}&`;

                const lStrokeWidth = Math.max(0, Math.round((parseNum(currentStyle.strokeWidth, 0) / 2) * FONT_COMPENSATION));
                const lShadowX = shadowIntensity > 0 ? Math.round(parseNum(currentStyle.shadowOffsetX, 0) * FONT_COMPENSATION) : 0;
                const lShadowY = shadowIntensity > 0 ? Math.round(parseNum(currentStyle.shadowOffsetY, 0) * FONT_COMPENSATION) : 0;
                const rawShadowBlur = parseNum(currentStyle.shadowBlur, 0);
                const lShadowBlur = shadowIntensity > 0 ? Math.round((rawShadowBlur / 2.5) * FONT_COMPENSATION) : 0;

                const mappedFontFam = mapFontFamily(currentStyle);
                const rawFamStr = (currentStyle.fontFamily || '').toLowerCase();
                const faceStr = (currentStyle.fontFace || '').toLowerCase();
                const fontWeightNum = parseInt(currentStyle.fontWeight, 10) || 400;

                const isBold = fontWeightNum >= 600 || rawFamStr.includes('bold') || faceStr.includes('bold');
                const isItalic = currentStyle.fontStyle === 'italic' || rawFamStr.includes('italic') || faceStr.includes('italic');
                const lBoldTag = isBold ? '\\b1' : '\\b0';
                const lItalicTag = isItalic ? '\\i1' : '\\i0';

                const localPos = block.customLinePositions?.[index];
                const globalPos = globalLineOffsets?.[index];

                const konvaX = localPos?.x ?? globalPos?.x ?? 0;
                const konvaY = localPos?.y ?? globalPos?.y ?? (baseStartY + currentYOffset);
                currentYOffset += rawLineFontSize;

                const finalX = Math.round(540 + konvaX);
                const lineFinalY = Math.round(konvaY + (rawLineFontSize / 2));

                const normalizedStyle = String(animStyle).toLowerCase().replace(/\s+/g, '');

                const staggerDelaySec = staggerDelayMs / 1000;
                const lineDelaySec = isWordStagger ? 0 : (index * staggerDelaySec);

                const actualStartSeconds = Math.min(
                    block.start + lineDelaySec,
                    Math.max(block.start + 0.1, block.end - 0.1)
                );

                const startStr = formatTime(actualStartSeconds);
                const endStr = formatTime(block.end);
                const baseTags = `\\an5\\bord${lStrokeWidth}\\fs${lineFontSizeScaled}${lBoldTag}${lItalicTag}\\fn${mappedFontFam}`;

                // For slide+wordStagger, delay each line's \move so it starts
                // exactly when that line's first word fades in (cumulativeWordCount * staggerDelayMs).
                // Without this, Line 2+ finish sliding before their words are visible.
                const isSlidingExport = !['none', 'bounce', 'popin'].includes(normalizedStyle);
                const lineSlideStartTime = (isWordStagger && isSlidingExport) ? (cumulativeWordCount * staggerDelayMs) : 0;
                const lineSlideEndTime = lineSlideStartTime + lineAnimSpeed;

                let basePos = '';
                let bgBasePos = '';

                if (normalizedStyle === 'none' || normalizedStyle === 'bounce' || normalizedStyle === 'popin') {
                    basePos = `\\pos(${finalX},${lineFinalY})`;
                    bgBasePos = `\\pos(0,0)`;
                } else {
                    basePos = `\\move(${finalX},${lineFinalY + 30},${finalX},${lineFinalY},${lineSlideStartTime},${lineSlideEndTime})`;
                    bgBasePos = `\\move(0,30,0,0,${lineSlideStartTime},${lineSlideEndTime})`;
                }

                const enrichedLine = hasEnrichedData ? block.enrichedLines[index] : null;
                let linePxWidth = 0;

                if (enrichedLine && enrichedLine.totalLineWidth !== undefined) {
                    linePxWidth = enrichedLine.totalLineWidth * FONT_COMPENSATION;
                } else {
                    linePxWidth = lineText.length * (rawLineFontSize * 0.45) * FONT_COMPENSATION;
                }

                if (activeStyle.hasBackground) {
                    const bgFadeMs = normalizedStyle !== 'none' ? Math.min(lineAnimSpeed, 200) : 0;
                    const targetAlphaHex = extractAssColor(activeStyle.backgroundColor || '#000000').alpha.replace('&H', '').replace('&', '');
                    const bgFadeTag = bgFadeMs > 0 ? `\\alpha&HFF&\\t(0,${bgFadeMs},2,\\alpha&H${targetAlphaHex}&)` : `\\alpha&H${targetAlphaHex}&`;

                    const paddingX = -30 * FONT_COMPENSATION;
                    const W = Math.round((linePxWidth / 2) + paddingX - pillRadius);
                    const H = Math.round(((rawLineFontSize * LINE_HEIGHT_MULTIPLIER * FONT_COMPENSATION) / 2) - pillRadius);

                    const boxLeft  = finalX - W;
                    const boxRight = finalX + W;
                    const boxTop   = lineFinalY - H;
                    const boxBottom = lineFinalY + H;

                    const vectorShape = `{\\p1}m ${boxLeft} ${boxTop} l ${boxRight} ${boxTop} l ${boxRight} ${boxBottom} l ${boxLeft} ${boxBottom}{\\p0}`;
                    const bgTags = `${bgBasePos}\\an7\\blur0\\be0${bgFadeTag}\\xshad0\\yshad0`;
                    assContent += `Dialogue: -1,${startStr},${endStr},BackgroundPill,,0,0,0,,{${bgTags}}${vectorShape}\n`;
                }

                let finalAssText = '';
                let finalShadowText = '';

                if (isWordStagger) {
                    const wordsArray = enrichedLine?.measuredWords?.length > 0
                        ? enrichedLine.measuredWords
                        : lineText.split(' ').map(w => ({ text: w }));

                    if (normalizedStyle === 'bounce' || normalizedStyle === 'popin') {
                        let totalLineWidth = 0;
                        const spaceWidth = 14 * FONT_COMPENSATION;

                        wordsArray.forEach(w => {
                            w.calcWidth = w.width
                                ? (w.width * FONT_COMPENSATION)
                                : (w.text.length * (rawLineFontSize * 0.45) * FONT_COMPENSATION);
                            totalLineWidth += w.calcWidth + spaceWidth;
                        });
                        totalLineWidth -= spaceWidth;

                        let currentX = finalX - (totalLineWidth / 2);

                        wordsArray.forEach((wordObj) => {
                            const word = wordObj.text;
                            if (!word.trim()) { currentX += spaceWidth; return; }

                            const wordStartX = Math.round(currentX + (wordObj.calcWidth / 2));
                            currentX += wordObj.calcWidth + spaceWidth;

                            let wordColorHex = currentStyle.fillColor;
                            let wordSizeScaled = lineFontSizeScaled;
                            let currentBoldTag = lBoldTag;
                            let currentItalicTag = lItalicTag;
                            let currentFontFam = mappedFontFam;

                            if (wordObj.isEmphasized || wordObj.isEmphasis) {
                                wordColorHex = wordObj.color || currentStyle.emphasisColor || currentStyle.accentColor || currentStyle.fillColor;

                                if (currentStyle.id === 'minimalist') {
                                    if (currentStyle.emphasisFontSize) wordSizeScaled = Math.round(parseNum(currentStyle.emphasisFontSize, rawLineFontSize) * FONT_COMPENSATION);
                                    if (currentStyle.emphasisFontFamily) currentFontFam = mapFontFamily({ fontFamily: currentStyle.emphasisFontFamily });
                                    if ((currentStyle.emphasisFontFace && currentStyle.emphasisFontFace.toLowerCase().includes('bold')) ||
                                        (currentStyle.emphasisFontWeight && parseInt(currentStyle.emphasisFontWeight, 10) >= 600)) currentBoldTag = '\\b1';
                                    if ((currentStyle.emphasisFontFace && currentStyle.emphasisFontFace.toLowerCase().includes('italic')) ||
                                        (currentStyle.emphasisFontStyle && currentStyle.emphasisFontStyle.toLowerCase() === 'italic')) currentItalicTag = '\\i1';
                                }
                            } else if (wordObj.color) {
                                wordColorHex = wordObj.color;
                            }

                            const dynamicFill = extractAssColor(wordColorHex);
                            const styleTags = `\\fs${wordSizeScaled}${currentBoldTag}${currentItalicTag}\\fn${currentFontFam}`;

                            // Bounce always uses stagger delay for tight cascade (not speech times)
                            const wStartSec = actualStartSeconds + (cumulativeWordCount * (staggerDelayMs / 1000));

                            if (wStartSec >= block.end) { cumulativeWordCount++; return; }

                            const safeT0 = formatTime(wStartSec);
                            const safeEnd = formatTime(block.end);

                            if (normalizedStyle === 'bounce') {
                                // 8-segment spring approximation — matches animationEngine.js spring exactly.
                                // y(lp) = 38*COMP * e^(−5.5*lp) * cos(10.5*lp)  (rise from below, smooth)
                                const T     = lineAnimSpeed / 1000;
                                const A     = 38 * FONT_COMPENSATION;
                                const decay = 5.5;
                                const freq  = 10.5;
                                const N     = 8; // segments — more = smoother approximation of spring curve

                                const springY = (lp) => Math.round(lineFinalY + A * Math.exp(-decay * lp) * Math.cos(freq * lp));

                                const fadeInMs      = Math.round(T * 0.20 * 1000);
                                const safeBlockStart = formatTime(block.start);
                                const baseP = `\\an5\\blur0${baseTags}${styleTags}\\1c${dynamicFill.rgb}\\3a${lineStroke.alpha}\\xshad0\\yshad0`;

                                // Pre-appear: drift upward from yHigher to springY(0) (bounce start position)
                                if (block.start < wStartSec) {
                                    const yHigher     = Math.round(lineFinalY + 58 * FONT_COMPENSATION);
                                    const yBounceStart = springY(0);
                                    const preP = `\\an5\\blur0${baseTags}${styleTags}\\1c${dynamicFill.rgb}\\xshad0\\yshad0`;
                                    assContent += `Dialogue: 1,${safeBlockStart},${safeT0},Default,,0,0,0,,{${preP}\\move(${wordStartX},${yHigher},${wordStartX},${yBounceStart})\\1a&HFF&\\t(0,180,\\1a&H9E&)}${word}\n`;
                                    if (shadowIntensity > 0) {
                                        assContent += `Dialogue: 0,${safeBlockStart},${safeT0},Default,,0,0,0,,{\\an5\\blur${lShadowBlur}${baseTags}${styleTags}\\xshad${lShadowX}\\yshad${lShadowY}\\move(${wordStartX},${yHigher},${wordStartX},${yBounceStart})\\1a&HFF&\\4a&HFF&\\t(0,180,\\4a&H9E&)}${word}\n`;
                                    }
                                }

                                // 8 linear segments that closely approximate the smooth spring curve
                                const shadowP = shadowIntensity > 0
                                    ? `\\an5\\blur${lShadowBlur}${baseTags}${styleTags}\\1a&HFF&\\3a&HFF&\\4a${exactShadowAlpha}\\xshad${lShadowX}\\yshad${lShadowY}`
                                    : null;

                                for (let i = 0; i < N; i++) {
                                    const lp0 = i / N;
                                    const lp1 = (i + 1) / N;
                                    const t0  = wStartSec + lp0 * T;
                                    const t1  = Math.min(wStartSec + lp1 * T, block.end);
                                    if (t0 >= block.end) break;

                                    const y0 = springY(lp0);
                                    const y1 = springY(lp1);
                                    const seg0 = formatTime(t0);
                                    const seg1 = formatTime(t1);

                                    const fadeTag       = i === 0 ? `\\1a&HFF&\\t(0,${fadeInMs},\\1a&H00&)` : '';
                                    const shadowFadeTag = i === 0 ? `\\4a&HFF&\\t(0,${fadeInMs},\\4a${exactShadowAlpha})` : '';

                                    assContent += `Dialogue: 1,${seg0},${seg1},Default,,0,0,0,,{${baseP}\\move(${wordStartX},${y0},${wordStartX},${y1})${fadeTag}}${word}\n`;
                                    if (shadowP) assContent += `Dialogue: 0,${seg0},${seg1},Default,,0,0,0,,{${shadowP}\\move(${wordStartX},${y0},${wordStartX},${y1})${shadowFadeTag}}${word}\n`;
                                }

                                // Settled: hold at final Y for the rest of the block
                                const animEndSec = wStartSec + T;
                                if (block.end > animEndSec) {
                                    const safeAnimEnd = formatTime(animEndSec);
                                    assContent += `Dialogue: 1,${safeAnimEnd},${safeEnd},Default,,0,0,0,,{\\pos(${wordStartX},${lineFinalY})${baseP}}${word}\n`;
                                    if (shadowP) assContent += `Dialogue: 0,${safeAnimEnd},${safeEnd},Default,,0,0,0,,{\\pos(${wordStartX},${lineFinalY})${shadowP}}${word}\n`;
                                }

                            } else {
                                // popin: scale from 50% → 115% → 100% at final position
                                const msPeak = Math.round(lineAnimSpeed * 0.4);
                                const msEnd  = lineAnimSpeed;
                                const tags = `{\\pos(${wordStartX},${lineFinalY})\\an5${baseTags}${styleTags}\\1a&HFF&\\3a&HFF&\\fscx50\\fscy50\\1c${dynamicFill.rgb}\\xshad0\\yshad0\\t(0,${msPeak},\\1a${dynamicFill.alpha}\\3a${lineStroke.alpha}\\fscx115\\fscy115)\\t(${msPeak},${msEnd},\\fscx100\\fscy100)}`;

                                if (shadowIntensity > 0) {
                                    const shadowTags = `{\\pos(${wordStartX},${lineFinalY})\\an5${baseTags}${styleTags}\\1a&HFF&\\3a&HFF&\\4a&HFF&\\fscx50\\fscy50\\xshad${lShadowX}\\yshad${lShadowY}\\t(0,${msPeak},\\4a${exactShadowAlpha}\\fscx115\\fscy115)\\t(${msPeak},${msEnd},\\fscx100\\fscy100)}`;
                                    assContent += `Dialogue: 0,${safeT0},${safeEnd},Default,,0,0,0,,${shadowTags}${word}\n`;
                                }
                                assContent += `Dialogue: 1,${safeT0},${safeEnd},Default,,0,0,0,,${tags}${word}\n`;
                            }
                            cumulativeWordCount++;
                        });

                        return;
                    } else {
                        // Slide / fade word stagger — line moves, words fade in individually
                        wordsArray.forEach((wordObj) => {
                            const word = wordObj.text;
                            if (!word.trim()) {
                                finalAssText    += word + ' ';
                                finalShadowText += word + ' ';
                                return;
                            }

                            const wordStartAnim = Math.round(cumulativeWordCount * staggerDelayMs);
                            const wordEndAnim   = wordStartAnim + Math.max(60, Math.round(150 * revealScale));

                            let wordColorHex = currentStyle.fillColor;
                            let wordSizeScaled = lineFontSizeScaled;
                            let currentBoldTag = lBoldTag;
                            let currentItalicTag = lItalicTag;
                            let currentFontFam = mappedFontFam;

                            if (wordObj.isEmphasized || wordObj.isEmphasis) {
                                wordColorHex = wordObj.color || currentStyle.emphasisColor || currentStyle.accentColor || currentStyle.fillColor;

                                if (currentStyle.id === 'minimalist') {
                                    if (currentStyle.emphasisFontSize) wordSizeScaled = Math.round(parseNum(currentStyle.emphasisFontSize, rawLineFontSize) * FONT_COMPENSATION);
                                    if (currentStyle.emphasisFontFamily) currentFontFam = mapFontFamily({ fontFamily: currentStyle.emphasisFontFamily });
                                    if ((currentStyle.emphasisFontFace && currentStyle.emphasisFontFace.toLowerCase().includes('bold')) ||
                                        (currentStyle.emphasisFontWeight && parseInt(currentStyle.emphasisFontWeight, 10) >= 600)) currentBoldTag = '\\b1';
                                    if ((currentStyle.emphasisFontFace && currentStyle.emphasisFontFace.toLowerCase().includes('italic')) ||
                                        (currentStyle.emphasisFontStyle && currentStyle.emphasisFontStyle.toLowerCase() === 'italic')) currentItalicTag = '\\i1';
                                }
                            } else if (wordObj.color) {
                                wordColorHex = wordObj.color;
                            }

                            const dynamicFill = extractAssColor(wordColorHex);
                            const styleTags = `\\fs${wordSizeScaled}${currentBoldTag}${currentItalicTag}\\fn${currentFontFam}`;

                            const inactiveHex = currentStyle.inactiveColor;
                            let initialStateText, targetStateText, initialStateShadow;

                            if (inactiveHex) {
                                const inactiveFill = extractAssColor(inactiveHex);
                                initialStateText   = `\\1c${inactiveFill.rgb}\\1a${inactiveFill.alpha}\\3a${lineStroke.alpha}`;
                                targetStateText    = `\\1c${dynamicFill.rgb}\\1a${dynamicFill.alpha}\\3a${lineStroke.alpha}`;
                                initialStateShadow = `\\4a${exactShadowAlpha}`;
                            } else {
                                initialStateText   = `\\1c${dynamicFill.rgb}\\1a&HFF&\\3a&HFF&`;
                                targetStateText    = `\\1a${dynamicFill.alpha}\\3a${lineStroke.alpha}`;
                                initialStateShadow = `\\4a&HFF&`;
                            }

                            const inlineTextTags = `{${styleTags}${initialStateText}\\t(${wordStartAnim},${wordEndAnim},${targetStateText})}`;
                            finalAssText += `${inlineTextTags}${word} `;

                            if (shadowIntensity > 0) {
                                const opaqueStateShadow = `\\4a${exactShadowAlpha}`;
                                const inlineShadowTags  = `{${styleTags}${initialStateShadow}\\t(${wordStartAnim},${wordEndAnim},${opaqueStateShadow})}`;
                                finalShadowText += `${inlineShadowTags}${word} `;
                            }
                            cumulativeWordCount++;
                        });
                        finalAssText    = finalAssText.trimEnd();
                        finalShadowText = finalShadowText.trimEnd();
                    }
                } else {
                    // Non-stagger path: static per-word colouring (minimalist etc.)
                    let wordsSource = null;

                    if (enrichedLine?.words?.length > 0) {
                        wordsSource = enrichedLine.words;
                    } else if (block.words?.length > 0) {
                        wordsSource = block.words;
                    } else if (enrichedLine?.measuredWords?.length > 0) {
                        wordsSource = enrichedLine.measuredWords;
                    }

                    if (wordsSource) {
                        let constructedLine   = '';
                        let constructedShadow = '';

                        wordsSource.forEach(w => {
                            const safeWord = String(w.text || w.word || '').trim();
                            if (!safeWord) { constructedLine += ' '; constructedShadow += ' '; return; }

                            let wordColorHex = currentStyle.fillColor;
                            let wordSizeScaled = lineFontSizeScaled;
                            let currentBoldTag = lBoldTag;
                            let currentItalicTag = lItalicTag;
                            let currentFontFam = mappedFontFam;

                            const wColor = String(w.color || '').toLowerCase();
                            if (w.isEmphasized === true || w.isEmphasis === true || w.highlighted === true || wColor === '#ffff00' || wColor === '#ffff3d') {
                                wordColorHex = w.color || currentStyle.emphasisColor || currentStyle.accentColor || '#FFFF3D';
                                if (currentStyle.emphasisFontSize) wordSizeScaled = Math.round(parseNum(currentStyle.emphasisFontSize, rawLineFontSize) * FONT_COMPENSATION);
                                if (currentStyle.emphasisFontFamily) currentFontFam = mapFontFamily({ fontFamily: currentStyle.emphasisFontFamily });
                                if ((currentStyle.emphasisFontFace && currentStyle.emphasisFontFace.toLowerCase().includes('bold')) ||
                                    (currentStyle.emphasisFontWeight && parseInt(currentStyle.emphasisFontWeight, 10) >= 600)) currentBoldTag = '\\b1';
                                if ((currentStyle.emphasisFontFace && currentStyle.emphasisFontFace.toLowerCase().includes('italic')) ||
                                    (currentStyle.emphasisFontStyle && currentStyle.emphasisFontStyle.toLowerCase() === 'italic')) currentItalicTag = '\\i1';
                            } else if (w.color) {
                                wordColorHex = w.color;
                            }

                            const wFill = extractAssColor(wordColorHex);
                            console.log('FINAL STATIC EXPORT:', safeWord, { emphasized: w.isEmphasized, color: wordColorHex, ass: wFill.rgb });

                            const wTags = `{\\fs${wordSizeScaled}${currentBoldTag}${currentItalicTag}\\fn${currentFontFam}\\1c${wFill.rgb}\\1a${wFill.alpha}\\3a${lineStroke.alpha}}`;
                            constructedLine   += `${wTags}${safeWord.replace(/[{}]/g, '')} `;
                            constructedShadow += `{\\fs${wordSizeScaled}${currentBoldTag}${currentItalicTag}\\fn${currentFontFam}\\4a${exactShadowAlpha}\\xshad${lShadowX}\\yshad${lShadowY}}${safeWord.replace(/[{}]/g, '')} `;
                        });

                        finalAssText    = constructedLine.trimEnd();
                        finalShadowText = constructedShadow.trimEnd();

                    } else {
                        const fallbackWords =
                            enrichedLine?.words?.length > 0
                                ? enrichedLine.words
                                : enrichedLine?.measuredWords?.length > 0
                                    ? enrichedLine.measuredWords
                                    : lineText.split(' ').map(w => ({ text: w, isEmphasized: false }));

                        fallbackWords.forEach((wordObj) => {
                            const word = String(wordObj.text || wordObj.word || '').trim();
                            if (!word) { finalAssText += ' '; finalShadowText += ' '; return; }

                            const isEmp = wordObj.isEmphasized === true || wordObj.isEmphasis === true || wordObj.highlighted === true;
                            console.log('EXPORT WORD:', word, isEmp, wordObj.color);

                            const colorHex  = isEmp ? (wordObj.color || currentStyle.emphasisColor || currentStyle.accentColor || '#FFFF3D') : currentStyle.fillColor;
                            const fontSize  = isEmp ? (wordObj.emphasisFontSize || currentStyle.emphasisFontSize || rawLineFontSize) : rawLineFontSize;
                            const dynamicFill    = extractAssColor(colorHex);
                            const scaledSize     = Math.round(fontSize * FONT_COMPENSATION);
                            const dynamicFontFam = isEmp ? mapFontFamily({ fontFamily: currentStyle.emphasisFontFamily || currentStyle.fontFamily }) : mappedFontFam;
                            const dynamicBoldTag   = isEmp ? '\\b1' : lBoldTag;
                            const dynamicItalicTag = isEmp ? '\\i1' : lItalicTag;

                            const styleTags = `\\fs${scaledSize}${dynamicBoldTag}${dynamicItalicTag}\\fn${dynamicFontFam}\\1c${dynamicFill.rgb}\\1a${dynamicFill.alpha}\\3a${lineStroke.alpha}`;
                            finalAssText += `{${styleTags}}${word.replace(/[{}]/g, '')} `;

                            if (shadowIntensity > 0) {
                                const shadowTags = `\\fs${scaledSize}${dynamicBoldTag}${dynamicItalicTag}\\fn${dynamicFontFam}\\4a${exactShadowAlpha}\\xshad${lShadowX}\\yshad${lShadowY}`;
                                finalShadowText += `{${shadowTags}}${word.replace(/[{}]/g, '')} `;
                            }
                            cumulativeWordCount++;
                        });
                    }
                }

                if (shadowIntensity > 0) {
                    const shadowTags = `${basePos}\\blur${lShadowBlur}\\xshad${lShadowX}\\yshad${lShadowY}`;
                    assContent += `Dialogue: 0,${startStr},${endStr},Default,,0,0,0,,{${shadowTags}}${finalShadowText}\n`;
                }

                const textTags = `${basePos}\\blur0\\xshad0\\yshad0`;
                assContent += `Dialogue: 1,${startStr},${endStr},Default,,0,0,0,,{${textTags}}${finalAssText}\n`;
            });
        });

        fs.writeFileSync(assFilePath, assContent);

        const safeAssFilePath = assFilePath.replace(/\\/g, '/');
        await burnSubtitles(inputVideoPath, safeAssFilePath, outputVideoPath);

        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers.host;
        const downloadUrl = `${protocol}://${host}/downloads/${outputVideoName}`;

        res.status(200).json({ success: true, downloadUrl: downloadUrl });

    } catch (error) {
        console.error('Export Error:', error);
        next(error);
    }
};
