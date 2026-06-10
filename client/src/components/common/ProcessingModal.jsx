import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { msg: 'Uploading your video…',          pct: 18 },
  { msg: 'Extracting audio track…',        pct: 32 },
  { msg: 'AI transcribing your speech…',   pct: 52 },
  { msg: 'Detecting key moments…',         pct: 68 },
  { msg: 'Building caption timeline…',     pct: 82 },
  { msg: 'Finalising your workspace…',     pct: 91 },
];

export default function ProcessingModal({ isVisible }) {
  const [stepIdx,  setStepIdx]  = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) { setStepIdx(0); setProgress(0); return; }

    // advance message + target progress every 2.8 s
    const msgTimer = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, STEPS.length - 1));
    }, 2800);

    // smooth fake progress toward current step target
    const progTimer = setInterval(() => {
      setProgress(p => {
        const target = STEPS[Math.min(stepIdx, STEPS.length - 1)].pct;
        if (p >= target) return p;
        const delta = (target - p) * 0.06 + 0.3;
        return Math.min(p + delta, target);
      });
    }, 60);

    return () => { clearInterval(msgTimer); clearInterval(progTimer); };
  }, [isVisible, stepIdx]);

  const currentStep = STEPS[stepIdx];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="processing-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          style={{ background: 'rgba(10,5,20,0.65)', backdropFilter: 'blur(20px)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.92,  y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-[360px] rounded-[32px] overflow-hidden
                       bg-white/12 backdrop-blur-3xl border border-white/25
                       shadow-[0_40px_100px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]
                       flex flex-col items-center text-center px-8 py-10 gap-0"
          >
            {/* Top glass highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px
                            bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            {/* Pulsing rings + central icon */}
            <div className="relative flex items-center justify-center mb-8">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-[#007AFF]/40"
                  animate={{ scale: [1, 1.6 + i * 0.25], opacity: [0.6, 0] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: i * 0.45,
                    ease: 'easeOut',
                  }}
                  style={{ width: 56, height: 56 }}
                />
              ))}
              <div className="relative z-10 w-14 h-14 rounded-2xl
                              bg-gradient-to-br from-[#007AFF] to-[#5856D6]
                              flex items-center justify-center
                              shadow-[0_8px_24px_rgba(0,122,255,0.55)]">
                {/* Waveform bars */}
                <div className="flex items-end gap-[3px] h-6">
                  {[0.6, 1, 0.75, 1, 0.5].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] bg-white rounded-full"
                      animate={{ scaleY: [h, 1, h * 0.7, 1, h] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                      style={{ height: `${h * 100}%`, originY: 1 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <p className="text-white text-[20px] font-bold tracking-tight mb-1">
              AI is working its magic
            </p>

            {/* Cycling message */}
            <div className="h-6 mb-6 relative overflow-hidden flex items-center justify-center w-full">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{    opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-[13px] text-white/60 font-medium absolute"
                >
                  {currentStep.msg}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="w-full">
              <div className="w-full h-[5px] bg-white/15 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #007AFF 0%, #5856D6 60%, #AF52DE 100%)',
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[11px] text-white/35 font-semibold">Processing</span>
                <motion.span
                  className="text-[11px] text-white/50 font-bold tabular-nums"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>
            </div>

            {/* Step dots */}
            <div className="flex gap-1.5 mt-5">
              {STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-[5px] rounded-full"
                  animate={{
                    width: i === stepIdx ? 18 : 5,
                    backgroundColor: i <= stepIdx ? '#007AFF' : 'rgba(255,255,255,0.2)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
