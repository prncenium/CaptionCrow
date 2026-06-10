import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, X, Clapperboard, Sparkles } from 'lucide-react';

export default function PresetUploadModal({ isOpen, presetName, onCancel, onFileChange }) {
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="upload-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          className="fixed inset-0 z-9999 flex items-center justify-center p-5"
          style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(18px)' }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.90, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.94,  y: 10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-95 rounded-[28px] overflow-hidden
                       bg-white/92 backdrop-blur-2xl border border-white/80
                       shadow-[0_32px_80px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.9)]"
          >
            {/* ── Gradient banner ── */}
            <div className="relative h-28 bg-linear-to-br from-accent via-[#5856D6] to-[#AF52DE] overflow-hidden">
              {/* Decorative orbs */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute top-2 left-1/3 w-12 h-12 rounded-full bg-white/5" />

              {/* Icon centered in banner */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30
                                flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.18)]">
                  <Clapperboard size={27} className="text-white" strokeWidth={1.75} />
                </div>
              </div>

              {/* Close button — lives in the banner */}
              <button
                onClick={onCancel}
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm
                           border border-white/25 flex items-center justify-center text-white/85
                           hover:bg-white/35 transition-all"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="px-7 pt-5 pb-7 flex flex-col items-center text-center">

              {/* Preset badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                              bg-accent/10 border border-accent/20
                              text-accent text-[11px] font-bold tracking-[0.12em] uppercase mb-3">
                <Sparkles size={10} />
                {presetName}
              </div>

              {/* Headline */}
              <h2 className="text-[20px] font-bold tracking-tight text-slate-900 leading-tight mb-2">
                Ready to caption?
              </h2>

              <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-6 max-w-67.5">
                Select your footage —{' '}
                <span className="font-semibold text-slate-700">{presetName}</span>{' '}
                style will be applied automatically when you enter the editor.
              </p>

              {/* Primary CTA */}
              <label
                className="w-full flex items-center justify-center gap-2
                           py-3.5 rounded-[14px] cursor-pointer select-none
                           bg-linear-to-r from-accent to-[#5856D6]
                           text-white text-[15px] font-bold
                           shadow-[0_4px_20px_rgba(0,122,255,0.36)]
                           hover:shadow-[0_6px_30px_rgba(0,122,255,0.52)]
                           hover:opacity-95 active:scale-[0.98] transition-all duration-200"
              >
                <CloudUpload size={17} strokeWidth={2.2} />
                Select Video
                <input
                  type="file"
                  className="hidden"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={onFileChange}
                />
              </label>

              {/* Cancel */}
              <button
                onClick={onCancel}
                className="mt-2.5 w-full py-2.5 rounded-[14px] text-slate-500
                           text-[13px] font-semibold hover:text-slate-800
                           hover:bg-slate-100 transition-all duration-200"
              >
                Cancel
              </button>

              {/* Format dots */}
              <div className="mt-3.5 flex items-center gap-2">
                {['MP4', 'MOV', 'WebM'].map((fmt, i) => (
                  <React.Fragment key={fmt}>
                    <span className="text-[11px] text-slate-400 font-medium">{fmt}</span>
                    {i < 2 && <span className="w-0.75 h-0.75 rounded-full bg-slate-300 inline-block" />}
                  </React.Fragment>
                ))}
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
