import React, { useState, useRef } from 'react';
import { Sparkles, Lock, Layers, CloudUpload, Zap, Download, Globe, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

import { useEditorStore } from '../store/useEditorStore';
import { useTranscription } from '../hooks/useTranscription';
import PresetCarousel from '../components/Carousal/PresetCarousel';
import PresetUploadModal from '../components/common/PresetUploadModal';
import ProcessingModal from '../components/common/ProcessingModal';
import Footer from '../components/common/Footer';

const DEFAULT_VIDEO    = 'https://res.cloudinary.com/dbtfi1rbi/video/upload/v1780226923/exported_1780226314943_ucsg6e.mp4';
const COMING_SOON_IMG  = 'https://res.cloudinary.com/dbtfi1rbi/image/upload/v1781002253/Screenshot_2026-06-09_161355_xph2fq.png';

const presets = [
  { id: 'slide-up',   title: 'Viral Slide Up',  desc: 'Poppins bold with dynamic slide physics.',  previewTop: 'VIRAL',  previewBottom: 'SLIDE',   active: true,  video: 'https://res.cloudinary.com/dbtfi1rbi/video/upload/v1780230249/sample_video_viral_slideup_cpduwk.mp4' },
  { id: 'cinematic',  title: 'Cinematic',        desc: 'Elegant lower-thirds with soft tracking.',  previewTop: 'QUIET',  previewBottom: 'REVEAL',  active: true,  video: 'https://res.cloudinary.com/dbtfi1rbi/video/upload/v1780917321/sample_website_video_box_caption-_rxlwuo.mp4' },
  { id: 'neon',       title: 'Creator Neon',     desc: 'High-contrast stream-ready emphasis.',       previewTop: 'WAIT',   previewBottom: 'FOR IT',  active: false, video: DEFAULT_VIDEO },
  { id: 'minimalist', title: 'Minimalist',       desc: 'Clean captions for training & webinars.',    previewTop: 'CLEAR',  previewBottom: 'CUT',     active: true,  video: 'https://res.cloudinary.com/dbtfi1rbi/video/upload/v1780917318/sample_website_video_minimalist_s2lo9f.mp4' },
  { id: 'glitch',     title: 'Glitch Effect',    desc: 'Cyberpunk-style fast transitions.',          previewTop: 'NEXT',   previewBottom: 'DROP',    active: false, video: DEFAULT_VIDEO },
  { id: 'karaoke',    title: 'Karaoke Bounce',   desc: 'Word-by-word highlight bounce.',             previewTop: 'STAY',   previewBottom: 'TUNED',   active: false, video: DEFAULT_VIDEO },
];

export default function LibraryPage() {
  const [hovered, setHovered]       = useState(null);
  const [uploadModal, setUploadModal] = useState({ isOpen: false, presetId: null, presetName: '' });
  const videoRefs = useRef({});

  const navigate             = useNavigate();
  const { applyPreset, setVideo, isProcessing } = useEditorStore();
  const { uploadAndTranscribe }   = useTranscription();

  const openModal = (presetId, presetName) => {
    if (!presetId) return;
    setUploadModal({ isOpen: true, presetId, presetName });
  };

  const handleModalUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file.');
      return;
    }
    const targetPresetId = uploadModal.presetId;
    setUploadModal({ isOpen: false, presetId: null, presetName: '' });

    const localVideoUrl = URL.createObjectURL(file);

    const success = await uploadAndTranscribe(file);
    if (success === true) {
      setVideo(file, localVideoUrl);
      applyPreset(targetPresetId);
      useEditorStore.getState().bakeTimeline();
      navigate('/editor');
    } else {
      alert('Transcription failed. Make sure the local server is running:\n  cd server && npm run dev');
    }
  };

  const handleEnter = (id) => {
    setHovered(id);
    const vid = videoRefs.current[id];
    if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
  };

  const handleLeave = (id) => {
    setHovered(null);
    const vid = videoRefs.current[id];
    if (vid) vid.pause();
  };

  return (
    <div className="flex flex-col w-full h-full px-7 pt-10 pb-10 overflow-y-auto fade-in font-sans antialiased relative">

      {/* Ambient orbs */}
      <div className="fixed top-[-8%] left-[-8%] w-[480px] h-[480px] rounded-full bg-purple-400/20 blur-[110px] pointer-events-none z-0" />
      <div className="fixed bottom-[10%] right-[-5%] w-[360px] h-[360px] rounded-full bg-blue-400/15 blur-[100px] pointer-events-none z-0" />

      <div className="max-w-[1400px] w-full mx-auto space-y-10 z-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7a4d8a]/10 border border-[#7a4d8a]/20 text-[#7a4d8a] text-[11px] font-bold tracking-[0.2em] uppercase shadow-sm">
            <Sparkles size={13} /> Caption Style Presets
          </div>

          <h1 className="text-[40px] md:text-[52px] font-extrabold tracking-tighter leading-[1.05] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600">
            Professional styles,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#7a4d8a]">one click away.</span>
          </h1>

          <p className="text-[15px] text-slate-500 font-medium max-w-[500px] leading-relaxed">
            Pick a caption package before uploading — it auto-applies to your next video and builds the timeline with the preset's animation physics already dialed in.
          </p>
        </div>

        {/* Carousel — center card click opens the preset upload modal */}
        <PresetCarousel
          presets={presets}
          onPresetSelect={(p) => openModal(p.id, p.title)}
        />

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 px-1"
        >
          <div className="flex-1 h-px bg-black/8" />
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400">All presets</span>
          <div className="flex-1 h-px bg-black/8" />
        </motion.div>

        {/* Preset grid — video plays on hover, replaces text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {presets.map((preset, idx) => {
            const isHovered = hovered === preset.id;

            return (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: idx * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="aspect-9/16"
              >
              <div
                onMouseEnter={() => preset.active && handleEnter(preset.id)}
                onMouseLeave={() => preset.active && handleLeave(preset.id)}
                onClick={() => preset.active && openModal(preset.id, preset.title)}
                className={`group relative w-full h-full rounded-[28px] overflow-hidden cursor-pointer transition-all duration-500 border ${
                  preset.active
                    ? isHovered
                      ? 'border-white/70 shadow-[0_20px_50px_rgba(0,0,0,0.18)] -translate-y-2 scale-[1.02]'
                      : 'bg-white/20 border-white/50 shadow-[0_8px_28px_rgba(0,0,0,0.07)]'
                    : 'bg-white/10 border-white/30 shadow-sm opacity-70'
                } backdrop-blur-2xl`}
              >
                {/* Media — video for active, placeholder for coming soon */}
                {preset.active ? (
                  <video
                    ref={el => { videoRefs.current[preset.id] = el; }}
                    src={preset.video}
                    poster={preset.video.replace('/video/upload/', '/video/upload/so_0,f_jpg/').replace(/\.mp4$/i, '.jpg')}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                ) : (
                  <img
                    src={COMING_SOON_IMG}
                    alt={preset.title}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                )}

                {/* Permanent top gradient — keeps text readable over any video */}
                {preset.active && (
                  <div className="absolute top-0 left-0 right-0 h-36 bg-linear-to-b from-black/70 via-black/20 to-transparent z-10 pointer-events-none" />
                )}

                {/* Title + desc — white text, fades on hover */}
                <div className={`absolute top-0 left-0 right-0 p-5 z-20 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                  <h3 className="text-white text-[15px] font-bold tracking-tight leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{preset.title}</h3>
                  <p className="text-white/80 text-[11px] font-medium mt-1 leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{preset.desc}</p>
                </div>

                {/* Persistent bottom title — always visible */}
                {preset.active && (
                  <div className="absolute bottom-5 left-0 right-0 flex justify-center z-30 pointer-events-none">
                    <span className="text-[11px] font-bold tracking-[0.1em] uppercase bg-black/40 backdrop-blur-md border border-white/20 text-white px-3.5 py-1.5 rounded-full shadow-sm">
                      {preset.title}
                    </span>
                  </div>
                )}

                {/* Coming Soon overlay — dark, matches carousel */}
                {!preset.active && (
                  <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-3 pointer-events-none">
                    <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
                      <Lock size={18} className="text-white/80" strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-bold text-white/80 uppercase tracking-[0.18em]">Coming Soon</span>
                  </div>
                )}
              </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <div className="mt-16 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7a4d8a]/10 border border-[#7a4d8a]/20 text-[#7a4d8a] text-[11px] font-bold tracking-[0.2em] uppercase mb-4">
              <Sparkles size={11} /> How it works
            </div>
            <h2 className="text-[32px] md:text-[40px] font-extrabold tracking-tighter leading-tight text-transparent bg-clip-text bg-linear-to-br from-slate-900 to-slate-600">
              From preset to final cut<br className="hidden md:block" /> in under a minute.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: '01', icon: Layers,      title: 'Pick your style',    desc: 'Browse the carousel above and tap any active preset to see what caption style it uses — bold, minimal, or cinematic.' },
              { step: '02', icon: CloudUpload, title: 'Drop your footage',  desc: 'Select your MP4, MOV, or WebM clip. The AI transcribes your audio and builds a frame-accurate caption timeline automatically.' },
              { step: '03', icon: Zap,         title: 'Caption in seconds', desc: "The preset's animation physics are already dialed in. Tweak, trim, or export straight to 4K — no keyframing required." },
            ].map((item, i) => {
              const StepIcon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.10, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="relative p-7 bg-white/55 backdrop-blur-2xl border border-white/70 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.09)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[11px] font-black tracking-[0.18em] text-accent/50 uppercase">{item.step}</span>
                    <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-accent/10 to-[#7a4d8a]/10 border border-white/60 flex items-center justify-center">
                      <StepIcon size={18} className="text-[#7a4d8a]" strokeWidth={2} />
                    </div>
                  </div>
                  <h3 className="text-slate-900 font-bold text-[17px] tracking-tight mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Layers,   value: '6',    label: 'Caption Styles',  sub: '3 active · 3 coming soon' },
            { icon: Download, value: '4K',   label: 'Export Ready',    sub: 'MP4 · WebM · MOV' },
            { icon: Globe,    value: '50+',  label: 'Languages',       sub: 'Auto-transcribe & translate' },
            { icon: Clock,    value: '<1s',  label: 'Stagger Timing',  sub: 'Frame-accurate sync' },
          ].map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center gap-2 p-6 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[22px] shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center">
                  <StatIcon size={16} className="text-accent" strokeWidth={2} />
                </div>
                <span className="text-[28px] font-black tracking-tight text-slate-900 leading-none">{stat.value}</span>
                <span className="text-[13px] font-bold text-slate-700">{stat.label}</span>
                <span className="text-[11px] text-slate-400 font-medium">{stat.sub}</span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Bottom CTA ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 mb-8 relative overflow-hidden rounded-4xl bg-linear-to-br from-accent/8 via-white/60 to-[#7a4d8a]/8 backdrop-blur-2xl border border-white/70 shadow-[0_12px_40px_rgba(0,0,0,0.06)] px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#7a4d8a]/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-[22px] md:text-[26px] font-extrabold tracking-tight text-slate-900 leading-tight mb-1.5">
              New styles added every month.
            </h3>
            <p className="text-[14px] text-slate-500 font-medium">
              Select an active preset above to start captioning your first video.
            </p>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="relative z-10 shrink-0 flex items-center gap-2.5 px-7 py-3.5 bg-linear-to-r from-accent to-[#5856D6] text-white text-[15px] font-bold rounded-2xl shadow-[0_6px_24px_rgba(0,122,255,0.35)] hover:shadow-[0_10px_36px_rgba(0,122,255,0.50)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Browse Presets
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </motion.div>

      </div>

      {/* Preset selection modal */}
      <PresetUploadModal
        isOpen={uploadModal.isOpen}
        presetName={uploadModal.presetName}
        onCancel={() => setUploadModal({ isOpen: false, presetId: null, presetName: '' })}
        onFileChange={handleModalUpload}
      />

      {/* AI processing modal */}
      <ProcessingModal isVisible={isProcessing} />
      <Footer />
    </div>
  );
}
