import React, { useState, useRef, useEffect } from 'react';
import { Gauge, CheckCircle2, Sparkles, Loader2, ArrowRight, CloudUpload, SlidersHorizontal, Download, Layers, Globe, Lock } from 'lucide-react';

const COMING_SOON_IMG = 'https://res.cloudinary.com/dbtfi1rbi/image/upload/v1781002253/Screenshot_2026-06-09_161355_xph2fq.png';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store/useEditorStore';
import { useTranscription } from '../hooks/useTranscription';
import VideoDropzone from '../components/UploadHub/VideoDropzone';
import Footer from '../components/common/Footer';
import Hero3DTitle from '../components/Interactive/Hero3DTitle';
import PresetUploadModal from '../components/common/PresetUploadModal';
import ProcessingModal from '../components/common/ProcessingModal';

export default function DashboardPage() {
  const [activePreset, setActivePreset] = useState('slide-up');
  const [uploadModal, setUploadModal] = useState({ isOpen: false, presetId: null, presetName: '' });

  // Wake up Render's free-tier server as soon as the dashboard loads
  useEffect(() => {
    import('../utils/apiConfig').then(({ getApiBase }) => {
      fetch(`${getApiBase()}/healthz`).catch(() => {});
    });
  }, []);
  
  const navigate = useNavigate();
  const { applyPreset, setVideo, isProcessing } = useEditorStore();
  const { uploadAndTranscribe } = useTranscription();

  const handleModalUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('video/')) {
          alert('Please upload a valid video file.');
          return;
      }

      
      const targetPresetId = uploadModal.presetId;
      setUploadModal((prev) => ({ ...prev, isOpen: false })); 

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

  const DEFAULT_VIDEO = 'https://res.cloudinary.com/dbtfi1rbi/video/upload/v1780226923/exported_1780226314943_ucsg6e.mp4';

  const presets = [
    { id: 'slide-up',   active: true,  title: 'Viral Slide Up', desc: 'Clean Poppins bold with dynamic slide physics.', video: 'https://res.cloudinary.com/dbtfi1rbi/video/upload/v1780230249/sample_video_viral_slideup_cpduwk.mp4' },
    { id: 'cinematic',  active: true,  title: 'Cinematic',       desc: 'Elegant lower-thirds with soft tracking.',       video: 'https://res.cloudinary.com/dbtfi1rbi/video/upload/v1780917321/sample_website_video_box_caption-_rxlwuo.mp4' },
    { id: 'neon',       active: false, title: 'Creator Neon',    desc: 'High contrast stream-ready emphasis.',           video: DEFAULT_VIDEO },
    { id: 'minimalist', active: true,  title: 'Minimalist',      desc: 'Clean captions for training and webinars.',      video: 'https://res.cloudinary.com/dbtfi1rbi/video/upload/v1780917318/sample_website_video_minimalist_s2lo9f.mp4' },
  ];

  const videoRefs = useRef([]);

  const handleVideoEnter = (idx) => {
    const vid = videoRefs.current[idx];
    if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
  };

  const handleVideoLeave = (idx) => {
    const vid = videoRefs.current[idx];
    if (vid) { vid.pause(); vid.currentTime = 0; }
  };

  return (
    <>
    <div className="flex flex-col w-full h-full px-7 pt-12 pb-10 overflow-y-auto fade-in font-sans antialiased">
      
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-400/20 blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none z-0"></div>

      <div className="max-w-[1440px] w-full mx-auto space-y-8">
      <Hero3DTitle />
        
        {/* Top Section: Headers & Widget - UPGRADED TO CENTERED LAYOUT */}
        <div className="relative flex flex-col items-center text-center mt-8 mb-16 z-10">
          
          

          <div className="max-w-4xl flex flex-col items-center space-y-6 relative z-10">
            <h1 className="text-[38px] md:text-[48px] lg:text-[56px] font-extrabold tracking-tighter leading-[1.05] text-[#1D1D1F]">
              AI captions with the control surface of a <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#7a4d8a]">professional edit bay.</span>
            </h1>
            
            <p className=" text-[16px] md:text-[18px] text-slate-600 font-medium tracking-tight max-w-[640px] leading-relaxed">
              Pick a caption package, drop your footage, and move straight into a Premiere-style workspace tuned for caption timing, styling, and exports.
            </p>

            {/* Feature Pills - Upgraded to Premium Glassmorphism */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
                <div className="px-5 py-2.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-[13px] font-bold tracking-tight text-slate-800 shadow-[0_8px_16px_rgba(0,0,0,0.04)] flex items-center gap-2.5 hover:bg-white/60 hover:scale-105 hover:shadow-lg transition-all duration-300">
                    <Sparkles size={16} className="text-[#007AFF]" /> Powered by FFmpeg
                </div>
                <div className="px-5 py-2.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-[13px] font-bold tracking-tight text-slate-800 shadow-[0_8px_16px_rgba(0,0,0,0.04)] flex items-center gap-2.5 hover:bg-white/60 hover:scale-105 hover:shadow-lg transition-all duration-300">
                    <Gauge size={16} className="text-[#007AFF]" /> Sub-second Stagger
                </div>
                <div className="px-5 py-2.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-[13px] font-bold tracking-tight text-slate-800 shadow-[0_8px_16px_rgba(0,0,0,0.04)] flex items-center gap-2.5 hover:bg-white/60 hover:scale-105 hover:shadow-lg transition-all duration-300">
                    <CheckCircle2 size={16} className="text-[#007AFF]" /> 4K Export Ready
                </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Preset Selector */}
        <div className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between mb-5"
          >
            <div className="flex items-center gap-2">
              {/* Increased icon size to 14 and stroke width for better visibility */}
              <Sparkles size={14} strokeWidth={2.5} className="text-[#7a4d8a]" />
              {/* Increased text to 13px, made it extrabold, and removed the /70 opacity to make it solid black/dark grey */}
              <div className="text-[13px] tracking-[0.15em] font-extrabold uppercase text-[#1D1D1F]">Caption Style Presets</div>
            </div>
            <div className="text-[14px] text-[#007AFF] font-bold tracking-tight">Auto-applied to next upload</div>
          </motion.div>
          
          {/* 🚨 THE 4-BOX CINEMATIC LIQUID GLASS GRID 🚨 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {presets.map((preset, idx) => (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: idx * 0.10, duration: 0.60, ease: [0.22, 1, 0.36, 1] }}
                className="aspect-[9/16]"
              >
              <div
                onMouseEnter={() => preset.active && handleVideoEnter(idx)}
                onMouseLeave={() => preset.active && handleVideoLeave(idx)}
                onClick={() => {
                  if (!preset.active) return;
                  setActivePreset(preset.id);
                  setUploadModal({ isOpen: true, presetId: preset.id, presetName: preset.title });
                }}
                className={`group relative w-full h-full rounded-[32px] overflow-hidden transition-all duration-500 ease-out border ${
                  preset.active
                    ? `cursor-pointer ${activePreset === preset.id
                        ? 'border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] scale-[1.03] z-10'
                        : 'border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:border-white/60 hover:shadow-xl hover:-translate-y-1'}`
                    : 'cursor-default border-white/30 shadow-sm'
                }`}
              >
                {/* Media — video for active, placeholder for coming soon */}
                {preset.active ? (
                  <video
                    ref={el => { videoRefs.current[idx] = el; }}
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

                {/* Permanent top gradient — always visible so text stays readable */}
                {preset.active && (
                  <div className="absolute top-0 left-0 right-0 h-36 bg-linear-to-b from-black/70 via-black/20 to-transparent z-10 pointer-events-none" />
                )}

                {/* Title + desc — white text, fades on hover */}
                {preset.active && (
                  <div className="absolute top-0 left-0 right-0 p-5 z-20 transition-opacity duration-300 group-hover:opacity-0">
                    <h3 className="text-white text-[15px] font-bold tracking-tight mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{preset.title}</h3>
                    <p className="text-white/80 text-[11px] font-medium leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{preset.desc}</p>
                  </div>
                )}

                {/* Persistent bottom title label — active only */}
                {preset.active && (
                  <div className="absolute bottom-5 left-0 right-0 flex justify-center z-30 pointer-events-none">
                    <span className="text-[11px] font-bold tracking-widest uppercase bg-black/40 backdrop-blur-md border border-white/20 text-white px-3.5 py-1.5 rounded-full shadow-sm">
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

                {/* Active-preset ring */}
                {preset.active && activePreset === preset.id && (
                  <div className="absolute inset-0 rounded-[32px] ring-2 ring-white/70 z-40 pointer-events-none" />
                )}
              </div>
              </motion.div>
            ))}
          </div>
        </div>

        
        {/* Bottom Section: The Dropzone */}
        <div id="upload-section" className="w-full mt-16">
           <VideoDropzone />
        </div>

        {/* 🚨 THE Z-PATTERN EDITORIAL SCROLL: ROW 3 (Languages) 🚨 */}
        <div className="mt-20 pt-10 pb-10">
          
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Side: Editorial Text */}
            <div className="flex-[0.9] flex flex-col justify-center space-y-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[11px] font-bold tracking-[0.2em] uppercase shadow-sm w-fit">
                <Globe size={14} /> Global Reach
              </div>
              
              {/* Heading & Paragraph */}
              <div className="space-y-4">
                <h2 className=" text-[44px] md:text-[52px] font-black tracking-tighter leading-[1.05] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600">
                  Speak every language.<br />Instantly.
                </h2>
                <p className="text-[16px] text-slate-600 font-medium leading-relaxed max-w-[440px]">
                  Break the language barrier and multiply your audience. Auto-transcribe and translate your videos into over 50 global languages, perfectly timed to your original audio.
                </p>
              </div>

              {/* Micro-Features List */}
              <div className="flex flex-col gap-3.5 pt-2">
                <div className="flex items-center gap-3 text-[14px] font-bold tracking-tight text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                  50+ Global Languages & Dialects
                </div>
                <div className="flex items-center gap-3 text-[14px] font-bold tracking-tight text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                  One-click Auto Translation
                </div>
                <div className="flex items-center gap-3 text-[14px] font-bold tracking-tight text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                  Native SRT & VTT Exports
                </div>
              </div>
            </div>

            {/* Right Side: The Borderless Visual (Floating Language Pills) */}
            <div className="flex-[1.2] relative w-full h-[320px] flex items-center justify-center group">
              {/* Subtle emerald background glow */}
              <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full z-0"></div>
              
              <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                
                {/* Center Active Pill (English) */}
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  /* Changed duration to 1.5 */
                  transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="absolute z-30"
                >
                  <div className="bg-white/60 backdrop-blur-3xl border border-white/80 text-slate-900 px-7 py-3.5 rounded-full font-bold shadow-[0_16px_40px_rgba(0,0,0,0.12),inset_0_2px_4px_rgba(255,255,255,0.9)] transform group-hover:scale-110 transition-all duration-500 flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-emerald-500" /> English
                  </div>
                </motion.div>

                {/* Orbiting Language Pills (Indian & Global) */}
                
                {/* Top Left: Hindi */}
                <motion.div 
                  initial={{ x: -100, y: -100, opacity: 0 }}
                  whileInView={{ x: 0, y: 0, opacity: 1 }}
                  /* Changed duration to 1.2, delay to 0.2 */
                  transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="absolute top-[18%] left-[18%] z-20"
                >
                  <div className="bg-white/20 backdrop-blur-xl border border-white/40 text-slate-600 px-5 py-2.5 rounded-full text-[14px] font-semibold shadow-sm transform -translate-y-2 group-hover:-translate-y-8 group-hover:-translate-x-4 transition-all duration-700 ease-out">
                    Hindi
                  </div>
                </motion.div>
                
                {/* Bottom Left: Tamil */}
                <motion.div 
                  initial={{ x: -100, y: 100, opacity: 0 }}
                  whileInView={{ x: 0, y: 0, opacity: 1 }}
                  /* Changed duration to 1.2, delay to 0.4 */
                  transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="absolute bottom-[22%] left-[12%] z-20"
                >
                  <div className="bg-white/20 backdrop-blur-xl border border-white/40 text-slate-600 px-5 py-2.5 rounded-full text-[14px] font-semibold shadow-sm transform translate-y-2 group-hover:translate-y-8 group-hover:-translate-x-2 transition-all duration-700 ease-out">
                    Tamil
                  </div>
                </motion.div>
                
                {/* Top Right: Spanish */}
                <motion.div 
                  initial={{ x: 100, y: -100, opacity: 0 }}
                  whileInView={{ x: 0, y: 0, opacity: 1 }}
                  /* Changed duration to 1.2, delay to 0.6 */
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="absolute top-[28%] right-[12%] z-20"
                >
                  <div className="bg-white/20 backdrop-blur-xl border border-white/40 text-slate-600 px-5 py-2.5 rounded-full text-[14px] font-semibold shadow-sm transform -translate-x-2 group-hover:translate-x-6 group-hover:-translate-y-4 transition-all duration-700 ease-out">
                    Spanish
                  </div>
                </motion.div>
                
                {/* Bottom Right: Punjabi */}
                <motion.div 
                  initial={{ x: 100, y: 100, opacity: 0 }}
                  whileInView={{ x: 0, y: 0, opacity: 1 }}
                  /* Changed duration to 1.2, delay to 0.8 */
                  transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="absolute bottom-[18%] right-[18%] z-20"
                >
                  <div className="bg-white/20 backdrop-blur-xl border border-white/40 text-slate-600 px-5 py-2.5 rounded-full text-[14px] font-semibold shadow-sm transform translate-x-2 group-hover:translate-x-8 group-hover:translate-y-4 transition-all duration-700 ease-out">
                    Punjabi
                  </div>
                </motion.div>

                {/* Background out-of-focus pills */}
                
                {/* Top Far: Japanese */}
                <motion.div 
                  initial={{ y: -150, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 0.6 }}
                  /* Changed duration to 1.7, delay to 1.0 */
                  transition={{ duration: 1.7, delay: 1.0, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="absolute top-[8%] left-[50%] -translate-x-1/2 z-10"
                >
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 text-slate-500 px-4 py-2 rounded-full text-[13px] font-medium transform -translate-y-1 group-hover:-translate-y-6 transition-all duration-700 ease-out scale-90">
                    Japanese
                  </div>
                </motion.div>
                
                {/* Bottom Far: French */}
                <motion.div 
                  initial={{ y: 150, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 0.6 }}
                  /* Changed duration to 1.5, delay to 1.2 */
                  transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="absolute bottom-[8%] left-[50%] -translate-x-1/2 z-10"
                >
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 text-slate-500 px-4 py-2 rounded-full text-[13px] font-medium transform translate-y-1 group-hover:translate-y-6 transition-all duration-700 ease-out scale-90">
                    French
                  </div>
                </motion.div>

              </div>
            </div>

          </div>
        </div>

        

        {/* 🚨 THE Z-PATTERN EDITORIAL SCROLL: ROW 1 (Precision Timing) 🚨 */}
        <div className="mt-16 pt-10">
          
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Side: Editorial Text (Upgraded to match Row 3) */}
            <div className="flex-[0.9] flex flex-col justify-center space-y-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[11px] font-bold tracking-[0.2em] uppercase shadow-sm w-fit">
                <Gauge size={14} /> Precision Timing
              </div>
              
              <div className="space-y-4">
                <h2 className="text-[44px] md:text-[52px] font-black tracking-tighter leading-[1.05] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600">
                  Sub-second stagger.<br />Zero keyframing.
                </h2>
                <p className="text-[16px] text-slate-600 font-medium leading-relaxed max-w-[440px]">
                  Forget manually chopping up text layers in Premiere. Our AI transcribes your audio and automatically builds a dynamic timeline with word-level bounce and pop animations already dialed in.
                </p>
              </div>

              {/* Glassy Feature Chips */}
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="px-3.5 py-1.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-xl text-slate-700 text-[13px] font-bold shadow-sm">Frame-accurate sync</span>
                <span className="px-3.5 py-1.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-xl text-slate-700 text-[13px] font-bold shadow-sm">Custom offset delays</span>
              </div>
            </div>

            {/* Right Side: The Borderless 3D Glassy Animated Visual */}
            <div className="flex-[1.2] relative w-full h-[360px] flex items-center justify-center group z-10">
              
              {/* Deep background glow for depth, now essential without a container */}
              <div className="absolute inset-0 bg-[#007AFF]/10 blur-3xl rounded-full z-0"></div>
              
              {/* Borderless 3D Glassy Scroller Track */}
              <div className="relative w-full max-w-[440px] flex flex-col justify-center items-center transform group-hover:scale-[1.02] transition-transform duration-500 z-10">
                
                {/* Waveform Track */}
                <div className="relative w-full h-24 flex items-center justify-between gap-1 mb-8 px-2">
                  {/* Mathematically generated sound bars */}
                  {[...Array(34)].map((_, i) => {
                     const height = 15 + Math.abs(Math.sin(i * 0.5) * 45) + Math.abs(Math.cos(i * 1.2) * 20);
                     return (
                        /* 🚨 KEY CHANGE: Individually Glassy Bars (Fixed Comment Syntax) */
                        <div 
                           key={i} 
                           className="w-1.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.7)]" 
                           style={{ height: `${height}px` }}
                        ></div>
                     )
                  })}

                  {/* Animated Glowing Scrubber (Unchanged, looping) */}
                  <motion.div 
                    className="absolute top-[-15px] bottom-[-15px] w-[2px] bg-[#007AFF] shadow-[0_0_16px_rgba(0,122,255,0.9)] z-20"
                    animate={{ left: ["0%", "100%", "0%"] }}
                    transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-[3px] border-[#007AFF] shadow-md"></div>
                  </motion.div>
                </div>

                {/* Glassy Caption Timeline Track */}
                {/* 🚨 KEY CHANGE: Removed outer container background, added glassy effects directly */}
                <div className="w-full h-14 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/30 relative overflow-hidden flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)]">
                   
                   {/* Sync Highlight Overlay (Unchanged, follows the scrubber) */}
                   <motion.div 
                     className="absolute top-0 bottom-0 left-0 bg-[#007AFF]/10 border-r border-[#007AFF]/20"
                     animate={{ width: ["0%", "100%", "0%"] }}
                     transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
                   ></motion.div>
                   
                   {/* Floating Text (Slightly darkened for contrast on open glass) */}
                   <div className="flex gap-2.5 text-[20px] font-black tracking-tight relative z-10">
                      <span className="text-slate-600 drop-shadow-sm">Zero</span>
                      <span className="text-[#007AFF] drop-shadow-sm">keyframing</span>
                      <span className="text-slate-600 drop-shadow-sm">required</span>
                   </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        

        {/* 🚨 THE Z-PATTERN EDITORIAL SCROLL: ROW 2 🚨 */}
        <div className="mt-20 pt-10">
          
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Side: The Borderless Visual (3D Floating Text Layers) */}
            <div className="flex-[1.2] relative w-full h-[320px] flex items-center justify-center group">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-fuchsia-500/5 blur-3xl rounded-full z-0"></div>
              
              {/* 🚨 CHANGED: Converted to motion.div to add an on-load "pop" animation 🚨 */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.6, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, type: "spring", bounce: 0.5 }}
                viewport={{ once: true }}
                className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none"
              >
                
                {/* Layer 1: The Deep Drop Shadow */}
                <div className="absolute text-[72px] md:text-[96px] font-black tracking-tighter text-black/10 blur-[8px] transform translate-y-[20px] translate-x-[10px] group-hover:translate-y-[45px] group-hover:translate-x-[25px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-10">
                  STYLISH
                </div>

                {/* Layer 2: The Glowing Outline/Stroke */}
                <div className="absolute text-[72px] md:text-[96px] font-black tracking-tighter text-transparent transform translate-y-[10px] translate-x-[5px] group-hover:translate-y-[20px] group-hover:translate-x-[10px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-20" style={{ WebkitTextStroke: '2px rgba(122,77,138,0.4)' }}>
                  STYLISH
                </div>

                {/* Layer 3: The Solid Fill Top Layer */}
                <div className="absolute text-[72px] md:text-[96px] font-black tracking-tighter text-[#1D1D1F] transform translate-y-0 translate-x-0 group-hover:-translate-y-2 group-hover:-translate-x-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                  STYLISH
                </div>

                {/* Floating "Inspector" Panel that appears on hover */}
                <div className="absolute bottom-6 right-8 md:right-16 bg-white/70 backdrop-blur-2xl border border-white/80 p-3.5 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150 z-40">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-4 h-4 rounded shadow-sm bg-[#1D1D1F]"></div>
                    <span className="text-[10px] font-bold text-slate-800 tracking-widest uppercase">Base Fill</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded border-2 border-[#7a4d8a] bg-[#7a4d8a]/10"></div>
                    <span className="text-[10px] font-bold text-slate-800 tracking-widest uppercase">Outer Stroke</span>
                  </div>
                </div>

              </motion.div>
            </div>

            {/* Right Side: Editorial Text */}
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7a4d8a]/10 border border-[#7a4d8a]/20 text-[#7a4d8a] text-[12px] font-bold tracking-widest uppercase">
                <Layers size={14} /> Motion Graphics
              </div>
              <div className="space-y-4">
                <h2 className="text-[44px] md:text-[52px] font-black tracking-tighter leading-[1.05] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600">
                  Cinematic styles.<br />Out of the box.
                </h2>
                <p className="text-[16px] text-slate-600 font-medium leading-relaxed max-w-[440px]">
                  You shouldn't need a degree in After Effects to create engaging hooks. Apply multi-layered text formatting, glowing strokes, and deep physical drop shadows with a single click.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 🚨 THE FINAL PUSH: APPLE LIQUID GLASS CTA (Slim Rectangular Version) 🚨 */}
        <div className="mt-24 mb-16 relative flex justify-center w-full group z-10">
          
          {/* Deep Ambient Glow */}
          <div className="absolute inset-0 bg-[#007AFF]/10 blur-[100px] rounded-[60px] z-0 group-hover:bg-[#007AFF]/20 transition-colors duration-1000 pointer-events-none"></div>
          
          {/* Liquid Glass Container - Reduced width to 800px and vertical padding to py-10 */}
          <div className="relative w-full max-w-[800px] bg-white/10 backdrop-blur-3xl border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)] rounded-[40px] overflow-hidden flex flex-col items-center justify-center text-center px-8 py-10 z-10 transform transition-transform duration-700 hover:scale-[1.01]">
            
            {/* Subtle Glass Top Highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>
            
            {/* Headline - Removed <br /> to make it horizontal */}
            <h2 className="text-[36px] md:text-[44px] font-black tracking-tighter leading-[1.05] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 mb-3">
              Stop keyframing. Start creating.
            </h2>
            
            {/* Shortened paragraph */}
            <p className="text-[16px] text-slate-600 font-medium leading-relaxed max-w-[480px] mb-8">
              Drop your first video and get cinematic, multi-layered captions in seconds.
            </p>
            
            {/* Glowing Action Button */}
            <button 
              onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} 
              className="group/btn relative px-8 py-3.5 bg-[#007AFF] text-white rounded-2xl text-[16px] font-bold flex items-center gap-3 hover:bg-[#0066d6] shadow-[0_8px_30px_rgba(0,122,255,0.4)] hover:shadow-[0_12px_40px_rgba(0,122,255,0.6)] transition-all duration-300 hover:-translate-y-1 active:scale-95"
            >
              <CloudUpload size={20} className="transform group-hover/btn:-translate-y-0.5 transition-transform" /> 
              Start your edit now
              <ArrowRight size={18} className="transform group-hover/btn:translate-x-1 transition-transform" />
            </button>

          </div>
        </div>
        

        
        </div>

      {/* Preset selection modal */}
      <PresetUploadModal
        isOpen={uploadModal.isOpen}
        presetName={uploadModal.presetName}
        onCancel={() => setUploadModal({ isOpen: false, presetId: null, presetName: '' })}
        onFileChange={handleModalUpload}
      />

      {/* AI processing modal — shown while transcription runs */}
      <ProcessingModal isVisible={isProcessing} />

      <Footer />
      </div>

    </>
  );
}