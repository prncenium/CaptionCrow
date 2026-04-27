import React, { useRef,useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';

export default function Timeline() {
    const containerRef = useRef(null);
    const { 
        duration, 
        currentTime, 
        timelineBlocks, 
        updateBlockTiming, 
        selectedBlockId, 
        setSelectedBlock,
        setCurrentTime,
        isPlaying,
        setPlaying,
        deleteBlock,
        undo,
        saveHistory
    } = useEditorStore();

    const safeDuration = duration > 0 ? duration : 60;

    // Helper: Formats seconds into 00:00.0
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        const ms = Math.floor((seconds % 1) * 10).toString();
        return `${m}:${s}.${ms}`;
    };

    // Toggle Play/Pause and sync the physical video element
    const togglePlayback = () => {
        const videoElement = document.querySelector('video');
        if (isPlaying) {
            setPlaying(false);
            if (videoElement) videoElement.pause();
        } else {
            setPlaying(true);
            if (videoElement) videoElement.play();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore keystrokes if the user is typing inside a text input or textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Handle Delete / Backspace
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId) {
                if (deleteBlock) deleteBlock(selectedBlockId);
            }

            // Handle Ctrl + Z (or Cmd + Z on Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault(); // Stop the browser's default undo behavior
                if (undo) undo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedBlockId, deleteBlock, undo]);

    const handleScrubStart = (e) => {
        if (!containerRef.current) return;
        
        if (isPlaying) setPlaying(false);
        setSelectedBlock(null);

        const updateTimeFromMouse = (clientX) => {
            const rect = containerRef.current.getBoundingClientRect();
            let clickX = clientX - rect.left;
            clickX = Math.max(0, Math.min(clickX, rect.width));
            
            const newTime = (clickX / rect.width) * safeDuration;
            setCurrentTime(newTime);
            
            const videoElement = document.querySelector('video');
            if (videoElement) {
                videoElement.currentTime = newTime;
            }
        };

        updateTimeFromMouse(e.clientX);

        const onPointerMove = (moveEvent) => {
            updateTimeFromMouse(moveEvent.clientX);
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    const handlePointerDown = (e, block, actionType) => {
        e.stopPropagation(); 
        setSelectedBlock(block.id);

        if (saveHistory) saveHistory();

        if (!containerRef.current) return;
        const timelineWidth = containerRef.current.offsetWidth;
        const startX = e.clientX;
        const initialStart = block.start;
        const initialEnd = block.end;

        const onPointerMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaTime = (deltaX / timelineWidth) * safeDuration;

            let newStart = initialStart;
            let newEnd = initialEnd;
            const MIN_DURATION = 0.5;

            if (actionType === 'move') {
                const blockDuration = initialEnd - initialStart;
                newStart = Math.max(0, Math.min(initialStart + deltaTime, safeDuration - blockDuration));
                newEnd = newStart + blockDuration;
            } else if (actionType === 'left') {
                newStart = Math.max(0, Math.min(initialStart + deltaTime, initialEnd - MIN_DURATION));
            } else if (actionType === 'right') {
                newEnd = Math.max(initialStart + MIN_DURATION, Math.min(initialEnd + deltaTime, safeDuration));
            }

            updateBlockTiming(block.id, newStart, newEnd);
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    return (
        <div className="flex flex-col w-full h-64 bg-[#121212] border-t border-neutral-800 select-none">
            
            {/* Transport Bar: Play button and Timecode */}
            <div className="flex items-center gap-4 px-4 py-2 bg-[#1a1a1a] border-b border-neutral-800">
                <button 
                    onClick={togglePlayback}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-90"
                >
                    {isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                    ) : (
                        <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                </button>
                <div className="text-sm font-mono text-emerald-400 bg-black px-3 py-1 rounded border border-neutral-800 shadow-inner">
                    {formatTime(currentTime)} <span className="text-neutral-600">/ {formatTime(safeDuration)}</span>
                </div>
            </div>

            {/* Top Ruler */}
            <div className="flex items-center w-full h-8 px-4 bg-[#0a0a0a] border-b border-neutral-800 text-xs text-neutral-500 font-mono relative overflow-hidden flex-shrink-0">
                {Array.from({ length: Math.ceil(safeDuration / 5) }).map((_, i) => (
                    <div key={i} className="absolute border-l border-neutral-700 h-2 top-3" style={{ left: `${(i * 5 / safeDuration) * 100}%` }}>
                        <span className="ml-1 -mt-3 absolute text-[10px]">00:{(i * 5).toString().padStart(2, '0')}</span>
                    </div>
                ))}
            </div>

            {/* Main Interactive Timeline Area */}
            <div 
                ref={containerRef}
                className="relative flex-grow w-full overflow-hidden cursor-text bg-[#0f0f0f]"
                onPointerDown={handleScrubStart}
            >
                {/* Audio Waveform Mock */}
                <div className="absolute w-full h-12 bottom-4 opacity-30 pointer-events-none flex items-end overflow-hidden border-t border-b border-neutral-800/50">
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjQwIj48cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTRiOGE2IiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')] bg-repeat-x bg-center"></div>
                </div>

                {/* TRACK LANES Visual markers */}
                <div className="absolute top-2 w-full h-10 border-b border-neutral-800/30 bg-white/[0.01]"></div>
                <div className="absolute top-14 w-full h-10 border-b border-neutral-800/30 bg-white/[0.01]"></div>

                {/* Caption Blocks */}
                <div className="absolute top-0 w-full h-full pointer-events-none">
                    {timelineBlocks.map((block, index) => {
                        const isSelected = selectedBlockId === block.id;
                        const leftPercent = (block.start / safeDuration) * 100;
                        const widthPercent = ((block.end - block.start) / safeDuration) * 100;
                        
                        // Alternating logic to put captions on different tracks
                        const trackYOffset = index % 2 === 0 ? '8px' : '56px';

                        return (
                            <div 
                                key={block.id}
                                className={`absolute h-9 rounded-md flex items-center justify-center text-[10px] font-bold overflow-hidden transition-colors pointer-events-auto border cursor-grab active:cursor-grabbing ${isSelected ? 'bg-emerald-500 border-emerald-300 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20' : 'bg-[#C1A87D] border-[#d4b98c] text-black z-10 hover:bg-[#d4b98c] hover:brightness-110'}`}
                                style={{
                                    left: `${leftPercent}%`,
                                    width: `${widthPercent}%`,
                                    top: trackYOffset,
                                    minWidth: '24px' 
                                }}
                                onPointerDown={(e) => handlePointerDown(e, block, 'move')}
                            >
                                <span className="truncate px-2 pointer-events-none drop-shadow-sm uppercase">
                                    {block.text.replace('\n', ' ')}
                                </span>

                                <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/20" onPointerDown={(e) => handlePointerDown(e, block, 'left')} />
                                <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/20" onPointerDown={(e) => handlePointerDown(e, block, 'right')} />
                            </div>
                        );
                    })}
                </div>

                {/* Playhead */}
                <div 
                    className="absolute top-0 bottom-0 z-50 w-0.5 bg-emerald-500 cursor-ew-resize pointer-events-auto shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    style={{ left: `${(currentTime / safeDuration) * 100}%` }}
                    onPointerDown={handleScrubStart} 
                >
                    <div className="absolute -top-0 -left-2 w-4 h-4 bg-emerald-500 rounded-b-sm" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
                </div>
            </div>
        </div>
    );
}