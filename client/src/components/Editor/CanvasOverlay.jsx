import React, { useState, useRef, useLayoutEffect } from 'react';
import { Stage, Layer, Text, Group } from 'react-konva';
import { useEditorStore } from '../../store/useEditorStore';
// REMOVED: groupCaptions import as we use baked blocks now
import { calculateAnimation } from '../../utils/animationEngine';

export default function CanvasOverlay() {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    
    // CHANGE 1: Updated Store Selectors
    // Pull timelineBlocks and updateBlockPosition instead of transcription/linePositions
    const { currentTime, activeStyle,lineStyles, timelineBlocks, globalLinePositions,setGlobalLinePosition,
        setSelectedBlock, selectedBlockId, updateBlockPosition
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

    // CHANGE 2 & 3: Filter visible blocks from the timeline
    // This replaces the old "chunkedCaptions" and "activeChunkObj" logic.
    // Stretching a block on the timeline works because this filter respects the block's start/end.
    const visibleBlocks = timelineBlocks.filter(
        block => currentTime >= block.start && currentTime <= block.end
    );

    return (
        <div ref={containerRef} className="absolute inset-0 z-10 w-full h-full">
            <Stage width={dimensions.width} height={dimensions.height}>
                <Layer>
                    {visibleBlocks.map((block) => {
                        const lines = block.text.split('\n');
                        
                        let totalBlockHeight = 0;
                        lines.forEach((_, index) => {
                            // FIX: Add block.styleOverrides here!
                            const style = { ...activeStyle, ...(lineStyles[index] || {}), ...(block.styleOverrides?.[index] || {}) };
                            totalBlockHeight += style.fontSize;
                        });

                        const baseStartY = (dimensions.height - totalBlockHeight) / 2;
                        let currentYOffset = 0;

                        return (
                            // The block base group
                            <Group key={block.id} >
                                {lines.map((lineText, index) => {
                                    
                                    const style = { ...activeStyle, ...(lineStyles[index] || {}), ...(block.styleOverrides?.[index] || {}) };
                                    const animStyle = style.animationStyle || 'none';
                                    const motionBlurIntensity = (style.motionBlur || 0) / 100;
                                    const animDuration = style.animationDurationMs || 300; 
                                    
                                    const STAGGER_DELAY = (style.staggerDelayMs || 0) / 1000;
                                    const isWordStaggered = style.wordStagger ?? activeStyle.wordStagger;
                                    
                                    // 1. Measure each word to place them perfectly horizontally
                                    const canvas = document.createElement('canvas');
                                    const context = canvas.getContext('2d');
                                    context.font = `${style.fontWeight || 'normal'} ${style.fontStyle || 'normal'} ${style.fontSize}px ${style.fontFamily}`;

                                    const words = lineText.split(' ');
                                    const spaceWidth = context.measureText(' ').width;
                                    
                                    let totalLineWidth = 0;
                                    const wordWidths = words.map(w => {
                                        const wWidth = context.measureText(w).width;
                                        totalLineWidth += wWidth;
                                        return wWidth;
                                    });
                                    totalLineWidth += spaceWidth * (words.length - 1);

                                    // Start X so the entire reconstructed line remains centered
                                    let runningX = (dimensions.width - totalLineWidth) / 2;

                                    const customPos = block.customLinePositions?.[index];
                                    const globalPos = globalLinePositions?.[index];

                                    // Prefers custom line position first, then global, then default stack
                                    const lineX = customPos ? customPos.x : (globalPos ? globalPos.x : 0);
                                    const lineY = customPos ? customPos.y : (globalPos ? globalPos.y : (baseStartY + currentYOffset));

                                    const echoes = [];
                                    const mainNodes = [];

                                    words.forEach((word, wordIndex) => {
                                        // If toggle is ON, cascade by word index. If OFF, all words get 0 delay.
                                        const wordDelay = isWordStaggered ? (wordIndex * STAGGER_DELAY) : 0;
                                        
                                        // Time = block start + line delay + word delay
                                        const staggeredStartTime = block.start + (index * STAGGER_DELAY) + wordDelay;
                                        const animState = calculateAnimation(currentTime, staggeredStartTime, animStyle, dimensions, animDuration);

                                        const isMoving = animState.progress > 0 && animState.progress < 1;
                                        const halfWordW = wordWidths[wordIndex] / 2;
                                        const halfWordH = style.fontSize / 2;

                                        // Motion Blur Echoes for THIS specific word
                                        if (isMoving && motionBlurIntensity > 0) {
                                            for (let i = 1; i <= 4; i++) {
                                                const echoScale = animState.scale * (1 - (i * 0.05 * motionBlurIntensity));
                                                echoes.push(
                                                    <Text
                                                        key={`echo-${index}-${wordIndex}-${i}`}
                                                        text={word}
                                                        opacity={animState.opacity * (1 - (i / 5)) * 0.4}
                                                        scaleX={echoScale}
                                                        scaleY={echoScale}
                                                        offsetX={echoScale !== 1 ? halfWordW : 0}
                                                        offsetY={echoScale !== 1 ? halfWordH : 0}
                                                        x={runningX + animState.offsetX + (echoScale !== 1 ? halfWordW : 0)}
                                                        y={animState.offsetY + (echoScale !== 1 ? halfWordH : 0)}
                                                        fontFamily={style.fontFamily}
                                                        fontSize={style.fontSize}
                                                        fill={style.fillColor}
                                                        fontStyle={`${style.fontWeight || 'normal'} ${style.fontStyle || 'normal'}`.trim()}
                                                    />
                                                );
                                            }
                                        }

                                        // Main Node for THIS specific word
                                        mainNodes.push(
                                            <Text
                                                key={`word-${index}-${wordIndex}`}
                                                text={word}
                                                opacity={animState.opacity}
                                                scaleX={animState.scale}
                                                scaleY={animState.scale}
                                                offsetX={animState.scale !== 1 ? halfWordW : 0}
                                                offsetY={animState.scale !== 1 ? halfWordH : 0}
                                                x={runningX + animState.offsetX + (animState.scale !== 1 ? halfWordW : 0)}
                                                y={animState.offsetY + (animState.scale !== 1 ? halfWordH : 0)}
                                                fontFamily={style.fontFamily}
                                                fontSize={style.fontSize}
                                                fill={style.fillColor}
                                                stroke={style.strokeColor}
                                                strokeWidth={style.strokeWidth}
                                                shadowColor={style.shadowColor}
                                                shadowBlur={style.shadowBlur}
                                                shadowOffsetX={style.shadowOffsetX}
                                                shadowOffsetY={style.shadowOffsetY}
                                                fontStyle={`${style.fontWeight || 'normal'} ${style.fontStyle || 'normal'}`.trim()}
                                            />
                                        );

                                        // Move X cursor forward for the next word
                                        runningX += wordWidths[wordIndex] + spaceWidth;
                                    });
                                    
                                    const currentLineOffset = currentYOffset;
                                    currentYOffset += style.fontSize;

                                    // NEW: Each line gets its own INDEPENDENT draggable Group
                                    return (
                                        <Group 
                                            key={`line-group-${index}`}
                                            draggable
                                            x={lineX}
                                            y={lineY}
                                            // CHANGED to onClick so you can drag without selecting!
                                            onClick={(e) => {
                                                e.cancelBubble = true; // Stops the click from unselecting
                                                setSelectedBlock(block.id);
                                            }} 
                                            onDragEnd={(e) => {
                                                if (selectedBlockId === block.id) {
                                                    // Update ONLY this specific word (Requires passing the index now!)
                                                    updateBlockPosition(block.id, index, e.target.x(), e.target.y());
                                                } else {
                                                    // Move the line globally
                                                    setGlobalLinePosition(index, e.target.x(), e.target.y());
                                                }
                                            }}
                                        >
                                            {echoes}
                                            {mainNodes}
                                        </Group>
                                    );
                                })}
                            </Group>
                        );
                    })}
                </Layer>
            </Stage>
        </div>
    );
}