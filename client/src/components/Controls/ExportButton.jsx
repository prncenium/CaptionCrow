import React, { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import axios from 'axios';
import { measureTextWidth } from '../../utils/canvasHelper';
import { getApiBase } from '../../utils/apiConfig';

export default function ExportButton() {
    const [isExporting, setIsExporting] = useState(false);
    
    // 🚨 ADDED: We are also extracting `highlights` from the store as an ultimate fallback
    const { timelineBlocks, activeStyle, serverVideoFilename, globalLineOffsets, lineStyles, transcription, highlights } = useEditorStore();

    const handleExport = async () => {
        if (!serverVideoFilename) {
            alert("Error: Original video not found on server.");
            return;
        }

        if (!timelineBlocks || timelineBlocks.length === 0) {
            alert("Error: No captions found. Make sure the timeline is generated.");
            return;
        }

        setIsExporting(true);
        
        // 🚨 THE FULL-STACK BRIDGE: Bulletproof Word Mapping
        const enrichedBlocks = timelineBlocks.map(block => {
            const lines = block.text.split('\n');
            let flatWordIndex = 0; // Safely tracks the actual word index ignoring line breaks
            
            const enrichedLines = lines.map((lineText, index) => {
                const currentStyle = { ...activeStyle, ...(lineStyles?.[index] || {}), ...(block.styleOverrides?.[index] || {}) };
                
                const words = lineText.split(' ');
                const spaceWidth = measureTextWidth(' ', currentStyle);
                const totalLineWidth = measureTextWidth(lineText, currentStyle);
                
                let currentXOffset = -(totalLineWidth / 2);
                const measuredWords = [];

                words.forEach(wordString => {
                    if (!wordString.trim()) {
                        currentXOffset += spaceWidth;
                        return; // Do not increment flatWordIndex for empty spaces
                    }

                    const wordWidth = measureTextWidth(wordString, currentStyle);
                    
                    const originalWordData =
    enrichedLines?.flatMap(l => l.measuredWords || [])?.[flatWordIndex] ||
    block.words?.[flatWordIndex] ||
    transcription?.find(tw =>
        tw.word?.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase() === cleanTargetStr
    ) ||
    null;
                    
                    // 2. Aggressively clean the string for backup searches (removes ALL punctuation)
                    const cleanTargetStr = wordString
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase();
                    
                    // 3. Backup Search: Check the raw transcription array
                    const transWord = (transcription || []).find(tw => 
                        tw.word
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase() === cleanTargetStr &&
                        tw.start >= block.start - 0.5 && 
                        tw.start <= block.end + 0.5
                    );

                    // 4. Backup Search: Check if the word exists in a global highlights string array
                    const inHighlightsArray = (highlights || []).some(h => 
                        h.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase() === cleanTargetStr
                    );

                    const isEmp =
    inHighlightsArray === true ||
    originalWordData?.isEmphasized === true ||
    originalWordData?.isEmphasis === true ||
    transWord?.isEmphasized === true ||
    transWord?.isEmphasis === true;

                        console.log(
    'EXPORT EMPHASIS CHECK:',
    wordString,
    {
        originalWordData,
        transWord,
        inHighlightsArray,
        final: isEmp
    }
);

                    measuredWords.push({
                        text: wordString,
                        offsetX: currentXOffset,
                        width: wordWidth,
                        
                        // FINALLY SENDING TRUE TO THE BACKEND
                        isEmphasized: isEmp, 
                        color:
    (isEmp ? '#FFFF00' : null),
                        
                        emphasisFontSize: currentStyle.emphasisFontSize,
                        emphasisFontFamily: currentStyle.emphasisFontFamily,
                        emphasisFontFace: currentStyle.emphasisFontFace,
                        emphasisFontStyle: currentStyle.emphasisFontStyle
                    });

                    currentXOffset += wordWidth + spaceWidth;
                    flatWordIndex++; // Advance to the next actual word
                });

                return {
                    lineText: lineText,
                    measuredWords: measuredWords,
                    totalLineWidth: totalLineWidth,
                    spaceWidth: spaceWidth
                };
            });

            return {
                ...block,
                enrichedLines: enrichedLines
            };
        });
        
        try {
            console.log(
    'FINAL EXPORT BLOCKS:',
    JSON.stringify(enrichedBlocks, null, 2)
);
            const response = await axios.post(`${getApiBase()}/export`, {
                filename: serverVideoFilename,
                timelineBlocks: enrichedBlocks, 
                globalLineOffsets: globalLineOffsets,
                activeStyle: activeStyle,
                lineStyles: lineStyles
            });

            if (response.data.success) {
                const link = document.createElement('a');
                link.href = response.data.downloadUrl;
                link.setAttribute('download', 'Caption-Crow-Export.mp4');
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                alert("Export failed on server: " + response.data.message);
            }
        } catch (error) {
            console.error("Export Error:", error);
            alert("Export failed. Please check the backend terminal for errors.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold transition-all rounded-md shadow-lg ${
                isExporting 
                ? "bg-neutral-700 text-neutral-400 cursor-wait" 
                : "bg-white text-black hover:bg-emerald-400 hover:text-black hover:shadow-emerald-500/20"
            }`}
        >
            {isExporting ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rendering Video...
                </>
            ) : (
                <>
                    <Download className="w-4 h-4" />
                    Export Video
                </>
            )}
        </button>
    );
}