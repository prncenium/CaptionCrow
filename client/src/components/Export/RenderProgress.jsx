import React, { useState } from 'react';
import { CheckCircle2, Download, Film, Play, Cloud, Cpu, HardDrive, RotateCcw } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { getApiBase } from '../../utils/apiConfig';

export default function RenderProgress() {
    const { videoFile, videoUrl, serverVideoFilename, timelineBlocks, globalLineOffsets, activeStyle, lineStyles } = useEditorStore();
    
    const [renderStatus, setRenderStatus] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [finalUrl, setFinalUrl] = useState(null); 

    const startRender = async () => {
        if (!videoFile || !serverVideoFilename) {
            alert("No video file found! Please upload a video first.");
            return;
        }
        if (!timelineBlocks || timelineBlocks.length === 0) {
            alert("No captions found! Please wait for the transcription to finish before exporting.");
            return;
        }

        const bodyPayload = JSON.stringify({
            filename: serverVideoFilename,
            timelineBlocks,
            globalLineOffsets,
            activeStyle,
            lineStyles,
            previewContainerWidth: 360
        });
        console.log('[Export] Sending to server:', {
            filename: serverVideoFilename,
            timelineBlocksCount: timelineBlocks.length,
            activeStylePresent: !!activeStyle,
            bodySizeKB: (bodyPayload.length / 1024).toFixed(1)
        });

        setRenderStatus('rendering');
        setProgress(10);

        // 🚨 NEW: FAKE PROGRESS SIMULATION 🚨
        // This will slowly increment the progress while we wait for the server
        const fakeProgressInterval = setInterval(() => {
            setProgress((prev) => {
                // Cap the fake progress at 89%. 
                // We save the last 10% for when the server actually finishes.
                if (prev >= 89) return 89; 
                
                // Randomly add 1%, 2%, or 3% to make the progress feel natural and active
                return prev + Math.floor(Math.random() * 3) + 1;
            });
        }, 800); // Updates every 800 milliseconds

        try {
            const response = await fetch(`${getApiBase()}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: bodyPayload
            });

            // 🚨 SERVER RESPONDED! Stop the fake progress immediately 🚨
            clearInterval(fakeProgressInterval);

            if (!response.ok) {
                let serverErrorMessage = "Unknown Server Error";
                try {
                    const errorData = await response.json();
                    serverErrorMessage = errorData.message || serverErrorMessage;
                } catch (e) {
                    serverErrorMessage = `Cannot reach route (Status: ${response.status})`;
                }
                throw new Error(serverErrorMessage);
            }

            setProgress(90); 
            const data = await response.json();
            
            if (!data.success || !data.downloadUrl) {
                throw new Error("Server did not return a valid download link.");
            }

            setFinalUrl(data.downloadUrl);
            
            // Snap to 100% and show completion UI
            setProgress(100);
            setRenderStatus('complete');

            // Trigger actual file download
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.target = '_blank'; 
            link.setAttribute('download', `CaptionForge_Final_${videoFile.name}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            // 🚨 Stop the interval if an error occurs! 🚨
            clearInterval(fakeProgressInterval);
            console.error("Export failed:", error);
            alert(`Render Failed: ${error.message}`);
            setRenderStatus('idle');
            setProgress(0); // Reset the ring
        }
    };

    // Circular Progress Helper
    const r = 32;
    const c = 2 * Math.PI * r;
    const offset = c - (progress / 100) * c;

    return (
        <div className="bg-white/55 backdrop-blur-xl border border-white/75 rounded-3xl p-10 flex flex-col items-center text-center min-h-[380px] justify-center shadow-[0_8px_32px_rgba(180,100,140,0.10)] relative overflow-hidden">
            
            {/* Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-colors duration-700 ${
                renderStatus === 'complete' ? 'bg-[#34C759]/20' : 
                renderStatus === 'rendering' ? 'bg-[#007AFF]/20' : 'bg-transparent'
            }`}></div>

            <div className="relative z-10 flex flex-col items-center w-full">
                
                {/* State: IDLE */}
                {renderStatus === 'idle' && (
                    <div className="fade-in flex flex-col items-center">
                        
                        {/* 🚨 THE NEW VIDEO THUMBNAIL PREVIEW 🚨 */}
                        {videoUrl ? (
                            <div className="w-48 h-32 rounded-2xl overflow-hidden mb-6 border-2 border-white/60 shadow-[0_8px_24px_rgba(0,0,0,0.12)] relative group">
                                <video src={videoUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-[#007AFF]/12 flex items-center justify-center mb-4 border border-[#007AFF]/20">
                                <Film size={32} className="text-[#007AFF]" strokeWidth={1.5} />
                            </div>
                        )}

                        <div className="text-[22px] font-bold tracking-tight text-slate-900">Ready to Render</div>
                        <div className="text-[12.5px] text-neutral-500 mt-1.5 font-medium">
                            {videoFile?.name || "Project_Sequence_01.mp4"}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-4 text-[11px] text-neutral-600 font-medium">
                            <span className="flex items-center gap-1"><Cloud size={11} strokeWidth={1.75} /> Cloud encoder</span>
                            <span className="text-neutral-300">·</span>
                            <span className="flex items-center gap-1"><Cpu size={11} strokeWidth={1.75} /> GPU Accelerated</span>
                            <span className="text-neutral-300">·</span>
                            <span className="flex items-center gap-1"><HardDrive size={11} strokeWidth={1.75} /> SRT Included</span>
                        </div>

                        {/* 🚨 UPGRADED GLOWING PRIMARY BUTTON 🚨 */}
                        <button 
                            onClick={startRender}
                            className="mt-8 px-8 py-3.5 bg-[#007AFF] text-white rounded-2xl text-[14px] font-bold flex items-center gap-2 hover:bg-[#0066d6] shadow-[0_4px_20px_rgba(0,122,255,0.45)] hover:shadow-[0_8px_30px_rgba(0,122,255,0.6)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                        >
                            <Play size={15} fill="white" /> Start Cloud Render
                        </button>
                    </div>
                )}

                {/* State: RENDERING */}
                {renderStatus === 'rendering' && (
                    <div className="fade-in flex flex-col items-center">
                        <div className="relative w-24 h-24 mb-2">
                            <svg className="w-24 h-24 -rotate-90">
                                <circle cx="48" cy="48" r={r} stroke="rgba(0,122,255,0.18)" strokeWidth="6" fill="none" />
                                <circle cx="48" cy="48" r={r} stroke="#007AFF" strokeWidth="6" fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.3s ease-out" }} />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-[20px] font-bold tabular-nums tracking-tight text-slate-900">
                                {progress}<span className="text-[12px] font-semibold text-neutral-500 ml-0.5">%</span>
                            </div>
                        </div>
                        
                        <div className="text-[22px] font-bold tracking-tight mt-4 text-slate-900">Rendering Engine Active</div>
                        <div className="text-[12.5px] text-neutral-500 mt-1.5 font-medium animate-pulse">Burning captions into frames...</div>
                        
                        <div className="mt-5 flex items-center gap-1.5 text-[10.5px] font-semibold text-neutral-600 bg-white/60 border border-white/75 rounded-full px-3 py-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse" />
                            Encoding in progress...
                        </div>
                    </div>
                )}

                {/* State: COMPLETE */}
                {renderStatus === 'complete' && (
                    <div className="fade-in flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-[#34C759]/15 flex items-center justify-center mb-4 border border-[#34C759]/20 shadow-sm">
                            <CheckCircle2 size={36} className="text-[#34C759]" strokeWidth={2} />
                        </div>
                        <div className="text-[22px] font-bold tracking-tight text-slate-900">Render Complete</div>
                        <div className="text-[12.5px] text-neutral-500 mt-1.5 font-medium">
                            {videoFile?.name || "Project_Sequence_01.mp4"} · burned-in + .SRT
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                            {finalUrl && (
                                <a 
                                    href={finalUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-5 py-2.5 bg-[#34C759] text-white rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-[#2db84e] shadow-[0_4px_14px_rgba(52,199,89,0.35)] transition-all active:scale-95"
                                >
                                    <Download size={14} strokeWidth={2.25} /> Download MP4
                                </a>
                            )}
                            <button 
                                onClick={() => {
                                    setRenderStatus('idle');
                                    setFinalUrl(null);
                                }} 
                                className="px-5 py-2.5 bg-white/70 border border-white/85 text-[13px] font-semibold rounded-xl flex items-center gap-2 hover:bg-white/85 text-slate-800 shadow-sm transition-all"
                            >
                                <RotateCcw size={13} strokeWidth={2} /> Start New
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}