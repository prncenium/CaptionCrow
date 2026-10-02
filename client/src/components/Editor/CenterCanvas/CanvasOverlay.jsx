import React, { useState, useRef, useLayoutEffect } from 'react';
import { Stage, Layer, Text, Group, Rect, Line, Circle } from 'react-konva';
import Konva from 'konva';
import { useEditorStore } from '../../../store/useEditorStore';
import { calculateAnimation } from '../../../utils/animationEngine';

const VIRTUAL_WIDTH = 1080;
const VIRTUAL_HEIGHT = 1920;

// Must match FONT_COMPENSATION in exportController.js — both must be 1.86.
// ASS font units ≠ CSS pixels; this factor makes the canvas preview render
// at the same visual size as the exported video.
const FONT_COMP = 1.86;

// Capitalizes just the first letter of a word, leaving the rest untouched —
// so raw lowercase transcript words ("text") render as "Text" while words
// already in a deliberate case ("AI") aren't mangled into "Ai".
const capitalizeWord = (word) => word ? word.charAt(0).toUpperCase() + word.slice(1) : word;

// 🚨 THE FIX: A dedicated component to safely handle Konva Blur & Caching
function AnimatedWord({ word, animState, style, x, y, halfWordW, halfWordH, onClick }) {
    const textRef = useRef(null);

    // Konva requires a node to be cached before a filter (like Blur) can be applied.
    useLayoutEffect(() => {
        if (textRef.current) {
            if (animState.blur > 0) {
                // Add a little padding to the cache box so the blur doesn't get clipped
                textRef.current.cache({ pixelRatio: 2, padding: 20 }); 
            } else {
                textRef.current.clearCache();
            }
        }
    }, [animState.blur, animState.scale, animState.opacity, word, style.fontSize]);

    // 🚨 Convert 0-100 slider value to 0-1 opacity scale
    const shadowIntensityRaw = style.shadowIntensity !== undefined ? style.shadowIntensity : (style.hasShadow !== false ? 80 : 0);
    // The shadow toggle always wins, regardless of a stored intensity value —
    // so turning it back on restores whatever level was set before.
    const shadowIntensity = style.hasShadow === false ? 0 : shadowIntensityRaw;
    const shadowOpacityVal = shadowIntensity / 100;

    return (
        <Text
            ref={textRef}
            text={word}
            opacity={animState.opacity}
            scaleX={animState.scale}
            scaleY={animState.scale}
            offsetX={halfWordW}
            offsetY={halfWordH}
            x={x}
            y={y}
            fontFamily={style.fontFamily}
            fontSize={style.fontSize}
            fill={style.fillColor}
            stroke={style.strokeColor}
            strokeWidth={style.strokeWidth}
            
            shadowColor={style.shadowColor || '#000000'}
            shadowBlur={style.shadowBlur || 0}
            shadowOffsetX={shadowIntensity > 0 ? (style.shadowOffsetX || 0) : 0}
            shadowOffsetY={shadowIntensity > 0 ? (style.shadowOffsetY || 0) : 0}
            shadowOpacity={shadowOpacityVal}

            fontStyle={`${style.fontWeight || 'normal'} ${style.fontStyle || 'normal'}`.trim()}
            filters={animState.blur > 0 ? [Konva.Filters.Blur] : []}
            blurRadius={animState.blur}
            onClick={onClick}
            onTap={onClick}
        />
    );
}

