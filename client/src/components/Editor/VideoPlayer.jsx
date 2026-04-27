import React, { useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import CanvasOverlay from './CanvasOverlay';

export default function VideoPlayer() {
    const videoRef = useRef(null);
    const animationRef = useRef(null);
    
    // Pull the necessary state and setters from our Zustand store
    const { videoUrl, isPlaying, setDuration, setCurrentTime, setPlaying } = useEditorStore();

    // 🔴 THE FIX: Safe Promise Handling for Play/Pause
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            // .play() returns a Promise. We capture it to prevent AbortErrors.
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    if (error.name === 'AbortError') {
                        // Safe Abort: The user scrubbed the timeline before play started.
                        // We safely swallow this error so the app doesn't crash.
                        console.log("Safe Abort: Play interrupted by user scrub/pause.");
                    } else if (error.name === 'NotAllowedError') {
                        // Browser blocked autoplay. Sync our Zustand state back to false!
                        setPlaying(false);
                    } else {
                        console.error("Playback error:", error);
                    }
                });
            }
        } else {
            // It is always safe to call .pause() synchronously
            video.pause();
        }
    }, [isPlaying, setPlaying]);

    // The high-performance engine: 60 FPS loop to track exact video time
    const trackTime = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
        animationRef.current = requestAnimationFrame(trackTime);
    };

    // Start/Stop the engine based on playback state
    useEffect(() => {
        if (isPlaying) {
            animationRef.current = requestAnimationFrame(trackTime);
        } else if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, setCurrentTime]);

    // Once the video loads, tell the global store how long it is
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    // If no video is uploaded, don't render the player
    if (!videoUrl) return null;

    return (
        <div className="relative flex items-center justify-center w-full h-full bg-black isolate">
            {/* The Raw Video Element */}
            <video
                ref={videoRef}
                src={videoUrl}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setPlaying(false)}
                className="object-contain w-full h-full z-0"
                playsInline
            />

            {/* The Transparent Drawing Layer Stacked Exactly on Top */}
            <div className="absolute inset-0 z-10 pointer-events-auto">
                <CanvasOverlay />
            </div>
        </div>
    );
}