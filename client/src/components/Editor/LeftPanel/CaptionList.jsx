import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { ArrowLeft, Edit2, Loader2, Plus, Clock, RotateCcw } from 'lucide-react';
import { HexColorPicker } from "react-colorful";

const getSliderStyle = (val, min, max) => {
    const percentage = ((val - min) / (max - min)) * 100;
    return {
        background: `linear-gradient(to right, #34C759 0%, #34C759 ${percentage}%, rgba(255, 255, 255, 0.4) ${percentage}%, rgba(255, 255, 255, 0.4) 100%)`
    };
};

const glassSliderClass = "w-full h-1.5 rounded-lg appearance-none cursor-pointer border border-white/60 shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_2px_5px_rgba(0,0,0,0.15)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/5 transition-all";

export default function CaptionList() {
    const { 
        timelineBlocks, selectedBlockId, setSelectedBlock, setCurrentTime,
        editingCaptionId, setEditingCaptionId, updateBlockStyleOverride, activeStyle,
        updateBlockText, updateBlockPosition, transcription, 
        isProcessing,  
        bakeTimeline,
        addManualCaption, 
        currentTime
     } = useEditorStore();

     const [openColorPickerIndex, setOpenColorPickerIndex] = useState(null);
     const panelRef = useRef(null);

     // Close editor when clicking outside the panel
     useEffect(() => {
         if (!editingCaptionId) return;
         const handleOutside = (e) => {
             if (panelRef.current && !panelRef.current.contains(e.target)) {
                 setEditingCaptionId(null);
             }
         };
         document.addEventListener('mousedown', handleOutside);
         return () => document.removeEventListener('mousedown', handleOutside);
     }, [editingCaptionId, setEditingCaptionId]);

     // 🚨 NEW SCRUBBER STATE & LOGIC 🚨
     const [isDraggingPosition, setIsDraggingPosition] = useState(false);
     const [dragContext, setDragContext] = useState(null);

     const handlePositionDragStart = (e, blockId, lineIndex, axis, currentValue) => {
         e.preventDefault();
         setIsDraggingPosition(true);
         setDragContext({
             startX: e.clientX,
             startValue: currentValue || 0,
             blockId,
             lineIndex,
             axis
         });
     };

     useEffect(() => {
         const handleGlobalMouseMove = (e) => {
             if (!isDraggingPosition || !dragContext) return;
             
             const deltaX = e.clientX - dragContext.startX;
             const newValue = dragContext.startValue + (deltaX * 0.5); // 0.5 is sensitivity
             
             const block = timelineBlocks.find(b => b.id === dragContext.blockId);
             if (!block) return;
             
             const currentX = block.customLinePositions?.[dragContext.lineIndex]?.x || 0;
             const currentY = block.customLinePositions?.[dragContext.lineIndex]?.y || 0;

             if (dragContext.axis === 'x') {
                 updateBlockPosition(dragContext.blockId, dragContext.lineIndex, newValue, currentY);
             } else {
                 updateBlockPosition(dragContext.blockId, dragContext.lineIndex, currentX, newValue);
             }
         };

         const handleGlobalMouseUp = () => {
             setIsDraggingPosition(false);
             setDragContext(null);
         };

         if (isDraggingPosition) {
             window.addEventListener('mousemove', handleGlobalMouseMove);
             window.addEventListener('mouseup', handleGlobalMouseUp);
         }

         return () => {
             window.removeEventListener('mousemove', handleGlobalMouseMove);
             window.removeEventListener('mouseup', handleGlobalMouseUp);
         };
     }, [isDraggingPosition, dragContext, timelineBlocks, updateBlockPosition]);

     const handleAddClick = () => {
        addManualCaption(currentTime);
    };

    useEffect(() => {
        if (transcription && transcription.length > 0 && timelineBlocks.length === 0) {
            bakeTimeline();
        }
    }, [transcription, timelineBlocks.length, bakeTimeline]);

    // -----------------------------------------------------
    // STATE 1: INDIVIDUAL EDITING MODE (Deep Dive)
    // -----------------------------------------------------
    if (editingCaptionId) {
        const block = timelineBlocks.find(b => b.id === editingCaptionId);
        if (!block) return null;

        const lines = block.text.split('\n');

        return (
            /* 🚨 THE LIQUID GLASS PANEL CONTAINER 🚨 */
            <div ref={panelRef} className="flex flex-col h-full bg-white/55 backdrop-blur-xl border border-white/75 shadow-[0_8px_32px_rgba(180,100,140,0.08)] rounded-3xl overflow-hidden flex-1 min-h-0">

                {/* Header for Editing Mode */}
                <div className="flex items-center gap-3 p-4 border-b border-white/55 bg-white/40 sticky top-0 z-10">
                    <button 
                        onClick={() => setEditingCaptionId(null)}
                        className="p-1.5 text-neutral-500 hover:text-slate-900 hover:bg-white/60 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h3 className="text-sm font-bold text-slate-900 tracking-wide">Caption Editor</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {lines.map((lineText, i) => {
                        const currentColor = block.styleOverrides?.[i]?.fillColor || activeStyle.fillColor || '#ffffff';

                        return (
                            <div key={i} className="p-4 bg-white/60 rounded-2xl border border-white/70 shadow-sm">
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-1.5 py-0.5 rounded bg-[#007AFF]/10 border border-[#007AFF]/20 text-[10px] font-bold text-[#007AFF] tracking-widest">
                                        LINE {i + 1}
                                    </span>
                                    <span className="text-neutral-500 text-sm italic truncate flex-1 font-medium">
                                        "{lineText}"
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {/* 1. Edit Actual Text */}
                                    <div>
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block">Text Content</label>
                                        <input 
                                            type="text" 
                                            value={lineText}
                                            onChange={(e) => {
                                                const newLines = [...lines];
                                                newLines[i] = e.target.value;
                                                updateBlockText(block.id, newLines.join('\n'));
                                            }}
                                            className="w-full h-9 px-3 rounded-lg bg-white/80 border border-white/70 text-slate-900 text-sm font-medium focus:border-[#007AFF] outline-none transition-colors shadow-sm"
                                        />
                                    </div>

                                    {/* 2. Position (X / Y) */}
<div className="flex gap-3">
    <div className="flex-1">
        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block">Pos X</label>
        <div className="relative">
            <input 
                type="number" 
                value={block.customLinePositions?.[i]?.x !== undefined ? Number(block.customLinePositions[i].x).toFixed(1) : ''}
                placeholder="Auto"
                onChange={(e) => {
                    const currentY = block.customLinePositions?.[i]?.y || 0;
                    const newX = e.target.value ? parseFloat(e.target.value) : 0;
                    updateBlockPosition(block.id, i, newX, currentY);
                }}
                /* Inputs are back to normal (no drag handlers or resize cursors here) */
                className="w-full h-9 pl-3 pr-8 rounded-lg bg-white/80 border border-white/70 text-slate-900 text-sm font-medium focus:border-[#007AFF] outline-none transition-colors shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {/* 🚨 DEDICATED DRAG HANDLE 🚨 */}
            <div 
                className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-ew-resize opacity-40 hover:opacity-80 transition-opacity"
                onMouseDown={(e) => {
                    const currentX = block.customLinePositions?.[i]?.x || 0;
                    handlePositionDragStart(e, block.id, i, 'x', currentX);
                }}
            >
                <span className="text-slate-900 text-[11px] font-black pointer-events-none">|</span>
            </div>
        </div>
    </div>
    <div className="flex-1">
        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block">Pos Y</label>
        <div className="relative">
            <input 
                type="number" 
                value={block.customLinePositions?.[i]?.y !== undefined ? Number(block.customLinePositions[i].y).toFixed(1) : ''}
                placeholder="Auto"
                onChange={(e) => {
                    const currentX = block.customLinePositions?.[i]?.x || 0;
                    const newY = e.target.value ? parseFloat(e.target.value) : 0;
                    updateBlockPosition(block.id, i, currentX, newY);
                }}
                /* Inputs are back to normal (no drag handlers or resize cursors here) */
                className="w-full h-9 pl-3 pr-8 rounded-lg bg-white/80 border border-white/70 text-slate-900 text-sm font-medium focus:border-[#007AFF] outline-none transition-colors shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {/* 🚨 DEDICATED DRAG HANDLE 🚨 */}
            <div 
                className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-ew-resize opacity-40 hover:opacity-80 transition-opacity"
                onMouseDown={(e) => {
                    const currentY = block.customLinePositions?.[i]?.y || 0;
                    handlePositionDragStart(e, block.id, i, 'y', currentY);
                }}
            >
                <span className="text-slate-900 text-[11px] font-black pointer-events-none">|</span>
            </div>
        </div>
    </div>
</div>

{/* 2.5. Line-Specific Font Size */}
                                <div className="flex items-center gap-4 pt-4 border-t border-white/60 mt-4">
                                    <label className="w-20 shrink-0 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Font Size</label>
                                    
                                    <div className="flex-1 flex items-center">
                                        <input 
                                            type="range" 
                                            min="10" 
                                            max="150"
                                            value={block.styleOverrides?.[i]?.fontSize || activeStyle.fontSize || 48}
                                            onChange={(e) => {
                                                const newSize = parseInt(e.target.value);
                                                updateBlockStyleOverride(block.id, { 
                                                    [i]: { ...(block.styleOverrides?.[i] || {}), fontSize: newSize } 
                                                });
                                            }}
                                            /* Utilizing your existing global styles! */
                                            className={glassSliderClass}
                                            style={getSliderStyle(block.styleOverrides?.[i]?.fontSize || activeStyle.fontSize || 48, 10, 150)}
                                        />
                                    </div>

                                    {/* Exact Number Input Box matching your image */}
                                    <input 
                                        type="number"
                                        min="10"
                                        max="150"
                                        value={block.styleOverrides?.[i]?.fontSize || activeStyle.fontSize || 48}
                                        onChange={(e) => {
                                            const newSize = parseInt(e.target.value) || 48;
                                            updateBlockStyleOverride(block.id, { 
                                                [i]: { ...(block.styleOverrides?.[i] || {}), fontSize: newSize } 
                                            });
                                        }}
                                        className="w-14 h-9 text-center rounded-xl bg-white/80 border border-white/70 text-slate-900 text-sm font-bold shadow-sm focus:border-[#007AFF] outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                    
                                    {/* 3. Line-Specific Color & Size */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-white/60">
                                        {/* Parent div with relative anchoring */}
                                        <div className="flex flex-col gap-1.5 relative">
                                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Override Color</label>
                                            
                                            {/* Stacked Panel Layout */}
                                            <div className="flex flex-col gap-2 p-2 bg-white/60 backdrop-blur-md rounded-xl border border-white/70 shadow-sm w-fit">
                                                
                                                {/* Top Row: Swatch and Hex Input */}
                                                <div className="flex items-center gap-2">
                                                    {/* The Color Swatch Button */}
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setOpenColorPickerIndex(openColorPickerIndex === i ? null : i);
                                                        }}
                                                        className="w-8 h-8 rounded-lg cursor-pointer border border-white/70 shadow-inner p-0 transition-all hover:scale-105 active:scale-95"
                                                        style={{ backgroundColor: currentColor }}
                                                    />
                                                    
                                                    {/* The Explicit HEX Text Input */}
                                                    <input 
                                                        type="text" 
                                                        value={currentColor}
                                                        onChange={(e) => {
                                                            updateBlockStyleOverride(block.id, { 
                                                                [i]: { ...(block.styleOverrides?.[i] || {}), fillColor: e.target.value } 
                                                            });
                                                        }}
                                                        className="w-20 h-8 px-2 rounded-lg bg-white/80 border border-white/70 text-slate-900 text-[11px] font-semibold focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none shadow-sm uppercase tracking-wide"
                                                        maxLength={7}
                                                    />
                                                </div>

                                                {/* Bottom Row: Field Annotation */}
                                                <div className="flex items-center pl-[40px]">
                                                    
                                                </div>
                                            </div>

                                            {/* 🚨 THE CUSTOM DARK GLASSY HEX POPUP 🚨 */}
                                            {openColorPickerIndex === i && (
                                                <>
                                                    {/* Fullscreen overlay to capture outside clicks */}
                                                    <div 
                                                        className="fixed inset-0 z-50 cursor-default" 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setOpenColorPickerIndex(null);
                                                        }}
                                                    ></div>
                                                    
                                                    {/* Dark Glassy Wrapper matching your reference image */}
                                                    <div className="absolute top-12 left-0 z-50 bg-gradient-to-br from-[#F2D5DA]/80 to-[#DEB7E0]/80 backdrop-blur-2xl rounded-xl shadow-[0_8px_32px_rgba(180,100,140,0.15)] border border-white/80 w-[220px] overflow-hidden flex flex-col">
                                                        
                                                        {/* Custom Top Bar */}
<div className="flex items-center justify-between px-3 py-2 border-b border-white/60 bg-white/50">
    <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-[4px] border border-slate-200 shadow-inner" style={{ backgroundColor: currentColor }} />
        <span className="text-slate-800 text-[11px] font-bold font-mono tracking-wider">
            # {currentColor.replace('#', '').toUpperCase()}
        </span>
    </div>
    <button 
        onClick={(e) => {
            e.stopPropagation();
            updateBlockStyleOverride(block.id, { [i]: { ...(block.styleOverrides?.[i] || {}), fillColor: '#FFFFFF' } });
        }}
        className="p-1 rounded hover:bg-white/60 transition-colors text-slate-400 hover:text-slate-900"
    >
        <RotateCcw className="w-3.5 h-3.5" />
    </button>
</div>

                                                        {/* Native Library Injection overriding internal classes to stack flush */}
                                                        <div className="p-3 pb-2
                                                            [&_.react-colorful]:w-full [&_.react-colorful]:h-auto [&_.react-colorful]:flex [&_.react-colorful]:flex-col [&_.react-colorful]:gap-0
                                                            [&_.react-colorful__saturation]:h-32 [&_.react-colorful__saturation]:rounded-t-lg [&_.react-colorful__saturation]:rounded-b-none [&_.react-colorful__saturation]:border-none
                                                            [&_.react-colorful__hue]:h-5 [&_.react-colorful__hue]:rounded-t-none [&_.react-colorful__hue]:rounded-b-lg [&_.react-colorful__hue]:mt-0 [&_.react-colorful__hue]:border-none
                                                            [&_.react-colorful__pointer]:!w-4 [&_.react-colorful__pointer]:!h-4 [&_.react-colorful__pointer]:!border-2 [&_.react-colorful__pointer]:border-white [&_.react-colorful__pointer]:shadow-[0_0_4px_rgba(0,0,0,0.5)]
                                                        ">
                                                            <HexColorPicker 
                                                                color={currentColor} 
                                                                onChange={(newColor) => {
                                                                    updateBlockStyleOverride(block.id, { 
                                                                        [i]: { ...(block.styleOverrides?.[i] || {}), fillColor: newColor } 
                                                                    });
                                                                }} 
                                                            />
                                                        </div>

                                                        {/* Custom Bottom Bar */}
<div className="flex items-center justify-between px-3 py-2.5 bg-white/40 border-t border-white/50">
    <div className="w-4 h-4 rounded-[4px] border border-slate-200 shadow-inner" style={{ backgroundColor: currentColor }} />
    <span className="text-slate-500 font-bold text-[10px] font-mono tracking-wider">
        {currentColor.toUpperCase()}
    </span>
</div>

                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* 4. Word Stagger */}
                                    <div className="flex items-center justify-between px-3 py-2 mt-2 bg-white/55 border rounded-xl border-white/70 shadow-sm">
                                        <div>
                                            <label className="block text-[10.5px] font-bold tracking-wider uppercase text-slate-800">Word Stagger</label>
                                            <span className="text-[9.5px] text-neutral-500 font-medium block mt-0.5">Cascade animation per word</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const currentStagger = block.styleOverrides?.[i]?.wordStagger ?? activeStyle.wordStagger;
                                                updateBlockStyleOverride(block.id, { 
                                                    [i]: { ...(block.styleOverrides?.[i] || {}), wordStagger: !currentStagger } 
                                                });
                                            }}
                                            className={`relative inline-flex h-5 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none shadow-inner border border-black/5 ${
                                                (block.styleOverrides?.[i]?.wordStagger ?? activeStyle.wordStagger) 
                                                    ? 'bg-[#34C759]' 
                                                    : 'bg-black/10'
                                            }`}
                                        >
                                            <span 
                                                className={`inline-block h-4 w-6 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-[0_2px_5px_rgba(0,0,0,0.15)] border border-black/5 ${
                                                    (block.styleOverrides?.[i]?.wordStagger ?? activeStyle.wordStagger) 
                                                        ? 'translate-x-[18px]' 
                                                        : 'translate-x-0.5'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // -----------------------------------------------------
    // STATE 2: PROCESSING / LOADING
    // -----------------------------------------------------
    if (isProcessing) {
        return (
            <div className="flex flex-col h-full bg-white/55 backdrop-blur-xl border border-white/75 shadow-[0_8px_32px_rgba(180,100,140,0.08)] rounded-3xl overflow-hidden flex-1 min-h-0 items-center justify-center p-6 text-center">
                <Loader2 className="w-8 h-8 mb-4 text-[#007AFF] animate-spin" />
                <h3 className="text-sm font-bold tracking-wider text-slate-900 animate-pulse uppercase mb-2">
                    Transcribing Audio...
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-[200px] font-medium">
                    Extracting precise timestamps and building caption blocks.
                </p>
            </div>
        );
    }

    // -----------------------------------------------------
    // STATE 3: DEFAULT LIST VIEW
    // -----------------------------------------------------
    return (
        <div className="flex flex-col h-full bg-white/55 backdrop-blur-xl border border-white/75 shadow-[0_8px_32px_rgba(180,100,140,0.08)] rounded-3xl overflow-hidden flex-1 min-h-0">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/55 bg-white/40 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold text-[#007AFF] bg-[#007AFF]/10 rounded border border-[#007AFF]/20">
                        {timelineBlocks.length} BLOCKS
                    </span>
                </div>
                
                <button 
                    onClick={handleAddClick}
                    className="flex items-center gap-1 text-[#007AFF] hover:bg-[#007AFF]/10 px-2 py-1 rounded-lg text-xs font-semibold transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" /> Add
                </button>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {timelineBlocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <Clock className="w-8 h-8 text-neutral-400 mb-3" />
                        <span className="text-xs font-semibold text-slate-800">Timeline is empty</span>
                    </div>
                ) : (
                    timelineBlocks.map((block, index) => {
                        const isSelected = selectedBlockId === block.id;
                        return (
                            <div
                                key={block.id}
                                onClick={() => {
                                    setSelectedBlock(block.id);
                                    setEditingCaptionId(block.id);
                                    const seekTo = block.start + 0.001;
                                    setCurrentTime(seekTo);
                                    const videoElement = document.querySelector('video');
                                    if (videoElement) videoElement.currentTime = seekTo;
                                }}
                                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border group ${
                                    isSelected 
                                        ? 'bg-white/85 border-[#007AFF]/50 shadow-sm' 
                                        : 'bg-white/30 border-transparent hover:bg-white/55 hover:border-white/65'
                                }`}
                            >
                                <span className={`text-[10px] font-mono mt-0.5 w-4 font-semibold ${isSelected ? 'text-[#007AFF]' : 'text-neutral-500'}`}>
                                    {(index + 1).toString().padStart(2, '0')}
                                </span>
                                
                                <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                                    {block.text.split('\n').map((lineText, i) => (
                                        <span key={i} className={`text-sm leading-snug truncate ${isSelected ? 'text-slate-900 font-semibold' : 'text-neutral-600 font-medium group-hover:text-slate-800'}`}>
                                            {lineText}
                                        </span>
                                    ))}
                                </div>
                                
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingCaptionId(block.id);
                                        setSelectedBlock(block.id);
                                    }}
                                    className={`p-1.5 rounded-lg transition-all shrink-0 ${
                                        isSelected 
                                            ? 'bg-[#007AFF] text-white hover:bg-[#0066d6] shadow-sm' 
                                            : 'text-neutral-500 hover:text-slate-900 hover:bg-white/80 opacity-0 group-hover:opacity-100'
                                    }`}
                                    title="Edit Caption Details"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}