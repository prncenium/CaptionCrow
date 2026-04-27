import React, {useEffect} from 'react';
import { useEditorStore } from '../../store/useEditorStore';

export default function CaptionList() {
    const { timelineBlocks, selectedBlockId, setSelectedBlock, setCurrentTime,
        editingCaptionId, setEditingCaptionId, updateBlockStyleOverride,activeStyle,
        updateBlockText, updateBlockPosition, transcription, 
        isProcessing,  
        bakeTimeline,
        addManualCaption, 
        currentTime
     } = useEditorStore();

     // NEW: Auto-Bake Listener
     const handleAddClick = () => {
        addManualCaption(currentTime);
    };
    useEffect(() => {
        if (transcription && transcription.length > 0 && timelineBlocks.length === 0) {
            bakeTimeline();
        }
    }, [transcription, timelineBlocks.length, bakeTimeline]);

     // NEW: If a user clicked "Edit", show the Individual Tools on the left side!
    if (editingCaptionId) {
        const block = timelineBlocks.find(b => b.id === editingCaptionId);
        if (!block) return null;

        // Split the block text into L1 and L2
        const lines = block.text.split('\n');

        return (
            <div className="flex flex-col h-full bg-[#121212] border border-neutral-800 rounded-xl overflow-hidden flex-1 p-4 overflow-y-auto custom-scrollbar">
                <button 
                    onClick={() => setEditingCaptionId(null)}
                    className="text-emerald-400 text-sm font-bold flex items-center gap-2 mb-6 hover:text-emerald-300 w-fit shrink-0"
                >
                    ← Back to Captions
                </button>
                
                <h3 className="text-white font-bold mb-4 shrink-0">Editing Individual Caption:</h3>

                <div className="space-y-6">
                    {/* Map through the lines to create independent editors for L1 and L2 */}
                    {lines.map((lineText, i) => (
                        <div key={i} className="p-4 bg-[#1a1a1a] rounded-lg border border-neutral-800">
                            
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-mono text-emerald-400">
                                    L{i + 1}
                                </span>
                                <span className="text-neutral-300 text-sm italic truncate">
                                    "{lineText}"
                                </span>
                            </div>

                            <div className="space-y-4">

                                {/* 1. Edit Actual Text */}
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Edit Text</label>
                                    <input 
                                        type="text" 
                                        value={lineText}
                                        onChange={(e) => {
                                            // This rebuilds the string properly whether you edit L1 or L2
                                            const newLines = [...lines];
                                            newLines[i] = e.target.value;
                                            updateBlockText(block.id, newLines.join('\n'));
                                        }}
                                        className="w-full h-10 px-3 rounded bg-black border border-neutral-700 text-white text-sm focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                {/* 2. Font Family */}
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Font Family</label>
                                    <select 
                                        value={block.styleOverrides?.[i]?.fontFamily || activeStyle.fontFamily}
                                        onChange={(e) => {
                                            updateBlockStyleOverride(block.id, { 
                                                [i]: { ...(block.styleOverrides?.[i] || {}), fontFamily: e.target.value } 
                                            });
                                        }}
                                        className="w-full h-10 px-3 rounded bg-black border border-neutral-700 text-white text-sm focus:border-emerald-500 outline-none"
                                    >
                                        <option value="Apple Garamond">Apple Garamond</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Helvetica">Helvetica</option>
                                        <option value="Blacksword">Blacksword</option>
                                        <option value="Impact">Impact</option>
                                        <option value="Coolvetica">Coolvetica</option>
                                        <option value="Open Sans">Open Sans</option>
                                    </select>
                                </div>

                                {/* 5. Animation Type */}
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Animation</label>
                                    <select 
                                        value={block.styleOverrides?.[i]?.animationStyle || activeStyle.animationStyle}
                                        onChange={(e) => {
                                            updateBlockStyleOverride(block.id, { 
                                                [i]: { ...(block.styleOverrides?.[i] || {}), animationStyle: e.target.value } 
                                            });
                                        }}
                                        className="w-full h-10 px-3 rounded bg-black border border-neutral-700 text-white text-sm focus:border-emerald-500 outline-none"
                                    >
                                        <option value="none">None (Instant Cut)</option>
                                        <option value="fadeIn">Fade In</option>
                                        <option value="popIn">Pop In (Zoom)</option>
                                        <option value="slideUp">Slide Up</option>
                                        <option value="slideDown">Slide Down</option>
                                        <option value="slideRight">Slide from Left</option>
                                        <option value="slideLeft">Slide from Right</option>
                                    </select>
                                </div> 

                                {/* 6. Word-by-Word Stagger Toggle */}
                                <div className="flex items-center justify-between p-3 mt-4 bg-black border rounded-lg border-neutral-800">
                                    <div>
                                        <label className="block text-xs font-bold tracking-wider uppercase text-neutral-400">Word Stagger</label>
                                        <span className="text-[10px] text-neutral-600 block mt-0.5">Cascades the animation word-by-word</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // 1. Check if the block has an override. If not, fallback to the global activeStyle
                                            const currentStagger = block.styleOverrides?.[i]?.wordStagger ?? activeStyle.wordStagger;
                                            
                                            // 2. Flip the boolean and save it to the store
                                            updateBlockStyleOverride(block.id, { 
                                                [i]: { 
                                                    ...(block.styleOverrides?.[i] || {}), 
                                                    wordStagger: !currentStagger 
                                                } 
                                            });
                                        }}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                            (block.styleOverrides?.[i]?.wordStagger ?? activeStyle.wordStagger) 
                                                ? 'bg-emerald-500' 
                                                : 'bg-neutral-700'
                                        }`}
                                    >
                                        <span 
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
                                                (block.styleOverrides?.[i]?.wordStagger ?? activeStyle.wordStagger) 
                                                    ? 'translate-x-6' 
                                                    : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* 4. Precise Position (X / Y) */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Pos X</label>
                                        <input 
                                            type="number" 
                                            value={block.customLinePositions?.[i]?.x !== undefined ? Math.round(block.customLinePositions[i].x) : ''}
                                            placeholder="Auto"
                                            onChange={(e) => {
                                                const currentY = block.customLinePositions?.[i]?.y || 0;
                                                const newX = e.target.value ? parseFloat(e.target.value) : 0;
                                                updateBlockPosition(block.id, i, newX, currentY);
                                            }}
                                            className="w-full h-10 px-3 rounded bg-black border border-neutral-700 text-white text-sm focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Pos Y</label>
                                        <input 
                                            type="number" 
                                            value={block.customLinePositions?.[i]?.y !== undefined ? Math.round(block.customLinePositions[i].y) : ''}
                                            placeholder="Auto"
                                            onChange={(e) => {
                                                const currentX = block.customLinePositions?.[i]?.x || 0;
                                                const newY = e.target.value ? parseFloat(e.target.value) : 0;
                                                updateBlockPosition(block.id, i, currentX, newY);
                                            }}
                                            className="w-full h-10 px-3 rounded bg-black border border-neutral-700 text-white text-sm focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                                
                                {/* Line-Specific Color Picker */}
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Line {i + 1} Color</label>
                                    <input 
                                        type="color" 
                                        value={block.styleOverrides?.[i]?.fillColor || activeStyle.fillColor}
                                        onChange={(e) => {
                                            // Safely updates ONLY this specific line index within the block
                                            updateBlockStyleOverride(block.id, { 
                                                [i]: { 
                                                    ...(block.styleOverrides?.[i] || {}), 
                                                    fillColor: e.target.value 
                                                } 
                                            });
                                        }}
                                        className="w-full h-10 rounded cursor-pointer bg-transparent border border-neutral-700"
                                    />
                                </div>
                                
                                {/* Line-Specific Font Size Slider */}
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Line {i + 1} Size</label>
                                    <input 
                                        type="range" min="20" max="120"
                                        value={block.styleOverrides?.[i]?.fontSize || activeStyle.fontSize}
                                        onChange={(e) => {
                                            // Safely updates ONLY this specific line index within the block
                                            updateBlockStyleOverride(block.id, { 
                                                [i]: { 
                                                    ...(block.styleOverrides?.[i] || {}), 
                                                    fontSize: parseInt(e.target.value) 
                                                } 
                                            });
                                        }}
                                        className="w-full accent-emerald-500"
                                    />
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // NEW: The Loading State UI
    if (isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center border rounded-xl bg-[#121212] border-neutral-800">
                {/* Modern Tailwind CSS Spinner */}
                <div className="w-10 h-10 mb-5 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <h3 className="text-sm font-bold tracking-wider text-emerald-400 animate-pulse uppercase">
                    Generating Subtitles...
                </h3>
                <p className="mt-3 text-xs text-neutral-500 leading-relaxed">
                    Our AI is fetching and syncing your captions to the timeline. <br/> Please wait a moment.
                </p>
            </div>
        );
    }

    return (
        
        <div className="flex flex-col h-full bg-[#121212] border border-neutral-800 rounded-xl overflow-hidden flex-1 min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#1a1a1a]">
                <h2 className="text-lg font-bold text-white">Captions</h2>
                
                {/* Wrapper to hold the badge and the button together */}
                <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 rounded">
                        {timelineBlocks.length} Blocks
                    </span>
                    
                    {/* NEW: The Add Block Button */}
                    <button 
                        onClick={handleAddClick}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded transition-colors"
                    >
                        + Add Block
                    </button>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {timelineBlocks.length === 0 ? (
                    <div className="flex items-center justify-center h-full p-4 text-sm text-neutral-500 text-center">
                        No captions yet. Click "Generate Timeline Blocks" in the controls.
                    </div>
                ) : (
                    timelineBlocks.map((block, index) => {
                        const isSelected = selectedBlockId === block.id;
                        return (
                            <div
                                key={block.id}
                                onClick={() => {
                                    setSelectedBlock(block.id);
                                    // Jump the video to this caption's start time!
                                    setCurrentTime(block.start);
                                    const videoElement = document.querySelector('video');
                                    if (videoElement) videoElement.currentTime = block.start;
                                }}
                                className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all border ${
                                    isSelected 
                                        ? 'bg-emerald-500/10 border-emerald-500/50' 
                                        : 'bg-transparent border-transparent hover:bg-neutral-800 hover:border-neutral-700'
                                }`}
                            >
                                <span className="text-xs font-bold text-neutral-600 w-4">{index + 1}</span>
                                <div className="flex flex-col gap-1.5 flex-1 overflow-hidden mt-1">
    {block.text.split('\n').map((lineText, i) => (
        <div key={i} className="flex items-center gap-2">
            <span className={`text-sm truncate ${isSelected ? 'text-emerald-400 font-semibold' : 'text-neutral-300'}`}>
                                {lineText}
                            </span>
                        </div>
                    ))}
                </div>
                
                {/* NEW: The Edit Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Don't trigger the row click
                        setEditingCaptionId(block.id);
                        setSelectedBlock(block.id);
                    }}
                    className="ml-auto px-3 py-1 bg-[#1a1a1a] hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded border border-neutral-800 hover:border-emerald-500/50 transition-all shrink-0"
                >
                    EDIT
                </button>

            </div>
        );
    })
                )}
            </div>
        </div>
    );
}