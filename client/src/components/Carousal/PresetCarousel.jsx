import React, { useState, useCallback, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

const COMING_SOON_IMG = 'https://res.cloudinary.com/dbtfi1rbi/image/upload/v1781002253/Screenshot_2026-06-09_161355_xph2fq.png';

const SLOT = {
  farLeft:  { x: '-92%', scale: 0.50, opacity: 0.14, blur: 6,   z: 10 },
  left:     { x: '-50%', scale: 0.76, opacity: 0.58, blur: 1.5, z: 20 },
  center:   { x:   '0%', scale: 1.00, opacity: 1.00, blur: 0,   z: 30 },
  right:    { x:  '50%', scale: 0.76, opacity: 0.58, blur: 1.5, z: 20 },
  farRight: { x:  '92%', scale: 0.50, opacity: 0.14, blur: 6,   z: 10 },
};

const SPRING          = { type: 'spring', stiffness: 300, damping: 32, mass: 0.9 };
const AUTO_ADVANCE_MS = 5000;

// Entrance: cards arc in from the left, one by one (farLeft first → farRight last)
const ENTRANCE_DELAY = 0.14;         // stagger gap between cards
const ENTRANCE_DUR   = 1.05;        // arc duration per card
const ENTRANCE_EASE  = [0.22, 1, 0.36, 1];
const ENTRANCE_TIMES = [0, 0.46, 1]; // x locks to slot at 46%, y arcs up then down

// After last card (index 4) finishes: 4*0.14 + 1.05 = 1.61s → add small buffer
const ENTRANCE_DONE_MS = 1750;

// rawDiff clamped to [-2,2] → stagger index 0..4 (farLeft first)
function staggerIdx(rawDiff) {
  return Math.max(0, Math.min(4, rawDiff + 2));
}

function getSlot(activeIndex, cardIndex, total) {
  let diff = (cardIndex - activeIndex + total) % total;
  if (diff > total / 2) diff -= total;
  if      (diff <= -2) return SLOT.farLeft;
  else if (diff === -1) return SLOT.left;
  else if (diff ===  0) return SLOT.center;
  else if (diff ===  1) return SLOT.right;
  else                  return SLOT.farRight;
}

export default function PresetCarousel({ presets, onPresetSelect }) {
  const [current, setCurrent]   = useState(0);
  const [paused,  setPaused]    = useState(false);
  const [progress, setProgress] = useState(0);
  // 'entering' → 'done'
  const [phase, setPhase]       = useState('entering');

  const videoRefs = useRef([]);
  const timerRef  = useRef(null);
  const progRef   = useRef(null);

  const total = presets.length;
  const prev = useCallback(() => setCurrent(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent(i => (i + 1) % total),         [total]);

  const nextRef = useRef(next);
  useEffect(() => { nextRef.current = next; });

  // Switch to normal mode after entrance finishes
  useEffect(() => {
    const t = setTimeout(() => setPhase('done'), ENTRANCE_DONE_MS);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance + progress bar — only after entrance
  useEffect(() => {
    if (paused || phase !== 'done') return;
    let startTime = performance.now();

    progRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime;
      setProgress(Math.min((elapsed / AUTO_ADVANCE_MS) * 100, 100));
    }, 50);

    timerRef.current = setInterval(() => {
      startTime = performance.now();
      setProgress(0);
      nextRef.current();
    }, AUTO_ADVANCE_MS);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(progRef.current);
    };
  }, [paused, phase]);

  // Play center video, pause others
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === current && presets[idx]?.active) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [current, presets]);

  return (
    <div
      className="flex flex-col items-center w-full select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Track ─────────────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center w-full h-[520px] md:h-[680px] overflow-hidden">
        {presets.map((preset, idx) => {
          const slot     = getSlot(current, idx, total);
          const isCenter = idx === current;

          let rawDiff = (idx - current + total) % total;
          if (rawDiff > total / 2) rawDiff -= total;
          const clampedDiff = Math.max(-2, Math.min(2, rawDiff));
          const cardDelay   = staggerIdx(clampedDiff) * ENTRANCE_DELAY;

          const handleClick = () => {
            if (phase !== 'done') return;
            if (isCenter) {
              if (preset.active && onPresetSelect) onPresetSelect(preset);
              return;
            }
            let diff = (idx - current + total) % total;
            if (diff > total / 2) diff -= total;
            if (diff < 0) prev(); else next();
          };

          // Entrance: arc from off-screen left → slot position
          const entranceAnimate = {
            x:       ['-300%', slot.x, slot.x],
            y:       [70, -65, 0],
            scale:   [0.22, slot.scale * 1.06, slot.scale],
            opacity: [0, Math.min(slot.opacity + 0.25, 1), slot.opacity],
            filter:  [`blur(8px)`, `blur(0px)`, `blur(${slot.blur}px)`],
            zIndex:  slot.z,
          };

          // Normal: slot position with spring (responds to navigation)
          const normalAnimate = {
            x:       slot.x,
            y:       0,
            scale:   slot.scale,
            opacity: slot.opacity,
            filter:  `blur(${slot.blur}px)`,
            zIndex:  slot.z,
          };

          return (
            <motion.div
              key={preset.id ?? idx}
              onClick={handleClick}
              initial={{ x: '-300%', y: 70, scale: 0.22, opacity: 0, filter: 'blur(8px)', zIndex: slot.z }}
              animate={phase === 'entering' ? entranceAnimate : normalAnimate}
              transition={phase === 'entering'
                ? { duration: ENTRANCE_DUR, ease: ENTRANCE_EASE, delay: cardDelay, times: ENTRANCE_TIMES }
                : SPRING
              }
              className={`absolute w-[200px] sm:w-[240px] md:w-[300px] aspect-[9/16]
                bg-black border-2 rounded-[2rem] overflow-hidden
                shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                ${phase === 'done' && isCenter ? 'border-white/60 cursor-default' : phase === 'done' ? 'border-white/30 cursor-pointer' : 'border-white/30'}`}
              style={{ top: 0, bottom: 0, margin: 'auto' }}
            >
              {/* Media */}
              {preset.active ? (
                <video
                  ref={el => { videoRefs.current[idx] = el; }}
                  src={preset.video}
                  muted loop playsInline preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <img
                  src={COMING_SOON_IMG}
                  alt={preset.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 z-10 pointer-events-none" />

              {/* Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[38%] h-[6px] bg-black/25 rounded-full z-20" />

              {/* Coming Soon overlay */}
              {!preset.active && (
                <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] z-25 flex flex-col items-center justify-center gap-3 pointer-events-none">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
                    <Lock size={18} className="text-white/80" strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-bold text-white/80 uppercase tracking-[0.18em]">Coming Soon</span>
                </div>
              )}

              {/* Title label */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30 pointer-events-none">
                <span className="text-white/90 font-bold tracking-wide text-[13px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  {preset.title}
                </span>
              </div>

              {/* Active ring + tap hint — only after entrance */}
              {phase === 'done' && isCenter && (
                <>
                  <div className="absolute inset-0 rounded-[2rem] ring-[2.5px] ring-white/55 pointer-events-none z-30" />
                  {preset.active && onPresetSelect && (
                    <div className="absolute bottom-16 left-0 right-0 flex justify-center z-30 pointer-events-none">
                      <span className="text-[10px] font-bold tracking-[0.12em] uppercase bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-full">
                        Tap to apply
                      </span>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Controls — fade in after entrance */}
      <motion.div
        className="flex items-center gap-5 -mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: phase === 'done' ? 1 : 0, y: phase === 'done' ? 0 : 20 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.button
          onClick={prev}
          whileHover={{ x: -3, scale: 1.06 }}
          whileTap={{ scale: 0.91 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-11 h-11 rounded-full bg-white/45 hover:bg-white/70 backdrop-blur border border-white/60 text-slate-700 flex items-center justify-center shadow-md"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </motion.button>

        <div className="flex gap-2 items-center">
          {presets.map((_, dotIdx) => (
            <div
              key={dotIdx}
              onClick={() => { if (phase === 'done') { setCurrent(dotIdx); setProgress(0); } }}
              className="relative flex items-center justify-center cursor-pointer"
            >
              {dotIdx === current ? (
                <div className="relative h-[7px] w-6 rounded-full overflow-hidden bg-white/30">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#5b52a3]"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.05, ease: 'linear' }}
                  />
                </div>
              ) : (
                <motion.div
                  animate={{ width: 7, backgroundColor: 'rgba(255,255,255,0.50)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="h-[7px] rounded-full"
                />
              )}
            </div>
          ))}
        </div>

        <motion.button
          onClick={next}
          whileHover={{ x: 3, scale: 1.06 }}
          whileTap={{ scale: 0.91 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-11 h-11 rounded-full bg-white/45 hover:bg-white/70 backdrop-blur border border-white/60 text-slate-700 flex items-center justify-center shadow-md"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </motion.button>
      </motion.div>
    </div>
  );
}
