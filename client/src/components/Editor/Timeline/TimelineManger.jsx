import React, { useRef, useEffect } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';

// 120 px = 1 second  → a 15 s video = 1 800 px, comfortable block widths
const PX_PER_SEC = 160;

export default function TimelineManager() {
    const scrollRef    = useRef(null); // outer scrollable div
    const containerRef = useRef(null); // inner fixed-width content div

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
        saveHistory,
    } = useEditorStore();

    const safeDuration = duration > 0 ? duration : 60;
    const totalWidth   = Math.max(800, Math.ceil(safeDuration * PX_PER_SEC) + 80); // +80 px right padding

    // ── Auto-scroll playhead into view while playing ──────────────────────
    useEffect(() => {
        const el = scrollRef.current;
        if (!el || !isPlaying) return;
        const head       = currentTime * PX_PER_SEC;
        const visible    = el.clientWidth;
        const scrollLeft = el.scrollLeft;
        if (head > scrollLeft + visible * 0.75) {
            el.scrollLeft = head - visible * 0.25;
        } else if (head < scrollLeft + 4) {
            el.scrollLeft = Math.max(0, head - visible * 0.1);
        }
    }, [currentTime, isPlaying]);

    // ── Keyboard shortcuts ─────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId) {
                deleteBlock?.(selectedBlockId);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo?.();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selectedBlockId, deleteBlock, undo]);

    // ── Scrubbing (click/drag on empty ruler / track area) ─────────────────
    const handleScrubStart = (e) => {
        if (!containerRef.current) return;
        if (isPlaying) setPlaying(false);
        setSelectedBlock(null);

        const seek = (clientX) => {
            const rect = containerRef.current.getBoundingClientRect();
            const x    = Math.max(0, Math.min(clientX - rect.left, totalWidth));
            const t    = (x / totalWidth) * safeDuration;
            setCurrentTime(t);
            const vid = document.querySelector('video');
            if (vid) vid.currentTime = t;
        };

        seek(e.clientX);

        const onMove = (mv) => seek(mv.clientX);
        const onUp   = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup',   onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup',   onUp);
    };

    // ── Block move / resize ────────────────────────────────────────────────
    const handlePointerDown = (e, block, actionType) => {
        e.stopPropagation();
        setSelectedBlock(block.id);

        if (actionType === 'move') {
            const seekTo = block.start + 0.001;
            setCurrentTime(seekTo);
            const vid = document.querySelector('video');
            if (vid) vid.currentTime = seekTo;
        }

        saveHistory?.();

        const startX      = e.clientX;
        const initStart   = block.start;
        const initEnd     = block.end;
        const MIN_DUR     = 0.3;

        const onMove = (mv) => {
            const dt = (mv.clientX - startX) / PX_PER_SEC;
            let ns = initStart, ne = initEnd;

            if (actionType === 'move') {
                const dur = initEnd - initStart;
                ns = Math.max(0, Math.min(initStart + dt, safeDuration - dur));
                ne = ns + dur;
            } else if (actionType === 'left') {
                ns = Math.max(0, Math.min(initStart + dt, initEnd - MIN_DUR));
            } else if (actionType === 'right') {
                ne = Math.max(initStart + MIN_DUR, Math.min(initEnd + dt, safeDuration));
            }
            updateBlockTiming(block.id, ns, ne);
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup',   onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup',   onUp);
    };

    // ── Ruler ticks: every 1 s for short videos, every 2 s for long ones ──
    const tickSec  = safeDuration <= 90 ? 1 : 2;
    const tickCount = Math.ceil(safeDuration / tickSec) + 1;
    const fmt = (s) =>
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="flex flex-col w-full h-full bg-white/55 backdrop-blur-xl border border-white/75 shadow-[0_8px_32px_rgba(180,100,140,0.08)] rounded-3xl select-none overflow-hidden shrink-0">

            {/* ── Horizontally-scrollable area ── */}
            <div
                ref={scrollRef}
                className="relative flex-grow w-full overflow-x-auto overflow-y-hidden"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.18) transparent' }}
            >
                {/* ── Inner content at fixed pixel width ── */}
                <div
                    ref={containerRef}
                    style={{ width: totalWidth, minWidth: '100%' }}
                    className="relative h-full"
                    onPointerDown={handleScrubStart}
                >

                    {/* ── Ruler ── */}
                    <div className="absolute top-0 left-0 h-8 bg-white/50 border-b border-white/60 z-20 pointer-events-none"
                         style={{ width: totalWidth }}>
                        {Array.from({ length: tickCount }, (_, i) => {
                            const t = i * tickSec;
                            if (t > safeDuration + 0.01) return null;
                            const isMajor = t % 5 === 0;
                            return (
                                <div
                                    key={t}
                                    className="absolute top-0 flex flex-col items-start"
                                    style={{ left: t * PX_PER_SEC }}
                                >
                                    {/* tick line */}
                                    <div className={`w-px ${isMajor ? 'h-3 bg-slate-400' : 'h-2 bg-slate-300'}`} />
                                    {/* label — show every major tick or every 5th minor tick */}
                                    {(isMajor || tickSec >= 1) && (
                                        <span className="ml-1 mt-0.5 text-[9px] font-semibold text-slate-500 whitespace-nowrap">
                                            {fmt(t)}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Waveform mock ── */}
                    <div className="absolute bottom-1 h-14 opacity-25 pointer-events-none"
                         style={{ left: 0, width: totalWidth }}>
                        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjQwIj48cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM2I4MmY2IiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')] bg-repeat-x bg-center" />
                    </div>

                    {/* ── Track lane shading ── */}
                    <div className="absolute pointer-events-none bg-white/20 border-b border-white/40"
                         style={{ top: 32, left: 0, right: 0, height: 44 }} />
                    <div className="absolute pointer-events-none bg-white/10 border-b border-white/30"
                         style={{ top: 76, left: 0, right: 0, height: 44 }} />

                    {/* ── Caption blocks ── */}
                    {timelineBlocks.map((block, index) => {
                        const isSelected = selectedBlockId === block.id;
                        const leftPx     = block.start * PX_PER_SEC;
                        const widthPx    = Math.max(28, (block.end - block.start) * PX_PER_SEC);
                        const topPx      = index % 2 === 0 ? 35 : 79;

                        return (
                            <div
                                key={block.id}
                                className={`absolute h-9 rounded-lg flex items-center px-2 overflow-hidden pointer-events-auto border cursor-grab active:cursor-grabbing transition-colors ${
                                    isSelected
                                        ? 'bg-[#007AFF] border-[#0051A8] shadow-[0_4px_14px_rgba(0,122,255,0.4)] z-20'
                                        : 'bg-gradient-to-b from-[#FFE4B5] to-[#FFCB85] border-[#E89A33] z-10 hover:from-[#FFD89A] hover:to-[#FFB85F] shadow-sm'
                                }`}
                                style={{ left: leftPx, width: widthPx, top: topPx }}
                                onPointerDown={(e) => handlePointerDown(e, block, 'move')}
                            >
                                <span className={`text-[9px] font-bold truncate pointer-events-none ${isSelected ? 'text-white' : 'text-[#7d4f10]'}`}>
                                    {block.text.replace('\n', ' ')}
                                </span>

                                {/* Resize handles */}
                                <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-l-lg"
                                     onPointerDown={(e) => handlePointerDown(e, block, 'left')} />
                                <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-r-lg"
                                     onPointerDown={(e) => handlePointerDown(e, block, 'right')} />
                            </div>
                        );
                    })}

                    {/* ── Playhead ── */}
                    <div
                        className="absolute top-0 bottom-0 z-50 cursor-ew-resize pointer-events-auto"
                        style={{ left: currentTime * PX_PER_SEC, width: 2, background: '#007AFF' }}
                        onPointerDown={handleScrubStart}
                    >
                        {/* top flag */}
                        <div className="absolute -top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                            <div className="w-3 h-3 rotate-45 bg-[#007AFF] rounded-[2px] shadow-sm" />
                        </div>
                        {/* bottom diamond */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#007AFF] rounded-[2px] shadow-sm pointer-events-none" />
                    </div>

                </div>
            </div>
        </div>
    );
}
