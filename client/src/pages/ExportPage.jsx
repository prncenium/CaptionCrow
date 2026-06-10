import React from 'react';
import { Film, UploadCloud, Server, Activity, ShieldCheck, HelpCircle, Settings2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useEditorStore } from '../store/useEditorStore';

import RenderProgress from '../components/Export/RenderProgress';
import Footer from '../components/common/Footer';

export default function ExportPage() {
    const { videoFile, videoUrl } = useEditorStore();
    const navigate = useNavigate();
    
    if (!videoFile) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-80px)] p-6 bg-transparent fade-in">
                <div className="flex flex-col items-center justify-center max-w-md p-10 bg-white/55 backdrop-blur-xl border border-white/75 shadow-[0_8px_32px_rgba(180,100,140,0.10)] rounded-3xl text-center">
                    <div className="p-4 mb-6 rounded-2xl bg-[#007AFF]/10 text-[#007AFF] shadow-inner">
                        <UploadCloud className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Nothing to export</h2>
                    <p className="text-neutral-600 mb-8 font-medium">
                        Upload a video and generate captions in the Editor before exporting.
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        className="px-6 py-2.5 bg-[#007AFF] text-white font-semibold rounded-xl hover:bg-[#0066d6] shadow-[0_4px_14px_rgba(0,122,255,0.35)] transition-all"
                    >
                        Return to Upload Hub
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full px-7 pt-6 pb-6 overflow-y-auto bg-transparent text-slate-900 fade-in relative">
            <div className="max-w-[1280px] w-full mx-auto flex flex-col min-h-full">
                
                {/* Header Section */}
                <div className="flex-shrink-0 mb-8">
                    <div className="text-[10px] text-[#7a4d8a] tracking-[0.18em] font-semibold mb-2.5 uppercase">Render Engine</div>
                    <h1 className="text-[40px] font-bold tracking-tight leading-[1.05]">Final caption pass is ready for delivery.</h1>
                    <p className="text-[14px] text-neutral-700 mt-3 max-w-[580px] leading-relaxed">
                        Review output settings, monitor the render queue, and download a platform-ready MP4 with captions burned in.
                    </p>
                </div>

                {/* THE PRO ENCODER SPLIT LAYOUT (Increased gap to spread out columns) */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 mb-12 items-start">
                    
                    {/* LEFT COLUMN: Text Specs + Massive Phone-Sized Video Player */}
                    {/* 🚨 CHANGED: lg:justify-end to justify-between to push text to the left margin 🚨 */}
                    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between w-full lg:pr-8 gap-10">
                        
                        {/* 🚨 UPDATED: Larger Text Sizes & Wider Container 🚨 */}
                        <div className="flex flex-col max-w-[280px] pt-4 lg:pt-10 text-left hidden lg:flex">
                            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-6">Export Manifest</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[14px] text-neutral-400 uppercase tracking-wider font-bold mb-0.25">Project Name</div>
                                    <div className="text-[15px] text-slate-800 font-bold truncate pr-4">{videoFile?.name || "Sequence_01.mp4"}</div>
                                </div>
                                <div>
                                    <div className="text-[14px] text-neutral-400 uppercase tracking-wider font-bold mb-0.25">Aspect Ratio</div>
                                    <div className="text-[15px] text-slate-800 font-bold">9:16 (Vertical)</div>
                                </div>
                                <div>
                                    <div className="text-[14px] text-neutral-400 uppercase tracking-wider font-bold mb-0.25">Color Space</div>
                                    <div className="text-[15px] text-slate-800 font-bold">Rec. 709</div>
                                </div>
                                <div>
                                    <div className="text-[14px] text-neutral-400 uppercase tracking-wider font-bold mb-0.5">Processing</div>
                                    <div className="text-[15px] text-slate-800 font-bold">Cloud GPU Accelerated</div>
                                </div>
                            </div>
                            
                            <div className="mt-10 p-5 bg-white/40 border border-white/60 rounded-xl shadow-sm">
                                <p className="text-[13px] text-neutral-600 leading-relaxed font-medium">
                                    Your video is queued for high-fidelity encoding. Captions will be permanently burned into the video frames to ensure maximum compatibility across all social platforms.
                                </p>
                            </div>
                        </div>

                        {/* The Video Preview */}
                        <div className="relative w-full max-w-[360px] aspect-[9/16] rounded-[2rem] overflow-hidden border-4 border-white/60 shadow-[0_12px_40px_rgba(180,100,140,0.15)] bg-black/5 flex items-center justify-center flex-shrink-0">
                            {videoUrl ? (
                                <video src={videoUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-neutral-400 font-medium text-sm flex flex-col items-center gap-3">
                                    <Film size={28} className="opacity-50" />
                                    No preview available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Controls & Specs */}
                    <div className="flex flex-col gap-4 w-full">
                        
                        {/* The Action Card (RenderProgress) */}
                        <RenderProgress />

                        {/* Export Configuration Summary Bar */}
                        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl px-5 py-4 shadow-sm flex flex-col gap-3">
                            <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
                                <Settings2 size={16} className="text-neutral-500" />
                                <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">Output Config</span>
                            </div>
                            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500">Format</span>
                                    <span className="font-semibold text-slate-800 bg-white/60 px-2 py-0.5 rounded-md">MP4</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500">Codec</span>
                                    <span className="font-semibold text-slate-800 bg-white/60 px-2 py-0.5 rounded-md">H.264</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500">Audio</span>
                                    <span className="font-semibold text-slate-800 bg-white/60 px-2 py-0.5 rounded-md">AAC</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500">Subtitles</span>
                                    <span className="font-semibold text-[#34C759] bg-[#34C759]/10 px-2 py-0.5 rounded-md border border-[#34C759]/20">Burned In</span>
                                </div>
                            </div>
                        </div>

                        {/* System Status Grid */}
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-3.5 flex flex-col shadow-sm">
                                <div className="flex items-center gap-1.5 text-neutral-500 mb-1.5">
                                    <Server size={13} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Routing Node</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
                                    US-East-1
                                </div>
                            </div>
                            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-3.5 flex flex-col shadow-sm">
                                <div className="flex items-center gap-1.5 text-neutral-500 mb-1.5">
                                    <Activity size={13} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Compute</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse" />
                                    A100 Cluster
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-1.5 text-neutral-500">
                                <ShieldCheck size={13} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Connection</span>
                            </div>
                            <div className="text-[12px] font-bold text-slate-800">256-bit Encrypted</div>
                        </div>
                    </div>
                </div>

                {/* Subtle Support Anchor */}
                <div className="flex-shrink-0 flex justify-center pb-2">
                    <Link to="/feedback" className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 transition-colors">
                        <HelpCircle size={12} strokeWidth={2} />
                        Need help or experiencing render issues? Contact Support
                    </Link>
                </div>

            </div>
        <Footer />
        </div>
    );
}