import React, { useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export default function TimelineSlider() {
    const { 
        currentTime, 
        duration, 
        isPlaying, 
        setPlaying, 
        setCurrentTime 
    } = useEditorStore();
    
    const sliderRef = useRef(null);

    // Utility: Format raw seconds into MM:SS.ms (e.g., 01:23.4)
    const formatTime = (timeInSeconds) => {
        if (!timeInSeconds || isNaN(timeInSeconds)) return "00:00.0";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const milliseconds = Math.floor((timeInSeconds % 1) * 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds}`;
    };

    // Handle user dragging the timeline slider manually
    const handleScrub = (e) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        
        // Find the actual video DOM element and force its time to update
        // This keeps the HTML5 video perfectly synced with our custom React slider
        const videoElement = document.querySelector('video');
        if (videoElement) {
            videoElement.currentTime = newTime;
        }
    };

    const togglePlay = () => {
        setPlaying(!isPlaying);
    };

    return (
        <div className="flex items-center w-full gap-4 p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm flex-shrink-0">
            {/* Play/Pause Button */}
            <button 
                onClick={togglePlay}
                className="flex items-center justify-center w-12 h-12 transition-colors rounded-full bg-emerald-600 hover:bg-emerald-500 text-white focus:outline-none shadow-lg shadow-emerald-900/50"
            >
                {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
            </button>

            {/* Current Time Display */}
            <span className="text-sm font-mono font-medium text-emerald-400 min-w-[70px] text-right">
                {formatTime(currentTime)}
            </span>

            {/* The Scrubber Bar */}
            <div className="relative flex-1 flex items-center h-full">
                <input
                    ref={sliderRef}
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.01}
                    value={currentTime}
                    onChange={handleScrub}
                    className="absolute z-10 w-full h-2 opacity-0 cursor-pointer peer"
                />
                {/* Custom styled track behind the invisible native input */}
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-75 ease-linear"
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                </div>
            </div>

            {/* Total Duration Display */}
            <span className="text-sm font-mono font-medium text-neutral-500 min-w-[70px]">
                {formatTime(duration)}
            </span>
        </div>
    );
}