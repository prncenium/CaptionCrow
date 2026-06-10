import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEditorStore } from '../../../store/useEditorStore';
import CanvasOverlay from './CanvasOverlay';

export default function VideoPlayer() {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const animationRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true); 
    
    const { videoUrl, isPlaying, duration, setDuration, setCurrentTime, setPlaying, currentTime } = useEditorStore();

    // 1. FORCE LOAD & RESET
    useEffect(() => {
        if (videoRef.current && videoUrl) {
            videoRef.current.load();
            setPlaying(false);
        }
    }, [videoUrl, setPlaying]);

    // 2. HARDWARE SYNC (Bypasses State for Play/Pause)
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.play().catch(() => {
                video.muted = true;
                setIsMuted(true);
                video.play();
            });
        } else {
            video.pause();
        }
    }, [isPlaying]);

    // 3. PERFORMANCE LOOP (60FPS)
    const trackTime = () => {
        if (videoRef.current && !videoRef.current.paused) {
            setCurrentTime(videoRef.current.currentTime);
            animationRef.current = requestAnimationFrame(trackTime);
        }
    };

    useEffect(() => {
        if (isPlaying) {
            animationRef.current = requestAnimationFrame(trackTime);
        } else {
            cancelAnimationFrame(animationRef.current);
        }
        return () => cancelAnimationFrame(animationRef.current);
    }, [isPlaying, setCurrentTime]);

    // 4. THE ACTION HANDLERS
    const handleTogglePlay = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setPlaying(!isPlaying);
    };

    const handleMute = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (videoRef.current) {
            const newState = !videoRef.current.muted;
            videoRef.current.muted = newState;
            setIsMuted(newState);
        }
    };

    const handleSkip = (seconds) => {
        if (videoRef.current) {
            let newTime = videoRef.current.currentTime + seconds;
            newTime = Math.max(0, Math.min(newTime, duration));
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleFullscreen = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!containerRef.current) return;
        
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // Helper to format time as 00:00
    const formatTime = (seconds) => {
        const m = Math.floor((seconds || 0) / 60);
        const s = Math.floor((seconds || 0) % 60);
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    if (!videoUrl) return null;

    return (
        /* 🚨 THE LIQUID GLASS PANEL CONTAINER 🚨 */
        <div 
            ref={containerRef}
            className="flex-1 flex flex-col gap-3 rounded-3xl bg-white/55 backdrop-blur-xl border border-white/75 shadow-[0_8px_32px_rgba(180,100,140,0.08)] p-3 min-w-0"
        >
            {/* THE WORKSPACE BACKGROUND */}
            <div className="relative flex-1 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group bg-black/5 border border-black/5 p-2">
                
                {/* 🚨 THE NEW EXPORT BUTTON (Premium Apple Liquid Glass UI) 🚨 */}
                <Link 
                    to="/export"
                    className="absolute top-5 right-5 z-20 flex items-center gap-2 px-5 py-2.5 bg-amber-500/80 backdrop-blur-md border border-amber-400/70 rounded-full shadow-[0_8px_32px_rgba(245,158,11,0.25)] text-[12px] font-bold text-white tracking-[0.15em] uppercase transition-all hover:scale-105 active:scale-95 hover:brightness-110"
                >
                    <span className="w-2 h-2 rounded-full bg-amber-100 animate-pulse" />
                    Export Video
                </Link>

                {/* 🚨 STRICT 9:16 (1080x1920) MOBILE CANVAS WRAPPER 🚨 */}
                <div className="relative h-full aspect-[9/16] bg-neutral-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/20 flex-shrink-0">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
                        onEnded={() => setPlaying(false)}
                        /* object-cover ensures the video fills the 9:16 frame nicely */
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        playsInline
                        muted={isMuted}
                    />

                    {/* THE CAPTIONS LAYER */}
                    <div className="absolute inset-0 z-10">
                        <CanvasOverlay />
                    </div>
                </div>

            </div>

            {/* THE CONTROL DOCK (Extracted below the video like Apple NLEs) */}
            <div className="flex items-center justify-center gap-2.5 px-3 py-1 flex-shrink-0">
                
                {/* Skip Back */}
                <button 
                    onClick={() => handleSkip(-5)}
                    className="w-9 h-9 rounded-full bg-white/55 border border-white/75 flex items-center justify-center hover:bg-white/75 transition-colors text-slate-700 shadow-sm"
                >
                    <SkipBack size={14} strokeWidth={2} fill="currentColor" />
                </button>

                {/* Play / Pause (Apple Blue Accent) */}
                <button 
                    onClick={handleTogglePlay} 
                    className="w-11 h-11 rounded-full bg-[#007AFF] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(0,122,255,0.45)] hover:bg-[#0066d6] transition-colors"
                >
                    {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
                </button>

                {/* Skip Forward */}
                <button 
                    onClick={() => handleSkip(5)}
                    className="w-9 h-9 rounded-full bg-white/55 border border-white/75 flex items-center justify-center hover:bg-white/75 transition-colors text-slate-700 shadow-sm"
                >
                    <SkipForward size={14} strokeWidth={2} fill="currentColor" />
                </button>

                {/* Time Display Pill */}
                <div className="ml-3 text-[12px] font-mono tabular-nums tracking-tight bg-white/55 border border-white/75 rounded-full px-3 py-1 text-slate-800 shadow-sm">
                    <span className="font-bold">{formatTime(currentTime)}</span>
                    <span className="text-neutral-500 font-medium"> / {formatTime(duration)}</span>
                </div>

                {/* Volume Toggle Pill */}
                <button 
                    onClick={handleMute}
                    className="ml-2 flex items-center gap-1.5 bg-white/55 border border-white/75 rounded-full px-2.5 py-1 hover:bg-white/75 transition-colors shadow-sm"
                >
                    {isMuted ? <VolumeX size={13} strokeWidth={2} className="text-red-500" /> : <Volume2 size={13} strokeWidth={2} className="text-slate-600" />}
                    <div className="w-12 h-1 bg-white/80 rounded-full overflow-hidden border border-white/40">
                        <div className={`h-full rounded-full transition-all ${isMuted ? 'bg-red-400 w-0' : 'bg-slate-500 w-[65%]'}`} />
                    </div>
                </button>

                {/* Fullscreen Button */}
                <button 
                    onClick={handleFullscreen} 
                    className="ml-2 w-9 h-9 rounded-full bg-white/55 border border-white/75 flex items-center justify-center hover:bg-white/75 transition-colors text-slate-700 shadow-sm"
                >
                    <Maximize size={14} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}