export default function CanvasOverlay() {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    // Tracks the line currently being dragged so we can render a selection box +
    // center crosshair guides over it (like Canva/CapCut alignment guides) — purely
    // visual, so users can see they're repositioning a whole caption line.
    const [dragGuide, setDragGuide] = useState(null);

    const {
        currentTime,
        activeStyle,
        lineStyles,
        timelineBlocks,
        setSelectedBlock,
        globalLineOffsets,
        setGlobalLineOffset,
        isPlaying,
        setPlaying,
        setCurrentTime,
        editingCaptionId,
        updateBlockPosition,
        aiHighlights
    } = useEditorStore();

    useLayoutEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const visibleBlocks = timelineBlocks.filter(
        block => currentTime >= block.start && currentTime <= block.end
    );

    const scale = dimensions.width === 0 ? 1 : Math.min(
        dimensions.width / VIRTUAL_WIDTH, 
        dimensions.height / VIRTUAL_HEIGHT
    );

    const stageOffsetX = dimensions.width === 0 ? 0 : (dimensions.width - (VIRTUAL_WIDTH * scale)) / 2;
    const stageOffsetY = dimensions.height === 0 ? 0 : (dimensions.height - (VIRTUAL_HEIGHT * scale)) / 2;

    return (
        <div ref={containerRef} className="absolute inset-0 z-10 w-full h-full flex items-center justify-center pointer-events-none">
            <Stage 
                width={dimensions.width} 
                height={dimensions.height}
                className="pointer-events-auto"
                onClick={(e) => {
                    if (e.target === e.target.getStage()) {
                        setPlaying(!isPlaying);
                    }
                }}
            >
                <Layer x={stageOffsetX} y={stageOffsetY} scaleX={scale} scaleY={scale}>
                    {visibleBlocks.map((block) => {
                        const lines = block.text.split('\n');

                        // 🚨 REVEAL COMPRESSION (Viral Slide Up only): when speech is fast, the fixed
                        // stagger/anim timing for a 2-line card can outlast the block's actual duration —
                        // Line 2's words never finish sliding/fading in before the block disappears.
                        // Scale stagger delay + anim duration down so the FULL reveal (last word of the
                        // LAST line reaching opacity 1) always fits inside block.end - block.start.
                        const totalWordsInBlock = lines.reduce((sum, l) => sum + l.split(' ').filter(Boolean).length, 0);
                        const blockDurationSec = Math.max(0.05, block.end - block.start);
                        const baseStyleNormBlock = String(activeStyle.animationStyle || '').toLowerCase().replace(/\s+/g, '');
                        const blockIsSlideStagger = !!activeStyle.wordStagger
                            && baseStyleNormBlock.includes('slide') && !baseStyleNormBlock.includes('bounce');
                        const requiredSecBlock = ((totalWordsInBlock - 1) * ((activeStyle.staggerDelayMs || 0) / 1000))
                            + ((activeStyle.animationDurationMs || 300) / 1000);
                        const revealScale = (blockIsSlideStagger && requiredSecBlock > blockDurationSec)
                            ? Math.max(0.25, blockDurationSec / requiredSecBlock)
                            : 1;

                        const LINE_HEIGHT_MULTIPLIER = 1.15;

                        let totalBlockHeight = 0;
lines.forEach((_, index) => {
    const s = { ...activeStyle, ...(lineStyles[index] || {}), ...(block.styleOverrides?.[index] || {}) };
    totalBlockHeight += ((s.fontSize || 48) * LINE_HEIGHT_MULTIPLIER); // raw fontSize — matches export layout math
});

                        const baseStartY = (VIRTUAL_HEIGHT - totalBlockHeight) / 2;
                        let currentYOffset = 0;
                        let cumulativeWordCount = 0; 

                        return (
                            <Group key={block.id}>
                                {lines.map((lineText, index) => {
                                    const rawStyle = { ...activeStyle, ...(lineStyles[index] || {}), ...(block.styleOverrides?.[index] || {}) };
                                    // FONT_COMP (1.86) corrects CSS→ASS size mismatch only for Coolvetica (Minimalist).
                                    // Poppins/Inter presets render 1:1 between canvas and libass — no scaling needed.
                                    const activeFontComp = activeStyle.id === 'minimalist' ? FONT_COMP : 1.0;
                                    const style = {
                                        ...rawStyle,
                                        fontSize: Math.round((rawStyle.fontSize || 48) * activeFontComp),
                                        emphasisFontSize: rawStyle.emphasisFontSize
                                            ? Math.round(rawStyle.emphasisFontSize * activeFontComp)
                                            : rawStyle.emphasisFontSize,
                                    };
                                    const animStyle = style.animationStyle || 'none';
                                    const motionBlurIntensity = (style.motionBlur || 0) / 100;
                                    const animDuration = (style.animationDurationMs || 300) * revealScale;

                                    const STAGGER_DELAY = ((style.staggerDelayMs || 0) / 1000) * revealScale;
                                    const isWordStaggered = style.wordStagger ?? activeStyle.wordStagger;
                                    
                                    // For slide+wordStagger, each line's GROUP should start sliding
                                    // when its first word begins to appear (cumulativeWordCount * delay),
                                    // not at block.start — otherwise Line 2+ finish sliding before their
                                    // words are visible. Non-slide wordStagger (bounce/popin) keeps delay=0.
                                    const styleNormLine = (animStyle || '').toLowerCase().replace(/\s+/g, '');
                                    const isSlidingLine = styleNormLine.includes('slide') && !styleNormLine.includes('bounce');
                                    const lineDelaySec = isWordStaggered
                                        ? (isSlidingLine ? (cumulativeWordCount * STAGGER_DELAY) : 0)
                                        : (index * STAGGER_DELAY);
                                    const lineStartTime = block.start + lineDelaySec;
                                    const lineAnimState = calculateAnimation(currentTime, lineStartTime, animStyle, { width: VIRTUAL_WIDTH, height: VIRTUAL_HEIGHT }, animDuration);

                                    const canvas = document.createElement('canvas');
                                    const context = canvas.getContext('2d');
                                    const words = lineText.split(' ').map(capitalizeWord);
                                    
                                    let totalLineWidth = 0;
                                    const wordWidths = words.map(w => {
                                        // 🚨 CHECK AI HIGHLIGHTS
                                        const cleanWord = w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
                                        const isHighlighted = aiHighlights?.includes(cleanWord);
                                        
                                        // Determine specific font size/weight for this word
                                        const wSize = isHighlighted && style.emphasisFontSize ? style.emphasisFontSize : style.fontSize;
                                        const measureFamily  = isHighlighted && style.emphasisFontFamily ? style.emphasisFontFamily : style.fontFamily;
const measureStyle   = isHighlighted && style.emphasisFontStyle  ? style.emphasisFontStyle  : (style.fontStyle  || 'normal');
const measureWeight  = isHighlighted && style.emphasisFontWeight ? style.emphasisFontWeight : (style.fontWeight || '400');

context.font = `${measureStyle} ${measureWeight} ${wSize}px "${measureFamily}"`;
                                        const wWidth = context.measureText(w).width;
                                        totalLineWidth += wWidth;
                                        return wWidth;
                                    });

                                    // Measure space with the actual line font for consistent gaps
                                    context.font = `${style.fontStyle || 'normal'} ${style.fontWeight || '400'} ${style.fontSize}px "${style.fontFamily}"`;
                                    const spaceWidth = context.measureText(' ').width;
                                    totalLineWidth += spaceWidth * (words.length - 1);

                                    let runningX = (VIRTUAL_WIDTH - totalLineWidth) / 2;

                                    const safeStartX = runningX;

                                    const echoes = [];
                                    const mainNodes = [];

                                    words.forEach((word, wordIndex) => {
                                        const cleanWord = word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
                                        const isHighlighted = aiHighlights?.includes(cleanWord);

                                        const wordStyle = {
    ...style,

    fillColor:
        isHighlighted && style.emphasisColor
            ? style.emphasisColor
            : style.fillColor,

    fontSize:
        isHighlighted && style.emphasisFontSize
            ? style.emphasisFontSize
            : style.fontSize,

    fontWeight: isHighlighted && style.emphasisFontWeight ? style.emphasisFontWeight : style.fontWeight,
    fontStyle:  isHighlighted && style.emphasisFontStyle  ? style.emphasisFontStyle  : style.fontStyle,
    fontFamily: isHighlighted && style.emphasisFontFamily ? style.emphasisFontFamily : style.fontFamily,


};

                                        const wordDelay = isWordStaggered ? (cumulativeWordCount * STAGGER_DELAY) : lineDelaySec;

                                        // For bounce: use stagger delay (not speech times) so the
                                        // cascade is always tight and controlled regardless of speaking pace.
                                        const isBounceAnim = (animStyle || '').toLowerCase().includes('bounce');
                                        const wordStartTime = block.start + wordDelay;

        const wordAnimState = calculateAnimation(currentTime, wordStartTime, animStyle, { width: VIRTUAL_WIDTH, height: VIRTUAL_HEIGHT }, animDuration);

                                        // Pre-appear: words drift upward from +58px toward +38px (bounce start position).
                                        // Bottom-to-top: words appear below baseline, drift up, spring into bounce.
                                        if (isBounceAnim && currentTime >= block.start && currentTime < wordStartTime) {
                                            const preElapsed = currentTime - block.start;
                                            const waitDuration = Math.max(0.001, wordStartTime - block.start);
                                            const t = Math.min(1, preElapsed / waitDuration);
                                            // Quadratic ease-in: slow at bottom, accelerates upward into bounce start
                                            wordAnimState.offsetY = 58 - 20 * (t * t);    // +58 → +38 (seamless into bounce)
                                            wordAnimState.opacity = Math.min(0.38, (preElapsed / 0.18) * 0.38);
                                            wordAnimState.scale = 0.90;
                                        }

                                        // Slide + wordStagger: the line GROUP already slides as a unit via lineAnimState.
                                        // Words should only fade in — zeroing per-word offsets prevents double-sliding.
                                        const styleNormWord = (animStyle || '').toLowerCase().replace(/\s+/g, '');
                                        const isSlidingStyle = !isBounceAnim && styleNormWord.includes('slide');
                                        if (isSlidingStyle && isWordStaggered) {
                                            wordAnimState.offsetY = 0;
                                            wordAnimState.offsetX = 0;
                                            wordAnimState.scale = 1;
                                        }

                                        // 'none' + wordStagger (cinematic): fade words in over 150ms to match export behavior.
                                        if (styleNormWord === 'none' && isWordStaggered) {
                                            const FADE_DUR = 0.15;
                                            const fadeElapsed = currentTime - wordStartTime;
                                            if (fadeElapsed >= 0 && fadeElapsed < FADE_DUR) {
                                                wordAnimState.opacity = fadeElapsed / FADE_DUR;
                                            }
                                        }

        // 🚨 NEW: KARAOKE PREVIEW LOGIC
        if (style.inactiveColor) {
            wordAnimState.opacity = 1; // Force 100% visibility at all times
            if (currentTime < wordStartTime) {
                wordStyle.fillColor = style.inactiveColor; // Use secondary color if not yet spoken
            }
        }

                                        const isMoving = wordAnimState.progress > 0 && wordAnimState.progress < 1;
                                        const halfWordW = wordWidths[wordIndex] / 2;
                                        const halfWordH = wordStyle.fontSize / 2;
                                        // Always center-based pivot: scale never causes an X/Y jump
                                        const finalWordX = runningX + halfWordW;
                                        const finalWordY = halfWordH + (wordAnimState.offsetY || 0);

                                        // Only render echoes if explicitly asked for motion blur tail
                                        if (isMoving && motionBlurIntensity > 0) {
                                            for (let i = 1; i <= 4; i++) {
                                                const echoScale = wordAnimState.scale * (1 - (i * 0.05 * motionBlurIntensity));
                                                echoes.push(
                                                    <Text
    key={`echo-${index}-${wordIndex}-${i}`}
    text={word}
    opacity={wordAnimState.opacity * (1 - (i / 5)) * 0.4}
    scaleX={echoScale}
    scaleY={echoScale}
    offsetX={echoScale !== 1 ? halfWordW : 0}
    offsetY={echoScale !== 1 ? halfWordH : 0}
    x={runningX + (echoScale !== 1 ? halfWordW : 0)}
    y={(echoScale !== 1 ? halfWordH : 0)}

    fontFamily={wordStyle.fontFamily}
    fontSize={wordStyle.fontSize}
    fill={wordStyle.fillColor}

    fontStyle={
        `${wordStyle.fontWeight || '400'} ${wordStyle.fontStyle || 'normal'}`
    }
/>
                                                );
                                            }
                                        }

                                        // Seek to the word's speech time. Use block.words[i].start only if it
                                        // falls within the block's time range (guards against index mismatches).
                                        const rawWordStart = block.words?.[cumulativeWordCount]?.start;
                                        const wordSpeechStart = (typeof rawWordStart === 'number' && rawWordStart >= block.start && rawWordStart <= block.end)
                                            ? rawWordStart
                                            : block.start;
                                        const handleWordClick = (e) => {
                                            e.cancelBubble = true;
                                            setSelectedBlock(block.id);
                                            // +0.001 ensures currentTime is inside this block, not on the
                                            // boundary shared with the previous block, which would show both.
                                            const seekTo = wordSpeechStart + 0.001;
                                            setCurrentTime(seekTo);
                                            const videoEl = document.querySelector('video');
                                            if (videoEl) videoEl.currentTime = seekTo;
                                        };

                                        mainNodes.push(
                                            <AnimatedWord
                                                key={`word-${index}-${wordIndex}`}
                                                word={word}
                                                animState={wordAnimState}
                                                style={wordStyle}
                                                x={finalWordX}
                                                y={finalWordY}
                                                halfWordW={halfWordW}
                                                halfWordH={halfWordH}
                                                onClick={handleWordClick}
                                            />
                                        );

                                        runningX += wordWidths[wordIndex] + spaceWidth;
                                        cumulativeWordCount++; 
                                    });
                                    
                                    const currentLineOffset = currentYOffset;
                                    currentYOffset += ((rawStyle.fontSize || 48) * LINE_HEIGHT_MULTIPLIER); // raw fontSize — keeps inter-line spacing matching export

                                    const localPos = block.customLinePositions?.[index];
                                    const globalPos = globalLineOffsets?.[index];
                                    
                                    const finalLineX = (localPos ? localPos.x : (globalPos?.x ?? 0)) + lineAnimState.offsetX;
                                    const finalLineY = (localPos ? localPos.y : (globalPos?.y ?? (baseStartY + currentLineOffset))) + lineAnimState.offsetY;

                                    return (
                                        <Group 
                                            key={`line-group-${index}`}
                                            draggable
                                            x={finalLineX}
                                            y={finalLineY}
                                            onClick={(e) => {
                                                e.cancelBubble = true;
                                                setSelectedBlock(block.id);
                                            }}
                                            onDragStart={(e) => {
                                                setDragGuide({
                                                    boxLocalX: safeStartX - 20,
                                                    boxLocalY: -10,
                                                    boxW: totalLineWidth + 40,
                                                    boxH: style.fontSize * LINE_HEIGHT_MULTIPLIER + 20,
                                                    x: e.target.x(),
                                                    y: e.target.y(),
                                                });
                                            }}
                                            onDragMove={(e) => {
                                                setDragGuide((prev) => (prev ? { ...prev, x: e.target.x(), y: e.target.y() } : prev));
                                            }}
                                            onDragEnd={(e) => {
                                                const droppedX = e.target.x() - lineAnimState.offsetX;
                                                const droppedY = e.target.y() - lineAnimState.offsetY;

                                                if (editingCaptionId === block.id) {
                                                    updateBlockPosition(block.id, index, droppedX, droppedY);
                                                } else {
                                                    setGlobalLineOffset(index, droppedX, droppedY);
                                                }
                                                setDragGuide(null);
                                            }}
                                            onMouseEnter={(e) => {
                                                const container = e.target.getStage().container();
                                                container.style.cursor = 'grab';
                                            }}
                                            onMouseLeave={(e) => {
                                                const container = e.target.getStage().container();
                                                container.style.cursor = 'default';
                                            }}
                                        >
                                            {style.hasBackground && (
                                                <Rect
                                                    x={safeStartX - 20} // 🚨 FIX 2: Use safeStartX instead of runningX
                                                    y={-10}           
                                                    width={totalLineWidth + 40} 
                                                    height={style.fontSize * LINE_HEIGHT_MULTIPLIER + 20} 
                                                    fill={style.backgroundColor || '#000000'}
                                                    cornerRadius={14} 
                                                    opacity={lineAnimState.opacity} 
                                                />
                                            )}
                                            {echoes}
                                            {mainNodes}
                                        </Group>
                                    );
                                })}
                            </Group>
                        );
                    })}

                    {/* Drag guides: selection box + center crosshair over the line being
                        dragged, so it's visually clear a whole caption line is moving. */}
                    {dragGuide && (() => {
                        const absX = dragGuide.x + dragGuide.boxLocalX;
                        const absY = dragGuide.y + dragGuide.boxLocalY;
                        const centerX = absX + dragGuide.boxW / 2;
                        const centerY = absY + dragGuide.boxH / 2;
                        const handlePoints = [
                            [absX, absY], [centerX, absY], [absX + dragGuide.boxW, absY],
                            [absX, centerY], [absX + dragGuide.boxW, centerY],
                            [absX, absY + dragGuide.boxH], [centerX, absY + dragGuide.boxH], [absX + dragGuide.boxW, absY + dragGuide.boxH],
                        ];
                        return (
                            <Group listening={false}>
                                <Line points={[centerX, 0, centerX, VIRTUAL_HEIGHT]} stroke="#0891B2" strokeWidth={2.5} dash={[6, 4]} />
                                <Line points={[0, centerY, VIRTUAL_WIDTH, centerY]} stroke="#C2410C" strokeWidth={2.5} dash={[6, 4]} />
                                <Rect x={absX} y={absY} width={dragGuide.boxW} height={dragGuide.boxH} stroke="#FFFFFF" strokeWidth={1.5} cornerRadius={4} />
                                {handlePoints.map(([hx, hy], i) => (
                                    <Circle key={i} x={hx} y={hy} radius={6} fill="#FFFFFF" stroke="#888888" strokeWidth={1} />
                                ))}
                            </Group>
                        );
                    })()}
                </Layer>
            </Stage>
        </div>
    );
}